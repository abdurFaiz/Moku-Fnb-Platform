<?php

namespace App\Services;

use App\Models\Outlet;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use Illuminate\Http\Request;

class ProductAttributeValueService
{
    public function rules()
    {
        $rules = [
            'name' => 'required|string|max:255',
            'extra_price' => 'required|numeric',
        ];

        return $rules;
    }

    /**
     * Store a new product attribute value.
     */
    public function store($data, Outlet $outlet, ProductAttribute $productAttribute)
    {
        $productAttribute->values()->create([
            'product_attribute_id' => $productAttribute->id,
            'name' => $data['name'],
            'extra_price' => $data['extra_price'],
            'is_default' => @$data['is_default'] ?? false,
            'outlet_id' => $outlet->id,
        ]);
    }

    /**
     * Update the specified product attribute value.
     */
    public function update($data, Outlet $outlet, ProductAttribute $productAttribute)
    {
        ProductAttributeValue::updateOrCreate(
            [
                'id' => $data['id'],
                'product_attribute_id' => $productAttribute->id,
                'outlet_id' => $outlet->id,
            ],
            [
                'name' => $data['name'],
                'extra_price' => $data['extra_price'],
                'is_default' => @$data['is_default'] ?? false,
            ]
        );
    }

    /**
     * Delete the specified product attribute value.
     */
    public function delete(ProductAttributeValue $productAttributeValue)
    {
        $productAttributeValue->delete();
    }
}
