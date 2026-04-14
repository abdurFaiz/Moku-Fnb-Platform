import { useEffect, useState } from 'react';

interface WebSocketStatusIndicatorProps {
    isConnected: boolean;
    orderCode?: string;
}

export function WebSocketStatusIndicator({
    isConnected,
    orderCode
}: WebSocketStatusIndicatorProps) {
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        // Only show in development mode
        if (import.meta.env.MODE === 'development') {
            setShowIndicator(true);
        }
    }, []);

    if (!showIndicator || !isConnected) {
        return null;
    }

    return (
        <div className="fixed bottom-20 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-green-500 text-white text-xs rounded-full shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="font-medium">Live Updates</span>
            {orderCode && (
                <span className="opacity-75">#{orderCode}</span>
            )}
        </div>
    );
}
