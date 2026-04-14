<?php

namespace App\Http\Controllers\Api;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\Voucher;
use Illuminate\Http\Request;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Services\Api\PaymentVoucherService;
use App\Enums\VoucherTypeEnum;

class ProductVoucherController extends Controller
{
    protected PaymentVoucherService $paymentVoucherService;

    public function __construct(PaymentVoucherService $paymentVoucherService)
    {
        $this->paymentVoucherService = $paymentVoucherService;
    }

    public function checkVoucher(Outlet $outlet, Request $request)
    {
        $validator = validator($request->all(), [
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|exists:products,id',
            'quantities' => 'required|array',
            'quantities.*' => 'required|integer|min:1',
            'code' => 'required|string',
            'selected_product_id' => 'nullable|exists:products,id',
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::error($validator->errors(), 'Validation error', 422);
        }

        try {
            // validate quantities array length matches product_ids
            if (count($request->product_ids) != count($request->quantities)) {
                return ResponseFormatter::error('Product IDs and quantities must have the same length', 'Validation error', 422);
            }

            // get products
            $products = Product::whereIn('id', $request->product_ids)
                ->where('outlet_id', $outlet->id)
                ->get();

            // validate all products belong to this outlet
            if ($products->count() != count($request->product_ids)) {
                return ResponseFormatter::error('Some products not found or do not belong to this outlet', 'Product not found', 404);
            }

            // create product quantities map
            $productQuantities = [];
            foreach ($request->product_ids as $index => $productId) {
                $productQuantities[$productId] = $request->quantities[$index];
            }

            // calculate subtotal with quantities
            $subtotal = 0;
            foreach ($products as $product) {
                $quantity = $productQuantities[$product->id] ?? 1;
                $subtotal += $product->price * $quantity;
            }

            // get voucher
            $voucher = Voucher::with('voucherProducts.product')
                ->isCanUse()
                ->where('code', $request->code)
                ->where('outlet_id', $outlet->id)
                ->first();

            // if selected_product_id is not null, check selected product is in voucher products
            if ($request->selected_product_id && @$voucher?->voucherProducts->count() > 0) {
                $voucherProduct = $voucher->voucherProducts->where('product_id', $request->selected_product_id)->first();
                if (!$voucherProduct) {
                    return ResponseFormatter::warning('Produk Promo yang dipilih tidak terdaftar di voucher ini', $voucher);
                }
            }

            // validate voucher
            $productIds = $products->pluck('id')->toArray();
            $response = $this->paymentVoucherService->validateVoucherGeneral($voucher, $productIds, $subtotal);
            if ($response->getStatusCode() != 200) {
                return $response;
            }

            // validate voucher usage limits (max_usage for public, user voucher for private)
            if ($voucher->type == VoucherTypeEnum::PRIVATE) {
                $response = $this->paymentVoucherService->validateVoucherUsage($voucher, auth()->check() ? auth()->user()->id : null);
            } else {
                $response = $this->paymentVoucherService->validateVoucherUsage($voucher);
            }

            if ($response->getStatusCode() != 200) {
                return $response;
            }

            // prepare items for common calculation
            $items = $products->map(function ($p) {
                return (object) [
                    'id' => $p->id,
                    'price' => $p->price
                ];
            });

            // calculate discount
            $discount = $this->paymentVoucherService->calculateDiscountCommon($voucher, $items, $request->selected_product_id);

            // calculate total
            $total = $subtotal - $discount;

            // prepare products with quantities for response
            $productsWithQuantities = $products->map(function ($product) use ($productQuantities) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $productQuantities[$product->id] ?? 1,
                    'total_price' => $product->price * ($productQuantities[$product->id] ?? 1),
                ];
            });

            return ResponseFormatter::success([
                'voucher' => $voucher,
                'products' => $productsWithQuantities,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
            ], 'Voucher berhasil divalidasi');
        } catch (\Throwable $th) {
            return ResponseFormatter::error($th->getMessage(), 'Failed to check voucher');
        }
    }

    public function useInputCodeVoucher(Outlet $outlet, Request $request)
    {
        $validator = validator($request->all(), [
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|exists:products,id',
            'quantities' => 'required|array',
            'quantities.*' => 'required|integer|min:1',
            'code' => 'required|string',
            'selected_product_id' => 'nullable|exists:products,id',
        ]);

        if ($validator->fails()) {
            return ResponseFormatter::error($validator->errors(), 'Validation error', 422);
        }

        try {
            // validate quantities array length matches product_ids
            if (count($request->product_ids) != count($request->quantities)) {
                return ResponseFormatter::error('Product IDs and quantities must have the same length', 'Validation error', 422);
            }

            // get products
            $products = Product::whereIn('id', $request->product_ids)
                ->where('outlet_id', $outlet->id)
                ->get();

            // validate all products belong to this outlet
            if ($products->count() != count($request->product_ids)) {
                return ResponseFormatter::error('Some products not found or do not belong to this outlet', 'Product not found', 404);
            }

            // create product quantities map
            $productQuantities = [];
            foreach ($request->product_ids as $index => $productId) {
                $productQuantities[$productId] = $request->quantities[$index];
            }

            // calculate subtotal with quantities
            $subtotal = 0;
            foreach ($products as $product) {
                $quantity = $productQuantities[$product->id] ?? 1;
                $subtotal += $product->price * $quantity;
            }

            // get voucher (only private/hidden vouchers that need code input)
            $voucher = Voucher::with('voucherProducts.product')
                ->isNotHidden()
                ->isCanUse()
                ->where('code', $request->code)
                ->where('outlet_id', $outlet->id)
                ->first();

            // if selected_product_id is not null, check selected product is in voucher products
            if ($request->selected_product_id && @$voucher?->voucherProducts->count() > 0) {
                $voucherProduct = $voucher->voucherProducts->where('product_id', $request->selected_product_id)->first();
                if (!$voucherProduct) {
                    return ResponseFormatter::warning('Produk Promo yang dipilih tidak terdaftar di voucher ini', $voucher);
                }
            }

            // validate voucher
            $productIds = $products->pluck('id')->toArray();
            $response = $this->paymentVoucherService->validateVoucherGeneral($voucher, $productIds, $subtotal);
            if ($response->getStatusCode() != 200) {
                return $response;
            }

            // validate if voucher is private type
            if ($voucher->type != VoucherTypeEnum::PRIVATE) {
                return ResponseFormatter::warning('Voucher tidak ditemukan', [
                    'voucher' => $voucher,
                ]);
            }

            // prepare items for common calculation
            $items = $products->map(function ($p) {
                return (object) [
                    'id' => $p->id,
                    'price' => $p->price
                ];
            });

            // calculate discount
            $discount = $this->paymentVoucherService->calculateDiscountCommon($voucher, $items, $request->selected_product_id);

            // calculate total
            $total = $subtotal - $discount;

            // prepare products with quantities for response
            $productsWithQuantities = $products->map(function ($product) use ($productQuantities) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'price' => $product->price,
                    'quantity' => $productQuantities[$product->id] ?? 1,
                    'total_price' => $product->price * ($productQuantities[$product->id] ?? 1),
                ];
            });

            return ResponseFormatter::success([
                'voucher' => $voucher,
                'products' => $productsWithQuantities,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
            ], 'Voucher berhasil divalidasi');
        } catch (\Throwable $th) {
            return ResponseFormatter::error($th->getMessage(), 'Failed to check voucher');
        }
    }
}
