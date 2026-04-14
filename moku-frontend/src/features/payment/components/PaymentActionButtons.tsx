import React from 'react';
import Button from '@/components/ui/button';
interface PaymentActionButtonsProps {
    onCheckStatus: () => void;
    onDownloadBarcode: () => void;
    isCheckingStatus: boolean;
    isPaid?: boolean;
    isDownloading?: boolean; // added
}

export const PaymentActionButtons: React.FC<PaymentActionButtonsProps> = ({
    onCheckStatus,
    onDownloadBarcode,
    isCheckingStatus,
    isPaid = false,
    isDownloading = false,
}) => (
    <div className="flex flex-col gap-3 my-8">
        <Button
            onClick={onCheckStatus}
            variant="primary"
            size="lg"
            disabled={isCheckingStatus || isPaid}
        >
            {isCheckingStatus ? 'Mengecek...' : isPaid ? 'Pembayaran Selesai' : 'Check Status Pembayaran'}
        </Button>

        <Button
            onClick={onDownloadBarcode}
            variant="outline"
            size="lg"
            disabled={isDownloading}
        >
            {isDownloading ? 'Menyiapkan unduhan...' : 'Unduh Barcode'}
        </Button>
    </div>
);