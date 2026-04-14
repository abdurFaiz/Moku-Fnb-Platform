<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\OrderProduct;
use Illuminate\Http\Request;
use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusCodeEnum;
use App\Enums\VoucherPriceTypeEnum;
use App\Enums\VoucherTypeEnum;
use App\Helpers\ResponseFormatter;
use Illuminate\Support\Facades\DB;
use App\Models\OrderProductVariant;
use App\Http\Controllers\Controller;
use App\Models\PaymentMethod;
use App\Models\ProductAttributeValue;
use App\Models\UserVoucher;
use App\Models\Voucher;
use App\Services\Api\OutletService;
use App\Services\Api\PaymentService;
use App\Services\Api\ProductService;

class PaymentController extends Controller
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

    public function index(Outlet $outlet)
    {
        $order = Order::with(['orderProducts.product', 'orderProducts.orderProductVariants.productAttributeValue'])
            ->where('outlet_id', $outlet->id)
            ->where('user_id', auth()->user()->id)
            ->where('status', OrderStatusEnum::PENDING)
            ->get();
        $order->append('status_label');

        $paymentMethods = PaymentMethod::isPublished()->get();

        return ResponseFormatter::success([
            'outlet' => $outlet,
            'order' => $order,
            'payment_methods' => $paymentMethods,
        ], 'Successfully get order');
    }

    public function store(Request $request, Outlet $outlet, Order $order)
    {
        $validator = validator($request->all(), [
            'order_product_ids' => 'required|array',
            'order_product_ids.*' => 'required|exists:order_products,id',
            'quantities' => 'required|array',
            'quantities.*' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::error($validator->errors(), 'Validation error', 422);
        }

        // check outlet schedule
        $outletSchedule = $this->outletService->checkOutletSchedule($outlet);
        if ($outletSchedule !== true) {
            return $outletSchedule;
        }

        // filter order with outlet id
        $order->where('outlet_id', $outlet->id);

        if (!@$order) {
            return ResponseFormatter::warning('order not found', $order, 404);
        }

        // order status check
        if ($order->status != OrderStatusEnum::PENDING) {
            return ResponseFormatter::warning('order status not pending', $order, 400);
        }

        try {
            DB::beginTransaction();

            // update order product quantity
            foreach ($request->order_product_ids as $key => $orderProductId) {
                $qty = $request->quantities[$key];
                $orderProduct = OrderProduct::where('id', $orderProductId)->firstOrFail();

                // get total product price
                $totalProduct = $orderProduct->price * $qty;
                $totalExtraPrice = $orderProduct->extra_price * $qty;
                $totalPrice = $totalProduct + $totalExtraPrice;

                $orderProduct->update([
                    'quantity' => $qty,
                    'total' => $totalPrice,
                ]);
            }

            // get all order product
            $orderProducts = $order->orderProducts()->get();

            $subTotal = $orderProducts->sum('total');
            $tax = ($outlet->fee_tax / 100) * $subTotal;
            $totalPrice = $subTotal + $tax;

            // update total order price
            $order->update([
                'sub_total' => $subTotal,
                'tax' => $tax,
                'total' => $totalPrice,
            ]);

            $order->load([
                'orderProducts.product',
                'orderProducts.orderProductVariants.productAttributeValue',
            ]);

            DB::commit();

            return ResponseFormatter::success([
                'order' => $order,
            ], 'Successfully store quantity order');
        } catch (\Throwable $th) {
            DB::rollBack();
            return ResponseFormatter::error($th->getMessage(), $th->getLine(), 500);
        }
    }

    public function update(Request $request, Outlet $outlet, Order $order)
    {
        $request->validate([
            'method_id' => 'required',
            'table_number_id' => 'nullable|exists:table_numbers,id',
        ]);

        $order->where('outlet_id', $outlet->id);

        if (!@$order) {
            return ResponseFormatter::warning('order not found', $order, 404);
        }

        // check outlet schedule
        $outletSchedule = $this->outletService->checkOutletSchedule($outlet);
        if ($outletSchedule !== true) {
            return $outletSchedule;
        }

        // order status check
        if ($order->status != OrderStatusEnum::PENDING) {
            return ResponseFormatter::warning('order status not pending', $order, 400);
        }

        try {
            DB::beginTransaction();

            $tableNumber = $this->paymentService->getTableNumber($outlet->id, $request->table_number_id);

            $paymentMethod = $this->paymentService->calculateFeeService($order, $request->method_id);
            if (!$paymentMethod['success']) {
                return $paymentMethod;
            }

            $order = $this->paymentService->calculateOrder($order, $outlet, $paymentMethod, $tableNumber);

            $payMethod = $paymentMethod['payment_method'];

            if ($order->total > 0) {
                $processPayment = $this->paymentService->processMidtransPayment($request, $order, $payMethod);

                if ($processPayment['success']) {
                    $payment = $processPayment['payment'];
                } else {
                    DB::rollBack();

                    return $processPayment['response'];
                }
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

    public function destroy(Outlet $outlet, Order $order)
    {
        $order->where('outlet_id', $outlet->id);

        if (!@$order) {
            return ResponseFormatter::warning('order not found', $order, 404);
        }

        // check order status
        if ($order->status != OrderStatusEnum::PENDING) {
            return ResponseFormatter::warning('Order status is not pending', [
                'order' => $order,
            ]);
        }

        try {
            DB::beginTransaction();

            // delete order product variant
            $order->orderProducts()->delete();

            // delete order
            $order->delete();

            DB::commit();

            // return order
            return ResponseFormatter::success([
                'order' => $order,
            ], 'Successfully delete order');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to delete order');
        }
    }
}
