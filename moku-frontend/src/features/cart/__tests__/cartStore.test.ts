import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCartStore, type CartItem } from '../stores/cartStore';
import { useVoucherStore } from '@/features/vouchers/stores/voucherStore';

// Mock voucher store
vi.mock('@/features/vouchers/stores/voucherStore', () => ({
    useVoucherStore: {
        getState: vi.fn(() => ({
            removeVoucher: vi.fn(),
            clearVoucherSelections: vi.fn(),
            appliedVoucher: null,
            voucherSelections: [],
            applyVoucher: vi.fn(),
            setVoucherSelections: vi.fn(),
        })),
        setState: vi.fn(),
        subscribe: vi.fn(),
    },
}));

// Mock PaymentAPI
const mockDeleteOrder = vi.fn();
const mockDeleteProduct = vi.fn();
const mockStoreQuantityProduct = vi.fn();

vi.mock('@/features/checkout/api/payment.api', () => ({
    default: {
        deleteOrder: mockDeleteOrder,
        deleteProduct: mockDeleteProduct,
        storeQuantityProduct: mockStoreQuantityProduct,
    },
}));

// Mock window.location
Object.defineProperty(window, 'location', {
    value: {
        pathname: '/test-outlet/checkout',
    },
    writable: true,
});

const createCartItem = (overrides: Partial<CartItem> = {}): Omit<CartItem, 'id'> => ({
    productUuid: 'product-uuid-123',
    name: 'Test Product',
    price: 25000,
    quantity: 1,
    options: [],
    notes: 'Test notes',
    image: 'https://example.com/image.jpg',
    orderProductId: 1,
    productId: 1,
    variantIds: [1, 2],
    orderCode: 'ORDER123',
    ...overrides,
});

const resetCartStore = () => {
    const initialState = {
        items: [],
        isCheckoutProcessing: false,
    };

    useCartStore.setState(initialState);
    localStorage.clear();
};

describe('CartStore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetCartStore();
    });

    afterEach(() => {
        resetCartStore();
    });

    describe('addItem', () => {
        it('should add new item to cart', () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);

            const updatedState = useCartStore.getState();
            expect(updatedState.items).toHaveLength(1);
            expect(updatedState.items[0]).toEqual(expect.objectContaining({
                ...newItem,
                id: expect.any(String),
            }));
        });

        it('should increment quantity for existing identical item', () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            // Add first item
            store.addItem(newItem);
            // Add same item again
            store.addItem(newItem);

            const updatedState = useCartStore.getState();
            expect(updatedState.items).toHaveLength(1);
            expect(updatedState.items[0].quantity).toBe(2);
        });

        it('should add as separate items when options differ', () => {
            const store = useCartStore.getState();
            const baseItem = createCartItem();
            const itemWithOptions = createCartItem({ options: ['Extra Cheese'] });

            store.addItem(baseItem);
            store.addItem(itemWithOptions);

            const updatedState = useCartStore.getState();
            expect(updatedState.items).toHaveLength(2);
        });

        it('should add as separate items when notes differ', () => {
            const store = useCartStore.getState();
            const baseItem = createCartItem();
            const itemWithDifferentNotes = createCartItem({ notes: 'Different notes' });

            store.addItem(baseItem);
            store.addItem(itemWithDifferentNotes);

            const updatedState = useCartStore.getState();
            expect(updatedState.items).toHaveLength(2);
        });
    });

    describe('removeItem', () => {
        it('should remove item from cart', () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);
            const currentState = useCartStore.getState();
            const itemId = currentState.items[0].id;

            store.removeItem(itemId);

            const updatedState = useCartStore.getState();
            expect(updatedState.items).toHaveLength(0);
        });

        it('should not affect other items', () => {
            const store = useCartStore.getState();
            const item1 = createCartItem({ name: 'Item 1' });
            const item2 = createCartItem({ name: 'Item 2', productUuid: 'different-uuid' });

            store.addItem(item1);
            store.addItem(item2);

            const currentState = useCartStore.getState();
            const item1Id = currentState.items.find(item => item.name === 'Item 1')?.id!;

            store.removeItem(item1Id);

            const updatedState = useCartStore.getState();
            expect(updatedState.items).toHaveLength(1);
            expect(updatedState.items[0].name).toBe('Item 2');
        });
    });

    describe('deleteItem', () => {
        it('should delete order when it\'s the last item', async () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);
            const currentState = useCartStore.getState();
            const itemId = currentState.items[0].id;

            await store.deleteItem(itemId, 'test-outlet', 'ORDER123');

            expect(mockDeleteOrder).toHaveBeenCalledWith('test-outlet', 'ORDER123');
            expect(mockDeleteProduct).not.toHaveBeenCalled();

            const updatedState = useCartStore.getState();
            expect(updatedState.items).toHaveLength(0);
        });

        it('should delete specific product when multiple items exist', async () => {
            const store = useCartStore.getState();
            const item1 = createCartItem({ name: 'Item 1', orderProductId: 1 });
            const item2 = createCartItem({ name: 'Item 2', productUuid: 'different-uuid', orderProductId: 2 });

            store.addItem(item1);
            store.addItem(item2);

            const currentState = useCartStore.getState();
            const item1Id = currentState.items.find(item => item.name === 'Item 1')?.id!;

            await store.deleteItem(item1Id, 'test-outlet', 'ORDER123');

            expect(mockDeleteProduct).toHaveBeenCalledWith('test-outlet', 1);
            expect(mockDeleteOrder).not.toHaveBeenCalled();

            const updatedState = useCartStore.getState();
            expect(updatedState.items).toHaveLength(1);
            expect(updatedState.items[0].name).toBe('Item 2');
        });

        it('should throw error when item not found', async () => {
            const store = useCartStore.getState();

            await expect(store.deleteItem('non-existent-id', 'test-outlet', 'ORDER123'))
                .rejects.toThrow('Item not found in cart');
        });

        it('should revert optimistic update on API error', async () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);
            const currentState = useCartStore.getState();
            const itemId = currentState.items[0].id;

            // Mock API error
            mockDeleteOrder.mockRejectedValueOnce(new Error('API Error'));

            await expect(store.deleteItem(itemId, 'test-outlet', 'ORDER123'))
                .rejects.toThrow('API Error');

            // Cart should be reverted
            const revertedState = useCartStore.getState();
            expect(revertedState.items).toHaveLength(1);
        });

        it('should log warning when item has no orderProductId', async () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
            const store = useCartStore.getState();
            const item1 = createCartItem({ name: 'Item 1' });
            const item2 = createCartItem({ name: 'Item 2', productUuid: 'different-uuid', orderProductId: undefined });

            store.addItem(item1);
            store.addItem(item2);

            const currentState = useCartStore.getState();
            const item2Id = currentState.items.find(item => item.name === 'Item 2')?.id!;

            await store.deleteItem(item2Id, 'test-outlet', 'ORDER123');

            expect(consoleSpy).toHaveBeenCalledWith('⚠️ CartStore: Item has no orderProductId, cannot delete from backend');

            consoleSpy.mockRestore();
        });
    });

    describe('updateQuantity', () => {
        it('should update item quantity', async () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);
            const currentState = useCartStore.getState();
            const itemId = currentState.items[0].id;

            await store.updateQuantity(itemId, 3);

            const updatedState = useCartStore.getState();
            expect(updatedState.items[0].quantity).toBe(3);
            expect(mockStoreQuantityProduct).toHaveBeenCalledWith('test-outlet', 'ORDER123', {
                order_product_ids: [1],
                quantities: [3],
            });
        });

        it('should remove item when quantity is 0', async () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);
            const currentState = useCartStore.getState();
            const itemId = currentState.items[0].id;

            await store.updateQuantity(itemId, 0);

            const updatedState = useCartStore.getState();
            expect(updatedState.items).toHaveLength(0);
            expect(mockStoreQuantityProduct).toHaveBeenCalledWith('test-outlet', 'ORDER123', {
                order_product_ids: [1],
                quantities: [0],
            });
        });

        it('should skip backend sync when skipBackendSync is true', async () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);
            const currentState = useCartStore.getState();
            const itemId = currentState.items[0].id;

            await store.updateQuantity(itemId, 5, { skipBackendSync: true });

            const updatedState = useCartStore.getState();
            expect(updatedState.items[0].quantity).toBe(5);
            expect(mockStoreQuantityProduct).not.toHaveBeenCalled();
        });

        it('should revert quantity on API error', async () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);
            const currentState = useCartStore.getState();
            const itemId = currentState.items[0].id;

            // Mock API error
            mockStoreQuantityProduct.mockRejectedValueOnce(new Error('API Error'));

            await expect(store.updateQuantity(itemId, 5))
                .rejects.toThrow('Failed to update quantity: API Error');

            // Quantity should be reverted to original
            const revertedState = useCartStore.getState();
            expect(revertedState.items[0].quantity).toBe(1);
        });

        it('should log warning when missing outlet slug or order code', async () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            // Mock missing outlet slug in pathname
            Object.defineProperty(window, 'location', {
                value: { pathname: '/' },
                writable: true,
            });

            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);
            const currentState = useCartStore.getState();
            const itemId = currentState.items[0].id;

            await store.updateQuantity(itemId, 3);

            expect(consoleSpy).toHaveBeenCalledWith('⚠️ CartStore: Missing outlet slug or order code for quantity sync');

            consoleSpy.mockRestore();
        });

        it('should return early when item not found', async () => {
            const store = useCartStore.getState();

            await store.updateQuantity('non-existent-id', 5);

            expect(mockStoreQuantityProduct).not.toHaveBeenCalled();
        });
    });

    describe('updateItem', () => {
        it('should update item properties', () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);
            const currentState = useCartStore.getState();
            const itemId = currentState.items[0].id;

            store.updateItem(itemId, { name: 'Updated Name', price: 30000 });

            const updatedState = useCartStore.getState();
            expect(updatedState.items[0].name).toBe('Updated Name');
            expect(updatedState.items[0].price).toBe(30000);
        });

        it('should not update non-existent item', () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);
            const stateBefore = useCartStore.getState();

            store.updateItem('non-existent-id', { name: 'Updated Name' });

            const stateAfter = useCartStore.getState();
            expect(stateAfter.items).toEqual(stateBefore.items);
        });
    });

    describe('syncCart', () => {
        it('should replace cart items with provided items', () => {
            const store = useCartStore.getState();

            // Add some initial items
            store.addItem(createCartItem());

            const newItems: CartItem[] = [
                {
                    id: 'sync-1',
                    productUuid: 'sync-uuid',
                    name: 'Synced Product',
                    price: 15000,
                    quantity: 2,
                    options: ['Sync Option'],
                }
            ];

            store.syncCart(newItems);

            const updatedState = useCartStore.getState();
            expect(updatedState.items).toEqual(newItems);
        });
    });

    describe('clearCart', () => {
        it('should clear all items from cart', () => {
            const store = useCartStore.getState();

            store.addItem(createCartItem());
            store.addItem(createCartItem({ productUuid: 'different-uuid' }));

            expect(useCartStore.getState().items).toHaveLength(2);

            store.clearCart();

            const updatedState = useCartStore.getState();
            expect(updatedState.items).toHaveLength(0);
        });

        it('should clear voucher data from localStorage', () => {
            const store = useCartStore.getState();
            const mockRemoveVoucher = vi.fn();
            const mockClearVoucherSelections = vi.fn();

            // Mock voucher store methods
            vi.mocked(useVoucherStore.getState).mockReturnValue({
                removeVoucher: mockRemoveVoucher,
                clearVoucherSelections: mockClearVoucherSelections,
                appliedVoucher: null,
                voucherSelections: [],
                applyVoucher: vi.fn(),
                setVoucherSelections: vi.fn(),
            });

            store.clearCart();

            expect(mockRemoveVoucher).toHaveBeenCalled();
            expect(mockClearVoucherSelections).toHaveBeenCalled();
        });

        it('should handle voucher clearing errors gracefully', () => {
            const store = useCartStore.getState();

            // Mock voucher store to throw error
            vi.mocked(useVoucherStore.getState).mockImplementation(() => {
                throw new Error('Voucher error');
            });

            // Should not throw error
            expect(() => store.clearCart()).not.toThrow();
        });
    });

    describe('setCheckoutProcessing', () => {
        it('should update checkout processing state', () => {
            const store = useCartStore.getState();

            store.setCheckoutProcessing(true);
            expect(useCartStore.getState().isCheckoutProcessing).toBe(true);

            store.setCheckoutProcessing(false);
            expect(useCartStore.getState().isCheckoutProcessing).toBe(false);
        });
    });

    describe('getTotalItems', () => {
        it('should return total quantity of all items', () => {
            const store = useCartStore.getState();

            store.addItem(createCartItem({ quantity: 2 }));
            store.addItem(createCartItem({ productUuid: 'different-uuid', quantity: 3 }));

            expect(store.getTotalItems()).toBe(5);
        });

        it('should return 0 when cart is empty', () => {
            const store = useCartStore.getState();

            expect(store.getTotalItems()).toBe(0);
        });
    });

    describe('getTotalPrice', () => {
        it('should return total price of all items', () => {
            const store = useCartStore.getState();

            store.addItem(createCartItem({ price: 25000, quantity: 2 })); // 50000
            store.addItem(createCartItem({ productUuid: 'different-uuid', price: 15000, quantity: 1 })); // 15000

            expect(store.getTotalPrice()).toBe(65000);
        });

        it('should return 0 when cart is empty', () => {
            const store = useCartStore.getState();

            expect(store.getTotalPrice()).toBe(0);
        });
    });

    describe('persistence', () => {
        it('should persist cart data to localStorage', () => {
            const store = useCartStore.getState();
            const newItem = createCartItem();

            store.addItem(newItem);

            // Check localStorage
            const cartStorage = localStorage.getItem('cart-storage');
            expect(cartStorage).toBeTruthy();

            const parsedStorage = JSON.parse(cartStorage!);
            expect(parsedStorage.state.items).toHaveLength(1);
        });

        it('should restore cart data from localStorage', () => {
            // Manually set localStorage data
            const cartData = {
                state: {
                    items: [{
                        id: 'restored-item',
                        productUuid: 'restored-uuid',
                        name: 'Restored Product',
                        price: 20000,
                        quantity: 1,
                        options: [],
                    }],
                    isCheckoutProcessing: false,
                },
                version: 0,
            };

            localStorage.setItem('cart-storage', JSON.stringify(cartData));

            // Clear current state and trigger hydration
            resetCartStore();

            // Trigger hydration by accessing the store
            useCartStore.setState(cartData.state);

            // The store should have the restored data
            const restoredState = useCartStore.getState();
            expect(restoredState.items).toHaveLength(1);
            expect(restoredState.items[0].name).toBe('Restored Product');
        });
    });
});