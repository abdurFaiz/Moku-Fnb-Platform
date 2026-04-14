export type TransactionStatus =
  | "pending"                    // Status 1: Pending
  | "menunggu-konfirmasi"        // Status 2: Waiting for confirmation  
  | "dalam-proses"               // Status 3: Being prepared
  | "selesai"                    // Status 4: Completed
  | "gagal"                      // Status 5: Failed
  | "expired"                    // Status 6: Expired
  | "challenge"                  // Status 7: Challenge
  | "dibatalkan"                 // Status 8: Cancelled
  | "ditolak";                   // Status 9: Rejected

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: string;
}

export interface PaymentDetail {
  id: string;
  label: string;
  value: string;
  isDiscount?: boolean;
  dashed?: boolean;
  highlight?: boolean;
}

export interface TransactionAction {
  label: string;
  variant: "outline" | "primary";
  size: "lg";
}

export interface Transaction {
  id: number;
  code: string;
  status: TransactionStatus;
  date: string;
  created_at: string;
  table_number_id: string;
  cafeName: string;
  items: string;
  totalItems: number;
  totalPrice: string;
  imageUrl: string;
  pointsMessage?: string;
  tableName?: string;
}

export interface TransactionDetail {
  id: number;
  status: TransactionStatus;
  title: string;
  date: string;
  transactionInfo: string;
  orderItems: OrderItem[];
  paymentDetails: PaymentDetail[];
  points?: number;
  actions: TransactionAction[];
  paymentTimer?: number; // minutes for countdown
}

export interface FilterOption {
  value: TransactionStatus | "semua";
  label: string;
}

export interface TransactionQuery {
  status?: TransactionStatus | "semua";
  limit?: number;
  offset?: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}
