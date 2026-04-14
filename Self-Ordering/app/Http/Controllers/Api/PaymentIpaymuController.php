<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatusEnum;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Outlet;
use App\Services\Api\OutletService;
use App\Services\Api\PaymentService;
use App\Services\Api\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentIpaymuController extends Controller
{
    protected PaymentService $paymentService;

    protected ProductService $productService;

    protected OutletService $outletService;

    public function __construct(PaymentService $paymentService, ProductService $productService, OutletService $outletService)
    {
        $this->paymentService = $paymentService;
        $this->productService = $productService;
        $this->outletService = $outletService;
    }

    public function update(Request $request, Outlet $outlet, Order $order)
    {
        $request->validate([
            'method_id' => 'required',
            'table_number_id' => 'nullable|exists:table_numbers,id',
        ]);

        // check outlet schedule
        $outletSchedule = $this->outletService->checkOutletSchedule($outlet);
        if ($outletSchedule !== true) {
            return $outletSchedule;
        }

        // order status check
        if ($order->status != OrderStatusEnum::PENDING) {
            return ResponseFormatter::warning('order status not pending', $order, 400);
        }

        // prevent concurrent processing of the same order (id or code)
        $lockKey = 'processing_order_' . $order->id;
        if (! cache()->add($lockKey, true, 10)) { // 10-second lock
            return ResponseFormatter::warning('Order is currently being processed', null, 429);
        }

        try {
            DB::beginTransaction();

            $tableNumber = $this->paymentService->getTableNumber($outlet->id, $request->table_number_id);

            $paymentMethod = $this->paymentService->calculateFeeService($order, $request->method_id);
            if (! $paymentMethod['success']) {
                return $paymentMethod;
            }

            $order = $this->paymentService->calculateOrder($order, $outlet, $paymentMethod, $tableNumber);

            $payMethod = $paymentMethod['payment_method'];

            if ($order->total > 0) {
                $processPayment = $this->paymentService->processIpaymuPayment($order, $payMethod);

                if (! $processPayment['success']) {
                    DB::rollBack();

                    return $processPayment['response'];
                }

                $payment = $processPayment['payment'];
            } else {
                $this->paymentService->handleFreeOrder($order);

                $payment = null;
            }

            DB::commit();

            return ResponseFormatter::success([
                'order' => $order,
                'payment' => $payment,
            ], 'Successfully store order');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to store order');
        }
    }
}
