
import { BottomSheetBase } from "@/components"
import {
    AddToCartButton,
} from "../../../features/product/components/ActionBottomBar";
import { useProductMutations } from "@/features/product/hooks/useProductMutations";
import { usePriceCalculator } from "@/features/product/hooks/usePriceCalculator";
import type { ProductDetail } from "@/features/product/types/DetailProduct";
import { toast } from "sonner";
import { Utensils } from "lucide-react";
import type { HomeProduct } from "@/features/outlets/services/outletProductService";
import { getFallbackDescription, getFallbackImage, getFallbackName, getFallbackPrice } from "@/features/storefront/utils/productFallback";

interface BottomSheetViewDetailProductProps {
    isOpen: boolean;
    onClose: () => void;
    product?: ProductDetail;
    onOpenAddDetail?: () => void;
    outletIsOpen?: boolean;
    isLoading?: boolean;
    fallbackProduct?: HomeProduct | ProductDetail | null;
}

export const BottomSheetViewDetailProduct = ({
    isOpen,
    onClose,
    product,
    onOpenAddDetail = () => { },
    outletIsOpen = true,
    isLoading = false,
    fallbackProduct = null,
}: BottomSheetViewDetailProductProps) => {
    const { getBasePrice } = usePriceCalculator();


    // Product mutations hook
    const { updateProductMutation, storeProductMutation } = useProductMutations({
        onUpdateSuccess: () => {
            onClose();
        },
        onUpdateError: (error) => toast.error(`Failed to update product: ${error.message}`),
        onStoreSuccess: () => {
            onClose();
        },
        onStoreError: (error) => toast.error(`Failed to add product: ${error.message}`),
    });

    const fallbackImage = getFallbackImage(fallbackProduct);
    const fallbackPrice = getFallbackPrice(fallbackProduct);
    const displayName = product?.name ?? getFallbackName(fallbackProduct, "");
    const displayDescription = product?.description ?? getFallbackDescription(fallbackProduct, "");
    const displayImage = product?.image_url ?? product?.image ?? fallbackImage;
    const basePrice = product ? getBasePrice(product) : fallbackPrice;
    const isMutating = updateProductMutation.isPending || storeProductMutation.isPending;
    const isButtonLoading = isMutating || isLoading;
    const showSkeleton = isLoading && !product && !fallbackProduct;

    if (!product && !fallbackProduct && !isLoading) {
        return null;
    }

    return (
        <BottomSheetBase isOpen={isOpen} onClose={onClose}>
            <div className="flex border border-body-grey/25 flex-col max-h-[80vh] overflow-y-auto bg-white max-w-[440px] mx-auto rounded-t-3xl pb-32">
                {/* Close Button */}
                <div className="shrink-0 px-4 py-4 flex justify-between items-center">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="p-3 bg-primary-orange/20 rounded-full">
                            <Utensils className="size-5 text-primary-orange" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <p className="font-medium font-rubik text-title-black text-sm">Info Produk</p>
                            <span className="font-rubik text-body-grey text-xs">Informasi singkat tentang menu</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Close"
                    >
                        <svg
                            className="w-6 h-6 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Product Image */}
                <div className="shrink-0 px-4 flex justify-center">
                    <div className="relative w-full h-56 rounded-2xl overflow-hidden">
                        {showSkeleton ? (
                            <div className="w-full h-full bg-gray-200 animate-pulse" />
                        ) : (
                            <img
                                loading="lazy"
                                src={displayImage}
                                alt={displayName}
                                className="w-full h-full object-contain"
                            />
                        )}
                    </div>
                </div>

                {/* Product Info Section */}
                <div className="shrink-0 mb-24 px-4 py-6">
                    <div className="space-y-3">
                        {showSkeleton ? (
                            <>
                                <div className="h-6 w-1/2 bg-gray-200 animate-pulse rounded" />
                                <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
                                <div className="h-4 w-5/6 bg-gray-200 animate-pulse rounded" />
                                <div className="h-6 w-1/3 bg-gray-200 animate-pulse rounded" />
                            </>
                        ) : (
                            <>
                                <h2 className="text-lg font-medium font-rubik text-title-black capitalize">{displayName}</h2>
                                <p className="text-base text-gray-600 leading-normal">
                                    {displayDescription}
                                </p>
                                <p className="text-lg font-medium font-rubik text-primary-orange">
                                    Rp {basePrice.toLocaleString('id-ID')}
                                </p>
                            </>
                        )}
                    </div>
                </div>

                {/* Action Bar - Fixed at bottom */}
                <div className="max-w-[440px] rounded-t-2xl fixed bottom-0 w-full mt-auto px-3 py-3 bg-white border-t border-gray-200 flex justify-between items-center gap-4">

                    <AddToCartButton
                        totalPrice={basePrice}
                        onAddToCart={onOpenAddDetail}
                        isLoading={isButtonLoading}
                        disabled={!outletIsOpen || !product || isLoading}
                    />
                </div>
            </div>
        </BottomSheetBase>
    )
}

export default BottomSheetViewDetailProduct;
