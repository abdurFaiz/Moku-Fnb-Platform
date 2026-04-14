import { useMemo } from 'react';
import type { Voucher } from './useVoucherState';

export interface PriceCalculationResult {
  originalPrice: number;
  discount: number;
  finalPrice: number;
  tax: number;
  subtotalWithTax: number;
  savings: number;
  savingsPercentage: number;
}

export interface UsePriceCalculationReturn {
  calculation: PriceCalculationResult;
  calculateDiscount: (voucher: Voucher | null, subtotal: number) => number;
  calculateTax: (amount: number, taxRate: number) => number;
  formatPrice: (amount: number) => string;
}

export const usePriceCalculation = (
  subtotal: number,
  taxRate: number = 0.1,
  voucher: Voucher | null = null,
  canApplyVoucher: boolean = false
): UsePriceCalculationReturn => {

  // Memoized tax calculation
  const tax = useMemo(() => {
    return Math.round(subtotal * taxRate);
  }, [subtotal, taxRate]);

  // Memoized discount calculation
  const discount = useMemo(() => {
    if (!voucher || !voucher.isActive || !canApplyVoucher) {
      return 0;
    }

    let calculatedDiscount = 0;

    if (voucher.type === 'percentage') {
      calculatedDiscount = Math.round(subtotal * (voucher.value / 100));

      // Apply maximum discount if specified
      if (voucher.maxDiscount && calculatedDiscount > voucher.maxDiscount) {
        calculatedDiscount = voucher.maxDiscount;
      }
    } else if (voucher.type === 'fixed') {
      // Don't exceed subtotal for fixed discounts
      calculatedDiscount = Math.min(voucher.value, subtotal);
    }

    return calculatedDiscount;
  }, [subtotal, voucher, canApplyVoucher]);

  // Memoized price calculation result
  const calculation = useMemo((): PriceCalculationResult => {
    const subtotalWithTax = subtotal + tax;
    const finalPrice = Math.max(0, subtotalWithTax - discount);
    const savings = subtotalWithTax - finalPrice;
    const savingsPercentage = subtotalWithTax > 0 ? (savings / subtotalWithTax) * 100 : 0;

    return {
      originalPrice: subtotalWithTax,
      discount,
      finalPrice,
      tax,
      subtotalWithTax,
      savings,
      savingsPercentage: Math.round(savingsPercentage * 100) / 100,
    };
  }, [subtotal, tax, discount]);

  // Memoized utility functions
  const calculateDiscount = useMemo(() =>
    (voucherToCalculate: Voucher | null, subtotalAmount: number): number => {
      if (!voucherToCalculate || !voucherToCalculate.isActive) {
        return 0;
      }

      let calculatedDiscount = 0;

      if (voucherToCalculate.type === 'percentage') {
        calculatedDiscount = Math.round(subtotalAmount * (voucherToCalculate.value / 100));

        if (voucherToCalculate.maxDiscount && calculatedDiscount > voucherToCalculate.maxDiscount) {
          calculatedDiscount = voucherToCalculate.maxDiscount;
        }
      } else if (voucherToCalculate.type === 'fixed') {
        calculatedDiscount = Math.min(voucherToCalculate.value, subtotalAmount);
      }

      return calculatedDiscount;
    }, []);

  const calculateTax = useMemo(() =>
    (amount: number, rate: number): number => {
      return Math.round(amount * rate);
    }, []);

  const formatPrice = useMemo(() =>
    (amount: number): string => {
      return `Rp ${amount.toLocaleString('id-ID')}`;
    }, []);

  return {
    calculation,
    calculateDiscount,
    calculateTax,
    formatPrice,
  };
};

export default usePriceCalculation;
