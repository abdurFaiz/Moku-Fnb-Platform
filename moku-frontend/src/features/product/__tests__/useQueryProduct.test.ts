import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import {
    useQueryProducts,
    useQueryProductDetail,
    useQueryBestSellingProduct,
    useQueryMostLikedProduct,
    useQueryRecommendationsProduct,
    productQueryKeys,
    prefetchProducts,
    prefetchProductDetail,
} from '../hooks/api/useQueryProduct';
import { ProductAPI } from '../api/product.api';
import {
    mockProductResponse,
    mockProductDetailResponse,
    mockProductRecommendationResponse,
    mockErrorResponse,
    mockErrorDetailResponse,
} from './mockData';

// Mock the ProductAPI
vi.mock('../api/product.api');

describe('useQueryProduct hooks', () => {
    let queryClient: QueryClient;

    const createWrapper = () => {
        const wrapper = ({ children }: { children: ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);
        return wrapper;
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

    describe('productQueryKeys', () => {
        it('should generate correct query keys', () => {
            expect(productQueryKeys.root()).toEqual(['products']);
            expect(productQueryKeys.list('test-outlet')).toEqual(['products', 'test-outlet']);
            expect(productQueryKeys.detail('test-outlet', 'product-uuid')).toEqual([
                'products',
                'test-outlet',
                'product-uuid',
            ]);
            expect(productQueryKeys.bestSelling('test-outlet')).toEqual([
                'products',
                'test-outlet',
                'best-selling',
            ]);
            expect(productQueryKeys.mostLiked('test-outlet')).toEqual([
                'products',
                'test-outlet',
                'most-liked',
            ]);
            expect(productQueryKeys.recommendations('test-outlet', ['uuid-1'])).toEqual([
                'products',
                'test-outlet',
                'recommendations',
                ['uuid-1'],
            ]);
        });

        it('should handle null product_uuids in recommendations key', () => {
            expect(productQueryKeys.recommendations('test-outlet', null)).toEqual([
                'products',
                'test-outlet',
                'recommendations',
                null,
            ]);
        });
    });

    describe('useQueryProducts', () => {
        it('should fetch products successfully', async () => {
            vi.mocked(ProductAPI.getAllProduct).mockResolvedValue(mockProductResponse);

            const { result } = renderHook(() => useQueryProducts('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(ProductAPI.getAllProduct).toHaveBeenCalledWith('test-outlet');
            expect(result.current.data).toEqual(mockProductResponse);
        });

        it('should handle error response from API', async () => {
            vi.mocked(ProductAPI.getAllProduct).mockResolvedValue(mockErrorResponse);

            const { result } = renderHook(() => useQueryProducts('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error?.message).toContain('Failed to fetch products');
        });

        it('should not fetch when slug is null', () => {
            const { result } = renderHook(() => useQueryProducts(null), {
                wrapper: createWrapper(),
            });

            expect(result.current.fetchStatus).toBe('idle');
            expect(ProductAPI.getAllProduct).not.toHaveBeenCalled();
        });

        it('should not fetch when slug is undefined', () => {
            const { result } = renderHook(() => useQueryProducts(undefined), {
                wrapper: createWrapper(),
            });

            expect(result.current.fetchStatus).toBe('idle');
            expect(ProductAPI.getAllProduct).not.toHaveBeenCalled();
        });

        it('should respect custom options', async () => {
            vi.mocked(ProductAPI.getAllProduct).mockResolvedValue(mockProductResponse);

            const { result } = renderHook(
                () => useQueryProducts('test-outlet', { enabled: false }),
                { wrapper: createWrapper() }
            );

            expect(result.current.fetchStatus).toBe('idle');
            expect(ProductAPI.getAllProduct).not.toHaveBeenCalled();
        });
    });

    describe('useQueryProductDetail', () => {
        it('should fetch product detail successfully', async () => {
            vi.mocked(ProductAPI.getProduct).mockResolvedValue(mockProductDetailResponse);

            const { result } = renderHook(
                () => useQueryProductDetail('test-outlet', 'product-uuid-1'),
                { wrapper: createWrapper() }
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(ProductAPI.getProduct).toHaveBeenCalledWith('test-outlet', 'product-uuid-1');
            expect(result.current.data).toEqual(mockProductDetailResponse);
        });

        it('should handle error response from API', async () => {
            vi.mocked(ProductAPI.getProduct).mockResolvedValue(mockErrorDetailResponse);

            const { result } = renderHook(
                () => useQueryProductDetail('test-outlet', 'product-uuid-1'),
                { wrapper: createWrapper() }
            );

            await waitFor(() => expect(result.current.isError).toBe(true));
            expect(result.current.error?.message).toContain('Product not found');
        });

        it('should not fetch when slug is null', () => {
            const { result } = renderHook(
                () => useQueryProductDetail(null, 'product-uuid-1'),
                { wrapper: createWrapper() }
            );

            expect(result.current.fetchStatus).toBe('idle');
            expect(ProductAPI.getProduct).not.toHaveBeenCalled();
        });

        it('should not fetch when productUuid is null', () => {
            const { result } = renderHook(
                () => useQueryProductDetail('test-outlet', null),
                { wrapper: createWrapper() }
            );

            expect(result.current.fetchStatus).toBe('idle');
            expect(ProductAPI.getProduct).not.toHaveBeenCalled();
        });

        it('should not fetch when both parameters are missing', () => {
            const { result } = renderHook(() => useQueryProductDetail(null, null), {
                wrapper: createWrapper(),
            });

            expect(result.current.fetchStatus).toBe('idle');
            expect(ProductAPI.getProduct).not.toHaveBeenCalled();
        });
    });

    describe('useQueryBestSellingProduct', () => {
        it('should fetch best-selling product successfully', async () => {
            vi.mocked(ProductAPI.getBestSellingProduct).mockResolvedValue(
                mockProductDetailResponse
            );

            const { result } = renderHook(() => useQueryBestSellingProduct('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(ProductAPI.getBestSellingProduct).toHaveBeenCalledWith('test-outlet');
            expect(result.current.data).toEqual(mockProductDetailResponse);
        });

        it('should handle error response', async () => {
            vi.mocked(ProductAPI.getBestSellingProduct).mockResolvedValue(
                mockErrorDetailResponse
            );

            const { result } = renderHook(() => useQueryBestSellingProduct('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
        });

        it('should not fetch when slug is null', () => {
            const { result } = renderHook(() => useQueryBestSellingProduct(null), {
                wrapper: createWrapper(),
            });

            expect(result.current.fetchStatus).toBe('idle');
            expect(ProductAPI.getBestSellingProduct).not.toHaveBeenCalled();
        });
    });

    describe('useQueryMostLikedProduct', () => {
        it('should fetch most-liked product successfully', async () => {
            vi.mocked(ProductAPI.getMostLikedProduct).mockResolvedValue(
                mockProductDetailResponse
            );

            const { result } = renderHook(() => useQueryMostLikedProduct('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(ProductAPI.getMostLikedProduct).toHaveBeenCalledWith('test-outlet');
            expect(result.current.data).toEqual(mockProductDetailResponse);
        });

        it('should handle error response', async () => {
            vi.mocked(ProductAPI.getMostLikedProduct).mockResolvedValue(
                mockErrorDetailResponse
            );

            const { result } = renderHook(() => useQueryMostLikedProduct('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect(result.current.isError).toBe(true));
        });

        it('should not fetch when slug is null', () => {
            const { result } = renderHook(() => useQueryMostLikedProduct(null), {
                wrapper: createWrapper(),
            });

            expect(result.current.fetchStatus).toBe('idle');
            expect(ProductAPI.getMostLikedProduct).not.toHaveBeenCalled();
        });
    });

    describe('useQueryRecommendationsProduct', () => {
        it('should fetch recommendations successfully', async () => {
            vi.mocked(ProductAPI.getRecommendationsProduct).mockResolvedValue(
                mockProductRecommendationResponse
            );

            const { result } = renderHook(
                () => useQueryRecommendationsProduct('test-outlet', ['uuid-1', 'uuid-2']),
                { wrapper: createWrapper() }
            );

            await waitFor(() => expect(result.current.isSuccess).toBe(true));

            expect(ProductAPI.getRecommendationsProduct).toHaveBeenCalledWith('test-outlet', [
                'uuid-1',
                'uuid-2',
            ]);
            expect(result.current.data).toEqual(mockProductRecommendationResponse);
        });

        it('should not fetch when slug is null', () => {
            const { result } = renderHook(
                () => useQueryRecommendationsProduct(null, ['uuid-1']),
                { wrapper: createWrapper() }
            );

            expect(result.current.fetchStatus).toBe('idle');
            expect(ProductAPI.getRecommendationsProduct).not.toHaveBeenCalled();
        });

        it('should not fetch when product_uuids is null', () => {
            const { result } = renderHook(
                () => useQueryRecommendationsProduct('test-outlet', null),
                { wrapper: createWrapper() }
            );

            expect(result.current.fetchStatus).toBe('idle');
            expect(ProductAPI.getRecommendationsProduct).not.toHaveBeenCalled();
        });

        it('should not fetch when product_uuids is empty array', () => {
            const { result } = renderHook(
                () => useQueryRecommendationsProduct('test-outlet', []),
                { wrapper: createWrapper() }
            );

            expect(result.current.fetchStatus).toBe('idle');
            expect(ProductAPI.getRecommendationsProduct).not.toHaveBeenCalled();
        });
    });

    describe('prefetch functions', () => {
        it('should prefetch products list', async () => {
            vi.mocked(ProductAPI.getAllProduct).mockResolvedValue(mockProductResponse);

            await prefetchProducts(queryClient, 'test-outlet');

            const cachedData = queryClient.getQueryData(productQueryKeys.list('test-outlet'));
            expect(cachedData).toEqual(mockProductResponse);
        });

        it('should prefetch product detail', async () => {
            vi.mocked(ProductAPI.getProduct).mockResolvedValue(mockProductDetailResponse);

            await prefetchProductDetail(queryClient, 'test-outlet', 'product-uuid-1');

            const cachedData = queryClient.getQueryData(
                productQueryKeys.detail('test-outlet', 'product-uuid-1')
            );
            expect(cachedData).toEqual(mockProductDetailResponse);
        });
    });
});
