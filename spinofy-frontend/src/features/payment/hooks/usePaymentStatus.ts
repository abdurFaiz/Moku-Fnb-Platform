import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import { useCart } from '@/features/cart/hooks/useCart';
import { useQueryCheckout } from '@/features/payment/hooks/api/useQueryCheckout';
import { paymentDataService } from '@/features/payment/services/PaymentDataService';
import { paymentStatusService } from '@/features/payment/services/PaymentStatusService';
import { outletService } from '@/features/outlets/services/OutletService';
import { getErrorMessage, isAppError } from '@/utils/errors';
import { PAYMENT_CACHE_CONFIG, PAYMENT_MESSAGES } from '@/features/payment/constants/paymentConstant';
import type { PaymentOrderResponse } from '@/features/payment/types/PaymentLog';

/**
 * Hook return type
 */
interface UsePaymentStatusReturn {
    checkoutData: PaymentOrderResponse | undefined;
    isLoadingCheckout: boolean;
    checkPaymentStatus: () => void;
    isCheckingStatus: boolean;
}

/**
 * @param orderCode - Order code to check payment status for
 * @returns Object containing checkout data, loading states, and mutation functions
 */
export const usePaymentStatus = (orderCode: string | undefined): UsePaymentStatusReturn => {
    const navigate = useNavigate();
    const outletSlug = useOutletSlug();
    const { clearCart } = useCart();
    const [resolvedSlug, setResolvedSlug] = useState<string | null>(outletSlug ?? null);
    const [slugError, setSlugError] = useState<Error | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (outletSlug) {
            setResolvedSlug(outletSlug);
            setSlugError(null);
            return () => {
                isMounted = false;
            };
        }

        if (!orderCode) {
            return () => {
                isMounted = false;
            };
        }

        (async () => {
            try {
                const slug = await outletService.getFirstOutletSlug();
                if (isMounted) {
                    setResolvedSlug(slug);
                    setSlugError(null);
                }
            } catch (error) {
                if (isMounted) {
                    setSlugError(error as Error);
                    setResolvedSlug(null);
                }
            }
        })();

        return () => {
            isMounted = false;
        };
    }, [outletSlug, orderCode]);

    useEffect(() => {
        if (!slugError) return;
        toast.error(getErrorMessage(slugError));
    }, [slugError]);

    /**
     * Query to fetch initial checkout data
     * Includes barcode and initial order details
     */
    const numericOrderCode = useMemo(() => {
        if (!orderCode) return null;
        paymentStatusService.validateOrderCode(orderCode);
        const parsed = Number(orderCode);
        return Number.isNaN(parsed) ? null : parsed;
    }, [orderCode]);

    const isCheckoutEnabled = Boolean(numericOrderCode !== null && resolvedSlug && !slugError);

    const {
        data: checkoutData,
        isLoading: isCheckoutQueryLoading,
        isFetching: isCheckoutQueryFetching,
    } = useQueryCheckout(resolvedSlug, numericOrderCode, {
        enabled: isCheckoutEnabled,
        staleTime: PAYMENT_CACHE_CONFIG.CHECKOUT_STALE_TIME,
        gcTime: PAYMENT_CACHE_CONFIG.CHECKOUT_GC_TIME,
        refetchInterval: (query) => {
            const data = query.state.data;
            if (data?.data.order.status === 3) return false;
            return 30000;
        },
        refetchOnWindowFocus: false,
        refetchOnMount: true, // Force refetch on mount to get latest status
    });

    const isLoadingCheckout = useMemo(() => {
        if (slugError) return false;
        if (!resolvedSlug && !!orderCode) return true;
        return isCheckoutQueryLoading || isCheckoutQueryFetching;
    }, [slugError, resolvedSlug, orderCode, isCheckoutQueryLoading, isCheckoutQueryFetching]);

    const checkStatusMutation = useMutation({
        mutationFn: async () => {
            // Validate order code
            paymentStatusService.validateOrderCode(orderCode);

            // Use outletSlug from URL
            const slug = resolvedSlug || await outletService.getFirstOutletSlug();

            // Show initial toast notification
            toast.info(PAYMENT_MESSAGES.WEBHOOK_TRIGGER);

            // Check payment status (includes webhook notification)
            const effectiveOrderCode = numericOrderCode ?? Number(orderCode);
            const order = await paymentDataService.checkPaymentStatus(slug, effectiveOrderCode);

            return order;
        },
        onSuccess: (order) => {
            // Process payment status result
            const result = paymentStatusService.processPaymentStatusResult(
                order,
                outletSlug ?? null
            );

            if (result.isCompleted) {
                // Clear cart on successful payment
                clearCart();

                // Navigate to success page with state
                navigate(result.navigationPath, {
                    state: result.navigationState,
                    replace: true,
                });
            } else {
                // Show status message if payment is still processing
                const message = paymentStatusService.getPaymentStatusMessage(order, result.isCompleted);
                if (message) {
                    toast.info(message);
                }
            }
        },
        onError: (error) => {
            // Show error notification with extracted message
            const errorMessage = isAppError(error)
                ? error.message
                : getErrorMessage(error);

            toast.error(
                PAYMENT_MESSAGES.PAYMENT_CHECK_FAILED.replace('{error}', errorMessage)
            );
        },
    });

    return {
        checkoutData,
        isLoadingCheckout,
        checkPaymentStatus: checkStatusMutation.mutate,
        isCheckingStatus: checkStatusMutation.isPending,
    };
};
