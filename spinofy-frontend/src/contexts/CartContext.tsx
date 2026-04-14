import { useState } from "react";
import type { ReactNode } from "react";
import { CartContext } from "@/features/cart/types/CartContextType";
import type { CartItem } from "@/features/cart/types/CartContextType";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (newItem: Omit<CartItem, "id">) => {
    const id = Date.now().toString();
    const itemWithId = { ...newItem, id };

    setItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (item) =>
          item.productUuid === newItem.productUuid &&
          item.name === newItem.name &&
          JSON.stringify(item.options.sort()) ===
          JSON.stringify(newItem.options.sort()) &&
          item.notes === newItem.notes &&
          item.appliedVoucherId === newItem.appliedVoucherId, // Don't merge items with different vouchers
      );

      if (existingItemIndex !== -1) {
        // Update quantity if similar item exists
        const updatedItems = [...prev];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prev, itemWithId];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const applyVoucherToItems = (itemIds: string[], voucherId: number | string, voucherCode: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (itemIds.includes(item.id)) {
          return {
            ...item,
            appliedVoucherId: voucherId,
            appliedVoucherCode: voucherCode,
          };
        }
        return item;
      })
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        applyVoucherToItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
