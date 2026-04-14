export interface InvoiceOrderResponse {
    status: string
    message: string
    data: InvoiceOrderData
}

export interface InvoiceOrderData {
    outlet: Outlet
    order: Order
}

export interface Outlet {
    id: number
    uuid: string
    name: string
    slug: string
    phone: string | null
    address: string | null
    map: string | null
    is_active: number
    type: number
    fee_tax: number
    created_at: string
    updated_at: string
    logo_url: string
    operational_schedules: OperationalSchedule[]
    media: any[]
}

export interface OperationalSchedule {
    id: number
    uuid: string
    outlet_id: number
    day: number
    open_time: string | null
    close_time: string | null
    is_open: number
    created_at: string
    updated_at: string
}

export interface Order {
    id: number
    uuid: string
    code: string
    sub_total: number
    discount: number | null
    tax: number
    fee_service: number
    spinofy_fee: number
    total_fee_service: number
    total: number
    status: number
    order_number: number
    service_fee_config: number
    user_meta_data: UserMetaData
    user_id: number
    outlet_id: number
    voucher_id: number | null
    payment_method_id: number | null
    created_at: string
    updated_at: string
    table_number_id: number
    table_number?: {
        id: number
        number: string
    }
    voucher: any | null
    order_products: OrderProduct[]
}

export interface UserMetaData {
    name: string
    email: string
    phone: string
}

interface OrderProductMetaData {
    product_name: string;
    product_price: string;
}

interface Product {
    id: number;
    uuid: string;
    name: string;
    price: string;
    description: string;
    is_available: number;
    is_published: number;
    is_recommended: number;
    image: string;
    product_category_id: number;
    outlet_id: number;
    created_at: string;
    updated_at: string;
    image_url: string;
}

interface ProductAttribute {
    id: number;
    name: string;
    display_type: number;
    outlet_id: number;
    created_at: string;
    updated_at: string;
}

interface ProductAttributeValue {
    id: number;
    name: string;
    extra_price: number;
    is_default: number;
    product_attribute_id: number;
    outlet_id: number;
    created_at: string;
    updated_at: string;
    product_attribute?: ProductAttribute;
}

interface OrderProductVariant {
    id: number;
    price: number;
    order_product_id: number;
    product_attribute_value_id: number;
    created_at: string;
    updated_at: string;
    product_attribute_value: ProductAttributeValue;
}

interface Addition {
    id: number;
    name: string;
    price: number;
    outlet_id: number;
    created_at: string;
    updated_at: string;
}

interface OrderProductAddition {
    id: number;
    price: number;
    order_product_id: number;
    addition_id: number;
    created_at: string;
    updated_at: string;
    addition: Addition;
}

interface OrderProduct {
    id: number;
    price: number;
    quantity: number;
    extra_price: number;
    sub_total: number;
    total: number;
    note: string | null;
    meta_data: OrderProductMetaData;
    order_id: number;
    user_id: number;
    product_id: number;
    created_at: string;
    updated_at: string;
    product: Product;
    order_product_variants: OrderProductVariant[];
    order_product_additions?: OrderProductAddition[];
}
