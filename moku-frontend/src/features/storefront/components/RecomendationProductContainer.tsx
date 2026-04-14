import React from 'react';

interface RecommendationProductContainerProps {
    children: React.ReactNode;
    onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

export const RecommendationProductContainer = React.forwardRef<HTMLDivElement, RecommendationProductContainerProps>(
    ({ children, onScroll }, ref) => {
        return (
            <div
                ref={ref}
                className="flex gap-3 overflow-x-auto scrollbar-hide"
                onScroll={onScroll}
            >
                {children}
            </div>
        );
    }
);

RecommendationProductContainer.displayName = 'RecommendationProductContainer';
RecommendationProductContainer.displayName = 'RecommendationProductContainer';

export default RecommendationProductContainer;
