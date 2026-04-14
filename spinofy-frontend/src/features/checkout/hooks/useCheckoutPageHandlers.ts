import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCheckoutPayment } from '@/features/checkout/hooks/useCheckoutPayment';
import { useBarcodeStore } from '@/features/storefront/stores/useBarcodeStore';
import type { Order } from '@/features/cart/types/Order';
import type { Voucher } from '@/features/vouchers/hooks/useVoucherCalculation';

export interface CheckoutPageHandlers {
    handleCheckoutSubmit: () => void;
    handleAddMoreItems: () => void;
    handleNavigateToVouchers: () => void;
    isLoading: boolean;
}

interface CheckoutPageHandlersProps {
    orderCode: string | undefined;
    currentOrder: Order | undefined;
    outletSlug: string | undefined;
    isCheckoutPaymentLoading: boolean;
    onNavigateToHome: () => void;
    subtotal?: number;
    tax?: number;
    discount?: number;
    finalPrice?: number;
    appliedVoucher?: Voucher | null;
    paymentMethodFee?: number;
    platformFee?: number;
    paymentMethodId?: number;
    unpaidOrder?: Order;
    onUnpaidOrderAttempt?: (order: Order) => void;
    isOrdersLoading?: boolean;
}

/**
 * @param props - Configuration and dependencies
 * @returns Object with all checkout page handlers
 */
export const useCheckoutPageHandlers = (
    props: CheckoutPageHandlersProps
): CheckoutPageHandlers => {
    const {
        orderCode,
        currentOrder,
        outletSlug,
        isCheckoutPaymentLoading,
        onNavigateToHome,
        subtotal = 0,
        tax = 0,
        discount = 0,
        finalPrice = 0,
        appliedVoucher = null,
        paymentMethodFee = 0,
        platformFee = 0,
        paymentMethodId = 1, // Default to QRIS if not provided
        unpaidOrder,
        onUnpaidOrderAttempt,
        isOrdersLoading = false,
    } = props;

    const navigate = useNavigate();
    const { checkoutPayment, isLoading } = useCheckoutPayment();

    const { barcode } = useBarcodeStore();

    /**
     * Validates checkout state and initiates payment
     * Fail-fast validation pattern
     */
    const handleCheckoutSubmit = useCallback(() => {
        if (isCheckoutPaymentLoading || isLoading) return;

        if (isOrdersLoading) {
            toast.info("Mohon tunggu, sedang memeriksa status pesanan...");
            return;
        }

        // Validation 0: Unpaid order exists
        if (unpaidOrder) {
            toast.error("Anda memiliki pesanan yang belum dibayar. Silakan selesaikan pembayaran terlebih dahulu.");
            onUnpaidOrderAttempt?.(unpaidOrder);
            return;
        }

        // Validation 1: Order code exists
        if (!orderCode) {
            toast.info(
                'Order tidak ditemukan. Silakan tambahkan produk ke cart terlebih dahulu.'
            );
            return;
        }

        // Validation 2: Order has products
        if (
            !currentOrder?.order_products ||
            currentOrder.order_products.length === 0
        ) {
            toast.info(
                'Tidak ada produk dalam pesanan. Silakan tambahkan produk ke cart terlebih dahulu.'
            );
            return;
        }

        // Proceed with payment
        try {
            checkoutPayment({
                orderCode: String(orderCode),
                paymentMethodId: paymentMethodId,
                tableNumberId: barcode ? Number(barcode) : null,
                subtotal,
                tax,
                discount,
                finalPrice,
                appliedVoucher,
                paymentMethodFee,
                platformFee,
            });
        } catch (error) {
            console.error('Checkout submission error:', error);
            toast.error('Gagal memproses checkout');
        }
    }, [orderCode, currentOrder, isCheckoutPaymentLoading, isLoading, checkoutPayment, barcode, subtotal, tax, discount, finalPrice, appliedVoucher, paymentMethodFee, platformFee, paymentMethodId, unpaidOrder, onUnpaidOrderAttempt, isOrdersLoading]);

    /**
     * Navigate back to home/menu to add more items
     */
    const handleAddMoreItems = useCallback(() => {
        onNavigateToHome();
    }, [onNavigateToHome]);

    const handleNavigateToVouchers = useCallback(() => {
        if (!outletSlug) {
            navigate('/onboard');
            return;
        }

        navigate(`/${outletSlug}/voucher-checkout`);
    }, [outletSlug, navigate]);

    return {
        handleCheckoutSubmit,
        handleAddMoreItems,
        handleNavigateToVouchers,
        isLoading,
    };
};

export default useCheckoutPageHandlers;
