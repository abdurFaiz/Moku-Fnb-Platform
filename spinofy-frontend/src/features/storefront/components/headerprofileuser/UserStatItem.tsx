interface UserStatItemProps {
    icon: string;
    value: number;
    label?: string;
    onClick?: () => void;
}

export function UserStatItem({ icon, value, label, onClick }: UserStatItemProps) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-1 px-2 py-2 rounded-full bg-white hover:bg-gray-50 transition-colors cursor-pointer"
        >
            <img decoding="async" width={24} height={24} loading="lazy" src={icon} alt="" className="size-6" />
            <span className="text-sm font-medium text-title-black truncate font-rubik max-w-[120px]">{value}</span>
            {label && <span className="text-xs text-gray-500">{label}</span>}
        </button>
    );
}
