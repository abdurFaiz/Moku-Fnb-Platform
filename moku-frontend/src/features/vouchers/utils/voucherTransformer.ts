import type { Voucher } from '@/features/reward/types/Reward';
import type { VoucherCardProps } from '@/components/VoucherCard';

/**
 * Transform Voucher dari API ke VoucherCardProps untuk component display
 */
export const transformVoucherToCardProps = (voucher: Voucher): VoucherCardProps => {
    const now = new Date();
    const expiryDate = new Date(voucher.valid_until);
    const isExpired = expiryDate < now;
    const isActive = voucher.is_active === 1;

    // Determine status
    let status: 'active' | 'cancelled' | 'disabled' | 'expired' = 'active';
    if (isExpired) {
        status = 'expired';
    } else if (!isActive) {
        status = 'disabled';
    }

    // Format expiry date (e.g., "31 Dec 2025")
    const formattedExpiryDate = expiryDate.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });

    // Format discount (e.g., "Diskon 50%")
    const discountText = `Diskon ${voucher.discount_percent}%`;

    // Format min transaction (placeholder - adjust if API provides this info)
    const minTransactionText = ' 100.000';

    return {
        title: voucher.name,
        subtitle: discountText,
        expiryDate: formattedExpiryDate,
        minPoin: minTransactionText,
        status,
    };
};

/**
 * Transform array of Vouchers ke VoucherCardProps
 */
export const transformVouchersToCardProps = (vouchers: Voucher[]): VoucherCardProps[] => {
    return vouchers.map(transformVoucherToCardProps);
};
