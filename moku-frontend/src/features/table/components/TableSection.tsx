import type { TableNumber } from '@/features/table/types/TableNumber';
import { TableGrid } from './TableGrid';

interface TableSectionProps {
    readonly title: string;
    readonly tables: TableNumber[];
    readonly selectedTableId?: number;
    readonly selectedTableIds?: number[];
    readonly availableTableIds?: number[];
    readonly columns?: number;
    readonly onTableSelect: (table: TableNumber) => void;
}

export function TableSection({
    title,
    tables,
    selectedTableId,
    selectedTableIds,
    availableTableIds,
    columns = 5,
    onTableSelect,
}: TableSectionProps) {
    return (
        <div className="flex flex-col gap-3">
            <h2 className="font-rubik text-base font-medium text-body-grey">{title}</h2>
            <TableGrid
                tables={tables}
                selectedTableId={selectedTableId}
                selectedTableIds={selectedTableIds}
                availableTableIds={availableTableIds}
                columns={columns}
                onTableSelect={onTableSelect}
            />
        </div>
    );
}
