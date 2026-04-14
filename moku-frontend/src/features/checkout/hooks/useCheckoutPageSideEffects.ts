import { useEffect } from 'react';
import { useCartStore, type CartItem } from '@/features/cart/stores/cartStore';
import type { Order } from '@/features/cart/types/Order';
import { formatOrderProductVariants, extractVariantIds } from '@/utils/variantFormatters';

export interface CheckoutPageSideEffectsConfig {
    currentOrder: Order | undefined;
    isDataLoading: boolean;
    outletSlug: string | undefined;
    items: CartItem[];
    isCheckoutProcessing: boolean;
    checkoutJustCompleted: boolean;
    onNavigateToHome: () => void;
    setCheckoutProcessing: (processing: boolean) => void;
}

/**
 * @param config - Side effects configuration
 */
export const useCheckoutPageSideEffects = (
    config: CheckoutPageSideEffectsConfig
): void => {
    const {
        currentOrder,
        isDataLoading,
        outletSlug,
        items,
        isCheckoutProcessing,
        checkoutJustCompleted,
        onNavigateToHome,
        setCheckoutProcessing,
    } = config;

    const transformOrderProductsToCartItems = (
        orderProducts: any[]
    ): CartItem[] => {
        return orderProducts.map((orderProduct) => ({
            id: String(orderProduct.id),
            name: orderProduct.product?.name || '-',
            price: orderProduct.price + (orderProduct.extra_price || 0),
            quantity: orderProduct.quantity,
            image: orderProduct.product?.image_url || orderProduct.product?.image || '',
            notes: orderProduct.note || '',
            options: formatOrderProductVariants(orderProduct.order_product_variants || []),
            productId: orderProduct.product_id,
            productUuid: orderProduct.product?.uuid || '',
            variantIds: extractVariantIds(orderProduct.order_product_variants || []),
            orderProductId: orderProduct.id,
            orderCode: currentOrder?.code,
        }));
    };

    /**
     * Sync frontend cart with backend order data
     * Ensures frontend and backend are in sync
     */
    useEffect(() => {
        const cartState = useCartStore.getState();
        const cartItems = cartState.items;

        const hasBackendLinkedItems = cartItems.some((item) => Boolean(item.orderProductId));
        const unsyncedItems = cartItems.filter((item) => !item.orderProductId);

        if (currentOrder?.order_products && currentOrder.order_products.length > 0) {
            const backendCartItems = transformOrderProductsToCartItems(currentOrder.order_products);

            // Preserve any local-only cart items (e.g., items being prepared before checkout sync)
            cartState.syncCart([
                ...backendCartItems,
                ...unsyncedItems,
            ]);
        } else if (
            !isDataLoading &&
            outletSlug &&
            hasBackendLinkedItems &&
            !currentOrder &&
            unsyncedItems.length === 0
        ) {
            // Clear stale backend-linked cart data (e.g., after order deleted server-side)
            cartState.clearCart();
        }
    }, [currentOrder, isDataLoading, outletSlug]);

    /**
     * Cleanup: Reset checkout processing flag on unmount
     */
    useEffect(() => {
        return () => {
            setCheckoutProcessing(false);
        };
    }, [setCheckoutProcessing]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (
                !isCheckoutProcessing &&
                !isDataLoading &&
                !currentOrder &&
                items.length === 0 &&
                !checkoutJustCompleted &&
                outletSlug
            ) {
                onNavigateToHome();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [
        currentOrder,
        isDataLoading,
        outletSlug,
        items.length,
        isCheckoutProcessing,
        checkoutJustCompleted,
        onNavigateToHome,
    ]);
};

export default useCheckoutPageSideEffects;
