<?php

namespace App\Http\Controllers\Api;

use App\Enums\OrderStatusEnum;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\Voucher;
use App\Services\Api\OutletService;
use App\Services\Api\PaymentService;
use App\Services\Api\PaymentVoucherService;
use App\Services\Api\ProductService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaymentAllController extends Controller
{
    protected PaymentService $paymentService;

    protected ProductService $productService;

    protected OutletService $outletService;

    protected PaymentVoucherService $paymentVoucherService;

    public function __construct(PaymentService $paymentService, ProductService $productService, OutletService $outletService, PaymentVoucherService $paymentVoucherService)
    {
        $this->paymentService = $paymentService;
        $this->productService = $productService;
        $this->outletService = $outletService;
        $this->paymentVoucherService = $paymentVoucherService;
    }

    public function store(Request $request, Outlet $outlet)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|exists:products,id',
            'variant_ids' => 'nullable|array',
            'variant_ids.*' => 'nullable|exists:product_attribute_values,id',
            'quantities' => 'required|array',
            'quantities.*' => 'required|integer|min:1',
            'notes' => 'nullable|array',
            'notes.*' => 'nullable|string|max:255',
            'voucher_code' => 'nullable|string|max:255',
            'voucher_type' => 'nullable|in:1,2', // 1 : voucher punya user, 2: voucher input kode
            'table_number_id' => 'nullable|exists:table_numbers,id',
            'method_id' => 'required|exists:payment_methods,id',
            'selected_product_id' => 'nullable|exists:products,id',
        ]);

        // check outlet schedule
        $outletSchedule = $this->outletService->checkOutletSchedule($outlet);
        if ($outletSchedule !== true) {
            return $outletSchedule;
        }

        try {
            DB::beginTransaction();

            // store order
            foreach ($request->product_ids as $key => $product_id) {
                $productData = $this->productService->findAndValidateProduct($outlet->id, $product_id);

                if (!$productData['success']) {
                    return $productData['response'];
                }

                $product = $productData['product'];
                $variants = $this->productService->getVariants($outlet->id, @$request->variant_ids);

                $order = $this->paymentService->storeProduct($outlet, $product, $variants, $request->quantities[$key], $request->notes[$key]);
            }

            $tableNumber = $this->paymentService->getTableNumber($outlet->id, $request->table_number_id);

            $paymentMethod = $this->paymentService->calculateFeeService($order, $request->method_id);
            if (! $paymentMethod['success']) {
                return $paymentMethod;
            }

            $order = $this->paymentService->calculateOrder($order, $outlet, $paymentMethod, $tableNumber);

            // check voucher
            if (@$request->voucher_code) {
                if ($request->voucher_type == 1) {
                    $voucher = Voucher::with('voucherProducts.product')->isCanUse()->where('code', $request->voucher_code)->where('outlet_id', $outlet->id)->first();
                } else {
                    $voucher = Voucher::with('voucherProducts.product')->isCanUse()->isNotHidden()->where('code', $request->voucher_code)->where('outlet_id', $outlet->id)->first();
                }

                // validate voucher
                $response = $this->paymentVoucherService->validateVoucher($voucher, $order);
                if ($response->getStatusCode() != 200) {
                    DB::rollBack();

                    return $response;
                }

                // if selected_product_id is not null, check selected product is in voucher products
                if ($request->selected_product_id  && @$voucher?->voucherProducts->count() > 0) {
                    $voucherProduct = $voucher->voucherProducts->where('product_id', $request->selected_product_id)->first();
                    if (!$voucherProduct) {
                        return ResponseFormatter::warning('Produk Promo yang dipilih tidak terdaftar di voucher ini', $voucher);
                    }
                }

                // use voucher
                if ($request->voucher_type == 1) {
                    $response = $this->paymentVoucherService->useVoucher($voucher, $order, $outlet, $request->selected_product_id);
                } else {
                    $response = $this->paymentVoucherService->useInputCodeVoucher($voucher, $order, $outlet, $request->selected_product_id);
                }

                if ($response->getStatusCode() != 200) {
                    DB::rollBack();

                    return $response;
                }

                $order->load('orderProducts.product', 'orderProducts.orderProductVariants.productAttributeValue');
            }

            // check after use voucher total order > 0
            if (@$order->total > 0) {
                $payMethod = $paymentMethod['payment_method'];

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
                'is_free' => $order->status == OrderStatusEnum::SUCCESS ? true : false,
            ], 'Successfully store order');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to create order');
        }
    }
}
