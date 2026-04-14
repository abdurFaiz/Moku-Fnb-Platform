import React, { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { DynamicCategorySection } from './DynamicCategorySection';
import EmptyProductSection from './EmptyProductSection';
import type { Category } from '@/features/product/types/Product';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';
import { Skeleton } from '@/components';

export interface CategoriesSectionProps {
    categories: Category[];
    products: Record<string, HomeProduct[]>;
    onProductClick: (productId: string) => void;
    onTambahClick?: (productId: string) => void;
    onIncrement?: (productId: string) => void;
    onDecrement?: (productId: string) => void;
    getCartQuantity?: (productId: string) => number;
}

const generateCategoryKey = (categoryName: string): string => {
    return categoryName
        .toLowerCase()
        .replaceAll(/\s+/g, '')
        .replaceAll(/[^a-z0-9]/g, '');
};

const CATEGORY_VIRTUALIZATION_THRESHOLD = 20; // Increased from 6 to 20
const CATEGORY_BASE_HEIGHT = 120;
const CATEGORY_PRODUCT_GAP = 8;
const ESTIMATED_PRODUCT_HEIGHT = 136;
const INITIAL_CATEGORY_BATCH = 20; // Increased from 6 to 20 to render all categories initially
const CATEGORY_BATCH_SIZE = 4;
const LOADER_HEIGHT = 96;

const CategorySkeletonRow: React.FC = () => (
    <div className="space-y-4">
        <Skeleton className="h-6 w-40 rounded-lg" />
        <div className="grid grid-cols-1 gap-4">
            {Array.from({ length: 2 }).map((_, index) => (
                <Skeleton key={index} className="w-full h-40 rounded-2xl" />
            ))}
        </div>
    </div>
);

const CategoriesSectionComponent: React.FC<CategoriesSectionProps> = ({
    categories,
    products,
    onProductClick,
    onTambahClick,
    onIncrement,
    onDecrement,
    getCartQuantity,
}) => {
    const sortedCategories = useMemo(
        () => [...categories].sort((a, b) => a.position - b.position),
        [categories]
    );

    const shouldVirtualize = sortedCategories.length > CATEGORY_VIRTUALIZATION_THRESHOLD;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [scrollMargin, setScrollMargin] = useState(0);
    const [visibleCount, setVisibleCount] = useState(() =>
        shouldVirtualize
            ? Math.min(INITIAL_CATEGORY_BATCH, sortedCategories.length)
            : sortedCategories.length
    );
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    useEffect(() => {
        setVisibleCount((prev) =>
            shouldVirtualize
                ? Math.min(Math.max(prev, INITIAL_CATEGORY_BATCH), sortedCategories.length)
                : sortedCategories.length
        );
    }, [shouldVirtualize, sortedCategories.length]);

    useLayoutEffect(() => {
        if (!shouldVirtualize) {
            return;
        }

        const updateScrollMargin = () => {
            if (!containerRef.current || typeof window === 'undefined') {
                return;
            }

            const rect = containerRef.current.getBoundingClientRect();
            setScrollMargin(rect.top + window.scrollY);
        };

        updateScrollMargin();
        window.addEventListener('resize', updateScrollMargin);

        return () => {
            window.removeEventListener('resize', updateScrollMargin);
        };
    }, [shouldVirtualize]);

    const categoriesToRender = useMemo(() => {
        if (!shouldVirtualize) {
            return sortedCategories;
        }

        return sortedCategories.slice(0, visibleCount);
    }, [shouldVirtualize, sortedCategories, visibleCount]);

    const hasMoreCategories = shouldVirtualize && visibleCount < sortedCategories.length;

    const loadMoreCategories = useCallback(() => {
        if (!hasMoreCategories) {
            return;
        }

        setIsFetchingMore(true);
        requestAnimationFrame(() => {
            setVisibleCount((prev) =>
                Math.min(prev + CATEGORY_BATCH_SIZE, sortedCategories.length)
            );
            setIsFetchingMore(false);
        });
    }, [hasMoreCategories, sortedCategories.length]);

    const estimateCategoryHeight = useCallback(
        (index: number) => {
            const category = categoriesToRender[index];

            if (!category) {
                return hasMoreCategories ? LOADER_HEIGHT : CATEGORY_BASE_HEIGHT;
            }

            const categoryKey = generateCategoryKey(category.name);
            const categoryProducts = products[categoryKey] || [];
            const rows = Math.max(Math.ceil(categoryProducts.length / 2), 1);
            const productHeight = rows * ESTIMATED_PRODUCT_HEIGHT;

            return CATEGORY_BASE_HEIGHT + productHeight + CATEGORY_PRODUCT_GAP;
        },
        [categoriesToRender, hasMoreCategories, products]
    );

    const categoryVirtualizer = useWindowVirtualizer({
        count: shouldVirtualize
            ? categoriesToRender.length + (hasMoreCategories ? 1 : 0)
            : categoriesToRender.length,
        estimateSize: estimateCategoryHeight,
        overscan: 4,
        scrollMargin,
    });

    const renderCategorySection = useCallback(
        (category: Category, index: number) => {
            const categoryKey = generateCategoryKey(category.name);
            const categoryProducts = products[categoryKey] || [];

            return (
                <DynamicCategorySection
                    key={`${category.id}-${category.name}`}
                    category={category}
                    products={categoryProducts}
                    onProductClick={onProductClick}
                    onTambahClick={onTambahClick}
                    onIncrement={onIncrement}
                    onDecrement={onDecrement}
                    getCartQuantity={getCartQuantity}
                    prioritizeFirst={index === 0 ? 4 : 0}
                />
            );
        },
        [onProductClick, onTambahClick, onIncrement, onDecrement, getCartQuantity, products]
    );

    const virtualItems = shouldVirtualize ? categoryVirtualizer.getVirtualItems() : [];

    useEffect(() => {
        if (!shouldVirtualize || !hasMoreCategories || isFetchingMore) {
            return;
        }

        const lastItem = virtualItems[virtualItems.length - 1];
        if (!lastItem) {
            return;
        }

        if (lastItem.index >= categoriesToRender.length) {
            loadMoreCategories();
        }
    }, [
        shouldVirtualize,
        hasMoreCategories,
        isFetchingMore,
        virtualItems,
        categoriesToRender.length,
        loadMoreCategories,
    ]);

    if (sortedCategories.length === 0) {
        return (
            <EmptyProductSection
                title="Products"
                type="general"
                message="Belum ada product tersedia"
            />
        );
    }

    if (!shouldVirtualize) {
        return (
            <div className="flex flex-col gap-4">
                {categoriesToRender.map((category, index) =>
                    renderCategorySection(category, index)
                )}
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative mt-0">
            <div style={{ height: categoryVirtualizer.getTotalSize(), position: 'relative' }}>
                {virtualItems.map((virtualRow) => {
                    const translateY = virtualRow.start - scrollMargin;
                    const category = categoriesToRender[virtualRow.index];

                    if (!category) {
                        return (
                            <div
                                key={virtualRow.key}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    transform: `translateY(${translateY}px)`,
                                }}
                            >
                                {hasMoreCategories ? (
                                    <div className="flex justify-center py-6">
                                        <Skeleton className="h-12 w-32 rounded-full" />
                                    </div>
                                ) : (
                                    <CategorySkeletonRow />
                                )}
                            </div>
                        );
                    }

                    return (
                        <div
                            key={`${category.id}-${category.name}`}
                            data-index={virtualRow.index}
                            ref={(node) => {
                                if (node) {
                                    categoryVirtualizer.measureElement(node);
                                }
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${translateY}px)`,
                            }}
                        >
                            {renderCategorySection(category, virtualRow.index)}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export const CategoriesSection = memo(CategoriesSectionComponent);

export default CategoriesSection;
