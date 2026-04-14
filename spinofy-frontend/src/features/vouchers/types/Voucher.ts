import type { VoucherClaimType, VoucherPriceType, VoucherType } from "./VoucherEnum";

export interface VouchersResponse {
    status: string
    message: string
    data: {
        vouchers: UserVoucherItem[]
    }
}

export interface UserVoucherItem {
    id: number
    name: string
    point: number
    outlet_id: number
    voucher_id: number
    valid_until: string
    is_product_reward: boolean;
    voucher: VoucherDetail;
    voucher_products: VoucherProduct[];
}

// type: PUBLIC=1, PRIVATE=2
// price_type: PERCENT=1, FIXED=2
// claim_type: PLATFORM=1, ADMIN=2

export interface VoucherDetail {
    id: number
    name: string
    code: string
    description: string | null
    type: VoucherType
    price_type: VoucherPriceType
    claim_type: VoucherClaimType
    discount_percent: number | null
    discount_fixed: number | null
    min_transaction: number | null
    max_usage: number | null
    start_date: string | null
    end_date: string | null
    is_active: number
    is_hidden: number
    outlet_id: number
    created_at: string
    updated_at: string
}

export interface VoucherProduct {
    id: number
    uuid: string
    name: string
    price: string
    description: string
    is_available: number
    is_published: number
    is_recommended: number
    image: string
    product_category_id: number
    outlet_id: number
    created_at: string
    updated_at: string
    laravel_through_key: number
    image_url: string
}