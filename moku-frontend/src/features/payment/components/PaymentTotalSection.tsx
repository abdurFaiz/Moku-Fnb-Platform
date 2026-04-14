import React from 'react';
import { FormatUtils } from '@/utils/formatters';

interface PaymentTotalProps {
    amount: number;
}

export const PaymentTotalSection: React.FC<PaymentTotalProps> = ({ amount }) => (
    <div className="flex flex-col items-center gap-2">
        <h3 className="text-lg font-rubik font-medium text-title-black capitalize">
            Total Pembayaran
        </h3>
        <div className="text-2xl font-medium text-title-black">
            {/* Using centralized FormatUtils for consistent currency formatting (DRY) */}
            {FormatUtils.formatCurrency(amount)}
        </div>
    </div>
);
