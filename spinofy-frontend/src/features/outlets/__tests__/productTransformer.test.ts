import { describe, it, expect } from 'vitest';
import { ProductTransformer, createProductTransformer } from '../services/productTransformer';
import { mockProduct } from './mockData';
import type { Product } from '../types/Outlet';

describe('ProductTransformer', () => {
    const baseUrl = 'http://localhost:8000';
    const transformer = new ProductTransformer({ baseUrl });

    describe('transform', () => {
        it('should transform API product to HomeProduct correctly', () => {
            const result = transformer.transform(mockProduct);

            expect(result).toEqual({
                id: mockProduct.uuid,
                name: mockProduct.name,
                price: 50000,
                description: mockProduct.description,
                image: `${baseUrl}/storage/${mockProduct.image}`,
                isAvailable: true,
                isPublished: true,
                isRecommended: true,
                categoryId: mockProduct.product_category_id,
            });
        });

        it('should handle product with is_available = 0', () => {
            const unavailableProduct: Product = {
                ...mockProduct,
                is_available: 0,
            };

            const result = transformer.transform(unavailableProduct);

            expect(result.isAvailable).toBe(false);
        });

        it('should handle product with is_published = 0', () => {
            const unpublishedProduct: Product = {
                ...mockProduct,
                is_published: 0,
            };

            const result = transformer.transform(unpublishedProduct);

            expect(result.isPublished).toBe(false);
        });

        it('should handle product with is_recommended = 0', () => {
            const notRecommendedProduct: Product = {
                ...mockProduct,
                is_recommended: 0,
            };

            const result = transformer.transform(notRecommendedProduct);

            expect(result.isRecommended).toBe(false);
        });

        it('should handle empty image path', () => {
            const productWithoutImage: Product = {
                ...mockProduct,
                image: '',
            };

            const result = transformer.transform(productWithoutImage);

            expect(result.image).toBe('');
        });

        it('should handle full URL image path', () => {
            const fullImageUrl = 'https://cdn.example.com/image.jpg';
            const productWithFullUrl: Product = {
                ...mockProduct,
                image: fullImageUrl,
            };

            const result = transformer.transform(productWithFullUrl);

            expect(result.image).toBe(fullImageUrl);
        });

        it('should handle http:// URL image path', () => {
            const httpImageUrl = 'http://cdn.example.com/image.jpg';
            const productWithHttpUrl: Product = {
                ...mockProduct,
                image: httpImageUrl,
            };

            const result = transformer.transform(productWithHttpUrl);

            expect(result.image).toBe(httpImageUrl);
        });

        it('should parse price string to number correctly', () => {
            const productWithDifferentPrice: Product = {
                ...mockProduct,
                price: '125000',
            };

            const result = transformer.transform(productWithDifferentPrice);

            expect(result.price).toBe(125000);
        });

        it('should handle invalid price string', () => {
            const productWithInvalidPrice: Product = {
                ...mockProduct,
                price: 'invalid',
            };

            const result = transformer.transform(productWithInvalidPrice);

            expect(result.price).toBe(0);
        });

        it('should handle zero price', () => {
            const productWithZeroPrice: Product = {
                ...mockProduct,
                price: '0',
            };

            const result = transformer.transform(productWithZeroPrice);

            expect(result.price).toBe(0);
        });

        it('should handle negative price', () => {
            const productWithNegativePrice: Product = {
                ...mockProduct,
                price: '-1000',
            };

            const result = transformer.transform(productWithNegativePrice);

            expect(result.price).toBe(-1000);
        });

        it('should handle very large price', () => {
            const productWithLargePrice: Product = {
                ...mockProduct,
                price: '999999999',
            };

            const result = transformer.transform(productWithLargePrice);

            expect(result.price).toBe(999999999);
        });

        it('should handle empty description', () => {
            const productWithoutDescription: Product = {
                ...mockProduct,
                description: '',
            };

            const result = transformer.transform(productWithoutDescription);

            expect(result.description).toBe('');
        });
    });

    describe('transformMany', () => {
        it('should transform multiple products correctly', () => {
            const products: Product[] = [
                mockProduct,
                { ...mockProduct, id: 2, uuid: 'product-uuid-2', name: 'Product 2' },
                { ...mockProduct, id: 3, uuid: 'product-uuid-3', name: 'Product 3' },
            ];

            const result = transformer.transformMany(products);

            expect(result).toHaveLength(3);
            expect(result[0].name).toBe('Test Product');
            expect(result[1].name).toBe('Product 2');
            expect(result[2].name).toBe('Product 3');
        });

        it('should handle empty array', () => {
            const result = transformer.transformMany([]);

            expect(result).toEqual([]);
        });

        it('should handle single product array', () => {
            const result = transformer.transformMany([mockProduct]);

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(mockProduct.uuid);
        });

        it('should transform all products independently', () => {
            const products: Product[] = [
                { ...mockProduct, is_available: 1 },
                { ...mockProduct, id: 2, uuid: 'product-uuid-2', is_available: 0 },
            ];

            const result = transformer.transformMany(products);

            expect(result[0].isAvailable).toBe(true);
            expect(result[1].isAvailable).toBe(false);
        });
    });

    describe('Image URL Building', () => {
        it('should build correct storage URL for relative path', () => {
            const result = transformer.transform(mockProduct);

            expect(result.image).toBe(`${baseUrl}/storage/${mockProduct.image}`);
        });

        it('should not modify https:// URLs', () => {
            const httpsUrl = 'https://example.com/image.jpg';
            const product: Product = {
                ...mockProduct,
                image: httpsUrl,
            };

            const result = transformer.transform(product);

            expect(result.image).toBe(httpsUrl);
        });

        it('should not modify http:// URLs', () => {
            const httpUrl = 'http://example.com/image.jpg';
            const product: Product = {
                ...mockProduct,
                image: httpUrl,
            };

            const result = transformer.transform(product);

            expect(result.image).toBe(httpUrl);
        });

        it('should handle path with leading slash', () => {
            const product: Product = {
                ...mockProduct,
                image: '/products/test.jpg',
            };

            const result = transformer.transform(product);

            expect(result.image).toBe(`${baseUrl}/storage/products/test.jpg`);
        });

        it('should handle path with subdirectories', () => {
            const product: Product = {
                ...mockProduct,
                image: 'products/category/subcategory/test.jpg',
            };

            const result = transformer.transform(product);

            expect(result.image).toBe(`${baseUrl}/storage/products/category/subcategory/test.jpg`);
        });
    });

    describe('createProductTransformer', () => {
        it('should create transformer with default configuration', () => {
            const transformer = createProductTransformer();

            expect(transformer).toBeInstanceOf(ProductTransformer);
        });

        it('should use VITE_API_URL from environment', () => {
            const originalEnv = import.meta.env.VITE_API_URL;
            import.meta.env.VITE_API_URL = 'http://test-api.com/api';

            const transformer = createProductTransformer();
            const result = transformer.transform(mockProduct);

            expect(result.image).toContain('http://test-api.com');

            import.meta.env.VITE_API_URL = originalEnv;
        });

        it('should fallback to localhost when VITE_API_URL is not set', () => {
            const originalEnv = import.meta.env.VITE_API_URL;
            import.meta.env.VITE_API_URL = undefined;

            const transformer = createProductTransformer();
            const result = transformer.transform(mockProduct);

            expect(result.image).toContain('http://localhost:8000');

            import.meta.env.VITE_API_URL = originalEnv;
        });
    });

    describe('Edge Cases', () => {
        it('should handle product with all optional fields missing', () => {
            const minimalProduct: Product = {
                id: 1,
                uuid: 'uuid-1',
                name: 'Minimal Product',
                price: '0',
                description: '',
                is_available: 0,
                is_published: 0,
                is_recommended: 0,
                image: '',
                product_category_id: 0,
                outlet_id: 1,
                created_at: '',
                updated_at: '',
            };

            const result = transformer.transform(minimalProduct);

            expect(result).toEqual({
                id: 'uuid-1',
                name: 'Minimal Product',
                price: 0,
                description: '',
                image: '',
                isAvailable: false,
                isPublished: false,
                isRecommended: false,
                categoryId: 0,
            });
        });

        it('should handle product with special characters in name', () => {
            const product: Product = {
                ...mockProduct,
                name: 'Café Latté & Espresso™',
            };

            const result = transformer.transform(product);

            expect(result.name).toBe('Café Latté & Espresso™');
        });

        it('should handle product with very long description', () => {
            const longDescription = 'A'.repeat(1000);
            const product: Product = {
                ...mockProduct,
                description: longDescription,
            };

            const result = transformer.transform(product);

            expect(result.description).toBe(longDescription);
        });
    });
});
