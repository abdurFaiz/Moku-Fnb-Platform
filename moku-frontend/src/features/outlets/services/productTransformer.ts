import type { Product as OutletProduct } from '@/features/outlets/types/Outlet';

export interface HomeProduct {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    isAvailable: boolean;
    isPublished: boolean;
    isRecommended?: boolean;
    categoryId?: number;
}

export interface ImageUrlConfig {
    baseUrl: string;
}

export class ProductTransformer {
    private readonly imageUrlConfig: ImageUrlConfig;

    constructor(imageUrlConfig: ImageUrlConfig) {
        this.imageUrlConfig = imageUrlConfig;
    }

    transform(apiProduct: OutletProduct): HomeProduct {
        return {
            id: apiProduct.uuid,
            name: apiProduct.name,
            price: this.parsePrice(apiProduct.price),
            description: apiProduct.description,
            image: this.buildImageUrl(apiProduct.image),
            isAvailable: Boolean(apiProduct.is_available),
            isPublished: Boolean(apiProduct.is_published),
            isRecommended: Boolean(apiProduct.is_recommended),
            categoryId: apiProduct.product_category_id,
        };
    }

    /**
     * Transform multiple products at once
     */
    transformMany(apiProducts: OutletProduct[]): HomeProduct[] {
        return apiProducts.map((product) => this.transform(product));
    }

    /**
     * Build full image URL from relative path
     */
    private buildImageUrl(imagePath: string): string {
        if (!imagePath) return '';

        if (this.isFullUrl(imagePath)) {
            return imagePath;
        }

        // Remove leading slash to avoid double slashes
        const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

        return `${this.imageUrlConfig.baseUrl}/storage/${cleanPath}`;
    }

    /**
     * Check if the given string is a full URL
     */
    private isFullUrl(url: string): boolean {
        return url.startsWith('http://') || url.startsWith('https://');
    }

    /**
     * Parse price string to number
     */
    private parsePrice(price: string): number {
        const parsed = Number.parseInt(price, 10);
        return Number.isNaN(parsed) ? 0 : parsed;
    }


}

/**
 * Factory function to create ProductTransformer with default configuration
 */
export function createProductTransformer(): ProductTransformer {
    const apiUrl = import.meta.env.VITE_API_URL;
    const baseUrl = (apiUrl && apiUrl !== 'undefined') ? apiUrl.replace('/api', '') : 'http://localhost:8000';

    return new ProductTransformer({ baseUrl });
}
