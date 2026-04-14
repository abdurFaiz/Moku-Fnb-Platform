import { useEffect, useMemo } from 'react';
import { productOrganizationService } from '@/features/product/services/ProductOrganizationService';
import { ProductLookupService } from '@/features/product/services/productLookupService';
import type {
    DynamicOrganizedProducts,
    ExtractedProductData,
} from '../types/ProductQuery';
import type { Category } from '@/features/product/types/Product';

/**
 * Hook return type
 */
interface UseProductOrganizationReturn {
    organizedProducts: DynamicOrganizedProducts;
    getCategoryDisplayName: (categoryKey: string) => string;
    createSectionId: (category: string) => string;
}

/**
 * Custom hook for organizing products and managing lookup service
 * Handles product organization and ProductLookupService updates
 *
 * @param categories - Available product categories
 * @param products - Products to organize
 * @returns Object containing organized products and helper functions
 */
export const useProductOrganization = (
    categories: Category[],
    products: any[]
): UseProductOrganizationReturn => {
    // Organize products - memoized to prevent unnecessary reorganization
    const organizedProducts = useMemo(() => {
        const data: ExtractedProductData = {
            categories,
            products,
        };

        return productOrganizationService.organizeProducts(data);
    }, [categories, products]);

    // Update ProductLookupService when organized products change
    // Using memoization to avoid unnecessary updates
    useEffect(() => {
        if (
            organizedProducts &&
            categories.length > 0 &&
            productOrganizationService.isValidOrganizedProducts(organizedProducts)
        ) {
            const lookupFormat = productOrganizationService.createLookupFormat(
                organizedProducts,
                categories
            );
            ProductLookupService.setProducts(lookupFormat);
        }
    }, [organizedProducts, categories]);

    // Memoized helper functions to prevent unnecessary re-renders
    const getCategoryDisplayName = useMemo(
        () => (categoryKey: string) =>
            productOrganizationService.getCategoryDisplayName(categoryKey, categories),
        [categories]
    );

    const createSectionId = useMemo(
        () => (category: string) => productOrganizationService.createSectionId(category),
        []
    );

    return {
        organizedProducts,
        getCategoryDisplayName,
        createSectionId,
    };
};
