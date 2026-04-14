import type { TableNumber } from '@/features/table/types/TableNumber';

interface TableButtonProps {
    readonly table: TableNumber;
    readonly isSelected: boolean;
    readonly isAvailable?: boolean;
    readonly onClick: (table: TableNumber) => void;
}

export function TableButton({
    table,
    isSelected,
    isAvailable = true,
    onClick,
}: TableButtonProps) {
    const handleClick = () => {
        if (isAvailable) {
            onClick(table);
        }
    };

    // Determine styling based on state
    const getButtonClasses = () => {
        const baseClasses =
            'rounded-md px-3 py-2 items-center flex text-center cursor-pointer transition-colors duration-200 font-rubik text-sm font-medium text-white';

        if (isSelected) {
            return `${baseClasses} bg-sky-500 ring-2 ring-sky-600`;
        }

        if (!isAvailable) {
            return `${baseClasses} bg-body-grey cursor-not-allowed opacity-60`;
        }

        return `${baseClasses} bg-primary-orange hover:bg-opacity-90`;
    };

    return (
        <button
            onClick={handleClick}
            className={getButtonClasses()}
            disabled={!isAvailable}
            aria-label={`Table ${table.number}`}
            aria-pressed={isSelected}
        >
            {table.number}
        </button>
    );
}
