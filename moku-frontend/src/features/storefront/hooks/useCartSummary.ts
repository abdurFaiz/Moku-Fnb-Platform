import { useEffect } from "react";
import { useCart } from "@/features/cart/hooks/useCart";


export const useCartSummary = () => {
  const { items, clearCart } = useCart();
  // Calculate local totals as fallback
  const localTotalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const localTotalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Prefer instant local totals when user has a cart in progress; fallback to backend when local cart is empty
  const totalItems = localTotalItems;
  const totalPrice = localTotalPrice;

  // Clear stale items tied to a finished checkout once the backend no longer reports an open order
  useEffect(() => {

    if (items.length === 0) {
      return;
    }
  }, [items, clearCart]);

  return {
    totalItems,
    totalPrice,
  };
};