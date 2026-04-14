export interface OrderResponse {
  status: string;
  message: string;
  data: {
    outlet?: Outlet;
    order?: Order[];
    payment_methods?: PaymentMethod[];
    message?: string;
    data?: {
      id: number;
      uuid: string;
      code: string;
      sub_total: number;
      tax: number;
      fee_service: number;
      spinofy_fee: string;
      total_fee_service: string;
      total: number;
      status: number;
      user_id: number;
      outlet_id: number;
      user_meta_data: string;
      created_at: string;
      updated_at: string;
      table_number_id?: number;
      status_label: string;
      order_products: OrderProduct[];
    };
    payment_log?: PaymentLog;
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
  type: number;
  fee_tax: number;
  created_at: string;
  updated_at: string;
  operational_schedules?: any[]; // Added based on JSON
}

export interface Order {
  id: number;
  uuid: string;
  code: string;
  sub_total: number;
  discount: string | number;
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
  service_fee_config: number;
  table_number_id: number;
  created_at: string;
  updated_at: string;
  payment_log: PaymentLog;
  table_number: TableNumber;
  order_products?: OrderProduct[];
  customer_point?: CustomerPoint;
  outlet?: Outlet;
}

export interface UserMetaData {
  name: string;
  email: string;
  phone: string;
}

export interface TableNumber {
  id: number;
  number: string;
  qr_code_path: string;
  table_number_location_id: number;
  outlet_id: number;
  created_at: string;
  updated_at: string;
  order_products: OrderProduct[];
  customer_point: CustomerPoint;
  outlet: Outlet;
}

export interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  channel: string;
  percentage_fee: string;
  is_published: number;
  created_at: string;
  updated_at: string;
}

export interface PaymentResponse {
  Status: number
  Success: boolean
  Message: string
  Data: PaymentData
}

export interface PaymentData {
  SessionId: number
  TransactionId: number
  ReferenceId: number
  Via: string
  Channel: string
  PaymentNo: string
  QrString: string
  PaymentName: string
  SubTotal: number
  Fee: number
  Total: number
  FeeDirection: string
  Expired: string
  QrImage: string
  QrTemplate: string
  Terminal: string
  NNSCode: string | null
  NMID: string
  Note: string | null
  Escrow: boolean
}

export interface PaymentLog {
  id: number;
  status_code: number;
  payment_channel: string;
  raw_response: RawResponse;
  order_id: number;
  created_at: string;
  updated_at: string;
}

export interface RawResponse {
  Data: PaymentData;
  Status: number;
  Message: string;
  Success: boolean;
}

export interface OrderProduct {
  id: number;
  price: number;
  quantity: number;
  extra_price: number;
  total: number;
  note: string;
  order_id: number;
  user_id: number;
  product_id: number;
  created_at: string;
  updated_at: string;
  product: Product;
  order_product_variants: OrderProductVariant[];
}

export interface Product {
  id: number;
  uuid: string;
  name: string;
  price: string;
  description: string;
  is_available: number;
  is_recommended: number;
  image: string;
  image_url?: string;
  product_category_id: number;
  outlet_id: number;
  created_at: string;
  updated_at: string;
}

export interface OrderProductVariant {
  id: number;
  price: number;
  order_product_id: number;
  product_attribute_value_id: number;
  created_at: string;
  updated_at: string;
  product_attribute_value: ProductAttributeValue;
}

export interface  ProductAttributeValue {
  id: number;
  name: string;
  extra_price: number;
  product_attribute_id: number;
  outlet_id: number;
  created_at: string;
  updated_at: string;
}

export interface StoreOrderPayload {
  product_id: number;
  variant_id: number[];
  quantity: number;
  note: string;
  table_number_id?: string;
}

export interface CustomerPoint {
  id: number;
  point: number;
  type: number;
  info: string | null;
  user_id: number;
  outlet_id: number;
  pointable_type: string;
  pointable_id: number;
  created_at: string;
  updated_at: string;
}

// Response interface specifically for storeProduct API
export interface StoreProductResponse {
  status: string;
  message: string;
  data: {
    message: string;
    data: Order;
  };
}

// Enhanced Order interface to include all possible fields
export interface EnhancedOrder extends Omit<Order, 'customer_point' | 'discount' | 'table_number_id'> {
  table_number_id?: number;
  platform_fee?: number;
  discount?: number;
  points_used?: number;
  points_value?: number;
  voucher_discount?: number;
  customer_point?: CustomerPoint;
  barcode?: string;
}