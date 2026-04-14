import { useMemo } from 'react';
import { useOutletSlug } from '../../outlets/hooks/useOutletSlug';
import type { Voucher } from '@/features/reward/types/Reward';
import { useQueryRewardSummary } from '@/features/reward/hooks/api/useQueryReward';

interface VoucherGroup {
    latest: Voucher[];
    available: Voucher[];
    unavailable: Voucher[];
}

interface UseRewardVouchersReturn {
    vouchers: VoucherGroup;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}


export const useRewardVouchers = (): UseRewardVouchersReturn => {
    const outletSlug = useOutletSlug();

    const groupVouchers = (voucherList: Voucher[]): VoucherGroup => {
        const now = new Date();

        const grouped: VoucherGroup = {
            latest: [],
            available: [],
            unavailable: [],
        };

        voucherList.forEach((voucher) => {
            // Check if voucher is expired
            const expiryDate = voucher.valid_until ? new Date(voucher.valid_until) : new Date();
            const isExpired = expiryDate < now;
            const isActive = voucher.is_active === 1;

            if (isExpired || !isActive) {
                grouped.unavailable.push(voucher);
            } else {
                // Check if it's newly created (within last 7 days)
                const createdDate = voucher.created_at ? new Date(voucher.created_at) : new Date();
                const daysDiff = Math.floor(
                    (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)
                );

                if (daysDiff <= 7) {
                    grouped.latest.push(voucher);
                } else {
                    grouped.available.push(voucher);
                }
            }
        });

        // Sort each group by created_at (newest first)
        const sortByDate = (a: Voucher, b: Voucher) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
        };

        grouped.latest.sort(sortByDate);
        grouped.available.sort(sortByDate);
        grouped.unavailable.sort(sortByDate);

        return grouped;
    };

    const {
        data: rewardData,
        isLoading,
        error,
        refetch,
    } = useQueryRewardSummary(outletSlug, {
        enabled: !!outletSlug,
        staleTime: 5 * 60 * 1000,
    });

    const vouchers = useMemo<VoucherGroup>(() => {
        const voucherList = rewardData?.data?.vouchers;
        if (!voucherList || !Array.isArray(voucherList)) {
            return {
                latest: [],
                available: [],
                unavailable: [],
            };
        }

        return groupVouchers(voucherList);
    }, [rewardData]);

    return {
        vouchers,
        isLoading,
        error: error ? error.message : null,
        refetch: async () => {
            await refetch();
        },
    };
};
