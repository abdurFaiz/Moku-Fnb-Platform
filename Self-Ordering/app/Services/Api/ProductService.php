<?php

namespace App\Services\Api;

use App\Helpers\ResponseFormatter;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use Illuminate\Support\Facades\Http;

class ProductService
{
    public function checkProductAvailable($product)
    {
        // check product available
        if ($product->is_available != true) {
            return ResponseFormatter::error(
                'Product ' . $product->name . ' is not available',
                400
            );
        }

        // return true so caller can simply continue processing
        return true;
    }

    public function findAndValidateProduct($outletId, $productId)
    {
        $product = Product::where('outlet_id', $outletId)
            ->find($productId);

        if (! $product) {
            return [
                'success' => false,
                'response' => ResponseFormatter::error('Product not found', [
                    'product_id' => $productId,
                ], 404)
            ];
        }

        $available = $this->checkProductAvailable($product);
        if ($available !== true) {
            return [
                'success' => false,
                'response' => $available
            ];
        }

        return [
            'success' => true,
            'product' => $product
        ];
    }

    public function getVariants($outletId, $variantIds)
    {
        if ($variantIds) {
            return ProductAttributeValue::where('outlet_id', $outletId)
                ->whereIn('id', $variantIds)
                ->get();
        }

        return [];
    }
}
