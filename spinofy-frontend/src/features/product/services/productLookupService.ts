import type { HomeProduct } from '@/features/outlets/services/outletProductService';

// Dynamic organized products interface
export interface DynamicOrganizedProducts {
    recommendations: HomeProduct[];
    [categoryKey: string]: HomeProduct[];
}

/**
 * Product Lookup Service
 * Handles finding products by ID from organized product data
 */
export class ProductLookupService {
    private static currentProducts: DynamicOrganizedProducts | null = null;

    /**
     * Set the current products data
     */
    static setProducts(products: DynamicOrganizedProducts): void {
        this.currentProducts = products;
    }

    /**
     * Find a product by ID across all categories
     */
    static findProductById(productId: string): HomeProduct | null {
        if (!this.currentProducts) {
            console.warn('No products data available for lookup');
            return null;
        }

        // Search across all product categories dynamically
        const allProducts: HomeProduct[] = [];
        for (const categoryProducts of Object.values(this.currentProducts)) {
            if (Array.isArray(categoryProducts)) {
                allProducts.push(...categoryProducts);
            }
        }

        const product = allProducts.find(p => p.id === productId);

        if (!product) {
            console.warn(`Product not found with ID: ${productId}`);
            return null;
        }

        return product;
    }

    /**
     * Get all products as a flat array
     */
    static getAllProducts(): HomeProduct[] {
        if (!this.currentProducts) {
            return [];
        }

        const allProducts: HomeProduct[] = [];
        for (const categoryProducts of Object.values(this.currentProducts)) {
            if (Array.isArray(categoryProducts)) {
                allProducts.push(...categoryProducts);
            }
        }
        return allProducts;
    }

    /**
     * Find products by category key
     */
    static getProductsByCategory(categoryKey: string): HomeProduct[] {
        if (!this.currentProducts) {
            return [];
        }

        return this.currentProducts[categoryKey] || [];
    }

    /**
     * Clear cached products
     */
    static clear(): void {
        this.currentProducts = null;
    }
}