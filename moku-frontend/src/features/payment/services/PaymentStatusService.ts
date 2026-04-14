
import type { Order, PaymentStatusResult, PaymentSuccessState } from '@/features/payment/types/PaymentLog';
import { PaymentError } from '@/utils/errors';
import { getOutletSlug, interpolateMessage } from '@/features/payment/utils/responseTransformers';
import {
    PAYMENT_MESSAGES,
    PAYMENT_ROUTES,
    ORDER_COMPLETION_STATUS_THRESHOLD,
    PAYMENT_ERRORS as ERROR_MESSAGES,
} from '@/features/payment/constants/paymentConstant';

export class PaymentStatusService {
    /**
     * Checks if an order is completed based on status threshold
     *
     * @param order - Order object to check
     * @returns True if order is completed
     */
    isOrderCompleted(order: Order | null): boolean {
        if (!order) {
            return false;
        }

        return order.status >= ORDER_COMPLETION_STATUS_THRESHOLD;
    }

    /**
     * Determines navigation path based on order state
     *
     * @param order - Order object
     * @param fallbackOutletSlug - Fallback outlet slug if not in order
     * @returns Object containing navigation path and state
     */
    determineNavigationPath(
        order: Order,
        fallbackOutletSlug: string | null
    ): {
        path: string;
        state: PaymentSuccessState;
    } {
        const outletSlug = getOutletSlug(order, fallbackOutletSlug);

        if (outletSlug) {
            return {
                path: `/${outletSlug}/${PAYMENT_ROUTES.PAYMENT_SUCCESS}`,
                state: {
                    orderCode: order.code,
                    status: order.status.toString() || '-',
                    // points: order.customer_point,
                },
            };
        }

        return {
            path: PAYMENT_ROUTES.TRANSACTIONS,
            state: {
                orderCode: order.code,
                status: order.status.toString() || '-',
                // points: order.customer_point,
                orderCompleted: true,
            },
        };
    }

    /**
     * @param order - Order object
     * @param isCompleted - Whether order is completed
     * @returns Message string or null
     */
    getPaymentStatusMessage(order: Order | null, isCompleted: boolean): string | null {
        if (!order) {
            return PAYMENT_MESSAGES.ORDER_NOT_FOUND;
        }

        if (isCompleted) {
            return null; // No message needed for completed orders
        }

        return interpolateMessage(
            PAYMENT_MESSAGES.PAYMENT_PROCESSING,
            { status: order.status.toString() || '-' }
        );
    }

    /**
     * Validates order code
     *
     * @param orderCode - Order code to validate
     * @throws PaymentError if order code is invalid
     */
    validateOrderCode(orderCode: string | undefined): void {
        if (!orderCode) {
            throw new PaymentError(
                ERROR_MESSAGES.ORDER_CODE_REQUIRED,
                'INVALID_ORDER_CODE'
            );
        }
    }

    /**
     * @param order - Order object from API
     * @param fallbackOutletSlug - Fallback outlet slug
     * @returns PaymentStatusResult with all necessary information
     */
    processPaymentStatusResult(
        order: Order,
        fallbackOutletSlug: string | null
    ): PaymentStatusResult {
        const isCompleted = this.isOrderCompleted(order);
        const { path, state } = this.determineNavigationPath(order, fallbackOutletSlug);

        return {
            order,
            isCompleted,
            shouldNavigate: isCompleted,
            navigationPath: path,
            navigationState: state,
        };
    }
}

/**
 * Singleton instance of PaymentStatusService
 */
export const paymentStatusService = new PaymentStatusService();
