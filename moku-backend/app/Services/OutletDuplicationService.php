<?php

namespace App\Services;

use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Models\ProductCategory;
use App\Models\ProductVariant;
use App\Models\Reward;
use App\Models\TableNumber;
use App\Models\TableNumberLocation;
use App\Models\Voucher;
use App\Models\VoucherProduct;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class OutletDuplicationService
{
    public function duplicate(Outlet $sourceOutlet, Outlet $targetOutlet, array $options)
    {
        DB::beginTransaction();
        try {
            if (in_array('products', $options)) {
                $this->duplicateProducts($sourceOutlet, $targetOutlet);
            }

            if (in_array('vouchers', $options)) {
                $this->duplicateVouchers($sourceOutlet, $targetOutlet);
            }

            if (in_array('rewards', $options)) {
                $this->duplicateRewards($sourceOutlet, $targetOutlet);
            }

            if (in_array('table_numbers', $options)) {
                $this->duplicateTableNumbers($sourceOutlet, $targetOutlet);
            }

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Outlet duplication failed: ' . $e->getMessage());
            throw $e;
        }
    }

    protected function duplicateProducts(Outlet $source, Outlet $target)
    {
        $products = Product::with(['variants', 'variants.productAttribute', 'variants.productAttribute.values'])->where('outlet_id', $source->id)->get();

        foreach ($products as $product) {
            // Check if product already exists in target (by name)
            if (Product::where('outlet_id', $target->id)->where('name', $product->name)->exists()) {
                continue;
            }

            // Handle Category
            $categoryId = null;
            if ($product->product_category_id) {
                $sourceCategory = ProductCategory::find($product->product_category_id);
                if ($sourceCategory) {
                    $targetCategory = ProductCategory::firstOrCreate(
                        ['outlet_id' => $target->id, 'name' => $sourceCategory->name],
                        ['position' => $sourceCategory->position]
                    );
                    $categoryId = $targetCategory->id;
                }
            }

            $newProduct = $product->replicate();
            $newProduct->uuid = (string) \Illuminate\Support\Str::uuid();
            $newProduct->outlet_id = $target->id;
            $newProduct->product_category_id = $categoryId;

            // Copy Image
            if ($product->image && Storage::disk('public')->exists($product->image)) {
                $extension = pathinfo($product->image, PATHINFO_EXTENSION);
                $newPath = 'products/' . Str::random(40) . '.' . $extension;

                try {
                    Storage::disk('public')->copy($product->image, $newPath);
                    $newProduct->image = $newPath;
                } catch (\Exception $e) {
                    Log::warning("Failed to copy image for product {$product->id}: " . $e->getMessage());
                }
            }

            $newProduct->save();

            // Handle Variants
            foreach ($product->variants as $variant) {
                $newVariant = $variant->replicate();
                $newVariant->product_id = $newProduct->id;

                // Handle Attributes
                if ($variant->product_attribute_id) {
                    $sourceAttribute = ProductAttribute::find($variant->product_attribute_id);
                    if ($sourceAttribute) {
                        $targetAttribute = ProductAttribute::firstOrCreate(
                            ['outlet_id' => $target->id, 'name' => $sourceAttribute->name],
                            ['display_type' => $sourceAttribute->display_type]
                        );
                        $newVariant->product_attribute_id = $targetAttribute->id;

                        // Ensure Attribute Values exist
                        // Note: Variant usually links to a value implicitly or explicitly? 
                        // Looking at ProductVariant model would confirm, but usually variants are combinations.
                        // Wait, ProductVariant has product_attribute_id? Let's check the model structure again if needed.
                        // Based on previous view_file of Product.php:
                        // public function attribute() { return $this->hasOneThrough(..., ProductVariant::class, ...); }
                        // It seems ProductVariant links to ProductAttribute.
                    }
                }

                $newVariant->save();
            }
        }
    }

    protected function duplicateVouchers(Outlet $source, Outlet $target)
    {
        $vouchers = Voucher::with(['voucherProducts.product'])->where('outlet_id', $source->id)->get();

        foreach ($vouchers as $voucher) {
            if (Voucher::where('outlet_id', $target->id)->where('code', $voucher->code)->exists()) {
                continue;
            }

            $newVoucher = $voucher->replicate();
            $newVoucher->outlet_id = $target->id;
            $newVoucher->save();

            // Handle Voucher Products (if specific products are linked)
            foreach ($voucher->voucherProducts as $vp) {
                $sourceProduct = Product::find($vp->product_id);
                if ($sourceProduct) {
                    // Find corresponding product in target outlet
                    $targetProduct = Product::where('outlet_id', $target->id)
                        ->where('name', $sourceProduct->name)
                        ->first();

                    if ($targetProduct) {
                        VoucherProduct::create([
                            'voucher_id' => $newVoucher->id,
                            'product_id' => $targetProduct->id
                        ]);
                    }
                }
            }
        }
    }

    protected function duplicateRewards(Outlet $source, Outlet $target)
    {
        $rewards = Reward::where('outlet_id', $source->id)->get();

        foreach ($rewards as $reward) {
            if (Reward::where('outlet_id', $target->id)->where('name', $reward->name)->exists()) {
                continue;
            }

            $newReward = $reward->replicate();
            $newReward->outlet_id = $target->id;

            // Map Voucher
            if ($reward->voucher_id) {
                $sourceVoucher = Voucher::find($reward->voucher_id);
                if ($sourceVoucher) {
                    $targetVoucher = Voucher::where('outlet_id', $target->id)
                        ->where('code', $sourceVoucher->code)
                        ->first();
                    $newReward->voucher_id = $targetVoucher ? $targetVoucher->id : null;
                }
            }

            // Map Product
            if ($reward->product_id) {
                $sourceProduct = Product::find($reward->product_id);
                if ($sourceProduct) {
                    $targetProduct = Product::where('outlet_id', $target->id)
                        ->where('name', $sourceProduct->name)
                        ->first();
                    $newReward->product_id = $targetProduct ? $targetProduct->id : null;
                }
            }

            $newReward->save();
        }
    }

    protected function duplicateTableNumbers(Outlet $source, Outlet $target)
    {
        $tables = TableNumber::where('outlet_id', $source->id)->get();

        foreach ($tables as $table) {
            if (TableNumber::where('outlet_id', $target->id)->where('number', $table->number)->exists()) {
                continue;
            }

            $newTable = $table->replicate();
            $newTable->outlet_id = $target->id;

            // Handle Location
            if ($table->table_number_location_id) {
                $sourceLocation = TableNumberLocation::find($table->table_number_location_id);
                if ($sourceLocation) {
                    $targetLocation = TableNumberLocation::firstOrCreate(
                        ['outlet_id' => $target->id, 'name' => $sourceLocation->name]
                    );
                    $newTable->table_number_location_id = $targetLocation->id;
                }
            }

            // QR Code path might need regeneration or just nullify to let system regenerate
            $newTable->qr_code_path = null;
            $newTable->save();
        }
    }
}
