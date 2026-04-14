<?php

namespace App\Http\Controllers\Outlet;

use App\Enums\OutletServiceFeeConfigEnum;
use App\Enums\OutletTypeEnum;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OutletController extends Controller
{
    protected ImageCompressionService $imageCompressionService;

    public function __construct(ImageCompressionService $imageCompressionService)
    {
        $this->imageCompressionService = $imageCompressionService;
    }

    public function index()
    {
        $outlet_types = [
            '1' => 'Table Service',
            '2' => 'Pickup Cashier',
        ];

        $data = [
            'user' => auth()->user()->load(['outlet.media']),
            'outlet_types' => $outlet_types,
            'service_fee_configs' => [
                [
                    'value' => OutletServiceFeeConfigEnum::PAID_BY_OUTLET,
                    'label' => 'Ditanggung Outlet',
                    'description' => 'Biaya layanan aplikasi ditanggung oleh Anda (Outlet).',
                ],
                [
                    'value' => OutletServiceFeeConfigEnum::PAID_BY_CUSTOMER,
                    'label' => 'Ditanggung Pelanggan',
                    'description' => 'Biaya layanan aplikasi dibebankan kepada Pelanggan pada saat pembayaran.',
                ],
            ],
        ];

        return view('pages.outlets.settings.outlet', $data);
    }

    public function update(Request $request)
    {
        // Strip leading zero from phone number
        $request->merge([
            'phone' => stripZeroPhoneNumber($request->phone),
        ]);

        $request->all();

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|numeric|unique:outlets,phone,'.auth()->user()->outlet->id,
            'address' => 'required|string',
            'map' => 'required|string',
            'fee_tax' => 'nullable|numeric|min:0|max:100',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'preview_outlet' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'type' => 'required|array',
            'type' => 'required|array',
            'type.*' => 'required|in:'.implode(',', OutletTypeEnum::getValues()),
            'service_fee_config' => 'required|in:'.implode(',', OutletServiceFeeConfigEnum::getValues()),
        ]);

        try {
            DB::beginTransaction();

            // check if type is all
            if (in_array(OutletTypeEnum::TABLESERVICE, $request->type) && in_array(OutletTypeEnum::PICKUP, $request->type)) {
                $request->merge([
                    'type' => OutletTypeEnum::ALL,
                ]);
            } else {
                $request->merge([
                    'type' => $request->type[0],
                ]);
            }

            $outlet = Outlet::findOrFail(auth()->user()->outlet->id);

            $outlet->update([
                'name' => $request->name,
                'phone' => $request->phone,
                'address' => $request->address,
                'map' => $request->map,
                'fee_tax' => $request->fee_tax,
                'fee_tax' => $request->fee_tax,
                'type' => $request->type,
                'service_fee_config' => $request->service_fee_config,
            ]);

            if ($request->hasFile('logo') && @$request->logo) {
                $outlet->clearMediaCollection('logo');

                $this->imageCompressionService->compress($request->file('logo'));
                $outlet->addMediaFromRequest('logo')
                    ->toMediaCollection('logo');
            }

            if ($request->hasFile('preview_outlet') && @$request->preview_outlet) {
                $outlet->clearMediaCollection('preview_outlet');

                $this->imageCompressionService->compress($request->file('preview_outlet'));
                $outlet->addMediaFromRequest('preview_outlet')
                    ->toMediaCollection('preview_outlet');
            }

            DB::commit();

            notyf('Pengaturan outlet berhasil diperbarui.');

            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf('Gagal memperbarui pengaturan outlet.');

            return redirect()->back();
        }
    }
}
