import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import type { InvoiceOrderResponse } from '@/features/invoice/types/Invoice';
import { DateFormatterUtils } from '@/utils/formatters';
import { resolveOutletLogoUrl, imageUrlToBase64 } from '@/utils/imageFormatters';

const styles = StyleSheet.create({
    page: {
        width: 226.77,
        padding: 16,
        fontSize: 9,
        fontFamily: 'Helvetica',
    },
    outletLogo: {
        width: 64,
        height: 32,
        objectFit: 'contain',
        marginBottom: 0,
        borderRadius: 8,
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    subtitle: {
        fontSize: 8,
        color: '#6b7280',
        marginBottom: 2,
    },
    tableTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    customerInfo: {
        fontSize: 8,
        marginBottom: 2,
        textAlign: 'center',
        width: '100%',
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
        borderStyle: 'dashed',
        marginVertical: 8,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontWeight: 'bold',
        fontSize: 9,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
        width: '100%',
        paddingRight: 0,
    },
    itemName: {
        flex: 1,
        fontSize: 8,
        marginRight: 8,
    },
    itemPrice: {
        fontSize: 8,
        width: 60,
        textAlign: 'right',
        flexShrink: 0,
    },
    itemContainer: {
        marginBottom: 6,
    },
    subItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
        width: '100%',
        paddingLeft: 12,
    },
    subItemName: {
        flex: 1,
        fontSize: 7,
        color: '#6b7280',
        marginRight: 8,
    },
    subItemPrice: {
        fontSize: 7,
        color: '#6b7280',
        width: 60,
        textAlign: 'right',
        flexShrink: 0,
    },
    noteText: {
        fontSize: 7,
        color: '#9ca3af',
        fontStyle: 'italic',
        paddingLeft: 12,
        marginTop: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 8,
    },
    subtotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 10,
        fontWeight: 'bold',
        marginVertical: 6,
    },
    total: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 8,
    },
});

const formatCurrency = (invoiceAmount: string) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(parseFloat(invoiceAmount)).replace('IDR', 'Rp');
};

const getPaymentMethodLabel = (order: any): string => {
    const paymentMethod = order?.payment_method;
    if (paymentMethod) {
        return (
            paymentMethod.name ||
            paymentMethod.channel ||
            paymentMethod.code ||
            'QRIS'
        );
    }

    const methodId = order?.payment_method_id;
    if (methodId !== null && methodId !== undefined) {
        if (Number(methodId) === 1) {
            return 'QRIS';
        }
        return `Metode #${methodId}`;
    }

    return 'QRIS';
};

// const getOutletTypeLabel = (type?: number) => {
//     if (typeof type === 'number') return outletTypeLabel[type as keyof typeof outletTypeLabel] || String(type);
//     return 'Outlet';
// };

export const InvoicePDF = ({ data, outletLogoBase64 }: { data: InvoiceOrderResponse; outletLogoBase64?: string }) => {
    const outlet = data?.data?.outlet ?? {} as any;
    const order = data?.data?.order ?? {} as any;
    const products = Array.isArray(order?.order_products) ? order.order_products : [];
    const tableNameValue = order?.table_number?.number ?? order?.table_number_id ?? '';
    const hasTableValue = tableNameValue !== null && tableNameValue !== undefined && tableNameValue !== '';
    const tableLabel = hasTableValue ? `Table • ${tableNameValue}` : 'Pickup Service';

    return (
        <Document>
            <Page size={{ width: 226.77, height: 3000 }} wrap={false} style={styles.page}>
                <View style={{ marginBottom: 8, alignItems: 'center' }}>
                    {outletLogoBase64 ? (
                        <Image src={outletLogoBase64} style={styles.outletLogo} />
                    ) : null}
                    <Text style={styles.title}>{outlet.name ?? 'Outlet'}</Text>
                    <Text style={styles.subtitle}>{outlet.address ?? ''}</Text>
                    <Text style={styles.subtitle}>{outlet.phone ?? ''}</Text>
                </View>

                <View style={styles.divider} />

                <View style={{ marginBottom: 8, alignItems: 'center' }}>
                    <Text style={styles.tableTitle}>{tableLabel}</Text>
                </View>

                <View style={{ marginBottom: 8 }}>
                    <Text style={[styles.customerInfo]}>Nama Customer: {order?.user_meta_data?.name ?? 'Customer'}</Text>
                    <Text style={[styles.customerInfo]}>{DateFormatterUtils.formatTransactionDate(order?.created_at ?? new Date())}</Text>
                    <Text style={[styles.customerInfo]}>Order ID #{order?.code ?? ''}</Text>
                </View>

                <View style={styles.divider} />

                <View style={{ marginBottom: 8, width: '100%' }}>
                    <View style={styles.itemHeader}>
                        <Text>Pesanan</Text>
                        <Text>Total: {products.length}</Text>
                    </View>

                    <View style={{ height: 8 }} />

                    {products.map((item: any, index: number) => (
                        <View key={index} style={styles.itemContainer}>
                            <View style={styles.item}>
                                <Text style={styles.itemName}>{(item.quantity ?? 1)}x {item.product?.name || item.meta_data?.product_name || 'Product'}</Text>
                                <Text style={styles.itemPrice}>{formatCurrency(String(item.price ?? '0'))}</Text>
                            </View>

                            {/* Variants */}
                            {item.order_product_variants && item.order_product_variants.length > 0 && (
                                <>
                                    {item.order_product_variants.map((variant: any, vIndex: number) => {
                                        const attributeName = variant.product_attribute_value?.product_attribute?.name || '';
                                        const valueName = variant.product_attribute_value?.name || '';
                                        const displayName = attributeName ? `${attributeName}: ${valueName}` : valueName;

                                        return (
                                            <View key={`v-${vIndex}`} style={styles.subItem}>
                                                <Text style={styles.subItemName}>+ {displayName}</Text>
                                                {variant.product_attribute_value?.extra_price > 0 && (
                                                    <Text style={styles.subItemPrice}>{formatCurrency(String(variant.product_attribute_value.extra_price))}</Text>
                                                )}
                                            </View>
                                        );
                                    })}
                                </>
                            )}

                            {/* Additions */}
                            {item.order_product_additions && item.order_product_additions.length > 0 && (
                                <>
                                    {item.order_product_additions.map((addition: any, aIndex: number) => (
                                        <View key={`a-${aIndex}`} style={styles.subItem}>
                                            <Text style={styles.subItemName}>+ {addition.addition?.name}</Text>
                                            <Text style={styles.subItemPrice}>{formatCurrency(String(addition.price))}</Text>
                                        </View>
                                    ))}
                                </>
                            )}

                            {/* Note */}
                            {item.note && (
                                <Text style={styles.noteText}>Note: {item.note}</Text>
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.divider} />

                <View style={{ marginBottom: 8 }}>
                    <View style={styles.summaryRow}>
                        <Text>Sub Total</Text>
                        <Text>{formatCurrency(String(order?.sub_total ?? 0))}</Text>
                    </View>

                    {order?.discount && parseFloat(String(order.discount)) > 0 && (
                        <View style={[styles.summaryRow, { marginTop: 6 }]}>
                            <Text style={{ color: '#ef4444' }}>{order?.voucher?.name ?? 'Discount'}</Text>
                            <Text style={{ color: '#ef4444' }}>-{formatCurrency(String(order.discount))}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.subtotal}>
                    <Text>SUBTOTAL</Text>
                    <Text>{formatCurrency(String((order?.sub_total ?? 0) - (order?.discount ?? 0)))}</Text>
                </View>

                <View style={styles.divider} />

                {/* Service Fee - only show if service_fee_config is 2 */}
                {Number(order?.service_fee_config) === 2 && order?.total_fee_service > 0 && (
                    <>
                        <View style={{ marginBottom: 8 }}>
                            <View style={[styles.summaryRow, { marginTop: 4 }]}>
                                <Text>Biaya Tambahan</Text>
                                <Text>{formatCurrency(String(order?.total_fee_service ?? 0))}</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />
                    </>
                )}

                <View style={styles.total}>
                    <Text>Total Pembayaran</Text>
                    <Text>{formatCurrency(String(order?.total ?? 0))}</Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, fontSize: 8 }}>
                    <Text>Metode Pembayaran</Text>
                    <Text>{getPaymentMethodLabel(order)}</Text>
                </View>

                <View style={{ alignItems: 'center', marginTop: 6 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>Terima Kasih</Text>
                    <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 3 }}>Powered By Spinofy</Text>
                    <Text style={{ fontSize: 8, color: '#6b7280', marginTop: 2 }}>Semoga hari Anda menyenangkan</Text>
                </View>

            </Page>
        </Document>
    );
};

export async function generateInvoiceBlob(data: InvoiceOrderResponse) {
    // Convert outlet logo to base64 before generating PDF
    const outlet = data?.data?.outlet;
    let outletLogoBase64 = '';

    if (outlet?.logo_url) {
        const logoUrl = resolveOutletLogoUrl(outlet.logo_url);
        if (logoUrl) {
            outletLogoBase64 = await imageUrlToBase64(logoUrl);
        }
    }

    const blob = await pdf(<InvoicePDF data={data} outletLogoBase64={outletLogoBase64} />).toBlob();
    return blob;
}

export default InvoicePDF;
