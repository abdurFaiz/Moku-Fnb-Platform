import React, { memo } from 'react';
import { SubHeader } from '@/components/SubHeader';
import { ProductScrollContainer } from '@/components/ProductScrollContainer';
import { DotPagination } from '@/components/DotPagination';
import { useRecommendedSection } from '@/features/storefront/hooks/useRecommendedSection';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';

export interface RecommendedSectionProps {
  products: HomeProduct[];
  onProductClick: (productId: string) => void;
  onTambahClick?: (productId: string) => void;
  onIncrement?: (productId: string) => void;
  onDecrement?: (productId: string) => void;
  getCartQuantity?: (productId: string) => number;
  onViewAll: () => void;
  maxPaginationDots?: number;
  cardGap?: number;
  cardWidth?: string;
}

const RecommendedSectionComponent: React.FC<RecommendedSectionProps> = ({
  products,
  onProductClick,
  onTambahClick,
  onIncrement,
  onDecrement,
  getCartQuantity,
  onViewAll,
  maxPaginationDots = 5,
  cardGap = 16,
  cardWidth
}) => {
  // Business logic handled by custom hook
  const {
    scrollContainerRef,
    handleScroll,
    scrollToIndex,
    activeIndex,
    shouldShowPagination,
    paginationTotalItems,
    handleProductClick
  } = useRecommendedSection({
    products,
    onProductClick,
    cardGap,
    maxPaginationDots
  });

  return (
    <div className="px-4 flex flex-col gap-4">
      {/* Header Section */}
      <SubHeader
        title="Recommended for You"
        link="Lihat Semua"
        url={onViewAll}
        divider={false}
      />

      {/* Scrollable Product Container */}
      <ProductScrollContainer
        products={products}
        onProductClick={handleProductClick}
        onTambahClick={onTambahClick}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
        getCartQuantity={getCartQuantity}
        onScroll={handleScroll}
        scrollRef={scrollContainerRef}
        gap="gap-3"
        cardWidth={cardWidth}
      />

      {/* Pagination Dots */}
      {shouldShowPagination && (
        <div className="flex justify-center pt-2">
          <DotPagination
            totalItems={paginationTotalItems}
            activeIndex={activeIndex}
            onDotClick={scrollToIndex}
            size="sm"
            colorTheme="orange"
            animationVariant="bounce"
            alignment="center"
            maxDots={maxPaginationDots + 1}
          />
        </div>
      )}
    </div>
  );
};

export const RecommendedSection = memo(RecommendedSectionComponent);

export default RecommendedSection;
