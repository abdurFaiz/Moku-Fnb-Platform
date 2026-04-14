import { SpecialOfferScrollContainer } from '@/features/checkout/components/SpecialOfferSection/SpecialOfferScrollContainer';
// import { DotPagination } from '@/components/DotPagination';
import { useSpecialOffersSection } from '@/features/checkout/hooks/useSpecialOffersSection';
import type { SpecialOffer } from '@/features/checkout/types/SpecialOffer';

interface SpecialOffersSectionProps {
    /**
     * Array of special offers to display
     */
    readonly offers: SpecialOffer[];

    /**
     * Callback when offer is added
     */
    readonly onAddOffer: (offerId: string) => void;

    /**
     * Maximum pagination dots to show
     */
    readonly maxPaginationDots?: number;

    /**
     * Gap between offer cards in pixels
     */
    readonly cardGap?: number;
}

export function SpecialOffersSection({
    offers,
    onAddOffer,
    maxPaginationDots = 5,
    cardGap = 16
}: SpecialOffersSectionProps) {
    // Business logic handled by custom hook
    const {
        scrollContainerRef,
        handleScroll,
        // scrollToIndex,
        // activeIndex,
        // shouldShowPagination,
        handleAddOffer
    } = useSpecialOffersSection({
        offers,
        onAddOffer,
        cardGap,
        maxPaginationDots
    });

    return (
        <div className="py-4 bg-linear-to-b from-white via-white/60 to-primary-orange/20 flex flex-col gap-4">
            {/* Header Section */}
            <h2 className="text-base font-rubik font-medium capitalize px-4">
                Special <span className="text-primary-orange">SpinofyForYou,</span> <span className="text-title-black">Hanya Hari Ini!</span>
            </h2>

            {/* Scrollable Offer Container */}
            <SpecialOfferScrollContainer
                offers={offers}
                onAddOffer={handleAddOffer}
                onScroll={handleScroll}
                scrollRef={scrollContainerRef}
                className="px-4"
                gap="gap-4"
            />

            {/* Pagination Dots */}
            {/* {shouldShowPagination && (
                <div className="flex justify-center pt-2">
                    <DotPagination
                        totalItems={offers.length}
                        activeIndex={activeIndex}
                        onDotClick={scrollToIndex}
                        size="sm"
                        colorTheme="orange"
                        animationVariant="bounce"
                        alignment="center"
                        maxDots={maxPaginationDots}
                    />
                </div>
            )} */}
        </div>
    );
}