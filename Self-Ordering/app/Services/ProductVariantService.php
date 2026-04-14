<?php
namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class ProductVariantService
{
    public function store($data)
    {
        ProductVariant::create([
            'product_id' => $data['product_id'],
            'product_attribute_id' => $data['product_attribute_id'],
        ]);
    }

    public function update($data)
    {
        ProductVariant::updateOrCreate([
            'product_id' => $data['product_id'],
            'product_attribute_id' => $data['product_attribute_id'],
        ]);
    }

    public function destroy(ProductVariant $productVariant)
    {
        $productVariant->delete();
    }
}