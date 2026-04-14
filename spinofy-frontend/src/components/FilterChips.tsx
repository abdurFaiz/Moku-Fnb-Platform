interface FilterOption<T = string> {
    value: T;
    label: string;
}

interface FilterChipProps<T = string> {
    filters: FilterOption<T>[];
    activeFilter: T;
    onChange: (value: T) => void;
    className?: string;
}

export const FilterChip = <T extends string = string>({
    filters,
    activeFilter,
    onChange,
    className = "",
}: FilterChipProps<T>) => {
    return (
        <div className={`flex gap-2 overflow-x-auto scrollbar-hide ${className}`}>
            {filters.map((filter) => (
                <button
                    key={filter.value}
                    onClick={() => onChange(filter.value)}
                    className={`flex-shrink-0 px-3 py-2 rounded-2xl border text-xs capitalize transition-colors ${activeFilter === filter.value
                            ? "border-primary-orange bg-[rgba(243,95,15,0.04)] text-primary-orange"
                            : "border-body-grey bg-[rgba(18,18,18,0.04)] text-body-grey"
                        }`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
};