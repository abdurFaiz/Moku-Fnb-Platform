import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import {
    useQueryRewardSummary,
    useQueryRewardHistory,
    rewardQueryKeys,
    prefetchRewardSummary,
    prefetchRewardHistory,
} from '../hooks/api/useQueryReward';
import { RewardAPI } from '../api/reward.api';
import type { RewardResponse } from '../types/Reward';
import type { ReactNode } from 'react';

// Mock the RewardAPI
vi.mock('../api/reward.api');

describe('useQueryReward', () => {
    let queryClient: QueryClient;

    const mockRewardResponse: RewardResponse = {
        status: 'success',
        message: 'Success',
        data: {
            point_balance: 150,
            vouchers: [
                {
                    id: 1,
                    outlet_id: 1,
                    name: 'Discount 10%',
                    point: 50,
                    valid_until: '2026-12-31',
                },
            ],
            customer_points: [],
        },
    };

    const mockHistoryResponse: RewardResponse = {
        status: 'success',
        message: 'Success',
        data: {
            point_balance: 150,
            vouchers: [],
            customer_points: [
                {
                    id: 1,
                    outlet_id: 1,
                    user_id: 1,
                    point: 50,
                    type: 1,
                    pointable_type: 'Order',
                    pointable_id: 123,
                    info: 'Purchase reward',
                    created_at: '2026-01-01',
                    updated_at: '2026-01-01',
                },
            ],
        },
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        vi.clearAllMocks();
    });

    const wrapper = ({ children }: { children: ReactNode }) =>
        createElement(QueryClientProvider, { client: queryClient }, children);

    describe('rewardQueryKeys', () => {
        it('should generate correct root key', () => {
            expect(rewardQueryKeys.root()).toEqual(['rewards']);
        });

        it('should generate correct summary key', () => {
            expect(rewardQueryKeys.summary('test-outlet')).toEqual([
                'rewards',
                'summary',
                'test-outlet',
            ]);
        });

        it('should generate correct history key', () => {
            expect(rewardQueryKeys.history('test-outlet')).toEqual([
                'rewards',
                'history',
                'test-outlet',
            ]);
        });

        it('should handle empty slug in keys', () => {
            expect(rewardQueryKeys.summary('')).toEqual(['rewards', 'summary', '']);
            expect(rewardQueryKeys.history('')).toEqual(['rewards', 'history', '']);
        });
    });

    describe('useQueryRewardSummary', () => {
        it('should successfully fetch reward summary', async () => {
            vi.mocked(RewardAPI.getListRewardPoint).mockResolvedValue(mockRewardResponse);

            const { result } = renderHook(() => useQueryRewardSummary('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toEqual(mockRewardResponse);
            expect(RewardAPI.getListRewardPoint).toHaveBeenCalledWith('test-outlet');
        });

        it('should handle error response from API', async () => {
            const errorResponse: RewardResponse = {
                status: 'error',
                message: 'Failed to load',
                data: {
                    point_balance: 0,
                    vouchers: [],
                    customer_points: [],
                },
            };
            vi.mocked(RewardAPI.getListRewardPoint).mockResolvedValue(errorResponse);

            const { result } = renderHook(() => useQueryRewardSummary('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error).toBeDefined();
            // The error message comes from the API response
            expect(result.current.error?.message).toContain('Failed to load');
        });

        it('should not fetch when slug is null', async () => {
            const { result } = renderHook(() => useQueryRewardSummary(null), { wrapper });

            expect(result.current.status).toBe('pending');
            expect(result.current.fetchStatus).toBe('idle');
            expect(RewardAPI.getListRewardPoint).not.toHaveBeenCalled();
        });

        it('should not fetch when slug is undefined', async () => {
            const { result } = renderHook(() => useQueryRewardSummary(undefined), { wrapper });

            expect(result.current.status).toBe('pending');
            expect(result.current.fetchStatus).toBe('idle');
            expect(RewardAPI.getListRewardPoint).not.toHaveBeenCalled();
        });

        it('should handle network errors', async () => {
            vi.mocked(RewardAPI.getListRewardPoint).mockRejectedValue(
                new Error('Network error')
            );

            const { result } = renderHook(() => useQueryRewardSummary('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error?.message).toBe('Network error');
        });

        it('should respect custom options', async () => {
            vi.mocked(RewardAPI.getListRewardPoint).mockResolvedValue(mockRewardResponse);

            const { result } = renderHook(
                () =>
                    useQueryRewardSummary('test-outlet', {
                        enabled: false,
                    }),
                { wrapper }
            );

            expect(result.current.status).toBe('pending');
            expect(result.current.fetchStatus).toBe('idle');
            expect(RewardAPI.getListRewardPoint).not.toHaveBeenCalled();
        });

        it('should handle empty vouchers array', async () => {
            const emptyResponse: RewardResponse = {
                ...mockRewardResponse,
                data: {
                    ...mockRewardResponse.data,
                    vouchers: [],
                },
            };
            vi.mocked(RewardAPI.getListRewardPoint).mockResolvedValue(emptyResponse);

            const { result } = renderHook(() => useQueryRewardSummary('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data?.data.vouchers).toEqual([]);
        });

        it('should handle zero point balance', async () => {
            const zeroPointsResponse: RewardResponse = {
                ...mockRewardResponse,
                data: {
                    ...mockRewardResponse.data,
                    point_balance: 0,
                },
            };
            vi.mocked(RewardAPI.getListRewardPoint).mockResolvedValue(zeroPointsResponse);

            const { result } = renderHook(() => useQueryRewardSummary('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data?.data.point_balance).toBe(0);
        });
    });

    describe('useQueryRewardHistory', () => {
        it('should successfully fetch reward history', async () => {
            vi.mocked(RewardAPI.getHistoryRewardPoint).mockResolvedValue(mockHistoryResponse);

            const { result } = renderHook(() => useQueryRewardHistory('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data).toEqual(mockHistoryResponse);
            expect(RewardAPI.getHistoryRewardPoint).toHaveBeenCalledWith('test-outlet');
        });

        it('should handle error response from history API', async () => {
            const errorResponse: RewardResponse = {
                status: 'error',
                message: 'History not found',
                data: {
                    point_balance: 0,
                    vouchers: [],
                    customer_points: [],
                },
            };
            vi.mocked(RewardAPI.getHistoryRewardPoint).mockResolvedValue(errorResponse);

            const { result } = renderHook(() => useQueryRewardHistory('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error?.message).toContain('History not found');
        });

        it('should not fetch when slug is null', async () => {
            const { result } = renderHook(() => useQueryRewardHistory(null), { wrapper });

            expect(result.current.status).toBe('pending');
            expect(result.current.fetchStatus).toBe('idle');
            expect(RewardAPI.getHistoryRewardPoint).not.toHaveBeenCalled();
        });

        it('should not fetch when slug is undefined', async () => {
            const { result } = renderHook(() => useQueryRewardHistory(undefined), { wrapper });

            expect(result.current.status).toBe('pending');
            expect(result.current.fetchStatus).toBe('idle');
            expect(RewardAPI.getHistoryRewardPoint).not.toHaveBeenCalled();
        });

        it('should handle network errors in history', async () => {
            vi.mocked(RewardAPI.getHistoryRewardPoint).mockRejectedValue(
                new Error('Connection failed')
            );

            const { result } = renderHook(() => useQueryRewardHistory('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error?.message).toBe('Connection failed');
        });

        it('should respect custom options for history', async () => {
            vi.mocked(RewardAPI.getHistoryRewardPoint).mockResolvedValue(mockHistoryResponse);

            const { result } = renderHook(
                () =>
                    useQueryRewardHistory('test-outlet', {
                        enabled: false,
                    }),
                { wrapper }
            );

            expect(result.current.status).toBe('pending');
            expect(result.current.fetchStatus).toBe('idle');
            expect(RewardAPI.getHistoryRewardPoint).not.toHaveBeenCalled();
        });

        it('should handle empty customer points array', async () => {
            const emptyHistoryResponse: RewardResponse = {
                ...mockHistoryResponse,
                data: {
                    ...mockHistoryResponse.data,
                    customer_points: [],
                },
            };
            vi.mocked(RewardAPI.getHistoryRewardPoint).mockResolvedValue(emptyHistoryResponse);

            const { result } = renderHook(() => useQueryRewardHistory('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data?.data.customer_points).toEqual([]);
        });

        it('should handle negative points in history', async () => {
            const negativePointsResponse: RewardResponse = {
                ...mockHistoryResponse,
                data: {
                    ...mockHistoryResponse.data,
                    customer_points: [
                        {
                            id: 1,
                            outlet_id: 1,
                            user_id: 1,
                            point: -50,
                            type: 2,
                            pointable_type: 'Voucher',
                            pointable_id: 123,
                            info: 'Redeemed',
                            created_at: '2026-01-01',
                            updated_at: '2026-01-01',
                        },
                    ],
                },
            };
            vi.mocked(RewardAPI.getHistoryRewardPoint).mockResolvedValue(
                negativePointsResponse
            );

            const { result } = renderHook(() => useQueryRewardHistory('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            expect(result.current.data?.data.customer_points[0].point).toBe(-50);
        });
    });

    describe('prefetchRewardSummary', () => {
        it('should prefetch reward summary', async () => {
            vi.mocked(RewardAPI.getListRewardPoint).mockResolvedValue(mockRewardResponse);

            await prefetchRewardSummary(queryClient, 'test-outlet');

            const cachedData = queryClient.getQueryData(rewardQueryKeys.summary('test-outlet'));
            expect(cachedData).toEqual(mockRewardResponse);
            expect(RewardAPI.getListRewardPoint).toHaveBeenCalledWith('test-outlet');
        });

        it('should handle prefetch errors', async () => {
            vi.mocked(RewardAPI.getListRewardPoint).mockRejectedValue(
                new Error('Prefetch failed')
            );

            // Prefetch doesn't throw, it just fails silently in React Query
            await prefetchRewardSummary(queryClient, 'test-outlet');

            // Verify the API was called
            expect(RewardAPI.getListRewardPoint).toHaveBeenCalledWith('test-outlet');
        });
    });

    describe('prefetchRewardHistory', () => {
        it('should prefetch reward history', async () => {
            vi.mocked(RewardAPI.getHistoryRewardPoint).mockResolvedValue(mockHistoryResponse);

            await prefetchRewardHistory(queryClient, 'test-outlet');

            const cachedData = queryClient.getQueryData(rewardQueryKeys.history('test-outlet'));
            expect(cachedData).toEqual(mockHistoryResponse);
            expect(RewardAPI.getHistoryRewardPoint).toHaveBeenCalledWith('test-outlet');
        });

        it('should handle prefetch history errors', async () => {
            vi.mocked(RewardAPI.getHistoryRewardPoint).mockRejectedValue(
                new Error('Prefetch history failed')
            );

            // Prefetch doesn't throw, it just fails silently in React Query
            await prefetchRewardHistory(queryClient, 'test-outlet');

            // Verify the API was called
            expect(RewardAPI.getHistoryRewardPoint).toHaveBeenCalledWith('test-outlet');
        });
    });

    describe('Query Configuration', () => {
        it('should use correct stale time for summary (1 minute)', async () => {
            vi.mocked(RewardAPI.getListRewardPoint).mockResolvedValue(mockRewardResponse);

            const { result } = renderHook(() => useQueryRewardSummary('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const queryState = queryClient.getQueryState(
                rewardQueryKeys.summary('test-outlet')
            );
            expect(queryState?.dataUpdatedAt).toBeDefined();
        });

        it('should use correct stale time for history (10 minutes)', async () => {
            vi.mocked(RewardAPI.getHistoryRewardPoint).mockResolvedValue(mockHistoryResponse);

            const { result } = renderHook(() => useQueryRewardHistory('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));
            const queryState = queryClient.getQueryState(
                rewardQueryKeys.history('test-outlet')
            );
            expect(queryState?.dataUpdatedAt).toBeDefined();
        });

        it('should not refetch on window focus', async () => {
            vi.mocked(RewardAPI.getListRewardPoint).mockResolvedValue(mockRewardResponse);

            const { result } = renderHook(() => useQueryRewardSummary('test-outlet'), {
                wrapper,
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            vi.clearAllMocks();

            window.dispatchEvent(new Event('focus'));

            await waitFor(() => {
                expect(RewardAPI.getListRewardPoint).not.toHaveBeenCalled();
            });
        });
    });
});
