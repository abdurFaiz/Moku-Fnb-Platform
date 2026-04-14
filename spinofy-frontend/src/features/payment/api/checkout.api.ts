import { axiosInstance } from "@/lib/axios";
import type { PaymentOrderResponse } from "@/features/payment/types/PaymentLog";
import { toast } from "sonner";

export class CheckoutAPI {
    static async getDataCheckoutOrders(outletSlug: string, codeOrder: number): Promise<PaymentOrderResponse> {
        try {
            const response = await axiosInstance.get<PaymentOrderResponse>(`/outlet/${outletSlug}/checkout/${codeOrder}?include=outlet`);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to get checkout data, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error(`Failed to fetch checkout data: ${error}`);
        }
    }
}