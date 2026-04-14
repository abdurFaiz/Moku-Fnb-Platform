<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Services\Api\OutletService;
use App\Services\Api\PaymentService;
use App\Services\Api\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
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
        // check outlet schedule
        // $outletSchedule = $this->outletService->checkOutletSchedule($outlet);
        // if ($outletSchedule !== true) {
        //     return $outletSchedule;
        // }

        $orders = $outlet->orders()
            ->where('user_id', auth()->user()->id)
            ->withCount(['orderProducts'])
            ->with([
                'orderProducts.product',
                'customerPoint',
                'outlet'
            ])
            ->latest()
            ->get();
        $orders->append(['status_label']);

        // hilangkan select coloum id
        $orders->makeHidden(['id']);


        $data = [
            'orders' => $orders,
        ];

        return ResponseFormatter::success($data, 'List of orders');
    }

    public function show(Outlet $outlet, Order $order)
    {
        // check outlet schedule
        // $outletSchedule = $this->outletService->checkOutletSchedule($outlet);
        // if ($outletSchedule !== true) {
        //     return $outletSchedule;
        // }

        $order->load([
            'orderProducts.product',
            'orderProducts.orderProductVariants.productAttributeValue.productAttribute',
            'customerPoint',
            'tableNumber'
        ])
            ->append(['status_label']);

        $order->makeHidden(['id']);

        $data = [
            'order' => $order,
        ];

        return ResponseFormatter::success($data, 'Detail of order');
    }

    public function store(Request $request, Outlet $outlet)
    {
        $request->validate([
            'code' => 'required|string|exists:orders,code',
        ]);

        // check outlet schedule
        $outletSchedule = $this->outletService->checkOutletSchedule($outlet);
        if ($outletSchedule !== true) {
            return $outletSchedule;
        }

        try {
            DB::beginTransaction();

            $order = $outlet->orders()->with(['orderProducts.orderProductVariants'])->where('code', $request->code)->firstOrFail();

            foreach ($order->orderProducts as $orderProduct) {
                $newProduct = Product::where('outlet_id', $outlet->id)
                    ->findOrFail($orderProduct->product_id);

                // check product available
                $productAvailable = $this->productService->checkProductAvailable($newProduct);
                if ($productAvailable !== true) {
                    return $productAvailable;
                }

                if (count($orderProduct->orderProductVariants) > 0) {
                    $newVariants = ProductAttributeValue::where('outlet_id', $outlet->id)
                        ->whereIn('id', $orderProduct->orderProductVariants->pluck('product_attribute_value_id'))
                        ->get();
                } else {
                    $newVariants = [];
                }

                $newOrder = $this->paymentService->storeProduct($outlet, $newProduct, $newVariants, $orderProduct->quantity, $orderProduct->note);
            }

            DB::commit();


            $newOrder->makeHidden(['id']);

            $data = [
                'order' => $newOrder,
            ];

            return ResponseFormatter::success($data, 'Duplicate order created');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to create duplicate order');
        }
    }
}
