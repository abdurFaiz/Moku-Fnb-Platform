import { axiosInstance } from '@/lib/axios';
import type { ProductDetailResponse, ProductRecommendationResponse } from '@/features/product/types/DetailProduct';
import type { ProductResponse } from '@/features/product/types/Product';
import { toast } from 'sonner';

export class ProductAPI {
    static async getAllProduct(outletSlug: string): Promise<ProductResponse> {
        try {
            const response = await axiosInstance.get<ProductResponse>(`/outlet/${outletSlug}/products`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get products information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch products information: ' + error);
        }
    }

    static async getProduct(outletSlug: string, productUuid: string): Promise<ProductDetailResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/products/${productUuid}`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get product information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch product ${productUuid} information for: ${outletSlug} with ${error}`);
        }
    }

    static async getBestSellingProduct(outletSlug: string): Promise<ProductDetailResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/products/best-selling`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get product information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch product  information for: ${outletSlug} with ${error}`);
        }
    }

    static async getMostLikedProduct(outletSlug: string): Promise<ProductDetailResponse> {
        try {
            const response = await axiosInstance.get(`/outlet/${outletSlug}/products/most-liked`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get product information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch most liked product information for: ${outletSlug} with ${error}`);
        }
    }

    static async getRecommendationsProduct(outletSlug: string, product_uuids: string[]): Promise<ProductRecommendationResponse> {
        try {
            // Build query string manually to ensure proper array format for Laravel
            const queryString = product_uuids.map(uuid => `product_uuids[]=${encodeURIComponent(uuid)}`).join('&');
            const response = await axiosInstance.get<ProductRecommendationResponse>(
                `/outlet/${outletSlug}/products/recommendations?${queryString}`
            );
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get product recommendations, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch product recommendations for: ${outletSlug} with ${error}`);
        }
    }


}

export default ProductAPI;
