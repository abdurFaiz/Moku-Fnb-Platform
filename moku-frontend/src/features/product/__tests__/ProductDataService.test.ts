import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProductDataService } from '../services/ProductDataService';
import ProductAPI from '../api/product.api';
import { PRODUCT_ERROR_MESSAGES } from '../constant/productQueryConstant';
import type { ProductsApiResponse } from '../types/ProductQuery';

// Mock ProductAPI
vi.mock('../api/product.api');

describe('ProductDataService', () => {
    let service: ProductDataService;

    beforeEach(() => {
        service = new ProductDataService();
        vi.clearAllMocks();
    });

    describe('fetchProducts', () => {
        const mockResponse: ProductsApiResponse = {
            success: true,
            message: 'Products retrieved',
            data: [
                {
                    categories: [
                        { id: 1, name: 'Coffee', position: 1, outlet_id: 1, created_at: '', updated_at: '' },
                    ],
                    products: [
                        {
                            id: 'uuid-1',
                            name: 'Espresso',
                            price: 25000,
                            description: 'Strong coffee',
                            image: 'espresso.jpg',
                            isAvailable: true,
                            isPublished: true,
                            isRecommended: true,
                            categoryId: 1,
                        },
                    ],
                    recommendedProducts: [],
                } as any,
            ],
        };

        it('should fetch products successfully', async () => {
            vi.mocked(ProductAPI.getAllProduct).mockResolvedValue(mockResponse as any);

            const result = await service.fetchProducts('test-outlet');

            expect(ProductAPI.getAllProduct).toHaveBeenCalledWith('test-outlet');
            expect(result).toEqual(mockResponse);
        });

        it('should throw error when outlet slug is empty', async () => {
            await expect(service.fetchProducts('')).rejects.toThrow(
                PRODUCT_ERROR_MESSAGES.NO_OUTLET_SLUG
            );

            expect(ProductAPI.getAllProduct).not.toHaveBeenCalled();
        });

        it('should throw error when outlet slug is whitespace', async () => {
            await expect(service.fetchProducts('   ')).rejects.toThrow(
                PRODUCT_ERROR_MESSAGES.NO_OUTLET_SLUG
            );

            expect(ProductAPI.getAllProduct).not.toHaveBeenCalled();
        });

        it('should throw error when API call fails', async () => {
            vi.mocked(ProductAPI.getAllProduct).mockRejectedValue(new Error('Network error'));

            await expect(service.fetchProducts('test-outlet')).rejects.toThrow(
                PRODUCT_ERROR_MESSAGES.PRODUCTS_FETCH_FAILED
            );
        });

        it('should log error when API call fails', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            vi.mocked(ProductAPI.getAllProduct).mockRejectedValue(new Error('Network error'));

            await expect(service.fetchProducts('test-outlet')).rejects.toThrow();

            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'Failed to fetch products for outlet test-outlet:',
                expect.any(Error)
            );

            consoleErrorSpy.mockRestore();
        });

        it('should handle special characters in outlet slug', async () => {
            vi.mocked(ProductAPI.getAllProduct).mockResolvedValue(mockResponse as any);

            await service.fetchProducts('test-café-123');

            expect(ProductAPI.getAllProduct).toHaveBeenCalledWith('test-café-123');
        });
    });

    describe('extractProductData', () => {
        it('should extract categories and products from valid response', () => {
            const response: ProductsApiResponse = {
                success: true,
                message: 'Success',
                data: [
                    {
                        categories: [
                            { id: 1, name: 'Coffee', position: 1, outlet_id: 1, created_at: '', updated_at: '' },
                            { id: 2, name: 'Tea', position: 2, outlet_id: 1, created_at: '', updated_at: '' },
                        ],
                        products: [
                            {
                                id: 'uuid-1',
                                name: 'Espresso',
                                price: 25000,
                                description: 'Strong coffee',
                                image: 'espresso.jpg',
                                isAvailable: true,
                                isPublished: true,
                                isRecommended: true,
                                categoryId: 1,
                            },
                        ],
                        recommendedProducts: [],
                    } as any,
                ],
            };

            const result = service.extractProductData(response);

            expect(result.categories).toHaveLength(2);
            expect(result.products).toHaveLength(1);
            expect(result.categories[0].name).toBe('Coffee');
            expect(result.products[0].name).toBe('Espresso');
        });

        it('should return empty arrays when response is undefined', () => {
            const result = service.extractProductData(undefined);

            expect(result.categories).toEqual([]);
            expect(result.products).toEqual([]);
        });

        it('should return empty arrays when response.data is undefined', () => {
            const response = {
                status: 'success',
                message: 'Success',
                data: undefined,
            } as any;

            const result = service.extractProductData(response);

            expect(result.categories).toEqual([]);
            expect(result.products).toEqual([]);
        });

        it('should return empty arrays when response.data is not an array', () => {
            const response = {
                status: 'success',
                message: 'Success',
                data: {},
            } as any;

            const result = service.extractProductData(response);

            expect(result.categories).toEqual([]);
            expect(result.products).toEqual([]);
        });

        it('should return empty arrays when response.data is empty array', () => {
            const response: ProductsApiResponse = {
                success: true,
                message: 'Success',
                data: [],
            };

            const result = service.extractProductData(response);

            expect(result.categories).toEqual([]);
            expect(result.products).toEqual([]);
        });

        it('should handle missing categories in data', () => {
            const response: ProductsApiResponse = {
                success: true,
                message: 'Success',
                data: [
                    {
                        products: [
                            {
                                id: 'uuid-1',
                                name: 'Espresso',
                                price: 25000,
                                description: 'Strong coffee',
                                image: 'espresso.jpg',
                                isAvailable: true,
                                isPublished: true,
                                isRecommended: true,
                                categoryId: 1,
                            },
                        ],
                        recommendedProducts: [],
                    } as any,
                ],
            };

            const result = service.extractProductData(response);

            expect(result.categories).toEqual([]);
            expect(result.products).toHaveLength(1);
        });

        it('should handle missing products in data', () => {
            const response: ProductsApiResponse = {
                success: true,
                message: 'Success',
                data: [
                    {
                        categories: [
                            { id: 1, name: 'Coffee', position: 1, outlet_id: 1, created_at: '', updated_at: '' },
                        ],
                        recommendedProducts: [],
                    } as any,
                ],
            };

            const result = service.extractProductData(response);

            expect(result.categories).toHaveLength(1);
            expect(result.products).toEqual([]);
        });

        it('should handle null values in data', () => {
            const response: ProductsApiResponse = {
                success: true,
                message: 'Success',
                data: [
                    {
                        categories: null,
                        products: null,
                        recommendedProducts: [],
                    } as any,
                ],
            };

            const result = service.extractProductData(response);

            expect(result.categories).toEqual([]);
            expect(result.products).toEqual([]);
        });
    });

    describe('isValidProductData', () => {
        it('should return true for valid data with categories and products', () => {
            const data = {
                categories: [
                    { id: 1, name: 'Coffee', position: 1, outlet_id: 1, created_at: '', updated_at: '' },
                ],
                products: [
                    {
                        id: 'uuid-1',
                        name: 'Espresso',
                        price: 25000,
                        description: 'Strong coffee',
                        image: 'espresso.jpg',
                        isAvailable: true,
                        isPublished: true,
                        isRecommended: true,
                        categoryId: 1,
                    },
                ],
            };

            expect(service.isValidProductData(data)).toBe(true);
        });

        it('should return true for empty arrays', () => {
            const data = {
                categories: [],
                products: [],
            };

            expect(service.isValidProductData(data)).toBe(true);
        });

        it('should return false when categories is not an array', () => {
            const data = {
                categories: null as any,
                products: [],
            };

            expect(service.isValidProductData(data)).toBe(false);
        });

        it('should return false when products is not an array', () => {
            const data = {
                categories: [],
                products: null as any,
            };

            expect(service.isValidProductData(data)).toBe(false);
        });

        it('should return false when both are not arrays', () => {
            const data = {
                categories: {} as any,
                products: {} as any,
            };

            expect(service.isValidProductData(data)).toBe(false);
        });

        it('should return false when categories is undefined', () => {
            const data = {
                categories: undefined as any,
                products: [],
            };

            expect(service.isValidProductData(data)).toBe(false);
        });

        it('should return false when products is undefined', () => {
            const data = {
                categories: [],
                products: undefined as any,
            };

            expect(service.isValidProductData(data)).toBe(false);
        });
    });
});
