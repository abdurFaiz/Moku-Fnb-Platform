import { createContext } from "react";

export interface CartItem {
  id: string;
  productUuid: string;
  name: string;
  price: number;
  quantity: number;
  options: string[];
  size: string;
  ice: string;
  notes?: string;
  image?: string;
  appliedVoucherId?: number | string | null;
  appliedVoucherCode?: string | null;
}

export interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  applyVoucherToItems?: (itemIds: string[], voucherId: number | string, voucherCode: string) => void;
}

export const CartContext = createContext<CartContextType | undefined>(
  undefined,
);
