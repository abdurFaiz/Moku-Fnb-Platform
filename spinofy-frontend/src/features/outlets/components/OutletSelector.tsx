import { useState } from 'react';
import { ChevronDown, MapPin, Store } from 'lucide-react';
import type { Outlet } from '@/features/outlets/types/Outlet';

interface OutletSelectorProps {
    outlets: Outlet[];
    currentOutlet: Outlet | null;
    onOutletChange: (outletSlug: string) => void;
    isLoading?: boolean;
}

export default function OutletSelector({
    outlets,
    currentOutlet,
    onOutletChange,
    isLoading = false,
}: OutletSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-1 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!outlets.length) {
        return (
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                    <Store className="w-8 h-8 text-gray-400" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-500">No outlets available</p>
                        <p className="text-xs text-gray-400">Please check back later</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Current Selection */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-brand-orange transition-colors"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-orange rounded-lg flex items-center justify-center">
                            <Store className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-title-black">
                                {currentOutlet?.name || 'Select Outlet'}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {currentOutlet?.address || 'Choose your preferred location'}
                            </p>
                        </div>
                    </div>
                    <ChevronDown
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''
                            }`}
                    />
                </div>
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 z-20 max-h-64 overflow-y-auto">
                        {outlets.map((outlet) => (
                            <button
                                key={outlet.id}
                                onClick={() => {
                                    onOutletChange(outlet.slug);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${currentOutlet?.id === outlet.id ? 'bg-brand-orange/5 border-brand-orange/20' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${currentOutlet?.id === outlet.id
                                        ? 'bg-brand-orange text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        <Store className="w-3 h-3" />
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${currentOutlet?.id === outlet.id
                                            ? 'text-brand-orange'
                                            : 'text-title-black'
                                            }`}>
                                            {outlet.name}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {outlet.address || 'Location not specified'}
                                            </p>
                                            <span className="text-xs text-gray-400">
                                                {outlet.products_count} items
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}