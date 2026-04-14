import { axiosInstance } from '@/lib/axios';
import type { OrderResponse, StoreOrderPayload, StoreProductResponse } from '@/features/cart/types/Order';
import { toast } from 'sonner';
import type { CheckoutRequestPayload } from '../types/Checkout';

export class PaymentAPI {
    static async getListPayment(outletSlug: string): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.get<OrderResponse>(`/outlet/${outletSlug}/payment`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get payment information, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch outlets information: ' + error);
        }
    }
    static async updateStatusPayment(outletSlug: string, codeOrder: string, payload: { method_id: number, table_number_id?: number }): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.put<OrderResponse>(`/outlet/${outletSlug}/payment/${codeOrder}`, payload);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to update order status, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update order status for: ${outletSlug} with ${error}`);
        }
    }

    static async storeProduct(outletSlug: string, payload: StoreOrderPayload): Promise<StoreProductResponse> {
        try {
            const response = await axiosInstance.post<StoreProductResponse>(`/outlet/${outletSlug}/payment/product`, payload);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to post order product, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to post order product for: ${outletSlug} with ${error}`);
        }
    }

    static async storeQuantityProduct(
        outletSlug: string,
        codeOrder: string,
        payload: { order_product_ids: number[]; quantities: number[] }
    ): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.post<OrderResponse>(
                `/outlet/${outletSlug}/payment/${codeOrder}/store`,
                payload
            );
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to post order product, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to post order product for: ${outletSlug} with ${error}`);
        }
    }

    static async updateOrderProduct(outletSlug: string, orderProductId: number, payload: StoreOrderPayload): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.put<OrderResponse>(`/outlet/${outletSlug}/payment/product/${orderProductId}`, payload);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to update order product, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update payment for: ${outletSlug} with ${error}`);
        }
    }

    static async updateQuantityPaymentProduct(outletSlug: string, orderProductId: number, payload: {
        "quantity": number,
    }): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.put<OrderResponse>(`/outlet/${outletSlug}/payment/product/${orderProductId}/quantity`, payload);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to update quantity item, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to update quantity item for: ${outletSlug} with ${error}`);
        }
    }

    static async deleteOrder(outletSlug: string, codeOrder: string): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.delete<OrderResponse>(`/outlet/${outletSlug}/payment/${codeOrder}`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to delete order, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete order for: ${outletSlug} with ${error}`);
        }
    }

    static async deleteProduct(outletSlug: string, orderProductId: number): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.delete<OrderResponse>(`/outlet/${outletSlug}/payment/product/${orderProductId}`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to delete order product, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete order product for: ${outletSlug} with ${error}`);
        }
    }
    static async useVoucher(outletSlug: string, codeVoucher: string): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.put<OrderResponse>(`/outlet/${outletSlug}/payment/${codeVoucher}/voucher`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to use voucher, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to use voucher for: ${outletSlug} with ${error}`);
        }
    }

    static async deleteUseVoucher(outletSlug: string, codeOrder: string): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.delete<OrderResponse>(`/outlet/${outletSlug}/payment/${codeOrder}/voucher`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to delete use voucher, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to delete use voucher for: ${outletSlug} with ${error}`);
        }
    }

    static async useInputCodeVoucher(outletSlug: string, payload: { voucher_code: string }): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.put<OrderResponse>(`/outlet/${outletSlug}/payment/voucher/input-code`, payload);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to use voucher, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to use voucher for: ${outletSlug} with ${error}`);
        }
    }

    static async storeCheckoutRequest(outletSlug: string, payload: CheckoutRequestPayload): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.post<OrderResponse>(`/outlet/${outletSlug}/payment-all`, payload);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to post checkout request, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to post checkout request for: ${outletSlug} with ${error}`);
        }
    }
}

export default PaymentAPI;