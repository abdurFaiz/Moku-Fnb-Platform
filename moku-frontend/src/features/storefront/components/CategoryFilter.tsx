import { cn } from "@/lib/utils";
import type { Category } from "@/features/product/types/Product";

interface CategoryFilterProps {
    categories: Category[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
}

export function CategoryFilter({
    categories,
    activeCategory,
    onCategoryChange,
}: CategoryFilterProps) {
    return (
        <div className="flex items-center gap-2">
            {categories.map((category) => (
                <button
                    key={category.id}
                    data-category={category.name}
                    onClick={() => onCategoryChange(category.name)}
                    className={cn(
                        "px-3 py-2 rounded-2xl border text-xs text-center font-rubik font-normal capitalize whitespace-nowrap transition-colors shrink-0",
                        activeCategory === category.name
                            ? "border-primary-orange bg-primary-orange/5 text-primary-orange"
                            : "border-body-grey bg-body-grey/5 text-body-grey"
                    )}
                >
                    {category.name}
                </button>
            ))}
        </div>
    );
}
