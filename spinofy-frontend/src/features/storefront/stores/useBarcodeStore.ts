import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BarcodeStore {
    barcode: string | null;
    outletSlug: string | null;
    setBarcode: (barcode: string | null) => void;
    setOutletSlug: (outletSlug: string | null) => void;
    clearBarcode: () => void;
    clearOutletSlug: () => void;
    clearAll: () => void;
}

export const useBarcodeStore = create<BarcodeStore>()(
    persist(
        (set) => ({
            barcode: null,
            outletSlug: null,

            setBarcode: (barcode: string | null) => {
                set({ barcode });
            },

            setOutletSlug: (outletSlug: string | null) => {
                set({ outletSlug });
            },

            clearBarcode: () => {
                set({ barcode: null });
            },

            clearOutletSlug: () => {
                set({ outletSlug: null });
            },

            clearAll: () => {
                set({ barcode: null, outletSlug: null });
            },
        }),
        {
            name: 'barcode-storage',
            partialize: (state) => ({
                barcode: state.barcode,
                outletSlug: state.outletSlug,
            }),
        }
    )
);

export default useBarcodeStore;
