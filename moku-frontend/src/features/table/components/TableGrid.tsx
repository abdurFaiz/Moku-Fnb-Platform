import type { TableNumber } from '@/features/table/types/TableNumber';
import { TableButton } from './TableButton';

interface TableGridProps {
    readonly tables: TableNumber[];
    readonly selectedTableId?: number;
    readonly selectedTableIds?: number[];
    readonly availableTableIds?: number[];
    readonly columns?: number;
    readonly onTableSelect: (table: TableNumber) => void;
}

export function TableGrid({
    tables,
    selectedTableId,
    selectedTableIds,
    availableTableIds = [],
    columns = 5,
    onTableSelect,
}: TableGridProps) {
    // Support both single and multiple selection
    const isTableSelected = (tableId: number) => {
        if (selectedTableIds) {
            return selectedTableIds.includes(tableId);
        }
        return selectedTableId === tableId;
    };

    return (
        <div className={`grid grid-cols-${columns} gap-2`}>
            {tables.map((table) => (
                <TableButton
                    key={table.id}
                    table={table}
                    isSelected={isTableSelected(table.id)}
                    isAvailable={
                        availableTableIds.length === 0 || availableTableIds.includes(table.id)
                    }
                    onClick={onTableSelect}
                />
            ))}
        </div>
    );
}
