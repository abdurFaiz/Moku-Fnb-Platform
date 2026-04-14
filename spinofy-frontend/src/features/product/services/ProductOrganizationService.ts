import type {
    DynamicOrganizedProducts,
    ProductLookupFormat,
    ExtractedProductData,
} from '../types/ProductQuery';
import type { Category } from '@/features/product/types/Product';
import { DynamicProductOrganizer } from '@/features/product/services/dynamicProductOrganizer';

export class ProductOrganizationService {
    private readonly cache: Map<string, DynamicOrganizedProducts> = new Map();

    /**
     * @param data - Extracted product data containing products and categories
     * @returns Organized products grouped by category keys
     */
    organizeProducts(data: ExtractedProductData): DynamicOrganizedProducts {
        const cacheKey = this.createCacheKey(data);

        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey)!;
        }

        const organized = DynamicProductOrganizer.organizeProductsByCategories(
            data.products as any,
            data.categories
        );

        this.cache.set(cacheKey, organized);

        if (this.cache.size > 10) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        return organized;
    }

    /**
     * @param organizedProducts - Organized products by category
     * @param categories - Available categories
     * @returns Product lookup format
     */
    createLookupFormat(
        organizedProducts: DynamicOrganizedProducts,
        categories: Category[]
    ): ProductLookupFormat {
        const lookupFormat: ProductLookupFormat = {
            recommendations: organizedProducts.recommendations || [],
        };

        for (const category of categories) {
            const categoryKey = DynamicProductOrganizer.getCategoryKey(category.name);
            const categoryProducts = organizedProducts[categoryKey] || [];
            lookupFormat[categoryKey] = categoryProducts;
        }

        return lookupFormat;
    }

    /**
     * @param categoryKey - Category key to display
     * @param categories - Available categories
     * @returns Display name for category
     */
    getCategoryDisplayName(categoryKey: string, categories: Category[]): string {
        return DynamicProductOrganizer.getCategoryDisplayName(categoryKey, categories);
    }

    /**
     * @param category - Category name
     * @returns Section ID
     */
    createSectionId(category: string): string {
        return DynamicProductOrganizer.createSectionId(category);
    }

    /**
     * Validates if organized products contain valid data
     *
     * @param products - Organized products
     * @returns True if valid
     */
    isValidOrganizedProducts(products: DynamicOrganizedProducts): boolean {
        return (
            !!products &&
            typeof products === 'object' &&
            Array.isArray(products.recommendations)
        );
    }

    /**
     * Clears the cache
     * Useful for memory management or testing
     */
    clearCache(): void {
        this.cache.clear();
    }

    /**
     * Creates a cache key from extracted product data
     * Uses a simple hash to represent the data
     *
     * @param data - Extracted product data
     * @returns Cache key string
     */
    private createCacheKey(data: ExtractedProductData): string {
        return `${data.products.length}_${data.categories.length}_${data.products
            .map(p => p.id)
            .join(',')}`;
    }
}

export const productOrganizationService = new ProductOrganizationService();
