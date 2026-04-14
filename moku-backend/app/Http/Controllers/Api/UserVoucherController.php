<?php

namespace App\Http\Controllers\Api;

use App\Enums\VoucherTypeEnum;
use App\Models\Outlet;
use Illuminate\Http\Request;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Order;

class UserVoucherController extends Controller
{
    public function index(Outlet $outlet)
    {
        $userVouchers = $outlet->userVouchers()
            ->with(['voucher.reward', 'voucher.products'])
            ->where('user_id', auth()->user()->id)
            ->where('is_used', false)
            ->where('expired_at', '>', now())
            ->get()
            ->map(function ($userVoucher) {
                $voucher = $userVoucher->voucher;
                $voucher->expired_at = $userVoucher->expired_at; // Override with user_voucher expiry
                $voucher->is_used = $userVoucher->is_used;
                return $voucher;
            });

        $publicVouchers = $outlet->vouchers()
            ->with(['reward', 'products'])
            ->where('type', VoucherTypeEnum::PUBLIC)
            ->isCanUse()
            ->get();

        $vouchers = $userVouchers->toBase()->merge($publicVouchers);

        $data = [
            'user_vouchers' => $vouchers,
        ];

        return ResponseFormatter::success($data, 'List of my vouchers');
    }

    public function VoucherOrder(Outlet $outlet, Order $order)
    {
        $order->load(['orderProducts']);
        $productIds = $order->orderProducts->pluck('product_id')->toArray();

        $userVouchers = $outlet->userVouchers()
            ->with(['voucher.reward', 'voucher.products'])
            ->where('user_id', auth()->user()->id)
            ->where('is_used', false)
            ->where('expired_at', '>', now())
            ->addCanUsedVoucher($productIds)
            ->get()
            ->map(function ($userVoucher) {
                $voucher = $userVoucher->voucher;
                $voucher->expired_at = $userVoucher->expired_at;
                $voucher->is_used = $userVoucher->is_used;
                $voucher->can_used = $userVoucher->can_used;
                return $voucher;
            });

        $publicVouchers = $outlet->vouchers()
            ->with(['reward', 'products'])
            ->where('type', VoucherTypeEnum::PUBLIC)
            ->isCanUse()
            ->addCanUsedVoucherByProducts($productIds)
            ->get();

        $vouchers = $userVouchers->toBase()->merge($publicVouchers)->sortByDesc('can_used')->values();

        $data = [
            'user_vouchers' => $vouchers,
        ];

        return ResponseFormatter::success($data, 'List of user vouchers can be used');
    }

    public function VoucherProduct(Request $request, Outlet $outlet)
    {
        $request->validate([
            'product_ids' => 'required|array',
            'product_ids.*' => 'required|exists:products,id',
        ]);

        $productIds = $request->product_ids;

        $userVouchers = $outlet->userVouchers()
            ->with(['voucher.reward', 'voucher.products'])
            ->where('user_id', auth()->user()->id)
            ->where('is_used', false)
            ->where('expired_at', '>', now())
            ->addCanUsedVoucher($productIds)
            ->get()
            ->map(function ($userVoucher) {
                $voucher = $userVoucher->voucher;
                $voucher->expired_at = $userVoucher->expired_at;
                $voucher->is_used = $userVoucher->is_used;
                $voucher->can_used = $userVoucher->can_used;
                return $voucher;
            });

        $publicVouchers = $outlet->vouchers()
            ->with(['reward', 'products'])
            ->where('type', VoucherTypeEnum::PUBLIC)
            ->isCanUse()
            ->addCanUsedVoucherByProducts($productIds)
            ->get();

        $vouchers = $userVouchers->toBase()->merge($publicVouchers)->sortByDesc('can_used')->values();

        $data = [
            'user_vouchers' => $vouchers,
        ];

        return ResponseFormatter::success($data, 'List of user vouchers can be used');
    }
}
