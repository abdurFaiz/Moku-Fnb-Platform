import { useState, useEffect, lazy, Suspense, useMemo, useCallback, useDeferredValue } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { BottomNav } from '@/components/MenuBar';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingBoundary } from '@/components/LoadingBoundary';
import { UserPointsCard } from '../components/headerprofileuser/UserPointsCard';
import HomeLoadingSkeleton from '../components/HomeLoadingSkeleton';
import { useHomePage } from '@/features/storefront/hooks/useHomePage';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import { useProductDetail } from '@/features/product/hooks/useProductDetail';
import { useOutletStore } from '@/features/outlets/stores/useOutletStore';
import { useBarcodeStore } from '@/features/storefront/stores/useBarcodeStore';
import { useQueryBestSellingProduct } from '@/features/product/hooks/api/useQueryProduct';
import { useGetAllFeedbackData } from '@/features/storefront/hooks/api/useQueryFeedback';
import { useCart } from '@/features/cart/hooks/useCart';
import type { HomeProduct } from '@/features/outlets/services/outletProductService';
import type { ProductDetail } from '@/features/product/types/DetailProduct';
import { isOutletOpen, getNextOpenTime } from '@/features/outlets/utils/outletUtils';
import ButtonBackToUp from '@/components/BackToUp';
import Slideshow from '../components/HeroCarousel';
import CategoriesSection from '../components/CategoriesSection';
import { Skeleton } from '@/components';
import SearchBar from '../components/SearchBar';
import { FeedbackSection } from '../components/FeedbackSection';
import { toast } from 'sonner';
import { FeedbackBottomSheet } from '../components/FeedbackBottomSheet';

type ProductBuckets = Record<string, HomeProduct[] | undefined> & {
  recommendations?: HomeProduct[];
};

const CartSummaryBar = lazy(() =>
  import('@/features/storefront/components/CartSummaryBar').then((module) => ({
    default: module.CartSummaryBar,
  }))
);

const loadCartBottomSheet = () =>
  import('@/features/storefront/components/CartBottomSheet').then((module) => ({
    default: module.CartBottomSheet,
  }));

const CartBottomSheet = lazy(loadCartBottomSheet);

const RecommendedSection = lazy(() =>
  import('../components/RecommendedSection').then((module) => ({
    default: module.RecommendedSection,
  }))
);

const MenuSection = lazy(() => import('../components/MenuSection'));

const BottomSheetDetailProduct = lazy(() =>
  import('../components/BottomSheetAddDetailProduct').then((module) => ({
    default: module.BottomSheetDetailProduct,
  }))
);

const BottomSheetViewDetailProduct = lazy(() =>
  import('../components/BottomSheetViewDetailProduct').then((module) => ({
    default: module.BottomSheetViewDetailProduct,
  }))
);

export default function Home() {
  const [isProductDetailOpen, setIsProductDetailOpen] = useState(false);
  const [isProductAddDetailOpen, setIsProductAddDetailOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const [isFeedbackVisible, setIsFeedbackVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [_isHidden, setIsHidden] = useState(false);
  const [_toastDismissed, setToastDismissed] = useState(false);

  const { setCurrentOutlet } = useOutletStore();
  const { setBarcode, setOutletSlug } = useBarcodeStore();

  // Read and persist table number from URL params
  useEffect(() => {
    const table = searchParams.get('table');
    const outlet = searchParams.get('outlet');

    if (table) {
      setBarcode(table);
    }
    if (outlet) {
      setOutletSlug(outlet);
    }
  }, [searchParams, setBarcode, setOutletSlug]);


  useEffect(() => {
    loadCartBottomSheet(); // warm up cart sheet chunk so the first open feels instant
  }, []);

  // Get all data and handlers from main hook
  const {
    userData,
    products,
    categories,
    banners,
    currentOutlet,
    isCartBottomSheetOpen,
    isLoading,
    error,
    totalItems,
    totalPrice,
    isCartVisible,
    handleCartClick,
    handleCloseCartBottomSheet,
  } = useHomePage();

  // Fetch best-selling product for recommendations
  const { data: bestSellingData, isLoading: _isBestSellingLoading } = useQueryBestSellingProduct(
    currentOutlet?.slug,
    {
      enabled: !!currentOutlet?.slug,
    }
  );

  // Fetch feedback data to get questions for toast
  const { data: allFeedbackData } = useGetAllFeedbackData(
    currentOutlet?.slug,
    {
      enabled: !!currentOutlet?.slug,
    }
  );


  // Check if feedback is visible
  useEffect(() => {
    const feedbackSubmitted = localStorage.getItem('feedbackSubmitted');
    const toastWasDismissed = localStorage.getItem('feedbackToastDismissed');
    setIsFeedbackVisible(feedbackSubmitted !== 'true' && toastWasDismissed === 'true');
    setToastDismissed(toastWasDismissed === 'true');
  }, []);
  const handleCallFeedbackBottomSheet = useCallback(() => {
    setIsOpen(true);
  }, []);

  useEffect(() => {
    // Only show toast if feedback hasn't been submitted and we have feedback data
    const feedbackSubmitted = localStorage.getItem('feedbackSubmitted');
    const toastWasDismissed = localStorage.getItem('feedbackToastDismissed');

    if (feedbackSubmitted === 'true' || toastWasDismissed === 'true' || !allFeedbackData?.data?.feedback?.questions?.length) {
      return;
    }

    // Get the first question from feedback
    const firstQuestion = allFeedbackData.data.feedback.questions[0]?.question;

    const toastId = toast.message("Sstt, mau nanya dong... ", {
      description: firstQuestion || "Bagaimana pengalaman kamu di outlet kami?",
      duration: Infinity, // Toast stays until manually dismissed
      action: {
        label: "Spill yukk!",
        onClick: handleCallFeedbackBottomSheet,
      },
      onDismiss: () => {
        // When toast is dismissed, show the FeedbackSection
        localStorage.setItem('feedbackToastDismissed', 'true');
        setToastDismissed(true);
        setIsFeedbackVisible(true);
      },
    });

    return () => {
      if (toastId) {
        toast.dismiss(toastId);
      }
    };
  }, [allFeedbackData, handleCallFeedbackBottomSheet]);

  useEffect(() => {
    const feedbackSubmitted = localStorage.getItem('feedbackSubmitted');
    if (feedbackSubmitted === 'true') {
      setIsHidden(true);
    }
  }, []);


  const handleFeedbackSuccess = useCallback(() => {
    setIsHidden(true);
    setIsFeedbackVisible(false);
    localStorage.setItem('feedbackSubmitted', 'true');
    localStorage.setItem('feedbackToastDismissed', 'true');
  }, []);



  // Check if outlet is open; default to "open" until data arrives to avoid flashing the closed state.
  const isOutletOpenNow = currentOutlet ? isOutletOpen(currentOutlet) : true;
  const shouldApplyOutletGrayscale = currentOutlet ? !isOutletOpenNow : false;
  const nextOpenTime = currentOutlet ? getNextOpenTime(currentOutlet) : null;

  useEffect(() => {
    if (currentOutlet) {
      setCurrentOutlet(currentOutlet);
    }
  }, [currentOutlet, setCurrentOutlet]);

  // Get outlet slug and product detail
  const { product: selectedProduct, isLoading: isProductDetailLoading } = useProductDetail(
    currentOutlet?.slug,
    selectedProductId || undefined
  );

  const deferredProducts = useDeferredValue(products as ProductBuckets | undefined);
  const deferredCategories = useDeferredValue(categories);
  const deferredBanners = useDeferredValue(banners);
  const deferredUserData = useDeferredValue(userData);

  const productBuckets = useMemo<ProductBuckets>(() => {
    if (!deferredProducts) {
      return { recommendations: [] };
    }

    return {
      ...deferredProducts,
      recommendations: deferredProducts.recommendations ?? [],
    };
  }, [deferredProducts]);

  const productLookupMap = useMemo(() => {
    const lookup = new Map<string, HomeProduct>();

    Object.values(productBuckets).forEach((bucket) => {
      if (Array.isArray(bucket)) {
        bucket.forEach((item) => {
          if (item && typeof item === 'object' && 'id' in item && item.id) {
            lookup.set(item.id, item);
          }
        });
      }
    });

    return lookup;
  }, [productBuckets]);

  const normalizedCategories = useMemo(() => {
    return Array.isArray(deferredCategories) ? deferredCategories : [];
  }, [deferredCategories]);

  const normalizedBanners = useMemo(() => deferredBanners ?? [], [deferredBanners]);
  const normalizedUserData = deferredUserData ?? null;

  // Transform best-selling product to HomeProduct format
  const bestSellingProduct = useMemo<HomeProduct | null>(() => {
    if (!bestSellingData?.data?.product) return null;

    const product = bestSellingData.data.product;
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

    return {
      id: product.uuid,
      name: product.name,
      price: Number.parseInt(product.price, 10) || 0,
      description: product.description,
      image: product.image_url || `${baseUrl}/storage/${product.image}`,
      isAvailable: Boolean(product.is_available),
      isPublished: Boolean(product.is_published),
      isRecommended: true,
      categoryId: product.product_category_id,
    };
  }, [bestSellingData]);

  // Merge best-selling product with existing recommendations
  const recommendedProducts = useMemo(() => {
    const existingRecommendations = productBuckets.recommendations ?? [];

    // If we have a best-selling product and it's not already in recommendations, add it at the start
    if (bestSellingProduct) {
      const isAlreadyIncluded = existingRecommendations.some(p => p.id === bestSellingProduct.id);
      if (!isAlreadyIncluded) {
        return [bestSellingProduct, ...existingRecommendations];
      }
    }

    return existingRecommendations;
  }, [productBuckets, bestSellingProduct]);

  const productsByCategory = useMemo<Record<string, HomeProduct[]>>(() => {
    return Object.entries(productBuckets).reduce((acc, [key, value]) => {
      if (key === 'recommendations') {
        return acc;
      }

      acc[key] = Array.isArray(value) ? value : [];
      return acc;
    }, {} as Record<string, HomeProduct[]>);
  }, [productBuckets]);

  const {
    navigateToCheckout,
    navigateToRewardPoin,
    navigateToRecommend,
    navigateToHome,
  } = useOutletNavigation();

  const handleSummaryCheckout = useCallback(async () => {
    navigateToCheckout();
  }, [navigateToCheckout]);

  const fallbackProduct = useMemo<ProductDetail | HomeProduct | null>(() => {
    if (selectedProduct) {
      return selectedProduct;
    }

    if (!selectedProductId) {
      return null;
    }

    return productLookupMap.get(selectedProductId) ?? null;
  }, [productLookupMap, selectedProduct, selectedProductId]);

  // Handle product click - open view detail bottom sheet
  const handleProductClick = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setIsProductDetailOpen(true);
  }, []);

  // Handle "Tambah" button click - open add detail bottom sheet
  const handleTambahClick = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setIsProductAddDetailOpen(true);
  }, []);

  // Handle close view detail bottom sheet
  const handleCloseProductDetail = useCallback(() => {
    setIsProductDetailOpen(false);
    setSelectedProductId(null);
  }, []);

  // Handle close add detail bottom sheet
  const handleCloseAddDetail = useCallback(() => {
    setIsProductAddDetailOpen(false);
    setSelectedProductId(null);
  }, []);

  // Cart functionality
  const { items: cartItems, updateQuantity } = useCart();

  // Get cart quantity for a product
  const getCartQuantity = useCallback((productUuid: string) => {
    const quantity = cartItems
      .filter(item => item.productUuid === productUuid)
      .reduce((total, item) => total + item.quantity, 0);


    return quantity;
  }, [cartItems]);

  // Handle increment quantity
  const handleIncrement = useCallback((productUuid: string) => {
    const cartItem = cartItems.find(item => item.productUuid === productUuid);
    if (cartItem) {
      updateQuantity(cartItem.id, cartItem.quantity + 1);
    }
  }, [cartItems, updateQuantity]);

  // Handle decrement quantity
  const handleDecrement = useCallback((productUuid: string) => {
    const cartItem = cartItems.find(item => item.productUuid === productUuid);
    if (cartItem) {
      updateQuantity(cartItem.id, Math.max(0, cartItem.quantity - 1));
    }
  }, [cartItems, updateQuantity]);

  if (isLoading) {
    return (
      <ScreenWrapper>
        <LoadingBoundary
          isLoading={true}
          loadingComponent={<HomeLoadingSkeleton />}
          message="Loading home page..."
        >
          <div />
        </LoadingBoundary>
      </ScreenWrapper>
    );
  }
  if (error) {
    return (
      <ScreenWrapper>
        <ErrorBoundary
          error={error}
          containerClassName="flex items-center justify-center h-screen"
        />
        <BottomNav />
      </ScreenWrapper>
    );
  }

  /**
   * Render main home content
   */
  return (
    <ScreenWrapper className='min-h-screen'>
      <div className="relative">
        {shouldApplyOutletGrayscale && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 bg-white/70 backdrop-blur-[1px] mix-blend-luminosity"
          />
        )}
        <div className="relative z-0">
          {/* Hero Carousel Section */}
          <Slideshow
            banners={normalizedBanners}
            outlet={currentOutlet}
            isOpen={isOutletOpenNow}
            nextOpenTime={nextOpenTime}
          />
          <SearchBar className=" -mt-7 " />
          {/* User Points Card Section */}
          <UserPointsCard
            name={normalizedUserData?.name || "Guest"}
            vouchers={normalizedUserData?.vouchers || 0}
            points={normalizedUserData?.points || 0}
            onClickRedeem={navigateToRewardPoin}
          />
          <div className="py-4">
            <FeedbackSection visible={isFeedbackVisible} onHide={() => setIsFeedbackVisible(false)} />
          </div>

          {/* Main Content Container */}
          <div className="flex flex-col gap-4">
            <Suspense fallback={null}>
              <RecommendedSection
                products={recommendedProducts}
                onProductClick={handleProductClick}
                onTambahClick={handleTambahClick}
                onIncrement={handleIncrement}
                onDecrement={handleDecrement}
                getCartQuantity={getCartQuantity}
                onViewAll={navigateToRecommend}
                cardGap={3}
                maxPaginationDots={3}
                cardWidth='w-[290px]'

              />
            </Suspense>
            {/* Categories and Menu Section */}
            <div className="flex flex-col gap-4 mb-44">
              {/* Menu Section */}
              <Suspense fallback={null}>
                <MenuSection categories={normalizedCategories} products={productsByCategory} />
              </Suspense>

              <Suspense fallback={
                <Skeleton className="w-full h-56 rounded-2xl" />
              }>
                <CategoriesSection
                  categories={normalizedCategories}
                  products={productsByCategory}
                  onProductClick={handleProductClick}
                  onTambahClick={handleTambahClick}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  getCartQuantity={getCartQuantity}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Summary Bar */}
      <ButtonBackToUp />
      <div className="flex flex-col gap-4">
        <Suspense fallback={null}>
          <CartSummaryBar
            itemCount={totalItems}
            total={`Rp ${totalPrice.toLocaleString("id-ID")}`}
            onCheckout={() => {
              void handleSummaryCheckout();
            }}
            onCartClick={handleCartClick}
            isVisible={isCartVisible}
          />
        </Suspense>
      </div>

      {/* Cart Bottom Sheet */}
      {isCartBottomSheetOpen && (
        <Suspense fallback={null}>
          <CartBottomSheet
            isOpen={isCartBottomSheetOpen}
            onClose={handleCloseCartBottomSheet}
          />
        </Suspense>
      )}
      {isProductDetailOpen && (
        <Suspense fallback={null}>
          <BottomSheetViewDetailProduct
            isOpen={isProductDetailOpen}
            onClose={handleCloseProductDetail}
            product={selectedProduct}
            fallbackProduct={fallbackProduct}
            isLoading={isProductDetailLoading}
            outletIsOpen={isOutletOpenNow}
            onOpenAddDetail={() => {
              handleCloseProductDetail();
              handleTambahClick(selectedProductId || "");
            }}
          />
        </Suspense>
      )}
      {isProductAddDetailOpen && (
        <Suspense fallback={null}>
          <BottomSheetDetailProduct
            isOpen={isProductAddDetailOpen}
            onClose={handleCloseAddDetail}
            product={selectedProduct}
            fallbackProduct={fallbackProduct}
            isLoading={isProductDetailLoading}
            outletSlug={currentOutlet?.slug}
            onNavigateToCheckout={navigateToCheckout}
            onNavigateToHome={navigateToHome}
            outletIsOpen={isOutletOpenNow}
          />
        </Suspense>
      )}
      <FeedbackBottomSheet
        open={isOpen}
        onOpenChange={setIsOpen}
        onSuccess={handleFeedbackSuccess}
      />
      {/* Bottom Navigation */}
      <BottomNav />
    </ScreenWrapper>
  );
}