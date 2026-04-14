import {
    queryOptions,
    useQuery,
    type QueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';

import { RewardAPI } from '@/features/reward/api/reward.api';
import type { RewardResponse } from '@/features/reward/types/Reward';

const ONE_MINUTE = 1000 * 60;
const TEN_MINUTES = 1000 * 60 * 10;
const THIRTY_MINUTES = 1000 * 60 * 30;

export const rewardQueryKeys = {
    root: () => ['rewards'] as const,
    summary: (slug: string) => ['rewards', 'summary', slug] as const,
    history: (slug: string) => ['rewards', 'history', slug] as const,
} as const;

const ensureRewardSuccess = (response: RewardResponse, slug: string, context: 'summary' | 'history') => {
    if (response.status === 'error') {
        throw new Error(
            response.message || `Failed to load reward ${context} for ${slug}`
        );
    }
    return response;
};

const fetchRewardSummary = async (slug: string) => {
    const response = await RewardAPI.getListRewardPoint(slug);
    return ensureRewardSuccess(response, slug, 'summary');
};

const fetchRewardHistory = async (slug: string) => {
    const response = await RewardAPI.getHistoryRewardPoint(slug);
    return ensureRewardSuccess(response, slug, 'history');
};

const summaryQueryConfig = {
    staleTime: ONE_MINUTE,
    gcTime: THIRTY_MINUTES,
    refetchOnWindowFocus: false,
} as const;

const historyQueryConfig = {
    staleTime: TEN_MINUTES,
    gcTime: THIRTY_MINUTES,
    refetchOnWindowFocus: false,
} as const;

export const rewardSummaryQueryOptions = (slug: string) =>
    queryOptions<
        RewardResponse,
        Error,
        RewardResponse,
        ReturnType<typeof rewardQueryKeys.summary>
    >({
        queryKey: rewardQueryKeys.summary(slug),
        queryFn: () => fetchRewardSummary(slug),
        ...summaryQueryConfig,
    });

export const rewardHistoryQueryOptions = (slug: string) =>
    queryOptions<
        RewardResponse,
        Error,
        RewardResponse,
        ReturnType<typeof rewardQueryKeys.history>
    >({
        queryKey: rewardQueryKeys.history(slug),
        queryFn: () => fetchRewardHistory(slug),
        ...historyQueryConfig,
    });

type RewardSummaryQueryKey = ReturnType<typeof rewardQueryKeys.summary>;
type RewardHistoryQueryKey = ReturnType<typeof rewardQueryKeys.history>;

type RewardSummaryQueryOptions = Omit<
    UseQueryOptions<RewardResponse, Error, RewardResponse, RewardSummaryQueryKey>,
    'queryKey' | 'queryFn'
>;

type RewardHistoryQueryOptions = Omit<
    UseQueryOptions<RewardResponse, Error, RewardResponse, RewardHistoryQueryKey>,
    'queryKey' | 'queryFn'
>;

export const useQueryRewardSummary = (
    slug?: string | null,
    options?: RewardSummaryQueryOptions
) => {
    if (!slug) {
        return useQuery<RewardResponse, Error, RewardResponse, RewardSummaryQueryKey>({
            queryKey: rewardQueryKeys.summary(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<RewardResponse, Error, RewardResponse, RewardSummaryQueryKey>({
        ...rewardSummaryQueryOptions(slug),
        ...options,
    });
};

export const useQueryRewardHistory = (
    slug?: string | null,
    options?: RewardHistoryQueryOptions
) => {
    if (!slug) {
        return useQuery<RewardResponse, Error, RewardResponse, RewardHistoryQueryKey>({
            queryKey: rewardQueryKeys.history(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...options,
        });
    }

    return useQuery<RewardResponse, Error, RewardResponse, RewardHistoryQueryKey>({
        ...rewardHistoryQueryOptions(slug),
        ...options,
    });
};

export const prefetchRewardSummary = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(rewardSummaryQueryOptions(slug));

export const prefetchRewardHistory = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(rewardHistoryQueryOptions(slug));
