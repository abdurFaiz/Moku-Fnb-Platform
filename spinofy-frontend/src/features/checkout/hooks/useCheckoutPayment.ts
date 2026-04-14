import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import CheckoutPaymentService from '@/features/checkout/services/checkoutPaymentService';
import { useCheckoutSideEffects } from '@/features/checkout/hooks/useCheckoutSideEffects';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import type { CheckoutPaymentParams, CheckoutPaymentResult } from '@/features/checkout/types/Checkout';

/**
 * @returns Object dengan checkout payment mutation dan state
 */
export const useCheckoutPayment = () => {
    const navigate = useNavigate();
    const outletSlug = useOutletSlug();
    const { handleCheckoutSuccess, handleCheckoutError } = useCheckoutSideEffects();

    const checkoutMutation = useMutation<
        CheckoutPaymentResult,
        Error,
        CheckoutPaymentParams
    >({
        mutationFn: async ({ orderCode, paymentMethodId, tableNumberId, subtotal, tax, discount, finalPrice, appliedVoucher, paymentMethodFee, platformFee }: CheckoutPaymentParams) => {
            return CheckoutPaymentService.processCheckout(
                outletSlug ?? null,
                orderCode,
                paymentMethodId,
                tableNumberId,
                {
                    subtotal,
                    tax,
                    discount,
                    finalPrice,
                    appliedVoucher,
                    paymentMethodFee,
                    platformFee,
                }
            );
        },
        onSuccess: (data: CheckoutPaymentResult) => {
            handleCheckoutSuccess(data, navigate);
        },
        onError: (error: Error) => {
            handleCheckoutError(error);
        },
    });

    return {
        checkoutPayment: checkoutMutation.mutate,
        isLoading: checkoutMutation.isPending,
        isSuccess: checkoutMutation.isSuccess,
        error: checkoutMutation.error,
    };
};
