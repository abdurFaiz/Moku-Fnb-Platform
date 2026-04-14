import type { CartVisibilityState, ScrollState } from "@/features/storefront/types/Home";
import { SCROLL_CONFIG } from "@/features/storefront/constant/homeConstant";

export class HomeUIService {
  private static scrollState: ScrollState = {
    isScrolling: false,
    direction: "none",
    lastScrollTop: 0,
    scrollStoppedTimeout: undefined,
  };

  /**
   * Calculate cart visibility based on scroll state and item count
   */
  static calculateCartVisibility(
    totalItems: number,
    isScrollingDown: boolean,
    isScrollingStopped: boolean,
  ): boolean {
    // Show cart if there are items and not scrolling down (or if scrolling stopped)
    return totalItems > 0 && (!isScrollingDown || isScrollingStopped);
  }

  /**
   * Handle scroll events with debouncing
   */
  static handleScroll(
    currentScrollTop: number,
    onScrollStateChange?: (state: ScrollState) => void,
  ): ScrollState {
    const scrollThreshold = SCROLL_CONFIG.THRESHOLD;
    const previousScrollTop = this.scrollState.lastScrollTop;
    const scrollDifference = currentScrollTop - previousScrollTop;

    // Determine scroll direction
    let direction: "up" | "down" | "none" = "none";
    if (Math.abs(scrollDifference) > scrollThreshold) {
      direction = scrollDifference > 0 ? "down" : "up";
    }

    // Update scroll state
    this.scrollState = {
      ...this.scrollState,
      isScrolling: Math.abs(scrollDifference) > 1,
      direction,
      lastScrollTop: currentScrollTop,
    };

    // Clear existing timeout
    if (this.scrollState.scrollStoppedTimeout) {
      clearTimeout(this.scrollState.scrollStoppedTimeout);
    }

    // Set new timeout for scroll stop detection
    this.scrollState.scrollStoppedTimeout = setTimeout(() => {
      this.scrollState = {
        ...this.scrollState,
        isScrolling: false,
        direction: "none",
      };

      if (onScrollStateChange) {
        onScrollStateChange(this.scrollState);
      }
    }, SCROLL_CONFIG.DEBOUNCE_DELAY);

    // Trigger callback if provided
    if (onScrollStateChange) {
      onScrollStateChange(this.scrollState);
    }

    return this.scrollState;
  }

  /**
   * Get current scroll state
   */
  static getScrollState(): ScrollState {
    return { ...this.scrollState };
  }

  /**
   * Reset scroll state
   */
  static resetScrollState(): void {
    if (this.scrollState.scrollStoppedTimeout) {
      clearTimeout(this.scrollState.scrollStoppedTimeout);
    }

    this.scrollState = {
      isScrolling: false,
      direction: "none",
      lastScrollTop: 0,
      scrollStoppedTimeout: undefined,
    };
  }

  /**
   * Calculate cart visibility state with full context
   */
  static calculateCartVisibilityState(
    totalItems: number,
    currentScrollTop: number,
  ): CartVisibilityState {
    const scrollState = this.handleScroll(currentScrollTop);
    const shouldShow = this.calculateCartVisibility(
      totalItems,
      scrollState.direction === "down",
      !scrollState.isScrolling,
    );

    return {
      totalItems,
      isScrollingDown: scrollState.direction === "down",
      isScrollingStopped: !scrollState.isScrolling,
      shouldShow,
    };
  }


  /**
   * Format price for display
   */
  static formatPrice(price: string | number): string {
    if (typeof price === "number") {
      return `Rp ${price.toLocaleString("id-ID")}`;
    }

    // If already formatted, return as is
    if (typeof price === "string" && price.startsWith("Rp")) {
      return price;
    }

    // Try to extract number from string and format
    const numericValue = this.extractNumericPrice(price);
    return `Rp ${numericValue.toLocaleString("id-ID")}`;
  }

  /**
   * Extract numeric value from price string
   */
  static extractNumericPrice(priceString: string): number {
    const regex = /[\d.,]+/;
    const match = regex.exec(priceString);
    if (!match) return 0;

    // Remove dots and convert to number
    return Number.parseInt(match[0].replaceAll(/[.,]/g, ""), 10);
  }

  /**
   * Calculate grid layout for products
   */
  static calculateGridLayout(
    containerWidth: number,
    itemMinWidth: number = 150,
    gap: number = 16,
  ): {
    columns: number;
    itemWidth: number;
    totalWidth: number;
  } {
    const availableWidth = containerWidth - gap;
    let columns = Math.floor(availableWidth / (itemMinWidth + gap));
    columns = Math.max(1, Math.min(columns, 4)); // Between 1 and 4 columns

    const totalGaps = (columns - 1) * gap;
    const itemWidth = (availableWidth - totalGaps) / columns;
    const totalWidth = itemWidth * columns + totalGaps;

    return {
      columns,
      itemWidth: Math.floor(itemWidth),
      totalWidth: Math.floor(totalWidth),
    };
  }


  /**
   * Calculate content visibility based on scroll position
   */
  static calculateContentVisibility(
    elementTop: number,
    elementHeight: number,
    viewportTop: number,
    viewportHeight: number,
    threshold: number = 0.1,
  ): {
    isVisible: boolean;
    visibilityRatio: number;
    isFullyVisible: boolean;
  } {
    const elementBottom = elementTop + elementHeight;
    const viewportBottom = viewportTop + viewportHeight;

    // Calculate intersection
    const intersectionTop = Math.max(elementTop, viewportTop);
    const intersectionBottom = Math.min(elementBottom, viewportBottom);
    const intersectionHeight = Math.max(
      0,
      intersectionBottom - intersectionTop,
    );

    const visibilityRatio = intersectionHeight / elementHeight;
    const isVisible = visibilityRatio > threshold;
    const isFullyVisible = visibilityRatio >= 0.99;

    return {
      isVisible,
      visibilityRatio,
      isFullyVisible,
    };
  }

  /**
   * Cleanup resources and event listeners
   */
  static cleanup(): void {
    if (this.scrollState.scrollStoppedTimeout) {
      clearTimeout(this.scrollState.scrollStoppedTimeout);
    }
    this.resetScrollState();
  }

}

export default HomeUIService;
