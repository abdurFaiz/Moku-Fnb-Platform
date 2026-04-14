<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\ProductAttribute;
use App\Services\ProductAttributeValueService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductAttributeController extends Controller
{
    protected ProductAttributeValueService $valueService;

    public function __construct(ProductAttributeValueService $valueService)
    {
        $this->valueService = $valueService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Outlet $outlet)
    {
        $param = request()->query();

        $productAttributes = ProductAttribute::where('outlet_id', $outlet->id)
            ->filter($param)
            ->withCount('values')
            ->paginate(maxRowParams());

        $outlet = $outlet->loadCount('productAttributes');

        $data = [
            'outlet' => $outlet,
            'productAttributes' => $productAttributes,
        ];

        return view('pages.outlets.products.attributes.index', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Outlet $outlet)
    {
        $outlet = $outlet;

        $data = [
            'action' => route('outlets.product-attributes.store', $outlet->slug),
        ];

        return view('pages.outlets.products.attributes.form', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Outlet $outlet)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'display_type' => 'required|in:1,2',
            'valueName' => 'required|array',
            'valueName.*' => 'required|string|max:255',
            'valueExtraPrice' => 'nullable|array',
            'valueExtraPrice.*' => 'nullable|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $productAttribute = ProductAttribute::create([
                'outlet_id' => $outlet->id,
                'name' => $request->name,
                'display_type' => $request->display_type,
            ]);

            foreach ($request->valueName as $key => $value) {
                $this->valueService->store([
                    'name' => $value,
                    'extra_price' => @$request->valueExtraPrice[$key] ?? 0,
                    'is_default' => $key == $request->default_variant,
                ], $outlet, $productAttribute);
            }

            DB::commit();

            notyf('Atribut produk berhasil ditambahkan');

            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf()->error('Gagal menambahkan atribut produk: ' . $th->getMessage());
            return redirect()->back()->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductAttribute $productAttribute)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Outlet $outlet, ProductAttribute $productAttribute)
    {
        $productAttribute->load('values');

        $data = [
            'action' => route('outlets.product-attributes.update', [$outlet->slug, $productAttribute->id]),
            'productAttribute' => $productAttribute,
        ];

        return view('pages.outlets.products.attributes.form', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outlet $outlet, ProductAttribute $productAttribute)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'display_type' => 'required|in:1,2',
            'valueName' => 'required|array',
            'valueName.*' => 'required|string|max:255',
            'valueExtraPrice' => 'required|array',
            'valueExtraPrice.*' => 'required|numeric|min:0',
        ]);

        try {
            DB::beginTransaction();

            $productAttribute->update([
                'name' => $request->name,
                'display_type' => $request->display_type,
            ]);

            foreach ($request->valueName as $key => $value) {
                $this->valueService->update([
                    'id' => $key,
                    'name' => $value,
                    'extra_price' => $request->valueExtraPrice[$key],
                    'is_default' => $key == $request->default_variant,
                ], $outlet, $productAttribute);
            }

            DB::commit();

            notyf()->success('Atribut produk berhasil diupdate');

            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf()->error('Gagal mengupdate atribut produk: ' . $th->getMessage());
            return redirect()->back()->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Outlet $outlet, ProductAttribute $productAttribute)
    {
        // check if the product attribute has any values
        if ($productAttribute->values()->count() > 0) {
            notyf()->error('Atribut produk tidak dapat dihapus karena memiliki nilai');

            return redirect()->back();
        }

        $productAttribute->delete();

        notyf()->success('Atribut produk berhasil dihapus');

        return redirect()->back();
    }
}
