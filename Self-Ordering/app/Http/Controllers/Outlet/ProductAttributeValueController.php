<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Services\ProductAttributeValueService;
use Illuminate\Http\Request;

class ProductAttributeValueController extends Controller
{
    protected ProductAttributeValueService $valueService;

    public function __construct(ProductAttributeValueService $valueService)
    {
        $this->valueService = $valueService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Outlet $outlet, ProductAttribute $productAttribute)
    {
        $param = request()->query();
        
        $attribute = $productAttribute;
        $values = ProductAttributeValue::where('product_attribute_id', $attribute->id)
            ->filter($param)
            ->paginate(maxRowParams());

        $data = [
            'attribute' => $attribute,
            'values' => $values,
        ];
        
        return view('pages.outlets.products.attributes.values.index', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Outlet $outlet, ProductAttribute $productAttribute)
    {
        $attribute = $productAttribute;

        $data = [
            'action' => route('outlets.product-attributes.values.store', [$outlet, $attribute]),
            'attribute' => $attribute,
        ];
        
        return view('pages.outlets.products.attributes.values.form', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Outlet $outlet, ProductAttribute $productAttribute)
    {
        $attribute = $productAttribute;

        $rules = $this->valueService->rules();

        $request->validate($rules);

        $this->valueService->store($request, $outlet, $attribute);

        notyf('Atribut nilai berhasil ditambahkan');
        return redirect()->back();
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductAttributeValue $productAttributeValue)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Outlet $outlet, ProductAttribute $productAttribute, $productAttributeValue)
    {
        $attribute = $productAttribute;
        $value = ProductAttributeValue::findOrFail($productAttributeValue);

        $data = [
            'action' => route('outlets.product-attributes.values.update', [$outlet, $attribute, $value]),
            'attribute' => $attribute,
            'value' => $value,
        ];
        
        return view('pages.outlets.products.attributes.values.form', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outlet $outlet, ProductAttribute $productAttribute, $productAttributeValue)
    {
        $attribute = $productAttribute;
        $value = ProductAttributeValue::findOrFail($productAttributeValue);

        $rules = $this->valueService->rules();

        $request->validate($rules);

        $request->merge([
            'id' => $value->id,
        ]);

        $this->valueService->update($request, $outlet, $attribute);

        notyf('Atribut nilai berhasil diupdate');
        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Outlet $outlet, ProductAttribute $productAttribute, $productAttributeValue)
    {
        $value = ProductAttributeValue::findOrFail($productAttributeValue);
        $this->valueService->delete($value);
        
        notyf('Atribut nilai berhasil dihapus');
        return redirect()->back();
    }
}
