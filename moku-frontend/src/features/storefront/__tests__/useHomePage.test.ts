import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useHomePage } from '../hooks/useHomePage';
import { useCartSummary } from '../hooks/useCartSummary';
import { useCartVisibility } from '../hooks/useCartVisibility';
import { useHomeActions } from '../hooks/useHomeActions';
import { useHomeData } from '../hooks/useHomeData';

vi.mock('../hooks/useCartSummary');
vi.mock('../hooks/useCartVisibility');
vi.mock('../hooks/useHomeActions');
vi.mock('../hooks/useHomeData');

describe('useHomePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const setupDefaultMocks = () => {
        vi.mocked(useHomeData).mockReturnValue({
            userData: { id: 1, name: 'Test User' } as any,
            products: [{ id: 1, name: 'Product 1' }] as any,
            categories: [{ id: 1, name: 'Category 1' }] as any,
            outlets: [{ id: 1, slug: 'test-outlet' }] as any,
            currentOutlet: { id: 1, slug: 'test-outlet' } as any,
            banners: [{ id: 1, title: 'Banner 1' }] as any,
            isLoading: false,
            isPending: false,
            isError: false,
            error: null,
            isFetching: false,
            refreshData: vi.fn().mockResolvedValue(undefined),
            invalidateHomeData: vi.fn().mockResolvedValue(undefined),
        });

        vi.mocked(useCartVisibility).mockReturnValue({
            isCartVisible: false,
            totalItems: 0,
        });

        vi.mocked(useCartSummary).mockReturnValue({
            totalPrice: 0,
            totalItems: 0,
        });

        vi.mocked(useHomeActions).mockReturnValue({
            handleProductClick: vi.fn(),
            isCartBottomSheetOpen: false,
            handleCartClick: vi.fn(),
            handleCloseCartBottomSheet: vi.fn(),
        });
    };

    describe('Hook Initialization', () => {
        it('should return all required properties from composed hooks', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomePage());

            // From useHomeData
            expect(result.current).toHaveProperty('userData');
            expect(result.current).toHaveProperty('products');
            expect(result.current).toHaveProperty('categories');
            expect(result.current).toHaveProperty('outlets');
            expect(result.current).toHaveProperty('currentOutlet');
            expect(result.current).toHaveProperty('banners');
            expect(result.current).toHaveProperty('isLoading');
            expect(result.current).toHaveProperty('isPending');
            expect(result.current).toHaveProperty('isError');
            expect(result.current).toHaveProperty('error');
            expect(result.current).toHaveProperty('isFetching');
            expect(result.current).toHaveProperty('refreshData');
            expect(result.current).toHaveProperty('invalidateHomeData');

            // From useCartVisibility
            expect(result.current).toHaveProperty('isCartVisible');
            expect(result.current).toHaveProperty('totalItems');

            // From useCartSummary
            expect(result.current).toHaveProperty('totalPrice');

            // From useHomeActions
            expect(result.current).toHaveProperty('handleProductClick');
            expect(result.current).toHaveProperty('isCartBottomSheetOpen');
            expect(result.current).toHaveProperty('handleCartClick');
            expect(result.current).toHaveProperty('handleCloseCartBottomSheet');
        });

        it('should call all composed hooks', () => {
            setupDefaultMocks();
            renderHook(() => useHomePage());

            expect(useHomeData).toHaveBeenCalled();
            expect(useCartVisibility).toHaveBeenCalled();
            expect(useCartSummary).toHaveBeenCalled();
            expect(useHomeActions).toHaveBeenCalled();
        });
    });

    describe('Home Data Integration', () => {
        it('should expose user data from useHomeData', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomePage());

            expect(result.current.userData).toEqual({ id: 1, name: 'Test User' });
        });
    });

    describe('Cart Visibility Integration', () => {
        it('should expose cart visibility state', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomePage());

            expect(result.current.isCartVisible).toBe(false);
        });
    });

    describe('Cart Summary Integration', () => {
        it('should expose cart totals', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomePage());

            expect(result.current.totalPrice).toBe(0);
            expect(result.current.totalItems).toBe(0);
        });
    });

    describe('Home Actions Integration', () => {
        it('should expose action handlers', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useHomePage());

            expect(typeof result.current.handleProductClick).toBe('function');
            expect(typeof result.current.handleCartClick).toBe('function');
            expect(typeof result.current.handleCloseCartBottomSheet).toBe('function');
        });

        it('should call handleProductClick', () => {
            setupDefaultMocks();
            const mockHandleProductClick = vi.fn();
            vi.mocked(useHomeActions).mockReturnValue({
                handleProductClick: mockHandleProductClick,
                isCartBottomSheetOpen: false,
                handleCartClick: vi.fn(),
                handleCloseCartBottomSheet: vi.fn(),
            });

            const { result } = renderHook(() => useHomePage());
            result.current.handleProductClick('product-1');

            expect(mockHandleProductClick).toHaveBeenCalledWith('product-1');
        });
    });

    describe('Edge Cases', () => {
        it('should handle null values from all hooks', () => {
            vi.mocked(useHomeData).mockReturnValue({
                userData: null,
                products: null,
                categories: null,
                outlets: null,
                currentOutlet: null,
                banners: null,
                isLoading: false,
                isPending: false,
                isError: false,
                error: null,
                isFetching: false,
                refreshData: vi.fn().mockResolvedValue(undefined),
                invalidateHomeData: vi.fn().mockResolvedValue(undefined),
            } as any);
            vi.mocked(useCartVisibility).mockReturnValue({
                isCartVisible: false,
                totalItems: 0,
            });
            vi.mocked(useCartSummary).mockReturnValue({
                totalPrice: 0,
                totalItems: 0,
            });
            vi.mocked(useHomeActions).mockReturnValue({
                handleProductClick: vi.fn(),
                isCartBottomSheetOpen: false,
                handleCartClick: vi.fn(),
                handleCloseCartBottomSheet: vi.fn(),
            });

            const { result } = renderHook(() => useHomePage());

            expect(result.current.userData).toBeNull();
            expect(result.current.products).toBeNull();
            expect(result.current.banners).toBeNull();
        });
    });
});
