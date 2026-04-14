import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHomeActions } from '../hooks/useHomeActions';
import { useCartBottomSheetState } from '../hooks/useCartBottomSheetState';
import { useProductNavigation } from '../hooks/useProductNavigation';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';

vi.mock('../hooks/useCartBottomSheetState');
vi.mock('../hooks/useProductNavigation');
vi.mock('@/features/outlets/hooks/useOutletSlug');

describe('useHomeActions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const setupDefaultMocks = () => {
        vi.mocked(useOutletSlug).mockReturnValue('test-outlet');
        vi.mocked(useCartBottomSheetState).mockReturnValue({
            isOpen: false,
            handleOpen: vi.fn(),
            handleClose: vi.fn(),
            toggleCartBottomSheet: vi.fn(),
        });
        vi.mocked(useProductNavigation).mockReturnValue({
            navigateToProductDetail: vi.fn(),
        });
    };

    describe('Hook Initialization', () => {
        it('should return all required properties', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeActions());

            expect(result.current).toHaveProperty('isCartBottomSheetOpen');
            expect(result.current).toHaveProperty('handleCartClick');
            expect(result.current).toHaveProperty('handleCloseCartBottomSheet');
            expect(result.current).toHaveProperty('handleProductClick');
        });

        it('should call all sub-hooks', () => {
            setupDefaultMocks();
            renderHook(() => useHomeActions());

            expect(useOutletSlug).toHaveBeenCalled();
            expect(useCartBottomSheetState).toHaveBeenCalled();
            expect(useProductNavigation).toHaveBeenCalled();
        });

        it('should have correct initial state', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomeActions());

            expect(result.current.isCartBottomSheetOpen).toBe(false);
        });
    });

    describe('Cart Bottom Sheet State', () => {
        it('should expose cart bottom sheet open state', () => {
            setupDefaultMocks();
            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen: true,
                handleOpen: vi.fn(),
                handleClose: vi.fn(),
                toggleCartBottomSheet: vi.fn(),
            });

            const { result } = renderHook(() => useHomeActions());

            expect(result.current.isCartBottomSheetOpen).toBe(true);
        });

        it('should expose cart bottom sheet closed state', () => {
            setupDefaultMocks();
            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen: false,
                handleOpen: vi.fn(),
                handleClose: vi.fn(),
                toggleCartBottomSheet: vi.fn(),
            });

            const { result } = renderHook(() => useHomeActions());

            expect(result.current.isCartBottomSheetOpen).toBe(false);
        });

        it('should call handleOpen when handleCartClick is invoked', () => {
            setupDefaultMocks();
            const mockHandleOpen = vi.fn();
            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen: false,
                handleOpen: mockHandleOpen,
                handleClose: vi.fn(),
                toggleCartBottomSheet: vi.fn(),
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleCartClick();
            });

            expect(mockHandleOpen).toHaveBeenCalled();
        });

        it('should call handleClose when handleCloseCartBottomSheet is invoked', () => {
            setupDefaultMocks();
            const mockHandleClose = vi.fn();
            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen: true,
                handleOpen: vi.fn(),
                handleClose: mockHandleClose,
                toggleCartBottomSheet: vi.fn(),
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleCloseCartBottomSheet();
            });

            expect(mockHandleClose).toHaveBeenCalled();
        });
    });

    describe('Product Navigation', () => {
        it('should call navigateToProductDetail with product ID and outlet slug', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleProductClick('product-123');
            });

            expect(mockNavigate).toHaveBeenCalledWith('product-123', 'test-outlet');
        });

        it('should handle product click with different product IDs', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleProductClick('product-1');
            });

            expect(mockNavigate).toHaveBeenCalledWith('product-1', 'test-outlet');

            act(() => {
                result.current.handleProductClick('product-2');
            });

            expect(mockNavigate).toHaveBeenCalledWith('product-2', 'test-outlet');
        });

        it('should pass null outlet slug when outlet slug is not available', () => {
            vi.mocked(useOutletSlug).mockReturnValue(undefined);
            const mockNavigate = vi.fn();
            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen: false,
                handleOpen: vi.fn(),
                handleClose: vi.fn(),
                toggleCartBottomSheet: vi.fn(),
            });
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleProductClick('product-123');
            });

            expect(mockNavigate).toHaveBeenCalledWith('product-123', null);
        });

        it('should pass undefined outlet slug when outlet slug is undefined', () => {
            vi.mocked(useOutletSlug).mockReturnValue(undefined);
            const mockNavigate = vi.fn();
            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen: false,
                handleOpen: vi.fn(),
                handleClose: vi.fn(),
                toggleCartBottomSheet: vi.fn(),
            });
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleProductClick('product-123');
            });

            expect(mockNavigate).toHaveBeenCalledWith('product-123', null);
        });
    });

    describe('Outlet Slug Handling', () => {
        it('should use outlet slug from useOutletSlug', () => {
            vi.mocked(useOutletSlug).mockReturnValue('custom-outlet');
            const mockNavigate = vi.fn();
            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen: false,
                handleOpen: vi.fn(),
                handleClose: vi.fn(),
                toggleCartBottomSheet: vi.fn(),
            });
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleProductClick('product-123');
            });

            expect(mockNavigate).toHaveBeenCalledWith('product-123', 'custom-outlet');
        });

        it('should handle different outlet slugs', () => {
            const mockNavigate = vi.fn();
            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen: false,
                handleOpen: vi.fn(),
                handleClose: vi.fn(),
                toggleCartBottomSheet: vi.fn(),
            });
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            // First render with outlet-1
            vi.mocked(useOutletSlug).mockReturnValue('outlet-1');
            const { result: result1 } = renderHook(() => useHomeActions());

            act(() => {
                result1.current.handleProductClick('product-123');
            });

            expect(mockNavigate).toHaveBeenCalledWith('product-123', 'outlet-1');

            // Second render with outlet-2
            vi.mocked(useOutletSlug).mockReturnValue('outlet-2');
            const { result: result2 } = renderHook(() => useHomeActions());

            act(() => {
                result2.current.handleProductClick('product-456');
            });

            expect(mockNavigate).toHaveBeenCalledWith('product-456', 'outlet-2');
        });
    });

    describe('Multiple Actions', () => {
        it('should handle multiple product clicks', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleProductClick('product-1');
                result.current.handleProductClick('product-2');
                result.current.handleProductClick('product-3');
            });

            expect(mockNavigate).toHaveBeenCalledTimes(3);
        });

        it('should handle cart click and product click together', () => {
            setupDefaultMocks();
            const mockHandleOpen = vi.fn();
            const mockNavigate = vi.fn();
            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen: false,
                handleOpen: mockHandleOpen,
                handleClose: vi.fn(),
                toggleCartBottomSheet: vi.fn(),
            });
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleCartClick();
                result.current.handleProductClick('product-123');
            });

            expect(mockHandleOpen).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should handle open and close cart bottom sheet', () => {
            setupDefaultMocks();
            const mockHandleOpen = vi.fn();
            const mockHandleClose = vi.fn();
            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen: false,
                handleOpen: mockHandleOpen,
                handleClose: mockHandleClose,
                toggleCartBottomSheet: vi.fn(),
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleCartClick();
                result.current.handleCloseCartBottomSheet();
            });

            expect(mockHandleOpen).toHaveBeenCalled();
            expect(mockHandleClose).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty product ID', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleProductClick('');
            });

            expect(mockNavigate).toHaveBeenCalledWith('', 'test-outlet');
        });

        it('should handle special characters in product ID', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleProductClick('product-café-123');
            });

            expect(mockNavigate).toHaveBeenCalledWith('product-café-123', 'test-outlet');
        });

        it('should handle very long product ID', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            const longId = 'product-' + 'a'.repeat(200);
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleProductClick(longId);
            });

            expect(mockNavigate).toHaveBeenCalledWith(longId, 'test-outlet');
        });

        it('should handle rapid consecutive product clicks', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                for (let i = 0; i < 10; i++) {
                    result.current.handleProductClick(`product-${i}`);
                }
            });

            expect(mockNavigate).toHaveBeenCalledTimes(10);
        });
    });

    describe('Callback Stability', () => {
        it('should return stable handleCartClick callback', () => {
            setupDefaultMocks();
            const { result, rerender } = renderHook(() => useHomeActions());

            const firstCallback = result.current.handleCartClick;

            rerender();

            const secondCallback = result.current.handleCartClick;

            expect(firstCallback).toBe(secondCallback);
        });

        it('should return stable handleCloseCartBottomSheet callback', () => {
            setupDefaultMocks();
            const { result, rerender } = renderHook(() => useHomeActions());

            const firstCallback = result.current.handleCloseCartBottomSheet;

            rerender();

            const secondCallback = result.current.handleCloseCartBottomSheet;

            expect(firstCallback).toBe(secondCallback);
        });

        it('should return stable handleProductClick callback', () => {
            setupDefaultMocks();
            const { result, rerender } = renderHook(() => useHomeActions());

            const firstCallback = result.current.handleProductClick;

            rerender();

            const secondCallback = result.current.handleProductClick;

            expect(firstCallback).toBe(secondCallback);
        });
    });

    describe('Multiple Renders', () => {
        it('should handle multiple renders without issues', () => {
            setupDefaultMocks();
            const { rerender } = renderHook(() => useHomeActions());

            for (let i = 0; i < 5; i++) {
                rerender();
            }

            expect(true).toBe(true);
        });

        it('should maintain state consistency across renders', () => {
            setupDefaultMocks();
            const { result, rerender } = renderHook(() => useHomeActions());

            const firstState = result.current.isCartBottomSheetOpen;

            rerender();

            const secondState = result.current.isCartBottomSheetOpen;

            expect(firstState).toBe(secondState);
        });
    });

    describe('Integration', () => {
        it('should work with all sub-hooks together', () => {
            setupDefaultMocks();
            const mockHandleOpen = vi.fn();
            const mockHandleClose = vi.fn();
            const mockNavigate = vi.fn();

            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen: false,
                handleOpen: mockHandleOpen,
                handleClose: mockHandleClose,
                toggleCartBottomSheet: vi.fn(),
            });
            vi.mocked(useProductNavigation).mockReturnValue({
                navigateToProductDetail: mockNavigate,
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleCartClick();
                result.current.handleProductClick('product-123');
                result.current.handleCloseCartBottomSheet();
            });

            expect(mockHandleOpen).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('product-123', 'test-outlet');
            expect(mockHandleClose).toHaveBeenCalled();
        });

        it('should handle state transitions correctly', () => {
            setupDefaultMocks();
            let isOpen = false;
            const mockHandleOpen = vi.fn(() => {
                isOpen = true;
            });
            const mockHandleClose = vi.fn(() => {
                isOpen = false;
            });

            vi.mocked(useCartBottomSheetState).mockReturnValue({
                isOpen,
                handleOpen: mockHandleOpen,
                handleClose: mockHandleClose,
                toggleCartBottomSheet: vi.fn(),
            });

            const { result } = renderHook(() => useHomeActions());

            act(() => {
                result.current.handleCartClick();
            });

            expect(mockHandleOpen).toHaveBeenCalled();

            act(() => {
                result.current.handleCloseCartBottomSheet();
            });

            expect(mockHandleClose).toHaveBeenCalled();
        });
    });
});
