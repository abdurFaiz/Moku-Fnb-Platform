import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecommendedSection } from '../hooks/useRecommendedSection';
import { useHorizontalScroll } from '@/hooks/shared/useHorizontalScroll';
import { usePagination } from '@/hooks/shared/usePagination';

vi.mock('@/hooks/shared/useHorizontalScroll');
vi.mock('@/hooks/shared/usePagination');

describe('useRecommendedSection', () => {
    const mockProducts: any[] = [
        { id: 1, name: 'Product 1', price: 50000 },
        { id: 2, name: 'Product 2', price: 60000 },
        { id: 3, name: 'Product 3', price: 70000 },
    ];

    const defaultProps = {
        products: mockProducts,
        onProductClick: vi.fn(),
        cardGap: 24,
        maxPaginationDots: 5,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useHorizontalScroll).mockReturnValue({
            scrollContainerRef: { current: null },
            activeIndex: 0,
            handleScroll: vi.fn(),
            scrollToIndex: vi.fn(),
            canScroll: false,
        });
        vi.mocked(usePagination).mockReturnValue({
            shouldShowPagination: true,
            dotsToShow: 5,
            hasOverflow: false,
            startIndex: 0,
        });
    });

    describe('Hook Initialization', () => {
        it('should return all required properties', () => {
            const { result } = renderHook(() => useRecommendedSection(defaultProps));

            expect(result.current).toHaveProperty('scrollContainerRef');
            expect(result.current).toHaveProperty('handleScroll');
            expect(result.current).toHaveProperty('scrollToIndex');
            expect(result.current).toHaveProperty('activeIndex');
            expect(result.current).toHaveProperty('shouldShowPagination');
            expect(result.current).toHaveProperty('paginationTotalItems');
            expect(result.current).toHaveProperty('handleProductClick');
            expect(result.current).toHaveProperty('products');
        });

        it('should call useHorizontalScroll with correct options', () => {
            renderHook(() => useRecommendedSection(defaultProps));

            expect(useHorizontalScroll).toHaveBeenCalledWith({
                totalItems: 3,
                itemGap: 24,
                scrollDebounceMs: 50,
            });
        });

        it('should call usePagination with correct options', () => {
            renderHook(() => useRecommendedSection(defaultProps));

            expect(usePagination).toHaveBeenCalledWith({
                totalItems: 3,
                maxDots: 5,
                activeIndex: 0,
            });
        });
    });

    describe('Scroll Behavior', () => {
        it('should expose scroll container ref', () => {
            const { result } = renderHook(() => useRecommendedSection(defaultProps));

            expect(result.current.scrollContainerRef).toBeDefined();
        });

        it('should expose handleScroll function', () => {
            const { result } = renderHook(() => useRecommendedSection(defaultProps));

            expect(typeof result.current.handleScroll).toBe('function');
        });

        it('should expose scrollToIndex function', () => {
            const { result } = renderHook(() => useRecommendedSection(defaultProps));

            expect(typeof result.current.scrollToIndex).toBe('function');
        });

        it('should call scrollToIndex with correct index', () => {
            const mockScrollToIndex = vi.fn();
            vi.mocked(useHorizontalScroll).mockReturnValue({
                scrollContainerRef: { current: null },
                activeIndex: 0,
                handleScroll: vi.fn(),
                scrollToIndex: mockScrollToIndex,
                canScroll: false,
            });

            const { result } = renderHook(() => useRecommendedSection(defaultProps));

            act(() => {
                result.current.scrollToIndex(2);
            });

            expect(mockScrollToIndex).toHaveBeenCalledWith(2);
        });
    });

    describe('Pagination', () => {
        it('should show pagination when shouldShowPagination is true', () => {
            const { result } = renderHook(() => useRecommendedSection(defaultProps));

            expect(result.current.shouldShowPagination).toBe(true);
        });

        it('should hide pagination when shouldShowPagination is false', () => {
            vi.mocked(usePagination).mockReturnValue({
                shouldShowPagination: false,
                dotsToShow: 5,
                hasOverflow: false,
                startIndex: 0,
            });

            const { result } = renderHook(() => useRecommendedSection(defaultProps));

            expect(result.current.shouldShowPagination).toBe(false);
        });

        it('should calculate pagination items correctly for small product count', () => {
            const { result } = renderHook(() => useRecommendedSection(defaultProps));

            expect(result.current.paginationTotalItems).toBe(3);
        });

        it('should calculate pagination items with max dots for large product count', () => {
            const manyProducts: any[] = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                name: `Product ${i}`,
                price: 50000 + i * 1000,
            }));

            const { result } = renderHook(() =>
                useRecommendedSection({ ...defaultProps, products: manyProducts })
            );

            expect(result.current.paginationTotalItems).toBe(6);
        });

        it('should expose active index', () => {
            const { result } = renderHook(() => useRecommendedSection(defaultProps));

            expect(result.current.activeIndex).toBe(0);
        });
    });

    describe('Product Interaction', () => {
        it('should call onProductClick when handleProductClick is invoked', () => {
            const onProductClick = vi.fn();
            const { result } = renderHook(() =>
                useRecommendedSection({ ...defaultProps, onProductClick })
            );

            act(() => {
                result.current.handleProductClick('product-1');
            });

            expect(onProductClick).toHaveBeenCalledWith('product-1');
        });

        it('should handle multiple product clicks', () => {
            const onProductClick = vi.fn();
            const { result } = renderHook(() =>
                useRecommendedSection({ ...defaultProps, onProductClick })
            );

            act(() => {
                result.current.handleProductClick('product-1');
                result.current.handleProductClick('product-2');
                result.current.handleProductClick('product-3');
            });

            expect(onProductClick).toHaveBeenCalledTimes(3);
        });

        it('should expose products array', () => {
            const { result } = renderHook(() => useRecommendedSection(defaultProps));

            expect(result.current.products).toEqual(mockProducts);
        });
    });

    describe('Props Configuration', () => {
        it('should use default cardGap when not provided', () => {
            renderHook(() =>
                useRecommendedSection({
                    products: mockProducts,
                    onProductClick: vi.fn(),
                })
            );

            expect(useHorizontalScroll).toHaveBeenCalledWith(
                expect.objectContaining({ itemGap: 24 })
            );
        });

        it('should use custom cardGap when provided', () => {
            renderHook(() =>
                useRecommendedSection({
                    ...defaultProps,
                    cardGap: 32,
                })
            );

            expect(useHorizontalScroll).toHaveBeenCalledWith(
                expect.objectContaining({ itemGap: 32 })
            );
        });

        it('should use default maxPaginationDots when not provided', () => {
            renderHook(() =>
                useRecommendedSection({
                    products: mockProducts,
                    onProductClick: vi.fn(),
                })
            );

            expect(usePagination).toHaveBeenCalledWith(
                expect.objectContaining({ maxDots: 5 })
            );
        });

        it('should use custom maxPaginationDots when provided', () => {
            renderHook(() =>
                useRecommendedSection({
                    ...defaultProps,
                    maxPaginationDots: 10,
                })
            );

            expect(usePagination).toHaveBeenCalledWith(
                expect.objectContaining({ maxDots: 10 })
            );
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty products array', () => {
            const { result } = renderHook(() =>
                useRecommendedSection({ ...defaultProps, products: [] })
            );

            expect(result.current.products).toEqual([]);
            expect(result.current.paginationTotalItems).toBe(0);
        });

        it('should handle single product', () => {
            const { result } = renderHook(() =>
                useRecommendedSection({
                    ...defaultProps,
                    products: [mockProducts[0]],
                })
            );

            expect(result.current.paginationTotalItems).toBe(1);
        });

        it('should handle many products', () => {
            const manyProducts: any[] = Array.from({ length: 100 }, (_, i) => ({
                id: i,
                name: `Product ${i}`,
                price: 50000 + i * 1000,
            }));

            const { result } = renderHook(() =>
                useRecommendedSection({ ...defaultProps, products: manyProducts })
            );

            expect(result.current.products.length).toBe(100);
        });

        it('should handle product with special characters', () => {
            const specialProducts: any[] = [
                { id: 1, name: 'Café & Restaurant', price: 50000 },
            ];

            const { result } = renderHook(() =>
                useRecommendedSection({ ...defaultProps, products: specialProducts })
            );

            expect(result.current.products[0].name).toContain('Café');
        });
    });

    describe('Multiple Renders', () => {
        it('should handle product changes', () => {
            const { rerender } = renderHook(
                (props) => useRecommendedSection(props),
                { initialProps: defaultProps }
            );

            const newProducts: any[] = [
                { id: 4, name: 'Product 4', price: 80000 },
            ];

            rerender({ ...defaultProps, products: newProducts });

            expect(useHorizontalScroll).toHaveBeenCalledWith(
                expect.objectContaining({ totalItems: 1 })
            );
        });

        it('should handle callback changes', () => {
            const onProductClick1 = vi.fn();
            const onProductClick2 = vi.fn();

            const { result, rerender } = renderHook(
                (props) => useRecommendedSection(props),
                { initialProps: { ...defaultProps, onProductClick: onProductClick1 } }
            );

            act(() => {
                result.current.handleProductClick('product-1');
            });

            expect(onProductClick1).toHaveBeenCalled();

            rerender({ ...defaultProps, onProductClick: onProductClick2 });

            act(() => {
                result.current.handleProductClick('product-2');
            });

            expect(onProductClick2).toHaveBeenCalled();
        });
    });

    describe('Callback Stability', () => {
        it('should return stable handleProductClick callback', () => {
            const { result, rerender } = renderHook(() =>
                useRecommendedSection(defaultProps)
            );

            const firstCallback = result.current.handleProductClick;

            rerender();

            const secondCallback = result.current.handleProductClick;

            expect(firstCallback).toBe(secondCallback);
        });

        it('should return stable handleScroll callback', () => {
            const { result, rerender } = renderHook(() =>
                useRecommendedSection(defaultProps)
            );

            const firstCallback = result.current.handleScroll;

            rerender();

            const secondCallback = result.current.handleScroll;

            expect(firstCallback).toBe(secondCallback);
        });
    });
});
