import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCheckoutItemManagement, type CheckoutItemManagement, type FormattedOrderItem } from '../hooks/useCheckoutItemManagement';

// Mock all external dependencies
vi.mock('react-router-dom');
vi.mock('sonner');
vi.mock('@/features/cart/hooks/useCart');
vi.mock('@/features/cart/stores/cartStore');
vi.mock('@/features/payment/hooks/api/useMutationPayment');

// Import mocked modules
import { useCart } from '@/features/cart/hooks/useCart';
import { useCartStore } from '@/features/cart/stores/cartStore';
import { useUpdateQuantityPaymentProductMutation } from '@/features/payment/hooks/api/useMutationPayment';

// Mock types
import type { CartItem } from '@/features/cart/stores/cartStore';

const mockNavigate = vi.mocked(useNavigate);
const mockToast = vi.mocked(toast);
const mockUseCart = vi.mocked(useCart);
const mockUseCartStore = vi.mocked(useCartStore);
const mockUseUpdateQuantityPaymentProductMutation = vi.mocked(useUpdateQuantityPaymentProductMutation);

// Test data setup
const mockCartItem: CartItem = {
    id: 'item-123',
    productUuid: 'product-uuid-123',
    name: 'Test Product',
    price: 25000,
    quantity: 2,
    image: 'test-image.jpg',
    notes: 'Test notes',
    options: ['Extra cheese', 'Large size'],
    orderProductId: 456,
    productId: 123,
    variantIds: [1, 2],
    orderCode: 'ORD-12345'
};

const mockCartItems: CartItem[] = [mockCartItem];

describe('useCheckoutItemManagement Hook', () => {
    const mockOutletSlug = 'test-cafe';
    const mockOrderCode = 'ORD-12345';
    const mockOnRefetchPayment = vi.fn();
    const mockOnNavigateToHome = vi.fn();
    const mockNavigateFn = vi.fn();
    const mockUpdateQuantity = vi.fn();
    const mockMutateAsync = vi.fn();
    const mockDeleteItem = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mock implementations
        mockNavigate.mockReturnValue(mockNavigateFn);

        mockUseCart.mockReturnValue({
            items: mockCartItems,
            updateQuantity: mockUpdateQuantity,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            clearCart: vi.fn(),
            getTotalItems: vi.fn().mockReturnValue(2),
            getTotalPrice: vi.fn().mockReturnValue(50000),
            isCheckoutProcessing: false,
            syncCart: vi.fn(),
            deleteItem: mockDeleteItem,
            updateItem: vi.fn(),
            setCheckoutProcessing: vi.fn()
        } as any);

        mockUseCartStore.mockReturnValue({
            items: mockCartItems,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: mockUpdateQuantity,
            clearCart: vi.fn(),
            getTotalItems: () => 2,
            getTotalPrice: () => 50000,
            isCheckoutProcessing: false,
            syncCart: vi.fn(),
            deleteItem: mockDeleteItem,
            updateItem: vi.fn(),
            setCheckoutProcessing: vi.fn()
        });

        // Mock cart store static methods
        const mockCartStoreState = {
            items: mockCartItems,
            addItem: vi.fn(),
            removeItem: vi.fn(),
            updateQuantity: mockUpdateQuantity,
            clearCart: vi.fn(),
            getTotalItems: () => 2,
            getTotalPrice: () => 50000,
            isCheckoutProcessing: false,
            syncCart: vi.fn(),
            deleteItem: mockDeleteItem,
            updateItem: vi.fn(),
            setCheckoutProcessing: vi.fn()
        };

        mockUseCartStore.getState = vi.fn().mockReturnValue(mockCartStoreState);

        mockUseUpdateQuantityPaymentProductMutation.mockReturnValue({
            mutateAsync: mockMutateAsync,
            isError: false,
            error: null,
            data: undefined,
            isSuccess: false,
            isPending: false,
            reset: vi.fn(),
            mutate: vi.fn(),
            failureCount: 0,
            failureReason: null,
            isPaused: false,
            status: 'idle' as const,
            variables: undefined
        } as any);

        // Mock toast methods
        mockToast.error = vi.fn();
        mockToast.success = vi.fn();

        // Mock promises
        mockOnRefetchPayment.mockResolvedValue(undefined);
        mockUpdateQuantity.mockResolvedValue(undefined);
        mockMutateAsync.mockResolvedValue({ success: true });
        mockDeleteItem.mockResolvedValue(undefined);

        // Mock setTimeout
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe('Basic functionality', () => {
        it('should return all required functions', () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            expect(result.current).toHaveProperty('updateItemQuantity');
            expect(result.current).toHaveProperty('deleteItem');
            expect(result.current).toHaveProperty('editItem');
            expect(result.current).toHaveProperty('formatOrderItems');
            expect(typeof result.current.updateItemQuantity).toBe('function');
            expect(typeof result.current.deleteItem).toBe('function');
            expect(typeof result.current.editItem).toBe('function');
            expect(typeof result.current.formatOrderItems).toBe('function');
        });
    });

    describe('updateItemQuantity function', () => {
        it('should update item quantity successfully', async () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.updateItemQuantity('item-123', 1);
            });

            expect(mockUpdateQuantity).toHaveBeenCalledWith('item-123', 3, { skipBackendSync: true });
            expect(mockMutateAsync).toHaveBeenCalledWith({
                outletSlug: mockOutletSlug,
                orderProductId: 456,
                payload: { quantity: 3 }
            });

            // Fast-forward timer to trigger refetch
            act(() => {
                vi.advanceTimersByTime(350);
            });

            await waitFor(() => {
                expect(mockOnRefetchPayment).toHaveBeenCalled();
            });
        });

        it('should handle quantity decrease', async () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.updateItemQuantity('item-123', -1);
            });

            expect(mockUpdateQuantity).toHaveBeenCalledWith('item-123', 1, { skipBackendSync: true });
            expect(mockMutateAsync).toHaveBeenCalledWith({
                outletSlug: mockOutletSlug,
                orderProductId: 456,
                payload: { quantity: 1 }
            });
        });

        it('should prevent negative quantities', async () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.updateItemQuantity('item-123', -5);
            });

            expect(mockUpdateQuantity).toHaveBeenCalledWith('item-123', 0, { skipBackendSync: true });
        });

        it('should handle item not found', async () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.updateItemQuantity('non-existent-item', 1);
            });

            expect(mockToast.error).toHaveBeenCalledWith('Item tidak ditemukan');
            expect(mockUpdateQuantity).not.toHaveBeenCalled();
        });

        it('should handle items without backend link (fresh carts)', async () => {
            const freshCartItem: CartItem = {
                ...mockCartItem,
                orderProductId: undefined,
                orderCode: undefined
            };

            mockUseCartStore.mockReturnValue({
                items: [freshCartItem],
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: mockUpdateQuantity,
                clearCart: vi.fn(),
                getTotalItems: vi.fn().mockReturnValue(1),
                getTotalPrice: vi.fn().mockReturnValue(25000),
                isCheckoutProcessing: false,
                syncCart: vi.fn(),
                deleteItem: mockDeleteItem,
                updateItem: vi.fn(),
                setCheckoutProcessing: vi.fn()
            });

            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.updateItemQuantity('item-123', 1);
            });

            expect(mockUpdateQuantity).toHaveBeenCalledWith('item-123', 3, { skipBackendSync: true });
            expect(mockMutateAsync).not.toHaveBeenCalled(); // Should skip backend sync
        });

        it('should handle missing outlet slug', async () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(undefined, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.updateItemQuantity('item-123', 1);
            });

            expect(mockToast.error).toHaveBeenCalledWith('Outlet tidak tersedia');
            expect(mockMutateAsync).not.toHaveBeenCalled();
        });

        it('should handle backend update failure and rollback', async () => {
            mockMutateAsync.mockRejectedValue(new Error('Backend error'));

            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.updateItemQuantity('item-123', 1);
            });

            expect(mockUpdateQuantity).toHaveBeenCalledWith('item-123', 3, { skipBackendSync: true });

            // Should rollback on error
            expect(mockUpdateQuantity).toHaveBeenCalledWith('item-123', 2, { skipBackendSync: true });
            expect(mockToast.error).toHaveBeenCalledWith('Gagal memperbarui jumlah item');
            expect(mockOnRefetchPayment).toHaveBeenCalled();
        });

        it('should debounce refetch calls', async () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            // Make multiple rapid updates
            await act(async () => {
                await result.current.updateItemQuantity('item-123', 1);
                await result.current.updateItemQuantity('item-123', 1);
                await result.current.updateItemQuantity('item-123', 1);
            });

            // Only advance timer once
            act(() => {
                vi.advanceTimersByTime(350);
            });

            await waitFor(() => {
                expect(mockOnRefetchPayment).toHaveBeenCalledTimes(1); // Should be debounced
            });
        });
    });

    describe('deleteItem function', () => {
        it('should delete item successfully', async () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.deleteItem('item-123');
            });

            expect(mockDeleteItem).toHaveBeenCalledWith('item-123', mockOutletSlug, mockOrderCode);

            // Fast-forward delay
            act(() => {
                vi.advanceTimersByTime(300);
            });

            await waitFor(() => {
                expect(mockOnRefetchPayment).toHaveBeenCalled();
                expect(mockToast.success).toHaveBeenCalledWith('Item berhasil dihapus');
            });
        });

        it('should navigate to home when cart becomes empty', async () => {
            // Mock empty cart after deletion
            mockUseCartStore.getState = vi.fn().mockReturnValue({
                items: [],
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
                clearCart: vi.fn(),
                getTotalItems: vi.fn().mockReturnValue(0),
                getTotalPrice: vi.fn().mockReturnValue(0),
                isCheckoutProcessing: false,
                syncCart: vi.fn(),
                deleteItem: mockDeleteItem,
                updateItem: vi.fn(),
                setCheckoutProcessing: vi.fn()
            });

            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.deleteItem('item-123');
            });

            // Fast-forward delays
            act(() => {
                vi.advanceTimersByTime(500);
            });

            await waitFor(() => {
                expect(mockOnNavigateToHome).toHaveBeenCalled();
            });
        });

        it('should handle missing outlet or order', async () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(undefined, undefined, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.deleteItem('item-123');
            });

            expect(mockToast.error).toHaveBeenCalledWith('Tidak dapat menghapus item: outlet atau order tidak tersedia');
            expect(mockDeleteItem).not.toHaveBeenCalled();
        });

        it('should handle item not found', async () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.deleteItem('non-existent-item');
            });

            expect(mockToast.error).toHaveBeenCalledWith('Item tidak ditemukan dalam keranjang');
            expect(mockDeleteItem).not.toHaveBeenCalled();
        });

        it('should handle delete failure', async () => {
            mockDeleteItem.mockRejectedValue(new Error('Delete failed'));

            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.deleteItem('item-123');
            });

            expect(mockToast.error).toHaveBeenCalledWith('Gagal menghapus item');
            expect(mockOnRefetchPayment).toHaveBeenCalled();
        });
    });

    describe('editItem function', () => {
        it('should navigate to edit page with correct parameters', () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            act(() => {
                result.current.editItem('item-123', 'product-uuid-123', [1, 2], 2, 'Test notes');
            });

            expect(mockNavigateFn).toHaveBeenCalledWith(
                '/test-cafe/detail-item?uuid=product-uuid-123&mode=cart-edit&cartItemId=item-123',
                {
                    state: {
                        cartEditMode: true,
                        cartItemId: 'item-123',
                        productUuid: 'product-uuid-123',
                        variantIds: [1, 2],
                        quantity: 2,
                        note: 'Test notes'
                    }
                }
            );
        });

        it('should handle missing outlet slug', () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(undefined, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            act(() => {
                result.current.editItem('item-123', 'product-uuid-123', [1, 2], 2, 'Test notes');
            });

            expect(mockToast.error).toHaveBeenCalledWith('Outlet tidak tersedia');
            expect(mockNavigateFn).not.toHaveBeenCalled();
        });
    });

    describe('formatOrderItems function', () => {
        it('should format cart items correctly', () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            const formattedItems = result.current.formatOrderItems(mockCartItems);

            expect(formattedItems).toHaveLength(1);
            expect(formattedItems[0]).toEqual({
                id: 'item-123',
                name: 'Test Product',
                notes: 'Test notes',
                price: 25000,
                image: 'test-image.jpg',
                quantity: 2,
                options: ['Extra cheese', 'Large size'],
                orderProductId: 456,
                productId: 123,
                productUuid: 'product-uuid-123',
                variantIds: [1, 2]
            });
        });

        it('should handle empty items array', () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            const formattedItems = result.current.formatOrderItems([]);

            expect(formattedItems).toEqual([]);
        });

        it('should handle items with missing optional fields', () => {
            const itemWithMissingFields: CartItem = {
                id: 'item-456',
                productUuid: 'product-uuid-456',
                name: 'Simple Product',
                price: 15000,
                quantity: 1,
                image: '',
                notes: undefined,
                options: [],
                orderProductId: undefined,
                productId: undefined,
                variantIds: undefined,
                orderCode: undefined
            };

            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            const formattedItems = result.current.formatOrderItems([itemWithMissingFields]);

            expect(formattedItems[0]).toEqual({
                id: 'item-456',
                name: 'Simple Product',
                notes: undefined,
                price: 15000,
                image: '',
                quantity: 1,
                options: [],
                orderProductId: undefined,
                productId: undefined,
                productUuid: 'product-uuid-456',
                variantIds: undefined
            });
        });
    });

    describe('Cleanup', () => {
        it('should clear timeout on unmount', () => {
            const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

            const { unmount } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            unmount();

            // Clear timeout should be called during cleanup
            expect(clearTimeoutSpy).toHaveBeenCalled();
        });
    });

    describe('Type safety', () => {
        it('should provide correct TypeScript types', () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            // Test that the hook returns the correct interface
            const management: CheckoutItemManagement = result.current;
            expect(management).toBeDefined();

            // Test formatted items type
            const formatted: FormattedOrderItem[] = management.formatOrderItems([]);
            expect(Array.isArray(formatted)).toBe(true);
        });
    });

    describe('Edge cases', () => {
        it('should handle concurrent quantity updates properly', async () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            // Simulate concurrent updates
            const promise1 = result.current.updateItemQuantity('item-123', 1);
            const promise2 = result.current.updateItemQuantity('item-123', -1);

            await act(async () => {
                await Promise.all([promise1, promise2]);
            });

            // Both calls should be handled
            expect(mockUpdateQuantity).toHaveBeenCalledTimes(2);
        });

        it('should handle items with zero quantity', async () => {
            const { result } = renderHook(() =>
                useCheckoutItemManagement(mockOutletSlug, mockOrderCode, mockOnRefetchPayment, mockOnNavigateToHome)
            );

            await act(async () => {
                await result.current.updateItemQuantity('item-123', -10);
            });

            expect(mockUpdateQuantity).toHaveBeenCalledWith('item-123', 0, { skipBackendSync: true });
        });
    });
});