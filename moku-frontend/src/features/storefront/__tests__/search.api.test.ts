import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchAPI } from '../api/search.api';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';

vi.mock('@/lib/axios');
vi.mock('sonner');

const mockProduct = {
    uuid: 'product-uuid-1',
    name: 'Espresso Coffee',
    description: 'Strong black coffee',
    price: 25000,
    image_url: 'https://example.com/espresso.jpg',
    category: 'Beverages',
    is_available: true,
    is_liked: false,
    likes_count: 10,
};

const mockSearchResponse: any = {
    status: 'success',
    message: 'Search results retrieved successfully',
    data: {
        products: [mockProduct, { ...mockProduct, uuid: 'product-uuid-2', name: 'Cappuccino' }],
        total: 2,
        search_term: 'coffee',
    },
};

describe('SearchAPI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('searchProduct', () => {
        describe('Successful Searches', () => {
            it('should search products successfully', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockSearchResponse,
                });

                const result = await SearchAPI.searchProduct('test-outlet', 'coffee');

                expect(axiosInstance.get).toHaveBeenCalledWith(
                    '/outlet/test-outlet/products/most-searched',
                    { params: { search: 'coffee' } }
                );
                // Castresult to any to bypass strict type check on extra properties
                expect((result as any).data.products).toHaveLength(2);
                expect(toast.info).not.toHaveBeenCalled();
            });

            it('should handle empty search results', async () => {
                const emptyResponse: any = {
                    status: 'success',
                    message: 'No products found',
                    data: {
                        products: [],
                        total: 0,
                        search_term: 'nonexistent',
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: emptyResponse,
                });

                const result = await SearchAPI.searchProduct('test-outlet', 'nonexistent');

                expect(result.data.products).toHaveLength(0);
            });

            it('should handle single search result', async () => {
                const singleResult: any = {
                    ...mockSearchResponse,
                    data: {
                        products: [mockSearchResponse.data.products[0]],
                        total: 1,
                        search_term: 'espresso',
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: singleResult,
                });

                const result = await SearchAPI.searchProduct('test-outlet', 'espresso');

                expect(result.data.products).toHaveLength(1);
            });

            it('should handle multiple search results', async () => {
                const multipleResults: any = {
                    ...mockSearchResponse,
                    data: {
                        products: [
                            ...mockSearchResponse.data.products,
                            { ...mockProduct, uuid: 'product-uuid-3', name: 'Latte' },
                        ],
                        total: 3,
                        search_term: 'coffee',
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: multipleResults,
                });

                const result = await SearchAPI.searchProduct('test-outlet', 'coffee');

                expect(result.data.products).toHaveLength(3);
            });

            it('should handle different outlet slugs', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockSearchResponse,
                });

                await SearchAPI.searchProduct('different-outlet', 'coffee');

                expect(axiosInstance.get).toHaveBeenCalledWith(
                    '/outlet/different-outlet/products/most-searched',
                    { params: { search: 'coffee' } }
                );
            });

            it('should handle different search terms', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockSearchResponse,
                });

                await SearchAPI.searchProduct('test-outlet', 'tea');

                expect(axiosInstance.get).toHaveBeenCalledWith(
                    '/outlet/test-outlet/products/most-searched',
                    { params: { search: 'tea' } }
                );
            });

            it('should handle case-insensitive search', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockSearchResponse,
                });

                await SearchAPI.searchProduct('test-outlet', 'COFFEE');

                expect(axiosInstance.get).toHaveBeenCalledWith(
                    '/outlet/test-outlet/products/most-searched',
                    { params: { search: 'COFFEE' } }
                );
            });
        });

        describe('Error Handling', () => {
            it('should handle error response with message', async () => {
                const errorResponse: any = {
                    status: 'error',
                    message: 'Search failed',
                    data: {
                        products: [],
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: errorResponse,
                });

                const result = await SearchAPI.searchProduct('test-outlet', 'coffee');

                expect(result).toEqual(errorResponse);
                expect(toast.info).toHaveBeenCalledWith('Search failed');
            });

            it('should handle error response without message', async () => {
                const errorResponse: any = {
                    status: 'error',
                    message: '',
                    data: {
                        products: [],
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: errorResponse,
                });

                const result = await SearchAPI.searchProduct('test-outlet', 'coffee');

                expect(result).toEqual(errorResponse);
                expect(toast.info).toHaveBeenCalledWith('Failed to get like information, refresh the page');
            });

            it('should throw error on network failure', async () => {
                vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Network error'));

                await expect(SearchAPI.searchProduct('test-outlet', 'coffee')).rejects.toThrow(
                    'Failed to fetch like information for: test-outlet with Error: Network error'
                );
            });
        });

        describe('Response Structure', () => {
            it('should return correct response structure', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockSearchResponse,
                });

                const result = await SearchAPI.searchProduct('test-outlet', 'coffee');

                expect(result).toHaveProperty('status');
                expect(result).toHaveProperty('message');
                expect(result).toHaveProperty('data');
                expect(result.data).toHaveProperty('products');
            });

            it('should return array for products', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockSearchResponse,
                });

                const result = await SearchAPI.searchProduct('test-outlet', 'coffee');

                expect(Array.isArray(result.data.products)).toBe(true);
            });
        });

        describe('Query Parameters', () => {
            it('should correctly format query parameters', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockSearchResponse,
                });

                await SearchAPI.searchProduct('test-outlet', 'coffee');

                expect(axiosInstance.get).toHaveBeenCalledWith(
                    '/outlet/test-outlet/products/most-searched',
                    expect.objectContaining({
                        params: expect.objectContaining({
                            search: 'coffee',
                        }),
                    })
                );
            });
        });
    });
});
