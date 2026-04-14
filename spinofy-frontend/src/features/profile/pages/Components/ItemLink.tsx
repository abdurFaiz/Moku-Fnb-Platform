import React from "react";
import { ChevronRight } from "lucide-react";

interface ListItemLinkProps {
    label: string;
    href?: string;
    className?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
}

const ListItemLink: React.FC<ListItemLinkProps> = ({
    label,
    href = "#",
    className = "",
    onClick,
    icon = <ChevronRight className="w-6 h-6 text-brand-gray" strokeWidth={2} />,
}) => {
    return (
        <a
            href={href}
            onClick={onClick}
            className={`flex items-center justify-between py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors ${className}`}
        >
            <span className="text-brand-gray text-base">{label}</span>
            {icon}
        </a>
    );
};

export default ListItemLink;