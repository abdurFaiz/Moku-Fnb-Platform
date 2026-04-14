import { useVoucherStore } from '@/features/vouchers/stores/voucherStore';

export interface Voucher {
  id: string | number;
  name: string;
  description?: string;
  maxUasage?: number;
  code?: string;
  type: 'percentage' | 'fixed';
  value: number;
  maxDiscount?: number;
  minTransaction?: number;
  isActive: boolean;
  applicableProductIds?: number[];
  applicableProductUuids?: string[];
}

export interface UseVoucherStateReturn {
  appliedVoucher: Voucher | null;
  applyVoucher: (voucher: Voucher | null, source?: 'user' | 'input' | null) => void;
  removeVoucher: () => void;
  hasAppliedVoucher: boolean;
}

export const useVoucherState = (): UseVoucherStateReturn => {
  const { appliedVoucher, applyVoucher, removeVoucher } = useVoucherStore();

  const handleApplyVoucher = (voucher: Voucher | null, source: 'user' | 'input' | null = 'user') => {
    if (voucher) {
      applyVoucher(voucher, source);
    }
  };

  const hasAppliedVoucher = appliedVoucher !== null;

  return {
    appliedVoucher,
    applyVoucher: handleApplyVoucher,
    removeVoucher,
    hasAppliedVoucher,
  };
};

export default useVoucherState;
