<?php

namespace App\Http\Controllers\Outlet;

use App\Enums\VoucherClaimTypeEnum;
use App\Enums\VoucherPriceTypeEnum;
use App\Enums\VoucherTypeEnum;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Voucher;
use App\Services\VoucherService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VoucherController extends Controller
{
    protected VoucherService $voucherService;

    public function __construct(VoucherService $voucherService)
    {
        $this->voucherService = $voucherService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request, Outlet $outlet)
    {
        $param = $request->query();

        $vouchers = Voucher::where('outlet_id', $outlet->id)
            ->isNotHidden()
            ->filter($param)
            ->with('reward')
            ->latest()
            ->paginate(maxRowParams());

        $data = [
            'vouchers' => $vouchers,
            'voucher_types' => VoucherTypeEnum::asSelectArray(),
            'voucher_claim_types' => VoucherClaimTypeEnum::asSelectArray(),
        ];

        return view('pages.outlets.vouchers.index', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Outlet $outlet)
    {
        $data = [
            'title' => 'Tambah Voucher',
            'action' => route('outlets.vouchers.store', $outlet->slug),
            'products' => Product::where('outlet_id', $outlet->id)->get(),
            'voucher_types' => VoucherTypeEnum::asSelectArray(),
            'voucher_price_types' => VoucherPriceTypeEnum::asSelectArray(),
            'voucher_claim_types' => VoucherClaimTypeEnum::asSelectArray(),
        ];

        return view('pages.outlets.vouchers.form', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Outlet $outlet)
    {
        $rules = $this->voucherService->rules($request, $outlet->id);

        $request->validate($rules);

        try {
            DB::beginTransaction();

            $this->voucherService->store($request, $outlet);

            DB::commit();

            notyf("Voucher $request->name berhasil ditambahkan");
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Voucher $request->name gagal ditambahkan");
            return redirect()->back();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Voucher $voucher)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Outlet $outlet, Voucher $voucher)
    {
        $data = [
            'title' => 'Edit Voucher',
            'action' => route('outlets.vouchers.update', [$outlet->slug, $voucher]),
            'products' => Product::where('outlet_id', $outlet->id)->get(),
            'voucher_types' => VoucherTypeEnum::asSelectArray(),
            'voucher_types' => VoucherTypeEnum::asSelectArray(),
            'voucher_price_types' => VoucherPriceTypeEnum::asSelectArray(),
            'voucher_claim_types' => VoucherClaimTypeEnum::asSelectArray(),
            'voucher' => $voucher->load(['voucherProducts.product']),
        ];

        return view('pages.outlets.vouchers.form', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outlet $outlet, Voucher $voucher)
    {
        $rules = $this->voucherService->rules($request, $outlet->id, $voucher);

        $request->validate($rules);

        try {
            DB::beginTransaction();

            $this->voucherService->update($request, $outlet, $voucher);

            DB::commit();

            notyf("Voucher $request->name berhasil diupdate");
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Voucher $request->name gagal diupdate");
            return redirect()->back();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Outlet $outlet, Voucher $voucher)
    {
        try {
            DB::beginTransaction();

            $this->voucherService->destroy($voucher);

            DB::commit();

            notyf("Voucher $voucher->name berhasil dihapus");
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Voucher $voucher->name gagal dihapus");
            return redirect()->back();
        }
    }
}
