interface LegendItemProps {
    readonly colorClass: string;
    readonly label: string;
}
export function LegendItem({ colorClass, label }: LegendItemProps) {
    return (
        <div className="flex flex-row items-center gap-2">
            <div className={`rounded-md text-center ${colorClass} size-6`} />
            <p className="font-rubik text-sm text-body-grey">{label}</p>
        </div>
    );
}

interface LegendProps {
    readonly items?: ReadonlyArray<{
        readonly colorClass: string;
        readonly label: string;
    }>;
}

export function Legend({
    items = [
        { colorClass: 'bg-primary-orange', label: 'Tersedia' },
        { colorClass: 'bg-body-grey', label: 'Tidak Tersedia' },
        { colorClass: 'bg-sky-500', label: 'Pilihanmu' },
    ],
}: LegendProps) {
    return (
        <div className="flex flex-row w-full justify-between items-center px-6 py-4 border-b border-body-grey/20">
            {items.map((item, index) => (
                <LegendItem
                    key={`${item.label}-${index}`}
                    colorClass={item.colorClass}
                    label={item.label}
                />
            ))}
        </div>
    );
}
