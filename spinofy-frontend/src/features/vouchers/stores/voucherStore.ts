import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Voucher {
    id: string | number;
    name: string;
    code?: string;
    type: 'percentage' | 'fixed';
    value: number;
    maxDiscount?: number;
    minTransaction?: number;
    isActive: boolean;
    applicableProductIds?: number[]; // Product IDs this voucher can be applied to
    applicableProductUuids?: string[]; // Product UUIDs this voucher can be applied to
}

interface ItemSelection {
    itemId: string;
    quantity: number;
}

interface VoucherStore {
    appliedVoucher: Voucher | null;
    appliedVoucherSource?: 'user' | 'input' | null;
    voucherSelections: ItemSelection[];
    applyVoucher: (voucher: Voucher, source?: 'user' | 'input' | null) => void;
    removeVoucher: () => void;
    setVoucherSelections: (selections: ItemSelection[]) => void;
    clearVoucherSelections: () => void;
}

export const useVoucherStore = create<VoucherStore>()(
    persist(
        (set) => ({
            appliedVoucher: null,
            voucherSelections: [],

            applyVoucher: (voucher: Voucher, source: 'user' | 'input' | null = 'user') => {
                set({ appliedVoucher: voucher, appliedVoucherSource: source });
            },

            removeVoucher: () => {
                set({ appliedVoucher: null, appliedVoucherSource: null });
            },

            setVoucherSelections: (selections: ItemSelection[]) => {
                set({ voucherSelections: selections });
            },

            clearVoucherSelections: () => set({ voucherSelections: [] }),
        }),
        {
            name: 'voucher-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ appliedVoucher: state.appliedVoucher, appliedVoucherSource: state.appliedVoucherSource, voucherSelections: state.voucherSelections }),
        },
    ),
);
