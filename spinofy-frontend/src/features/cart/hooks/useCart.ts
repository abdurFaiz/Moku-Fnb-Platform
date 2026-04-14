import { useCartStore } from "@/features/cart/stores/cartStore";

export function useCart() {
  return useCartStore();
}