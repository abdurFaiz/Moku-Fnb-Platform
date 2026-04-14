import { ShoppingBag, Utensils } from 'lucide-react';

interface EmptyProductSectionProps {
    title: string;
    type?: string;
    message?: string;
    onRetry?: () => void;
}

const getIconAndMessage = (type: EmptyProductSectionProps['type']) => {
    switch (type) {
        case 'recommendations':
            return {
                icon: <ShoppingBag className="w-8 h-8 text-gray-400" />,
                message: 'No recommendations available at the moment'
            };
        default:
            return {
                icon: <Utensils className="w-8 h-8 text-gray-400" />,
                message: 'No products available'
            };
    }
};

export default function EmptyProductSection({
    title,
    type = 'general',
    message,
    onRetry
}: EmptyProductSectionProps) {
    const { icon, message: defaultMessage } = getIconAndMessage(type);
    const displayMessage = message || defaultMessage;

    return (
        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            {icon}
            <h3 className="text-lg font-medium text-title-black mt-3 mb-1">
                No {title}
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
                {displayMessage}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="mt-4 px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                    Retry
                </button>
            )}
        </div>
    );
}