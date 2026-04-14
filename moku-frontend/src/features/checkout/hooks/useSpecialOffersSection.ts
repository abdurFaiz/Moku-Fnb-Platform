import { useHorizontalScroll } from '../../../hooks/shared/useHorizontalScroll';
import { usePagination } from '../../../hooks/shared/usePagination';
import type { MutableRefObject } from 'react';
import type { SpecialOffer } from '@/features/checkout/types/SpecialOffer';

export interface UseSpecialOffersSectionOptions {
    /**
     * Array of special offers
     */
    offers: SpecialOffer[];

    /**
     * Callback when offer is added
     */
    onAddOffer: (offerId: string) => void;

    /**
     * Gap between offer cards in pixels
     */
    cardGap?: number;

    /**
     * Maximum pagination dots
     */
    maxPaginationDots?: number;
}

export interface UseSpecialOffersSectionReturn {
    // Scroll behavior
    scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
    handleScroll: () => void;
    scrollToIndex: (index: number) => void;

    // Pagination state
    activeIndex: number;
    shouldShowPagination: boolean;
    paginationTotalItems: number;

    // Offer interaction
    handleAddOffer: (offerId: string) => void;

    // UI helpers
    offers: SpecialOffer[];
}

/**
 * Composite hook for special offers section
 * Follows Composition over Inheritance and Dependency Inversion principles
 */
export const useSpecialOffersSection = ({
    offers,
    onAddOffer,
    cardGap = 16, // gap-4 = 16px
    maxPaginationDots = 5
}: UseSpecialOffersSectionOptions): UseSpecialOffersSectionReturn => {

    // Horizontal scroll behavior
    const {
        scrollContainerRef,
        activeIndex,
        handleScroll,
        scrollToIndex
    } = useHorizontalScroll({
        totalItems: offers.length,
        itemGap: cardGap,
        scrollDebounceMs: 50
    });

    // Pagination logic
    const { shouldShowPagination } = usePagination({
        totalItems: offers.length,
        maxDots: maxPaginationDots,
        activeIndex
    });

    // Calculate pagination items (show max 5 dots + 1 overflow for 6+)
    const paginationTotalItems = offers.length <= maxPaginationDots
        ? offers.length
        : maxPaginationDots + 1;

    // Offer add handler
    const handleAddOffer = (offerId: string) => {
        onAddOffer(offerId);
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

        // Offer interaction
        handleAddOffer,

        // Data
        offers
    };
};