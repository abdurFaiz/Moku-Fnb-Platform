export interface CartItem {

  id: string;
  productUuid: string; // Added for API integration
  name: string;
  price: number; // Total price (base + extras)
  quantity: number;
  options: string[];
  notes?: string;
  image?: string;
  // Price breakdown
  basePrice?: number; // Base product price without extras/toppings
  extraPrice?: number; // Total extra/topping price
  // Additional fields for edit functionality
  orderProductId?: number; // For editing existing order product
  productId?: number; // Numeric product ID for API
  variantIds?: number[]; // Selected product_attribute_value_id
  // Per-product voucher support
  appliedVoucherId?: number | null; // Voucher applied to this specific item
  appliedVoucherCode?: string | null; // Voucher code for this item
  orderCode?: string; // Backend order code for bulk quantity updates
}