import { useState, useEffect } from "react";
import { BottomSheetBase } from "@/components"
import AttributeSelector from "../../product/components/AttributeSelector";
import NotesInput from "../../product/components/NotesInput";
import {
    AddToCartButton,
    QuantitySelector,
} from "../../product/components/ActionBottomBar";
import { ProductInfo } from "../../product/components/ProductInfo";
import { useCart } from "@/features/cart/hooks/useCart";
import { usePriceCalculator } from "@/features/product/hooks/usePriceCalculator";
import { useAttributeSelections } from "@/features/product/hooks/useAttributeSelections";
import { useOutletList } from "@/features/product/hooks/useProductDetail";
import { usePointsCalculation } from "@/hooks/shared/usePointsCalculation";
import { DetailItemModeHandler } from "@/features/product/services/DetailItemModeHandler";
import type { EditModeData } from "@/features/product/services/DetailItemModeHandler";
import type { ProductDetail } from "@/features/product/types/DetailProduct";
import { toast } from "sonner";
import { PointsBadge } from "@/components/PointsBadge";
import type { HomeProduct } from "@/features/outlets/services/outletProductService";
import { getFallbackDescription, getFallbackName, getFallbackPrice } from "@/features/storefront/utils/productFallback";

interface BottomSheetDetailProductProps {
    isOpen: boolean;
    onClose: () => void;
    product?: ProductDetail;
    editData?: EditModeData | null;
    outletSlug?: string;
    onNavigateToCheckout?: () => void;
    onNavigateToHome?: () => void;
    outletIsOpen?: boolean;
    isLoading?: boolean;
    fallbackProduct?: HomeProduct | ProductDetail | null;
}

export const BottomSheetDetailProduct = ({
    isOpen,
    onClose,
    product,
    editData = null,
    outletSlug: outletSlugProp = "",
    onNavigateToCheckout = () => { },
    onNavigateToHome = () => { },
    outletIsOpen = true,
    isLoading = false,
    fallbackProduct = null,
}: BottomSheetDetailProductProps) => {
    const { addItem, updateItem, items } = useCart();
    const { calculateTotalPrice, getBasePrice } = usePriceCalculator();

    const { outletSlug: outletSlugFromHook } = useOutletList();

    const outletSlug = outletSlugProp ?? outletSlugFromHook ?? null;

    // State management
    // State management
    const [formData, setFormData] = useState({
        quantity: editData?.quantity || 1,
        notes: editData?.note || ""
    });

    const { quantity, notes } = formData;
    const setQuantity = (value: number | ((prev: number) => number)) => {
        setFormData(prev => ({
            ...prev,
            quantity: typeof value === 'function' ? value(prev.quantity) : value
        }));
    };
    const setNotes = (value: string) => {
        setFormData(prev => ({ ...prev, notes: value }));
    };

    // Reset state ketika product berubah atau bottom sheet dibuka
    useEffect(() => {
        if (isOpen && product) {
            setFormData({
                quantity: editData?.quantity || 1,
                notes: editData?.note || ""
            });
        }
    }, [isOpen, product?.id, editData]);

    // Product mutations hook
    // Attribute selection hook
    const { selections, toggleSelection } = useAttributeSelections(
        product?.attributes || [],
        editData
    );

    const fallbackPrice = getFallbackPrice(fallbackProduct);
    const basePrice = product ? getBasePrice(product) : fallbackPrice;
    const totalPrice = product
        ? calculateTotalPrice(product, selections, quantity)
        : basePrice * quantity;

    const earnedPoints = usePointsCalculation(totalPrice);

    const showSkeleton = isLoading || !product;

    if (showSkeleton) {
        const placeholderName = getFallbackName(fallbackProduct, "Memuat produk");
        const placeholderDescription = getFallbackDescription(
            fallbackProduct,
            "Harap tunggu, kami sedang menyiapkan detail produk."
        );
        const placeholderPrice = basePrice;

        return (
            <BottomSheetBase isOpen={isOpen} onClose={onClose}>
                <div className="flex flex-col border border-body-grey/25 max-h-[80vh] overflow-y-auto bg-white max-w-[440px] mx-auto rounded-t-3xl">
                    <div className="shrink-0 px-4 py-6 border-b border-gray-200">
                        <div className="animate-pulse space-y-4">
                            <div className="h-6 w-1/2 bg-gray-200 rounded" />
                            <div className="h-4 w-full bg-gray-200 rounded" />
                            <div className="h-4 w-5/6 bg-gray-200 rounded" />
                            <div className="h-6 w-1/3 bg-gray-200 rounded" />
                        </div>
                    </div>

                    <div className="px-4 py-6 border-b border-gray-200 space-y-6">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                    </div>

                    <div className="px-4 py-6 mb-40 border-b border-gray-200">
                        <div className="space-y-2 animate-pulse">
                            <div className="h-4 w-1/2 bg-gray-200 rounded" />
                            <div className="h-4 w-2/3 bg-gray-200 rounded" />
                        </div>
                    </div>

                    <div className="max-w-[440px]  rounded-t-2xl fixed bottom-0 w-full mt-auto p-4 bg-white border-t border-gray-200 ">
                        <div className="flex flex-col gap-2">
                            <span className="text-sm font-rubik text-body-grey">{placeholderName}</span>
                            <span className="text-xs text-body-grey/70">{placeholderDescription}</span>
                            <span className="text-base font-medium text-primary-orange">Rp {placeholderPrice.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between items-center mt-4 gap-4">
                            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
                            <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>
            </BottomSheetBase>
        );
    }

    const resolveTargetCartItemId = (orderProductId?: number) => {
        if (editData?.cartItemId) {
            return editData.cartItemId;
        }

        if (!orderProductId) {
            return undefined;
        }

        return items.find((item) => item.orderProductId === orderProductId)?.id;
    };

    const handleUpdateOperation = (
        result: ReturnType<typeof DetailItemModeHandler.handleModeOperation>,
    ) => {
        if (result.type !== 'update') return;

        const updatedCartItem = result.cartItem;

        if (!updatedCartItem) {
            toast.error('Data product tidak lengkap');
            return;
        }

        const targetCartItemId = resolveTargetCartItemId(editData?.orderProductId);

        if (targetCartItemId) {
            updateItem(targetCartItemId, updatedCartItem);
        } else {
            addItem(updatedCartItem);
        }

        if (result.shouldNavigateToCheckout) onNavigateToCheckout();
        if (result.shouldNavigateToHome) onNavigateToHome();
        onClose();
    };

    const handleStoreOperation = (
        result: ReturnType<typeof DetailItemModeHandler.handleModeOperation>
    ) => {
        if (result.type !== 'store' || !result.cartItem) return;

        addItem(result.cartItem);
        if (result.shouldNavigateToHome) onNavigateToHome();
        if (result.shouldNavigateToCheckout) onNavigateToCheckout();
        onClose();
    };

    const handleAddToCartOperation = (
        result: ReturnType<typeof DetailItemModeHandler.handleModeOperation>
    ) => {
        if (result.type === 'add-to-cart' && result.cartItem) {
            try {


                const cartItemId = editData?.cartItemId;
                if (cartItemId) {
                    // Update existing cart item
                    updateItem(cartItemId, result.cartItem);
                } else {
                    // Add new item to cart
                    addItem(result.cartItem);
                }
                onClose();
                if (result.shouldNavigateToCheckout) onNavigateToCheckout();
                if (result.shouldNavigateToHome) onNavigateToHome();
            } catch (error) {
                console.error('Error adding to cart:', error);
                toast.error('Gagal menambahkan product ke keranjang');
            }
        } else if (result.type === 'add-to-cart' && !result.cartItem) {
            toast.error('Data product tidak lengkap');
        }
    };

    const executeMutationOperation = (result: ReturnType<typeof DetailItemModeHandler.handleModeOperation>) => {
        // Execute only the appropriate handler based on operation type
        if (result.type === 'update') {
            handleUpdateOperation(result);
        } else if (result.type === 'store') {
            handleStoreOperation(result);
        } else if (result.type === 'add-to-cart') {
            handleAddToCartOperation(result);
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
            outletSlug
        );

        executeMutationOperation(result);
    };

    const isMutating = false;

    return (
        <BottomSheetBase isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col border border-body-grey/25 max-h-[80vh] overflow-y-auto bg-white max-w-[440px] mx-auto rounded-t-3xl ">


                {/* Product Info Section */}
                <div className="shrink-0 px-4 pt-6 pb-2">
                    <ProductInfo
                        title={product.name}
                        description={product.description}
                        price={basePrice}
                    />
                </div>
                {product.attributes && product.attributes.length > 0 && (
                    <div className="shrink-0 px-4 py-6 space-y-6 border border-b-body-grey/20 overflow-y-auto">
                        {product.attributes.map((attribute) => (
                            <AttributeSelector
                                key={attribute.id}
                                attribute={attribute}
                                selected={selections.get(attribute.id) || new Set()}
                                toggle={(_, _current, value) =>
                                    toggleSelection(attribute.id, value, attribute.display_type === 1)
                                }
                            />
                        ))}
                    </div>
                )}

                {/* Notes Section */}
                <div className="shrink-0 px-4 py-2 mb-40">
                    <NotesInput value={notes} onChange={setNotes} />
                </div>

                {/* Action Bar - Fixed at bottom */}
                <div className="max-w-[440px]  rounded-t-2xl fixed bottom-0 w-full mt-auto p-4 bg-white border-t border-gray-200 ">
                    {earnedPoints > 0 && <PointsBadge points={earnedPoints} />}
                    <div className="flex justify-between items-center mt-4 gap-4">
                        <QuantitySelector
                            quantity={quantity}
                            onIncrease={() => setQuantity((prev) => prev + 1)}
                            onDecrease={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                        />
                        <AddToCartButton
                            totalPrice={totalPrice}
                            onAddToCart={handleAddToCart}
                            buttonText={editData?.editMode || editData?.cartEditMode ? "Simpan Perubahan" : "Tambah"}
                            isLoading={isMutating}
                            disabled={!outletIsOpen}
                        />
                    </div>
                </div>
            </div>
        </BottomSheetBase>
    )
}

export default BottomSheetDetailProduct;
