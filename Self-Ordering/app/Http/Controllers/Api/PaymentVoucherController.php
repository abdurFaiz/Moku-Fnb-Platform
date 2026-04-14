<?php

namespace App\Http\Controllers\Api;

use App\Models\Order;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Voucher;
use App\Models\UserVoucher;
use Illuminate\Http\Request;
use App\Enums\OrderStatusEnum;
use App\Enums\VoucherTypeEnum;
use App\Helpers\ResponseFormatter;
use App\Enums\VoucherPriceTypeEnum;
use App\Http\Controllers\Controller;
use App\Services\Api\PaymentVoucherService;
use Illuminate\Support\Facades\DB;

class PaymentVoucherController extends Controller
{
    protected PaymentVoucherService $paymentVoucherService;

    public function __construct(PaymentVoucherService $paymentVoucherService)
    {
        $this->paymentVoucherService = $paymentVoucherService;
    }

    public function useVoucher(Outlet $outlet, $voucher_code)
    {

        try {
            DB::beginTransaction();

            $voucher = Voucher::with('voucherProducts.product')->isCanUse()->where('code', $voucher_code)->where('outlet_id', $outlet->id)->first();

            // get order
            $order = Order::where('outlet_id', $outlet->id)
                ->where('user_id', auth()->user()->id)
                ->where('status', OrderStatusEnum::PENDING)
                ->firstOrFail();

            // validate voucher
            $response = $this->paymentVoucherService->validateVoucher($voucher, $order);
            if ($response->getStatusCode() != 200) {
                return $response;
            }

            // use voucher
            $response = $this->paymentVoucherService->useVoucher($voucher, $order, $outlet);
            if ($response->getStatusCode() != 200) {
                return $response;
            }

            $order->load('orderProducts.product', 'orderProducts.orderProductVariants.productAttributeValue');

            DB::commit();

            return ResponseFormatter::success([
                'voucher' => $voucher,
                'order' => $order,
            ], 'Successfully use voucher');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to use voucher');
        }
    }

    public function useInputCodeVoucher(Outlet $outlet, Request $request)
    {
        $validator = validator($request->all(), [
            'voucher_code' => 'required|string|exists:vouchers,code',
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::error($validator->errors(), 'Validation error', 422);
        }

        try {
            DB::beginTransaction();

            $voucher = Voucher::with('voucherProducts.product')->isNotHidden()->isCanUse()->where('code', $request->voucher_code)->where('outlet_id', $outlet->id)->first();

            // get order
            $order = Order::where('outlet_id', $outlet->id)
                ->where('user_id', auth()->user()->id)
                ->where('status', OrderStatusEnum::PENDING)
                ->firstOrFail();

            // validate voucher
            $response = $this->paymentVoucherService->validateVoucher($voucher, $order);
            if ($response->getStatusCode() != 200) {
                return $response;
            }

            // use voucher
            $response = $this->paymentVoucherService->useInputCodeVoucher($voucher, $order, $outlet);
            if ($response->getStatusCode() != 200) {
                return $response;
            }

            $order->load('orderProducts.product', 'orderProducts.orderProductVariants.productAttributeValue');

            DB::commit();

            return ResponseFormatter::success([
                'voucher' => $voucher,
                'order' => $order,
            ], 'Successfully use voucher');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to use voucher');
        }
    }

    public function removeVoucher(Outlet $outlet, Order $order)
    {
        try {
            DB::beginTransaction();

            // remove voucher
            $response = $this->paymentVoucherService->removeVoucher($order, $outlet);
            if ($response->getStatusCode() != 200) {
                return $response;
            }

            DB::commit();

            return ResponseFormatter::success([
                'order' => $order,
            ], 'Successfully remove voucher');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to remove voucher');
        }
    }
}
