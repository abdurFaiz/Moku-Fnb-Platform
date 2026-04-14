import { useEffect, useRef, useState } from "react";
import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/features/cart/hooks/useCart";
import { useOutletNavigation } from "@/hooks/shared/useOutletNavigation";
import { getImageUrl } from "@/utils/imageFormatters";
import type { CartItem } from "@/features/cart/types/Cart";
import { toast } from "sonner";
import { BottomSheetDetailProduct } from "@/features/storefront/components/BottomSheetAddDetailProduct";
import { useOutletList, useProductDetail } from "@/features/product/hooks/useProductDetail";
import type { EditModeData } from "@/features/product/services/DetailItemModeHandler";

interface CartBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartBottomSheet({ isOpen, onClose }: Readonly<CartBottomSheetProps>) {
  const { items, updateQuantity, removeItem, getTotalPrice } = useCart();
  const { navigateToCheckout, outletSlug } = useOutletNavigation();
  const { outletSlug: currentOutletSlug } = useOutletList();
  const effectiveOutletSlug = outletSlug || currentOutletSlug;

  const [swipedItemId, setSwipedItemId] = useState<string | null>(null);
  const swipeStartX = useRef<number>(0);
  const [deletingItemIds, setDeletingItemIds] = useState<Set<string>>(new Set());
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
  const [editModeData, setEditModeData] = useState<EditModeData | null>(null);
  const [productUuidToLoad, setProductUuidToLoad] = useState<string | undefined>(undefined);

  const { product: editingProduct } = useProductDetail(
    effectiveOutletSlug,
    productUuidToLoad,
  );

  useEffect(() => {
    if (isEditSheetOpen && editingCartItem?.productUuid) {
      setProductUuidToLoad(editingCartItem.productUuid);
    }
  }, [isEditSheetOpen, editingCartItem?.productUuid]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleCheckoutNavigation = async () => {
    navigateToCheckout();
    onClose();
  };

  const handleSwipeDelete = async (item: CartItem) => {
    if (deletingItemIds.has(item.id)) {
      return;
    }

    setDeletingItemIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });

    removeItem(item.id);
    toast.success("Item berhasil dihapus dari keranjang");

    setDeletingItemIds((prev) => {
      const next = new Set(prev);
      next.delete(item.id);
      return next;
    });
  };

  const handleSwipeStart = (e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0]?.clientX || 0;
    setSwipedItemId(null);
  };

  const handleSwipeMove = (e: React.TouchEvent, itemId: string) => {
    const currentX = e.touches[0]?.clientX || 0;
    const diff = swipeStartX.current - currentX;

    if (diff > 50) {
      setSwipedItemId(itemId);
    } else {
      setSwipedItemId(null);
    }
  };

  const handleSwipeEnd = async () => {
    swipeStartX.current = 0;

    if (swipedItemId) {
      const item = items.find((cartItem) => cartItem.id === swipedItemId);
      if (item) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        await handleSwipeDelete(item);
      }
    }

    setSwipedItemId(null);
  };

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      void handleSwipeDelete(item);
      return;
    }

    void updateQuantity(item.id, newQuantity);
  };

  const handleItemClick = (item: CartItem) => {
    const editData: EditModeData = {
      cartEditMode: true,
      cartItemId: item.id,
      productUuid: item.productUuid,
      variantIds: item.variantIds || [],
      quantity: item.quantity,
      note: item.notes || "",
      orderProductId: item.orderProductId,
    };

    setEditingCartItem(item);
    setEditModeData(editData);
    setIsEditSheetOpen(true);
  };

  if (!isOpen) {
    return null;
  }

  const displayItems = items;
  const isCheckoutBusy = false;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in duration-300 border-0"
        onClick={onClose}
        aria-label="Close cart"
      />

      <div className="fixed inset-x-0 bottom-0 z-50 max-w-[440px] mx-auto animate-in slide-in-from-bottom duration-300">
        <div className="bg-white rounded-t-3xl shadow-xl">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <ShoppingBag className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-title-black">Keranjang Saya</h2>
                <p className="text-sm text-gray-500">
                  {displayItems.length} item dalam keranjang
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-title-black mb-2">
                  Keranjang Kosong
                </h3>
                <p className="text-gray-500 text-center">
                  Belum ada item yang ditambahkan ke keranjang
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {displayItems.map((item) => {
                  const isItemSwiped = swipedItemId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="relative overflow-hidden rounded-2xl"
                      onTouchStart={handleSwipeStart}
                      onTouchMove={(e) => handleSwipeMove(e, item.id)}
                      onTouchEnd={handleSwipeEnd}
                    >
                      <div
                        className={`absolute inset-y-0 right-0 bg-red-500 flex items-center justify-center px-4 transition-opacity duration-200 ${isItemSwiped ? 'opacity-100' : 'opacity-0'}`}
                        style={{ width: "80px" }}
                      >
                        <div className="text-white flex flex-col items-center gap-1">
                          <Trash2 className="w-5 h-5" />
                          <span className="text-xs font-medium">Hapus</span>
                        </div>
                      </div>

                      <div
                        className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 bg-gray-50 hover:bg-gray-100 cursor-pointer ${isItemSwiped ? '-translate-x-20' : 'translate-x-0'}`}
                      >
                        <button
                          type="button"
                          className="relative w-16 h-16 bg-gray-200 rounded-xl overflow-hidden shrink-0 border-0 p-0 cursor-pointer hover:opacity-90"
                          onClick={() => handleItemClick(item)}
                        >
                          {item.image ? (
                            <img
                              loading="lazy"
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-orange-600" />
                            </div>
                          )}
                        </button>

                        <button
                          type="button"
                          className="flex-1 min-w-0 border-0 p-0 text-left bg-transparent cursor-pointer hover:opacity-90"
                          onClick={() => handleItemClick(item)}
                        >
                          <h3 className="font-medium truncate text-title-black">{item.name}</h3>
                          <div className="mt-1 space-y-1">
                            {item.options.length > 0 && (
                              <p className="text-xs text-gray-500">
                                Pilihan: {item.options.join(", ")}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-gray-500">Catatan: {item.notes}</p>
                            )}
                          </div>
                          <p className="mt-2 font-semibold text-orange-600">
                            Rp {item.price.toLocaleString("id-ID")}
                          </p>
                        </button>

                        <div
                          className="flex items-center gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-orange-300 transition-colors"
                          >
                            <Minus className="w-4 h-4 text-gray-600" />
                          </button>
                          <span className="w-8 text-center font-medium text-title-black">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {displayItems.length > 0 && (
            <div className="p-6 border-t border-gray-100 bg-white rounded-b-3xl">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-title-black">Total</span>
                <span className="text-lg font-bold text-orange-600">
                  Rp {getTotalPrice().toLocaleString("id-ID")}
                </span>
              </div>
              <button
                onClick={() => {
                  void handleCheckoutNavigation();
                }}
                disabled={isCheckoutBusy}
                className={`w-full bg-primary-orange text-white py-3 px-4 rounded-2xl font-medium transition-colors ${isCheckoutBusy ? 'opacity-60 cursor-not-allowed' : 'hover:bg-orange-600'}`}
              >
                {isCheckoutBusy ? "Memproses…" : "Checkout"}
              </button>
            </div>
          )}
        </div>
      </div>

      {editingProduct && editModeData && (
        <BottomSheetDetailProduct
          isOpen={isEditSheetOpen}
          onClose={() => {
            setIsEditSheetOpen(false);
            setEditingCartItem(null);
            setEditModeData(null);
            setProductUuidToLoad(undefined);
          }}
          product={editingProduct}
          editData={editModeData}
          outletSlug={effectiveOutletSlug}
          onNavigateToCheckout={() => {
            setIsEditSheetOpen(false);
            setEditingCartItem(null);
            setEditModeData(null);
            setProductUuidToLoad(undefined);
          }}
          onNavigateToHome={() => {
            setIsEditSheetOpen(false);
            setEditingCartItem(null);
            setEditModeData(null);
            setProductUuidToLoad(undefined);
          }}
        />
      )}
    </>
  );
}
