import React, { useState, useMemo } from 'react';
import { ChevronDown, Users } from 'lucide-react';

interface TableSelectionSectionProps {
    /**
     * Selected table number
     */
    selectedTable: string | null;
    /**
     * Callback when a table is selected
     */
    onTableSelect: (tableNumber: string) => void;
    /**
     * Custom list of available tables (optional)
     * If not provided, will generate a default list
     */
    availableTables?: string[];
}

/**
 * Component for selecting a table in Table Service outlets
 * Displays a dropdown with available tables
 */
export const TableSelectionSection: React.FC<TableSelectionSectionProps> = ({
    selectedTable,
    onTableSelect,
    availableTables,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Generate default table list if not provided
    // Generates tables T1 - T20
    const tables = useMemo(() => {
        if (availableTables && availableTables.length > 0) {
            return availableTables;
        }
        // Default: Generate 20 tables
        return Array.from({ length: 20 }, (_, i) => `T${i + 1}`);
    }, [availableTables]);

    const handleTableSelect = (table: string) => {
        onTableSelect(table);
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Section Title */}
            <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-brand-orange" />
                <h3 className="text-sm font-semibold text-title-black">Pilih Meja Anda</h3>
            </div>

            {/* Table Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${selectedTable
                        ? 'bg-white border-brand-orange/30 hover:border-brand-orange'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                    aria-label="Select table"
                >
                    <div className="flex items-center gap-2">
                        <Users className={`w-4 h-4 ${selectedTable ? 'text-brand-orange' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${selectedTable ? 'text-title-black' : 'text-gray-500'}`}>
                            {selectedTable || 'Pilih meja...'}
                        </span>
                    </div>
                    <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                </button>

                {/* Dropdown Menu */}
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <button
                            className="fixed inset-0 z-10 bg-transparent"
                            onClick={() => setIsOpen(false)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                    setIsOpen(false);
                                }
                            }}
                            aria-label="Close dropdown"
                        />

                        {/* Dropdown Content */}
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-100 z-20 max-h-60 overflow-y-auto">
                            <div className="grid grid-cols-4 gap-1 p-3">
                                {tables.map((table) => (
                                    <button
                                        key={table}
                                        onClick={() => handleTableSelect(table)}
                                        className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${selectedTable === table
                                            ? 'bg-brand-orange text-white'
                                            : 'bg-gray-50 text-title-black hover:bg-gray-100'
                                            }`}
                                    >
                                        {table}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Info Text */}
            {selectedTable && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    ✓ Anda memilih meja <span className="font-semibold text-brand-orange">{selectedTable}</span>
                </p>
            )}
        </div>
    );
};

export default TableSelectionSection;
