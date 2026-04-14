export interface UsePaginationOptions {
    /**
     * Total number of items
     */
    totalItems: number;

    /**
     * Maximum dots to show before showing overflow indicator
     */
    maxDots?: number;

    /**
     * Currently active index
     */
    activeIndex: number;
}

export interface UsePaginationReturn {
    /**
     * Whether to show pagination
     */
    shouldShowPagination: boolean;

    /**
     * Number of dots to display
     */
    dotsToShow: number;

    /**
     * Whether to show overflow indicator
     */
    hasOverflow: boolean;

    /**
     * Starting index for sliding window
     */
    startIndex: number;
}

export const usePagination = ({
    totalItems,
    maxDots = 5,
    activeIndex
}: UsePaginationOptions): UsePaginationReturn => {

    // Don't show pagination for single items
    const shouldShowPagination = totalItems > 1;

    // Calculate overflow
    const hasOverflow = totalItems > maxDots;

    // Number of dots to show (add 1 for overflow indicator if needed)
    const dotsToShow = hasOverflow ? maxDots + 1 : totalItems;

    // Calculate sliding window start position
    let startIndex = 0;
    if (hasOverflow && activeIndex >= Math.floor(maxDots / 2)) {
        startIndex = Math.min(
            activeIndex - Math.floor(maxDots / 2),
            totalItems - maxDots
        );
    }

    return {
        shouldShowPagination,
        dotsToShow,
        hasOverflow,
        startIndex
    };
};