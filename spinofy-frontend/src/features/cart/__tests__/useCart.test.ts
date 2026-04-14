import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCart } from '../hooks/useCart';
import { useCartStore } from '../stores/cartStore';

// Mock cart store
vi.mock('../stores/cartStore', () => ({
    useCartStore: vi.fn(),
}));

const mockCartStore = {
    items: [],
    isCheckoutProcessing: false,
    addItem: vi.fn(),
    removeItem: vi.fn(),
    updateQuantity: vi.fn(),
    clearCart: vi.fn(),
    getTotalItems: vi.fn(() => 0),
    getTotalPrice: vi.fn(() => 0),
    syncCart: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    setCheckoutProcessing: vi.fn(),
};

describe('useCart', () => {
    beforeEach(() => {
        vi.mocked(useCartStore).mockReturnValue(mockCartStore);
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should return cart store', () => {
        const { result } = renderHook(() => useCart());

        expect(result.current).toBe(mockCartStore);
        expect(useCartStore).toHaveBeenCalled();
    });

    it('should expose all cart store methods', () => {
        const { result } = renderHook(() => useCart());

        expect(result.current).toHaveProperty('addItem');
        expect(result.current).toHaveProperty('removeItem');
        expect(result.current).toHaveProperty('updateQuantity');
        expect(result.current).toHaveProperty('clearCart');
        expect(result.current).toHaveProperty('getTotalItems');
        expect(result.current).toHaveProperty('getTotalPrice');
        expect(result.current).toHaveProperty('syncCart');
        expect(result.current).toHaveProperty('updateItem');
        expect(result.current).toHaveProperty('deleteItem');
        expect(result.current).toHaveProperty('setCheckoutProcessing');
    });

    it('should expose cart state', () => {
        const { result } = renderHook(() => useCart());

        expect(result.current).toHaveProperty('items');
        expect(result.current).toHaveProperty('isCheckoutProcessing');
    });
});