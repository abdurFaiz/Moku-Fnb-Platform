import { useMemo, useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Banner } from '@/features/storefront/types/Banner';
import { useDynamicProducts } from '@/features/product/hooks/useDynamicProducts';
import { useUserDataFetch } from '@/features/storefront/hooks/useUserData';
import { useRewardPoints } from '@/features/storefront/hooks/useRewardPoints';
import type { UserData } from '@/features/profile/types/User';
import { getErrorMessage } from '@/features/storefront/utils/errorHandler';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';
import { useQueryBanner } from '@/features/storefront/hooks/api/useQueryBanner';
import { outletQueryKeys } from '@/features/outlets/hooks/api/useQueryOutlet';


export interface HomeDataReturn {
  userData: UserData | null;
  products: any;
  categories: any;
  outlets: any;
  currentOutlet: any;
  banners: Banner[] | undefined;
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  error: string | null;
  isFetching: boolean;
  refreshData: () => Promise<void>;
  invalidateHomeData: () => Promise<void>;
}

export const useHomeData = (): HomeDataReturn => {
  const queryClient = useQueryClient();

  const urlOutletSlug = useOutletSlug();

  // Defer non-essential queries until after the first paint
  const [shouldFetchExtras, setShouldFetchExtras] = useState(false);

  useEffect(() => {
    setShouldFetchExtras(true);
  }, []);

  // Get products data (outlets, categories, products)
  const {
    products,
    categories,
    outlets,
    currentOutlet,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useDynamicProducts(urlOutletSlug);

  // Get outlet slug untuk reward API
  const outletSlug = useMemo(() => urlOutletSlug || currentOutlet?.slug, [urlOutletSlug, currentOutlet?.slug]);

  // Get reward points data (in parallel with products)
  const {
    data: rewardPoints,
    isLoading: _isLoadingRewards,
    isError: isRewardsError,
    error: rewardsError,
    isFetching: isFetchingRewards,
    refetch: refetchRewards,
  } = useRewardPoints(outletSlug, shouldFetchExtras);

  // Get user data dengan reward points
  const {
    user: userData,
    isLoading: isLoadingUser,
    isPending: isUserPending,
    isError: isUserError,
    error: userError,
  } = useUserDataFetch(
    shouldFetchExtras ? rewardPoints?.vouchersCount : undefined,
    shouldFetchExtras ? rewardPoints?.pointsBalance : undefined
  );

  // Get banners data (in parallel)
  const {
    data: banners,
    isLoading: isLoadingBanners,
    isError: isBannersError,
    error: bannersError,
    refetch: refetchBanners,
  } = useQueryBanner(outletSlug, {
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Memoized loading states (combine all loaders)
  const hasRewardError = shouldFetchExtras && isRewardsError;

  const loadingStates = useMemo(() => ({
    isLoading: isLoadingUser || isLoadingProducts || isLoadingBanners,
    isPending: isUserPending || isLoadingProducts || isLoadingBanners,
    isFetching: shouldFetchExtras ? isFetchingRewards : false,
    isError: isUserError || !!productsError || hasRewardError || isBannersError,
  }), [
    hasRewardError,
    isBannersError,
    isFetchingRewards,
    isLoadingBanners,
    isLoadingProducts,
    isLoadingUser,
    isUserError,
    isUserPending,
    productsError,
    shouldFetchExtras,
  ]);


  const error = useMemo((): string | null => {
    if (userError) return userError;
    if (productsError) return getErrorMessage(productsError);
    if (hasRewardError && rewardsError) return rewardsError;
    if (isBannersError && bannersError) return getErrorMessage(bannersError);
    return null;
  }, [userError, productsError, hasRewardError, rewardsError, isBannersError, bannersError]);

  /**
   * Combined refetch function untuk refresh semua data
   * Executes in parallel for better performance
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      refetchProducts(),
      refetchBanners(),
      shouldFetchExtras ? refetchRewards() : Promise.resolve(),
    ]);
  }, [refetchProducts, refetchBanners, refetchRewards, shouldFetchExtras]);

  /**
   * Manual invalidation for forced refetch
   */
  const invalidateHomeData = useCallback(async () => {
    // Invalidate all relevant queries
    await queryClient.invalidateQueries({ queryKey: ['dynamic-products'] });
    await queryClient.invalidateQueries({ queryKey: outletQueryKeys.list() });
  }, [queryClient]);

  return {
    userData,
    products,
    categories,
    outlets,
    currentOutlet,
    banners,
    isLoading: loadingStates.isLoading,
    isPending: loadingStates.isPending,
    isError: loadingStates.isError,
    error,
    isFetching: loadingStates.isFetching,
    refreshData,
    invalidateHomeData,
  };
};

export default useHomeData;
