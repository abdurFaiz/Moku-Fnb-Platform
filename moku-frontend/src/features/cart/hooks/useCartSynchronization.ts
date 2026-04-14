import { useCallback } from 'react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useQueryClient } from '@tanstack/react-query';
import OrderProductTransformer from '@/features/cart/services/orderProductTransformer';
import type { DuplicatedOrderData } from '@/features/cart/types/OrderDuplication';
import {
    DUPLICATE_ORDER_TIMINGS,
    DUPLICATE_ORDER_QUERY_KEYS,
    DUPLICATE_ORDER_ERRORS,
} from '@/features/transaction/constants/duplicateOrderConstant';
import { toast } from 'sonner';

export const useCartSynchronization = () => {
    const { clearCart, addItem } = useCart();
    const queryClient = useQueryClient();

    /**
     * Sync duplicated order ke cart
     * @param orderData - Duplicated order data
     * @throws Error jika sync gagal
     */
    const syncOrderToCart = useCallback(
        async (orderData: DuplicatedOrderData) => {
            try {
                // Validate order data
                if (!orderData?.order_products) {
                    throw new Error(DUPLICATE_ORDER_ERRORS.NO_PRODUCTS);
                }

                // Clear existing cart
                clearCart();

                // Get valid products
                const validProducts = OrderProductTransformer.getValidOrderProducts(
                    orderData.order_products
                );

                if (validProducts.length === 0) {
                    throw new Error(DUPLICATE_ORDER_ERRORS.NO_PRODUCTS);
                }

                // Transform products ke cart items
                const cartItems = OrderProductTransformer.transformOrderProductsToCartItems(
                    validProducts
                );

                // Add items ke cart dengan error handling
                const failedItems: string[] = [];

                for (const cartItem of cartItems) {
                    try {
                        addItem(cartItem);
                    } catch (error) {
                        console.error(`❌ Error adding item to cart: ${cartItem.name}`, error);
                        failedItems.push(cartItem.name);
                    }
                }

                // Show warning jika ada items yang gagal
                if (failedItems.length > 0) {
                    const failedCount = failedItems.length;
                    toast.warning(
                        `${failedCount} item(s) failed to add to cart: ${failedItems.join(', ')}`
                    );
                }

                // Wait untuk cart update
                await new Promise((resolve) => setTimeout(resolve, DUPLICATE_ORDER_TIMINGS.CART_SYNC_DELAY));

                // Invalidate payment queries untuk refresh

                await queryClient.invalidateQueries({
                    queryKey: [DUPLICATE_ORDER_QUERY_KEYS.paymentList],
                });

                return {
                    success: true,
                    itemsAdded: cartItems.length - failedItems.length,
                    itemsFailed: failedItems.length,
                };
            } catch (error) {
                console.error('❌ Error syncing order to cart:', error);
                throw error instanceof Error ? error : new Error('Failed to sync order to cart');
            }
        },
        [clearCart, addItem, queryClient]
    );

    return { syncOrderToCart };
};

export default useCartSynchronization;
