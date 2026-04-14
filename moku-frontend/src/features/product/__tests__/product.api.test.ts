import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProductAPI } from '../api/product.api';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import {
    mockProductResponse,
    mockProductDetailResponse,
    mockProductRecommendationResponse,
    mockErrorResponse,
    mockErrorDetailResponse,
} from './mockData';

// Mock dependencies
vi.mock('@/lib/axios');
vi.mock('sonner');

describe('ProductAPI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getAllProduct', () => {
        it('should fetch all products successfully', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductResponse,
            });

            const result = await ProductAPI.getAllProduct('test-outlet');

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/test-outlet/products');
            expect(result).toEqual(mockProductResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should show toast when API returns error status', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockErrorResponse,
            });

            const result = await ProductAPI.getAllProduct('test-outlet');

            expect(toast.info).toHaveBeenCalledWith('Failed to fetch products');
            expect(result).toEqual(mockErrorResponse);
        });

        it('should show custom error message from API', async () => {
            const customError = {
                ...mockErrorResponse,
                message: 'Custom error message',
            };
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: customError,
            });

            await ProductAPI.getAllProduct('test-outlet');

            expect(toast.info).toHaveBeenCalledWith('Custom error message');
        });

        it('should throw error when network request fails', async () => {
            vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Network error'));

            await expect(ProductAPI.getAllProduct('test-outlet')).rejects.toThrow(
                'Failed to fetch products information:'
            );
        });

        it('should handle empty outlet slug', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductResponse,
            });

            await ProductAPI.getAllProduct('');

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet//products');
        });

        it('should handle special characters in outlet slug', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductResponse,
            });

            await ProductAPI.getAllProduct('test-outlet-123');

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/test-outlet-123/products');
        });
    });

    describe('getProduct', () => {
        it('should fetch single product successfully', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductDetailResponse,
            });

            const result = await ProductAPI.getProduct('test-outlet', 'product-uuid-1');

            expect(axiosInstance.get).toHaveBeenCalledWith(
                '/outlet/test-outlet/products/product-uuid-1'
            );
            expect(result).toEqual(mockProductDetailResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should show toast when API returns error status', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockErrorDetailResponse,
            });

            const result = await ProductAPI.getProduct('test-outlet', 'product-uuid-1');

            expect(toast.info).toHaveBeenCalledWith('Product not found');
            expect(result).toEqual(mockErrorDetailResponse);
        });

        it('should throw error when network request fails', async () => {
            vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Network error'));

            await expect(
                ProductAPI.getProduct('test-outlet', 'product-uuid-1')
            ).rejects.toThrow('Failed to fetch product product-uuid-1 information for: test-outlet');
        });

        it('should handle missing product UUID', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductDetailResponse,
            });

            await ProductAPI.getProduct('test-outlet', '');

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/test-outlet/products/');
        });
    });

    describe('getBestSellingProduct', () => {
        it('should fetch best-selling product successfully', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductDetailResponse,
            });

            const result = await ProductAPI.getBestSellingProduct('test-outlet');

            expect(axiosInstance.get).toHaveBeenCalledWith(
                '/outlet/test-outlet/products/best-selling'
            );
            expect(result).toEqual(mockProductDetailResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should show toast when API returns error status', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockErrorDetailResponse,
            });

            const result = await ProductAPI.getBestSellingProduct('test-outlet');

            expect(toast.info).toHaveBeenCalledWith('Product not found');
            expect(result).toEqual(mockErrorDetailResponse);
        });

        it('should throw error when network request fails', async () => {
            vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Network error'));

            await expect(ProductAPI.getBestSellingProduct('test-outlet')).rejects.toThrow(
                'Failed to fetch product  information for: test-outlet'
            );
        });
    });

    describe('getMostLikedProduct', () => {
        it('should fetch most-liked product successfully', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductDetailResponse,
            });

            const result = await ProductAPI.getMostLikedProduct('test-outlet');

            expect(axiosInstance.get).toHaveBeenCalledWith(
                '/outlet/test-outlet/products/most-liked'
            );
            expect(result).toEqual(mockProductDetailResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should show toast when API returns error status', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockErrorDetailResponse,
            });

            const result = await ProductAPI.getMostLikedProduct('test-outlet');

            expect(toast.info).toHaveBeenCalledWith('Product not found');
            expect(result).toEqual(mockErrorDetailResponse);
        });

        it('should throw error when network request fails', async () => {
            vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Network error'));

            await expect(ProductAPI.getMostLikedProduct('test-outlet')).rejects.toThrow(
                'Failed to fetch most liked product information for: test-outlet'
            );
        });
    });

    describe('getRecommendationsProduct', () => {
        it('should fetch recommendations successfully', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductRecommendationResponse,
            });

            const productUuids = ['product-uuid-1', 'product-uuid-2'];
            const result = await ProductAPI.getRecommendationsProduct('test-outlet', productUuids);

            expect(axiosInstance.get).toHaveBeenCalledWith(
                '/outlet/test-outlet/products/recommendations?product_uuids[]=product-uuid-1&product_uuids[]=product-uuid-2'
            );
            expect(result).toEqual(mockProductRecommendationResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should handle single product UUID', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductRecommendationResponse,
            });

            const productUuids = ['product-uuid-1'];
            await ProductAPI.getRecommendationsProduct('test-outlet', productUuids);

            expect(axiosInstance.get).toHaveBeenCalledWith(
                '/outlet/test-outlet/products/recommendations?product_uuids[]=product-uuid-1'
            );
        });

        it('should handle empty product UUIDs array', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductRecommendationResponse,
            });

            await ProductAPI.getRecommendationsProduct('test-outlet', []);

            expect(axiosInstance.get).toHaveBeenCalledWith(
                '/outlet/test-outlet/products/recommendations?'
            );
        });

        it('should properly encode special characters in UUIDs', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductRecommendationResponse,
            });

            const productUuids = ['product-uuid-1', 'product/uuid-2'];
            await ProductAPI.getRecommendationsProduct('test-outlet', productUuids);

            expect(axiosInstance.get).toHaveBeenCalledWith(
                '/outlet/test-outlet/products/recommendations?product_uuids[]=product-uuid-1&product_uuids[]=product%2Fuuid-2'
            );
        });

        it('should show toast when API returns error status', async () => {
            const errorResponse = {
                status: 'error',
                message: 'No recommendations found',
                data: { recommendations: [] },
            };
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: errorResponse,
            });

            await ProductAPI.getRecommendationsProduct('test-outlet', ['product-uuid-1']);

            expect(toast.info).toHaveBeenCalledWith('No recommendations found');
        });

        it('should throw error when network request fails', async () => {
            vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Network error'));

            await expect(
                ProductAPI.getRecommendationsProduct('test-outlet', ['product-uuid-1'])
            ).rejects.toThrow('Failed to fetch product recommendations for: test-outlet');
        });

        it('should handle multiple product UUIDs correctly', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockProductRecommendationResponse,
            });

            const productUuids = ['uuid-1', 'uuid-2', 'uuid-3', 'uuid-4'];
            await ProductAPI.getRecommendationsProduct('test-outlet', productUuids);

            expect(axiosInstance.get).toHaveBeenCalledWith(
                '/outlet/test-outlet/products/recommendations?product_uuids[]=uuid-1&product_uuids[]=uuid-2&product_uuids[]=uuid-3&product_uuids[]=uuid-4'
            );
        });
    });
});
