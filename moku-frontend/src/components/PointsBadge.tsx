interface PointsBadgeProps {
    points: number;
}

export function PointsBadge({ points }: PointsBadgeProps) {
    return (
        <div className="px-2.5 py-3 rounded-xl bg-primary-orange/20 flex items-center gap-1">
            <div className="flex items-center gap-1">
                <img loading="lazy" src="/icons/icon-poin.svg" alt="Points Badge" className="size-5" />
                <span className="text-xs font-rubik font-medium text-primary-orange">Kamu akan mendapat {points} poin dari pesanan ini</span>
            </div>
        </div>
    );
}