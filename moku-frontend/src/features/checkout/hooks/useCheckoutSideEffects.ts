import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '@/features/cart/hooks/useCart';
import { useCartStore } from '@/features/cart/stores/cartStore';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import type { CheckoutPaymentResult } from '@/features/checkout/types/Checkout';
import { paymentQueryKeys } from '@/features/payment/hooks/api/useQueryPayment';
import { checkoutQueryKeys } from '@/features/checkout/hooks/useCheckoutPageData';
import {
    CHECKOUT_PAYMENT_TIMINGS,
    CHECKOUT_PAYMENT_ERRORS,
    CHECKOUT_PAYMENT_ROUTES,
} from '@/features/checkout/constants/checkoutPaymentConstant';

/**
 * @returns Object dengan callback handlers untuk success dan error
 */
export const useCheckoutSideEffects = () => {
    const { clearCart } = useCart();
    const { setCheckoutProcessing } = useCartStore();
    const outletSlug = useOutletSlug();
    const queryClient = useQueryClient();

    const clearCheckoutQueries = useCallback(() => {
        if (outletSlug) {
            queryClient.removeQueries({ queryKey: checkoutQueryKeys.combined(outletSlug) });
            queryClient.removeQueries({ queryKey: paymentQueryKeys.list(outletSlug) });
        } else {
            queryClient.removeQueries({ queryKey: checkoutQueryKeys.all });
        }
    }, [outletSlug, queryClient]);

    const handleCheckoutSuccess = useCallback(
        (data: CheckoutPaymentResult, navigate: NavigateFunction) => {
            const { order, orderCode, subtotal, tax, discount, finalPrice, appliedVoucher, paymentMethodFee } = data;

            // Validate required data
            if (!orderCode) {
                setCheckoutProcessing(false);
                toast.error(CHECKOUT_PAYMENT_ERRORS.PAYMENT_FAILED);
                return;
            }

            if (!outletSlug) {
                setCheckoutProcessing(false);
                toast.error(CHECKOUT_PAYMENT_ERRORS.NO_OUTLET);
                return;
            }

            // Set flag sebelum navigate
            setCheckoutProcessing(true);

            // Navigate ke payment page dengan data lengkap
            navigate(CHECKOUT_PAYMENT_ROUTES.PAYMENT(outletSlug), {
                state: {
                    orderCode,
                    orderData: order || undefined,
                    subtotal,
                    tax,
                    discount,
                    finalPrice,
                    appliedVoucher,
                    paymentMethodFee,
                },
            });

            clearCheckoutQueries();

            // Clear cart setelah delay (memastikan Checkout page sudah unmount)
            const cartClearTimer = setTimeout(() => {
                clearCart();
            }, CHECKOUT_PAYMENT_TIMINGS.CART_CLEAR_DELAY);

            // Reset flag setelah delay lebih lanjut
            const flagResetTimer = setTimeout(() => {
                setCheckoutProcessing(false);
            }, CHECKOUT_PAYMENT_TIMINGS.FLAG_RESET_DELAY);

            // Cleanup function untuk clear timers jika component unmount
            return () => {
                clearTimeout(cartClearTimer);
                clearTimeout(flagResetTimer);
            };
        },
        [clearCart, clearCheckoutQueries, setCheckoutProcessing, outletSlug]
    );

    const handleCheckoutError = useCallback((error: Error) => {
        setCheckoutProcessing(false);

        const errorMessage = error?.message || 'Unknown error occurred';
        toast.error(CHECKOUT_PAYMENT_ERRORS.GENERIC_ERROR(errorMessage));
    }, [setCheckoutProcessing]);

    return {
        handleCheckoutSuccess,
        handleCheckoutError,
    };
};

export default useCheckoutSideEffects;
