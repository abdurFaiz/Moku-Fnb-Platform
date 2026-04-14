import React from 'react';

interface AuthButtonsSectionProps {
    /**
     * Callback when Google login button is clicked
     */
    onGoogleClick: () => Promise<void>;
    /**
     * Callback when guest login button is clicked
     */
    onGuestClick: () => void;
    /**
     * Whether auth is processing (show loading state)
     * @default false
     */
    isProcessing?: boolean;
    /**
     * Optional error message to display
     */
    errorMessage?: string | null;
    /**
     * Google button label text
     * @default "Lanjutkan dengan Google"
     */
    googleButtonLabel?: string;
    /**
     * Guest button label text
     * @default "Lanjutkan sebagai tamu"
     */
    guestButtonLabel?: string;
    /**
     * Divider label text
     * @default "Atau"
     */
    dividerLabel?: string;
}

const DEFAULT_AUTH_BUTTONS_PROPS: Required<Omit<AuthButtonsSectionProps, 'onGoogleClick' | 'onGuestClick' | 'errorMessage'>> = {
    isProcessing: false,
    googleButtonLabel: 'Lanjutkan dengan Google',
    guestButtonLabel: 'Hanya Lihat Menu',
    dividerLabel: 'Atau',
};

export const AuthButtonsSection: React.FC<AuthButtonsSectionProps> = ({
    onGoogleClick,
    onGuestClick,
    isProcessing = DEFAULT_AUTH_BUTTONS_PROPS.isProcessing,
    errorMessage = null,
    googleButtonLabel = DEFAULT_AUTH_BUTTONS_PROPS.googleButtonLabel,
    guestButtonLabel = DEFAULT_AUTH_BUTTONS_PROPS.guestButtonLabel,
    dividerLabel = DEFAULT_AUTH_BUTTONS_PROPS.dividerLabel,
}) => {
    return (
        <div className="flex flex-col mt-20 gap-6 max-w-md mx-auto w-full">
            {/* Error Message Display */}
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 text-center">{errorMessage}</p>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
                {/* Google Button */}
                <button
                    onClick={onGoogleClick}
                    disabled={isProcessing}
                    className="flex items-center cursor-pointer justify-center gap-3 w-full py-4 px-6 bg-white border-2 border-body-grey/25 transition-colors rounded-4xl text-title-black font-medium text-base hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={googleButtonLabel}
                >
                    <img
                        loading="lazy"
                        src="/icons/icon-google.svg"
                        alt="Google Icon"
                        className="w-6 h-6"
                        width={24}
                        height={24}
                    />
                    <span>{googleButtonLabel}</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-body-grey/40"></div>
                    <span className="text-xs font-normal font-rubik text-body-grey">{dividerLabel}</span>
                    <div className="flex-1 h-px bg-body-grey/40 w-20"></div>
                </div>

                {/* Guest Link */}
                <button
                    onClick={onGuestClick}
                    disabled={isProcessing}
                    className="text-base font-medium cursor-pointer text-body-grey text-center hover:text-body-grey/80 transition-colors py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={guestButtonLabel}
                >
                    {guestButtonLabel}? <span className='text-base text-primary-orange font-medium'>Klik disini</span>
                </button>
            </div>
        </div>
    );
};
