import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePriceCalculator } from '../hooks/usePriceCalculator';
import { mockProductDetail } from './mockData';

describe('usePriceCalculator', () => {
    describe('calculateUnitPrice', () => {
        it('should calculate base price with no selections', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();

            const unitPrice = result.current.calculateUnitPrice(mockProductDetail, selections);

            expect(unitPrice).toBe(25000); // Base price only
        });

        it('should calculate price with single variant selection', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-2'])); // Medium (+5000)

            const unitPrice = result.current.calculateUnitPrice(mockProductDetail, selections);

            expect(unitPrice).toBe(30000); // 25000 + 5000
        });

        it('should calculate price with multiple variant selections', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-3'])); // Large (+10000)
            selections.set(2, new Set(['2-4', '2-5'])); // Extra Shot (+8000) + Whipped Cream (+5000)

            const unitPrice = result.current.calculateUnitPrice(mockProductDetail, selections);

            expect(unitPrice).toBe(48000); // 25000 + 10000 + 8000 + 5000
        });

        it('should handle default selection with no extra price', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-1'])); // Small (no extra price)

            const unitPrice = result.current.calculateUnitPrice(mockProductDetail, selections);

            expect(unitPrice).toBe(25000); // Base price only
        });

        it('should handle product with no attributes', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const productNoAttrs = { ...mockProductDetail, attributes: [] };
            const selections = new Map<number, Set<string>>();

            const unitPrice = result.current.calculateUnitPrice(productNoAttrs, selections);

            expect(unitPrice).toBe(25000);
        });

        it('should handle product with undefined attributes', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const productNoAttrs = { ...mockProductDetail, attributes: undefined } as any;
            const selections = new Map<number, Set<string>>();

            const unitPrice = result.current.calculateUnitPrice(productNoAttrs, selections);

            expect(unitPrice).toBe(25000);
        });
    });

    describe('calculateTotalPrice', () => {
        it('should calculate total price for quantity 1', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-2'])); // Medium (+5000)

            const totalPrice = result.current.calculateTotalPrice(
                mockProductDetail,
                selections,
                1
            );

            expect(totalPrice).toBe(30000); // (25000 + 5000) * 1
        });

        it('should calculate total price for multiple quantities', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-2'])); // Medium (+5000)

            const totalPrice = result.current.calculateTotalPrice(
                mockProductDetail,
                selections,
                3
            );

            expect(totalPrice).toBe(90000); // (25000 + 5000) * 3
        });

        it('should calculate total price with complex selections', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-3'])); // Large (+10000)
            selections.set(2, new Set(['2-4', '2-5'])); // Extra Shot (+8000) + Whipped Cream (+5000)

            const totalPrice = result.current.calculateTotalPrice(
                mockProductDetail,
                selections,
                2
            );

            expect(totalPrice).toBe(96000); // (25000 + 10000 + 8000 + 5000) * 2
        });

        it('should handle quantity 0', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-2'])); // Medium (+5000)

            const totalPrice = result.current.calculateTotalPrice(
                mockProductDetail,
                selections,
                0
            );

            expect(totalPrice).toBe(0);
        });

        it('should handle large quantities', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();

            const totalPrice = result.current.calculateTotalPrice(
                mockProductDetail,
                selections,
                100
            );

            expect(totalPrice).toBe(2500000); // 25000 * 100
        });
    });

    describe('getBasePrice', () => {
        it('should return base price from product', () => {
            const { result } = renderHook(() => usePriceCalculator());

            const basePrice = result.current.getBasePrice(mockProductDetail);

            expect(basePrice).toBe(25000);
        });

        it('should parse string price to number', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const productWithStringPrice = { ...mockProductDetail, price: '35000' };

            const basePrice = result.current.getBasePrice(productWithStringPrice);

            expect(basePrice).toBe(35000);
            expect(typeof basePrice).toBe('number');
        });

        it('should handle zero price', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const freeProduct = { ...mockProductDetail, price: '0' };

            const basePrice = result.current.getBasePrice(freeProduct);

            expect(basePrice).toBe(0);
        });

        it('should handle large price values', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const expensiveProduct = { ...mockProductDetail, price: '1000000' };

            const basePrice = result.current.getBasePrice(expensiveProduct);

            expect(basePrice).toBe(1000000);
        });
    });

    describe('integration scenarios', () => {
        it('should calculate correctly for typical coffee order', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-3'])); // Large (+10000)
            selections.set(2, new Set(['2-4'])); // Extra Shot (+8000)

            const unitPrice = result.current.calculateUnitPrice(mockProductDetail, selections);
            const totalPrice = result.current.calculateTotalPrice(
                mockProductDetail,
                selections,
                2
            );

            expect(unitPrice).toBe(43000); // 25000 + 10000 + 8000
            expect(totalPrice).toBe(86000); // 43000 * 2
        });

        it('should handle cart edit scenario with existing selections', () => {
            const { result } = renderHook(() => usePriceCalculator());
            // Simulating editing an existing cart item
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-2'])); // Medium (+5000)
            selections.set(2, new Set(['2-5'])); // Whipped Cream (+5000)

            const unitPrice = result.current.calculateUnitPrice(mockProductDetail, selections);
            const totalPrice = result.current.calculateTotalPrice(
                mockProductDetail,
                selections,
                1
            );

            expect(unitPrice).toBe(35000);
            expect(totalPrice).toBe(35000);
        });

        it('should calculate minimum price configuration', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-1'])); // Small (no extra)

            const unitPrice = result.current.calculateUnitPrice(mockProductDetail, selections);
            const basePrice = result.current.getBasePrice(mockProductDetail);

            expect(unitPrice).toBe(basePrice);
        });

        it('should calculate maximum price configuration', () => {
            const { result } = renderHook(() => usePriceCalculator());
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-3'])); // Large (+10000)
            selections.set(2, new Set(['2-4', '2-5'])); // Both toppings (+13000)

            const unitPrice = result.current.calculateUnitPrice(mockProductDetail, selections);

            expect(unitPrice).toBe(48000); // Maximum configuration
        });
    });
});
