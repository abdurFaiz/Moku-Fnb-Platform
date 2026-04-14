import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import HeaderBar from '@/components/HeaderBar';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRef, useState } from 'react';
// Invoice PDF is now lazy-loaded from InvoicePDFRenderer to avoid bundling @react-pdf/renderer in the main chunk
import { toast } from 'sonner';
import { TableNumberAPI } from '@/features/table/api/tablenum.api';
import { DateFormatterUtils } from '@/utils/formatters';
import { resolveOutletLogoUrl } from '@/utils/imageFormatters';
import { useQueryInvoice } from '@/features/invoice/hooks/api/useQueryInvoice';
import { Spinner } from '@/components/ui/spinner';
import { useQuery } from '@tanstack/react-query';

// InvoicePDFRenderer is lazy-loaded in production to avoid large initial bundles


export default function Invoice() {
    const navigate = useNavigate();
    const { outletSlug, orderCode } = useParams<{ outletSlug: string; orderCode: string }>();
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const parsedOrderCode = orderCode ? Number(orderCode) : null;
    const numericOrderCode = parsedOrderCode !== null && !Number.isNaN(parsedOrderCode)
        ? parsedOrderCode
        : null;

    const {
        data: invoiceData,
        isLoading: loading,
        error,
    } = useQueryInvoice(outletSlug, numericOrderCode, {
        enabled: Boolean(outletSlug && numericOrderCode !== null),
    });

    // defensive shortcuts for nested API data
    const outlet = invoiceData?.data?.outlet ?? (null as any);
    const order = invoiceData?.data?.order ?? (null as any);
    const products = Array.isArray(order?.order_products) ? order.order_products : [];
    const customerName = order?.user_meta_data?.name ?? 'Customer';
    const outletLogoUrl = resolveOutletLogoUrl(outlet?.logo_url);

    // Fetch tables to resolve table name if missing in order data
    const { data: tableData } = useQuery({
        queryKey: ['tableNumbers', outletSlug],
        queryFn: () => TableNumberAPI.getListTableNumber(outletSlug!),
        enabled: !!outletSlug && !!order?.table_number_id && !order?.table_number,
    });

    const rawTableName = order?.table_number?.number
        ?? tableData?.data?.table_numbers?.find((t: any) => t.id === Number(order?.table_number_id))?.number
        ?? order?.table_number_id
        ?? '';

    const hasTableName = rawTableName !== null && rawTableName !== undefined && rawTableName !== '';
    const resolvedTableName = hasTableName ? String(rawTableName) : '';
    const isPickupService = !hasTableName;
    const tableDisplayLabel = isPickupService ? 'Pickup Service' : `Table • ${resolvedTableName}`;

    const handleDownloadPDF = async () => {
        if (!invoiceData?.data || isDownloading) return;

        // Create a clean copy of the data to avoid circular references
        const cleanData = JSON.parse(JSON.stringify({
            status: invoiceData.status,
            message: invoiceData.message,
            data: invoiceData.data
        }));

        // Patch table number for PDF if resolved locally
        if (!cleanData.data.order.table_number && resolvedTableName) {
            cleanData.data.order.table_number = {
                id: Number(order?.table_number_id),
                number: resolvedTableName,
            };
        }

        try {
            setIsDownloading(true);
            // lazy-load PDF renderer to keep main bundle small
            const module = await import('./InvoicePDFRenderer');
            const blob = await module.generateInvoiceBlob(cleanData);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Invoice-${order?.code ?? ''}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Invoice downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Failed to download invoice.');
        } finally {
            setIsDownloading(false);
        }
    };

    const receiptRef = useRef<HTMLDivElement | null>(null);

    const handleShare = async () => {
        if (!invoiceData?.data || isSharing) return;

        setIsSharing(true);

        // Create a clean copy of the data to avoid circular references
        const cleanData = JSON.parse(JSON.stringify({
            status: invoiceData.status,
            message: invoiceData.message,
            data: invoiceData.data
        }));

        // Patch table number for PDF if resolved locally
        if (!cleanData.data.order.table_number && resolvedTableName) {
            cleanData.data.order.table_number = {
                id: Number(order?.table_number_id),
                number: resolvedTableName,
            };
        }

        // Try image-based sharing first (capture the visible receipt DOM)
        try {
            // lazy-load html2canvas to avoid adding it to the initial bundle
            const html2canvasModule = await import('html2canvas');
            const html2canvas = html2canvasModule.default ?? html2canvasModule;

            const el = receiptRef.current;
            if (el && html2canvas) {
                const canvas = await html2canvas(el, { scale: window.devicePixelRatio || 2 });
                const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png', 0.95));

                if (blob) {
                    const fileName = `Invoice-${order?.code ?? ''}.png`;
                    const file = new File([blob], fileName, { type: 'image/png' });

                    // If the browser can share files, share the PNG
                    if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
                        await (navigator as any).share({ files: [file], title: `Invoice ${order?.code ?? ''}`, text: `Invoice for order ${order?.code ?? ''} at ${outlet?.name ?? ''}` });
                        toast.success('Invoice image shared successfully!');
                        setIsSharing(false);
                        return;
                    }

                    // If file sharing isn't available, open image in new tab and trigger download as a fallback
                    try {
                        const imageUrl = URL.createObjectURL(blob);
                        // open in new tab so user can preview / save
                        window.open(imageUrl, '_blank');

                        // also trigger a download automatically for convenience
                        const a = document.createElement('a');
                        a.href = imageUrl;
                        a.download = fileName;
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(imageUrl);

                        toast.success('Invoice image prepared for download (or opened in a new tab).');
                        setIsSharing(false);
                        return; // don't fall back to PDF since we already delivered image
                    } catch (err) {
                        // if even opening/downloading fails, continue to PDF fallback
                        // eslint-disable-next-line no-console
                        console.warn('Opening/downloading image failed — will fallback to PDF', err);
                    }
                }
            }
        } catch (err) {
        }

        try {
            const module = await import('./InvoicePDFRenderer');
            const pdfBlob: Blob = await module.generateInvoiceBlob(cleanData);
            const fileName = `Invoice-${order?.code ?? ''}.pdf`;
            const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

            if ((navigator as any).canShare && (navigator as any).canShare({ files: [file] })) {
                await (navigator as any).share({ files: [file], title: `Invoice ${order?.code ?? ''}`, text: `Invoice for order ${order?.code ?? ''} at ${outlet?.name ?? ''}` });
                toast.success('Invoice PDF shared successfully!');
                setIsSharing(false);
                return;
            }
        } catch (err) {

        }

        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            // As a last resort, show an error
            toast.error('Your browser does not support sharing files or copying the link automatically.');
        } finally {
            setIsSharing(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount).replace('IDR', 'Rp');
    };

    if (loading) {
        return (
            <ScreenWrapper>
                <HeaderBar
                    title="Invoice"
                    showBack={true}
                    onBack={() => navigate(-1)}
                />
                <div className="flex-1 flex items-center justify-center">
                    <p>Loading...</p>
                </div>
            </ScreenWrapper>
        );
    }

    if (error || !invoiceData || invoiceData.status === 'error' || !invoiceData.data) {
        return (
            <ScreenWrapper>
                <HeaderBar
                    title="Invoice"
                    showBack={true}
                    onBack={() => navigate(-1)}
                />
                <div className="flex-1 flex items-center justify-center">
                    <p>{error?.message || invoiceData?.message || 'Invoice not found'}</p>
                </div>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper>
            <HeaderBar
                title="Invoice"
                showBack={true}
                onBack={() => navigate(-1)}
            />

            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                <div
                    ref={receiptRef}
                    className="bg-white p-6 rounded-3xl shadow-sm mx-auto max-w-md text-sm text-gray-800"
                >
                    {/* Header */}
                    <div className=" w-20 h-auto mx-auto mb-5">
                        {outletLogoUrl ? (
                            <img src={outletLogoUrl} alt={`${outlet?.name ?? 'Outlet'} logo`} className="w-full h-full object-contain" />
                        ) : (
                            <div className="w-full h-full rounded-full bg-gray-100" />
                        )}
                    </div>
                    <div className="text-center flex flex-col gap-2 mb-4">
                        <h1 className="text-2xl font-medium">{outlet?.name ?? 'Outlet'}</h1>
                        <div className="space-y-1">
                            <p className="text-gray-700">{outlet?.address ?? ''}</p>
                            <p className="text-gray-700">{outlet?.phone ?? ''}</p>
                        </div>
                    </div>

                    <div className="border-b border-dashed border-gray-300 mb-6"></div>

                    {/* Table Info */}
                    <div className="text-center flex flex-col gap-2 mb-4">
                        <h2 className="text-xl font-medium">{tableDisplayLabel}</h2>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-6 text-gray-700 space-y-1 text-base text-center">
                        <p>Nama Customer: {customerName}</p>
                        <p>{DateFormatterUtils.formatTransactionDate(order?.created_at ?? new Date())}</p>
                        <p>Order ID #{order?.code ?? ''}</p>
                    </div>

                    <div className="border-b border-dashed border-gray-300 mb-6"></div>

                    {/* Items */}
                    <div className="flex flex-col gap-2 mb-4">
                        <div className="flex justify-between mb-2 font-medium">
                            <span className='text-lg'>Pesanan</span>
                            <span className='text-lg'>Total: {products.length}</span>
                        </div>
                        <div className="space-y-3">
                            {products.map((item: any, index: number) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">{item.quantity || 1}x {item.product?.name || item.meta_data?.product_name || 'Product'}</span>
                                        <span className="font-medium">{formatCurrency(parseFloat(String(item.price ?? 0)))}</span>
                                    </div>
                                    {/* Variants */}
                                    {item.order_product_variants && item.order_product_variants.length > 0 && (
                                        <div className="pl-4 space-y-1">
                                            {item.order_product_variants.map((variant: any, vIndex: number) => {
                                                const attributeName = variant.product_attribute_value?.product_attribute?.name || '';
                                                const valueName = variant.product_attribute_value?.name || '';
                                                const displayName = attributeName ? `${attributeName}: ${valueName}` : valueName;
                                                return (
                                                    <div key={vIndex} className="flex justify-between text-xs text-gray-600">
                                                        <span>+ {displayName}</span>
                                                        {variant.product_attribute_value?.extra_price > 0 && (
                                                            <span>{formatCurrency(variant.product_attribute_value.extra_price)}</span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {/* Additions */}
                                    {item.order_product_additions && item.order_product_additions.length > 0 && (
                                        <div className="pl-4 space-y-1">
                                            {item.order_product_additions.map((addition: any, aIndex: number) => (
                                                <div key={aIndex} className="flex justify-between text-xs text-gray-600">
                                                    <span>+ {addition.addition?.name}</span>
                                                    <span>{formatCurrency(addition.price)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {/* Note */}
                                    {item.note && (
                                        <div className="pl-4 text-xs text-gray-500 italic">
                                            Note: {item.note}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-b border-dashed border-gray-300 mb-6"></div>

                    {/* Summary */}
                    <div className="mb-6 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Sub Total</span>
                            <span className="font-medium">{formatCurrency(order?.sub_total ?? 0)}</span>
                        </div>
                        {order?.discount && parseFloat(String(order.discount)) > 0 && (
                            <div className="flex justify-between text-red-500">
                                <span className="w-2/3">{order?.voucher?.name || 'Discount'}</span>
                                <span>-{formatCurrency(parseFloat(String(order.discount)))}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between font-medium text-base mb-6">
                        <span>SUBTOTAL</span>
                        <span>{formatCurrency((order?.sub_total ?? 0) - (order?.discount ?? 0))}</span>
                    </div>

                    <div className="border-b border-dashed border-gray-300 mb-6"></div>

                    {/* Tax & Service Fee - only show if service_fee_config is 2 */}
                    {Number((order as any)?.service_fee_config) === 2 && order?.total_fee_service > 0 && (
                        <>
                            <div className="flex flex-col gap-2">
                                {/* <div className="flex justify-between ">
                                    <span className="text-gray-600">Cafe {outlet?.fee_tax ?? 0}%</span>
                                    <span className="font-medium">{formatCurrency(order?.tax ?? 0)}</span>
                                </div> */}
                                <div className="flex justify-between mb-6">
                                    <span className="text-gray-600">Biaya Tambahan</span>
                                    <span className="font-medium">{formatCurrency(order?.total_fee_service ?? 0)}</span>
                                </div>
                            </div>

                            <div className="border-b border-dashed border-gray-300 mb-6"></div>
                        </>
                    )}

                    {/* Total */}
                    <div className="flex justify-between font-medium text-base mb-1">
                        <span>Total Pembayaran</span>
                        <span>{formatCurrency(order?.total ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700 mb-10">
                        <span>Metode Pembayaran</span>
                        <span className="font-medium">QRIS</span>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col gap-2">
                        <div className="text-center text-2xl font-medium text-medium">
                            Terima Kasih
                        </div>
                        <span className="text-center text-sm text-gray-700">Powered By Spinofy <br /> Semoga hari Anda menyenangkan!</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant={"outline"}
                        size={"xl"}
                        onClick={handleDownloadPDF}
                        disabled={isDownloading || isSharing}
                    >
                        {isDownloading ? (
                            <>
                                <Spinner className="size-4" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download size={18} />
                                Download
                            </>
                        )}
                    </Button>
                    <Button
                        variant={"outline"}
                        size={"xl"}
                        onClick={handleShare}
                        disabled={isDownloading || isSharing}
                    >
                        {isSharing ? (
                            <>
                                <Spinner className="size-4" />
                                Sharing...
                            </>
                        ) : (
                            <>
                                <Share2 size={18} />
                                Share Struk
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </ScreenWrapper>
    );
}
