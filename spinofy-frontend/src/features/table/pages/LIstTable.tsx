import { HeaderBar, ScreenWrapper, SkeletonLoader } from "@/components";
import { Legend } from "@/features/table/components/Legend";
import { TableSection } from "../components/TableSection";
import { SelectedTableBar } from "@/features/table/components/SelectedTableBar";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
    DrawerClose,
} from "@/components/ui/drawer";
import { useBarcodeStore } from "@/features/storefront/stores/useBarcodeStore";
import type { TableNumber } from "@/features/table/types/TableNumber";
import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQueryTableNumbers } from "@/features/table/hooks/api/useQueryTableNumbers";
import { X } from "lucide-react"
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation"

interface TableNumberProps {
    readonly tableNumbers?: TableNumber[];
    readonly outletSlug?: string;
    readonly onSubmit?: (selectedTables: TableNumber[]) => void;
}

export default function ListTable({ tableNumbers, outletSlug, onSubmit }: TableNumberProps) {
    const { navigateToHome } = useOutletNavigation();
    const params = useParams<{ outletSlug: string }>();
    // single selection: only one table can be chosen
    const [selectedTable, setSelectedTable] = useState<TableNumber | null>(null);

    // Get store functions
    const { setBarcode, setOutletSlug } = useBarcodeStore();

    // Fetch tables from API if not provided
    const { data: apiTableData, isLoading } = useQueryTableNumbers(outletSlug, tableNumbers);

    // Use provided tables or API data
    const tables = tableNumbers || apiTableData?.data?.table_numbers || [];

    // Memoized section splitting based on table location
    const tablesByLocation = useMemo(() => {
        const locationMap = new Map<string, TableNumber[]>();

        for (const table of tables) {
            const locationName = table.table_number_location?.name || 'Tanpa Lokasi';
            if (!locationMap.has(locationName)) {
                locationMap.set(locationName, []);
            }
            locationMap.get(locationName)!.push(table);
        }

        return Array.from(locationMap.entries()).map(([location, tableLists]) => ({
            location,
            tables: tableLists,
        }));
    }, [tables]);

    const handleTableSelect = (table: TableNumber) => {
        setSelectedTable((prev) => (prev?.id === table.id ? null : table));
    };

    const handleSubmit = () => {
        if (selectedTable) {
            // Get outlet slug
            const slug = outletSlug || params.outletSlug || '';

            // Store selected tables in Zustand store
            const tableNumbers = selectedTable?.number ?? '';
            setBarcode(tableNumbers);
            setOutletSlug(slug);

            // Call parent callback if provided
            if (onSubmit) {
                onSubmit(selectedTable ? [selectedTable] : []);
            }

            navigateToHome();
        }
    };

    // Show loading state
    if (isLoading && (!tableNumbers || tableNumbers.length === 0)) {
        return (
            <ScreenWrapper>
                <SkeletonLoader />
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <HeaderBar title="Pilih Lokasi Meja" showBack={true} onBack={navigateToHome} />
            <div className="flex flex-col justify-between h-screen">
                <Legend />
                {/* Render a full grid (TableGrid) first, then grouped sections below for detail */}
                <div className="px-4 pb-6 flex-1 overflow-y-auto">
                    {tables.length > 0 ? (
                        <div className="space-y-6 mb-40">
                            {/* Still keep grouped sections below (optional) */}
                            {tablesByLocation.length > 0 && (
                                <div className="flex flex-col gap-8 pt-6">
                                    {tablesByLocation.map((section) => (
                                        <TableSection
                                            key={section.location}
                                            title={section.location}
                                            tables={section.tables}
                                            selectedTableId={selectedTable?.id}
                                            onTableSelect={handleTableSelect}
                                            columns={4}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center text-gray-500">
                            <p className="mb-2 font-semibold">Tidak ada meja yang tersedia</p>
                            <p className="text-sm">Silakan coba refresh atau pilih outlet lain.</p>
                        </div>
                    )}
                </div>
                <Drawer>
                    <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader className="flex items-center justify-between">
                            <DrawerTitle>Pilih Meja</DrawerTitle>
                            <DrawerClose className="p-0 rounded-full hover:bg-gray-100">
                                <X className="w-5 h-5" />
                            </DrawerClose>
                        </DrawerHeader>

                        {/* Table Sections */}
                        <div className="flex-1 overflow-y-auto px-4 pb-32">
                            <div className="flex flex-col gap-8">
                                {tablesByLocation.map((section) => (
                                    <TableSection
                                        key={section.location}
                                        title={section.location}
                                        tables={section.tables}
                                        selectedTableId={selectedTable?.id}
                                        onTableSelect={handleTableSelect}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Bottom action bar - sticky */}
                        <DrawerFooter className="border-t sticky bottom-0 bg-white">
                            <SelectedTableBar
                                selectedTable={selectedTable}
                                onSubmit={handleSubmit}
                            />
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>

                {/* Bottom fixed bar for page (shows selected tables + continue) */}
                <SelectedTableBar
                    selectedTable={selectedTable}
                    onSubmit={handleSubmit}
                    buttonText={selectedTable ? 'Lanjutkan' : 'Belum Pilih Meja'}
                />
            </div>
        </ScreenWrapper>
    );
}