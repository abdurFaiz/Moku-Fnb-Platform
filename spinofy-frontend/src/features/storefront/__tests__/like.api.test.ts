import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { LikeAPI } from '../api/like.api';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import type { LikeResponse } from '../types/Like';

vi.mock('@/lib/axios');
vi.mock('sonner');

const mockLikeResponse: LikeResponse = {
    status: 'success',
    message: 'Product liked successfully',
    data: {
        product_uuid: 'product-uuid-123',
        is_liked: true,
        likes_count: 42,
    },
};

const mockUnlikeResponse: LikeResponse = {
    status: 'success',
    message: 'Product unliked successfully',
    data: {
        product_uuid: 'product-uuid-123',
        is_liked: false,
        likes_count: 41,
    },
};

describe('LikeAPI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('toggleLike', () => {
        describe('Successful Requests', () => {
            it('should like product successfully', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');

                expect(axiosInstance.put).toHaveBeenCalledWith('/outlet/test-outlet/products/product-uuid-123/like');
                expect(result).toEqual(mockLikeResponse);
                expect(result.data.is_liked).toBe(true);
                expect(toast.info).not.toHaveBeenCalled();
            });

            it('should unlike product successfully', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockUnlikeResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');

                expect(result).toEqual(mockUnlikeResponse);
                expect(result.data.is_liked).toBe(false);
                expect(result.data.likes_count).toBe(41);
            });

            it('should handle different outlet slugs', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike('different-outlet', 'product-uuid-123');

                expect(axiosInstance.put).toHaveBeenCalledWith('/outlet/different-outlet/products/product-uuid-123/like');
            });

            it('should handle different product UUIDs', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike('test-outlet', 'different-product-uuid');

                expect(axiosInstance.put).toHaveBeenCalledWith('/outlet/test-outlet/products/different-product-uuid/like');
            });

            it('should handle product with zero likes', async () => {
                const zeroLikesResponse: LikeResponse = {
                    ...mockLikeResponse,
                    data: {
                        ...mockLikeResponse.data,
                        likes_count: 0,
                    },
                };

                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: zeroLikesResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');

                expect(result.data.likes_count).toBe(0);
            });

            it('should handle product with many likes', async () => {
                const manyLikesResponse: LikeResponse = {
                    ...mockLikeResponse,
                    data: {
                        ...mockLikeResponse.data,
                        likes_count: 9999,
                    },
                };

                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: manyLikesResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');

                expect(result.data.likes_count).toBe(9999);
            });

            it('should handle first like on product', async () => {
                const firstLikeResponse: LikeResponse = {
                    ...mockLikeResponse,
                    data: {
                        product_uuid: 'new-product-uuid',
                        is_liked: true,
                        likes_count: 1,
                    },
                };

                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: firstLikeResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'new-product-uuid');

                expect(result.data.is_liked).toBe(true);
                expect(result.data.likes_count).toBe(1);
            });

            it('should handle last unlike on product', async () => {
                const lastUnlikeResponse: LikeResponse = {
                    ...mockUnlikeResponse,
                    data: {
                        product_uuid: 'product-uuid-123',
                        is_liked: false,
                        likes_count: 0,
                    },
                };

                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: lastUnlikeResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');

                expect(result.data.is_liked).toBe(false);
                expect(result.data.likes_count).toBe(0);
            });
        });

        describe('Error Handling', () => {
            it('should handle error response with message', async () => {
                const errorResponse: LikeResponse = {
                    status: 'error',
                    message: 'Product not found',
                    data: {
                        product_uuid: 'invalid-uuid',
                        is_liked: false,
                        likes_count: 0,
                    },
                };

                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: errorResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'invalid-uuid');

                expect(result).toEqual(errorResponse);
                expect(toast.info).toHaveBeenCalledWith('Product not found');
            });

            it('should handle error response without message', async () => {
                const errorResponse: LikeResponse = {
                    status: 'error',
                    message: '',
                    data: {
                        product_uuid: 'product-uuid-123',
                        is_liked: false,
                        likes_count: 0,
                    },
                };

                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: errorResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');

                expect(result).toEqual(errorResponse);
                expect(toast.info).toHaveBeenCalledWith('Failed to get like information, refresh the page');
            });

            it('should throw error on network failure', async () => {
                vi.mocked(axiosInstance.put).mockRejectedValue(new Error('Network error'));

                await expect(LikeAPI.toggleLike('test-outlet', 'product-uuid-123')).rejects.toThrow(
                    'Failed to fetch like information for: test-outlet with Error: Network error'
                );
            });

            it('should throw error on timeout', async () => {
                vi.mocked(axiosInstance.put).mockRejectedValue(new Error('Timeout'));

                await expect(LikeAPI.toggleLike('test-outlet', 'product-uuid-123')).rejects.toThrow(
                    'Failed to fetch like information for: test-outlet with Error: Timeout'
                );
            });

            it('should throw error on 404', async () => {
                const error = new Error('Request failed with status code 404');
                vi.mocked(axiosInstance.put).mockRejectedValue(error);

                await expect(LikeAPI.toggleLike('test-outlet', 'non-existent-product')).rejects.toThrow(
                    'Failed to fetch like information for: test-outlet'
                );
            });

            it('should throw error on 401 unauthorized', async () => {
                const error = new Error('Request failed with status code 401');
                vi.mocked(axiosInstance.put).mockRejectedValue(error);

                await expect(LikeAPI.toggleLike('test-outlet', 'product-uuid-123')).rejects.toThrow(
                    'Failed to fetch like information for: test-outlet'
                );
            });

            it('should throw error on 403 forbidden', async () => {
                const error = new Error('Request failed with status code 403');
                vi.mocked(axiosInstance.put).mockRejectedValue(error);

                await expect(LikeAPI.toggleLike('test-outlet', 'product-uuid-123')).rejects.toThrow(
                    'Failed to fetch like information for: test-outlet'
                );
            });

            it('should throw error on 500 server error', async () => {
                const error = new Error('Request failed with status code 500');
                vi.mocked(axiosInstance.put).mockRejectedValue(error);

                await expect(LikeAPI.toggleLike('test-outlet', 'product-uuid-123')).rejects.toThrow(
                    'Failed to fetch like information for: test-outlet'
                );
            });

            it('should handle axios error with response', async () => {
                const axiosError = {
                    response: {
                        status: 422,
                        data: { message: 'Validation error' },
                    },
                    message: 'Request failed',
                };
                vi.mocked(axiosInstance.put).mockRejectedValue(axiosError);

                await expect(LikeAPI.toggleLike('test-outlet', 'product-uuid-123')).rejects.toThrow();
            });

            it('should handle connection refused error', async () => {
                const error = new Error('connect ECONNREFUSED');
                vi.mocked(axiosInstance.put).mockRejectedValue(error);

                await expect(LikeAPI.toggleLike('test-outlet', 'product-uuid-123')).rejects.toThrow(
                    'Failed to fetch like information for: test-outlet'
                );
            });
        });

        describe('Edge Cases', () => {
            it('should handle empty outlet slug', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike('', 'product-uuid-123');

                expect(axiosInstance.put).toHaveBeenCalledWith('/outlet//products/product-uuid-123/like');
            });

            it('should handle empty product UUID', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike('test-outlet', '');

                expect(axiosInstance.put).toHaveBeenCalledWith('/outlet/test-outlet/products//like');
            });

            it('should handle very long outlet slug', async () => {
                const longSlug = 'a'.repeat(200);
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike(longSlug, 'product-uuid-123');

                expect(axiosInstance.put).toHaveBeenCalledWith(`/outlet/${longSlug}/products/product-uuid-123/like`);
            });

            it('should handle very long product UUID', async () => {
                const longUuid = 'uuid-' + 'a'.repeat(200);
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike('test-outlet', longUuid);

                expect(axiosInstance.put).toHaveBeenCalledWith(`/outlet/test-outlet/products/${longUuid}/like`);
            });

            it('should handle outlet slug with special characters', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike('café-123', 'product-uuid-123');

                expect(axiosInstance.put).toHaveBeenCalledWith('/outlet/café-123/products/product-uuid-123/like');
            });

            it('should handle product UUID with special characters', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike('test-outlet', 'product-uuid-123-special!@#');

                expect(axiosInstance.put).toHaveBeenCalledWith('/outlet/test-outlet/products/product-uuid-123-special!@#/like');
            });

            it('should handle outlet slug with spaces', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike('test outlet', 'product-uuid-123');

                expect(axiosInstance.put).toHaveBeenCalledWith('/outlet/test outlet/products/product-uuid-123/like');
            });

            it('should handle product UUID with spaces', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike('test-outlet', 'product uuid 123');

                expect(axiosInstance.put).toHaveBeenCalledWith('/outlet/test-outlet/products/product uuid 123/like');
            });

            it('should handle unicode characters in outlet slug', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike('测试-outlet', 'product-uuid-123');

                expect(axiosInstance.put).toHaveBeenCalledWith('/outlet/测试-outlet/products/product-uuid-123/like');
            });

            it('should handle unicode characters in product UUID', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                await LikeAPI.toggleLike('test-outlet', 'product-测试-123');

                expect(axiosInstance.put).toHaveBeenCalledWith('/outlet/test-outlet/products/product-测试-123/like');
            });
        });

        describe('Response Structure', () => {
            it('should return correct response structure', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');

                expect(result).toHaveProperty('status');
                expect(result).toHaveProperty('message');
                expect(result).toHaveProperty('data');
                expect(result.data).toHaveProperty('product_uuid');
                expect(result.data).toHaveProperty('is_liked');
                expect(result.data).toHaveProperty('likes_count');
            });

            it('should return boolean for is_liked', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');

                expect(typeof result.data.is_liked).toBe('boolean');
            });

            it('should return number for likes_count', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');

                expect(typeof result.data.likes_count).toBe('number');
            });

            it('should return string for product_uuid', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                const result = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');

                expect(typeof result.data.product_uuid).toBe('string');
            });
        });

        describe('Concurrent Requests', () => {
            it('should handle multiple like requests', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                const promises = [
                    LikeAPI.toggleLike('test-outlet', 'product-1'),
                    LikeAPI.toggleLike('test-outlet', 'product-2'),
                    LikeAPI.toggleLike('test-outlet', 'product-3'),
                ];

                const results = await Promise.all(promises);

                expect(results).toHaveLength(3);
                expect(axiosInstance.put).toHaveBeenCalledTimes(3);
            });

            it('should handle rapid toggle requests', async () => {
                vi.mocked(axiosInstance.put)
                    .mockResolvedValueOnce({ data: mockLikeResponse })
                    .mockResolvedValueOnce({ data: mockUnlikeResponse })
                    .mockResolvedValueOnce({ data: mockLikeResponse });

                const result1 = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');
                const result2 = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');
                const result3 = await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');

                expect(result1.data.is_liked).toBe(true);
                expect(result2.data.is_liked).toBe(false);
                expect(result3.data.is_liked).toBe(true);
            });
        });

        describe('Performance', () => {
            it('should handle quick successive calls', async () => {
                vi.mocked(axiosInstance.put).mockResolvedValue({
                    data: mockLikeResponse,
                });

                const start = Date.now();
                await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');
                await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');
                await LikeAPI.toggleLike('test-outlet', 'product-uuid-123');
                const end = Date.now();

                expect(end - start).toBeLessThan(1000); // Should complete quickly
                expect(axiosInstance.put).toHaveBeenCalledTimes(3);
            });
        });
    });
});
