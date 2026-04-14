import { useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useBarcodeStore } from '@/features/storefront/stores/useBarcodeStore';

interface UseWelcomeOutletSelectionReturn {
    showOutletSelection: boolean;
    displayOutletSelection: () => void;
    hideOutletSelection: () => void;
    toggleOutletSelection: () => void;
    handleOutletSelect: (outletSlug: string) => void;
}

export const useWelcomeOutletSelection = (): UseWelcomeOutletSelectionReturn => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [showOutletSelection, setShowOutletSelection] = useState(false);
    const { setBarcode, setOutletSlug } = useBarcodeStore();
    const isNavigating = useRef(false);

    const displayOutletSelection = useCallback((): void => {
        setShowOutletSelection(true);
    }, []);

    const hideOutletSelection = useCallback((): void => {
        setShowOutletSelection(false);
    }, []);

    const toggleOutletSelection = useCallback((): void => {
        setShowOutletSelection((prev) => !prev);
    }, []);


    const handleOutletSelect = useCallback((outletSlug: string): void => {
        // Prevent multiple navigations
        if (isNavigating.current) return;
        isNavigating.current = true;

        const table = searchParams.get('table');
        const barcodeOutlet = searchParams.get('outlet');

        // Save barcode data to store if exists
        if (table) {
            setBarcode(table);
        }
        if (barcodeOutlet) {
            setOutletSlug(barcodeOutlet);
        }

        // Build navigation URL with table parameter if it exists
        const path = `/${outletSlug}/home`;
        const navigationUrl = table ? `${path}?table=${table}` : path;

        // Navigate immediately (don't wait for timeout)
        navigate(navigationUrl);

        // Reset flag after navigation
        setTimeout(() => {
            isNavigating.current = false;
        }, 500);
    }, [navigate, setBarcode, setOutletSlug]);

    return {
        showOutletSelection,
        displayOutletSelection,
        hideOutletSelection,
        toggleOutletSelection,
        handleOutletSelect,
    };
};
