<?php

namespace App\Services;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\Voucher;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use App\Enums\VoucherTypeEnum;
use App\Models\VoucherProduct;
use App\Enums\VoucherClaimTypeEnum;
use App\Enums\VoucherPriceTypeEnum;

class VoucherService
{
    public function rules(Request $request, $outletId, Voucher $voucher = null)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'price_type' => 'required|in:' . implode(',', VoucherPriceTypeEnum::getValues()),
            'claim_type' => 'required|in:' . implode(',', VoucherClaimTypeEnum::getValues()),
            'is_active' => 'nullable|boolean',
        ];

        if ($request->isMethod('post')) {
            $rules['code'] = [
                'required',
                'string',
                'max:255',
                Rule::unique('vouchers')->where(function ($query) use ($outletId) {
                    return $query->where('outlet_id', $outletId);
                }),
            ];
        } else {
            $rules['code'] = [
                'required',
                'string',
                'max:255',
                Rule::unique('vouchers')->ignore($voucher->id)->where(function ($query) use ($outletId) {
                    return $query->where('outlet_id', $outletId);
                }),
            ];
        }

        if (@$request->product_id && count($request->product_id) > 0) {
            $rules['product_id'] = 'required|array';
            $rules['product_id.*'] = 'exists:products,id';
        }

        if ($request->price_type == VoucherPriceTypeEnum::PERCENT) {
            $rules['discount_percent'] = 'required|numeric|min:0|max:100';
        } else {
            $rules['discount_fixed'] = 'required|numeric|min:0';
        }

        if (!@$request->claim_type == VoucherClaimTypeEnum::ADMIN) {
            $rules['type'] = 'required|in:' . implode(',', VoucherTypeEnum::getValues());
            $rules['start_date'] = 'required|date';
            $rules['end_date'] = 'required|date|after_or_equal:start_date';
        }

        return $rules;
    }

    protected function data(Request $request)
    {
        if (@$request->claim_type == VoucherClaimTypeEnum::ADMIN) {
            $request->merge([
                'type' => VoucherTypeEnum::PRIVATE,
                'start_date' => null,
                'end_date' => null,
            ]);
        }

        return $request;
    }

    protected function inputProducts(Request $request, Outlet $outlet, Voucher $voucher)
    {
        if (@$request->product_id && count($request->product_id) > 0) {
            foreach ($request->product_id as $product_id) {
                $product = Product::where('outlet_id', $outlet->id)
                    ->where('id', $product_id)
                    ->firstOrFail();

                VoucherProduct::updateOrCreate([
                    'voucher_id' => $voucher->id,
                    'product_id' => $product->id,
                ]);
            }
        }
    }

    public function store(Request $request, Outlet $outlet)
    {
        $request = $this->data($request);

        $voucher = Voucher::create([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'type' => $request->type,
            'price_type' => $request->price_type,
            'claim_type' => $request->claim_type,
            'discount_percent' => $request->price_type == VoucherPriceTypeEnum::PERCENT ? $request->discount_percent : null,
            'discount_fixed' => $request->price_type == VoucherPriceTypeEnum::FIXED ? $request->discount_fixed : null,
            'min_transaction' => @$request->min_transaction ?? null,
            'max_usage' => @$request->max_usage ?? null,
            'start_date' => @$request->start_date ?? null,
            'end_date' => @$request->end_date ?? null,
            'outlet_id' => $outlet->id,
            'is_active' => $request->is_active ?? false,
        ]);

        $this->inputProducts($request, $outlet, $voucher);
    }

    public function update(Request $request, Outlet $outlet, Voucher $voucher)
    {
        $request = $this->data($request);

        $voucher->update([
            'name' => $request->name,
            'code' => strtoupper($request->code),
            'description' => $request->description,
            'type' => $request->type,
            'price_type' => $request->price_type,
            'claim_type' => $request->claim_type,
            'discount_percent' => $request->price_type == VoucherPriceTypeEnum::PERCENT ? $request->discount_percent : null,
            'discount_fixed' => $request->price_type == VoucherPriceTypeEnum::FIXED ? $request->discount_fixed : null,
            'min_transaction' => @$request->min_transaction,
            'max_usage' => @$request->max_usage ?? null,
            'start_date' => @$request->start_date ?? null,
            'end_date' => @$request->end_date ?? null,
            'is_active' => $request->is_active ?? false,
        ]);

        $this->inputProducts($request, $outlet, $voucher);
    }

    public function destroy(Voucher $voucher)
    {
        VoucherProduct::where('voucher_id', $voucher->id)->delete();
        $voucher->delete();
    }
}
