<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Outlet;
use Illuminate\Http\Request;
use Spatie\LaravelPdf\Facades\Pdf;

class InvoiceController extends Controller
{
    public function generate(Outlet $outlet, Order $order)
    {
        // Load relationships
        $order->load([
            'voucher',
            'orderProducts.product',
            'orderProducts.orderProductVariants.productAttributeValue',
            'user'
        ]);

        // Get logo
        $logoData = null;
        $mimeType = null;
        $logoPath = public_path('assets/images/logo/spinofy_logo_basic.png'); // Adjust path and filename as needed
        if (file_exists($logoPath)) {
            $logoData = base64_encode(file_get_contents($logoPath));
            $mimeType = 'image/png'; // Adjust MIME type based on your dummy image (e.g., 'image/svg+xml', 'image/jpeg')
        }


        // Prepare data for view
        $data = [
            'outlet' => $outlet,
            'order' => $order,
            'cafe_logo' => $logoData ? 'data:image/svg+xml;base64,' . $logoData : null,
        ];

        return Pdf::view('pdf.invoice', $data)
            ->format('a4')
            ->name('invoice-' . $order->order_code . '.pdf');
    }
}
