export interface PointHistory {
    id: string | number;
    category: string;
    title: string;
    date: string;
    amount: number;
}

type PointHistoryItemProps = Omit<PointHistory, 'id'>;

export function PointHistoryItem({ category, title, date, amount }: PointHistoryItemProps) {
    const isPositive = amount >= 0;

    return (
        <div className="flex flex-row items-center justify-between p-4 border-b border-body-grey/25 border-dashed">
            <div className="flex flex-col gap-1">
                <p className="text-body-grey font-rubik font-medium text-xs">{category}</p>
                <h1 className="text-title-black font-rubik font-medium text-base">{title}</h1>
                <span className="text-body-grey font-rubik font-normal text-xs">{date}</span>
            </div>

            <div className="flex flex-row gap-2 items-center">
                <img loading="lazy" src="/icons/icon-poin.svg" alt="Poin" className="size-4" />
                <span
                    className={`font-medium text-xs font-rubik ${isPositive ? 'text-green-500' : 'text-red-500' // Green untuk poin didapat, red untuk poin terpakai
                        }`}
                >
                    {isPositive ? '+' : ''} {amount.toLocaleString('id-ID')}
                </span>
            </div>
        </div>
    );
}