import React from 'react';

export interface ErrorBoundaryProps {
    /**
     * Error message to display
     */
    error: string | null | undefined;

    /**
     * Show error or not
     */
    isError?: boolean;

    /**
     * Container className
     */
    containerClassName?: string;

    /**
     * Custom error component
     */
    errorComponent?: React.ReactNode;

    /**
     * Optional action button
     */
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({
    error,
    isError = !!error,
    containerClassName = 'flex items-center justify-center h-screen',
    errorComponent,
    action,
}) => {
    if (!isError) return null;

    // Custom component provided
    if (errorComponent) {
        return <div className={containerClassName}>{errorComponent}</div>;
    }

    // Default error display
    return (
        <div className={containerClassName}>
            <div className="text-center px-4">
                <div className="text-lg text-red-500 mb-4">
                    ⚠️ Error
                </div>
                <p className="text-gray-700 mb-4">
                    {error || 'An unexpected error occurred'}
                </p>
                {action && (
                    <button
                        onClick={action.onClick}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                        {action.label}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorBoundary;
