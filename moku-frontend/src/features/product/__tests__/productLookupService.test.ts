import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProductLookupService } from '../services/productLookupService';
import type { DynamicOrganizedProducts } from '../services/productLookupService';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';

describe('ProductLookupService', () => {
    const mockProducts: HomeProduct[] = [
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
        {
            id: 'uuid-2',
            name: 'Cappuccino',
            price: 30000,
            description: 'Coffee with milk',
            image: 'cappuccino.jpg',
            isAvailable: true,
            isPublished: true,
            isRecommended: false,
            categoryId: 1,
        },
        {
            id: 'uuid-3',
            name: 'Green Tea',
            price: 20000,
            description: 'Fresh tea',
            image: 'tea.jpg',
            isAvailable: true,
            isPublished: true,
            isRecommended: true,
            categoryId: 2,
        },
    ];

    const mockOrganizedProducts: DynamicOrganizedProducts = {
        recommendations: [mockProducts[0], mockProducts[2]],
        coffee: [mockProducts[0], mockProducts[1]],
        tea: [mockProducts[2]],
    };

    beforeEach(() => {
        ProductLookupService.clear();
    });

    describe('setProducts', () => {
        it('should set products data', () => {
            ProductLookupService.setProducts(mockOrganizedProducts);

            const result = ProductLookupService.getAllProducts();
            expect(result.length).toBeGreaterThan(0);
        });

        it('should overwrite previous products data', () => {
            ProductLookupService.setProducts(mockOrganizedProducts);

            const newProducts: DynamicOrganizedProducts = {
                recommendations: [],
                snacks: [mockProducts[0]],
            };

            ProductLookupService.setProducts(newProducts);

            const result = ProductLookupService.getProductsByCategory('coffee');
            expect(result).toEqual([]);
        });

        it('should handle empty products object', () => {
            ProductLookupService.setProducts({ recommendations: [] });

            const result = ProductLookupService.getAllProducts();
            expect(result).toEqual([]);
        });
    });

    describe('findProductById', () => {
        beforeEach(() => {
            ProductLookupService.setProducts(mockOrganizedProducts);
        });

        it('should find product by ID', () => {
            const result = ProductLookupService.findProductById('uuid-1');

            expect(result).toEqual(mockProducts[0]);
            expect(result?.name).toBe('Espresso');
        });

        it('should find product from different category', () => {
            const result = ProductLookupService.findProductById('uuid-3');

            expect(result).toEqual(mockProducts[2]);
            expect(result?.name).toBe('Green Tea');
        });

        it('should return null when product not found', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const result = ProductLookupService.findProductById('non-existent');

            expect(result).toBeNull();
            expect(consoleWarnSpy).toHaveBeenCalledWith('Product not found with ID: non-existent');

            consoleWarnSpy.mockRestore();
        });

        it('should return null when no products data available', () => {
            ProductLookupService.clear();
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const result = ProductLookupService.findProductById('uuid-1');

            expect(result).toBeNull();
            expect(consoleWarnSpy).toHaveBeenCalledWith('No products data available for lookup');

            consoleWarnSpy.mockRestore();
        });

        it('should handle empty string ID', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const result = ProductLookupService.findProductById('');

            expect(result).toBeNull();
            expect(consoleWarnSpy).toHaveBeenCalledWith('Product not found with ID: ');

            consoleWarnSpy.mockRestore();
        });

        it('should find first matching product if duplicates exist', () => {
            const duplicateProducts: DynamicOrganizedProducts = {
                recommendations: [mockProducts[0]],
                coffee: [mockProducts[0], mockProducts[1]],
            };

            ProductLookupService.setProducts(duplicateProducts);

            const result = ProductLookupService.findProductById('uuid-1');

            expect(result).toEqual(mockProducts[0]);
        });
    });

    describe('getAllProducts', () => {
        it('should return all products as flat array', () => {
            ProductLookupService.setProducts(mockOrganizedProducts);

            const result = ProductLookupService.getAllProducts();

            expect(result).toHaveLength(5); // recommendations(2) + coffee(2) + tea(1)
            expect(result).toContainEqual(mockProducts[0]);
            expect(result).toContainEqual(mockProducts[1]);
            expect(result).toContainEqual(mockProducts[2]);
        });

        it('should return empty array when no products set', () => {
            const result = ProductLookupService.getAllProducts();

            expect(result).toEqual([]);
        });

        it('should handle products with only recommendations', () => {
            ProductLookupService.setProducts({
                recommendations: [mockProducts[0]],
            });

            const result = ProductLookupService.getAllProducts();

            expect(result).toEqual([mockProducts[0]]);
        });

        it('should handle products with empty categories', () => {
            ProductLookupService.setProducts({
                recommendations: [],
                coffee: [],
                tea: [],
            });

            const result = ProductLookupService.getAllProducts();

            expect(result).toEqual([]);
        });

        it('should include products from all categories', () => {
            ProductLookupService.setProducts(mockOrganizedProducts);

            const allProducts = ProductLookupService.getAllProducts();

            // Should have products from recommendations, coffee, and tea
            const hasRecommendations = allProducts.some(p => p.id === 'uuid-1');
            const hasCoffee = allProducts.some(p => p.id === 'uuid-2');
            const hasTea = allProducts.some(p => p.id === 'uuid-3');

            expect(hasRecommendations).toBe(true);
            expect(hasCoffee).toBe(true);
            expect(hasTea).toBe(true);
        });

        it('should handle non-array values in organized products', () => {
            const invalidProducts = {
                recommendations: [mockProducts[0]],
                invalid: 'not an array' as any,
                coffee: [mockProducts[1]],
            };

            ProductLookupService.setProducts(invalidProducts as any);

            const result = ProductLookupService.getAllProducts();

            expect(result).toHaveLength(2); // Only valid arrays
        });
    });

    describe('getProductsByCategory', () => {
        beforeEach(() => {
            ProductLookupService.setProducts(mockOrganizedProducts);
        });

        it('should return products for valid category', () => {
            const result = ProductLookupService.getProductsByCategory('coffee');

            expect(result).toEqual([mockProducts[0], mockProducts[1]]);
        });

        it('should return recommendations', () => {
            const result = ProductLookupService.getProductsByCategory('recommendations');

            expect(result).toEqual([mockProducts[0], mockProducts[2]]);
        });

        it('should return empty array for non-existent category', () => {
            const result = ProductLookupService.getProductsByCategory('non-existent');

            expect(result).toEqual([]);
        });

        it('should return empty array when no products set', () => {
            ProductLookupService.clear();

            const result = ProductLookupService.getProductsByCategory('coffee');

            expect(result).toEqual([]);
        });

        it('should handle empty string category', () => {
            const result = ProductLookupService.getProductsByCategory('');

            expect(result).toEqual([]);
        });

        it('should be case-sensitive for category keys', () => {
            const result = ProductLookupService.getProductsByCategory('Coffee');

            expect(result).toEqual([]); // 'Coffee' !== 'coffee'
        });

        it('should return tea products', () => {
            const result = ProductLookupService.getProductsByCategory('tea');

            expect(result).toEqual([mockProducts[2]]);
        });
    });

    describe('clear', () => {
        it('should clear products data', () => {
            ProductLookupService.setProducts(mockOrganizedProducts);

            ProductLookupService.clear();

            const result = ProductLookupService.getAllProducts();
            expect(result).toEqual([]);
        });

        it('should make findProductById return null after clear', () => {
            ProductLookupService.setProducts(mockOrganizedProducts);
            ProductLookupService.clear();

            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            const result = ProductLookupService.findProductById('uuid-1');

            expect(result).toBeNull();

            consoleWarnSpy.mockRestore();
        });

        it('should allow setting new products after clear', () => {
            ProductLookupService.setProducts(mockOrganizedProducts);
            ProductLookupService.clear();

            const newProducts: DynamicOrganizedProducts = {
                recommendations: [mockProducts[0]],
            };

            ProductLookupService.setProducts(newProducts);

            const result = ProductLookupService.getAllProducts();
            expect(result).toEqual([mockProducts[0]]);
        });

        it('should be safe to call multiple times', () => {
            ProductLookupService.clear();
            ProductLookupService.clear();
            ProductLookupService.clear();

            const result = ProductLookupService.getAllProducts();
            expect(result).toEqual([]);
        });
    });

    describe('edge cases', () => {
        it('should handle products with duplicate IDs across categories', () => {
            const duplicateProducts: DynamicOrganizedProducts = {
                recommendations: [mockProducts[0]],
                coffee: [mockProducts[0]],
                featured: [mockProducts[0]],
            };

            ProductLookupService.setProducts(duplicateProducts);

            const allProducts = ProductLookupService.getAllProducts();
            expect(allProducts).toHaveLength(3); // All duplicates included
        });

        it('should handle very large product sets', () => {
            const largeProductSet: DynamicOrganizedProducts = {
                recommendations: Array(100).fill(mockProducts[0]),
                coffee: Array(100).fill(mockProducts[1]),
            };

            ProductLookupService.setProducts(largeProductSet);

            const result = ProductLookupService.getAllProducts();
            expect(result).toHaveLength(200);
        });

        it('should handle products with special characters in IDs', () => {
            const specialProduct: HomeProduct = {
                ...mockProducts[0],
                id: 'uuid-with-special-chars-!@#$%',
            };

            ProductLookupService.setProducts({
                recommendations: [specialProduct],
            });

            const result = ProductLookupService.findProductById('uuid-with-special-chars-!@#$%');
            expect(result).toEqual(specialProduct);
        });
    });
});
