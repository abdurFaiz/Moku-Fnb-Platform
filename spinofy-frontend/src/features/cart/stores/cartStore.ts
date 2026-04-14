import { create } from "zustand";
import { useVoucherStore } from '@/features/vouchers/stores/voucherStore';
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartItem } from "@/features/cart/types/Cart";

// Re-export for convenience
export type { CartItem } from "@/features/cart/types/Cart";

interface CartStore {
  items: CartItem[];
  isCheckoutProcessing: boolean;
  syncCart: (items: CartItem[]) => void;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  deleteItem: (id: string, outletSlug: string, orderCode: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number, options?: { skipBackendSync?: boolean }) => Promise<void>;
  updateItem: (id: string, updates: Partial<Omit<CartItem, "id">>) => void;
  clearCart: () => void;
  setCheckoutProcessing: (processing: boolean) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isCheckoutProcessing: false,

      syncCart: (items) => set({ items }),

      addItem: (newItem) => {
        const id = `${Date.now()}-${Math.random()}`; // More unique ID
        const itemWithId = { ...newItem, id };

        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (item) =>
              item.productUuid === newItem.productUuid &&
              item.name === newItem.name &&
              JSON.stringify([...(item.options || [])].sort((a, b) => a.localeCompare(b))) ===
              JSON.stringify([...(newItem.options || [])].sort((a, b) => a.localeCompare(b))) &&
              item.notes === newItem.notes,
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += newItem.quantity;
            return { items: updatedItems };
          } else {
            return { items: [...state.items, itemWithId] };
          }
        });
      },

      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      deleteItem: async (id, outletSlug, orderCode) => {
        const currentItems = get().items;
        const item = currentItems.find((cartItem) => cartItem.id === id);

        if (!item) {
          throw new Error('Item not found in cart');
        }

        const wasLastItem = currentItems.length === 1;
        const updatedItems = currentItems.filter((cartItem) => cartItem.id !== id);

        // Optimistically update cart so UI reflects deletion immediately
        set({ items: updatedItems });

        try {
          // Import PaymentAPI dynamically to avoid circular dependency
          const { default: PaymentAPI } = await import('@/features/checkout/api/payment.api');

          if (wasLastItem) {
            // If this is the last item, delete the entire order
            await PaymentAPI.deleteOrder(outletSlug, orderCode);
            return;
          }

          // If there are multiple items, delete this specific product
          if (item.orderProductId) {
            // Use the deleteProduct endpoint to remove the item
            await PaymentAPI.deleteProduct(outletSlug, item.orderProductId);
          } else {
            console.warn('⚠️ CartStore: Item has no orderProductId, cannot delete from backend');
          }
        } catch (error) {
          // Revert optimistic update if backend deletion fails
          set({ items: currentItems });
          throw error;
        }
      },

      updateQuantity: async (id, quantity, options = {}) => {
        const { items } = get();
        const item = items.find((cartItem) => cartItem.id === id);

        if (!item) {
          return;
        }

        const { skipBackendSync = false } = options;

        // Handle quantity 0 - remove item and sync with API
        if (quantity <= 0) {
          if (item.orderProductId && !skipBackendSync) {
            try {
              const { default: PaymentAPI } = await import('@/features/checkout/api/payment.api');

              const currentPath = window.location.pathname;
              const outletSlugMatch = currentPath.match(/^\/([^\/]+)/);
              const outletSlug = outletSlugMatch ? outletSlugMatch[1] : '';
              const orderCode = item.orderCode;

              if (!outletSlug || !orderCode) {
                console.warn('⚠️ CartStore: Missing outlet slug or order code for quantity sync');
              } else {
                await PaymentAPI.storeQuantityProduct(outletSlug, orderCode, {
                  order_product_ids: [item.orderProductId],
                  quantities: [0],
                });
              }
            } catch (error) {
              console.error('Failed to sync item deletion with backend:', error);
              return;
            }
          }

          get().removeItem(id);
          return;
        }

        // Store the previous quantity for rollback in case of error
        const previousQuantity = item.quantity;

        // Optimistically update the UI first
        set((state) => ({
          items: state.items.map((cartItem) =>
            cartItem.id === id ? { ...cartItem, quantity } : cartItem,
          ),
        }));

        // Sync with backend if orderProductId exists
        if (item.orderProductId && !skipBackendSync) {
          try {
            // Import PaymentAPI dynamically to avoid circular dependency
            const { default: PaymentAPI } = await import('@/features/checkout/api/payment.api');

            const currentPath = window.location.pathname;
            const outletSlugMatch = currentPath.match(/^\/([^\/]+)/);
            const outletSlug = outletSlugMatch ? outletSlugMatch[1] : '';
            const orderCode = item.orderCode;

            if (!outletSlug || !orderCode) {
              console.warn('⚠️ CartStore: Missing outlet slug or order code for quantity sync');
              return;
            }

            await PaymentAPI.storeQuantityProduct(outletSlug, orderCode, {
              order_product_ids: [item.orderProductId],
              quantities: [quantity],
            });


          } catch (error) {
            console.error('❌ CartStore: Failed to update quantity in backend:', error);

            // Rollback the optimistic update on error
            set((state) => ({
              items: state.items.map((cartItem) =>
                cartItem.id === id ? { ...cartItem, quantity: previousQuantity } : cartItem,
              ),
            }));

            // Re-throw error so UI can handle it if needed
            throw new Error(`Failed to update quantity: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      },

      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates } : item,
          ),
        }));
      },

      clearCart: () => {
        set({ items: [] });
        try {
          // Also clear vouchers when clearing the cart so the next order doesn't reuse vouchers
          useVoucherStore.getState().removeVoucher();
          useVoucherStore.getState().clearVoucherSelections();
          localStorage.removeItem('voucherItemSelections');
          localStorage.removeItem('appliedVoucherId');
          localStorage.removeItem('appliedVoucherCode');
          localStorage.removeItem('appliedVoucher');
        } catch (err) {
          // ignore any errors while clearing voucher
        }
      },

      setCheckoutProcessing: (processing: boolean) =>
        set({ isCheckoutProcessing: processing }),

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
