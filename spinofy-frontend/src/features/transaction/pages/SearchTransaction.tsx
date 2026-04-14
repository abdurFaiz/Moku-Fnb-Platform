import HeaderSearchBar from "@/components/HeadSearchBar";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import OrderCard from "@/features/transaction/components/TransactionCard";
import { useNavigate } from "react-router-dom";
import { useTransactions } from "@/features/transaction/hooks/useTransactions";
import { useDuplicateOrder } from "@/features/cart/hooks/useDuplicateOrder";
import { useState, useMemo } from "react";
import { SkeletonTransactionsPage } from "@/components/skeletons/SkeletonComponents";
import { useScrollToTop } from "@/hooks/shared/useScrollToTop";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";

export default function SearchTransaction() {
    const navigate = useNavigate();
    const { navigateToTransaction } = useOutletNavigation();
    const [searchQuery, setSearchQuery] = useState("");
    const { transactions, isLoading, error, handleTransactionClick } = useTransactions();
    const { duplicateOrder, isDuplicating } = useDuplicateOrder();

    useScrollToTop([isLoading]);

    // Search across transaction fields: items, cafeName, order code
    const filteredTransactions = useMemo(() => {
        if (!searchQuery.trim()) {
            return transactions;
        }

        const query = searchQuery.toLowerCase();
        return transactions.filter((transaction) => {
            // Search by order code
            const codeMatch = transaction.code?.toLowerCase().includes(query);
            // Search by cafe name
            const cafeMatch = transaction.cafeName?.toLowerCase().includes(query);
            // Search by items
            const itemsMatch = transaction.items?.toLowerCase().includes(query);
            // Search by status
            const statusMatch = transaction.status?.toLowerCase().includes(query);

            return codeMatch || cafeMatch || itemsMatch || statusMatch;
        });
    }, [transactions, searchQuery]);

    // Handle search input - extract value from form submission
    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    // Handle "Pesan Lagi" button click
    const handleReorder = (orderCode: string) => {
        if (isDuplicating) return;
        duplicateOrder({ orderCode });
    };

    if (isLoading) {
        return <SkeletonTransactionsPage />;
    }

    if (error) {
        return (
            <ScreenWrapper>
                <HeaderSearchBar
                    placeholder="Cari berdasarkan item atau nama Cafe"
                    onBack={() => navigate('/transactions')}
                    onSearch={handleSearch}
                />
                <div className="flex items-center justify-center h-64">
                    <div className="text-base text-red-500">Error: {error}</div>
                </div>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <HeaderSearchBar
                placeholder="Cari berdasarkan item atau nama Cafe"
                onBack={() => navigateToTransaction()}
                onSearch={handleSearch}
            />

            <div className="px-4 pt-6 pb-4 mb-20">
                {/* Search info */}
                {searchQuery.trim() && (
                    <div className="mb-4 text-sm text-gray-600">
                        Ditemukan <span className="font-semibold">{filteredTransactions.length}</span> pesanan
                    </div>
                )}

                {/* Transactions list */}
                <div className="flex flex-col gap-6">
                    {filteredTransactions.length > 0 && (
                        filteredTransactions.map((transaction, index) => (
                            <button
                                key={`${transaction.id}-${index}`}
                                onClick={() => handleTransactionClick(transaction)}
                                className="cursor-pointer text-left w-full"
                                type="button"
                                aria-label={`Lihat detail pesanan ${transaction.code}`}
                            >
                                <OrderCard
                                    status={transaction.status}
                                    created_at={transaction.created_at}
                                    cafeName={transaction.cafeName}
                                    items={transaction.items}
                                    totalItems={transaction.totalItems}
                                    totalPrice={transaction.totalPrice}
                                    imageUrl={transaction.imageUrl}
                                    pointsMessage={transaction.pointsMessage}
                                    orderCode={transaction.code}
                                    onReorder={() => handleReorder(transaction.code)}
                                />
                            </button>
                        ))
                    )}
                </div>

                {/* Empty states */}
                {filteredTransactions.length === 0 && searchQuery.trim() && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <img src="../images/transaction-404.svg" alt="No transactions" className="size-40" />
                        <p className="text-gray-600 text-center">
                            Tidak ada pesanan yang cocok dengan pencarian "<strong>{searchQuery}</strong>"
                        </p>
                        <p className="text-gray-500 text-sm text-center mt-2">
                            Coba cari berdasarkan nama cafe, item, atau kode pesanan
                        </p>
                    </div>
                )}

                {!searchQuery.trim() && (
                    <div className="flex flex-col items-center gap-6 justify-center py-12">
                        <img src="../images/transaction-404.svg" alt="No transactions" className="size-40" />
                        <p className="text-gray-600 text-center">
                            Mulai mengetik untuk mencari pesanan Anda
                        </p>
                    </div>
                )}
            </div>
        </ScreenWrapper>
    );
}