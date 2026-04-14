import type { ProductAttribute } from '@/features/product/types/DetailProduct';

export class ProductAttributeService {
    /**
     * Initialize attribute selections with default first values
     * @param attributes Product attributes to initialize
     * @returns Map of attribute ID to selected value keys
     */
    static initializeDefaultSelections(
        attributes: ProductAttribute[]
    ): Map<number, Set<string>> {
        const initialSelections = new Map<number, Set<string>>();

        for (const attr of attributes) {
            const defaults = attr.values
                .filter((value) => value.is_default === 1)
                .map((value) => `${attr.id}-${value.id}`);

            initialSelections.set(attr.id, new Set(defaults));
        }

        return initialSelections;
    }

    /**
     * Initialize selections from existing variant IDs (for edit mode)
     * @param attributes Product attributes
     * @param variantIds Selected variant IDs from existing data
     * @returns Map of attribute ID to selected value keys
     */
    static initializeFromVariants(
        attributes: ProductAttribute[],
        variantIds: number[] | undefined
    ): Map<number, Set<string>> {
        if (!variantIds || variantIds.length === 0) {
            return this.initializeDefaultSelections(attributes);
        }

        const initialSelections = new Map<number, Set<string>>();

        for (const attr of attributes) {
            const selectedValues = new Set<string>();

            for (const variantId of variantIds) {
                const value = attr.values.find(v => v.id === variantId);
                if (value) {
                    const valueKey = `${attr.id}-${value.id}`;
                    selectedValues.add(valueKey);
                }
            }

            if (selectedValues.size > 0) {
                initialSelections.set(attr.id, selectedValues);
            }
        }

        return initialSelections;
    }

    /**
     * Toggle attribute selection with support for radio (single) and checkbox (multiple)
     * @param currentSelections Current selections map
     * @param attributeId ID of attribute to toggle
     * @param valueKey Value key to toggle
     * @param isRadio True for radio (single select), false for checkbox (multi select)
     * @returns Updated selections map
     */
    static toggleSelection(
        currentSelections: Map<number, Set<string>>,
        attributeId: number,
        valueKey: string,
        isRadio: boolean
    ): Map<number, Set<string>> {
        const newSelections = new Map(currentSelections);
        const currentSet = newSelections.get(attributeId) || new Set<string>();

        if (isRadio) {
            // For radio (single select), replace with new selection
            newSelections.set(attributeId, new Set([valueKey]));
        } else {
            // For checkbox (multi select), toggle
            const newSet = new Set(currentSet);
            if (newSet.has(valueKey)) {
                newSet.delete(valueKey);
            } else {
                newSet.add(valueKey);
            }
            newSelections.set(attributeId, newSet);
        }

        return newSelections;
    }

    /**
     * Extract variant IDs from current selections
     * @param attributes Product attributes
     * @param selections Current selections map
     * @returns Array of selected variant IDs
     */
    static extractVariantIds(
        attributes: ProductAttribute[],
        selections: Map<number, Set<string>>
    ): number[] {
        const variantIds: number[] = [];

        for (const attr of attributes) {
            const selectedSet = selections.get(attr.id);
            if (selectedSet) {
                for (const valueKey of selectedSet) {
                    const valueId = Number.parseInt(valueKey.split('-')[1]);
                    variantIds.push(valueId);
                }
            }
        }

        return variantIds;
    }

    /**
     * Extract attribute display data for UI and storage
     * @param attributes Product attributes
     * @param selections Current selections map
     * @returns Array of formatted attribute strings (e.g., "Size: Large")
     */
    static extractAttributeData(
        attributes: ProductAttribute[],
        selections: Map<number, Set<string>>
    ): string[] {
        const attributeData: string[] = [];

        for (const attr of attributes) {
            const selectedSet = selections.get(attr.id);
            if (selectedSet) {
                for (const valueKey of selectedSet) {
                    const valueId = Number.parseInt(valueKey.split('-')[1]);
                    const value = attr.values.find(v => v.id === valueId);
                    if (value) {
                        attributeData.push(`${attr.name}: ${value.name}`);
                    }
                }
            }
        }

        return attributeData;
    }

    /**
     * Calculate extra price from selected attribute values
     * @param attributes Product attributes
     * @param selections Current selections map
     * @returns Total extra price from all selections
     */
    static calculateExtraPrice(
        attributes: ProductAttribute[],
        selections: Map<number, Set<string>>
    ): number {
        let extraPrice = 0;

        for (const attr of attributes) {
            const selectedSet = selections.get(attr.id);
            if (selectedSet) {
                for (const valueKey of selectedSet) {
                    const valueId = Number.parseInt(valueKey.split('-')[1]);
                    const value = attr.values.find(v => v.id === valueId);
                    if (value) {
                        extraPrice += value.extra_price;
                    }
                }
            }
        }

        return extraPrice;
    }
}

export const productAttributeService = new ProductAttributeService();
