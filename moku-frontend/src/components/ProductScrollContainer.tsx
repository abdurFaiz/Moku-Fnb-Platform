import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ProductCard } from '@/features/storefront/components/ProductItem';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';

export interface ProductScrollContainerProps {
    /**
     * Array of products to display
     */
    products: HomeProduct[];

    /**
     * Callback when product card is clicked
     */
    onProductClick: (productId: string) => void;

    /**
     * Callback when Tambah button is clicked
     */
    onTambahClick?: (productId: string) => void;

    /**
     * Callback when increment button is clicked
     */
    onIncrement?: (productId: string) => void;

    /**
     * Callback when decrement button is clicked
     */
    onDecrement?: (productId: string) => void;

    /**
     * Function to get cart quantity for a product
     */
    getCartQuantity?: (productId: string) => number;

    /**
     * Scroll event handler
     */
    onScroll: () => void;

    /**
     * Ref for scroll container
     */
    scrollRef: React.MutableRefObject<HTMLDivElement | null>;

    /**
     * Additional CSS classes
     */
    className?: string;

    /**
     * Gap between cards (Tailwind class)
     */
    gap?: string;

    /**
     * Explicit gap value in pixels to keep virtualization math in sync
     */
    gapPxOverride?: number;

    /**
     * Width for individual cards (Tailwind class)
     */
    cardWidth?: string;
}

const DEFAULT_GAP_PX = 24;
const CARD_WIDTH_ESTIMATE = 300;
const CARD_HEIGHT_ESTIMATE = 100;

const parseGapToPixels = (gapClass?: string): number => {
    if (!gapClass) {
        return DEFAULT_GAP_PX;
    }

    if (gapClass.includes('gap-px')) {
        return 1;
    }

    const match = gapClass.match(/gap-([0-9]+(?:\.[0-9]+)?)/);
    if (!match) {
        return DEFAULT_GAP_PX;
    }

    const value = Number(match[1]);
    if (Number.isNaN(value)) {
        return DEFAULT_GAP_PX;
    }

    return value * 4; // Tailwind spacing unit (1 = 0.25rem = 4px)
};

export const ProductScrollContainer: React.FC<ProductScrollContainerProps> = ({
    products,
    onProductClick,
    onTambahClick,
    onIncrement,
    onDecrement,
    getCartQuantity,
    onScroll,
    scrollRef,
    className = '',
    gap = 'gap-3',
    gapPxOverride,
    cardWidth,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [measuredHeight, setMeasuredHeight] = useState<number>(CARD_HEIGHT_ESTIMATE);
    const gapPx = useMemo(() => gapPxOverride ?? parseGapToPixels(gap), [gap, gapPxOverride]);

    const assignRef = useCallback((node: HTMLDivElement | null) => {
        containerRef.current = node;
        scrollRef.current = node;
    }, [scrollRef]);

    const productVirtualizer = useVirtualizer({
        count: products.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => CARD_WIDTH_ESTIMATE + gapPx,
        horizontal: true,
        overscan: 4,
    });

    const virtualItems = productVirtualizer.getVirtualItems();
    const totalWidth = productVirtualizer.getTotalSize();
    const containerHeight = products.length === 0 ? 0 : measuredHeight;

    return (
        <div
            ref={assignRef}
            className={`overflow-x-auto flex gap-3 scrollbar-hide ${className}`}
            onScroll={onScroll}
        >
            <div
                className="relative"
                style={{
                    width: totalWidth,
                    height: containerHeight,
                }}
            >
                {virtualItems.map((virtualItem) => {
                    const product = products[virtualItem.index];
                    if (!product) {
                        return null;
                    }

                    return (
                        <div
                            key={product.id || `product-${virtualItem.index}`}
                            data-scroll-item="true"
                            ref={(node) => {
                                if (node) {
                                    productVirtualizer.measureElement(node);
                                    setMeasuredHeight((prev) => (node.offsetHeight > prev ? node.offsetHeight : prev));
                                }
                            }}
                            className="absolute top-0"
                            style={{
                                transform: `translateX(${virtualItem.start}px)`,
                                paddingRight: gapPx,
                            }}
                        >
                            <ProductCard
                                name={product.name}
                                price={product.price}
                                image={product.image}
                                description={product.description}
                                productUuid={product.id}
                                cartQuantity={getCartQuantity?.(product.id) || 0}
                                variant="horizontal"
                                isAvailable={product.isAvailable}
                                onCardClick={() => onProductClick(product.id)}
                                onTambahClick={() => onTambahClick?.(product.id)}
                                onIncrement={() => onIncrement?.(product.id)}
                                onDecrement={() => onDecrement?.(product.id)}
                                priority={virtualItem.index < 2}
                                cardWidth={cardWidth}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};