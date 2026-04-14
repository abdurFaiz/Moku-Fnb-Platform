import { Search, Utensils } from "lucide-react";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation"

type Props = {
    placeholder?: string;
    className?: string;
};

export default function SearchBar({
    className = "",
    placeholder = "Mau pesan apa hari ini?"
}: Props) {
    const { navigateToSearchProduct } = useOutletNavigation();

    return (
        <div className={` mx-auto px-4 relative z-40 ${className}`}>
            <button
                type="button"
                onClick={navigateToSearchProduct}
                className="flex items-center w-full gap-2 p-4 bg-gray-50 dark:bg-slate-800 rounded-[20px] border border-gray-200 dark:border-slate-700"
                aria-label={placeholder}
            >
                {/* Magnifier */}
                <Search className="size-5 text-body-grey" />
                <span className="flex-1 text-left text-sm text-body-grey">
                    {placeholder}
                </span>
                <Utensils className="size-5 text-body-grey" />
            </button>
        </div>
    );
}