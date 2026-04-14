import { useRef, useState, useCallback, useEffect } from 'react';
import type { MutableRefObject } from 'react';

export interface UseHorizontalScrollOptions {
    /**
     * Total number of items
     */
    totalItems: number;

    /**
     * Gap between items in pixels
     */
    itemGap?: number;

    /**
     * Debounce delay for scroll updates in ms
     */
    scrollDebounceMs?: number;

    /**
     * Callback when active index changes
     */
    onActiveIndexChange?: (index: number) => void;
}

export interface UseHorizontalScrollReturn {
    /**
     * Ref to attach to scrollable container
     */
    scrollContainerRef: MutableRefObject<HTMLDivElement | null>;

    /**
     * Currently active item index
     */
    activeIndex: number;

    /**
     * Scroll event handler
     */
    handleScroll: () => void;

    /**
     * Navigate to specific index
     */
    scrollToIndex: (index: number) => void;

    /**
     * Check if scrolling is possible
     */
    canScroll: boolean;
}

export const useHorizontalScroll = ({
    totalItems,
    itemGap = 24,
    scrollDebounceMs = 50,
    onActiveIndexChange
}: UseHorizontalScrollOptions): UseHorizontalScrollReturn => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const getItemWidth = useCallback((): number => {
        if (!scrollContainerRef.current) return 0;

        const measuredTarget = scrollContainerRef.current.querySelector<HTMLElement>('[data-scroll-item="true"]')
            ?? (scrollContainerRef.current.children[0] as HTMLElement | undefined);

        if (!measuredTarget) return 0;

        return measuredTarget.offsetWidth + itemGap;
    }, [itemGap]);

    const updateActiveIndex = useCallback(() => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const scrollLeft = container.scrollLeft;
        const itemWidth = getItemWidth();

        if (itemWidth === 0) return;

        const currentIndex = Math.round(scrollLeft / itemWidth);
        const clampedIndex = Math.max(0, Math.min(currentIndex, totalItems - 1));

        if (clampedIndex !== activeIndex) {
            setActiveIndex(clampedIndex);
            onActiveIndexChange?.(clampedIndex);
        }
    }, [totalItems, getItemWidth, activeIndex, onActiveIndexChange]);

    const handleScroll = useCallback(() => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        updateActiveIndex();

        scrollTimeoutRef.current = setTimeout(() => {
            updateActiveIndex();
        }, scrollDebounceMs);
    }, [updateActiveIndex, scrollDebounceMs]);

    const scrollToIndex = useCallback((index: number) => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;

        // Clamp index to valid range
        const clampedIndex = Math.max(0, Math.min(index, totalItems - 1));

        // Use requestAnimationFrame to ensure DOM is ready and get correct item width
        requestAnimationFrame(() => {
            const itemWidth = getItemWidth();
            if (itemWidth === 0) {
                // If item width is still 0, try again with another frame
                requestAnimationFrame(() => {
                    const retryItemWidth = getItemWidth();
                    if (retryItemWidth > 0) {
                        const scrollAmount = clampedIndex * retryItemWidth;
                        container.scrollTo({
                            left: scrollAmount,
                            behavior: 'smooth',
                        });
                    }
                });
                return;
            }

            const scrollAmount = clampedIndex * itemWidth;

            setActiveIndex(clampedIndex);
            onActiveIndexChange?.(clampedIndex);

            container.scrollTo({
                left: scrollAmount,
                behavior: 'smooth',
            });
        });
    }, [getItemWidth, totalItems, onActiveIndexChange]);

    /**
     * Check if container can scroll
     */
    const canScroll = useCallback(() => {
        if (!scrollContainerRef.current) return false;
        const container = scrollContainerRef.current;
        return container.scrollWidth > container.clientWidth;
    }, []);


    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    return {
        scrollContainerRef,
        activeIndex,
        handleScroll,
        scrollToIndex,
        canScroll: canScroll(),
    };
};