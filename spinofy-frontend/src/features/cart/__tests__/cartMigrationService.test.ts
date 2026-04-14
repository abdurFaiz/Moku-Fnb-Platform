import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { CartMigrationService } from '../services/cartMigrationService';
import type { CartItem } from '../types/Cart';

const createMockCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
    id: '1',
    productUuid: 'product-uuid-123',
    name: 'Test Product',
    price: 25000,
    quantity: 1,
    options: [],
    ...overrides,
});

describe('CartMigrationService', () => {
    describe('isLegacyCartItem', () => {
        it('should return true for item without productUuid', () => {
            const legacyItem = createMockCartItem({ productUuid: '' });

            expect(CartMigrationService.isLegacyCartItem(legacyItem)).toBe(true);
        });

        it('should return true for item with undefined productUuid', () => {
            const legacyItem = createMockCartItem({ productUuid: undefined as any });

            expect(CartMigrationService.isLegacyCartItem(legacyItem)).toBe(true);
        });

        it('should return false for item with valid productUuid', () => {
            const validItem = createMockCartItem({ productUuid: 'valid-uuid-123' });

            expect(CartMigrationService.isLegacyCartItem(validItem)).toBe(false);
        });
    });

    describe('hasLegacyItems', () => {
        it('should return true when cart has legacy items', () => {
            const items = [
                createMockCartItem({ productUuid: 'valid-uuid' }),
                createMockCartItem({ productUuid: '' }), // legacy item
            ];

            expect(CartMigrationService.hasLegacyItems(items)).toBe(true);
        });

        it('should return false when cart has no legacy items', () => {
            const items = [
                createMockCartItem({ productUuid: 'valid-uuid-1' }),
                createMockCartItem({ productUuid: 'valid-uuid-2' }),
            ];

            expect(CartMigrationService.hasLegacyItems(items)).toBe(false);
        });

        it('should return false for empty cart', () => {
            expect(CartMigrationService.hasLegacyItems([])).toBe(false);
        });
    });

    describe('filterLegacyItems', () => {
        it('should remove legacy items from cart', () => {
            const items = [
                createMockCartItem({ id: '1', productUuid: 'valid-uuid-1' }),
                createMockCartItem({ id: '2', productUuid: '' }), // legacy item
                createMockCartItem({ id: '3', productUuid: 'valid-uuid-2' }),
                createMockCartItem({ id: '4', productUuid: '' }), // legacy item
            ];

            const filteredItems = CartMigrationService.filterLegacyItems(items);

            expect(filteredItems).toHaveLength(2);
            expect(filteredItems.map(item => item.id)).toEqual(['1', '3']);
            expect(filteredItems.every(item => item.productUuid)).toBe(true);
        });

        it('should return same array when no legacy items', () => {
            const items = [
                createMockCartItem({ id: '1', productUuid: 'valid-uuid-1' }),
                createMockCartItem({ id: '2', productUuid: 'valid-uuid-2' }),
            ];

            const filteredItems = CartMigrationService.filterLegacyItems(items);

            expect(filteredItems).toEqual(items);
            expect(filteredItems).toHaveLength(2);
        });

        it('should return empty array when all items are legacy', () => {
            const items = [
                createMockCartItem({ productUuid: '' }),
                createMockCartItem({ productUuid: '' }),
            ];

            const filteredItems = CartMigrationService.filterLegacyItems(items);

            expect(filteredItems).toEqual([]);
        });

        it('should handle empty cart', () => {
            const filteredItems = CartMigrationService.filterLegacyItems([]);

            expect(filteredItems).toEqual([]);
        });
    });

    describe('getLegacyItemsCount', () => {
        it('should count legacy items correctly', () => {
            const items = [
                createMockCartItem({ productUuid: 'valid-uuid-1' }),
                createMockCartItem({ productUuid: '' }), // legacy item
                createMockCartItem({ productUuid: 'valid-uuid-2' }),
                createMockCartItem({ productUuid: '' }), // legacy item
                createMockCartItem({ productUuid: '' }), // legacy item
            ];

            expect(CartMigrationService.getLegacyItemsCount(items)).toBe(3);
        });

        it('should return 0 when no legacy items', () => {
            const items = [
                createMockCartItem({ productUuid: 'valid-uuid-1' }),
                createMockCartItem({ productUuid: 'valid-uuid-2' }),
            ];

            expect(CartMigrationService.getLegacyItemsCount(items)).toBe(0);
        });

        it('should return 0 for empty cart', () => {
            expect(CartMigrationService.getLegacyItemsCount([])).toBe(0);
        });

        it('should count all items when all are legacy', () => {
            const items = [
                createMockCartItem({ productUuid: '' }),
                createMockCartItem({ productUuid: '' }),
                createMockCartItem({ productUuid: '' }),
            ];

            expect(CartMigrationService.getLegacyItemsCount(items)).toBe(3);
        });
    });

    describe('migrateCart', () => {
        let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

        beforeEach(() => {
            consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
        });

        afterEach(() => {
            consoleWarnSpy.mockRestore();
        });

        it('should migrate cart and call onMigration callback when legacy items exist', () => {
            const onMigration = vi.fn();
            const items = [
                createMockCartItem({ id: '1', productUuid: 'valid-uuid-1' }),
                createMockCartItem({ id: '2', productUuid: '' }), // legacy item
                createMockCartItem({ id: '3', productUuid: 'valid-uuid-2' }),
            ];

            const migratedItems = CartMigrationService.migrateCart(items, onMigration);

            expect(migratedItems).toHaveLength(2);
            expect(migratedItems.map(item => item.id)).toEqual(['1', '3']);
            expect(onMigration).toHaveBeenCalledWith(1);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Removed 1 legacy cart items that are incompatible with the new system'
            );
        });

        it('should not call onMigration callback when no legacy items', () => {
            const onMigration = vi.fn();
            const items = [
                createMockCartItem({ id: '1', productUuid: 'valid-uuid-1' }),
                createMockCartItem({ id: '2', productUuid: 'valid-uuid-2' }),
            ];

            const migratedItems = CartMigrationService.migrateCart(items, onMigration);

            expect(migratedItems).toEqual(items);
            expect(onMigration).not.toHaveBeenCalled();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        it('should work without onMigration callback', () => {
            const items = [
                createMockCartItem({ id: '1', productUuid: 'valid-uuid-1' }),
                createMockCartItem({ id: '2', productUuid: '' }), // legacy item
            ];

            const migratedItems = CartMigrationService.migrateCart(items);

            expect(migratedItems).toHaveLength(1);
            expect(migratedItems[0].id).toBe('1');
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Removed 1 legacy cart items that are incompatible with the new system'
            );
        });

        it('should handle multiple legacy items', () => {
            const onMigration = vi.fn();
            const items = [
                createMockCartItem({ id: '1', productUuid: '' }), // legacy item
                createMockCartItem({ id: '2', productUuid: 'valid-uuid' }),
                createMockCartItem({ id: '3', productUuid: '' }), // legacy item
                createMockCartItem({ id: '4', productUuid: '' }), // legacy item
            ];

            const migratedItems = CartMigrationService.migrateCart(items, onMigration);

            expect(migratedItems).toHaveLength(1);
            expect(migratedItems[0].id).toBe('2');
            expect(onMigration).toHaveBeenCalledWith(3);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Removed 3 legacy cart items that are incompatible with the new system'
            );
        });

        it('should return empty array when all items are legacy', () => {
            const onMigration = vi.fn();
            const items = [
                createMockCartItem({ productUuid: '' }),
                createMockCartItem({ productUuid: '' }),
            ];

            const migratedItems = CartMigrationService.migrateCart(items, onMigration);

            expect(migratedItems).toEqual([]);
            expect(onMigration).toHaveBeenCalledWith(2);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                'Removed 2 legacy cart items that are incompatible with the new system'
            );
        });

        it('should handle empty cart', () => {
            const onMigration = vi.fn();

            const migratedItems = CartMigrationService.migrateCart([], onMigration);

            expect(migratedItems).toEqual([]);
            expect(onMigration).not.toHaveBeenCalled();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });
    });
});