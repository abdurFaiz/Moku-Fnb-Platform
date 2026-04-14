import { HeaderBar, ScreenWrapper } from "@/components";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { useQueryUserVouchers } from "@/features/vouchers/hooks/api/useQueryVocher";
import type { UserVoucher } from "@/features/vouchers/types/UserVoucher";
import { VoucherListSection } from "@/features/vouchers/components/VoucherListSection";
import { DateFormatterUtils, FormatUtils } from "@/utils/formatters";
import { useOutletStore } from "@/features/outlets/stores/useOutletStore";
import { SkeltonReward } from "@/components/skeletons";
import type { VoucherCardProps } from "@/components/VoucherCard";

export default function MyRewardVoucher() {
    const { navigateToRewardPoin } = useOutletNavigation();
    const { currentOutlet } = useOutletStore();

    // Fetch the list of user's claimed vouchers for this outlet
    const { data, isLoading, error } = useQueryUserVouchers(currentOutlet?.slug, {
        enabled: !!currentOutlet?.slug,
    });

    // Map API response (UserVoucher[]) to VoucherCardProps
    const vouchers: VoucherCardProps[] = data?.data?.user_vouchers?.map((item: UserVoucher) => {
        const rawDate = item.end_date ?? item.start_date ?? '';

        return {
            title: item.name,
            subtitle: item.description ?? '',
            expiryDate: rawDate ? DateFormatterUtils.formatDateOnly(rawDate) : '',
            status: 'claimed' as const,
            voucherId: item.id,
            discoundFixedPrice: item.discount_fixed ?? undefined,
            maxUsage: item.max_usage ?? undefined,
            minPoin: undefined,
            minTransaction: item.min_transaction ? FormatUtils.formatCurrency(item.min_transaction) : undefined,
            discoundPercent: item.discount_percent ?? undefined,
        };
    }) || [];

    if (isLoading) {
        return (
            <ScreenWrapper>
                <HeaderBar title="Reward Voucher Saya" showBack={true} onBack={navigateToRewardPoin} />
                <SkeltonReward />
            </ScreenWrapper>
        );
    }

    if (error) {
        return (
            <ScreenWrapper>
                <HeaderBar title="Reward Voucher Saya" showBack={true} onBack={navigateToRewardPoin} />
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Failed to load vouchers</p>
                </div>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <HeaderBar title="Reward Voucher Saya" showBack={true} onBack={navigateToRewardPoin} />
            <div className="flex flex-col gap-4 my-6">
                {vouchers.length > 0 ? (
                    <VoucherListSection
                        title="Voucher Saya"
                        totalItems={vouchers.length}
                        vouchers={vouchers}
                    />
                ) : (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-gray-500">No vouchers available</p>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    );
}