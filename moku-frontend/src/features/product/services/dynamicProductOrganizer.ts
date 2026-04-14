import type { Product, Category } from '@/features/product/types/Product';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';

/**
 * Service to organize products by dynamic categories
 */
export class DynamicProductOrganizer {
    /**
     * Transform API product to HomeProduct format
     */
    private static transformProduct(apiProduct: Product): HomeProduct {
        return {
            id: apiProduct.uuid,
            name: apiProduct.name,
            price: Number.parseInt(apiProduct.price, 10),
            description: apiProduct.description,
            image: apiProduct.image_url || '',
            isAvailable: Boolean(apiProduct.is_available),
            isPublished: Boolean(apiProduct.is_published),
            isRecommended: Boolean(apiProduct.is_recommended),
            categoryId: apiProduct.product_category_id,
        };
    }

    /**
     * Organize products by categories dynamically
     */
    static organizeProductsByCategories(
        products: Product[],
        categories: Category[]
    ): { recommendations: HomeProduct[];[categoryKey: string]: HomeProduct[] } {
        const organized: { recommendations: HomeProduct[];[categoryKey: string]: HomeProduct[] } = {
            recommendations: []
        };

        // Initialize each category with empty array
        for (const category of categories) {
            const categoryKey = DynamicProductOrganizer.getCategoryKey(category.name);
            organized[categoryKey] = [];
        }

        // Filter products: only include published products (is_published = 1)
        const publishedProducts = products.filter(p => p.is_published === 1);

        // Transform and organize products
        const transformedProducts = publishedProducts.map(this.transformProduct);

        // Separate recommended products
        const recommendedProducts = transformedProducts.filter(p => p.isRecommended);
        organized.recommendations = recommendedProducts;

        // Organize products by category
        for (const product of transformedProducts) {
            // Find the category for this product
            const category = categories.find(cat => cat.id === product.categoryId);

            if (category) {
                const categoryKey = DynamicProductOrganizer.getCategoryKey(category.name);
                if (organized[categoryKey]) {
                    organized[categoryKey].push(product);
                }
            }
        }

        return organized;
    }

    /**
     * Convert category name to a consistent key format
     */
    static getCategoryKey(categoryName: string): string {
        return categoryName
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^a-z0-9]/g, '');
    }

    /**
     * Get category display name from key
     */
    static getCategoryDisplayName(categoryKey: string, categories: Category[]): string {
        const category = categories.find(cat =>
            DynamicProductOrganizer.getCategoryKey(cat.name) === categoryKey
        );
        return category?.name || categoryKey;
    }

    /**
     * Create section ID for scrolling
     */
    static createSectionId(categoryName: string): string {
        return categoryName
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }
}