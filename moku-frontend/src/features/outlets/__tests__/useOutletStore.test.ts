import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOutletStore } from '../stores/useOutletStore';
import { useCartStore } from '@/features/cart/stores/cartStore';
import { mockOutlet, mockOutlet2 } from './mockData';
import './setup';

vi.mock('@/features/cart/stores/cartStore', () => ({
    useCartStore: {
        getState: vi.fn(() => ({
            clearCart: vi.fn(),
        })),
    },
}));

describe('useOutletStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        const { result } = renderHook(() => useOutletStore());
        act(() => {
            result.current.clearCurrentOutlet();
        });
        vi.clearAllMocks();
        window.localStorage.clear();
    });

    describe('Initial State', () => {
        it('should have null initial values', () => {
            const { result } = renderHook(() => useOutletStore());

            expect(result.current.currentOutlet).toBeNull();
            expect(result.current.outletSlug).toBeNull();
            expect(result.current.outletType).toBeNull();
        });

        it('should return false for isOutletSelected initially', () => {
            const { result } = renderHook(() => useOutletStore());

            expect(result.current.isOutletSelected()).toBe(false);
        });

        it('should return null for getOutletType initially', () => {
            const { result } = renderHook(() => useOutletStore());

            expect(result.current.getOutletType()).toBeNull();
        });
    });

    describe('setCurrentOutlet', () => {
        it('should set current outlet correctly', () => {
            const { result } = renderHook(() => useOutletStore());

            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            expect(result.current.currentOutlet).toEqual(mockOutlet);
            expect(result.current.outletSlug).toBe(mockOutlet.slug);
            expect(result.current.outletType).toBe(mockOutlet.type);
        });

        it('should clear cart when changing to different outlet', () => {
            const { result } = renderHook(() => useOutletStore());
            const clearCartMock = vi.fn();
            vi.mocked(useCartStore.getState).mockReturnValue({
                clearCart: clearCartMock,
            } as any);

            // Set first outlet
            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            // Change to different outlet
            act(() => {
                result.current.setCurrentOutlet(mockOutlet2);
            });

            expect(clearCartMock).toHaveBeenCalled();
        });

        it('should not clear cart when setting same outlet', () => {
            const { result } = renderHook(() => useOutletStore());
            const clearCartMock = vi.fn();
            vi.mocked(useCartStore.getState).mockReturnValue({
                clearCart: clearCartMock,
            } as any);

            // Set outlet
            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            clearCartMock.mockClear();

            // Set same outlet again
            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            expect(clearCartMock).not.toHaveBeenCalled();
        });

        it('should remove currentOrderCode from localStorage when changing outlet', () => {
            const { result } = renderHook(() => useOutletStore());
            window.localStorage.setItem('currentOrderCode', 'ORDER-123');

            // Set first outlet
            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            // Change to different outlet
            act(() => {
                result.current.setCurrentOutlet(mockOutlet2);
            });

            expect(window.localStorage.getItem('currentOrderCode')).toBeNull();
        });

        it('should update isOutletSelected to true after setting outlet', () => {
            const { result } = renderHook(() => useOutletStore());

            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            expect(result.current.isOutletSelected()).toBe(true);
        });

        it('should update getOutletType after setting outlet', () => {
            const { result } = renderHook(() => useOutletStore());

            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            expect(result.current.getOutletType()).toBe(mockOutlet.type);
        });
    });

    describe('syncOutletSlug', () => {
        it('should sync outlet slug when provided', () => {
            const { result } = renderHook(() => useOutletStore());

            act(() => {
                result.current.syncOutletSlug('test-outlet');
            });

            expect(result.current.outletSlug).toBe('test-outlet');
        });

        it('should not sync when slug is null', () => {
            const { result } = renderHook(() => useOutletStore());

            act(() => {
                result.current.syncOutletSlug('initial-slug');
            });

            act(() => {
                result.current.syncOutletSlug(null);
            });

            expect(result.current.outletSlug).toBe('initial-slug');
        });

        it('should not sync when slug is the same', () => {
            const { result } = renderHook(() => useOutletStore());
            const clearCartMock = vi.fn();
            vi.mocked(useCartStore.getState).mockReturnValue({
                clearCart: clearCartMock,
            } as any);

            act(() => {
                result.current.syncOutletSlug('test-outlet');
            });

            clearCartMock.mockClear();

            act(() => {
                result.current.syncOutletSlug('test-outlet');
            });

            expect(clearCartMock).not.toHaveBeenCalled();
        });

        it('should clear cart when syncing different slug', () => {
            const { result } = renderHook(() => useOutletStore());
            const clearCartMock = vi.fn();
            vi.mocked(useCartStore.getState).mockReturnValue({
                clearCart: clearCartMock,
            } as any);

            act(() => {
                result.current.syncOutletSlug('outlet-1');
            });

            act(() => {
                result.current.syncOutletSlug('outlet-2');
            });

            expect(clearCartMock).toHaveBeenCalled();
        });

        it('should clear currentOutlet when slug does not match', () => {
            const { result } = renderHook(() => useOutletStore());

            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            act(() => {
                result.current.syncOutletSlug('different-slug');
            });

            expect(result.current.currentOutlet).toBeNull();
            expect(result.current.outletType).toBeNull();
        });

        it('should preserve currentOutlet when slug matches', () => {
            const { result } = renderHook(() => useOutletStore());

            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            act(() => {
                result.current.syncOutletSlug(mockOutlet.slug);
            });

            expect(result.current.currentOutlet).toEqual(mockOutlet);
            expect(result.current.outletType).toBe(mockOutlet.type);
        });

        it('should remove currentOrderCode when syncing different slug', () => {
            const { result } = renderHook(() => useOutletStore());
            window.localStorage.setItem('currentOrderCode', 'ORDER-123');

            act(() => {
                result.current.syncOutletSlug('outlet-1');
            });

            act(() => {
                result.current.syncOutletSlug('outlet-2');
            });

            expect(window.localStorage.getItem('currentOrderCode')).toBeNull();
        });
    });

    describe('clearCurrentOutlet', () => {
        it('should clear all outlet data', () => {
            const { result } = renderHook(() => useOutletStore());

            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            act(() => {
                result.current.clearCurrentOutlet();
            });

            expect(result.current.currentOutlet).toBeNull();
            expect(result.current.outletSlug).toBeNull();
            expect(result.current.outletType).toBeNull();
        });

        it('should clear cart when clearing outlet', () => {
            const { result } = renderHook(() => useOutletStore());
            const clearCartMock = vi.fn();
            vi.mocked(useCartStore.getState).mockReturnValue({
                clearCart: clearCartMock,
            } as any);

            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            act(() => {
                result.current.clearCurrentOutlet();
            });

            expect(clearCartMock).toHaveBeenCalled();
        });

        it('should remove currentOrderCode from localStorage', () => {
            const { result } = renderHook(() => useOutletStore());
            window.localStorage.setItem('currentOrderCode', 'ORDER-123');

            act(() => {
                result.current.clearCurrentOutlet();
            });

            expect(window.localStorage.getItem('currentOrderCode')).toBeNull();
        });

        it('should update isOutletSelected to false', () => {
            const { result } = renderHook(() => useOutletStore());

            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            act(() => {
                result.current.clearCurrentOutlet();
            });

            expect(result.current.isOutletSelected()).toBe(false);
        });

        it('should update getOutletType to null', () => {
            const { result } = renderHook(() => useOutletStore());

            act(() => {
                result.current.setCurrentOutlet(mockOutlet);
            });

            act(() => {
                result.current.clearCurrentOutlet();
            });

            expect(result.current.getOutletType()).toBeNull();
        });
    });

    describe('Persistence', () => {
        it('should persist outlet data to localStorage', () => {
            const { result: result1 } = renderHook(() => useOutletStore());

            act(() => {
                result1.current.setCurrentOutlet(mockOutlet);
            });

            // Create new hook instance to verify persistence
            const { result: result2 } = renderHook(() => useOutletStore());

            // If data persisted, the new instance should have it
            expect(result2.current.outletSlug).toBe(mockOutlet.slug);
            expect(result2.current.currentOutlet).toEqual(mockOutlet);
        });

        it('should restore outlet data from localStorage', () => {
            // Set data in first hook instance
            const { result: result1 } = renderHook(() => useOutletStore());
            act(() => {
                result1.current.setCurrentOutlet(mockOutlet);
            });

            // Create new hook instance (simulating page reload)
            const { result: result2 } = renderHook(() => useOutletStore());

            expect(result2.current.outletSlug).toBe(mockOutlet.slug);
            expect(result2.current.outletType).toBe(mockOutlet.type);
        });
    });
});
