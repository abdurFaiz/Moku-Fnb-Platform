import { OrderAPI } from '@/features/transaction/api/order.api';
import { WebhookAPI } from '@/features/payment/api/webhook.api';
import type {
    Order,
    WebhookNotificationPayload,
} from '@/features/payment/types/PaymentLog';
import { WebhookError, OrderError } from '@/utils/errors';
import {
    extractOrderFromResponse,
    delay,
} from '@/features/payment/utils/responseTransformers';
import {
    PAYMENT_CACHE_CONFIG,
} from '@/features/payment/constants/paymentConstant';

export class PaymentDataService {
    /**
     * @param payload - Webhook notification payload
     * @returns Promise resolving to void (errors are logged but don't stop execution)
     */
    async sendPaymentStatusWebhook(
        payload: WebhookNotificationPayload
    ): Promise<void> {
        try {
            await WebhookAPI.sendWebhookNotification(payload);
            // Wait for webhook to process
            await delay(PAYMENT_CACHE_CONFIG.WEBHOOK_PROCESSING_TIME);
        } catch (error) {
            // Log webhook error but don't throw - webhook is optional
            console.warn('Webhook notification failed:', error);
            throw new WebhookError(
                'Failed to send webhook notification',
                'WEBHOOK_SEND_ERROR',
                { payload, originalError: error }
            );
        }
    }

    /**
     * @param outletSlug - Outlet slug
     * @param orderCode - Order code as number
     * @throws OrderError when order details cannot be fetched
     * @returns Promise resolving to order object
     */
    async fetchOrderDetails(
        outletSlug: string,
        orderCode: number
    ): Promise<Order> {
        try {
            const response = await OrderAPI.getOrderDetails(outletSlug, orderCode);
            const order = extractOrderFromResponse(response);

            if (!order) {
                throw new OrderError(
                    'Order not found in response',
                    'ORDER_NOT_FOUND_IN_RESPONSE',
                    { outletSlug, orderCode }
                );
            }

            return order;
        } catch (error) {
            if (error instanceof OrderError) {
                throw error;
            }

            throw new OrderError(
                'Failed to fetch order details',
                'ORDER_FETCH_ERROR',
                { outletSlug, orderCode, originalError: error }
            );
        }
    }

    /**
     * @param outletSlug - Outlet slug
     * @param orderCode - Order code
     * @returns Promise resolving to updated order object
     */
    async checkPaymentStatus(
        outletSlug: string,
        orderCode: number
    ): Promise<Order> {
        // Step 1: Try to send webhook notification (optional - errors are caught)
        try {
            await this.sendPaymentStatusWebhook({ code: String(orderCode) });
        } catch (error) {
            // Log but continue - webhook is optional
            console.warn('Webhook notification skipped:', error);
        }

        // Step 2: Fetch updated order details
        const order = await this.fetchOrderDetails(outletSlug, orderCode);

        return order;
    }
}

export const paymentDataService = new PaymentDataService();
