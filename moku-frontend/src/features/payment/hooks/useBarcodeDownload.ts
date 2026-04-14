import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useDownloadBarcodeMutation } from '@/features/payment/hooks/api/useMutationPayment';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';

interface UseBarcodeDownloadProps {
    barcode?: string;
    orderCode?: string | number;
    fileName?: string;
}

/**
 * Hook for handling barcode preview + automatic download
 */
export const useBarcodeDownload = ({
    barcode,
    orderCode,
    fileName,
}: UseBarcodeDownloadProps) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const { outletSlug } = useOutletNavigation();
    const { mutateAsync: downloadBarcode } = useDownloadBarcodeMutation();

    const handleDownloadBarcode = useCallback(async () => {
        if (!barcode) {
            toast.error('Barcode tidak tersedia');
            return;
        }

        setIsDownloading(true);

        try {
            // Fetch the image as a blob from the API
            const blob = await downloadBarcode({
                outletSlug: outletSlug || '',
                url: barcode,
            });

            if (!blob) {
                toast.error('Gagal mengunduh barcode');
                setIsDownloading(false);
                return;
            }

            // Always save as PNG format
            const downloadFileName = fileName || `QRIS-${orderCode}.png`;

            // Create download link from blob
            const objectUrl = URL.createObjectURL(blob);
            const downloadLink = document.createElement('a');
            downloadLink.href = objectUrl;
            downloadLink.download = downloadFileName;
            downloadLink.style.display = 'none';
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            // Revoke object URL after download
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

            toast.success('Barcode berhasil diunduh sebagai gambar');
        } catch (err) {
            console.error('Barcode download error:', err);
            toast.error('Gagal mengunduh barcode. Silakan coba lagi.');
        } finally {
            setIsDownloading(false);
        }
    }, [barcode, orderCode, fileName, outletSlug, downloadBarcode]);

    return {
        handleDownloadBarcode,
        isDownloading,
    };
};