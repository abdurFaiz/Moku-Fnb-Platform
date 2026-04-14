import React from 'react';
import HomeLoadingSkeleton from '@/features/storefront/components/HomeLoadingSkeleton';

export interface LoadingBoundaryProps {
    /**
     * Is loading state
     */
    isLoading: boolean;

    /**
     * Custom loading component
     */
    loadingComponent?: React.ReactNode;

    /**
     * Children to render when not loading
     */
    children: React.ReactNode;

    /**
     * Loading state message
     */
    message?: string;
}

/**
 * Reusable loading display component
 */
export const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
    isLoading,
    loadingComponent,
    children,
    message,
}) => {
    if (!isLoading) {
        return <>{children}</>;
    }

    // Custom component provided
    if (loadingComponent) {
        return <>{loadingComponent}</>;
    }

    // Default loading display
    return (
        <div className="flex flex-col items-center justify-center py-8">
            <HomeLoadingSkeleton />
            {message && (
                <p className="text-gray-500 mt-4">{message}</p>
            )}
        </div>
    );
};

export default LoadingBoundary;
