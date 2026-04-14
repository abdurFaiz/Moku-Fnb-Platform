import type { ProductDetail } from '@/features/product/types/DetailProduct';
import { useOutlets } from '@/features/outlets/hooks/api/useQueryOutlet';
import { useQueryProductDetail } from '@/features/product/hooks/api/useQueryProduct';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';

export const useProductDetail = (
    outletSlug: string | null | undefined,
    productIdentifier: string | null | undefined
) => {
    // Fetch product details
    const {
        data: productResponse,
        isLoading,
        error,
        refetch,
    } = useQueryProductDetail(outletSlug ?? null, productIdentifier ?? null, {
        staleTime: 5 * 60 * 1000,
    });

    const product: ProductDetail | undefined = productResponse?.data?.product;

    return {
        product,
        isLoading,
        error,
        refetch,
    };
};

/**
 * Custom hook for fetching outlet information
 * Used to get the first outlet slug for product fetching
 */
export const useOutletList = () => {
    const routeSlug = useOutletSlug();
    const persistedSlug = useOutletStore((state) => state.outletSlug);
    const {
        data: outlets,
        isLoading,
        error,
    } = useOutlets({
        staleTime: 10 * 60 * 1000, // 10 minutes
    });

    const resolvedSlug = routeSlug ?? persistedSlug ?? outlets?.[0]?.slug;
    const selectedOutlet = resolvedSlug
        ? outlets?.find((outlet) => outlet.slug === resolvedSlug)
        : outlets?.[0];
    const outletSlug = selectedOutlet?.slug;

    return {
        outletSlug,
        selectedOutlet,
        isLoading,
        error,
    };
};
