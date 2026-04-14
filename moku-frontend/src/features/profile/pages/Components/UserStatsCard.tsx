import React from "react";

interface StatItem {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    withBorder?: boolean;
    onClick?: () => void;
}

interface UserStatsCardProps {
    stats: StatItem[];
    className?: string;
}

const UserStatsCard: React.FC<UserStatsCardProps> = ({ stats, className = "" }) => {
    return (
        <div className={`px-4 -mt-8 mb-6 relative z-20 ${className}`}>
            <div className="bg-white rounded-2xl border border-white shadow-sm p-4 flex justify-between items-center">
                {stats.map((item, index) => (
                    <div
                        key={index}
                        className={`flex flex-col items-center gap-2 flex-1 ${item.withBorder ? "border-x border-gray-100 px-2" : ""
                            }`}
                    >
                        <h3 className="text-title-black text-base font-medium text-center">{item.title}</h3>
                        <div onClick={item.onClick} className="flex items-center gap-2">
                            {item.icon}
                            <span className="text-title-black text-sm font-medium">{item.value}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserStatsCard;
