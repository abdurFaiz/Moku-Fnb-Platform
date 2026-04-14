<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusCodeEnum;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Outlet;
use Illuminate\Http\Request;

class CheckoutController extends Controller
{
    public function show(Outlet $outlet, Order $order)
    {
        $order->load([
            'paymentLog' => function ($query) {
                $query->where('status', 'pending');
            },
            'orderProducts',
            'tableNumber'
        ]);

        return ResponseFormatter::success([
            'outlet' => $outlet,
            'order' => $order,
        ], 'Successfully get order');
    }
}
