<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\VoucherProduct;
use Illuminate\Http\Request;

class VoucherProductController extends Controller
{
    public function destroy(Request $request, Outlet $outlet, VoucherProduct $voucherProduct)
    {
        $voucherProduct->delete();

        notyf("Produk voucher berhasil dihapus");
        return redirect()->back();
    }
}
