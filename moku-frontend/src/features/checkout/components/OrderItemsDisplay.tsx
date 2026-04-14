import React from 'react';
import { FormatUtils } from '@/utils/formatters';
import type { OrderProduct } from '@/features/payment/types/PaymentLog';

interface OrderItemsDisplayProps {
    items: OrderProduct[];
}

export const OrderItemsDisplay: React.FC<OrderItemsDisplayProps> = ({ items }) => {
    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className="w-full rounded-xl border border-gray-100 bg-white/80 px-4 py-3">
            <div className="flex items-center gap-2 text-xs  tracking-wide text-gray-500">
                <span>Order Items</span>
                <span>({items.length})</span>
            </div>
            <div className="mt-2 space-y-2">
                {items.map((item) => (
                    <OrderItemRow key={item.id || Math.random()} item={item} />
                ))}
            </div>
        </div>
    );
};

const OrderItemRow: React.FC<{ item: OrderProduct }> = ({ item }) => {
    // Extract variants from order_product_variants if available (Order.ts type)
    const variants = (item as any)?.order_product_variants || [];
    const hasVariants = variants && variants.length > 0;

    // Format variants as "Attribute: Value" strings
    const formatVariants = (variantList: any[]): string[] => {
        return variantList
            .map((variant: any) => {
                const pav = variant.product_attribute_value;
                if (!pav?.name) return null;

                const attributeName = pav.product_attribute?.name || '';
                const attributeValue = pav.name;

                return attributeName ? `${attributeName}: ${attributeValue}` : attributeValue;
            })
            .filter(Boolean);
    };

    const variantStrings = hasVariants ? formatVariants(variants) : [];

    return (
        <div className="flex flex-col gap-1 rounded-lg bg-white px-3 py-2 border border-body-grey/15">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                    <p className="text-sm font-medium text-title-black">
                        {item.meta_data?.product_name || 'Product'}
                    </p>
                    {variantStrings.length > 0 && (
                        <p className="mt-1 text-xs text-gray-500">
                            {variantStrings.join(', ')}
                        </p>
                    )}
                    {item.note && (
                        <p className="mt-1 text-xs text-gray-500">Note: {item.note}</p>
                    )}
                </div>
                <div className="flex flex-col items-end text-right">
                    <span className="text-xs font-medium text-gray-500">{item.quantity}x</span>
                    <span className="text-sm font-semibold text-title-black">
                        {FormatUtils.formatCurrency(Number(item.total || 0))}
                    </span>
                </div>
            </div>
        </div>
    );
};
