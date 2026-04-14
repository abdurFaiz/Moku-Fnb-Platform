interface PointsRewardProps {
    title: string;
    label: string;
    points: number | string;
    icon?: string;
}

export const PointsRewardSection: React.FC<PointsRewardProps> = ({
    title,
    label,
    points,
    icon = "/icons/icon-poin.svg",
}) => {
    return (
        <div className="flex flex-col gap-4 py-4">
            {/* Header */}
            <div className="flex justify-between items-center px-4 pb-4 border-b border-body-grey/25">
                <h3 className="text-lg font-rubik font-medium capitalize">{title}</h3>
            </div>


            {/* Points Row */}
            <div className="flex justify-between items-center px-4 py-3">
                <span className="text-base font-rubik font-medium text-body-grey capitalize">{label}</span>
                <div className="flex items-center gap-1">
                    <img src={icon} loading="lazy" alt="Points Icon" className="w-5 h-5" />
                    <span className="text-sm font-rubik font-medium text-title-black">+ {points}</span>
                </div>
            </div>
        </div>
    );
};