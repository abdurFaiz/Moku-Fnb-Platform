import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useQueryCheckout, checkoutQueryKeys } from '@/features/payment/hooks/api/useQueryCheckout';
import { orderQueryKeys } from '@/features/transaction/hooks/api/useQueryOrder';
import { paymentDataService } from '@/features/payment/services/PaymentDataService';
import { paymentStatusService } from '@/features/payment/services/PaymentStatusService';
import { toast } from 'sonner';
import { useCart } from '@/features/cart/hooks/useCart';
import HeaderBar from '@/components/HeaderBar';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { SkeletonPaymentPage } from '@/components/skeletons/SkeletonComponents';
import { PaymentErrorBoundary } from '@/features/payment/components/PaymentErrorBoundary';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import { useScrollToTop } from '@/hooks/shared/useScrollToTop';
import { useQueryOrderDetail } from '@/features/transaction/hooks/api/useQueryOrder';
import { useBarcodeDownload } from '@/features/payment/hooks/useBarcodeDownload';
import { useOrderDataNormalization } from '@/features/payment/hooks/useOrderDataNormalization';
import { PaymentBarcode } from '@/features/payment/components/PaymentBarcode';
import { OrderItemsDisplay } from '@/features/checkout/components/OrderItemsDisplay';
import { PaymentTotalSection } from '@/features/payment/components/PaymentTotalSection';
import { PaymentFeeBreakdown } from '@/features/payment/components/PaymentFeeBreakdown';
import { PaymentActionButtons } from '@/features/payment/components/PaymentActionButtons';
import { PaymentInstructionsSection } from '@/features/payment/components/PaymentInstructionsSection';
import CountdownTimer from '@/features/payment/components/CountdownTimer';
import { differenceInSeconds, parseISO } from 'date-fns';
import { PaymentAPI } from '@/features/checkout/api/payment.api';
import { usePaymentWebSocket } from '@/features/payment/hooks/usePaymentWebSocket';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';

export default function Payment() {
    // Navigation
    const { navigateToTransaction, outletSlug } = useOutletNavigation();
    const location = useLocation();
    const orderCode = location.state?.orderCode;
    // Fallback to localStorage's currentOrderCode when navigation state does not provide it
    const storedOrderCode = typeof window !== 'undefined' ? localStorage.getItem('currentOrderCode') : null;
    const activeOrderCode = orderCode ?? storedOrderCode ?? undefined;
    // Order code used for local-only render (localOrderCode is computed from localStoredOrder below)
    const orderData = location.state?.orderData;
    const paymentMethodFee = location.state?.paymentMethodFee || 0;

    // Get outlet ID for WebSocket
    const currentOutlet = useOutletStore((state) => state.currentOutlet);

    // Scroll to top on mount
    useScrollToTop();

    const queryClient = useQueryClient();
    const navigate = useNavigate();

    useEffect(() => {
        if (outletSlug) {
            // Invalidate payment list and checkout details to ensure we fetch fresh data
            queryClient.invalidateQueries({ queryKey: ['payment'] });
            if (activeOrderCode) {
                queryClient.invalidateQueries({ queryKey: ['checkout', activeOrderCode, outletSlug] });
                queryClient.invalidateQueries({ queryKey: ['orders', outletSlug, activeOrderCode] });
            }
        }
    }, [queryClient, activeOrderCode, outletSlug]);

    // Payment data from API (checkout & order detail)
    const { data: checkoutData, isLoading: isLoadingCheckout } = useQueryCheckout(
        outletSlug,
        activeOrderCode ? Number(activeOrderCode) : undefined,
        {
            enabled: !!(outletSlug && activeOrderCode),
            staleTime: 1000 * 60,
        }
    );

    // Prefer fetching order detail (transaction API) when we have an order code — this gives a more stable 'order' object
    const { data: orderDetailData, isLoading: isLoadingOrderDetail } = useQueryOrderDetail(
        outletSlug,
        activeOrderCode ? Number(activeOrderCode) : undefined,
        {
            enabled: !!(outletSlug && activeOrderCode),
            staleTime: 1000 * 60 * 1,
        }
    );

    const getOrderFromResponse = (resp: any) => {
        const firstOrderItem = resp?.data?.order;
        return Array.isArray(firstOrderItem) ? firstOrderItem[0] : firstOrderItem;
    };

    const orderDetailHasPaymentLog = !!getOrderFromResponse(orderDetailData)?.payment_log;

    const checkoutHasPaymentLog = !!getOrderFromResponse(checkoutData)?.payment_log;

    const sourceForNormalization = orderDetailHasPaymentLog
        ? orderDetailData
        : checkoutHasPaymentLog
            ? checkoutData
            : orderDetailData ?? checkoutData;

    // Order data normalization (handles multiple response formats)
    const { order, paymentData } = useOrderDataNormalization(sourceForNormalization, orderData);

    // Determine if payment is completed based on order status (3 = paid)
    const isPaid = order?.status === 3;

    // We'll call checkPaymentStatus when isPaid, move the effect to after checkPaymentStatus is defined

    // Derived payment data (handle cases where `raw_response` is stored as string)
    let effectivePaymentData = paymentData;
    if (!effectivePaymentData && order?.payment_log?.raw_response) {
        const rawPaymentResponse = order.payment_log.raw_response;
        if (typeof rawPaymentResponse === 'string') {
            try {
                effectivePaymentData = JSON.parse(rawPaymentResponse);
            } catch (err) {
                // ignore parsing error
            }
        } else {
            effectivePaymentData = rawPaymentResponse;
        }
    }

    // Use payment data total if available, otherwise fall back to state or normalized total
    const displayTotal = (effectivePaymentData?.Data?.Total ? Number(effectivePaymentData.Data.Total) : order?.total ?? 0);

    // Barcode download handler
    const { handleDownloadBarcode, isDownloading = false } = useBarcodeDownload({
        barcode: effectivePaymentData?.Data?.QrImage,
        orderCode,
    });

    // Calculate remaining time for countdown
    const expiredTime = effectivePaymentData?.Data?.Expired ?? paymentData?.Data?.Expired;
    const remainingMinutes = expiredTime
        ? Math.max(0, differenceInSeconds(parseISO(expiredTime), new Date()) / 60)
        : 0;

    // If we don't have orderCode but we have order id, try to find the code by polling the payment list
    useEffect(() => {
        let isMounted = true;
        const tryFindCode = async () => {
            if (orderCode || !outletSlug || !order?.id) return;

            const maxRetries = 6;
            const delayMs = 1000;
            for (let i = 0; i < maxRetries && isMounted; i++) {
                try {
                    const list = await PaymentAPI.getListPayment(outletSlug);
                    const listAny: any = list;
                    const maybeOrders: any[] = listAny?.data?.order || listAny?.data?.data?.order || listAny?.data?.data || [];
                    const found = Array.isArray(maybeOrders) ? maybeOrders.find((o: any) => o?.id === order.id) : null;
                    if (found && found.code) {
                        navigate(`/${outletSlug}/payment`, { state: { orderCode: found.code, orderData: found } });
                        break;
                    }
                } catch (err) {
                    // ignore
                }
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
        };

        void tryFindCode();
        return () => {
            isMounted = false;
        };
    }, [orderCode, outletSlug, order?.id, navigate]);

    // We do not perform background polling for checkout/order details in local-only mode.


    // Manual check state for triggering a server-side payment check
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    const { clearCart } = useCart();

    const checkPaymentStatus = useCallback(async () => {
        if (!outletSlug || !activeOrderCode) return;
        setIsCheckingStatus(true);
        try {
            const order = await paymentDataService.checkPaymentStatus(outletSlug, Number(activeOrderCode));

            // Invalidate local cache so data is re-fetched
            queryClient.invalidateQueries({ queryKey: checkoutQueryKeys.detail(outletSlug, Number(activeOrderCode)) });
            queryClient.invalidateQueries({ queryKey: orderQueryKeys.detail(outletSlug, Number(activeOrderCode)) });

            // Process status result and navigate / clear cart on completion
            try {
                const result = paymentStatusService.processPaymentStatusResult(order, outletSlug ?? null);
                if (result.isCompleted) {
                    clearCart();
                    navigate(result.navigationPath, {
                        state: result.navigationState,
                        replace: true,
                    });
                    return;
                }

                const message = paymentStatusService.getPaymentStatusMessage(order, result.isCompleted);
                if (message) {
                    toast.info(message);
                }
            } catch (err) {
                // swallow processing errors but log
                console.error('Payment status processing failed', err);
            }
        } catch (err) {
            console.error('Manual check payment status failed', err);
        } finally {
            setIsCheckingStatus(false);
        }
    }, [queryClient, outletSlug, activeOrderCode, clearCart, navigate]);

    // Navigate when payment is completed
    useEffect(() => {
        if (isPaid) {
            checkPaymentStatus();
        }
    }, [isPaid, checkPaymentStatus]);

    // WebSocket real-time payment updates
    const handlePaymentUpdate = useCallback((event: any) => {
        // Show toast notification
        if (event.message) {
            toast.info(event.message);
        }

        // If payment is completed (status 3 = paid), trigger status check
        if (event.status === 3) {
            toast.success('Pembayaran berhasil! Memproses pesanan...');
            checkPaymentStatus();
        } else {
            // For other status updates, invalidate queries to refresh data
            if (outletSlug && activeOrderCode) {
                queryClient.invalidateQueries({
                    queryKey: checkoutQueryKeys.detail(outletSlug, Number(activeOrderCode))
                });
                queryClient.invalidateQueries({
                    queryKey: orderQueryKeys.detail(outletSlug, Number(activeOrderCode))
                });
            }
        }
    }, [checkPaymentStatus, queryClient, outletSlug, activeOrderCode]);

    // Subscribe to WebSocket updates
    usePaymentWebSocket({
        outletId: currentOutlet?.id?.toString(),
        orderCode: activeOrderCode,
        onPaymentUpdate: handlePaymentUpdate,
        enabled: !isPaid, // Only listen when payment is not yet completed
    });

    // Show loading skeleton
    if (isLoadingCheckout || isLoadingOrderDetail) {
        return <SkeletonPaymentPage />;
    }

    return (
        <PaymentErrorBoundary>
            <ScreenWrapper>
                {/* Header */}
                <HeaderBar
                    title="Payments"
                    showBack={true}
                    onBack={navigateToTransaction}
                />

                {/* Main Content */}
                <div className="flex-1 px-4 pt-6 pb-8 overflow-y-auto">
                    <h1 className='text-xl text-title-black font-rubik font-medium leading-relaxed text-center'>Pindai kode QR untuk membayar</h1>
                    {/* QRIS Barcode Display */}
                    <PaymentBarcode
                        qrString={effectivePaymentData?.Data?.QrString}
                    />
                    {/* Countdown Timer */}
                    {remainingMinutes > 0 && (
                        <div className="mb-4">
                            <CountdownTimer
                                initialMinutes={remainingMinutes}
                                onTimeUp={checkPaymentStatus}
                            />
                        </div>
                    )}

                    {/* Order Items List */}
                    <OrderItemsDisplay items={order?.order_products || []} />

                    {/* Total Payment */}
                    <PaymentTotalSection amount={displayTotal} />

                    {/* Payment Fee Breakdown */}
                    {(location.state?.subtotal || displayTotal > 0) && (() => {
                        // Get service_fee_config directly from order (it's stored at order level, not nested)
                        const serviceFeeConfig = (order as any)?.service_fee_config;

                        return (
                            <div className="my-6">
                                <PaymentFeeBreakdown
                                    subtotal={order?.sub_total ?? location.state?.subtotal ?? 0}
                                    tax={order?.tax ?? location.state?.tax ?? 0}
                                    discount={Number(order?.discount ?? location.state?.discount ?? 0)}
                                    paymentMethodFee={paymentMethodFee}
                                    platformFee={order?.total_fee_service}
                                    serviceFeeConfig={serviceFeeConfig}
                                    total={displayTotal}
                                />
                            </div>
                        );
                    })()}

                    {/* Action Buttons */}
                    <PaymentActionButtons
                        onCheckStatus={checkPaymentStatus}
                        onDownloadBarcode={handleDownloadBarcode}
                        isCheckingStatus={isCheckingStatus}
                        isPaid={isPaid}
                        isDownloading={isDownloading}
                    />

                    {/* Instructions Section */}
                    <PaymentInstructionsSection />
                </div>

            </ScreenWrapper>
        </PaymentErrorBoundary>
    );
}