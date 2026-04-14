import type { VoucherClaimType, VoucherPriceType, VoucherType } from "./VoucherEnum"

export interface UserVoucherListResponse {
    status: string
    message: string
    data: {
        user_vouchers: UserVoucher[]
    }
}

// type: PUBLIC=1, PRIVATE=2
// price_type: PERCENT=1, FIXED=2
// claim_type: PLATFORM=1, ADMIN=2

export interface UserVoucher {
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
    reward: unknown | null
    products: Product[]
    can_used: number
}

export interface Product {
    id: number
    uuid: string
    name: string
    price: string
    description: string | null
    is_available: number
    is_published: number
    is_recommended: number
    image: string
    product_category_id: number
    outlet_id: number
    created_at: string
    updated_at: string
    laravel_through_key: number
}

export interface PayloadCheckVoucher {
    code: string;
    product_ids: number[];
    quantities: number[];
}
