<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice</title>
    <style>
        @page {
            margin: 0;
        }

        body {
            font-family: 'Times New Roman', serif;
            font-size: 14px;
            color: #000;
            line-height: 1.4;
            background-color: #ffffff;
            /* White background */
            margin: 0;
            padding: 40px;
        }

        .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
        }

        /* Header */
        .header-table {
            width: 100%;
            margin-bottom: 40px;
        }

        .header-table td {
            vertical-align: top;
        }

        .logo-img {
            max-width: 100px;
            max-height: 100px;
        }

        .invoice-title {
            text-align: right;
            font-size: 48px;
            font-weight: normal;
            letter-spacing: 2px;
            text-transform: uppercase;
            margin: 0;
        }

        /* Billed To & Info */
        .info-table {
            width: 100%;
            margin-bottom: 40px;
        }

        .info-table td {
            vertical-align: top;
        }

        .billed-to-label {
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            margin-bottom: 5px;
        }

        .billed-to-content {
            font-size: 14px;
        }

        .invoice-meta {
            text-align: right;
            font-size: 14px;
        }

        /* Items Table */
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .items-table th {
            text-align: left;
            padding: 10px 0;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            font-weight: bold;
        }

        .items-table td {
            padding: 15px 0;
            border-bottom: 1px solid #ddd;
        }

        .items-table th:last-child,
        .items-table td:last-child {
            text-align: right;
        }

        .items-table th:nth-child(2),
        .items-table td:nth-child(2),
        .items-table th:nth-child(3),
        .items-table td:nth-child(3) {
            text-align: center;
        }

        /* Totals */
        .totals-table {
            width: 40%;
            margin-left: auto;
            border-collapse: collapse;
        }

        .totals-table td {
            padding: 8px 0;
            text-align: right;
        }

        .totals-table .label {
            font-weight: bold;
            padding-right: 20px;
        }

        .totals-table .total-row td {
            border-top: 1px solid #000;
            padding-top: 15px;
            font-size: 24px;
            font-weight: bold;
        }

        /* Footer / Thank You */
        .thank-you {
            margin-top: 60px;
            font-size: 24px;
            margin-bottom: 40px;
        }

        /* Footer: Payment Info & Cafe Address */
        .bottom-table {
            width: 100%;
            margin-top: 20px;
        }

        .bottom-table td {
            vertical-align: bottom;
        }

        .payment-info h3 {
            font-size: 18px;
            font-weight: normal;
            margin: 0 0 5px 0;
        }

        .payment-info p {
            margin: 2px 0;
            font-size: 13px;
        }

        .signature-section {
            text-align: right;
        }

        .cafe-name-large {
            font-size: 24px;
            margin-bottom: 5px;
        }

        .cafe-address-line {
            font-size: 12px;
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Header: Logo & INVOICE Text -->
        <table class="header-table">
            <tr>
                <td>
                    @if ($cafe_logo)
                        <img src="{{ $cafe_logo }}" alt="Logo" class="logo-img">
                    @else
                        <!-- Fallback if no logo, just to keep layout -->
                        <div style="font-size: 40px; font-weight: bold;">&</div>
                    @endif
                </td>
                <td>
                    <h1 class="invoice-title">INVOICE</h1>
                </td>
            </tr>
        </table>

        <div style="text-align: center;">
            <h1 class="invoice-title">INVOICE</h1>
        </div>

        <!-- Billed To & Invoice Meta -->
        <table class="info-table">
            <tr>
                <td style="width: 50%;">
                    <div class="billed-to-label">BILLED TO:</div>
                    <div class="billed-to-content">
                        <strong>{{ $order->user->name ?? 'Guest' }}</strong><br>
                        {{ $order->user->email ?? '' }}
                    </div>
                </td>
                <td style="width: 50%;">
                    <div class="invoice-meta">
                        Invoice #{{ str_replace('ORD-', '', $order->code) }}<br>
                        {{ \Carbon\Carbon::parse($order->created_at)->format('d F Y') }}
                    </div>
                </td>
            </tr>
        </table>

        <!-- Items Table -->
        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 40%;">Item</th>
                    <th style="width: 20%;">Quantity</th>
                    <th style="width: 20%;">Unit Price</th>
                    <th style="width: 20%;">Total</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($order->orderProducts as $orderProduct)
                    <tr>
                        <td>
                            {{ $orderProduct->product->name }}
                            <div style="font-size: 11px; color: #666;">
                                {{ $orderProduct->orderProductVariants->map(fn($v) => $v->productAttributeValue->name ?? '')->join(', ') }}
                            </div>
                        </td>
                        <td>{{ $orderProduct->quantity }}</td>
                        <td>Rp {{ number_format($orderProduct->price + $orderProduct->extra_price, 0, ',', '.') }}</td>
                        <td>Rp {{ number_format($orderProduct->total, 0, ',', '.') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>

        <!-- Totals -->
        <table class="totals-table">
            <tr>
                <td class="label">Subtotal</td>
                <td>Rp {{ number_format($order->sub_total, 0, ',', '.') }}</td>
            </tr>
            @if ($order->tax > 0)
                <tr>
                    <td class="label">Tax</td>
                    <td>Rp {{ number_format($order->tax, 0, ',', '.') }}</td>
                </tr>
            @endif
            @if ($order->fee_service > 0)
                <tr>
                    <td class="label">Service Charge</td>
                    <td>Rp {{ number_format($order->fee_service, 0, ',', '.') }}</td>
                </tr>
            @endif
            @if ($order->discount > 0)
                <tr>
                    <td class="label">Discount</td>
                    <td>- Rp {{ number_format($order->discount, 0, ',', '.') }}</td>
                </tr>
            @endif
            <tr class="total-row">
                <td class="label">Total</td>
                <td>Rp {{ number_format($order->total, 0, ',', '.') }}</td>
            </tr>
        </table>

        <!-- Footer: Payment Info & Cafe Address -->
        <table class="bottom-table">
            <tr>
                <td style="width: 50%;">
                    <div class="payment-info">
                        <h3>Thank you!</h3>
                    </div>
                </td>
                <td style="width: 50%;" class="signature-section">
                    <div class="cafe-name-large">{{ $outlet->name }}</div>
                    <div class="cafe-address-line">{{ $outlet->address }}</div>
                </td>
            </tr>
        </table>

        <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #999;">
            Powered by Spinofy
        </div>
    </div>
</body>

</html>
