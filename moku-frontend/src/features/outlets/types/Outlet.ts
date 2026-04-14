export const OutletType = {
    TABLE_SERVICE: 1,
    PICKUP_CASHIER: 2,
    BOTH: 3, // Outlet provides both table service and pickup cashier
} as const;

export type OutletTypeValues = typeof OutletType[keyof typeof OutletType];
export interface OutletResponse {
    status: string;
    message: string;
    data: {
        outlets: Outlet[];
    };
}

// Single outlet response (for /outlet/{slug} endpoint)
export interface SingleOutletResponse {
    status: string;
    message: string;
    data: {
        outlet: Outlet;
    };
}

export interface Outlet {
    id: number;
    uuid: string;
    name: string;
    slug: string;
    phone: string | null;
    address: string | null;
    map: string | null;
    is_active: number;
    type: OutletTypeValues;
    service_fee_config: number;
    created_at: string;
    updated_at: string;
    fee_tax: number;
    products_count: number;
    total_point: string;
    logo_url: string;
    products: Product[];
    media: Media[];
    operational_schedules: OperationalSchedule[];
}

export interface Product {
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

export interface Media {
    id: number
    model_type: string
    model_id: number
    uuid: string
    collection_name: string
    name: string
    file_name: string
    mime_type: string
    disk: string
    conversions_disk: string
    size: number
    manipulations: any[]
    custom_properties: any[]
    generated_conversions: any[]
    responsive_images: any[]
    order_column: number
    created_at: string
    updated_at: string
    original_url: string
    preview_url: string
}

