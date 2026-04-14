import { useMemo } from 'react';
import type { Voucher } from './useVoucherState';

export interface VoucherValidationResult {
  canApplyVoucher: boolean;
  errorMessage?: string;
  isMinTransactionMet: boolean;
  isVoucherActive: boolean;
}

export interface UseVoucherValidationReturn {
  validation: VoucherValidationResult;
  validateVoucher: (voucher: Voucher | null, subtotal: number) => VoucherValidationResult;
}

export const useVoucherValidation = (
  voucher: Voucher | null,
  subtotal: number
): UseVoucherValidationReturn => {

  const validation = useMemo((): VoucherValidationResult => {
    if (!voucher) {
      return {
        canApplyVoucher: false,
        isMinTransactionMet: true,
        isVoucherActive: false,
      };
    }

    const isVoucherActive = voucher.isActive;
    if (!isVoucherActive) {
      return {
        canApplyVoucher: false,
        errorMessage: 'Voucher sudah tidak aktif',
        isMinTransactionMet: true,
        isVoucherActive: false,
      };
    }

    const isMinTransactionMet = !voucher.minTransaction || subtotal >= voucher.minTransaction;
    if (!isMinTransactionMet) {
      return {
        canApplyVoucher: false,
        errorMessage: `Minimum transaksi Rp ${voucher.minTransaction?.toLocaleString('id-ID')} diperlukan`,
        isMinTransactionMet: false,
        isVoucherActive: true,
      };
    }

    return {
      canApplyVoucher: true,
      isMinTransactionMet: true,
      isVoucherActive: true,
    };
  }, [voucher, subtotal]);

  const validateVoucher = useMemo(() =>
    (voucherToValidate: Voucher | null, subtotalAmount: number): VoucherValidationResult => {
      if (!voucherToValidate) {
        return {
          canApplyVoucher: false,
          isMinTransactionMet: true,
          isVoucherActive: false,
        };
      }

      const isActive = voucherToValidate.isActive;
      if (!isActive) {
        return {
          canApplyVoucher: false,
          errorMessage: 'Voucher sudah tidak aktif',
          isMinTransactionMet: true,
          isVoucherActive: false,
        };
      }

      const meetsMinTransaction = !voucherToValidate.minTransaction ||
        subtotalAmount >= voucherToValidate.minTransaction;

      if (!meetsMinTransaction) {
        return {
          canApplyVoucher: false,
          errorMessage: `Minimum transaksi Rp ${voucherToValidate.minTransaction?.toLocaleString('id-ID')} diperlukan`,
          isMinTransactionMet: false,
          isVoucherActive: true,
        };
      }

      return {
        canApplyVoucher: true,
        isMinTransactionMet: true,
        isVoucherActive: true,
      };
    }, []);

  return {
    validation,
    validateVoucher,
  };
};

export default useVoucherValidation;
