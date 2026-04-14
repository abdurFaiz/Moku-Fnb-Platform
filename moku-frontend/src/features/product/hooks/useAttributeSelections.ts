import { useState, useEffect } from 'react';
import type { ProductAttribute } from '@/features/product/types/DetailProduct';
import { ProductAttributeService } from '@/features/product/services/ProductAttributeService';
import type { EditModeData } from '@/features/product/services/DetailItemModeHandler';

export const useAttributeSelections = (
    attributes: ProductAttribute[],
    editData: EditModeData | null
) => {
    const [selections, setSelections] = useState<Map<number, Set<string>>>(new Map());

    // Initialize selections when product attributes load
    useEffect(() => {
        if (attributes.length > 0) {
            // If in edit mode with existing variantIds, use those
            if ((editData?.editMode || editData?.cartEditMode) && editData?.variantIds) {
                setSelections(ProductAttributeService.initializeFromVariants(attributes, editData.variantIds));
            } else {
                // Default: Set first value for each attribute
                setSelections(ProductAttributeService.initializeDefaultSelections(attributes));
            }
        }
    }, [attributes.length, editData?.variantIds, editData?.editMode, editData?.cartEditMode]);

    /**
     * Toggle an attribute selection
     */
    const toggleSelection = (attributeId: number, valueKey: string, isRadio: boolean) => {
        setSelections(prev =>
            ProductAttributeService.toggleSelection(prev, attributeId, valueKey, isRadio)
        );
    };

    return {
        selections,
        toggleSelection,
    };
};
