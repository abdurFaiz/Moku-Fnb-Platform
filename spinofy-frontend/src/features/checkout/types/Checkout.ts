import type { Order } from "../../cart/types/Order";

export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  options: string[];
  image?: string;
  notes?: string;
}

export interface CheckoutData {
  items: CheckoutItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  appliedVoucher: Voucher | null;
}

export interface CheckoutSummary {
  total: number;
  originalTotal: number;
  savings: number;
}

export interface PaymentDetail {
  id: string;
  label: string;
  value: string;
  isDiscount?: boolean;
  dashed?: boolean;
  highlight?: boolean;
}

export interface SpecialOffer {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

export interface Voucher {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  isActive: boolean;
  minTransaction?: number;
  maxDiscount?: number;
  description?: string;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface VoucherValidationResult {
  canApply: boolean;
  reason?: string;
}

export interface CheckoutConfig {
  taxRate: number;
  currency: string;
  locale: string;
}

export interface CheckoutCalculationResult {
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

export interface CheckoutItemUpdate {
  itemId: string;
  quantity: number;
}

export type NavigationAction = "home" | "payment" | "voucher";

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface CheckoutPaymentParams {
  orderCode: string;
  paymentMethodId: number;
  tableNumberId?: number | string | null;
  subtotal?: number;
  tax?: number;
  discount?: number;
  finalPrice?: number;
  appliedVoucher?: any;
  paymentMethodFee?: number;
  platformFee?: number;
}

export interface CheckoutPaymentResult {
  order: Order | null;
  orderCode: string;
  subtotal?: number;
  tax?: number;
  discount?: number;
  finalPrice?: number;
  appliedVoucher?: any;
  paymentMethodFee?: number;
  platformFee?: number;
}

export interface VoucherCalculationResult {
  originalPrice: number;
  discount: number;
  finalPrice: number;
  tax: number;
  subtotalWithTax: number;
  savings: number;
  savingsPercentage: number;
  canApplyVoucher: boolean;
  errorMessage?: string;
}

export interface CheckoutDataReturn {
  checkoutData: CheckoutData;
  appliedVoucher: Voucher | null;
  voucherCalculation: VoucherCalculationResult;
  formattedPrices: FormattedPrices;
  isLoading?: boolean;
  error?: Error | null;
}

export interface FormattedPrices {
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
}

export interface CheckoutRequestPayload {
  product_ids: number[];
  variant_ids: number[];
  quantities: number[];
  notes: string[];
  voucher_type: number | null;
  voucher_code: string | null;
  table_number_id: string | null;
  method_id: number;
}