import { useEffect } from 'react';
import { useCartStore } from '@/features/cart/stores/cartStore';
import { CartMigrationService } from '@/features/cart/services/cartMigrationService';

/**
 * Hook to handle cart migration on app startup
 * Removes legacy cart items that don't have productUuid
 */
export const useCartMigration = () => {
    const { items, clearCart } = useCartStore();

    useEffect(() => {
        if (items.length > 0) {
            const legacyCount = CartMigrationService.getLegacyItemsCount(items);

            if (legacyCount > 0) {
                clearCart();
            }
        }
    }, [items, clearCart]);
};

export default useCartMigration;