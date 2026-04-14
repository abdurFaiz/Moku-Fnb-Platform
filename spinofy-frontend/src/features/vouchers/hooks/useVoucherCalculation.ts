import { useVoucherState } from "./useVoucherState";
import { useVoucherValidation } from "./useVoucherValidation";
import { usePriceCalculation } from "./usePriceCalculation";
import type { Voucher } from "./useVoucherState";

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

export interface UseVoucherCalculationReturn {
  calculation: VoucherCalculationResult;
  appliedVoucher: Voucher | null;
  applyVoucher: (voucher: Voucher | null, source?: 'user' | 'input' | null) => void;
  removeVoucher: () => void;
  formatPrice: (amount: number) => string;
}

export const useVoucherCalculation = (
  subtotal: number,
  taxRate: number = 0.1,
): UseVoucherCalculationReturn => {
  // Voucher state management
  const { appliedVoucher, applyVoucher, removeVoucher } = useVoucherState();

  // Voucher validation logic
  const { validation } = useVoucherValidation(appliedVoucher, subtotal);

  // Price calculation logic
  const { calculation: priceCalculation, formatPrice } = usePriceCalculation(
    subtotal,
    taxRate,
    appliedVoucher,
    validation.canApplyVoucher,
  );

  // Combine all calculations into final result
  const calculation: VoucherCalculationResult = {
    ...priceCalculation,
    canApplyVoucher: validation.canApplyVoucher,
    errorMessage: validation.errorMessage,
  };

  return {
    calculation,
    appliedVoucher,
    applyVoucher,
    removeVoucher,
    formatPrice,
  };
};

// Re-export types for convenience
export type { Voucher };

export default useVoucherCalculation;
