import { axiosInstance } from "@/lib/axios";
import type { OrderResponse } from "@/features/cart/types/Order";
import { toast } from "sonner";

export class OrderAPI {
    static async getListOrders(outletSlug: string): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.get<OrderResponse>(`/outlet/${outletSlug}/order`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to fetch orders';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || `Failed to fetch order data: ${error}`;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    static async getOrderDetails(outletSlug: string, codeOrder: number): Promise<OrderResponse> {
        try {
            // Include order_products with their variants, related data, and outlet
            const response = await axiosInstance.get<OrderResponse>(`/outlet/${outletSlug}/order/${codeOrder}?include=order_products.order_product_variants.product_attribute_value.product_attribute,order_products.product,customer_point,outlet`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to fetch order details';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || `Failed to fetch order details for: ${outletSlug} with ${error}`;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    static async storeDuplicateOrder(outletSlug: string, payload: { code: string }): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.post<OrderResponse>(`/outlet/${outletSlug}/order`, payload);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to duplicate order';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || error.message || `Failed to duplicate order for: ${outletSlug} with ${error}`;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}