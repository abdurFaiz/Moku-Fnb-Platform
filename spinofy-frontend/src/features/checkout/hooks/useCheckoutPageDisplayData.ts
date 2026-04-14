import { useMemo } from 'react';
import type { PaymentDetail, CheckoutSummary } from '@/features/checkout/types/Checkout';
import type { CartItem } from '@/features/cart/stores/cartStore';
import type { FormattedOrderItem } from './useCheckoutItemManagement';

/**
 * Checkout Page Display Data
 * All data formatted for UI rendering
 */
export interface CheckoutPageDisplayData {
    orderItemsData: FormattedOrderItem[];
    paymentDetailsData: PaymentDetail[];
    voucherData: { name: string; savings: number } | null;
    footerData: CheckoutSummary;
    quantities: Record<string, number>;
}

interface CheckoutPageDisplayDataProps {
    items: CartItem[];
    subtotal: number;
    tax: number;
    discount: number;
    finalPrice: number;
    originalPrice: number;
    appliedVoucher: { name: string } | null;
    formatOrderItems: FormattedOrderItem[] | ((items: CartItem[]) => FormattedOrderItem[]);
    paymentMethodFee?: number;
    spinofyFee?: number;
    totalFeeService?: number;
}

/**
 * @param props - Data preparation props
 * @returns Formatted data ready for UI rendering
 */
export const useCheckoutPageDisplayData = (
    props: CheckoutPageDisplayDataProps
): CheckoutPageDisplayData => {
    const {
        items,
        subtotal,
        tax,
        discount,
        finalPrice,
        originalPrice,
        appliedVoucher,
        formatOrderItems,
        paymentMethodFee = 0,
        spinofyFee = 0,
        totalFeeService = 0,
    } = props;

    /**
     * Memoize order items formatting to prevent unnecessary re-renders
     */
    const orderItemsData = useMemo(() => {
        if (typeof formatOrderItems === 'function') {
            return formatOrderItems(items);
        }
        return formatOrderItems;
    }, [items, formatOrderItems]);

    const paymentDetailsData = useMemo((): PaymentDetail[] => {
        const details: PaymentDetail[] = [
            {
                id: '1',
                label: 'Subtotal',
                value: `Rp ${subtotal.toLocaleString('id-ID')}`,
            },
            {
                id: '2',
                label: 'Pajak ',
                value: `Rp ${tax.toLocaleString('id-ID')}`,
            },
        ];

        // Add payment method fee - always show, even if 0
        // details.push({
        //     id: '2.5',
        //     label: 'Biaya Metode Pembayaran',
        //     value: `Rp ${(paymentMethodFee || 0).toLocaleString('id-ID')}`,
        //     dashed: true,
        // });

        // Add spinofy fee - always show, even if 0
        // details.push({
        //     id: '2.6',
        //     label: 'Biaya Spinofy',
        //     value: `Rp ${(spinofyFee || 0).toLocaleString('id-ID')}`,
        //     dashed: true,
        // });

        // Add total fee service - always show, even if 0
        // details.push({
        //     id: '2.7',
        //     label: 'Total Biaya Layanan',
        //     value: `Rp ${(totalFeeService || 0).toLocaleString('id-ID')}`,
        //     dashed: true,
        // });

        // Add discount only if greater than 0 (may come from API or applied voucher)
        if (discount > 0) {
            details.push({
                id: '3',
                label: 'Diskon Voucher',
                value: `- Rp ${discount.toLocaleString('id-ID')}`,
                isDiscount: true,
                dashed: true,
            });
        }

        // Add total
        details.push({
            id: '4',
            label: 'Total Pembayaran',
            value: `Rp ${finalPrice.toLocaleString('id-ID')}`,
            highlight: true,
        });

        return details;
    }, [subtotal, tax, discount, finalPrice, appliedVoucher, paymentMethodFee, spinofyFee, totalFeeService]);

    /**
     * Memoize voucher display data
     */
    const voucherData = useMemo(() => {
        if (discount <= 0) return null;

        return {
            name: appliedVoucher?.name || 'Voucher Applied',
            savings: discount,
        };
    }, [appliedVoucher, discount]);

    /**
     * Memoize footer summary data
     */
    const footerData = useMemo((): CheckoutSummary => ({
        total: finalPrice,
        originalTotal: originalPrice,
        savings: discount,
    }), [finalPrice, originalPrice, discount]);

    /**
     * Memoize item quantities mapping
     */
    const quantities = useMemo(
        () => Object.fromEntries(items.map((item) => [item.id, item.quantity])),
        [items]
    );

    return {
        orderItemsData,
        paymentDetailsData,
        voucherData,
        footerData,
        quantities,
    };
};

export default useCheckoutPageDisplayData;
