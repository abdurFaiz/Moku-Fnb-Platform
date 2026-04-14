import { ArrowLeft, Filter, HistoryIcon, Search } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface HeaderBarProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    showFilter?: boolean;
    showSearch?: boolean;
    showHistory?: boolean;
    onBack?: () => void;
    onFilter?: () => void;
    onSearch?: () => void;
    onHistory?: () => void;
    className?: string;
}

export const HeaderBar = ({
    title,
    subtitle,
    showBack = false,
    showFilter = false,
    showSearch = false,
    showHistory = false,
    onBack,
    onFilter,
    onSearch,
    onHistory,
    className,
}: HeaderBarProps) => {
    return (
        <header
            className={twMerge(
                "flex items-center justify-between bg-white font-rubik p-4 rounded-b-2xl shadow-md shadow-body-grey/10",
                className
            )}
        >
            {/* Left Section (Back Button) */}
            <div className="flex items-center gap-1.5">
                {showBack && (
                    <button
                        onClick={onBack}
                        className=" rounded-full hover:bg-primary-orange/20 transition"
                    >
                        <ArrowLeft className="size-6 text-title-black" />
                    </button>
                )}
                <div className="flex flex-col gap-1">
                    <h1 className="text-lg leading-normal font-rubik font-medium text-title-black">
                        {title}
                    </h1>
                    <p className="text-sm font-normal text-body-grey">{subtitle}</p>
                </div>

            </div>

            {/* Right Section (Filter Button) */}
            {showFilter && (
                <button
                    onClick={onFilter}
                    className="p-2 rounded-full hover:bg-primary-orange/20 transition"
                >
                    <Filter className="size-6 text-title-black" />
                </button>
            )}

            {/* Right Section (Search Button) */}
            {showSearch && (
                <button
                    onClick={onSearch}
                    className="p-2 rounded-full hover:bg-primary-orange/20 transition"
                >
                    <Search className="size-6 text-title-black" />
                </button>
            )}
            {/* Right Section (Search Button) */}
            {showHistory && (
                <button
                    onClick={onHistory}
                    className="p-2 rounded-full hover:bg-primary-orange/20 transition"
                >
                    <HistoryIcon className="size-6 text-title-black" />
                </button>
            )}
        </header>
    );
};

export default HeaderBar;