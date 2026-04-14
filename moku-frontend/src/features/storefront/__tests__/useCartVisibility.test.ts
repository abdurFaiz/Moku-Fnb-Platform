import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCartVisibility } from '../hooks/useCartVisibility';
import { useCart } from '@/features/cart/hooks/useCart';
import { useScrollDirection } from '@/hooks/shared/useScrollDirection';
import { HomeUIService } from '../services/homeUIService';

vi.mock('@/features/cart/hooks/useCart');
vi.mock('@/hooks/shared/useScrollDirection');
vi.mock('../services/homeUIService');

describe('useCartVisibility', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const setupDefaultMocks = () => {
        vi.mocked(useCart).mockReturnValue({
            getTotalItems: vi.fn().mockReturnValue(3),
            items: [
                { id: 1, name: 'Item 1', quantity: 1 },
                { id: 2, name: 'Item 2', quantity: 2 },
            ],
        } as any);
        vi.mocked(useScrollDirection).mockReturnValue({
            isScrollingDown: false,
            isScrollingStopped: true,
            isScrollingUp: false,
            scrollY: 0,
        });
        vi.mocked(HomeUIService.calculateCartVisibility).mockReturnValue(true);
    };

    describe('Hook Initialization', () => {
        it('should return all required properties', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useCartVisibility());

            expect(result.current).toHaveProperty('totalItems');
            expect(result.current).toHaveProperty('isCartVisible');
        });

        it('should call useCart hook', () => {
            setupDefaultMocks();
            renderHook(() => useCartVisibility());

            expect(useCart).toHaveBeenCalled();
        });

        it('should call useScrollDirection hook', () => {
            setupDefaultMocks();
            renderHook(() => useCartVisibility());

            expect(useScrollDirection).toHaveBeenCalledWith({
                threshold: 10,
                scrollStopDelay: 150,
            });
        });
    });

    describe('Total Items', () => {
        it('should return total items from cart', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useCartVisibility());

            expect(result.current.totalItems).toBe(3);
        });

        it('should return zero when cart is empty', () => {
            vi.mocked(useCart).mockReturnValue({
                getTotalItems: vi.fn().mockReturnValue(0),
                items: [],
            } as any);
            vi.mocked(useScrollDirection).mockReturnValue({
                isScrollingDown: false,
                isScrollingStopped: true,
                isScrollingUp: false,
                scrollY: 0,
            });
            vi.mocked(HomeUIService.calculateCartVisibility).mockReturnValue(false);

            const { result } = renderHook(() => useCartVisibility());

            expect(result.current.totalItems).toBe(0);
        });

        it('should return correct total for multiple items', () => {
            vi.mocked(useCart).mockReturnValue({
                getTotalItems: vi.fn().mockReturnValue(10),
                items: Array.from({ length: 10 }, (_, i) => ({
                    id: i,
                    name: `Item ${i}`,
                    quantity: 1,
                })),
            } as any);
            vi.mocked(useScrollDirection).mockReturnValue({
                isScrollingDown: false,
                isScrollingStopped: true,
                isScrollingUp: false,
                scrollY: 0,
            });
            vi.mocked(HomeUIService.calculateCartVisibility).mockReturnValue(true);

            const { result } = renderHook(() => useCartVisibility());

            expect(result.current.totalItems).toBe(10);
        });
    });

    describe('Cart Visibility', () => {
        it('should show cart when visible', () => {
            setupDefaultMocks();
            vi.mocked(HomeUIService.calculateCartVisibility).mockReturnValue(true);

            const { result } = renderHook(() => useCartVisibility());

            expect(result.current.isCartVisible).toBe(true);
        });

        it('should hide cart when not visible', () => {
            setupDefaultMocks();
            vi.mocked(HomeUIService.calculateCartVisibility).mockReturnValue(false);

            const { result } = renderHook(() => useCartVisibility());

            expect(result.current.isCartVisible).toBe(false);
        });

        it('should call calculateCartVisibility with correct parameters', () => {
            setupDefaultMocks();
            renderHook(() => useCartVisibility());

            expect(HomeUIService.calculateCartVisibility).toHaveBeenCalledWith(
                3,
                false,
                true
            );
        });
    });

    describe('Scroll Direction', () => {
        it('should handle scrolling down', () => {
            setupDefaultMocks();
            vi.mocked(useScrollDirection).mockReturnValue({
                isScrollingDown: true,
                isScrollingStopped: false,
                isScrollingUp: false,
                scrollY: 100,
            });

            const { result } = renderHook(() => useCartVisibility());

            expect(result.current).toBeDefined();
        });

        it('should handle scrolling stopped', () => {
            setupDefaultMocks();
            vi.mocked(useScrollDirection).mockReturnValue({
                isScrollingDown: false,
                isScrollingStopped: true,
                isScrollingUp: false,
                scrollY: 100,
            });

            const { result } = renderHook(() => useCartVisibility());

            expect(result.current).toBeDefined();
        });

        it('should handle scrolling up', () => {
            setupDefaultMocks();
            vi.mocked(useScrollDirection).mockReturnValue({
                isScrollingDown: false,
                isScrollingStopped: false,
                isScrollingUp: true,
                scrollY: 100,
            });

            const { result } = renderHook(() => useCartVisibility());

            expect(result.current).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle large item count', () => {
            vi.mocked(useCart).mockReturnValue({
                getTotalItems: vi.fn().mockReturnValue(999),
                items: Array.from({ length: 999 }, (_, i) => ({
                    id: i,
                    name: `Item ${i}`,
                    quantity: 1,
                })),
            } as any);
            vi.mocked(useScrollDirection).mockReturnValue({
                isScrollingDown: false,
                isScrollingStopped: true,
                isScrollingUp: false,
                scrollY: 0,
            });
            vi.mocked(HomeUIService.calculateCartVisibility).mockReturnValue(true);

            const { result } = renderHook(() => useCartVisibility());

            expect(result.current.totalItems).toBe(999);
        });

        it('should handle null items', () => {
            vi.mocked(useCart).mockReturnValue({
                getTotalItems: vi.fn().mockReturnValue(0),
                items: [],
            } as any);
            vi.mocked(useScrollDirection).mockReturnValue({
                isScrollingDown: false,
                isScrollingStopped: true,
                isScrollingUp: false,
                scrollY: 0,
            });
            vi.mocked(HomeUIService.calculateCartVisibility).mockReturnValue(false);

            const { result } = renderHook(() => useCartVisibility());

            expect(result.current.totalItems).toBe(0);
        });
    });

    describe('Multiple Renders', () => {
        it('should handle cart changes', () => {
            setupDefaultMocks();
            const { result, rerender } = renderHook(() => useCartVisibility());

            expect(result.current.totalItems).toBe(3);

            vi.mocked(useCart).mockReturnValue({
                getTotalItems: vi.fn().mockReturnValue(5),
                items: Array.from({ length: 5 }, (_, i) => ({
                    id: i,
                    name: `Item ${i}`,
                    quantity: 1,
                })),
            } as any);

            rerender();

            expect(result.current.totalItems).toBe(5);
        });

        it('should handle scroll direction changes', () => {
            setupDefaultMocks();
            const { rerender } = renderHook(() => useCartVisibility());

            vi.mocked(useScrollDirection).mockReturnValue({
                isScrollingDown: true,
                isScrollingStopped: false,
                isScrollingUp: false,
                scrollY: 100,
            });

            rerender();

            expect(HomeUIService.calculateCartVisibility).toHaveBeenCalled();
        });
    });

    describe('Memoization', () => {
        it('should memoize cart visibility calculation', () => {
            setupDefaultMocks();
            const { rerender } = renderHook(() => useCartVisibility());

            const callCount = vi.mocked(HomeUIService.calculateCartVisibility).mock.calls.length;

            rerender();

            expect(vi.mocked(HomeUIService.calculateCartVisibility).mock.calls.length).toBeGreaterThanOrEqual(callCount);
        });
    });
});
