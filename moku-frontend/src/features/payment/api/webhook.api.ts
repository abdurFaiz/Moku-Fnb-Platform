import { axiosInstance } from "@/lib/axios";
import type { OrderResponse } from "@/features/cart/types/Order";
import { toast } from "sonner";

export class WebhookAPI {
    static async sendWebhookNotification(payload: { code: string }): Promise<OrderResponse> {
        try {
            const response = await axiosInstance.post(`/webhook/payment/handler`, payload);
            if (response.data.status === 'error') {
                const errorMessage = response.data.message || 'Failed to send order, refresh the page';
                toast.info(errorMessage);
            }
            return response.data;
        } catch (error) {
            throw new Error('Failed to send webhook status order: ' + error);
        }
    }
}