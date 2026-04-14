import { useBarcodeStore } from '@/features/storefront/stores/useBarcodeStore';

interface UseBarcodeParamsReturn {
    tableNumber: string | null;
    barcodeOutlet: string | null;
    hasBarcodeData: boolean;
    setTableNumber: (tableNumber: string | null) => void;
    setBarcodeOutlet: (outletSlug: string | null) => void;
    clearBarcodeData: () => void;
}

/**
 * Hook to access barcode data from store
 * Useful for components that need to read or modify barcode parameters
 */
export const useBarcodeParams = (): UseBarcodeParamsReturn => {
    const { barcode, outletSlug, setBarcode, setOutletSlug, clearAll } = useBarcodeStore();

    const hasBarcodeData = () => {
        return !!barcode && !!outletSlug;
    };

    return {
        tableNumber: barcode,
        barcodeOutlet: outletSlug,
        hasBarcodeData: hasBarcodeData(),
        setTableNumber: setBarcode,
        setBarcodeOutlet: setOutletSlug,
        clearBarcodeData: clearAll,
    };
};
