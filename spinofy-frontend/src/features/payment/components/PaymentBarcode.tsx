import React from 'react';
import QRCode from 'react-qr-code';

interface PaymentBarcodeProps {
    barcode?: string;
    qrString?: string;
}

export const PaymentBarcode: React.FC<PaymentBarcodeProps> = ({
    barcode,
    qrString,
}) => (
    <div className="flex flex-col items-center gap-6 mb-8">
        {/* Barcode Container */}
        <div className="w-full max-w-[320px] aspect-square rounded-3xl overflow-hidden bg-white shadow-lg p-4 flex items-center justify-center">
            {qrString ? (
                <div className="w-full h-full p-2">
                    <QRCode
                        value={qrString}
                        size={256}
                        style={{ height: "100%", maxWidth: "100%", width: "100%" }}
                        viewBox={`0 0 256 256`}
                    />
                </div>
            ) : barcode ? (
                <img
                loading='lazy'
                    src={barcode}
                    alt="QRIS Barcode"
                    className="w-full h-full object-contain"
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-2xl">
                    <div className="text-gray-400 text-center">
                        {/* Barcode Icon - QR Code placeholder */}
                        <svg
                            className="w-16 h-16 mx-auto mb-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM6 6h3v3H6V6zm0 9h3v3H6v-3zm9-9h3v3h-3V6z" />
                        </svg>
                        <p className="text-sm">Barcode tidak tersedia</p>
                    </div>
                </div>
            )}
        </div>
    </div>
);
