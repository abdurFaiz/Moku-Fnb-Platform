import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useOutlets } from '@/features/outlets/hooks/api/useQueryOutlet';
import { paymentQueryOptions } from '@/features/payment/hooks/api/useQueryPayment';
import { productRecommendationsQueryOptions } from '@/features/product/hooks/api/useQueryProduct';
import { useCart } from '@/features/cart/hooks/useCart';
import type { Order, OrderResponse, PaymentMethod } from '@/features/cart/types/Order';
import type { Outlet } from '@/features/outlets/types/Outlet';
import type { ProductRecommendation } from '@/features/product/types/DetailProduct';
import type { SpecialOffer } from '@/features/checkout/types/SpecialOffer';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';


export interface CheckoutPageData {
    outlet: Outlet | undefined;
    outletName: string;
    taxRate: number;
    specialOffers: SpecialOffer[];
    currentOrder: Order | undefined;
    orderCode: string | undefined;
    paymentData: OrderResponse | undefined;
    paymentMethods: PaymentMethod[];
    isLoading: boolean;
    isError: boolean;
    isFetching: boolean;
    refetchPaymentData: () => Promise<void>;
    invalidateCheckoutData: () => Promise<void>;
}

// Query key factory following TanStack Query best practices
export const checkoutQueryKeys = {
    all: ['checkout'] as const,
    combined: (outletSlug: string | undefined) => [...checkoutQueryKeys.all, 'combined', outletSlug] as const,
} as const;

/**
 * Custom hook for managing Checkout page data
 * Handles all data fetching and transformations (Outlets, Products, Orders)
 * @returns CheckoutPageData with all necessary data and loaders
 */
export const useCheckoutPageData = (): CheckoutPageData => {
    const queryClient = useQueryClient();
    const routeSlug = useOutletSlug();
    const persistedSlug = useOutletStore((state) => state.outletSlug);
    const { items } = useCart();

    // Fetch outlet information with caching (rarely changes)
    const {
        data: outlets,
        isLoading: outletsLoading,
        isError: outletsError,
    } = useOutlets({
        staleTime: 30 * 60 * 1000, // 30 minutes - outlets rarely change
        gcTime: 60 * 60 * 1000,    // 1 hour cache
        retry: 1,
    });

    const resolvedSlug = routeSlug ?? persistedSlug ?? outlets?.[0]?.slug;
    const outlet = useMemo(
        () => {
            if (!outlets || outlets.length === 0) {
                return undefined;
            }

            if (!resolvedSlug) {
                return outlets[0] as Outlet;
            }

            return (
                outlets.find((candidate) => candidate.slug === resolvedSlug) || (outlets[0] as Outlet)
            );
        },
        [outlets, resolvedSlug]
    );
    const outletName = useMemo(() => outlet?.name || 'Cafe', [outlet?.name]);
    const taxRate = useMemo(() => calculateTaxRate(outlet?.fee_tax), [outlet?.fee_tax]);

    // Get product UUIDs from cart items for recommendations
    const productUuids = useMemo(() => {
        return items
            .map(item => item.productUuid)
            .filter((uuid): uuid is string => !!uuid);
    }, [items]);

    // Fetch recommendations and payment data in PARALLEL (key optimization)
    const {
        data: combinedData,
        isLoading: isLoadingCombined,
        isError: combinedError,
        isFetching: isFetchingCombined,
        refetch: refetchCombined,
    } = useQuery({
        queryKey: checkoutQueryKeys.combined(outlet?.slug),
        queryFn: async () => {
            if (!outlet?.slug) throw new Error('No outlet available');

            // Execute both requests in PARALLEL with Promise.all
            // This is the key optimization - both start at same time
            const [recommendationsResponse, paymentResponse] = await Promise.all([
                productUuids.length > 0
                    ? queryClient.ensureQueryData(productRecommendationsQueryOptions(outlet.slug, productUuids))
                    : Promise.resolve(null),
                queryClient.ensureQueryData(paymentQueryOptions(outlet.slug)),
            ]);

            return {
                recommendations: recommendationsResponse,
                payment: paymentResponse,
            };
        },
        enabled: !!outlet?.slug,
        staleTime: 20 * 1000,
        gcTime: 5 * 60 * 1000,     // Keep in cache for 5 minutes
        refetchOnMount: 'always',   // Always refresh when page reopens (e.g., after adding product)
        refetchOnWindowFocus: false, // Don't aggressively refetch on focus
        retry: 2,
    });

    // Memoized data extraction and transformation
    const transformedData = useMemo(() => {
        const recommendationsResponse = combinedData?.recommendations;
        const paymentData = combinedData?.payment;

        const specialOffers = transformRecommendationsToSpecialOffers(
            recommendationsResponse?.data?.recommendations,
            outlet
        );

        const currentOrder = paymentData?.data?.order?.[0] as unknown as Order | undefined;
        const orderCode = currentOrder?.code;
        const paymentMethods = paymentData?.data?.payment_methods ?? [];

        return {
            specialOffers,
            currentOrder,
            orderCode,
            paymentData,
            paymentMethods,
        };
    }, [combinedData?.recommendations, combinedData?.payment, outlet]);

    const isLoading = outletsLoading || isLoadingCombined;
    const isError = outletsError || combinedError;
    const isFetching = isFetchingCombined;

    // Optimized refetch with proper callback
    const refetchPaymentData = useCallback(async () => {
        await refetchCombined();
    }, [refetchCombined]);

    // Manual invalidation for forced refetch
    const invalidateCheckoutData = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: checkoutQueryKeys.combined(outlet?.slug) });
    }, [queryClient, outlet?.slug]);

    return {
        outlet,
        outletName,
        taxRate,
        specialOffers: transformedData.specialOffers,
        currentOrder: transformedData.currentOrder,
        orderCode: transformedData.orderCode,
        paymentData: transformedData.paymentData,
        paymentMethods: transformedData.paymentMethods,
        isLoading,
        isError,
        isFetching,
        refetchPaymentData,
        invalidateCheckoutData,
    };
};

/**

 * @param feeTax - Tax fee from outlet
 * @returns Tax rate as decimal (e.g., 0.1 for 10%)
 */
function calculateTaxRate(feeTax: number | undefined): number {
    if (!feeTax || feeTax === 0) return 0;

    // If tax is already in percentage format (> 1), convert to decimal
    // e.g., 10 -> 0.1
    if (feeTax > 1) {
        return feeTax / 100;
    }

    // Already in decimal format
    return feeTax;
}

/**
 * Transform recommended products to special offers
 * @param recommendations - Array of ProductRecommendation from recommendations API
 * @param outlet - Current outlet for image URL construction
 * @returns Array of special offers
 */
function transformRecommendationsToSpecialOffers(
    recommendations?: ProductRecommendation[],
    _outlet?: Outlet
): SpecialOffer[] {
    if (!recommendations || !Array.isArray(recommendations)) {
        return [];
    }

    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

    return recommendations.map((product: ProductRecommendation): SpecialOffer => ({
        id: product.uuid,
        name: product.name,
        description: product.description,
        price: Number.parseInt(product.price, 10) || 0,
        image: product.image_url || `${baseUrl}/storage/${product.image}`,
    }));
}

export default useCheckoutPageData;
