const attributeNameMapper: Record<number, string> = {
    // Add your attribute ID mappings here
    // Example:
    // 1: "Size",
    // 2: "Temperature",
    // 3: "Sugar Level",
    // 4: "Ice Level",
};

/**
 * Formats a variant display name by combining the attribute name with the value name.
 * If the attribute ID is not mapped, returns just the value name.
 * 
 * @param attributeId - The product_attribute_id from the variant
 * @param valueName - The name of the attribute value
 * @returns Formatted display name (e.g., "Size: Large" or just "Large" if unmapped)
 */
export function formatVariantDisplayName(attributeId: number | undefined, valueName: string): string {
    if (!attributeId || !attributeNameMapper[attributeId]) {
        return valueName;
    }

    const attributeName = attributeNameMapper[attributeId];
    return `${attributeName}: ${valueName}`;
}
