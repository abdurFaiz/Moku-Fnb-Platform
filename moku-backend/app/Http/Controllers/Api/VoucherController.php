<?php

namespace App\Http\Controllers\Api;

use App\Enums\CustomerPointTypeEnum;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\CustomerPoint;
use App\Models\Outlet;
use App\Models\Reward;
use App\Models\UserVoucher;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoucherController extends Controller
{
    public function index(Outlet $outlet)
    {
        $vouchers = $outlet->rewards()
            ->with([
                'voucher',
                'voucherProducts'
            ])
            ->whereHas('voucher', function ($query) {
                $query->isCanUse();
            })
            ->select('id', 'name', 'point', 'outlet_id', 'voucher_id')
            ->addTotalUsed()
            ->get();
        $vouchers->append('valid_until');
        $vouchers->append('is_product_reward');

        $data = [
            'vouchers' => $vouchers,
        ];

        return ResponseFormatter::success($data, 'List of vouchers');
    }

    public function claim(Request $request, Outlet $outlet, Reward $reward)
    {
        $voucher = Voucher::isCanUse()->find($reward->voucher_id);

        // check voucher is can use
        if (!$voucher) {
            return ResponseFormatter::warning('Voucher ' . $reward->name . ' tidak dapat di klaim, karena sudah tidak berlaku', $reward->voucher, 400);
        }

        try {
            DB::beginTransaction();

            // check customer point
            $customerPoints = $outlet->customerPoints()
                ->where('user_id', auth()->user()->id)
                ->where('type', CustomerPointTypeEnum::CREDIT)
                ->sum('point');
            $minusCustomerPoints = $outlet->customerPoints()
                ->where('user_id', auth()->user()->id)
                ->where('type', CustomerPointTypeEnum::DEBIT)
                ->sum('point');

            $totalCustomerPoints = $customerPoints - $minusCustomerPoints;


            if (intval($totalCustomerPoints) < intval($reward->point) || $totalCustomerPoints <= 0) {
                $missingPoints = intval($reward->point) - $totalCustomerPoints;
                return ResponseFormatter::error('Poin tidak mencukupi, ayo kumpulkan ' . $missingPoints . ' poin lagi untuk menukar reward ini', 400);
            }

            // create user voucher
            $userVoucher = UserVoucher::create([
                'user_id' => auth()->user()->id,
                'voucher_id' => $reward->voucher_id,
                'outlet_id' => $outlet->id,
                'expired_at' => $reward->valid_until,
            ]);

            // add balance customer point
            $userVoucher->customerPoint()->create([
                'user_id' => auth()->user()->id,
                'outlet_id' => $outlet->id,
                'type' => CustomerPointTypeEnum::DEBIT,
                'point' => $reward->point,
            ]);

            DB::commit();

            // return response
            $data = [
                'user_voucher' => $userVoucher,
            ];

            return ResponseFormatter::success($data, 'Voucher berhasil diklaim');
        } catch (\Throwable $th) {
            DB::rollBack();

            return ResponseFormatter::error($th->getMessage(), 'Failed to claim voucher');
        }
    }

    public function voucherProduct(Outlet $outlet)
    {
        $vouchers = $outlet->rewards()
            ->with([
                'voucher',
                'voucherProducts'
            ])
            ->whereHas('voucher', function ($query) {
                $query->isCanUse()
                    ->where('is_hidden', true);
            })
            ->select('id', 'name', 'point', 'outlet_id', 'voucher_id')
            ->get();
        $vouchers->append('valid_until');
        $vouchers->append('is_product_reward');

        $data = [
            'vouchers' => $vouchers,
        ];

        return ResponseFormatter::success($data, 'List of voucher products');
    }

    public function voucherReward(Outlet $outlet)
    {
        $vouchers = $outlet->rewards()
            ->with([
                'voucher',
                'voucherProducts'
            ])
            ->whereHas('voucher', function ($query) {
                $query->isCanUse()
                    ->where('is_hidden', false);
            })
            ->select('id', 'name', 'point', 'outlet_id', 'voucher_id')
            ->get();
        $vouchers->append('valid_until');
        $vouchers->append('is_product_reward');

        $data = [
            'vouchers' => $vouchers,
        ];

        return ResponseFormatter::success($data, 'List of voucher rewards');
    }
}
