import { useQueryClient } from '@tanstack/react-query';
import {
    HOME_DATA_DEFAULTS,
    HOME_ERRORS,
} from '@/features/storefront/constant/homeConstant';
import { getErrorMessage } from '@/features/storefront/utils/errorHandler';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import { useCallback, useMemo } from 'react';
import { useQueryRewardSummary, rewardQueryKeys } from '@/features/reward/hooks/api/useQueryReward';

export interface RewardPointsData {
    vouchersCount: number;
    pointsBalance: number;
}

/**
 * @param outletSlug - Outlet slug (required untuk fetch)
 * @param isEnabled - Enable/disable query (default: true)
 * @returns Reward points data, loading state, and error
 */
export interface UseRewardPointsReturn {
    data: RewardPointsData | null;
    isLoading: boolean;
    isPending: boolean;
    isError: boolean;
    error: string | null;
    isFetching: boolean;
    refetch: () => Promise<void>;
    invalidateRewards: () => Promise<void>;
}

export const useRewardPoints = (
    outletSlug: string | null | undefined,
    isEnabled: boolean = true
): UseRewardPointsReturn => {
    const queryClient = useQueryClient();

    // Check if user is a guest (guest tokens start with 'guest_')
    const accessToken = useAuthStore((state) => state.access_token);
    const isGuestUser = useMemo(() => accessToken?.startsWith('guest_') ?? false, [accessToken]);

    const {
        data: queryData,
        isLoading,
        isPending,
        isError,
        error: queryError,
        isFetching,
        refetch,
    } = useQueryRewardSummary(outletSlug, {
        enabled: !!outletSlug && isEnabled && !isGuestUser,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        retry: (failureCount, error) => {
            const status = (error as any)?.response?.status;
            if (status === 401 || status === 403) return false;
            return failureCount < 2;
        },
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
    });

    // Memoized data transformation (guest or authenticated user)
    const data: RewardPointsData | null = useMemo(() => {
        // For guest users, return default values
        if (isGuestUser) {
            return {
                vouchersCount: HOME_DATA_DEFAULTS.VOUCHERS_COUNT,
                pointsBalance: HOME_DATA_DEFAULTS.POINTS_BALANCE,
            };
        }

        if (!queryData?.data) {
            return null;
        }

        return {
            vouchersCount: queryData.data.vouchers?.length ?? HOME_DATA_DEFAULTS.VOUCHERS_COUNT,
            pointsBalance: queryData.data.point_balance ?? HOME_DATA_DEFAULTS.POINTS_BALANCE,
        };
    }, [isGuestUser, queryData?.data]);

    // Memoized error message
    const error = useMemo(
        () => queryError ? getErrorMessage(queryError, HOME_ERRORS.FETCH_REWARDS_FAILED) : null,
        [queryError]
    );

    // Optimized refetch
    const handleRefetch = useCallback(async () => {
        await refetch();
    }, [refetch]);

    // Manual invalidation
    const invalidateRewards = useCallback(async () => {
        if (outletSlug) {
            await queryClient.invalidateQueries({
                queryKey: rewardQueryKeys.summary(outletSlug)
            });
        }
    }, [queryClient, outletSlug]);

    return {
        data,
        isLoading,
        isPending,
        isError,
        error,
        isFetching,
        refetch: handleRefetch,
        invalidateRewards,
    };
};

export default useRewardPoints;
