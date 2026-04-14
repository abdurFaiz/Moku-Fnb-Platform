import { useState } from "react";
import { useScrollToTop } from "@/hooks/shared/useScrollToTop";
import { ScreenWrapper } from "@/components/layout/ScreenWrapper";
import AttributeSelector from "../components/AttributeSelector";
import NotesInput from "../components/NotesInput";
import {
  AddToCartButton,
  QuantitySelector,
} from "../components/ActionBottomBar";
import { HeroImage } from "../components/HeroImage";
import { ProductInfo } from "../components/ProductInfo";
import { useSearchParams, useLocation } from "react-router-dom";
import { useCart } from "@/features/cart/hooks/useCart";
import type { CartItem } from "@/features/cart/types/Cart";
import { SkeletonDetailItemPage } from "@/components/skeletons/SkeletonComponents";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { getImageUrl } from "@/utils/imageFormatters";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// New refactored hooks and services
import { useOutletList, useProductDetail } from "@/features/product/hooks/useProductDetail";
import { usePriceCalculator } from "@/features/product/hooks/usePriceCalculator";
import { useProductMutations } from "@/features/product/hooks/useProductMutations";
import { useAttributeSelections } from "@/features/product/hooks/useAttributeSelections";
import { DetailItemModeHandler } from "@/features/product/services/DetailItemModeHandler";
import type { EditModeData } from "@/features/product/services/DetailItemModeHandler";

export default function DetailItem() {
  const { navigateToHome, navigateToCheckout } = useOutletNavigation();
  const location = useLocation();
  const { addItem, updateItem, items } = useCart();
  const [searchParams] = useSearchParams();

  // Get edit data from location state
  const editData = location.state as EditModeData | null;

  // Check if coming from reward claim
  const fromRewardClaim = (location.state as any)?.fromRewardClaim || false;

  // State management
  const [quantity, setQuantity] = useState(editData?.quantity || 1);
  const [notes, setNotes] = useState(editData?.note || "");

  const productIdParam = searchParams.get('id');
  const productUuidParam = searchParams.get('uuid');
  const productIdentifier = productUuidParam || productIdParam;

  // Custom hooks for data fetching and mutations
  const { outletSlug, isLoading: outletsLoading } = useOutletList();
  const { product, isLoading: productLoading, error: productError } = useProductDetail(
    outletSlug,
    productIdentifier
  );

  // Price calculation hook
  const { calculateTotalPrice, getBasePrice } = usePriceCalculator();

  // Product mutations hook with callbacks
  const { updateProductMutation, storeProductMutation } = useProductMutations({
    onUpdateSuccess: () => navigateToCheckout(),
    onUpdateError: (error) => alert(`Failed to update product: ${error.message}`),
    onStoreSuccess: () => navigateToHome(),
    onStoreError: (error) => alert(`Failed to add product: ${error.message}`),
  });

  // Attribute selection hook
  const { selections, toggleSelection } = useAttributeSelections(
    product?.attributes || [],
    editData
  );

  // Scroll to top when product details load
  useScrollToTop([productLoading, product]);

  const isLoading = outletsLoading || productLoading;

  if (isLoading) {
    return <SkeletonDetailItemPage />;
  }

  if (productError || !product) {
    return (
      <ScreenWrapper>
        <ErrorBoundary
          error={productError?.message || "Error loading product details. Please try again."}
          isError={!!(productError || !product)}
          containerClassName="flex items-center justify-center h-screen"
          action={{
            label: "Go Back",
            onClick: navigateToHome,
          }}
        />
      </ScreenWrapper>
    );
  }

  // Calculate prices
  const basePrice = getBasePrice(product);
  const totalPrice = calculateTotalPrice(product, selections, quantity);


  const applyLocalCartUpdate = (nextCartItem: Omit<CartItem, "id">) => {
    const targetCartItemId =
      editData?.cartItemId ||
      items.find((cartItem) => cartItem.orderProductId === nextCartItem.orderProductId)?.id;

    if (targetCartItemId) {
      updateItem(targetCartItemId, nextCartItem);
    } else {
      addItem(nextCartItem);
    }
  };

  const executeMutationOperation = (result: ReturnType<typeof DetailItemModeHandler.handleModeOperation>) => {
    // Handle update operation (edit mode - order product or cart item with orderProductId)
    const orderProductId =
      editData?.orderProductId ||
      (editData?.cartItemId && items.find((i) => i.id === editData.cartItemId)?.orderProductId);

    if (result.type === 'update' && result.cartItem) {
      applyLocalCartUpdate(result.cartItem);
    }

    if (result.type === 'update' && result.payload && orderProductId && outletSlug) {
      updateProductMutation.mutate({
        outletSlug,
        orderProductId: orderProductId,
        payload: result.payload,
      });
      return;
    }

    // Handle store operation with backend sync
    if (result.type === 'store' && result.payload && outletSlug) {
      if (result.cartItem) {
        addItem(result.cartItem);
      }
      storeProductMutation.mutate({
        outletSlug,
        payload: result.payload,
      });
      return;
    }

    // Handle store operation without backend (no outlet)
    if (result.type === 'store' && result.cartItem && !outletSlug) {
      addItem(result.cartItem);
      if (result.shouldNavigateToHome) navigateToHome();
      return;
    }

    // Handle add-to-cart operation (local cart only)
    if (result.type === 'add-to-cart' && result.cartItem) {
      const cartItemId = editData?.cartItemId;
      if (cartItemId) {
        updateItem(cartItemId, result.cartItem);
      } else {
        addItem(result.cartItem);
      }
      if (result.shouldNavigateToCheckout) navigateToCheckout();
    }
  };

  const handleAddToCart = () => {
    const result = DetailItemModeHandler.handleModeOperation(
      product,
      selections,
      quantity,
      notes,
      editData,
      items,
      outletSlug || null
    );

    executeMutationOperation(result);

    // Check if we should go directly to checkout after adding (from reward claim)
    const shouldDirectCheckout = localStorage.getItem('directCheckoutAfterAdd') === 'true';
    if (shouldDirectCheckout && fromRewardClaim) {
      // Clear the flag
      localStorage.removeItem('directCheckoutAfterAdd');
      // Navigate to checkout after a short delay to ensure cart is updated
      setTimeout(() => {
        navigateToCheckout();
      }, 300);
    }
  };

  const isMutationPending = updateProductMutation.isPending || storeProductMutation.isPending;

  return (
    <ScreenWrapper>
      <HeroImage
        imgSrc={getImageUrl(product.image_url)}
        onBack={navigateToHome}
      />
      <div className="flex flex-col gap-9 px-4 py-6 mb-24">
        <ProductInfo
          title={product.name}
          description={product.description}
          price={basePrice}
        />

        {/* Render dynamic attribute selectors */}
        {product.attributes?.map((attribute) => (
          <AttributeSelector
            key={attribute.id}
            attribute={attribute}
            selected={selections.get(attribute.id) || new Set()}
            toggle={(_, _current, value) =>
              toggleSelection(attribute.id, value, attribute.display_type === 1)
            }
          />
        ))}

        <NotesInput value={notes} onChange={setNotes} />
      </div>

      <div className="max-w-[440px] mx-auto fixed bottom-0 left-0 right-0 rounded-t-3xl bg-white px-4 py-6 shadow-body-grey/20 inset-x-1 inset-shadow-body-grey flex justify-between items-center gap-4 shadow-[0_-4px_8px_0_rgba(128,128,128,0.20)]">
        <QuantitySelector
          quantity={quantity}
          onIncrease={() => setQuantity((prev) => prev + 1)}
          onDecrease={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
        />
        <AddToCartButton
          totalPrice={totalPrice}
          onAddToCart={handleAddToCart}
          buttonText={editData?.editMode || editData?.cartEditMode ? "Simpan Perubahan" : "Tambah"}
          isLoading={isMutationPending}
        />
      </div>
    </ScreenWrapper>
  );
}
