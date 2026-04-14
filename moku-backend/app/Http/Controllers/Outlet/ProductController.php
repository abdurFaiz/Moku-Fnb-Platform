<?php

namespace App\Http\Controllers\Outlet;

use App\Actions\UploadStorageAction;
use App\Http\Controllers\Controller;
use App\Models\OrderProduct;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductAttributeValue;
use App\Models\Reward;
use App\Models\VoucherProduct;
use App\Services\ImageCompressionService;
use App\Services\ProductVariantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    protected ProductVariantService $valueService;
    protected UploadStorageAction $storageAction;
    protected ImageCompressionService $imageCompressionService;

    public function __construct(
        ProductVariantService $valueService,
        UploadStorageAction $storageAction,
        ImageCompressionService $imageCompressionService
    ) {
        $this->valueService = $valueService;
        $this->storageAction = $storageAction;
        $this->imageCompressionService = $imageCompressionService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Outlet $outlet)
    {
        return view('pages.outlets.products.index');
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Outlet $outlet)
    {
        $selectedCategory = request()->query('category');

        $categories = $outlet->productCategories;
        $productAttributes = $outlet->productAttributes->load('values');

        $data = [
            'title' => 'Tambah Produk',
            'action' => route('outlets.products.store', $outlet->slug),
            'categories' => $categories,
            'productAttributes' => $productAttributes,
            'selectedCategory' => $selectedCategory,
        ];

        return view('pages.outlets.products.form', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Outlet $outlet)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:product_categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_available' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'is_recommended' => 'nullable|boolean',
            'product_recommendation_categories' => 'nullable|array',
            'product_recommendation_categories.*' => 'exists:product_categories,id',
        ];

        if (@$request->produt_attributes && count($request->produt_attributes) > 0) {
            $rules['product_attributes']  = 'required|array';
            $rules['product_attributes.*'] = 'required|exists:product_attributes,id';
        }

        $validated = $request->validate($rules);

        try {
            DB::beginTransaction();

            $product = Product::create([
                'outlet_id' => $outlet->id,
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'product_category_id' => $validated['category_id'],
                'is_available' => $validated['is_available'] ?? false,
                'is_published' => $validated['is_published'] ?? false,
                'is_recommended' => $validated['is_recommended'] ?? false,
            ]);

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $this->imageCompressionService->compress($file);

                if (config('filesystems.default') === 'gcs') {
                    $path = $this->storageAction->store('products', $file);
                } else {
                    $path = $file->store('products', 'public');
                }
                $product->update(['image' => $path]);
            }

            if (@$validated['product_attributes'] && count($validated['product_attributes']) > 0) {
                // add product variant
                foreach ($validated['product_attributes'] as $attributeId) {
                    $this->valueService->store([
                        'product_id' => $product->id,
                        'product_attribute_id' => $attributeId,
                    ]);
                }
            }

            if (@$validated['product_recommendation_categories'] && count($validated['product_recommendation_categories']) > 0) {
                $product->recommendationCategories()->sync($validated['product_recommendation_categories']);
            }

            DB::commit();

            notyf('Produk berhasil ditambahkan.');
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf('Gagal menambahkan produk.');
            return redirect()->back()->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Outlet $outlet, string $id)
    {
        $product = Product::with(['variants.productAttribute.values', 'recommendationCategories'])->findOrFail($id);
        $variants = $product->variants;

        $categories = $outlet->productCategories;
        $productAttributes = $outlet->productAttributes->load('values');

        $data = [
            'title' => 'Edit Produk ' . $product->name,
            'action' => route('outlets.products.update', [$outlet->slug, $product->id]),
            'categories' => $categories,
            'product' => $product,
            'variants' => $variants,
            'productAttributes' => $productAttributes,
        ];

        return view('pages.outlets.products.form', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outlet $outlet, string $id)
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric',
            'category_id' => 'required|exists:product_categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_available' => 'nullable|boolean',
            'is_published' => 'nullable|boolean',
            'is_recommended' => 'nullable|boolean',
            'product_recommendation_categories' => 'nullable|array',
            'product_recommendation_categories.*' => 'exists:product_categories,id',
        ];

        if (@$request->produt_attributes && count($request->produt_attributes) > 0) {
            $rules['product_attributes']  = 'required|array';
            $rules['product_attributes.*'] = 'required|exists:product_attributes,id';
        }

        $validated = $request->validate($rules);

        try {
            DB::beginTransaction();

            $product = Product::findOrFail($id);
            $product->update([
                'name' => $validated['name'],
                'description' => $validated['description'],
                'price' => $validated['price'],
                'product_category_id' => $validated['category_id'],
                'is_available' => $validated['is_available'] ?? false,
                'is_published' => $validated['is_published'] ?? false,
                'is_recommended' => $validated['is_recommended'] ?? false,
            ]);

            if ($request->hasFile('image')) {
                $file = $request->file('image');
                $this->imageCompressionService->compress($file);

                // Hapus gambar lama jika ada
                if ($product->image) {
                    if (config('filesystems.default') === 'gcs') {
                        $this->storageAction->delete($product->image);
                        $path = $this->storageAction->store('products', $file);
                    } else {
                        Storage::disk('public')->delete($product->image);
                        $path = $file->store('products', 'public');
                    }
                } else {
                    if (config('filesystems.default') === 'gcs') {
                        $path = $this->storageAction->store('products', $file);
                    } else {
                        $path = $file->store('products', 'public');
                    }
                }

                $product->update(['image' => $path]);
            }

            if (@$request->product_attributes && count($request->product_attributes) > 0) {
                // update product variant
                foreach ($request->input('product_attributes') as $attributeId) {
                    $this->valueService->update([
                        'product_id' => $product->id,
                        'product_attribute_id' => $attributeId,
                    ]);
                }
            }

            if (@$validated['product_recommendation_categories']) {
                $product->recommendationCategories()->sync($validated['product_recommendation_categories']);
            } else {
                $product->recommendationCategories()->detach();
            }

            DB::commit();

            notyf('Produk berhasil diupdate');
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf('Gagal mengupdate produk.');
            return redirect()->back()->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Outlet $outlet, string $id)
    {
        try {
            DB::beginTransaction();

            $product = Product::findOrFail($id);

            // check apakah product memiliki order atau tidak
            $orderProduct = OrderProduct::where('product_id', $product->id)->exists();

            if ($orderProduct) {
                return response()->json([
                    'isConfirmed' => false,
                    'message' => 'Produk tidak dapat dihapus karena memiliki order.',
                ], 400);
            }

            // check apakah product memiliki voucher atau tidak
            $voucherProduct = VoucherProduct::where('product_id', $product->id)->exists();

            if ($voucherProduct) {
                return response()->json([
                    'isConfirmed' => false,
                    'message' => 'Produk tidak dapat dihapus karena memiliki voucher.',
                ], 400);
            }

            // check apakah produk memiliki reward atau tidak
            $rewardProduct = Reward::where('product_id', $product->id)->exists();

            if ($rewardProduct) {
                return response()->json([
                    'isConfirmed' => false,
                    'message' => 'Produk tidak dapat dihapus karena memiliki reward.',
                ], 400);
            }

            // Hapus gambar jika ada
            if ($product->image) {
                if (config('filesystems.default') === 'gcs') {
                    $this->storageAction->delete($product->image);
                } else {
                    Storage::disk('public')->delete($product->image);
                }
            }

            // hapus produk variant
            $product->variants()->delete();

            $product->delete();

            DB::commit();

            notyf('Produk berhasil dihapus.');
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            return response()->json([
                'isConfirmed' => false,
                'message' => 'Gagal menghapus produk.',
            ], 400);
        }
    }
}
