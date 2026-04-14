/**
 * Format order product variants into display strings
 * @param orderProductVariants - Array of order product variants from API
 * @returns Array of formatted variant strings (e.g., ["Size: Large", "Temperature: Hot"])
 */
export function formatOrderProductVariants(orderProductVariants: any[]): string[] {
    if (!Array.isArray(orderProductVariants)) {
        return [];
    }

    return orderProductVariants
        .map((variant: any) => {
            const pav = variant.product_attribute_value;
            if (!pav?.name) return null;

            const attributeName = pav.product_attribute?.name || '';
            const attributeValue = pav.name;

            // Format as "Attribute: Value" (e.g., "Size: Large")
            if (attributeName) {
                return `${attributeName}: ${attributeValue}`;
            }

            // Fallback to just the value name if no attribute name
            return attributeValue;
        })
        .filter(Boolean); // Remove null/undefined values
}
/**
 * Get contextual variant name for better display
 * @param attributeName - Name of the attribute (e.g., "Size", "Temperature")
 * @param valueName - Value of the attribute (e.g., "Large", "Hot")
 * @returns Contextual name for the variant
 */
export function getContextualVariantName(attributeName: string, valueName: string): string {
    // If we have both attribute name and value, format as "Attribute: Value"
    if (attributeName && valueName) {
        return `${attributeName}: ${valueName}`;
    }

    // Fallback to just the value if no attribute name
    return valueName || '';
}

/**
 * Extract variant IDs from order product variants
 * @param orderProductVariants - Array of order product variants from API
 * @returns Array of variant IDs
 */
export function extractVariantIds(orderProductVariants: any[]): number[] {
    if (!Array.isArray(orderProductVariants)) {
        return [];
    }

    return orderProductVariants
        .map((variant: any) => variant.product_attribute_value_id)
        .filter((id: any) => typeof id === 'number');
}