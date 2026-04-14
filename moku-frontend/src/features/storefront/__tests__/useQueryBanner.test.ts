import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import {
    useQueryBanner,
    bannerQueryKeys,
    bannerQueryOptions,
    prefetchBanner,
} from '../hooks/api/useQueryBanner';
import { BannerAPI } from '../api/banner.api';
import type { BannerResponse, Banner } from '../types/Banner';

vi.mock('../api/banner.api');

const mockBanners: Banner[] = [
    {
        id: 1,
        link: '/products/summer-sale',
        outlet_id: 1,
        banner_url: 'https://example.com/banner1.jpg',
        media: [],
    },
    {
        id: 2,
        link: '/products/new',
        outlet_id: 1,
        banner_url: 'https://example.com/banner2.jpg',
        media: [],
    },
];

const mockBannerResponse: BannerResponse = {
    status: 'success',
    message: 'Banners retrieved successfully',
    data: {
        banners: mockBanners,
    },
};

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    const Wrapper = ({ children }: { children: ReactNode }) => {
        return createElement(QueryClientProvider, { client: queryClient }, children);
    };

    return { Wrapper, queryClient };
};

describe('bannerQueryKeys', () => {
    it('should generate root key', () => {
        expect(bannerQueryKeys.root()).toEqual(['banners']);
    });

    it('should generate list key with slug', () => {
        expect(bannerQueryKeys.list('test-outlet')).toEqual(['banners', 'test-outlet']);
    });

    it('should generate different keys for different slugs', () => {
        const key1 = bannerQueryKeys.list('outlet-1');
        const key2 = bannerQueryKeys.list('outlet-2');

        expect(key1).not.toEqual(key2);
        expect(key1).toEqual(['banners', 'outlet-1']);
        expect(key2).toEqual(['banners', 'outlet-2']);
    });

    it('should handle empty slug', () => {
        expect(bannerQueryKeys.list('')).toEqual(['banners', '']);
    });

    it('should handle special characters in slug', () => {
        expect(bannerQueryKeys.list('café-123')).toEqual(['banners', 'café-123']);
    });
});

describe('bannerQueryOptions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(BannerAPI.getListBanner).mockResolvedValue(mockBannerResponse);
    });

    it('should create query options with correct structure', () => {
        const options = bannerQueryOptions('test-outlet');

        expect(options).toHaveProperty('queryKey');
        expect(options).toHaveProperty('queryFn');
        expect(options).toHaveProperty('staleTime');
        expect(options).toHaveProperty('gcTime');
        expect(options).toHaveProperty('refetchOnWindowFocus');
    });

    it('should have correct query key', () => {
        const options = bannerQueryOptions('test-outlet');

        expect(options.queryKey).toEqual(['banners', 'test-outlet']);
    });

    it('should have staleTime of 5 minutes', () => {
        const options = bannerQueryOptions('test-outlet');

        expect(options.staleTime).toBe(1000 * 60 * 5);
    });

    it('should have gcTime of 30 minutes', () => {
        const options = bannerQueryOptions('test-outlet');

        expect(options.gcTime).toBe(1000 * 60 * 30);
    });

    it('should disable refetchOnWindowFocus', () => {
        const options = bannerQueryOptions('test-outlet');

        expect(options.refetchOnWindowFocus).toBe(false);
    });

    it('should fetch banners when queryFn is called', async () => {
        const options = bannerQueryOptions('test-outlet');
        const result = await (options.queryFn as any)();

        expect(BannerAPI.getListBanner).toHaveBeenCalledWith('test-outlet');
        expect(result).toEqual(mockBanners);
    });

    it('should throw error when API returns error status', async () => {
        const errorResponse: BannerResponse = {
            status: 'error',
            message: 'Banners not found',
            data: { banners: [] },
        };
        vi.mocked(BannerAPI.getListBanner).mockResolvedValue(errorResponse);

        const options = bannerQueryOptions('test-outlet');

        await expect((options.queryFn as any)()).rejects.toThrow('Banners not found');
    });

    it('should throw default error when API returns error without message', async () => {
        const errorResponse: BannerResponse = {
            status: 'error',
            message: '',
            data: { banners: [] },
        };
        vi.mocked(BannerAPI.getListBanner).mockResolvedValue(errorResponse);

        const options = bannerQueryOptions('test-outlet');

        await expect((options.queryFn as any)()).rejects.toThrow('Failed to get banner information, refresh the page');
    });

    it('should return empty array when data is null', async () => {
        const nullDataResponse: BannerResponse = {
            status: 'success',
            message: 'Success',
            data: null as any,
        };
        vi.mocked(BannerAPI.getListBanner).mockResolvedValue(nullDataResponse);

        const options = bannerQueryOptions('test-outlet');
        const result = await (options.queryFn as any)();

        expect(result).toEqual([]);
    });

    it('should return empty array when banners is undefined', async () => {
        const undefinedBannersResponse: BannerResponse = {
            status: 'success',
            message: 'Success',
            data: { banners: undefined as any },
        };
        vi.mocked(BannerAPI.getListBanner).mockResolvedValue(undefinedBannersResponse);

        const options = bannerQueryOptions('test-outlet');
        const result = await (options.queryFn as any)();

        expect(result).toEqual([]);
    });
});

describe('useQueryBanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(BannerAPI.getListBanner).mockResolvedValue(mockBannerResponse);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Successful Queries', () => {
        it('should fetch banners successfully', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner('test-outlet'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockBanners);
            expect(BannerAPI.getListBanner).toHaveBeenCalledWith('test-outlet');
        });

        it('should handle empty banner list', async () => {
            const emptyResponse: BannerResponse = {
                ...mockBannerResponse,
                data: { banners: [] },
            };
            vi.mocked(BannerAPI.getListBanner).mockResolvedValue(emptyResponse);

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner('test-outlet'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([]);
        });

        it('should handle different outlet slugs', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner('different-outlet'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(BannerAPI.getListBanner).toHaveBeenCalledWith('different-outlet');
        });

        it('should cache results for same slug', async () => {
            const { Wrapper } = createWrapper();

            // First render
            const { result: result1 } = renderHook(() => useQueryBanner('test-outlet'), { wrapper: Wrapper });
            await waitFor(() => expect(result1.current.isSuccess).toBe(true));

            // Second render with same slug
            const { result: result2 } = renderHook(() => useQueryBanner('test-outlet'), { wrapper: Wrapper });
            await waitFor(() => expect(result2.current.isSuccess).toBe(true));

            // Should only call API once due to caching
            expect(BannerAPI.getListBanner).toHaveBeenCalledTimes(1);
        });

        it('should make new request for different slug', async () => {
            const { Wrapper } = createWrapper();

            // First render
            const { result: result1 } = renderHook(() => useQueryBanner('outlet-1'), { wrapper: Wrapper });
            await waitFor(() => expect(result1.current.isSuccess).toBe(true));

            // Second render with different slug
            const { result: result2 } = renderHook(() => useQueryBanner('outlet-2'), { wrapper: Wrapper });
            await waitFor(() => expect(result2.current.isSuccess).toBe(true));

            // Should call API twice for different slugs
            expect(BannerAPI.getListBanner).toHaveBeenCalledTimes(2);
            expect(BannerAPI.getListBanner).toHaveBeenCalledWith('outlet-1');
            expect(BannerAPI.getListBanner).toHaveBeenCalledWith('outlet-2');
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors', async () => {
            const errorResponse: BannerResponse = {
                status: 'error',
                message: 'Failed to fetch banners',
                data: { banners: [] },
            };
            vi.mocked(BannerAPI.getListBanner).mockResolvedValue(errorResponse);

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner('test-outlet'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe('Failed to fetch banners');
        });

        it('should handle network errors', async () => {
            vi.mocked(BannerAPI.getListBanner).mockRejectedValue(new Error('Network error'));

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner('test-outlet'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe('Network error');
        });
    });

    describe('Enabled/Disabled Queries', () => {
        it('should be enabled by default when slug is provided', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner('test-outlet'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(BannerAPI.getListBanner).toHaveBeenCalled();
        });

        it('should be disabled when slug is null', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner(null), { wrapper: Wrapper });

            expect(result.current.isPending).toBe(true);
            expect(result.current.fetchStatus).toBe('idle');
            expect(BannerAPI.getListBanner).not.toHaveBeenCalled();
        });

        it('should be disabled when slug is undefined', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner(undefined), { wrapper: Wrapper });

            expect(result.current.isPending).toBe(true);
            expect(result.current.fetchStatus).toBe('idle');
            expect(BannerAPI.getListBanner).not.toHaveBeenCalled();
        });

        it('should be disabled when enabled option is false', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryBanner('test-outlet', { enabled: false }),
                { wrapper: Wrapper }
            );

            expect(result.current.isPending).toBe(true);
            expect(result.current.fetchStatus).toBe('idle');
            expect(BannerAPI.getListBanner).not.toHaveBeenCalled();
        });

        it('should be enabled when enabled option is true', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryBanner('test-outlet', { enabled: true }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(BannerAPI.getListBanner).toHaveBeenCalled();
        });

        it('should return empty array when disabled', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner(null), { wrapper: Wrapper });

            expect(result.current.data).toBeUndefined();
        });
    });

    describe('Loading States', () => {
        it('should show pending state initially', () => {
            let resolveFetch: any;
            vi.mocked(BannerAPI.getListBanner).mockImplementation(
                () => new Promise((resolve) => {
                    resolveFetch = () => resolve(mockBannerResponse);
                })
            );

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner('test-outlet'), { wrapper: Wrapper });

            expect(result.current.isPending).toBe(true);
            expect(result.current.isLoading).toBe(true);

            resolveFetch();
        });

        it('should transition to success state', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner('test-outlet'), { wrapper: Wrapper });

            expect(result.current.isPending).toBe(true);

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.isPending).toBe(false);
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('Custom Options', () => {
        it('should accept custom staleTime', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryBanner('test-outlet', { staleTime: 10000 }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockBanners);
        });

        it('should accept custom gcTime', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryBanner('test-outlet', { gcTime: 60000 }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockBanners);
        });

        it('should accept custom refetchOnWindowFocus', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQueryBanner('test-outlet', { refetchOnWindowFocus: true }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockBanners);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string slug', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner(''), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(BannerAPI.getListBanner).toHaveBeenCalledWith('');
        });

        it('should handle very long slug', async () => {
            const longSlug = 'a'.repeat(200);
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner(longSlug), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(BannerAPI.getListBanner).toHaveBeenCalledWith(longSlug);
        });

        it('should handle special characters in slug', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner('café-123'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(BannerAPI.getListBanner).toHaveBeenCalledWith('café-123');
        });
    });

    describe('Refetch Behavior', () => {
        it('should not refetch on window focus by default', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner('test-outlet'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            // Simulate window focus
            window.dispatchEvent(new Event('focus'));

            // Should not trigger refetch
            expect(BannerAPI.getListBanner).toHaveBeenCalledTimes(1);
        });

        it('should allow manual refetch', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQueryBanner('test-outlet'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(BannerAPI.getListBanner).toHaveBeenCalledTimes(1);

            // Manual refetch
            await result.current.refetch();

            expect(BannerAPI.getListBanner).toHaveBeenCalledTimes(2);
        });
    });
});

describe('prefetchBanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(BannerAPI.getListBanner).mockResolvedValue(mockBannerResponse);
    });

    it('should prefetch banners', async () => {
        const queryClient = new QueryClient();

        await prefetchBanner(queryClient, 'test-outlet');

        expect(BannerAPI.getListBanner).toHaveBeenCalledWith('test-outlet');

        const cachedData = queryClient.getQueryData(['banners', 'test-outlet']);
        expect(cachedData).toEqual(mockBanners);
    });

    it('should prefetch for different outlets', async () => {
        const queryClient = new QueryClient();

        await prefetchBanner(queryClient, 'outlet-1');
        await prefetchBanner(queryClient, 'outlet-2');

        expect(BannerAPI.getListBanner).toHaveBeenCalledTimes(2);
        expect(BannerAPI.getListBanner).toHaveBeenCalledWith('outlet-1');
        expect(BannerAPI.getListBanner).toHaveBeenCalledWith('outlet-2');
    });

    it('should cache prefetched data', async () => {
        const queryClient = new QueryClient();

        await prefetchBanner(queryClient, 'test-outlet');

        const cachedData = queryClient.getQueryData(['banners', 'test-outlet']);
        expect(cachedData).toBeDefined();
        expect(cachedData).toEqual(mockBanners);
    });

    it('should handle prefetch errors', async () => {
        const queryClient = new QueryClient();
        vi.mocked(BannerAPI.getListBanner).mockRejectedValue(new Error('Prefetch failed'));

        await expect(prefetchBanner(queryClient, 'test-outlet')).rejects.toThrow('Prefetch failed');
    });
});
