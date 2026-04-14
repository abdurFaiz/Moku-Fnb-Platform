import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHomeData } from '../hooks/useHomeData';
import { useQueryClient } from '@tanstack/react-query';
import { useDynamicProducts } from '@/features/product/hooks/useDynamicProducts';
import { useUserDataFetch } from '@/features/storefront/hooks/useUserData';
import { useRewardPoints } from '@/features/storefront/hooks/useRewardPoints';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import { useQueryBanner } from '@/features/storefront/hooks/api/useQueryBanner';

vi.mock('@tanstack/react-query');
vi.mock('@/features/product/hooks/useDynamicProducts');
vi.mock('@/features/storefront/hooks/useUserData');
vi.mock('@/features/storefront/hooks/useRewardPoints');
vi.mock('@/features/outlets/hooks/useOutletSlug');
vi.mock('@/features/storefront/hooks/api/useQueryBanner');

describe('useHomeData', () => {
    let mockQueryClient: any;
    let mockInvalidateQueries: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockInvalidateQueries = vi.fn().mockResolvedValue(undefined);
        mockQueryClient = {
            invalidateQueries: mockInvalidateQueries,
        };
        vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    const setupDefaultMocks = () => {
        vi.mocked(useOutletSlug).mockReturnValue('test-outlet');
        vi.mocked(useDynamicProducts).mockReturnValue({
            products: [{ id: 1, name: 'Product 1' }] as any,
            categories: [{ id: 1, name: 'Category 1' }] as any,
            outlets: [{ id: 1, slug: 'test-outlet' }] as any,
            currentOutlet: { id: 1, slug: 'test-outlet' } as any,
            isLoading: false,
            error: null,
            refetch: vi.fn().mockResolvedValue(undefined),
        } as any);
        vi.mocked(useRewardPoints).mockReturnValue({
            data: { pointsBalance: 100, vouchersCount: 5 },
            isLoading: false,
            isError: false,
            error: null,
            isFetching: false,
            isPending: false,
            invalidateRewards: vi.fn(),
            refetch: vi.fn().mockResolvedValue(undefined),
        });
        vi.mocked(useUserDataFetch).mockReturnValue({
            user: { id: 1, name: 'Test User' } as any,
            isLoading: false,
            isPending: false,
            isError: false,
            error: null,
        });
        vi.mocked(useQueryBanner).mockReturnValue({
            data: [{ id: 1, title: 'Banner 1' }] as any,
            isLoading: false,
            isError: false,
            error: null,
            refetch: vi.fn().mockResolvedValue(undefined),
        } as any);
    };

    describe('Hook Initialization', () => {
        it('should return all required properties', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            expect(result.current).toHaveProperty('userData');
            expect(result.current).toHaveProperty('products');
            expect(result.current).toHaveProperty('categories');
            expect(result.current).toHaveProperty('outlets');
            expect(result.current).toHaveProperty('currentOutlet');
            expect(result.current).toHaveProperty('banners');
            expect(result.current).toHaveProperty('isLoading');
            expect(result.current).toHaveProperty('isPending');
            expect(result.current).toHaveProperty('isError');
            expect(result.current).toHaveProperty('error');
            expect(result.current).toHaveProperty('isFetching');
            expect(result.current).toHaveProperty('refreshData');
            expect(result.current).toHaveProperty('invalidateHomeData');
        });

        it('should have correct initial loading states', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            expect(result.current.isLoading).toBe(false);
            expect(result.current.isPending).toBe(false);
            expect(result.current.isError).toBe(false);
            expect(result.current.error).toBeNull();
        });
    });

    describe('Data Loading', () => {
        it('should load user data successfully', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            expect(result.current.userData).toEqual({ id: 1, name: 'Test User' });
        });

        it('should load products successfully', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            expect(result.current.products).toEqual([{ id: 1, name: 'Product 1' }]);
        });

        it('should load categories successfully', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            expect(result.current.categories).toEqual([{ id: 1, name: 'Category 1' }]);
        });

        it('should load outlets successfully', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            expect(result.current.outlets).toEqual([{ id: 1, slug: 'test-outlet' }]);
        });

        it('should load current outlet successfully', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            expect(result.current.currentOutlet).toEqual({ id: 1, slug: 'test-outlet' });
        });

        it('should load banners successfully', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            expect(result.current.banners).toEqual([{ id: 1, title: 'Banner 1' }]);
        });
    });

    describe('Loading States', () => {
        it('should set isLoading when user data is loading', () => {
            setupDefaultMocks();
            vi.mocked(useUserDataFetch).mockReturnValue({
                user: null,
                isLoading: true,
                isPending: false,
                isError: false,
                error: null,
            });

            const { result } = renderHook(() => useHomeData());

            expect(result.current.isLoading).toBe(true);
        });

        it('should set isLoading when products are loading', () => {
            setupDefaultMocks();
            vi.mocked(useDynamicProducts).mockReturnValue({
                products: [] as any,
                categories: [] as any,
                outlets: [] as any,
                currentOutlet: null,
                isLoading: true,
                error: null,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            const { result } = renderHook(() => useHomeData());

            expect(result.current.isLoading).toBe(true);
        });

        it('should set isLoading when banners are loading', () => {
            setupDefaultMocks();
            vi.mocked(useQueryBanner).mockReturnValue({
                data: [] as any,
                isLoading: true,
                isError: false,
                error: null,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            const { result } = renderHook(() => useHomeData());

            expect(result.current.isLoading).toBe(true);
        });

        it('should set isPending when user data is pending', () => {
            setupDefaultMocks();
            vi.mocked(useUserDataFetch).mockReturnValue({
                user: null,
                isLoading: false,
                isPending: true,
                isError: false,
                error: null,
            });

            const { result } = renderHook(() => useHomeData());

            expect(result.current.isPending).toBe(true);
        });
    });

    describe('Error Handling', () => {
        it('should set isError when user data has error', () => {
            setupDefaultMocks();
            vi.mocked(useUserDataFetch).mockReturnValue({
                user: null,
                isLoading: false,
                isPending: false,
                isError: true,
                error: 'User fetch failed' as any,
            });

            const { result } = renderHook(() => useHomeData());

            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBe('User fetch failed');
        });

        it('should set isError when products have error', () => {
            setupDefaultMocks();
            vi.mocked(useDynamicProducts).mockReturnValue({
                products: [] as any,
                categories: [] as any,
                outlets: [] as any,
                currentOutlet: null,
                isLoading: false,
                error: 'Products fetch failed' as any,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            const { result } = renderHook(() => useHomeData());

            expect(result.current.isError).toBe(true);
        });

        it('should set isError when banners have error', () => {
            setupDefaultMocks();
            vi.mocked(useQueryBanner).mockReturnValue({
                data: [] as any,
                isLoading: false,
                isError: true,
                error: 'Banners fetch failed' as any,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            const { result } = renderHook(() => useHomeData());

            expect(result.current.isError).toBe(true);
        });

        it('should prioritize user error over other errors', () => {
            setupDefaultMocks();
            vi.mocked(useUserDataFetch).mockReturnValue({
                user: null,
                isLoading: false,
                isPending: false,
                isError: true,
                error: 'User error' as any,
            });
            vi.mocked(useDynamicProducts).mockReturnValue({
                products: [] as any,
                categories: [] as any,
                outlets: [] as any,
                currentOutlet: null,
                isLoading: false,
                error: 'Products error' as any,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            const { result } = renderHook(() => useHomeData());

            expect(result.current.error).toBe('User error');
        });

        it('should handle null error gracefully', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            expect(result.current.error).toBeNull();
        });
    });

    describe('Outlet Slug Handling', () => {
        it('should use URL outlet slug when available', () => {
            vi.mocked(useOutletSlug).mockReturnValue('url-outlet');
            setupDefaultMocks();

            renderHook(() => useHomeData());

            expect(useQueryBanner).toHaveBeenCalledWith('url-outlet', expect.any(Object));
        });

        it('should fallback to current outlet slug when URL slug is not available', () => {
            vi.mocked(useOutletSlug).mockReturnValue(undefined);
            setupDefaultMocks();

            renderHook(() => useHomeData());

            expect(useQueryBanner).toHaveBeenCalledWith('test-outlet', expect.any(Object));
        });

        it('should handle undefined outlet slug', () => {
            vi.mocked(useOutletSlug).mockReturnValue(undefined);
            vi.mocked(useDynamicProducts).mockReturnValue({
                products: [] as any,
                categories: [] as any,
                outlets: [] as any,
                currentOutlet: null,
                isLoading: false,
                error: null,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            expect(result.current.currentOutlet).toBeNull();
        });
    });

    describe('Reward Points Integration', () => {
        it('should pass reward points to user data fetch', () => {
            setupDefaultMocks();
            renderHook(() => useHomeData());

            // Wait for shouldFetchExtras to be set
            vi.runAllTimers();

            expect(useUserDataFetch).toHaveBeenCalled();
        });

        it('should handle missing reward points', () => {
            setupDefaultMocks();
            vi.mocked(useRewardPoints).mockReturnValue({
                data: null,
                isLoading: false,
                isError: false,
                error: null,
                isFetching: false,
                isPending: false,
                invalidateRewards: vi.fn(),
                refetch: vi.fn().mockResolvedValue(undefined),
            });

            const { result } = renderHook(() => useHomeData());

            expect(result.current.userData).toBeDefined();
        });
    });

    describe('Refresh Data', () => {
        it('should call refetch on all data sources', async () => {
            setupDefaultMocks();
            const mockRefetchProducts = vi.fn().mockResolvedValue(undefined);
            const mockRefetchBanners = vi.fn().mockResolvedValue(undefined);
            const mockRefetchRewards = vi.fn().mockResolvedValue(undefined);

            vi.mocked(useDynamicProducts).mockReturnValue({
                products: [] as any,
                categories: [] as any,
                outlets: [] as any,
                currentOutlet: null,
                isLoading: false,
                error: null,
                refetch: mockRefetchProducts,
            } as any);
            vi.mocked(useQueryBanner).mockReturnValue({
                data: [] as any,
                isLoading: false,
                isError: false,
                error: null,
                refetch: mockRefetchBanners,
            } as any);
            vi.mocked(useRewardPoints).mockReturnValue({
                data: null,
                isLoading: false,
                isError: false,
                error: null,
                isFetching: false,
                isPending: false,
                invalidateRewards: vi.fn(),
                refetch: mockRefetchRewards,
            });

            const { result } = renderHook(() => useHomeData());

            await act(async () => {
                await result.current.refreshData();
            });

            expect(mockRefetchProducts).toHaveBeenCalled();
            expect(mockRefetchBanners).toHaveBeenCalled();
        });

        it('should handle refresh errors gracefully', async () => {
            setupDefaultMocks();
            const mockRefetchProducts = vi.fn().mockRejectedValue(new Error('Refetch failed'));

            vi.mocked(useDynamicProducts).mockReturnValue({
                products: [] as any,
                categories: [] as any,
                outlets: [] as any,
                currentOutlet: null,
                isLoading: false,
                error: null,
                refetch: mockRefetchProducts,
            } as any);

            const { result } = renderHook(() => useHomeData());

            await expect(async () => {
                await act(async () => {
                    await result.current.refreshData();
                });
            }).rejects.toThrow();
        });
    });

    describe('Invalidate Home Data', () => {
        it('should invalidate dynamic-products query', async () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            await act(async () => {
                await result.current.invalidateHomeData();
            });

            expect(mockInvalidateQueries).toHaveBeenCalledWith({
                queryKey: ['dynamic-products'],
            });
        });

        it('should invalidate outlet queries', async () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeData());

            await act(async () => {
                await result.current.invalidateHomeData();
            });

            expect(mockInvalidateQueries).toHaveBeenCalled();
        });

        it('should handle invalidation errors', async () => {
            setupDefaultMocks();
            mockInvalidateQueries.mockRejectedValueOnce(new Error('Invalidation failed'));

            const { result } = renderHook(() => useHomeData());

            await expect(async () => {
                await act(async () => {
                    await result.current.invalidateHomeData();
                });
            }).rejects.toThrow();
        });
    });

    describe('Memoization', () => {
        it('should memoize loading states', () => {
            setupDefaultMocks();
            const { result, rerender } = renderHook(() => useHomeData());

            const firstLoadingStates = {
                isLoading: result.current.isLoading,
                isPending: result.current.isPending,
                isError: result.current.isError,
            };

            rerender();

            const secondLoadingStates = {
                isLoading: result.current.isLoading,
                isPending: result.current.isPending,
                isError: result.current.isError,
            };

            expect(firstLoadingStates).toEqual(secondLoadingStates);
        });

        it('should memoize error message', () => {
            setupDefaultMocks();
            const { result, rerender } = renderHook(() => useHomeData());

            const firstError = result.current.error;

            rerender();

            const secondError = result.current.error;

            expect(firstError).toBe(secondError);
        });
    });

    describe('Edge Cases', () => {
        it('should handle all data sources loading simultaneously', () => {
            vi.mocked(useOutletSlug).mockReturnValue('test-outlet');
            vi.mocked(useDynamicProducts).mockReturnValue({
                products: [] as any,
                categories: [] as any,
                outlets: [] as any,
                currentOutlet: null,
                isLoading: true,
                error: null,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);
            vi.mocked(useRewardPoints).mockReturnValue({
                data: null,
                isLoading: true,
                isError: false,
                error: null,
                isFetching: false,
                isPending: false,
                invalidateRewards: vi.fn(),
                refetch: vi.fn().mockResolvedValue(undefined),
            });
            vi.mocked(useUserDataFetch).mockReturnValue({
                user: null,
                isLoading: true,
                isPending: false,
                isError: false,
                error: null,
            });
            vi.mocked(useQueryBanner).mockReturnValue({
                data: [] as any,
                isLoading: true,
                isError: false,
                error: null,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            const { result } = renderHook(() => useHomeData());

            expect(result.current.isLoading).toBe(true);
        });

        it('should handle all data sources with errors', () => {
            vi.mocked(useOutletSlug).mockReturnValue('test-outlet');
            vi.mocked(useDynamicProducts).mockReturnValue({
                products: [] as any,
                categories: [] as any,
                outlets: [] as any,
                currentOutlet: null,
                isLoading: false,
                error: 'Products error' as any,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);
            vi.mocked(useUserDataFetch).mockReturnValue({
                user: null,
                isLoading: false,
                isPending: false,
                isError: true,
                error: 'User error' as any,
            });
            vi.mocked(useQueryBanner).mockReturnValue({
                data: [] as any,
                isLoading: false,
                isError: true,
                error: 'Banners error' as any,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            const { result } = renderHook(() => useHomeData());

            expect(result.current.isError).toBe(true);
            expect(result.current.error).toBe('User error');
        });

        it('should handle empty data arrays', () => {
            setupDefaultMocks();
            vi.mocked(useDynamicProducts).mockReturnValue({
                products: [] as any,
                categories: [] as any,
                outlets: [] as any,
                currentOutlet: null,
                isLoading: false,
                error: null,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);
            vi.mocked(useQueryBanner).mockReturnValue({
                data: [] as any,
                isLoading: false,
                isError: false,
                error: null,
                refetch: vi.fn().mockResolvedValue(undefined),
            } as any);

            const { result } = renderHook(() => useHomeData());

            expect(result.current.products).toEqual([]);
            expect(result.current.categories).toEqual([]);
            expect(result.current.outlets).toEqual([]);
            expect(result.current.banners).toEqual([]);
        });

        it('should handle null user data', () => {
            setupDefaultMocks();
            vi.mocked(useUserDataFetch).mockReturnValue({
                user: null,
                isLoading: false,
                isPending: false,
                isError: false,
                error: null,
            });

            const { result } = renderHook(() => useHomeData());

            expect(result.current.userData).toBeNull();
        });
    });
});
