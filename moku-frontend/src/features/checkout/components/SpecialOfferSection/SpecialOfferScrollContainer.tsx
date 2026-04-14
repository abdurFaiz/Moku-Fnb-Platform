import React from 'react';
import { SpecialOfferCard } from './SpecialOfferCard';
import type { SpecialOffer } from '@/features/checkout/types/SpecialOffer';

export interface SpecialOfferScrollContainerProps {
  /**
   * Array of special offers to display
   */
  offers: SpecialOffer[];

  /**
   * Callback when offer is added
   */
  onAddOffer: (offerId: string) => void;

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
}


export const SpecialOfferScrollContainer: React.FC<SpecialOfferScrollContainerProps> = ({
  offers,
  onAddOffer,
  onScroll,
  scrollRef,
  className = '',
  gap = 'gap-3'
}) => {
  return (
    <div
      className={`overflow-x-auto scrollbar-hide ${className}`}
      ref={scrollRef}
      onScroll={onScroll}
    >
      <div className={`flex ${gap} pb-2`}>
        {offers.map((offer) => (
          <div key={offer.id} data-scroll-item="true">
            <SpecialOfferCard
              offer={offer}
              onAdd={() => onAddOffer(offer.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};