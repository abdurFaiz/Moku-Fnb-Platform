import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCartMigration } from '../hooks/useCartMigration';
import { useCartStore } from '../stores/cartStore';
import { CartMigrationService } from '../services/cartMigrationService';
import type { CartItem } from '../types/Cart';

// Mock dependencies
vi.mock('../stores/cartStore');
vi.mock('../services/cartMigrationService');

const mockUseCartStore = vi.mocked(useCartStore);
const mockCartMigrationService = vi.mocked(CartMigrationService);

const createMockCartItem = (overrides: Partial<CartItem> = {}): CartItem => ({
    id: '1',
    productUuid: 'product-uuid-123',
    name: 'Test Product',
    price: 25000,
    quantity: 1,
    options: [],
    ...overrides,
});

describe('useCartMigration', () => {
    const mockClearCart = vi.fn();

    beforeEach(() => {
        mockUseCartStore.mockReturnValue({
            items: [],
            clearCart: mockClearCart,
            isCheckoutProcessing: false,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: vi.fn(),
            getTotalItems: vi.fn(),
            getTotalPrice: vi.fn(),
            syncCart: vi.fn(),
            updateItem: vi.fn(),
            deleteItem: vi.fn(),
            setCheckoutProcessing: vi.fn(),
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should not clear cart when no items exist', () => {
        mockUseCartStore.mockReturnValue({
            items: [],
            clearCart: mockClearCart,
            isCheckoutProcessing: false,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: vi.fn(),
            getTotalItems: vi.fn(),
            getTotalPrice: vi.fn(),
            syncCart: vi.fn(),
            updateItem: vi.fn(),
            deleteItem: vi.fn(),
            setCheckoutProcessing: vi.fn(),
        });

        renderHook(() => useCartMigration());

        expect(mockCartMigrationService.getLegacyItemsCount).not.toHaveBeenCalled();
        expect(mockClearCart).not.toHaveBeenCalled();
    });

    it('should not clear cart when no legacy items exist', () => {
        const validItems = [
            createMockCartItem({ productUuid: 'valid-uuid-1' }),
            createMockCartItem({ productUuid: 'valid-uuid-2' }),
        ];

        mockUseCartStore.mockReturnValue({
            items: validItems,
            clearCart: mockClearCart,
            isCheckoutProcessing: false,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: vi.fn(),
            getTotalItems: vi.fn(),
            getTotalPrice: vi.fn(),
            syncCart: vi.fn(),
            updateItem: vi.fn(),
            deleteItem: vi.fn(),
            setCheckoutProcessing: vi.fn(),
        });

        vi.mocked(mockCartMigrationService.getLegacyItemsCount).mockReturnValue(0);

        renderHook(() => useCartMigration());

        expect(mockCartMigrationService.getLegacyItemsCount).toHaveBeenCalledWith(validItems);
        expect(mockClearCart).not.toHaveBeenCalled();
    });

    it('should clear cart when legacy items exist', () => {
        const itemsWithLegacy = [
            createMockCartItem({ productUuid: 'valid-uuid' }),
            createMockCartItem({ productUuid: '' }), // legacy item
        ];

        mockUseCartStore.mockReturnValue({
            items: itemsWithLegacy,
            clearCart: mockClearCart,
            isCheckoutProcessing: false,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: vi.fn(),
            getTotalItems: vi.fn(),
            getTotalPrice: vi.fn(),
            syncCart: vi.fn(),
            updateItem: vi.fn(),
            deleteItem: vi.fn(),
            setCheckoutProcessing: vi.fn(),
        });

        vi.mocked(mockCartMigrationService.getLegacyItemsCount).mockReturnValue(1);

        renderHook(() => useCartMigration());

        expect(mockCartMigrationService.getLegacyItemsCount).toHaveBeenCalledWith(itemsWithLegacy);
        expect(mockClearCart).toHaveBeenCalled();
    });

    it('should react to items changes', () => {
        const { rerender } = renderHook(() => useCartMigration());

        // First render with no items
        expect(mockCartMigrationService.getLegacyItemsCount).not.toHaveBeenCalled();

        // Update to have items with legacy data
        const itemsWithLegacy = [
            createMockCartItem({ productUuid: '' }), // legacy item
        ];

        mockUseCartStore.mockReturnValue({
            items: itemsWithLegacy,
            clearCart: mockClearCart,
            isCheckoutProcessing: false,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: vi.fn(),
            getTotalItems: vi.fn(),
            getTotalPrice: vi.fn(),
            syncCart: vi.fn(),
            updateItem: vi.fn(),
            deleteItem: vi.fn(),
            setCheckoutProcessing: vi.fn(),
        });

        vi.mocked(mockCartMigrationService.getLegacyItemsCount).mockReturnValue(1);

        rerender();

        expect(mockCartMigrationService.getLegacyItemsCount).toHaveBeenCalledWith(itemsWithLegacy);
        expect(mockClearCart).toHaveBeenCalled();
    });

    it('should handle multiple legacy items', () => {
        const itemsWithMultipleLegacy = [
            createMockCartItem({ productUuid: '' }), // legacy item 1
            createMockCartItem({ productUuid: 'valid-uuid' }),
            createMockCartItem({ productUuid: '' }), // legacy item 2
        ];

        mockUseCartStore.mockReturnValue({
            items: itemsWithMultipleLegacy,
            clearCart: mockClearCart,
            isCheckoutProcessing: false,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: vi.fn(),
            getTotalItems: vi.fn(),
            getTotalPrice: vi.fn(),
            syncCart: vi.fn(),
            updateItem: vi.fn(),
            deleteItem: vi.fn(),
            setCheckoutProcessing: vi.fn(),
        });

        vi.mocked(mockCartMigrationService.getLegacyItemsCount).mockReturnValue(2);

        renderHook(() => useCartMigration());

        expect(mockCartMigrationService.getLegacyItemsCount).toHaveBeenCalledWith(itemsWithMultipleLegacy);
        expect(mockClearCart).toHaveBeenCalled();
    });
});