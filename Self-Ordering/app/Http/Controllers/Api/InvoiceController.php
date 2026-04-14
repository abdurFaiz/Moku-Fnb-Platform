<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatusEnum;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Outlet;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    public function show(Outlet $outlet, Order $order)
    {
        // check status order if not success or completed then throw exception
        if ($order->status != OrderStatusEnum::SUCCESS && $order->status != OrderStatusEnum::COMPLETED) {
            return ResponseFormatter::warning('Order status is not success or completed', $order, 400);
        }

        $outlet->append('logo_url');

        $order->load([
            'orderProducts.product',
            'orderProducts.orderProductVariants.productAttributeValue.productAttribute',
            'customerPoint',
            'tableNumber'
        ])
            ->append(['status_label']);

        $data = [
            'outlet' => $outlet,
            'order' => $order,
        ];

        return ResponseFormatter::success($data, 'Invoice Order data');
    }
}
