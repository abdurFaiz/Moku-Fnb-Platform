import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCart } from '@/features/cart/hooks/useCart';
import { useCartStore, type CartItem } from '@/features/cart/stores/cartStore';
import { useUpdateQuantityPaymentProductMutation } from '@/features/payment/hooks/api/useMutationPayment';


export interface CheckoutItemManagement {
    updateItemQuantity: (itemId: string, delta: number) => Promise<void>;
    deleteItem: (itemId: string) => Promise<void>;
    editItem: (
        cartItemId: string,
        productUuid: string,
        variantIds: number[],
        quantity: number,
        note: string
    ) => void;
    formatOrderItems: (items: CartItem[]) => FormattedOrderItem[];
}

export interface FormattedOrderItem {
    id: string;
    name: string;
    notes: string | null;
    price: number;
    image: string;
    quantity: number;
    options: string[];
    orderProductId?: number;
    productId?: number;
    productUuid: string;
    variantIds?: number[];
}

/**
 * @param outletSlug - Current outlet slug
 * @param orderCode - Current order code
 * @param onRefetchPayment - Callback to refetch payment data
 * @param onNavigateToHome - Callback to navigate to home
 * @returns Checkout item management functions
 */
export const useCheckoutItemManagement = (
    outletSlug: string | undefined,
    orderCode: string | undefined,
    onRefetchPayment: () => Promise<void>,
    onNavigateToHome: () => void
): CheckoutItemManagement => {
    const navigate = useNavigate();
    const { updateQuantity } = useCart();
    const { items } = useCartStore();
    const refetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const REFETCH_DELAY = 350;
    const updateQuantityMutation = useUpdateQuantityPaymentProductMutation();

    const schedulePaymentRefetch = useCallback(() => {
        if (refetchTimeoutRef.current) {
            clearTimeout(refetchTimeoutRef.current);
        }

        refetchTimeoutRef.current = setTimeout(() => {
            refetchTimeoutRef.current = null;
            void onRefetchPayment();
        }, REFETCH_DELAY);
    }, [onRefetchPayment]);

    const handleUpdateItemQuantity = useCallback(
        async (itemId: string, delta: number) => {
            const item = items.find((i) => i.id === itemId);

            if (!item) {
                toast.error('Item tidak ditemukan');
                return;
            }

            const newQuantity = Math.max(0, item.quantity + delta);
            const previousQuantity = item.quantity;
            const hasBackendLink = Boolean(item.orderProductId && item.orderCode);

            // Allow quantity updates even before an orderProductId exists (fresh carts)
            if (!hasBackendLink) {
                await updateQuantity(itemId, newQuantity, { skipBackendSync: true });
                return;
            }

            if (!outletSlug) {
                toast.error('Outlet tidak tersedia');
                return;
            }

            try {
                await updateQuantity(itemId, newQuantity, { skipBackendSync: true });

                await updateQuantityMutation.mutateAsync({
                    outletSlug,
                    orderProductId: item.orderProductId!,
                    payload: { quantity: newQuantity },
                });

                schedulePaymentRefetch();
            } catch (error) {
                console.error('❌ Failed to update quantity:', error);
                toast.error('Gagal memperbarui jumlah item');

                if (refetchTimeoutRef.current) {
                    clearTimeout(refetchTimeoutRef.current);
                    refetchTimeoutRef.current = null;
                }

                await updateQuantity(itemId, previousQuantity, { skipBackendSync: true });

                // Refetch to ensure we have the latest state from backend
                await onRefetchPayment();
            }
        },
        [
            items,
            outletSlug,
            updateQuantity,
            onRefetchPayment,
            schedulePaymentRefetch,
            updateQuantityMutation,
        ]
    );


    const handleDeleteItem = useCallback(
        async (itemId: string) => {
            if (!outletSlug || !orderCode) {
                toast.error('Tidak dapat menghapus item: outlet atau order tidak tersedia');
                return;
            }

            const item = items.find((i) => i.id === itemId);

            if (!item) {
                toast.error('Item tidak ditemukan dalam keranjang');
                return;
            }

            try {
                // Use cart store's deleteItem method which handles backend API calls
                await useCartStore.getState().deleteItem(itemId, outletSlug, orderCode);

                // Add delay to ensure backend has processed deletion
                await new Promise((resolve) => setTimeout(resolve, 300));

                // Refetch payment data to sync with backend
                await onRefetchPayment();

                // If cart becomes empty after deletion, redirect to home
                const updatedItems = useCartStore.getState().items;
                if (updatedItems.length === 0) {
                    setTimeout(() => {
                        onNavigateToHome();
                    }, 500);
                }

                toast.success('Item berhasil dihapus');
            } catch (error) {
                console.error('❌ Failed to delete item:', error);
                toast.error('Gagal menghapus item');

                // Refetch to ensure we have the latest state
                await onRefetchPayment();
            }
        },
        [items, outletSlug, orderCode, onRefetchPayment, onNavigateToHome]
    );

    const handleEditItem = useCallback(
        (
            cartItemId: string,
            productUuid: string,
            variantIds: number[],
            quantity: number,
            note: string
        ) => {
            if (!outletSlug) {
                toast.error('Outlet tidak tersedia');
                return;
            }

            navigate(`/${outletSlug}/detail-item?uuid=${productUuid}&mode=cart-edit&cartItemId=${cartItemId}`, {
                state: {
                    cartEditMode: true,
                    cartItemId,
                    productUuid,
                    variantIds,
                    quantity,
                    note,
                },
            });
        },
        [outletSlug, navigate]
    );

    /**
     * Format cart items for checkout display
     * DRY - centralized formatting logic
     * Pure function - no side effects
     */
    const handleFormatOrderItems = useCallback(
        (cartItems: CartItem[]): FormattedOrderItem[] => {
            return cartItems.map((item) => ({
                id: item.id,
                name: item.name,
                notes: item.notes || null,
                price: item.price,
                image: item.image || '',
                quantity: item.quantity,
                options: item.options || [],
                orderProductId: item.orderProductId,
                productId: item.productId,
                productUuid: item.productUuid,
                variantIds: item.variantIds,
            }));
        },
        []
    );

    useEffect(() => {
        return () => {
            if (refetchTimeoutRef.current) {
                clearTimeout(refetchTimeoutRef.current);
                refetchTimeoutRef.current = null;
            }
        };
    }, []);

    return {
        updateItemQuantity: handleUpdateItemQuantity,
        deleteItem: handleDeleteItem,
        editItem: handleEditItem,
        formatOrderItems: handleFormatOrderItems,
    };
};

export default useCheckoutItemManagement;
