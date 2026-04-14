import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import {
    useQuerySearchProduct,
    searchQueryKeys,
    searchQueryOptions,
    prefetchSearchProduct,
} from '../hooks/api/useQuerySearchProduct';
import { SearchAPI } from '../api/search.api';
import type { SearchResponse, ProductSearch } from '../types/Search';

vi.mock('../api/search.api');

const mockProducts: ProductSearch[] = [
    {
        id: 1,
        uuid: 'product-uuid-1',
        name: 'Espresso Coffee',
        description: 'Strong black coffee',
        price: '25000',
        image_url: 'https://example.com/espresso.jpg',
        is_available: 1,
        is_published: 1,
        is_recommended: 1,
        image: 'espresso.jpg',
        product_category_id: 1,
        outlet_id: 1,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        search_count: '10',
    },
    {
        id: 2,
        uuid: 'product-uuid-2',
        name: 'Cappuccino',
        description: 'Coffee with milk foam',
        price: '30000',
        image_url: 'https://example.com/cappuccino.jpg',
        is_available: 1,
        is_published: 1,
        is_recommended: 1,
        image: 'cappuccino.jpg',
        product_category_id: 1,
        outlet_id: 1,
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
        search_count: '25',
    },
];

const mockSearchResponse: SearchResponse = {
    status: 'success',
    message: 'Search results retrieved successfully',
    data: {
        products: mockProducts,
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

describe('searchQueryKeys', () => {
    it('should generate root key', () => {
        expect(searchQueryKeys.root()).toEqual(['search']);
    });

    it('should generate list key with slug and query', () => {
        expect(searchQueryKeys.list('test-outlet', 'coffee')).toEqual(['search', 'test-outlet', 'coffee']);
    });

    it('should generate different keys for different slugs', () => {
        const key1 = searchQueryKeys.list('outlet-1', 'coffee');
        const key2 = searchQueryKeys.list('outlet-2', 'coffee');

        expect(key1).not.toEqual(key2);
    });

    it('should generate different keys for different queries', () => {
        const key1 = searchQueryKeys.list('test-outlet', 'coffee');
        const key2 = searchQueryKeys.list('test-outlet', 'tea');

        expect(key1).not.toEqual(key2);
    });

    it('should handle empty slug', () => {
        expect(searchQueryKeys.list('', 'coffee')).toEqual(['search', '', 'coffee']);
    });

    it('should handle empty query', () => {
        expect(searchQueryKeys.list('test-outlet', '')).toEqual(['search', 'test-outlet', '']);
    });

    it('should handle special characters', () => {
        expect(searchQueryKeys.list('café-123', 'coffee & tea')).toEqual(['search', 'café-123', 'coffee & tea']);
    });
});

describe('searchQueryOptions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(SearchAPI.searchProduct).mockResolvedValue(mockSearchResponse);
    });

    it('should create query options with correct structure', () => {
        const options = searchQueryOptions('test-outlet', 'coffee');

        expect(options).toHaveProperty('queryKey');
        expect(options).toHaveProperty('queryFn');
        expect(options).toHaveProperty('staleTime');
        expect(options).toHaveProperty('gcTime');
        expect(options).toHaveProperty('refetchOnWindowFocus');
    });

    it('should have correct query key', () => {
        const options = searchQueryOptions('test-outlet', 'coffee');

        expect(options.queryKey).toEqual(['search', 'test-outlet', 'coffee']);
    });

    it('should have staleTime of 5 minutes', () => {
        const options = searchQueryOptions('test-outlet', 'coffee');

        expect(options.staleTime).toBe(1000 * 60 * 5);
    });

    it('should have gcTime of 30 minutes', () => {
        const options = searchQueryOptions('test-outlet', 'coffee');

        expect(options.gcTime).toBe(1000 * 60 * 30);
    });

    it('should disable refetchOnWindowFocus', () => {
        const options = searchQueryOptions('test-outlet', 'coffee');

        expect(options.refetchOnWindowFocus).toBe(false);
    });

    it('should fetch search results when queryFn is called', async () => {
        const options = searchQueryOptions('test-outlet', 'coffee');
        const result = await (options.queryFn as any)?.();

        expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', 'coffee');
        expect(result).toEqual(mockProducts);
    });

    it('should throw error when API returns error status', async () => {
        const errorResponse: SearchResponse = {
            status: 'error',
            message: 'Search failed',
            data: { products: [] },
        };
        vi.mocked(SearchAPI.searchProduct).mockResolvedValue(errorResponse);

        const options = searchQueryOptions('test-outlet', 'coffee');

        await expect((options.queryFn as any)?.()).rejects.toThrow('Search failed');
    });

    it('should throw default error when API returns error without message', async () => {
        const errorResponse: SearchResponse = {
            status: 'error',
            message: '',
            data: { products: [] },
        };
        vi.mocked(SearchAPI.searchProduct).mockResolvedValue(errorResponse);

        const options = searchQueryOptions('test-outlet', 'coffee');

        await expect((options.queryFn as any)?.()).rejects.toThrow('Failed to get search results, refresh the page');
    });

    it('should return empty array when data is null', async () => {
        const nullDataResponse: SearchResponse = {
            status: 'success',
            message: 'Success',
            data: null as any,
        };
        vi.mocked(SearchAPI.searchProduct).mockResolvedValue(nullDataResponse);

        const options = searchQueryOptions('test-outlet', 'coffee');
        const result = await (options.queryFn as any)?.();

        expect(result).toEqual([]);
    });

    it('should return empty array when products is undefined', async () => {
        const undefinedProductsResponse: SearchResponse = {
            status: 'success',
            message: 'Success',
            data: { products: undefined as any },
        };
        vi.mocked(SearchAPI.searchProduct).mockResolvedValue(undefinedProductsResponse);

        const options = searchQueryOptions('test-outlet', 'coffee');
        const result = await (options.queryFn as any)?.();

        expect(result).toEqual([]);
    });
});

describe('useQuerySearchProduct', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(SearchAPI.searchProduct).mockResolvedValue(mockSearchResponse);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Successful Queries', () => {
        it('should search products successfully', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockProducts);
            expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', 'coffee');
        });

        it('should handle empty search results', async () => {
            const emptyResponse: SearchResponse = {
                ...mockSearchResponse,
                data: { products: [] },
            };
            vi.mocked(SearchAPI.searchProduct).mockResolvedValue(emptyResponse);

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', 'nonexistent'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual([]);
        });

        it('should handle empty query string', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', ''), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', '');
        });

        it('should handle null query string', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', null as any), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', '');
        });

        it('should handle different outlet slugs', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('different-outlet', 'coffee'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledWith('different-outlet', 'coffee');
        });

        it('should handle different search queries', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', 'tea'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', 'tea');
        });

        it('should cache results for same slug and query', async () => {
            const { Wrapper } = createWrapper();

            // First render
            const { result: result1 } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee'), { wrapper: Wrapper });
            await waitFor(() => expect(result1.current.isSuccess).toBe(true));

            // Second render with same parameters
            const { result: result2 } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee'), { wrapper: Wrapper });
            await waitFor(() => expect(result2.current.isSuccess).toBe(true));

            // Should only call API once due to caching
            expect(SearchAPI.searchProduct).toHaveBeenCalledTimes(1);
        });

        it('should make new request for different query', async () => {
            const { Wrapper } = createWrapper();

            // First render
            const { result: result1 } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee'), { wrapper: Wrapper });
            await waitFor(() => expect(result1.current.isSuccess).toBe(true));

            // Second render with different query
            const { result: result2 } = renderHook(() => useQuerySearchProduct('test-outlet', 'tea'), { wrapper: Wrapper });
            await waitFor(() => expect(result2.current.isSuccess).toBe(true));

            // Should call API twice for different queries
            expect(SearchAPI.searchProduct).toHaveBeenCalledTimes(2);
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors', async () => {
            const errorResponse: SearchResponse = {
                status: 'error',
                message: 'Failed to search products',
                data: { products: [] },
            };
            vi.mocked(SearchAPI.searchProduct).mockResolvedValue(errorResponse);

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe('Failed to search products');
        });

        it('should handle network errors', async () => {
            vi.mocked(SearchAPI.searchProduct).mockRejectedValue(new Error('Network error'));

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isError).toBe(true);
            });

            expect(result.current.error?.message).toBe('Network error');
        });
    });

    describe('Enabled/Disabled Queries', () => {
        it('should be enabled by default when slug is provided', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalled();
        });

        it('should be disabled when slug is null', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct(null as any, 'coffee'), { wrapper: Wrapper });

            expect(result.current.isPending).toBe(true);
            expect(result.current.fetchStatus).toBe('idle');
            expect(SearchAPI.searchProduct).not.toHaveBeenCalled();
        });

        it('should be disabled when slug is undefined', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct(undefined as any, 'coffee'), { wrapper: Wrapper });

            expect(result.current.isPending).toBe(true);
            expect(result.current.fetchStatus).toBe('idle');
            expect(SearchAPI.searchProduct).not.toHaveBeenCalled();
        });

        it('should be disabled when enabled option is false', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQuerySearchProduct('test-outlet', 'coffee', { enabled: false }),
                { wrapper: Wrapper }
            );

            expect(result.current.isPending).toBe(true);
            expect(result.current.fetchStatus).toBe('idle');
            expect(SearchAPI.searchProduct).not.toHaveBeenCalled();
        });

        it('should be enabled when enabled option is true', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQuerySearchProduct('test-outlet', 'coffee', { enabled: true }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalled();
        });

        it('should return undefined when disabled', () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct(null as any, 'coffee'), { wrapper: Wrapper });

            expect(result.current.data).toBeUndefined();
        });

        it('should be enabled even with empty query when slug exists', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', ''), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', '');
        });
    });

    describe('Loading States', () => {
        it('should show pending state initially', () => {
            let resolveFetch: any;
            vi.mocked(SearchAPI.searchProduct).mockImplementation(
                () => new Promise((resolve) => {
                    resolveFetch = () => resolve(mockSearchResponse);
                })
            );

            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee'), { wrapper: Wrapper });

            expect(result.current.isPending).toBe(true);
            expect(result.current.isLoading).toBe(true);

            resolveFetch();
        });

        it('should transition to success state', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee'), { wrapper: Wrapper });

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
                () => useQuerySearchProduct('test-outlet', 'coffee', { staleTime: 10000 }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockProducts);
        });

        it('should accept custom gcTime', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQuerySearchProduct('test-outlet', 'coffee', { gcTime: 60000 }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockProducts);
        });

        it('should accept custom refetchOnWindowFocus', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(
                () => useQuerySearchProduct('test-outlet', 'coffee', { refetchOnWindowFocus: true }),
                { wrapper: Wrapper }
            );

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data).toEqual(mockProducts);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string slug', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('', 'coffee'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledWith('', 'coffee');
        });

        it('should handle very long slug', async () => {
            const longSlug = 'a'.repeat(200);
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct(longSlug, 'coffee'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledWith(longSlug, 'coffee');
        });

        it('should handle very long query', async () => {
            const longQuery = 'coffee '.repeat(100);
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', longQuery), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', longQuery);
        });

        it('should handle special characters in slug', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('café-123', 'coffee'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledWith('café-123', 'coffee');
        });

        it('should handle special characters in query', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee & tea'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', 'coffee & tea');
        });

        it('should handle unicode characters', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', '咖啡 ☕'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', '咖啡 ☕');
        });
    });

    describe('Refetch Behavior', () => {
        it('should not refetch on window focus by default', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            // Simulate window focus
            window.dispatchEvent(new Event('focus'));

            // Should not trigger refetch
            expect(SearchAPI.searchProduct).toHaveBeenCalledTimes(1);
        });

        it('should allow manual refetch', async () => {
            const { Wrapper } = createWrapper();
            const { result } = renderHook(() => useQuerySearchProduct('test-outlet', 'coffee'), { wrapper: Wrapper });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(SearchAPI.searchProduct).toHaveBeenCalledTimes(1);

            // Manual refetch
            await result.current.refetch();

            expect(SearchAPI.searchProduct).toHaveBeenCalledTimes(2);
        });
    });
});

describe('prefetchSearchProduct', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(SearchAPI.searchProduct).mockResolvedValue(mockSearchResponse);
    });

    it('should prefetch search results', async () => {
        const queryClient = new QueryClient();

        await prefetchSearchProduct(queryClient, 'test-outlet', 'coffee');

        expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', 'coffee');

        const cachedData = queryClient.getQueryData(['search', 'test-outlet', 'coffee']);
        expect(cachedData).toEqual(mockProducts);
    });

    it('should prefetch for different queries', async () => {
        const queryClient = new QueryClient();

        await prefetchSearchProduct(queryClient, 'test-outlet', 'coffee');
        await prefetchSearchProduct(queryClient, 'test-outlet', 'tea');

        expect(SearchAPI.searchProduct).toHaveBeenCalledTimes(2);
        expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', 'coffee');
        expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', 'tea');
    });

    it('should cache prefetched data', async () => {
        const queryClient = new QueryClient();

        await prefetchSearchProduct(queryClient, 'test-outlet', 'coffee');

        const cachedData = queryClient.getQueryData(['search', 'test-outlet', 'coffee']);
        expect(cachedData).toBeDefined();
        expect(cachedData).toEqual(mockProducts);
    });

    it('should handle prefetch errors', async () => {
        const queryClient = new QueryClient();
        vi.mocked(SearchAPI.searchProduct).mockRejectedValue(new Error('Prefetch failed'));

        await expect(prefetchSearchProduct(queryClient, 'test-outlet', 'coffee')).rejects.toThrow('Prefetch failed');
    });

    it('should handle empty query in prefetch', async () => {
        const queryClient = new QueryClient();

        await prefetchSearchProduct(queryClient, 'test-outlet', '');

        expect(SearchAPI.searchProduct).toHaveBeenCalledWith('test-outlet', '');
    });
});
