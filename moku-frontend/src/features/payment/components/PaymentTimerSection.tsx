import React from 'react';

interface PaymentTimerProps {
    minutes: number;
    seconds: number;
    formatTime: (minutes: number, seconds: number) => string;
}

export const PaymentTimerSection: React.FC<PaymentTimerProps> = ({
    minutes,
    seconds,
    formatTime,
}) => (
    <div className="flex flex-col gap-3 mb-8">
        {/* Timer Header */}
        <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                    d="M3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M12 7V12L15 15"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            <h2 className="text-lg font-rubik font-medium text-title-black capitalize">
                Selesaikan Pembayaran
            </h2>
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-3">
            <span className="text-sm font-rubik font-normal text-title-black capitalize">
                Waktu Tersisa
            </span>
            <div className="px-3 py-2 bg-primary-orange/20 rounded-3xl">
                <span className="text-sm font-rubik font-medium text-primary-orange">
                    {formatTime(minutes, seconds)}
                </span>
            </div>
        </div>
    </div>
);
