<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SearchStat;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Outlet $outlet)
    {
        $param = request()->query();

        $outlet->append('is_open');

        $categories = ProductCategory::where('outlet_id', $outlet->id)->get();
        $recommendedProducts = Product::where('outlet_id', $outlet->id)->isRecommended()->latest()->get();
        $recommendedProducts->append('image_url');

        $products = Product::where('outlet_id', $outlet->id)
            ->isPublished()
            ->filter($param)
            ->latest()
            ->get();
        $products->append('image_url');

        // Periksa token API dengan request()->bearerToken() sebagai alternatif auth()->check()
        if (request()->bearerToken()) {
            // Jika token ada, coba dapatkan user dari token
            $user = auth('sanctum')->user();

            if ($user) {
                $products->load(['orderPendingProduct' => function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                }]);
            }
        }

        $data = [
            'categories' => $categories,
            'recommendedProducts' => $recommendedProducts,
            'products' => $products,
            'outlet' => $outlet,
        ];

        return ResponseFormatter::success([
            $data
        ], 'List product data');
    }

    /**
     * Display the specified resource.
     */
    public function show(Outlet $outlet, string $uuid)
    {
        $outlet->append('is_open');

        $product =  Product::with(['attributes.values'])->where('outlet_id', $outlet->id)->where('uuid', $uuid)->firstOrFail();
        $product->append('image_url');

        // Periksa token API dengan request()->bearerToken() sebagai alternatif auth()->check()
        if (request()->bearerToken()) {
            // Jika token ada, coba dapatkan user dari token
            $user = auth('sanctum')->user();

            if ($user) {
                $product->load(['orderPendingProduct' => function ($query) use ($user) {
                    $query->with(['orderProductVariants'])
                        ->where('user_id', $user->id);
                }]);
            }
        }

        return ResponseFormatter::success([
            'product' => $product,
            'outlet' => $outlet,
        ], 'List product data');
    }

    /**
     * Toggle like product.
     */
    public function toggleLike(Outlet $outlet, string $uuid)
    {
        $product = Product::where('outlet_id', $outlet->id)->where('uuid', $uuid)->firstOrFail();
        $user = auth('sanctum')->user();

        $like = $product->likes()->where('user_id', $user->id)->first();

        if ($like) {
            $like->delete();
            $message = 'Product unliked successfully';
        } else {
            $product->likes()->create([
                'user_id' => $user->id,
            ]);
            $message = 'Product liked successfully';
        }

        // refresh product
        $product = Product::where('outlet_id', $outlet->id)->where('uuid', $uuid)->addLikeUser()->firstOrFail();

        // make hidden
        $product->makeHidden('id');

        return ResponseFormatter::success([
            'product' => $product,
        ], $message);
    }

    /**
     * Get most liked products.
     */
    public function mostLiked(Outlet $outlet)
    {
        $products = Product::where('outlet_id', $outlet->id)
            ->isPublished()
            ->isAvailable()
            ->mostLiked()
            ->take(10)
            ->get();

        $products->append('image_url');

        // make hidden
        $products->makeHidden('id');

        return ResponseFormatter::success([
            'products' => $products,
        ], 'List of most liked products');
    }

    /**
     * Get most searched products.
     */
    public function mostSearched(Outlet $outlet)
    {
        $param = request()->query();

        $products = Product::where('outlet_id', $outlet->id)
            ->isPublished()
            ->isAvailable()
            ->mostSearched()
            ->filter($param)
            ->take(10)
            ->get();

        // Trigger update search stats
        if (@$param['search'] && !empty($param['search'])) {
            foreach ($products as $product) {
                $searchStat = SearchStat::firstOrCreate(
                    [
                        'searchable_type' => Product::class,
                        'searchable_id' => $product->id,
                    ],
                    ['search_count' => 0]
                );
                $searchStat->increment('search_count');
            }
        }

        if ($products->isEmpty() && !@$param['search']) {
            $products = Product::where('outlet_id', $outlet->id)
                ->isRecommended()
                ->isPublished()
                ->isAvailable()
                ->take(10)
                ->get();
        }

        $products->append('image_url');
        $products->makeHidden('id');

        return ResponseFormatter::success([
            'products' => $products,
        ], 'List of most searched products');
    }

    /**
     * Get best selling products.
     */
    public function bestSelling(Outlet $outlet)
    {
        $products = Product::where('outlet_id', $outlet->id)
            ->isPublished()
            ->isAvailable()
            ->bestSelling()
            ->take(10)
            ->get();

        $products->append('image_url');

        // make hidden
        $products->makeHidden('id');

        return ResponseFormatter::success([
            'products' => $products,
        ], 'List of best selling products');
    }

    /**
     * Get product recommendations based on categories.
     */
    public function recommendations(Outlet $outlet, string $uuid)
    {
        $product = Product::where('outlet_id', $outlet->id)
            ->where('uuid', $uuid)
            ->firstOrFail();

        $recommendationCategories = collect();
        if (@$product->recommendationCategories) {
            $recommendationCategories = $product->recommendationCategories;
        }

        $recommendedProducts = collect();

        if ($recommendationCategories->isEmpty()) {
            $recommendedProducts = Product::where('outlet_id', $outlet->id)
                ->where('id', '!=', $product->id)
                ->isPublished()
                ->isAvailable()
                ->bestSelling()
                ->take(10)
                ->get();
        } else {
            foreach ($recommendationCategories as $category) {
                $mostLiked = Product::where('outlet_id', $outlet->id)
                    ->where('product_category_id', $category->id)
                    ->where('id', '!=', $product->id)
                    ->isPublished()
                    ->isAvailable()
                    ->mostLiked()
                    ->take(2)
                    ->get();

                $bestSelling = Product::where('outlet_id', $outlet->id)
                    ->where('product_category_id', $category->id)
                    ->where('id', '!=', $product->id)
                    ->isPublished()
                    ->isAvailable()
                    ->bestSelling()
                    ->take(2)
                    ->get();

                $recommendedProducts = $recommendedProducts->merge($mostLiked)->merge($bestSelling);
            }
        }

        $recommendedProducts = $recommendedProducts->unique('id')->values();
        $recommendedProducts->each(function ($item) {
            $item->append('image_url');
            $item->makeHidden('id');
        });

        return ResponseFormatter::success([
            'recommendations' => $recommendedProducts,
        ], 'List of product recommendations');
    }

    /**
     * Get product recommendations based on list of products.
     */
    public function recommendationsByProducts(Request $request, Outlet $outlet)
    {
        $request->validate([
            'product_uuids' => 'required|array',
            'product_uuids.*' => 'string',
        ]);

        $productUuids = $request->input('product_uuids');

        $products = Product::with('recommendationCategories')
            ->where('outlet_id', $outlet->id)
            ->whereIn('uuid', $productUuids)
            ->get();

        if ($products->isEmpty()) {
            return ResponseFormatter::error(null, 'Products not found', 404);
        }

        // Collect all recommendation categories from all input products
        $recommendationCategories = $products->pluck('recommendationCategories')->flatten()->unique('id');

        $recommendedProducts = collect();
        $excludeProductIds = $products->pluck('id')->toArray();

        if ($recommendationCategories->isEmpty()) {
            $recommendedProducts = Product::where('outlet_id', $outlet->id)
                ->whereNotIn('id', $excludeProductIds)
                ->isPublished()
                ->isAvailable()
                ->bestSelling()
                ->take(10)
                ->get();
        } else {
            foreach ($recommendationCategories as $category) {
                $mostLiked = Product::where('outlet_id', $outlet->id)
                    ->where('product_category_id', $category->id)
                    ->whereNotIn('id', $excludeProductIds)
                    ->isPublished()
                    ->isAvailable()
                    ->mostLiked()
                    ->take(2)
                    ->get();

                $bestSelling = Product::where('outlet_id', $outlet->id)
                    ->where('product_category_id', $category->id)
                    ->whereNotIn('id', $excludeProductIds)
                    ->isPublished()
                    ->isAvailable()
                    ->bestSelling()
                    ->take(2)
                    ->get();

                $recommendedProducts = $recommendedProducts->merge($mostLiked)->merge($bestSelling);
            }
        }

        $recommendedProducts = $recommendedProducts->unique('id')->values();
        $recommendedProducts->each(function ($item) {
            $item->append('image_url');
            $item->makeHidden('id');
        });

        return ResponseFormatter::success([
            'recommendations' => $recommendedProducts,
        ], 'List of product recommendations');
    }
}
