<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\ProductCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductCategoryController extends Controller
{
    public function destroy(Outlet $outlet, string $id)
    {
        try {
            DB::beginTransaction();

            $productCategory = ProductCategory::findOrFail($id);

            // check products
            if ($productCategory->products()->count() > 0) {
                notyf('Kategori produk memiliki produk, tidak dapat dihapus.');
                return redirect()->back();
            }

            $productCategory->delete();

            DB::commit();

            notyf('Kategori produk berhasil dihapus.');
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf('Gagal menghapus kategori produk.');
            return redirect()->back();
        }
    }
}
