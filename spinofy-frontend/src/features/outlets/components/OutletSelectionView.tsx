import React from 'react';
import { OutletSelection } from '@/features/outlets/components/OutletSelection';

interface OutletSelectionViewProps {
    /**
     * Callback when an outlet is selected
     */
    onOutletSelect: (outletSlug: string) => void;
    /**
     * Callback when back button is clicked
     */
    onBackClick: () => void
    backButtonLabel?: string;
}

const DEFAULT_OUTLET_SELECTION_VIEW_PROPS: Required<Omit<OutletSelectionViewProps, 'onOutletSelect' | 'onBackClick'>> = {
    backButtonLabel: 'Kambali ke login',
};

export const OutletSelectionView: React.FC<OutletSelectionViewProps> = ({
    onOutletSelect,
    onBackClick,
    backButtonLabel = DEFAULT_OUTLET_SELECTION_VIEW_PROPS.backButtonLabel,
}) => {
    return (
        <div className="flex-1 flex min-h-screen py-8 px-4">
            <div className="max-w-md mx-auto flex flex-col justify-between w-full">
                <OutletSelection onOutletSelect={onOutletSelect} />

                {/* Back button */}
                <button
                    onClick={onBackClick}
                    className="w-full font-medium text-body-grey text-center py-2 hover:text-primary-orange transition-colors"
                    aria-label="Back to login"
                >
                    {backButtonLabel}
                </button>
            </div>
        </div>
    );
};
