import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletSlug } from "@/features/outlets/hooks/useOutletSlug";
import { useDuplicateOrder } from "@/features/cart/hooks/useDuplicateOrder";
import { toast } from "sonner";
import type {
  Transaction,
  TransactionStatus,
} from "@/features/transaction/types/Transaction";
import { useDeleteOrderMutation } from "@/features/payment/hooks/api/useMutationPayment";

export interface UseTransactionActionsReturn {
  handleTransactionClick: (transaction: Transaction) => void;
  navigateToTransaction: (
    transactionCode: string,
    status: TransactionStatus,
  ) => void;
  handlePaymentAction: (outletSlug: string, transactionCode: string, rawOrderData: any) => void;
  handleDuplicateOrder: (transactionCode: string) => Promise<void>;
  handleActionClick: (actionLabel: string, context: ActionContext) => void;
}

export interface ActionContext {
  outletSlug: string;
  transactionCode: string;
  rawOrderData: any;
  isDuplicating: boolean;
  navigateToHome: () => void;
  /** If true, indicates the user has existing unpaid order(s) */
  hasUnpaidOrder?: boolean;
  /** Callback invoked when an action is blocked due to unpaid order(s) */
  onUnpaidOrderAttempt?: (orderCode?: string) => void;
}

export const useTransactionActions = (): UseTransactionActionsReturn => {
  const navigate = useNavigate();
  const outletSlug = useOutletSlug();
  const { duplicateOrder, isDuplicating } = useDuplicateOrder();
  const deleteOrderMutation = useDeleteOrderMutation();

  const handleTransactionClick = useCallback(
    (transaction: Transaction) => {
      if (outletSlug) {
        navigate(`/${outletSlug}/detail-transaction?code=${transaction.code}&status=${transaction.status}`);
      } else {
        navigate('/onboard');
      }
    },
    [navigate, outletSlug],
  );

  const navigateToTransaction = useCallback(
    (transactionCode: string, status: TransactionStatus) => {
      if (outletSlug) {
        navigate(`/${outletSlug}/detail-transaction?code=${transactionCode}&status=${status}`);
      } else {
        navigate('/onboard');
      }
    },
    [navigate, outletSlug],
  );

  const handlePaymentAction = useCallback(
    (outlet: string, transactionCode: string, orderData: any) => {
      navigate(`/${outlet}/payment`, {
        state: {
          orderCode: transactionCode,
          orderData: orderData,
        }
      });
    },
    [navigate],
  );

  const handleCancelOrder = useCallback(
    async (outlet: string, orderCode: string) => {
      const toastId = toast.loading("Membatalkan pesanan...");
      try {
        const response = await deleteOrderMutation.mutateAsync({
          outletSlug: outlet,
          orderCode,
        });

        if (response.status === 'success') {
          toast.success("Pesanan berhasil dibatalkan", { id: toastId });
          // Refresh or navigate after cancellation
          navigate(`/${outlet}/transactions`, { replace: true });
          window.location.reload();
        } else {
          toast.error(response.message || "Gagal membatalkan pesanan", { id: toastId });
        }
      } catch (error) {
        toast.error("Terjadi kesalahan saat membatalkan pesanan", { id: toastId });
      }
    },
    [deleteOrderMutation, navigate]
  );

  const handleDuplicateOrder = useCallback(
    async (transactionCode: string) => {
      if (isDuplicating) return;
      duplicateOrder({ orderCode: transactionCode });
    },
    [isDuplicating, duplicateOrder],
  );

  const handleActionClick = useCallback((actionLabel: string, context: ActionContext) => {
    const { outletSlug, transactionCode, rawOrderData, navigateToHome } = context;

    const actionMap: Record<string, () => void> = {
      "Pesan Sekarang": () => {
        if (context.hasUnpaidOrder && context.onUnpaidOrderAttempt) {
          context.onUnpaidOrderAttempt(transactionCode);
          return;
        }
        navigate(`/${outletSlug}/checkout`);
      },
      "Bayar Sekarang": () => handlePaymentAction(outletSlug, transactionCode, rawOrderData),
      "Lihat Menu Lain": () => {
        navigateToHome();
      },
      "Lihat Struk": () => {
        navigate(`/${outletSlug}/invoice`);
      },
      "Batalkan Pesanan": () => {
        void handleCancelOrder(outletSlug, transactionCode);
      },
      "Hubungi Cafe": () => {
        // TODO: Implement contact cafe
        console.log("Contact cafe action");
      },
      "Lacak Pesanan": () => {
        // TODO: Implement track order
        console.log("Track order action");
      },
      "Buat Pesanan Baru": () => {
        navigateToHome();
      },
    };

    // Execute action if it exists, otherwise log warning
    const action = actionMap[actionLabel];
    if (action) {
      action();
    } else {
      console.warn(`Unknown action: ${actionLabel}`);
    }
  }, [handlePaymentAction, handleDuplicateOrder, handleCancelOrder]);

  return {
    handleTransactionClick,
    navigateToTransaction,
    handlePaymentAction,
    handleDuplicateOrder,
    handleActionClick,
  };
};

export default useTransactionActions;
