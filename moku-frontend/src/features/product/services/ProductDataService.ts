import ProductAPI from '@/features/product/api/product.api';
import type { ProductsApiResponse, ExtractedProductData } from '@/features/product/types/ProductQuery';
import type { Category } from '@/features/product/types/Product';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';
import { PRODUCT_ERROR_MESSAGES } from '@/features/product/constant/productQueryConstant';

export class ProductDataService {
    /**
     * Fetches products for a specific outlet
     *
     * @param outletSlug - Outlet slug identifier
     * @throws Error when products cannot be fetched or outlet slug is invalid
     * @returns Promise resolving to products API response
     */
    async fetchProducts(outletSlug: string): Promise<ProductsApiResponse> {
        if (!outletSlug || outletSlug.trim().length === 0) {
            throw new Error(PRODUCT_ERROR_MESSAGES.NO_OUTLET_SLUG);
        }

        try {
            const response = await ProductAPI.getAllProduct(outletSlug);
            return response as unknown as ProductsApiResponse;
        } catch (error) {
            console.error(`Failed to fetch products for outlet ${outletSlug}:`, error);
            throw new Error(PRODUCT_ERROR_MESSAGES.PRODUCTS_FETCH_FAILED);
        }
    }

    /**
     * Extracts and validates product data from API response
     * Handles multiple response structures for robustness
     *
     * @param response - Products API response
     * @returns Extracted categories and products
     */
    extractProductData(response: ProductsApiResponse | undefined): ExtractedProductData {
        if (!response?.data || !Array.isArray(response.data)) {
            return {
                categories: [],
                products: [],
            };
        }

        const apiData = response.data[0];

        return {
            categories: (apiData?.categories as Category[]) || [],
            products: (apiData?.products as HomeProduct[]) || [],
        };
    }

    /**
     * Validates if the extracted product data is valid
     *
     * @param data - Extracted product data
     * @returns True if data is valid
     */
    isValidProductData(data: ExtractedProductData): boolean {
        return Array.isArray(data.categories) && Array.isArray(data.products);
    }
}

export const productDataService = new ProductDataService();
