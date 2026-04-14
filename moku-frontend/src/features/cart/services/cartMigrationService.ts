import type { CartItem } from '@/features/cart/types/Cart';

/**
 * Cart Migration Service
 * Handles migrating legacy cart items to the new format
 */
export class CartMigrationService {
    /**
     * Check if cart item is legacy (missing productUuid)
     */
    static isLegacyCartItem(item: CartItem): boolean {
        return !item.productUuid || item.productUuid === '';
    }

    /**
     * Check if any items in the cart are legacy
     */
    static hasLegacyItems(items: CartItem[]): boolean {
        return items.some(item => this.isLegacyCartItem(item));
    }

    /**
     * Filter out legacy items from cart
     */
    static filterLegacyItems(items: CartItem[]): CartItem[] {
        return items.filter(item => !this.isLegacyCartItem(item));
    }

    /**
     * Get count of legacy items
     */
    static getLegacyItemsCount(items: CartItem[]): number {
        return items.filter(item => this.isLegacyCartItem(item)).length;
    }

    /**
     * Migrate cart by removing legacy items and notifying user
     */
    static migrateCart(items: CartItem[], onMigration?: (removedCount: number) => void): CartItem[] {
        const legacyCount = this.getLegacyItemsCount(items);
        const migratedItems = this.filterLegacyItems(items);

        if (legacyCount > 0) {
            console.warn(`Removed ${legacyCount} legacy cart items that are incompatible with the new system`);

            if (onMigration) {
                onMigration(legacyCount);
            }
        }

        return migratedItems;
    }
}