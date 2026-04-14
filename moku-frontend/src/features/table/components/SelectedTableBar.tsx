import type { TableNumber } from '@/features/table/types/TableNumber';
import Button from '../../../components/ui/button';

interface SelectedTableBarProps {
    readonly selectedTable?: TableNumber | null;
    readonly selectedTables?: TableNumber[];
    readonly label?: string;
    readonly buttonText?: string;
    readonly onSubmit: () => void;
}

export function SelectedTableBar({
    selectedTable,
    selectedTables,
    label = 'Lokasi Meja',
    buttonText = 'Selanjutnya Pilih Menu',
    onSubmit,
}: SelectedTableBarProps) {
    // Support both single and multiple selection
    const tables = selectedTables || (selectedTable ? [selectedTable] : []);
    const isDisabled = tables.length === 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 max-w-[440px] z-50 mx-auto w-full flex flex-col rounded-t-3xl bg-white shadow-[0_-4px_8px_0_rgba(128,128,128,0.20)]">
            <div className="px-4 pt-6 pb-6 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className="flex flex-row items-center gap-3">
                        <p className="font-rubik text-sm text-body-grey">
                            {label} 
                        </p>
                        {tables.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 max-w-xs overflow-x-auto">
                                {tables.map((table) => (
                                    <div
                                        key={table.id}
                                        className="rounded-md px-3 py-2 items-center flex text-center bg-primary-orange"
                                    >
                                        <span className="text-sm font-medium font-rubik text-white">
                                            {table.number}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={onSubmit}
                    disabled={isDisabled}
                >
                    {buttonText}
                </Button>
            </div>
        </div>
    );
}
