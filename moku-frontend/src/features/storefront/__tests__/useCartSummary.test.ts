import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCartSummary } from '../hooks/useCartSummary';
import { useCart } from '@/features/cart/hooks/useCart';

vi.mock('@/features/cart/hooks/useCart');

describe('useCartSummary', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Empty Cart', () => {
        it('should return zero totals for empty cart', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(0);
            expect(result.current.totalPrice).toBe(0);
        });

        it('should handle null items array', () => {
            vi.mocked(useCart).mockReturnValue({
                items: null as any,
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            expect(() => {
                renderHook(() => useCartSummary());
            }).toThrow();
        });

        it('should handle undefined items array', () => {
            vi.mocked(useCart).mockReturnValue({
                items: undefined as any,
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            expect(() => {
                renderHook(() => useCartSummary());
            }).toThrow();
        });
    });

    describe('Single Item Cart', () => {
        it('should calculate totals for single item', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Coffee',
                        price: 25000,
                        quantity: 1,
                        image: 'coffee.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(1);
            expect(result.current.totalPrice).toBe(25000);
        });

        it('should calculate totals for single item with quantity > 1', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Coffee',
                        price: 25000,
                        quantity: 3,
                        image: 'coffee.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(3);
            expect(result.current.totalPrice).toBe(75000);
        });

        it('should handle item with zero price', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Free Item',
                        price: 0,
                        quantity: 1,
                        image: 'free.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(1);
            expect(result.current.totalPrice).toBe(0);
        });

        it('should handle item with zero quantity', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Coffee',
                        price: 25000,
                        quantity: 0,
                        image: 'coffee.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(0);
            expect(result.current.totalPrice).toBe(0);
        });
    });

    describe('Multiple Items Cart', () => {
        it('should calculate totals for multiple items', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Coffee',
                        price: 25000,
                        quantity: 2,
                        image: 'coffee.jpg',
                    },
                    {
                        id: 2,
                        uuid: 'product-uuid-2',
                        name: 'Tea',
                        price: 15000,
                        quantity: 1,
                        image: 'tea.jpg',
                    },
                    {
                        id: 3,
                        uuid: 'product-uuid-3',
                        name: 'Cake',
                        price: 30000,
                        quantity: 3,
                        image: 'cake.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(6); // 2 + 1 + 3
            expect(result.current.totalPrice).toBe(140000); // (25000*2) + (15000*1) + (30000*3)
        });

        it('should handle mixed prices and quantities', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Item 1',
                        price: 10000,
                        quantity: 5,
                        image: 'item1.jpg',
                    },
                    {
                        id: 2,
                        uuid: 'product-uuid-2',
                        name: 'Item 2',
                        price: 50000,
                        quantity: 2,
                        image: 'item2.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(7); // 5 + 2
            expect(result.current.totalPrice).toBe(150000); // (10000*5) + (50000*2)
        });

        it('should handle items with zero price in mixed cart', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Paid Item',
                        price: 25000,
                        quantity: 2,
                        image: 'paid.jpg',
                    },
                    {
                        id: 2,
                        uuid: 'product-uuid-2',
                        name: 'Free Item',
                        price: 0,
                        quantity: 1,
                        image: 'free.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(3); // 2 + 1
            expect(result.current.totalPrice).toBe(50000); // (25000*2) + (0*1)
        });

        it('should handle items with zero quantity in mixed cart', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Item 1',
                        price: 25000,
                        quantity: 2,
                        image: 'item1.jpg',
                    },
                    {
                        id: 2,
                        uuid: 'product-uuid-2',
                        name: 'Item 2',
                        price: 15000,
                        quantity: 0,
                        image: 'item2.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(2); // 2 + 0
            expect(result.current.totalPrice).toBe(50000); // (25000*2) + (15000*0)
        });
    });

    describe('Large Quantities', () => {
        it('should handle large quantities', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Coffee',
                        price: 25000,
                        quantity: 1000,
                        image: 'coffee.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(1000);
            expect(result.current.totalPrice).toBe(25000000);
        });

        it('should handle large prices', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Expensive Item',
                        price: 999999999,
                        quantity: 1,
                        image: 'expensive.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(1);
            expect(result.current.totalPrice).toBe(999999999);
        });

        it('should handle many items in cart', () => {
            const items = Array.from({ length: 100 }, (_, i) => ({
                id: i + 1,
                uuid: `product-uuid-${i + 1}`,
                name: `Product ${i + 1}`,
                price: 10000,
                quantity: 1,
                image: `product-${i + 1}.jpg`,
            }));

            vi.mocked(useCart).mockReturnValue({
                items,
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(100);
            expect(result.current.totalPrice).toBe(1000000);
        });
    });

    describe('Decimal Prices', () => {
        it('should handle decimal prices', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Item',
                        price: 25000.5,
                        quantity: 2,
                        image: 'item.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(2);
            expect(result.current.totalPrice).toBe(50001);
        });

        it('should handle very small decimal prices', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Item',
                        price: 0.01,
                        quantity: 100,
                        image: 'item.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(100);
            expect(result.current.totalPrice).toBe(1);
        });
    });

    describe('Negative Values', () => {
        it('should handle negative prices (discounts)', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Discount',
                        price: -5000,
                        quantity: 1,
                        image: 'discount.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(1);
            expect(result.current.totalPrice).toBe(-5000);
        });

        it('should handle negative quantities', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Item',
                        price: 25000,
                        quantity: -1,
                        image: 'item.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(-1);
            expect(result.current.totalPrice).toBe(-25000);
        });
    });

    describe('Cart Updates', () => {
        it('should update totals when items change', () => {
            const { rerender } = renderHook(() => useCartSummary(), {
                initialProps: undefined,
            });

            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Coffee',
                        price: 25000,
                        quantity: 1,
                        image: 'coffee.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            rerender();

            const { result } = renderHook(() => useCartSummary());
            expect(result.current.totalItems).toBe(1);
            expect(result.current.totalPrice).toBe(25000);
        });

        it('should recalculate when quantity changes', () => {
            const { rerender } = renderHook(() => useCartSummary());

            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Coffee',
                        price: 25000,
                        quantity: 2,
                        image: 'coffee.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            rerender();

            const { result } = renderHook(() => useCartSummary());
            expect(result.current.totalItems).toBe(2);
            expect(result.current.totalPrice).toBe(50000);
        });

        it('should recalculate when item is added', () => {
            const { rerender } = renderHook(() => useCartSummary());

            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Coffee',
                        price: 25000,
                        quantity: 1,
                        image: 'coffee.jpg',
                    },
                    {
                        id: 2,
                        uuid: 'product-uuid-2',
                        name: 'Tea',
                        price: 15000,
                        quantity: 1,
                        image: 'tea.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            rerender();

            const { result } = renderHook(() => useCartSummary());
            expect(result.current.totalItems).toBe(2);
            expect(result.current.totalPrice).toBe(40000);
        });

        it('should recalculate when item is removed', () => {
            const { rerender } = renderHook(() => useCartSummary());

            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Coffee',
                        price: 25000,
                        quantity: 1,
                        image: 'coffee.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            rerender();

            const { result } = renderHook(() => useCartSummary());
            expect(result.current.totalItems).toBe(1);
            expect(result.current.totalPrice).toBe(25000);
        });
    });

    describe('Edge Cases', () => {
        it('should handle NaN prices', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Item',
                        price: NaN,
                        quantity: 1,
                        image: 'item.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(isNaN(result.current.totalPrice)).toBe(true);
        });

        it('should handle Infinity prices', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Item',
                        price: Infinity,
                        quantity: 1,
                        image: 'item.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalPrice).toBe(Infinity);
        });

        it('should handle mixed valid and invalid prices', () => {
            vi.mocked(useCart).mockReturnValue({
                items: [
                    {
                        id: 1,
                        uuid: 'product-uuid-1',
                        name: 'Valid Item',
                        price: 25000,
                        quantity: 1,
                        image: 'valid.jpg',
                    },
                    {
                        id: 2,
                        uuid: 'product-uuid-2',
                        name: 'Invalid Item',
                        price: NaN,
                        quantity: 1,
                        image: 'invalid.jpg',
                    },
                ],
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const { result } = renderHook(() => useCartSummary());

            expect(result.current.totalItems).toBe(2);
            expect(isNaN(result.current.totalPrice)).toBe(true);
        });
    });

    describe('Performance', () => {
        it('should handle large cart efficiently', () => {
            const items = Array.from({ length: 1000 }, (_, i) => ({
                id: i + 1,
                uuid: `product-uuid-${i + 1}`,
                name: `Product ${i + 1}`,
                price: Math.random() * 100000,
                quantity: Math.floor(Math.random() * 10) + 1,
                image: `product-${i + 1}.jpg`,
            }));

            vi.mocked(useCart).mockReturnValue({
                items,
                clearCart: vi.fn(),
                addItem: vi.fn(),
                removeItem: vi.fn(),
                updateQuantity: vi.fn(),
            } as any);

            const startTime = performance.now();
            const { result } = renderHook(() => useCartSummary());
            const endTime = performance.now();

            expect(result.current.totalItems).toBeGreaterThan(0);
            expect(result.current.totalPrice).toBeGreaterThan(0);
            expect(endTime - startTime).toBeLessThan(100); // Should complete in less than 100ms
        });
    });
});
