<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\ProductVariant;
use App\Services\ProductVariantService;
use Illuminate\Http\Request;

class ProductSettingAttributeController extends Controller
{
    protected ProductVariantService $valueService;

    public function __construct(ProductVariantService $valueService)
    {
        $this->valueService = $valueService;
    }

    public function index(Outlet $outlet, string $productId)
    {
        $params = request()->query();

        $product = Product::findOrFail($productId);
        $outlet = $outlet->loadCount('productAttributes');

        $existingAttributeIds = $product->variants()
            ->pluck('product_attribute_id')
            ->unique()
            ->toArray();

        $productAttributes = $outlet->productAttributes()
            ->with('values')
            ->whereNotIn('id', $existingAttributeIds)
            ->get();

        $productVariants = $product->variants()
            ->filter($params)
            ->with(['productAttribute.values'])
            ->paginate(maxRowParams());

        $data = [
            'outlet' => $outlet,
            'product' => $product,
            'productAttributes' => $productAttributes,
            'productVariants' => $productVariants,
        ];

        return view('pages.outlets.products.attribute', $data);
    }

    public function store(Request $request, Outlet $outlet, string $productId)
    {
        $request->validate([
            'attribute_id' => 'required|exists:product_attributes,id',
        ]);

        $product = Product::findOrFail($productId);

        $this->valueService->store([
            'product_id' => $product->id,
            'product_attribute_id' => $request->input('attribute_id'),
        ]);

        notyf("Atribut $request->attribute_id berhasil ditambahkan");

        return redirect()->back();
    }

    public function destroy(Request $request, Outlet $outlet, string $productId, string $variantId)
    {
        $productVariant = ProductVariant::findOrFail($variantId);
        $this->valueService->destroy($productVariant);

        notyf("Atribut $request->attribute_id berhasil dihapus");

        return redirect()->back();
    }
}
