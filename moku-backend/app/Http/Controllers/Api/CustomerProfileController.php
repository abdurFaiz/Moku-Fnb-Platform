<?php

namespace App\Http\Controllers\Api;

use App\Enums\CustomerPointTypeEnum;
use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use Illuminate\Http\Request;

class CustomerProfileController extends Controller
{
    public function __construct(
        protected \App\Services\ImageCompressionService $imageCompressionService
    ) {}

    public function index(Request $request, Outlet $outlet)
    {
        $user = auth()->user()->load(['customerProfile']);
        $user->short_name = $user->shortName;

        $user->append('avatar_url');

        $customerPoints = $outlet->customerPoints()
            ->where('user_id', auth()->user()->id)
            ->get();

        $pointCredit = $customerPoints->where('type', CustomerPointTypeEnum::CREDIT)->sum('point');
        $pointDebit = $customerPoints->where('type', CustomerPointTypeEnum::DEBIT)->sum('point');
        $pointBalance = $pointCredit - $pointDebit;

        // total order
        $totalOrder = $outlet->orders()
            ->where('user_id', auth()->user()->id)
            ->isCompleted()
            ->count();

        // total user voucher
        $totalUserVoucher = $outlet->userVouchers()
            ->where('user_id', auth()->user()->id)
            ->isActive()
            ->count();

        $data = [
            'user' => $user,
            'total_point' => $pointBalance,
            'total_order' => $totalOrder,
            'total_user_voucher' => $totalUserVoucher,
        ];

        return ResponseFormatter::success($data, 'Data customer profile retrieved successfully');
    }

    public function update(Request $request)
    {
        $user = auth()->user()->load(['customerProfile']);

        $request->merge([
            'phone' => normalizePhoneNumber($request->phone),
        ]);

        $validator = validator($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:255|unique:users,phone,' . $user->id,
            'avatar' => 'nullable|image|max:2048',
            // 'date_birth' => 'required|date',
            // 'job' => 'required|string|max:255',
            // 'gender' => 'required|in:1,2',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user->update([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        if ($request->hasFile('avatar')) {
            $this->imageCompressionService->compress($request->file('avatar'));
            $user->clearMediaCollection('avatar');
            $user->addMediaFromRequest('avatar')->toMediaCollection('avatar');
        }

        $dataCustomer = [
            'name' => $request->name,
            'phone' => $request->phone,
        ];

        if (@$request->date_birth) {
            $dataCustomer['date_birth'] = $request->date_birth;
        }

        if (@$request->job) {
            $dataCustomer['job'] = $request->job;
        }

        if (@$request->gender) {
            $dataCustomer['gender'] = $request->gender;
        }

        $user->customerProfile->update($dataCustomer);

        return ResponseFormatter::success([
            'user' => $user,
        ], 'Data customer profile updated successfully');
    }
}
