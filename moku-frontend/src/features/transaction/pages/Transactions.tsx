import { Suspense, lazy, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNav } from "../../../components/MenuBar";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import HeaderBar from "@/components/HeaderBar";
import { useTransactions } from "@/features/transaction/hooks/useTransactions";
import { useTransactionListWebSocket } from "@/features/transaction/hooks/useTransactionListWebSocket";
import { SkeletonTransactionsPage } from "@/components/skeletons/SkeletonComponents";
import { useScrollToTop } from "@/hooks/shared/useScrollToTop";
import { useOutletSlug } from "@/features/outlets/hooks/useOutletSlug";
import { useOutletStore } from "@/features/outlets/stores/useOutletStore";
import ButtonBackToUp from "@/components/BackToUp";
import type { TransactionStatus } from "@/features/transaction/types/Transaction";
import OrderCard from "../components/TransactionCard";
import { Virtuoso } from "react-virtuoso";
const FilterChip = lazy(() =>
  import("@/components/FilterChips").then((module) => ({
    default: module.FilterChip,
  }))
);

export default function Transactions() {
  const navigate = useNavigate();
  const location = useLocation();
  const outletSlug = useOutletSlug();
  const currentOutlet = useOutletStore((state) => state.currentOutlet);

  const {
    filteredTransactions,
    activeFilter,
    isLoading,
    error,
    setActiveFilter,
    handleTransactionClick,
    filterOptions,
    emptyStateMessage,
    refreshTransactions,
  } = useTransactions();

  // WebSocket for real-time transaction list updates
  useTransactionListWebSocket({
    outletId: currentOutlet?.id,
    onOrderUpdate: refreshTransactions,
    enabled: !!currentOutlet?.id,
  });

  // const { duplicateOrder, isDuplicating } = useDuplicateOrder();

  useScrollToTop([isLoading]);

  // const handleReorder = useCallback((orderCode: string) => {
  //   if (isDuplicating) return;
  //   duplicateOrder({ orderCode });
  // }, [isDuplicating, duplicateOrder]);


  useEffect(() => {
    if (location.state?.orderCompleted) {
      // Refresh transactions to show the newly completed order
      refreshTransactions();

      // Show success notification if points were earned
      if (location.state?.points) {
        const points = location.state.points.point;
        if (points > 0) {
          setTimeout(() => {
            alert(`Pembayaran berhasil! Kamu mendapat ${points} poin`);
          }, 500);
        }
      }

      // Clear navigation state to prevent re-execution
      globalThis.history.replaceState({}, document.title);
    }
  }, [location.state, refreshTransactions]);

  if (isLoading) {
    return (
      <SkeletonTransactionsPage />
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <HeaderBar
          title="Pesanan Saya"
          showSearch
          onSearch={() => navigate(`/${outletSlug}/search-transaction`)}
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-base text-red-500">Error: {error}</div>
        </div>
        <BottomNav />
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <HeaderBar
        title="Pesanan Saya"
        showSearch
        onSearch={() => navigate(`/${outletSlug}/search-transaction`)}
      />
      <div className="px-4 pt-6 pb-4 mb-20">
        <Suspense
          fallback={
            <div className="pb-6">
              <div className="h-11 w-full rounded-full bg-gray-100 animate-pulse" />
            </div>
          }
        >
          <FilterChip
            filters={filterOptions}
            activeFilter={activeFilter}
            onChange={(value) =>
              setActiveFilter(value as TransactionStatus | "semua")
            }
            className="pb-6"
          />
        </Suspense>

        {filteredTransactions.length > 0 ? (
          <Virtuoso
            useWindowScroll
            data={filteredTransactions}
            overscan={300}
            computeItemKey={(index, transaction) =>
              `${transaction.id ?? transaction.code ?? index}-${index}`
            }
            components={{
              List: (props) => (
                <div {...props} className="flex flex-col gap-6" />
              ),
            }}
            itemContent={(index, transaction) => (
              <div
                id={`transaction-${index}`}
                className={transaction.pointsMessage ? "mb-[59px]" : ""}
              >
                <Suspense
                  fallback={
                    <div className="h-[196px] w-full rounded-2xl bg-gray-100 animate-pulse" />
                  }
                >
                  <OrderCard
                    {...transaction}
                    orderCode={transaction.code}
                    onAction={() => handleTransactionClick(transaction)}
                  />
                </Suspense>
              </div>
            )}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className=" rounded-full flex items-center justify-center mb-4">
              <img src="../images/transaction-404.svg" alt="No transactions" className="size-40" />
            </div>
            <h3 className="text-base font-medium text-title-black mb-2">
              Belum ada Pesanan
            </h3>
            <p className="text-gray-500 text-center">{emptyStateMessage}</p>
          </div>
        )}
      </div>
      <ButtonBackToUp />
      <BottomNav />
    </ScreenWrapper>
  );
}
