import { useMemo } from 'react';
import type { RawResponse, Order } from '@/features/payment/types/PaymentLog';

interface UseOrderDataNormalizationReturn {
    order: Order | null;
    totalPayment: number;
    paymentData: RawResponse | null;
}

/**
 * Hook for normalizing order data and payment data from multiple response formats
 * @param checkoutData - API response with checkout data
 * @param fallbackOrderData - Fallback order data from navigation state
 * @returns Normalized order data, total payment, order products, and payment data
 */
export const useOrderDataNormalization = (
    checkoutData: any,
    fallbackOrderData?: any
): UseOrderDataNormalizationReturn => {
    return useMemo(() => {
        let order: Order | null = null;

        // Normalize different response formats (DRY: consolidates duplicate logic)
        const orderData_ = checkoutData?.data?.order;

        if (Array.isArray(orderData_) && orderData_.length > 0) {
            // Array response - take first item
            order = orderData_[0] as Order;
        } else if (orderData_ && typeof orderData_ === 'object' && !Array.isArray(orderData_)) {
            // Direct object response
            order = orderData_ as Order;
        } else if (checkoutData?.data?.data?.code) {
            // Nested data.data structure from storeProduct response
            // This might not match Order exactly if it's a different shape, but casting for now
            order = checkoutData.data.data as Order;
        } else if (fallbackOrderData) {
            // Fallback to order data from navigation state
            order = fallbackOrderData as Order;
        }

        // Extract payment data from payment_log
        // Normalization handles both object and string raw_response formats
        const rawResponseCandidate =
            checkoutData?.data?.order?.payment_log?.raw_response ||
            checkoutData?.data?.payment_log?.raw_response ||
            order?.payment_log?.raw_response ||
            null;

        let paymentData: RawResponse | null = null;
        if (rawResponseCandidate) {
            if (typeof rawResponseCandidate === 'string') {
                try {
                    paymentData = JSON.parse(rawResponseCandidate) as RawResponse;
                } catch (err) {
                    // If parse fails, log for debugging and keep null
                    // but do not throw to avoid breaking the UI
                    // eslint-disable-next-line no-console
                    console.error('Failed to parse payment raw_response JSON', err);
                    paymentData = null;
                }
            } else if (typeof rawResponseCandidate === 'object') {
                paymentData = rawResponseCandidate as RawResponse;
            }
        }


        return {
            order,
            totalPayment: order?.total ?? 0,
            paymentData,
        };
    }, [checkoutData, fallbackOrderData]);
};
