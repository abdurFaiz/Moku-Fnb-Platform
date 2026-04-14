import { useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useWelcomeAuth } from './useWelcomeAuth';
import { useWelcomeOutletSelection } from '../../outlets/hooks/useWelcomeOutletSelection';

interface UseWelcomePageStateReturn {
    isAuthInitialized: boolean;
    isAuthLoading: boolean;
    isAuthProcessing: boolean;
    isAuthenticated: boolean;
    showOutletSelection: boolean;
    authError: string | null;
    handleGoogleLogin: () => Promise<void>;
    handleGuestLogin: () => void;
    displayOutletSelection: () => void;
    hideOutletSelection: () => void;
    handleOutletSelect: (outletSlug: string) => void;
}

export const useWelcomePageState = (): UseWelcomePageStateReturn => {
    const auth = useWelcomeAuth();
    const outletSelection = useWelcomeOutletSelection();
    const [searchParams] = useSearchParams();
    const barcodeProcessedRef = useRef(false);

    // Get barcode params as stable value to use in effect
    const barcodeParams = useMemo(
        () => ({
            outlet: searchParams.get('outlet'),
            table: searchParams.get('table'),
        }),
        [searchParams]
    );

    // Auto-select outlet from barcode when user becomes authenticated
    useEffect(() => {
        if (auth.isInitialized && auth.isAuthenticated && !barcodeProcessedRef.current) {
            // Mark as processed immediately to prevent re-execution
            barcodeProcessedRef.current = true;

            // If outlet from barcode exists, directly select it (skip outlet selection view)
            if (barcodeParams.outlet) {

                outletSelection.handleOutletSelect(barcodeParams.outlet);
            } else {
                // Otherwise, show outlet selection view for manual selection

                outletSelection.displayOutletSelection();
            }
        }
    }, [auth.isInitialized, auth.isAuthenticated, barcodeParams.outlet]);

    return {
        isAuthInitialized: auth.isInitialized,
        isAuthLoading: auth.isLoading,
        isAuthProcessing: auth.isAuthProcessing,
        isAuthenticated: auth.isAuthenticated,
        showOutletSelection: outletSelection.showOutletSelection,
        authError: auth.authError,
        handleGoogleLogin: auth.handleGoogleLogin,
        handleGuestLogin: auth.handleGuestLogin,
        displayOutletSelection: outletSelection.displayOutletSelection,
        hideOutletSelection: outletSelection.hideOutletSelection,
        handleOutletSelect: outletSelection.handleOutletSelect,
    };
};
