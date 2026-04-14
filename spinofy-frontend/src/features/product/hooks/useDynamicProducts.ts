import { useMemo } from 'react';
import { useOutletData } from '@/features/product/hooks/useOutletData';
import { useProductData } from '@/features/product/hooks/useProductData';
import { useProductOrganization } from '@/features/product/hooks/useProductOrganization';
import type {
    DynamicOrganizedProducts,
    UseProductsReturn,
} from '@/features/product/types/ProductQuery';

/**
 * Custom hook for fetching and organizing products dynamically
 * Delegates specific concerns to dedicated hooks and services
 *
 * @returns Object containing organized products, categories, and helper functions
 */
export const useDynamicProducts = (initialOutletSlug?: string | null): UseProductsReturn => {
    // Fetch outlet data
    const {
        outlets,
        currentOutlet,
        isLoading: outletsLoading,
        error: outletsError,
    } = useOutletData();

    // Get outlet slug from current outlet or use first outlet
    const outletSlug = useMemo(() => {
        if (initialOutletSlug) return initialOutletSlug;
        return currentOutlet?.slug || outlets[0]?.slug || null;
    }, [currentOutlet, outlets, initialOutletSlug]);

    // Fetch product data for the outlet
    const {
        categories,
        products,
        isLoading: productsLoading,
        error: productsError,
        refetch,
    } = useProductData(outletSlug);

    // Organize products by categories
    const { organizedProducts, getCategoryDisplayName, createSectionId } =
        useProductOrganization(categories, products);

    // Aggregate loading and error states
    const isLoading = outletsLoading || productsLoading;
    const error = outletsError || productsError;

    // Ensure organized products has default structure
    const products_: DynamicOrganizedProducts = useMemo(() => {
        return (
            organizedProducts || {
                recommendations: [],
            }
        );
    }, [organizedProducts]);

    return {
        products: products_,
        categories,
        outlets,
        currentOutlet,
        isLoading,
        error,
        refetch,
        getCategoryDisplayName,
        createSectionId,
    };
};
