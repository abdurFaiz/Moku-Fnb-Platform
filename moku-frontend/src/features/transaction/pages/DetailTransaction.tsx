import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import { Separator } from "@/components/Separator";
import HeaderBar from "@/components/HeaderBar";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useTransactionDetail } from "@/features/transaction/hooks/useTransactionDetail";
import { useTransactionActions, type ActionContext } from "@/features/transaction/hooks/useTransactionActions";
import { useTransactionWebSocket } from "@/features/transaction/hooks/useTransactionWebSocket";
import { SkeletonDetailTransactionPage } from "@/components/skeletons/SkeletonComponents";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { toast } from "sonner";
import { useQueryPayment } from "@/features/payment/hooks/api/useQueryPayment";
import { useQueryOrders } from "@/features/transaction/hooks/api/useQueryOrder";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { useScrollToTop } from "@/hooks/shared/useScrollToTop";
import { OrderTransactionMapper } from "@/features/transaction/services/orderTransactionMapper";

const TransactionProgressIndicator = lazy(() =>
  import("../components/TransactionProgressIndicator")
);

const TransactionHeader = lazy(() =>
  import("../components/TransactionHeader").then((module) => ({
    default: module.TransactionHeader,
  }))
);

const OrderSection = lazy(() =>
  import("../components/OrderSection").then((module) => ({
    default: module.OrderSection,
  }))
);

const ServiceFeeSection = lazy(() =>
  import("../components/ServiceFeeSection").then((module) => ({
    default: module.ServiceFeeSection,
  }))
);
type ServiceFeeItemProps = import("../components/ServiceFeeSection").ServiceFeeItemProps;

const PaymentDetailSection = lazy(() =>
  import("@/features/payment/components/PaymentDetailSection").then((module) => ({
    default: module.PaymentDetailSection,
  }))
);

const PointsRewardSection = lazy(() =>
  import("../components/PointsReward").then((module) => ({
    default: module.PointsRewardSection,
  }))
);

const BottomActionSection = lazy(() =>
  import("../components/ContainerButton").then((module) => ({
    default: module.BottomActionSection,
  }))
);

const CountdownTimer = lazy(() => import("@/features/payment/components/CountdownTimer"));

export default function DetailTransaction() {
  const { navigateToHome, outletSlug, navigateToTransaction } = useOutletNavigation();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const transactionCode = searchParams.get("code") || "1";
  const [isUnpaidOrderModalOpen, setIsUnpaidOrderModalOpen] = useState(false);

  // Initialize hasShownPointsToast based on location state immediately
  const [hasShownPointsToast, setHasShownPointsToast] = useState(() => {
    return location.state?.showPointsToast === true;
  });


  const {
    transaction,
    rawOrderData,
    isLoading,
    isOrderLoading,
    error,
    invalidateDetail,
  } = useTransactionDetail(transactionCode);


  // Fetch orders to check for unpaid ones
  const { data: ordersData } = useQueryOrders(outletSlug, {
    enabled: !!outletSlug,
  });

  const { data: paymentOrderData } = useQueryPayment(outletSlug, {
    staleTime: 0,
  });

  const transactionData = useMemo(() => {
    if (!transaction) return null;
    return OrderTransactionMapper.transformDetailTransactionData(transaction, rawOrderData);
  }, [transaction, rawOrderData]);
  const unpaidOrders = ordersData?.data?.order || [];
  const paymentOrders = paymentOrderData?.data?.order || [];
  const hasUnpaidOrder = [...unpaidOrders, ...paymentOrders].some(
    (order) => order.status == 2
  );

  const { handleActionClick } = useTransactionActions();

  const showPointsToast = location.state?.showPointsToast;

  useScrollToTop([isLoading, transaction]);

  // WebSocket for real-time updates - replaces polling
  const shouldEnableWebSocket = useMemo(() => {
    if (!transactionData) return false;
    const terminalStatuses = ["selesai", "dibatalkan", "ditolak", "expired", "gagal"];
    return !terminalStatuses.includes(transactionData.status);
  }, [transactionData]);

  useTransactionWebSocket({
    orderCode: transaction?.code,
    onTransactionUpdate: async (event) => {
      // Don't show WebSocket toast if we just showed the points toast
      if (!hasShownPointsToast) {
        toast.success('Status Diperbarui', {
          description: event.message || 'Status pesanan telah diperbarui',
          duration: 3000,
        });
      }

      // Invalidate and refetch transaction data
      await invalidateDetail();
    },
    enabled: shouldEnableWebSocket && !!transaction?.code,
  });

  // Show points toast notification when coming from PaymentSuccess
  useEffect(() => {
    if (showPointsToast && rawOrderData) {
      const pointValue = rawOrderData?.customer_point?.point;

      if (pointValue && pointValue > 0) {
        toast.success('Selamat! 🎉', {
          description: `Kamu mendapatkan ${pointValue} poin dari pesanan ini!`,
          duration: 5000,
          position: 'top-center',
        });
      }

      // Clear state to prevent showing toast again on refresh
      navigate(location.pathname + location.search, {
        replace: true,
        state: { ...location.state, showPointsToast: false }
      });

      // Reset the flag after a delay to allow future WebSocket toasts
      setTimeout(() => {
        setHasShownPointsToast(false);
      }, 6000); // Reset after toast duration + buffer
    }
  }, [showPointsToast, rawOrderData, navigate, location.pathname, location.search, location.state]);

  const isPageLoading = isLoading || isOrderLoading;

  // Loading state
  if (isPageLoading) {
    return <SkeletonDetailTransactionPage />;
  }

  // Error state
  if (error) {
    return (
      <ScreenWrapper>
        <HeaderBar
          title="Rincian Pesanan"
          showBack={true}
          onBack={() => navigateToTransaction()}
        />
        <div className="flex items-center justify-center h-screen">
          <div className="text-base text-red-500">{error}</div>
        </div>
      </ScreenWrapper>
    );
  }

  // No data state
  if (!transactionData) {
    return (
      <ScreenWrapper>
        <HeaderBar
          title="Rincian Pesanan"
          showBack={true}
          onBack={() => navigateToTransaction()}
        />
        <div className="flex items-center justify-center h-screen">
          <div className="text-base">Transaction not found</div>
        </div>
      </ScreenWrapper>
    );
  }

  // Build action context for handlers
  const actionContext: ActionContext = {
    outletSlug: outletSlug || '',
    transactionCode,
    rawOrderData,
    isDuplicating: false,
    navigateToHome,
    hasUnpaidOrder,
    onUnpaidOrderAttempt: () => {
      setIsUnpaidOrderModalOpen(true);
    },
  };

  // const normalizeText = (value?: string): string =>
  //   (value ?? '')
  //     .normalize('NFKC')
  //     .replace(/\s+/g, ' ')
  //     .trim()
  //     .toLowerCase();

  const parsePriceValue = (price: string): number => {
    const numeric = price.replace(/[^\d-]/g, '');
    return Number(numeric) || 0;
  };

  // Use total_fee_service from API if available, otherwise calculate from combined fees
  const getTotalServiceFee = (): number => {
    if (rawOrderData?.total_fee_service !== undefined && rawOrderData?.total_fee_service !== null) {
      return Number(rawOrderData.total_fee_service) || 0;
    }

    // Fallback: calculate from combined items if total_fee_service doesn't exist
    const allFees = [...(transactionData?.serviceFees || []), ...(transactionData?.platformFees || [])];
    return allFees.reduce((sum, fee) => sum + parsePriceValue(fee.price), 0);
  };

  // Build single service fee item with API total only (no details)
  const buildCombinedServiceFeeItem = (): ServiceFeeItemProps[] => {
    const totalFee = getTotalServiceFee();
    const serviceFeeConfig = (rawOrderData as any)?.service_fee_config;

    // Only show if totalFee > 0 AND service_fee_config is 2
    if (totalFee === 0 || Number(serviceFeeConfig) !== 2) {
      return [];
    }

    return [{
      id: 'combined-service-fee',
      name: 'Biaya Tambahan',
      price: `Rp ${totalFee.toLocaleString('id-ID')}`,
    }];
  };

  const combinedFeeItems = buildCombinedServiceFeeItem();

  return (
    <ScreenWrapper className="min-h-screen">
      {/* Header */}
      <HeaderBar
        title="Rincian Pesanan"
        showBack={true}
        onBack={() => navigateToTransaction()}
      />

      {/* Progress Indicator */}
      <Suspense
        fallback={
          <div className="px-4 py-6">
            <div className="h-20 w-full rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        }
      >
        <TransactionProgressIndicator status={transactionData.status} />
      </Suspense>

      {/* Countdown Timer for Payment Pending */}
      {transactionData.status === "menunggu-konfirmasi" &&
        transactionData.paymentTimer && (
          <div className="px-4 pb-4">
            <Suspense
              fallback={
                <div className="h-20 w-full rounded-2xl bg-gray-100 animate-pulse" />
              }
            >
              <CountdownTimer
                initialMinutes={transactionData.paymentTimer}
                onTimeUp={() => {
                  // Payment timeout handler
                }}
              />
            </Suspense>
          </div>
        )}

      {/* Content */}
      <div className="flex flex-col flex-1">
        {/* Transaction Header */}
        <Suspense
          fallback={
            <div className="px-4 py-4">
              <div className="h-16 w-full rounded-2xl bg-gray-100 animate-pulse" />
            </div>
          }
        >
          <TransactionHeader
            title={transactionData.title}
            dateTime={transactionData.date}
            transactionInfo={transactionData.code}
          />
        </Suspense>

        <Separator />

        {/* Order Items Section */}
        <Suspense
          fallback={
            <div className="px-4 py-4">
              <div className="h-32 w-full rounded-2xl bg-gray-100 animate-pulse" />
            </div>
          }
        >
          <OrderSection
            title="Pesanan"
            totalItems={transactionData.orderItems.length}
            items={transactionData.orderItems}
          />
        </Suspense>

        <Separator />

        {/* Service & Platform Fees Section */}
        {combinedFeeItems.length > 0 && (
          <>
            <Suspense
              fallback={
                <div className="px-4 py-4">
                  <div className="h-24 w-full rounded-2xl bg-gray-100 animate-pulse" />
                </div>
              }
            >
              <ServiceFeeSection
                title="Biaya Lainnya"
                totalItems={combinedFeeItems.length}
                items={combinedFeeItems}
              />
            </Suspense>
            <Separator />
          </>
        )}

        {/* Payment Details Section */}
        <Suspense
          fallback={
            <div className="px-4 py-4">
              <div className="h-28 w-full rounded-2xl bg-gray-100 animate-pulse" />
            </div>
          }
        >
          <PaymentDetailSection
            title="Detail Pembayaran"
            items={transactionData.paymentDetails}
          />
        </Suspense>

        {/* Points Section - Only show for completed or in-progress orders */}
        {transactionData.points !== undefined &&
          transactionData.points > 0 &&
          transactionData.status !== "menunggu-konfirmasi" && (
            <>
              <Separator />
              <Suspense
                fallback={
                  <div className="px-4 py-4">
                    <div className="h-24 w-full rounded-2xl bg-gray-100 animate-pulse" />
                  </div>
                }
              >
                <PointsRewardSection
                  title={`Kamu Dapat ${transactionData.points} Poin`}
                  label="Spinofy Poin"
                  points={transactionData.points}
                />
              </Suspense>
            </>
          )}
      </div>

      {/* Bottom Action Buttons */}
      <Suspense
        fallback={
          <div className="px-4 pb-6">
            <div className="h-28 w-full rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        }
      >
        <BottomActionSection
          actions={transactionData.actions.map((action: { label: string; variant: "outline" | "primary"; size: "lg" }) => ({
            ...action,
            onClick: () => {
              if (action.label === "Lihat Struk") {
                navigate(`/${outletSlug}/invoice/${transactionCode}`);
              } else {
                handleActionClick(action.label, actionContext);
              }
            },
          }))}
        />
      </Suspense>

      {/* Unpaid Order Modal */}
      <AlertDialog open={isUnpaidOrderModalOpen} onOpenChange={setIsUnpaidOrderModalOpen}>
        <AlertDialogContent className='mx-auto max-w-[440px]'>
          <AlertDialogHeader>
            <AlertDialogTitle>Pesanan Belum Selesai</AlertDialogTitle>
            <AlertDialogDescription>
              Anda memiliki pesanan yang belum dibayar atau menunggu konfirmasi. Silakan selesaikan pesanan tersebut sebelum membuat pesanan baru.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='flex flex-row gap-6'>
            <AlertDialogCancel className='w-full'>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className='w-full bg-primary-orange hover:bg-orange-600'
              onClick={() => {
                navigateToTransaction();
              }}
            >
              Lihat Pesanan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ScreenWrapper>
  );
}
