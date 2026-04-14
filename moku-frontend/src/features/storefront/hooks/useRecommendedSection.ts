import { useHorizontalScroll } from '../../../hooks/shared/useHorizontalScroll';
import { usePagination } from '../../../hooks/shared/usePagination';
import type { MutableRefObject } from 'react';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';

export interface UseRecommendedSectionOptions {
    /**
     * Array of products
     */
    products: HomeProduct[];

    /**
     * Callback when product is clicked
     */
    onProductClick: (productId: string) => void;

    /**
     * Gap between product cards in pixels
     */
    cardGap?: number;

    /**
     * Maximum pagination dots
     */
    maxPaginationDots?: number;
}

export interface UseRecommendedSectionReturn {
    // Scroll behavior
    scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
    handleScroll: () => void;
    scrollToIndex: (index: number) => void;

    // Pagination state
    activeIndex: number;
    shouldShowPagination: boolean;
    paginationTotalItems: number;

    // Product interaction
    handleProductClick: (productId: string) => void;

    // UI helpers
    products: HomeProduct[];
}

export const useRecommendedSection = ({
    products,
    onProductClick,
    cardGap = 24,
    maxPaginationDots = 5
}: UseRecommendedSectionOptions): UseRecommendedSectionReturn => {

    // Horizontal scroll behavior
    const {
        scrollContainerRef,
        activeIndex,
        handleScroll,
        scrollToIndex
    } = useHorizontalScroll({
        totalItems: products.length,
        itemGap: cardGap,
        scrollDebounceMs: 50
    });

    // Pagination logic
    const { shouldShowPagination } = usePagination({
        totalItems: products.length,
        maxDots: maxPaginationDots,
        activeIndex
    });

    // Calculate pagination items (show max 5 dots + 1 overflow for 6+)
    const paginationTotalItems = products.length <= maxPaginationDots
        ? products.length
        : maxPaginationDots + 1;

    // Product click handler
    const handleProductClick = (productId: string) => {
        onProductClick(productId);
    };

    return {
        // Scroll behavior
        scrollContainerRef,
        handleScroll,
        scrollToIndex,

        // Pagination
        activeIndex,
        shouldShowPagination,
        paginationTotalItems,

        // Product interaction
        handleProductClick,

        // Data
        products
    };
};