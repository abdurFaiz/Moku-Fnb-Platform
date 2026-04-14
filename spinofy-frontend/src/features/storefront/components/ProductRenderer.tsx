import React, { useLayoutEffect, useRef, useState } from 'react';
import { ProductCard } from '@/features/storefront/components/ProductItem';
import EmptyProductSection from '@/features/storefront/components/EmptyProductSection';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';
import { useWindowVirtualizer } from '@tanstack/react-virtual';

const VIRTUALIZATION_THRESHOLD = 24;
const ESTIMATED_VERTICAL_CARD_HEIGHT = 136;
const VIRTUAL_ITEM_GAP_PX = 16;

export interface ProductRendererProps {
    /**
     * Array of products to render
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
     * Optional callback for favorite toggle
     */
    onToggleFavorite?: (product: HomeProduct) => void;

    /**
     * Show favorite button?
     */
    showFavorite?: boolean;

    /**
     * Current favorite IDs for styling
     */
    favoriteIds?: string[];

    /**
     * Product variant for card styling
     */
    variant?: 'vertical' | 'horizontal';

    /**
     * CSS class for the container
     */
    containerClassName?: string;

    /**
     * Empty state configuration
     */
    emptyState?: {
        title: string;
        type?: string;
        message?: string;
    };

    /**
     * Show product description
     */
    showDescription?: boolean;

    /**
     * Number of initial items to prioritize loading (eager load images)
     */
    prioritizeFirst?: number;
}

export const ProductRenderer: React.FC<ProductRendererProps> = ({
    products,
    onProductClick,
    onTambahClick,
    onIncrement,
    onDecrement,
    getCartQuantity,
    onToggleFavorite,
    showFavorite = false,
    favoriteIds = [],
    variant = 'vertical',
    containerClassName = '',
    emptyState = {
        title: 'Products',
        type: 'general',
        message: 'No products available'
    },
    showDescription = false,
    prioritizeFirst = 0,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [scrollMargin, setScrollMargin] = useState(0);
    const shouldVirtualize = variant === 'vertical' && products.length > VIRTUALIZATION_THRESHOLD;

    useLayoutEffect(() => {
        if (!shouldVirtualize) {
            return;
        }

        const updateScrollMargin = () => {
            if (!containerRef.current || typeof window === 'undefined') {
                return;
            }

            const rect = containerRef.current.getBoundingClientRect();
            const nextMargin = window.scrollY + rect.top;
            setScrollMargin(nextMargin);
        };

        updateScrollMargin();
        window.addEventListener('resize', updateScrollMargin);

        return () => {
            window.removeEventListener('resize', updateScrollMargin);
        };
    }, [shouldVirtualize]);

    const virtualizer = useWindowVirtualizer({
        count: products.length,
        estimateSize: () => ESTIMATED_VERTICAL_CARD_HEIGHT,
        overscan: 6,
        scrollMargin,
    });

    // Guard: Return empty state if no products
    if (products.length === 0) {
        return (
            <EmptyProductSection
                title={emptyState.title}
                type={emptyState.type}
                message={emptyState.message}
            />
        );
    }

    if (!shouldVirtualize) {
        return (
            <div ref={containerRef} className={containerClassName}>
                {products.map((product, index) => (
                    <ProductCard
                        key={product.id || `product-${index}`}
                        name={product.name}
                        price={product.price}
                        image={product.image}
                        productUuid={product.id}
                        cartQuantity={getCartQuantity?.(product.id) || 0}
                        description={showDescription ? product.description : undefined}
                        variant={variant}
                        isAvailable={product.isAvailable}
                        isFavorite={showFavorite ? favoriteIds.includes(product.id) : undefined}
                        onToggleFavorite={
                            showFavorite && onToggleFavorite
                                ? () => onToggleFavorite(product)
                                : undefined
                        }
                        onCardClick={() => onProductClick(product.id)}
                        onTambahClick={() => onTambahClick?.(product.id)}
                        onIncrement={() => onIncrement?.(product.id)}
                        onDecrement={() => onDecrement?.(product.id)}
                        priority={index < prioritizeFirst}
                    />
                ))}
            </div>
        );
    }

    const virtualItems = virtualizer.getVirtualItems();

    return (
        <div
            ref={containerRef}
            className={`${containerClassName} relative`}
            style={{ display: 'block' }}
        >
            <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
                {virtualItems.map((virtualRow) => {
                    const product = products[virtualRow.index];

                    if (!product) {
                        return null;
                    }

                    return (
                        <div
                            key={product.id || virtualRow.key}
                            data-index={virtualRow.index}
                            ref={(node) => {
                                if (node) {
                                    virtualizer.measureElement(node);
                                }
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualRow.start}px)`,
                                paddingBottom: `${VIRTUAL_ITEM_GAP_PX}px`,
                            }}
                        >
                            <ProductCard
                                name={product.name}
                                price={product.price}
                                image={product.image}
                                productUuid={product.id}
                                cartQuantity={getCartQuantity?.(product.id) || 0}
                                description={showDescription ? product.description : undefined}
                                variant={variant}
                                onIncrement={() => onIncrement?.(product.id)}
                                onDecrement={() => onDecrement?.(product.id)}
                                isAvailable={product.isAvailable}
                                isFavorite={showFavorite ? favoriteIds.includes(product.id) : undefined}
                                onToggleFavorite={
                                    showFavorite && onToggleFavorite
                                        ? () => onToggleFavorite(product)
                                        : undefined
                                }
                                onCardClick={() => onProductClick(product.id)}
                                onTambahClick={() => onTambahClick?.(product.id)}
                                priority={virtualRow.index < prioritizeFirst}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


export const ProductRendererGrid: React.FC<Omit<ProductRendererProps, 'containerClassName'>> = (props) => (
    <ProductRenderer
        {...props}
        containerClassName=""
    />
);

/**
 * Horizontal scroll preset component - for recommendations
 */
export const ProductRendererHorizontalScroll: React.FC<Omit<ProductRendererProps, 'containerClassName' | 'variant'>> = (props) => (
    <ProductRenderer
        {...props}
        variant="horizontal"
        containerClassName="flex gap-4 overflow-x-auto scrollbar-hide"
    />
);


export const ProductRendererVerticalList: React.FC<Omit<ProductRendererProps, 'containerClassName' | 'variant'>> = (props) => (
    <ProductRenderer
        {...props}
        variant="horizontal"
        containerClassName="mt-6 grid gap-4 w-full"
        showDescription={true}
    />
);

export default ProductRenderer;
