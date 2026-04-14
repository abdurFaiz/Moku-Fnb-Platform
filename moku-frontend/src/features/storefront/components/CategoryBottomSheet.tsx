import BottomSheetBase from "../../../components/BottomSheetBase";
import MenuItem from "./MenuItem";
import type { Category } from "@/features/product/types/Product";
import type { HomeProduct } from "@/features/outlets/services/outletProductService";
import { DynamicProductOrganizer } from "@/features/product/services/dynamicProductOrganizer";

interface CategoryBottomSheetProps {
    readonly isOpen: boolean;
    readonly onClose: () => void;
    readonly categories: Category[];
    readonly products: Record<string, HomeProduct[]>;
    readonly activeCategory: string;
    readonly onCategorySelect: (category: string) => void;
}


export default function CategoryBottomSheet({
    isOpen,
    onClose,
    categories,
    products,
    activeCategory,
    onCategorySelect
}: Readonly<CategoryBottomSheetProps>) {
    // Convert Category[] with product counts for MenuItem
    const categoryItems = categories.map(cat => {
        const categoryKey = DynamicProductOrganizer.getCategoryKey(cat.name);
        const categoryProducts = products[categoryKey] || [];

        return {
            name: cat.name,
            count: categoryProducts.length
        };
    });

    return (
        <BottomSheetBase isOpen={isOpen} onClose={onClose}>
            <MenuItem
                items={categoryItems}
                onClose={onClose}
                activeItem={activeCategory}
                onItemSelect={onCategorySelect}
            />
        </BottomSheetBase>
    );
}
