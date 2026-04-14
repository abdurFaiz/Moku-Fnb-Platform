export interface PaymentOrderResponse {
    status: string;
    message: string;
    data: {
        outlet: Outlet;
        order: Order;
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
    service_fee_config: number;
    type: number;
    fee_tax: number;
    created_at: string;
    updated_at: string;
    operational_schedules: OperationalSchedule[];
}

export interface OperationalSchedule {
    id: number;
    uuid: string;
    outlet_id: number;
    day: number;
    open_time: string | null;
    close_time: string | null;
    is_open: number;
    created_at: string;
    updated_at: string;
}

export interface Order {
    id: number;
    uuid: string;
    code: string;
    sub_total: number;
    discount: number | null;
    tax: number;
    fee_service: number;
    spinofy_fee: number;
    total_fee_service: number;
    total: number;
    status: number;
    order_number: string | null;
    user_meta_data: UserMetaData;
    user_id: number;
    outlet_id: number;
    voucher_id: number | null;
    payment_method_id: number | null;
    created_at: string;
    updated_at: string;
    table_number_id: number;
    payment_log: PaymentLog;
    table_number: TableNumber;
    order_products?: OrderProduct[];
    outlet?: Outlet;
}

export interface UserMetaData {
    name: string;
    email: string;
    phone: string;
}
// ipaymu payment
export interface PaymentLog {
    id: number
    status: string
    payment_type: string
    raw_response: RawResponse
    order_id: number
    created_at: string
    updated_at: string
}

export interface RawResponse {
    Data: RawResponseData
    Status: number
    Message: string
    Success: boolean
}

export interface RawResponseData {
    Fee: number
    Via: string
    NMID: string
    Note: string | null
    Total: number
    Escrow: boolean
    Channel: string
    Expired: string
    NNSCode: string | null
    QrImage: string
    QrString: string
    SubTotal: number
    Terminal: string
    PaymentNo: string
    SessionId: number
    QrTemplate: string
    PaymentName: string
    ReferenceId: number
    FeeDirection: string
    TransactionId: number
}


// midtrans payment
// export interface PaymentLog {
//     id: number;
//     status: string;
//     payment_type: string;
//     raw_response: RawResponse;
//     order_id: number;
//     created_at: string;
//     updated_at: string;
// }

// export interface RawResponse {
//     actions: PaymentAction[];
//     acquirer: string;
//     currency: string;
//     order_id: string;
//     qr_string: string;
//     expiry_time: string;
//     merchant_id: string;
//     status_code: string;
//     fraud_status: string;
//     gross_amount: string;
//     payment_type: string;
//     status_message: string;
//     transaction_id: string;
//     transaction_time: string;
//     transaction_status: string;
// }

// export interface PaymentAction {
//     url: string;
//     name: string;
//     method: string;
// }

export interface TableNumber {
    id: number;
    number: string;
    qr_code_path: string;
    table_number_location_id: number;
    outlet_id: number;
    created_at: string;
    updated_at: string;
}

export interface OrderProduct {
    id: number
    price: number
    quantity: number
    extra_price: number
    sub_total: number
    total: number
    note: string | null
    meta_data: {
        product_name: string
        product_price: string
    }
    order_id: number
    user_id: number
    product_id: number
    created_at: string
    updated_at: string
}

export interface WebhookNotificationPayload {
    code: string;
}

export interface PaymentSuccessState {
    orderCode: string;
    status: string;
    points?: number;
    orderCompleted?: boolean;
}

export interface PaymentStatusResult {
    order: Order;
    isCompleted: boolean;
    shouldNavigate: boolean;
    navigationPath: string;
    navigationState?: PaymentSuccessState;
}