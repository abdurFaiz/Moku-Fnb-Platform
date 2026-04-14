import { Package, Store } from 'lucide-react';
import type { Outlet } from '@/features/outlets/types/Outlet';

interface OutletStatusProps {
    outlet: Outlet | null;
    totalProducts: number;
    isLoading?: boolean;
}

export default function OutletStatus({ outlet, totalProducts, isLoading }: OutletStatusProps) {
    if (isLoading) {
        return (
            <div className="px-4 py-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
                        <div className="h-3 w-20 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                    <div className="h-3 w-16 bg-gray-300 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!outlet) {
        return (
            <div className="px-4 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">No outlet selected</span>
                    </div>
                    <span className="text-xs text-yellow-600">Select an outlet above</span>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 py-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800 font-medium">
                        {outlet.name}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Package className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-600">
                        {totalProducts} products
                    </span>
                </div>
            </div>
        </div>
    );
}