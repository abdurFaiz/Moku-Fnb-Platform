import type { Order, OrderProduct } from '@/features/cart/types/Order';
import type { Transaction, TransactionStatus } from '@/features/transaction/types/Transaction';
import { mapBackendStatusToFrontend } from '@/features/transaction/utils/statusMapping';

export interface TransactionDetailUIData {
    id: number;
    status: TransactionStatus;
    title: string;
    date: string;
    code: string;
    transactionInfo: string;
    orderItems: Array<{
        id: string;
        name: string;
        quantity: number;
        price: string;
        details?: Array<{ label: string; price: number }>;
        basePrice?: number;
        totalPrice?: number;
        order_product_variants?: Array<{
            id: number;
            price: number;
            attributeName: string;
            attributeValue: string;
        }>;
    }>;
    serviceFees: Array<{
        id: string;
        name: string;
        price: string;
        details?: Array<{ label: string; price: number }>;
    }>;
    platformFees?: Array<{
        id: string;
        name: string;
        price: string;
        details?: Array<{ label: string; price: number }>;
    }>;
    paymentDetails: Array<{
        id: string;
        label: string;
        value: string;
        highlight?: boolean;
        isDiscount?: boolean;
        dashed?: boolean;
    }>;
    points?: number;
    actions: Array<{ label: string; variant: "outline" | "primary"; size: "lg" }>;
    paymentTimer?: number;
}

export class OrderTransactionMapper {
    private static mapOrderStatus(statusCode: number): TransactionStatus {
        // Use the centralized status mapping utility
        const mappedStatus = mapBackendStatusToFrontend(statusCode);

        // Return mapped status or fallback to pending
        return mappedStatus || 'pending';
    }

    /**
     * Format order products into a readable string
     */
    private static formatOrderItems(orderProducts: OrderProduct[]): string {
        return orderProducts
            .map(product => `${product.quantity}x ${product.product.name}`)
            .join(', ');
    }

    /**
     * Calculate total items from order products
     */
    private static calculateTotalItems(orderProducts: OrderProduct[]): number {
        return orderProducts.reduce((total, product) => total + product.quantity, 0);
    }

    /**
     * Get first product image or default
     */
    private static getProductImage(orderProducts: OrderProduct[]): string {
        const firstProduct = orderProducts[0];
        const rawImage = firstProduct?.product?.image_url || firstProduct?.product?.image;

        if (!rawImage) {
            return '/images/default-product.jpg';
        }

        return rawImage;
    }

    /**
     * Format price to currency string
     */
    private static formatPrice(price: number): string {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    }

    /**
     * Get points message if order is completed and has points
     */
    private static getPointsMessage(order: Order): string | undefined {
        // Only show points for completed orders (status: 4 = COMPLETED)
        if (order.status !== 4) {
            return undefined;
        }

        const customerPoint = order.customer_point;

        if (customerPoint?.type === 0 && customerPoint.point > 0) {
            return `Yeay! Kamu dapat ${customerPoint.point} poin dari transaksi ini`;
        }

        return undefined;
    }

    /**
     * Map single Order to Transaction
     */
    static mapOrderToTransaction(order: Order, outletName: string = 'Outlet'): Transaction {
        const tableNumberId = order.table_number_id !== null && order.table_number_id !== undefined
            ? String(order.table_number_id)
            : '';

        return {
            id: order.id,
            code: order.code,
            status: this.mapOrderStatus(order.status),
            table_number_id: tableNumberId,
            date: new Date(order.created_at).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }),
            created_at: order.created_at,
            cafeName: outletName,
            items: this.formatOrderItems(order.order_products ?? []),
            totalItems: this.calculateTotalItems(order.order_products ?? []),
            totalPrice: this.formatPrice(order.total),
            imageUrl: this.getProductImage(order.order_products ?? []),
            pointsMessage: this.getPointsMessage(order),
            tableName: order.table_number?.number,
        };
    }

    /**
     * Map array of Orders to Transactions
     */
    static mapOrdersToTransactions(orders: Order[], outletName: string = 'Outlet'): Transaction[] {
        return orders.map(order => this.mapOrderToTransaction(order, outletName));
    }

    /**
     * Extract variant names from product variants
     * Groups duplicate variants and shows counts (e.g., "Extra (3x)")
     */
    private static extractVariants(orderProduct: any): string[] {
        if (!orderProduct.order_product_variants || !Array.isArray(orderProduct.order_product_variants)) {
            return [];
        }

        // Count occurrences of each variant
        const variantCounts = new Map<string, number>();

        for (const variant of orderProduct.order_product_variants) {
            const pav = variant.product_attribute_value;
            if (pav?.name) {
                const attributeName = pav.product_attribute?.name || '';
                const valueName = pav.name;
                const contextualName = this.getContextualVariantName(attributeName, valueName);

                variantCounts.set(contextualName, (variantCounts.get(contextualName) || 0) + 1);
            }
        }

        // Build variant strings with counts
        const variants: string[] = [];
        for (const [variantName, count] of variantCounts.entries()) {
            if (count > 1) {
                variants.push(`${variantName} (${count}x)`);
            } else {
                variants.push(variantName);
            }
        }

        return variants;
    }

    /**
     * Extract full product variant details - Maps variant IDs to their attributes
     */
    private static extractProductVariants(orderProduct: any): Array<{
        id: number;
        price: number;
        attributeName: string;
        attributeValue: string;
    }> {
        const variants: Array<{
            id: number;
            price: number;
            attributeName: string;
            attributeValue: string;
        }> = [];

        if (!orderProduct.order_product_variants || !Array.isArray(orderProduct.order_product_variants)) {
            return variants;
        }

        for (const variant of orderProduct.order_product_variants) {
            if (variant.product_attribute_value) {
                const pav = variant.product_attribute_value;

                // Get attribute name from nested product_attribute relationship
                const attributeName = pav?.product_attribute?.name || '';
                const attributeValue = pav.name || '';

                variants.push({
                    id: variant.id,
                    price: Number(variant.price) || 0,
                    attributeName,
                    attributeValue,
                });

            }
        }

        return variants;
    }

    private static getContextualVariantName(attributeName: string, valueName: string): string {
        const normalizedAttribute = typeof attributeName === 'string' ? attributeName.trim() : '';
        const normalizedValue = typeof valueName === 'string' ? valueName.trim() : '';

        if (!normalizedAttribute) {
            return normalizedValue;
        }

        if (!normalizedValue) {
            return normalizedAttribute;
        }

        if (!normalizedValue.toLowerCase().includes(normalizedAttribute.toLowerCase())) {
            return `${normalizedValue} ${normalizedAttribute}`;
        }

        return normalizedValue;
    }

    /**
     * Build item details array with base price and variant prices
     * Shows breakdown of base product price and extras (toppings/add-ons)
     */
    private static buildItemDetails(orderProduct: any): Array<{ label: string; price: number }> {
        const itemDetails: Array<{ label: string; price: number }> = [];

        // Add base product price
        const basePrice = Number(orderProduct.price) || 0;
        itemDetails.push({
            label: orderProduct.product?.name || 'Product',
            price: basePrice
        });

        // Add individual variant prices if they exist
        if (orderProduct.order_product_variants && Array.isArray(orderProduct.order_product_variants)) {
            for (const variant of orderProduct.order_product_variants) {
                if (variant.product_attribute_value?.name) {
                    const variantPrice = Number(variant.price) || 0;
                    const attributeName = variant.product_attribute_value?.product_attribute?.name || '';
                    const valueName = variant.product_attribute_value.name;
                    const contextualName = this.getContextualVariantName(attributeName, valueName);

                    itemDetails.push({
                        label: contextualName,
                        price: variantPrice
                    });
                }
            }
        }

        return itemDetails;
    }

    /**
     * Parse order items from raw order data or transaction fallback
     */
    private static parseOrderItems(transaction: Transaction, rawOrderData: any): any[] {
        const orderItems: any[] = [];
        const orderToProcess = rawOrderData || transaction;
        const hasOrderProducts = orderToProcess?.order_products && Array.isArray(orderToProcess.order_products);


        if (hasOrderProducts) {
            for (const [index, orderProduct] of orderToProcess.order_products.entries()) {

                const variants = this.extractVariants(orderProduct);
                let itemName = orderProduct.product?.name || 'Product';

                if (variants.length > 0) {
                    itemName += ` (${variants.join(', ')})`;
                }

                const basePrice = Number(orderProduct.price) || 0;
                const variantPrice = Number(orderProduct.extra_price) || 0;
                const individualPrice = basePrice + variantPrice;

                // Extract product variants with full details
                const productVariants = this.extractProductVariants(orderProduct);
                const itemDetails = this.buildItemDetails(orderProduct);



                orderItems.push({
                    id: `${index + 1}`,
                    name: itemName,
                    quantity: Number(orderProduct.quantity) || 1,
                    price: `Rp ${individualPrice.toLocaleString('id-ID')}`,
                    details: itemDetails,
                    basePrice: basePrice,
                    totalPrice: individualPrice * Number(orderProduct.quantity),
                    order_product_variants: productVariants,
                });
            }
        } else {
            this.parseFallbackOrderItems(transaction, orderItems);
        }

        return orderItems;
    }

    /**
     * Fallback parser for string-based order items
     */
    private static parseFallbackOrderItems(transaction: Transaction, orderItems: any[]): void {
        const items = transaction.items.split(', ');
        for (const [index, item] of items.entries()) {
            const itemRegex = /(\d+)x\s+(.+)/;
            const match = itemRegex.exec(item);

            if (match) {
                orderItems.push({
                    id: `${index + 1}`,
                    name: match[2],
                    quantity: Number.parseInt(match[1], 10),
                    price: transaction.totalPrice,
                });
            } else {
                orderItems.push({
                    id: `${index + 1}`,
                    name: item,
                    quantity: 1,
                    price: transaction.totalPrice,
                });
            }
        }
    }

    /**
     * Extract payment source values
     */
    private static extractPaymentValues(paymentSource: any): {
        subtotal: number; tax: number; feeService: number; platformFee: number; discount: number; pointsUsed: number;
        pointsValue: number; voucherDiscount: number; total: number; paymentMethod: string;
    } {
        return {
            subtotal: Number(paymentSource?.sub_total) || 0,
            tax: Number(paymentSource?.tax) || 0,
            feeService: Number(paymentSource?.fee_service) || 0,
            platformFee: Number(
                paymentSource?.spinofy_fee ?? paymentSource?.platform_fee ?? 0
            ) || 0,
            discount: Number(paymentSource?.discount) || 0,
            pointsUsed: Number(paymentSource?.points_used) || 0,
            pointsValue: Number(paymentSource?.points_value) || 0,
            voucherDiscount: Number(paymentSource?.voucher_discount) || 0,
            total: Number(paymentSource?.total) || 0,
            paymentMethod: paymentSource?.payment_method?.name || '',
        };
    }

    /**
     * Build service fees array
     */
    private static buildServiceFees(fees: {
        feeService: number;
    }): Array<{ id: string; name: string; price: string; details?: Array<{ label: string; price: number }> }> {
        const { feeService } = fees;

        const serviceDetails = [];
        if (feeService > 0) serviceDetails.push({ label: "Biaya Layanan", price: feeService });

        const totalServiceFees = feeService;

        return [{
            id: "1",
            name: "Biaya Layanan",
            price: `Rp ${totalServiceFees.toLocaleString('id-ID')}`,
            details: serviceDetails
        }];
    }
    private static buildPlatformFees(fees: {
        platformFee: number;
    }): Array<{ id: string; name: string; price: string; details?: Array<{ label: string; price: number }> }> {
        const { platformFee } = fees;

        const serviceDetails = [];
        if (platformFee > 0) serviceDetails.push({ label: "Biaya Platform", price: platformFee });

        const totalPlatformFees = platformFee;

        return [{
            id: "1",
            name: "Biaya Platform",
            price: `Rp ${totalPlatformFees.toLocaleString('id-ID')}`,
            details: serviceDetails
        }];
    }



    /**
     * Build payment details array
     */
    private static buildPaymentDetails(values: {
        subtotal: number; tax: number; discount: number; voucherDiscount: number;
        pointsUsed: number; pointsValue: number; total: number; paymentMethod: string;
    }): Array<{ id: string; label: string; value: string; highlight?: boolean; isDiscount?: boolean; dashed?: boolean }> {
        const { subtotal, tax, discount, voucherDiscount, pointsUsed, pointsValue, total, paymentMethod } = values;

        const paymentDetails: Array<{ id: string; label: string; value: string; highlight?: boolean; isDiscount?: boolean; dashed?: boolean }> = [
            { id: "1", label: "Harga", value: `Rp ${subtotal.toLocaleString('id-ID')}`, dashed: true },
        ];

        let id = 2;

        if (tax > 0) {
            paymentDetails.push({
                id: `${id++}`,
                label: "Pajak",
                value: `Rp ${tax.toLocaleString('id-ID')}`,
                dashed: true
            });
        }

        if (discount > 0) {
            paymentDetails.push({
                id: `${id++}`,
                label: "Diskon",
                value: `Rp ${discount.toLocaleString('id-ID')}`,
                isDiscount: true,
                dashed: true
            });
        }

        if (voucherDiscount > 0) {
            paymentDetails.push({
                id: `${id++}`,
                label: "Diskon Voucher",
                value: `Rp ${voucherDiscount.toLocaleString('id-ID')}`,
                isDiscount: true,
                dashed: true
            });
        }

        if (pointsUsed > 0) {
            paymentDetails.push({
                id: `${id++}`,
                label: `Poin Digunakan (${pointsUsed} poin)`,
                value: `Rp ${pointsValue.toLocaleString('id-ID')}`,
                isDiscount: true,
                dashed: true
            });
        }

        if (paymentMethod) {
            paymentDetails.push({
                id: `${id++}`,
                label: "Metode Pembayaran",
                value: paymentMethod,
                dashed: true
            });
        }

        paymentDetails.push({
            id: `${id}`,
            label: "Total Pembayaran",
            value: `Rp ${total.toLocaleString('id-ID')}`,
            highlight: true
        });

        return paymentDetails;
    }

    /**
     * Build fallback payment details from transaction
     */
    private static buildFallbackPaymentDetails(transaction: Transaction): Array<{ id: string; label: string; value: string; highlight?: boolean; isDiscount?: boolean; dashed?: boolean }> {
        const total = Number.parseInt(transaction.totalPrice.replaceAll(/[^\d]/g, ''), 10);
        const tax = Math.round(total * 0.1);
        const subtotal = total - tax;

        return [
            { id: "1", label: "Harga", value: `Rp ${subtotal.toLocaleString('id-ID')}` },
            { id: "2", label: "Pajak", value: `Rp ${tax.toLocaleString('id-ID')}` },
            {
                id: "3",
                label: "Total Pembayaran",
                value: transaction.totalPrice,
                highlight: true,
            },
        ];
    }

    /**
     * Get actions and title by transaction status
     */
    private static getActionsByStatus(status: TransactionStatus): { title: string; actions: any[] } {
        const actionMap: Record<TransactionStatus, { title: string; actions: any[] }> = {
            pending: {
                title: "Menunggu Pembayaran",
                actions: [
                    { label: "Batalkan Pesanan", variant: "outline", size: "xl" },
                    { label: "Pesan Sekarang", variant: "primary", size: "xl" },
                ],
            },
            "menunggu-konfirmasi": {
                title: "Menunggu Konfirmasi",
                actions: [
                    { label: "Lihat Menu Lain", variant: "outline", size: "xl" },
                    { label: "Bayar Sekarang", variant: "primary", size: "xl" },
                ],
            },
            "dalam-proses": {
                title: "Pesanan Sedang Disiapkan",
                actions: [
                    { label: "Lihat Struk", variant: "outline", size: "xl" },
                    { label: "Lihat Menu Lain", variant: "primary", size: "xl" },
                ],
            },
            selesai: {
                title: "Pesanan Selesai",
                actions: [
                    { label: "Lihat Struk", variant: "outline", size: "xl" },
                    { label: "Lihat Menu Lain", variant: "primary", size: "xl" },
                ],
            },
            dibatalkan: {
                title: "Pesanan Dibatalkan",
                actions: [
                    { label: "Lihat Struk", variant: "outline", size: "xl" },
                    { label: "Lihat Menu Lain", variant: "primary", size: "xl" },
                ],
            },
            ditolak: {
                title: "Pesanan Ditolak",
                actions: [
                    { label: "Lihat Struk", variant: "outline", size: "xl" },
                    { label: "Lihat Menu Lain", variant: "primary", size: "xl" },
                ],
            },
            gagal: {
                title: "Pesanan Gagal",
                actions: [
                    // { label: "Lihat Struk", variant: "outline", size: "xl" },
                    { label: "Lihat Menu Lain", variant: "primary", size: "xl" },
                ],
            },
            expired: {
                title: "Pesanan Kadaluarsa",
                actions: [
                    { label: "Lihat Struk", variant: "outline", size: "xl" },
                    { label: "Lihat Menu Lain", variant: "primary", size: "xl" },
                ],
            },
            challenge: {
                title: "Pesanan Ditantang",
                actions: [
                    { label: "Lihat Struk", variant: "outline", size: "xl" },
                    { label: "Lihat Menu Lain", variant: "primary", size: "xl" },
                ],
            },
        };

        return actionMap[status] || { title: "Pesanan Berhasil", actions: [] };
    }

    static transformDetailTransactionData(
        transaction: Transaction | null,
        rawOrderData: any = null
    ): TransactionDetailUIData | null {
        if (!transaction) return null;

        // Delegate to specialized helper methods
        const orderItems = this.parseOrderItems(transaction, rawOrderData);
        const paymentSource = rawOrderData || transaction;

        let platformFees: Array<{ id: string; name: string; price: string; details?: Array<{ label: string; price: number }> }> = [];
        let serviceFees: Array<{ id: string; name: string; price: string; details?: Array<{ label: string; price: number }> }> = [];
        let paymentDetails: Array<{ id: string; label: string; value: string; highlight?: boolean; isDiscount?: boolean; dashed?: boolean }> = [];

        if (paymentSource && typeof paymentSource.sub_total === 'number') {
            const values = this.extractPaymentValues(paymentSource);
            platformFees = this.buildPlatformFees({
                platformFee: values.platformFee,
            });

            serviceFees = this.buildServiceFees({
                feeService: values.feeService,
            });

            paymentDetails = this.buildPaymentDetails({
                subtotal: values.subtotal,
                tax: values.tax,
                discount: values.discount,
                voucherDiscount: values.voucherDiscount,
                pointsUsed: values.pointsUsed,
                pointsValue: values.pointsValue,
                total: values.total,
                paymentMethod: values.paymentMethod,
            });
        } else {
            paymentDetails = this.buildFallbackPaymentDetails(transaction);
        }

        const { title, actions } = this.getActionsByStatus(transaction.status);
        const points = rawOrderData?.customer_point?.point ? Number(rawOrderData.customer_point.point) : undefined;

        const rawTableIdentifier = transaction.tableName ?? transaction.table_number_id ?? '';
        const normalizedTableIdentifier = typeof rawTableIdentifier === 'string'
            ? rawTableIdentifier.trim()
            : String(rawTableIdentifier ?? '').trim();
        const hasTableIdentifier = normalizedTableIdentifier.length > 0
            && normalizedTableIdentifier.toLowerCase() !== 'null'
            && normalizedTableIdentifier.toLowerCase() !== 'undefined';
        const tableDisplayLabel = hasTableIdentifier
            ? `Meja ${normalizedTableIdentifier}`
            : 'Pickup Cashier';

        return {
            id: transaction.id,
            status: transaction.status,
            title,
            date: transaction.created_at || transaction.date,
            transactionInfo: `${transaction.cafeName} • ${transaction.date}`,
            code: `${transaction.cafeName} • ${tableDisplayLabel} • Order ID #${transaction.code}`,
            orderItems,
            serviceFees,
            platformFees,
            paymentDetails,
            points,
            actions,
            paymentTimer: undefined,
        };
    }
}