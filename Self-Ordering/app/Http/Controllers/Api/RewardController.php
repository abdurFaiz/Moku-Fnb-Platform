<?php

namespace App\Http\Controllers\Api;

use App\Enums\CustomerPointTypeEnum;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use Illuminate\Http\Request;

class RewardController extends Controller
{
    public function index(Outlet $outlet)
    {
        $customerPoints = $outlet->customerPoints()
            ->where('user_id', auth()->user()->id)
            ->get();

        $pointCredit = $customerPoints->where('type', CustomerPointTypeEnum::CREDIT)->sum('point');
        $pointDebit = $customerPoints->where('type', CustomerPointTypeEnum::DEBIT)->sum('point');
        $pointBalance = $pointCredit - $pointDebit;

        $vouchers = $outlet->rewards()
            ->with('voucher')
            ->select('id', 'name', 'point', 'outlet_id', 'voucher_id')
            ->get();
        $vouchers->append('valid_until');

        return ResponseFormatter::success([
            'point_balance' => $pointBalance,
            'vouchers' => $vouchers,
        ]);
    }

    public function history(Outlet $outlet)
    {
        $customerPoints = $outlet->customerPoints()
            ->where('user_id', auth()->user()->id)
            ->get();

        return ResponseFormatter::success([
            'customer_points' => $customerPoints,
        ]);
    }
}
