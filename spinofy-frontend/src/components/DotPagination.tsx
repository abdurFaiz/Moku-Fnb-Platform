import React from 'react';
import { motion } from 'framer-motion';

export interface DotPaginationProps {
    /**
     * Total number of items/pages
     */
    totalItems: number;

    /**
     * Currently active dot index (0-based)
     */
    activeIndex: number;

    /**
     * Callback when a dot is clicked
     */
    onDotClick?: (index: number) => void;

    /**
     * Size of each dot (default: 'md')
     */
    size?: 'sm' | 'md' | 'lg';

    /**
     * Color theme (default: 'orange')
     */
    colorTheme?: 'orange' | 'blue' | 'gray';

    /**
     * Show dot text or numbers (default: false)
     */
    showLabels?: boolean;

    /**
     * Animation variant (default: 'bounce')
     */
    animationVariant?: 'bounce' | 'scale' | 'fade';

    /**
     * Custom CSS class for container
     */
    containerClassName?: string;

    /**
     * Alignment of pagination (default: 'center')
     */
    alignment?: 'start' | 'center' | 'end';

    /**
     * Maximum dots to show (default: 5). If totalItems > maxDots, shows infinite indicator
     */
    maxDots?: number;
}const sizeMap = {
    sm: { dot: 'w-2 h-2', gap: 'gap-2' },
    md: { dot: 'w-3 h-3', gap: 'gap-3' },
    lg: { dot: 'w-4 h-4', gap: 'gap-4' },
};

const colorMap = {
    orange: {
        inactive: 'bg-gray-300',
        active: 'bg-orange-500',
    },
    blue: {
        inactive: 'bg-gray-300',
        active: 'bg-blue-500',
    },
    gray: {
        inactive: 'bg-gray-300',
        active: 'bg-gray-700',
    },
};

const alignmentMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
};

const animationVariants = {
    bounce: {
        initial: { scale: 0.5, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { type: 'spring' as const, stiffness: 300, damping: 20 },
    },
    scale: {
        initial: { scale: 0, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { duration: 0.3, ease: 'easeOut' as const },
    },
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.3 },
    },
};

export const DotPagination: React.FC<DotPaginationProps> = ({
    totalItems,
    activeIndex,
    onDotClick,
    size = 'md',
    colorTheme = 'orange',
    showLabels = false,
    animationVariant = 'bounce',
    containerClassName = '',
    alignment = 'center',
    maxDots = 5,
}) => {
    const sizeClasses = sizeMap[size];
    const colorClasses = colorMap[colorTheme];
    const alignClass = alignmentMap[alignment];
    const animationConfig = animationVariants[animationVariant];

    const shouldShowInfinite = totalItems > (maxDots || 5);
    const dotsToShow = shouldShowInfinite ? (maxDots || 5) : totalItems;

    let startIndex = 0;
    if (shouldShowInfinite && activeIndex >= Math.floor((maxDots || 5) / 2)) {
        startIndex = Math.min(
            activeIndex - Math.floor((maxDots || 5) / 2),
            totalItems - (maxDots || 5)
        );
    }

    return (
        <div
            className={`flex items-center ${sizeClasses.gap} ${alignClass} ${containerClassName}`}
            role="tablist"
            aria-label="Pagination"
        >
            {Array.from({ length: dotsToShow }).map((_, index) => {
                const actualIndex = startIndex + index;
                const isActive = actualIndex === activeIndex;

                return (
                    <motion.button
                        key={`dot-${actualIndex}`}
                        {...animationConfig}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDotClick?.(actualIndex)}
                        className={`rounded-full transition-colors duration-300 cursor-pointer ${sizeClasses.dot} ${isActive ? colorClasses.active : colorClasses.inactive
                            }`}
                        aria-label={`Go to item ${actualIndex + 1}`}
                        aria-current={isActive ? 'page' : undefined}
                        disabled={!onDotClick}
                        type="button"
                        role="tab"
                    >
                        {showLabels && (
                            <span className="text-xs font-semibold text-white flex items-center justify-center h-full">
                                {actualIndex + 1}
                            </span>
                        )}
                    </motion.button>
                );
            })}

            {/* Infinite indicator for items beyond max dots */}
            {shouldShowInfinite && (
                <motion.div
                    {...animationConfig}
                    className={`flex items-center justify-center ${sizeClasses.dot} ${colorClasses.inactive} rounded-full`}
                    title={`${totalItems - (maxDots || 5)} more items`}
                >
                </motion.div>
            )}
        </div>
    );
};

export default DotPagination;
