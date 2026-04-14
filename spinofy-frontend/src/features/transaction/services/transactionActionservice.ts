export class TransactionActionService {
  static handleTransactionAction(
    actionLabel: string,
    navigate: (path: string) => void,
    additionalParams?: Record<string, string>
  ): void {
    try {
      switch (actionLabel) {
        case "Pesan Sekarang":
          this.handleOrderAgainAction(navigate);
          break;
        case "Bayar Sekarang":
          this.handlePaymentAction(navigate, additionalParams);
          break;
        case "Lihat Menu Lain":
        case "Buat Pesanan Baru":
          this.handleOrderAgainAction(navigate);
          break;
        case "Lihat Struk":
          this.handleDigitalReceiptAction(additionalParams);
          break;
        default:
          console.warn(`Unknown action: ${actionLabel}`);
          break;
      }
    } catch (error) {
      console.error('Error handling transaction action:', error);
    }
  }

  private static handlePaymentAction(navigate: (path: string) => void, params?: Record<string, string>): void {
    const paymentUrl = params?.transactionId
      ? `/payment?transactionId=${params.transactionId}`
      : '/payment';

    navigate(paymentUrl);
  }

  private static handleOrderAgainAction(navigate: (path: string) => void): void {
    navigate('/home');
  }

  private static handleDigitalReceiptAction(params?: Record<string, string>): void {
    if (params?.transactionId) {
      // TODO: Implement digital receipt functionality


      // For now, trigger download or show modal
      this.downloadDigitalReceipt(params.transactionId);
    } else {

    }
  }

  private static downloadDigitalReceipt(transactionId: string | number): void {
    // Placeholder for receipt generation
    const receiptData = {
      transactionId,
      timestamp: new Date().toISOString(),
      // Add more receipt data as needed
    };

    // For now, just log the receipt data
    console.log(receiptData);
  }


  static buildDetailUrl(transactionCode: string, status: string): string {
    return `/transaction/detail-transaction?code=${transactionCode}&status=${status}`;
  }

  static getActionVariant(actionLabel: string): "outline" | "primary" {
    const primaryActions = [
      "Pesan Sekarang",
      "Bayar Sekarang",
      "Lacak Pesanan",
      "Lihat Menu Lain",
      "Buat Pesanan Baru"
    ];

    return primaryActions.includes(actionLabel) ? "primary" : "outline";
  }

  static isDestructiveAction(actionLabel: string): boolean {
    const destructiveActions = ["Batalkan Pesanan"];
    return destructiveActions.includes(actionLabel);
  }

  static validateActionPermissions(actionLabel: string, transactionStatus: string): boolean {
    const actionPermissions: Record<string, string[]> = {
      "Batalkan Pesanan": ["menunggu-konfirmasi"],
      "Cek Pembayaran": ["dalam-proses", "menunggu-konfirmasi"],
      "Lihat Struk": ["selesai"],
      "Lihat Menu Lain": ["selesai", "dibatalkan", "ditolak", "dalam-proses"]
    };

    const allowedStatuses = actionPermissions[actionLabel];
    return !allowedStatuses || allowedStatuses.includes(transactionStatus);
  }
}
