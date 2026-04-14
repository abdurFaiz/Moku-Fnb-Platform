<?php

namespace App\Models;

use App\Enums\OrderStatusEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Support\Facades\Storage;

class Product extends Model
{
    use HasUuids;

    /**
     * Get the columns that should receive a unique identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'uuid',
        'name',
        'price',
        'description',
        'is_available',
        'is_recommended',
        'is_published',
        'image',
        'product_category_id',
        'outlet_id'
    ];

    protected $appends = [
        'image_url', // Lazy load - only append when needed to avoid N+1 queries
    ];

    public function productCategory()
    {
        return $this->belongsTo(ProductCategory::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function attribute()
    {
        return $this->hasOneThrough(
            ProductAttribute::class,
            ProductVariant::class,
            'product_id',
            'id',
            'id',
            'product_attribute_id'
        );
    }

    public function attributes()
    {
        return $this->hasManyThrough(
            ProductAttribute::class,
            ProductVariant::class,
            'product_id',
            'id',
            'id',
            'product_attribute_id'
        );
    }

    public function orderPendingProduct()
    {
        return $this->hasMany(OrderProduct::class, 'product_id', 'id')
            ->whereHas('order', function ($query) {
                $query->where('status', OrderStatusEnum::PENDING);
            });
    }

    public function recommendationCategories()
    {
        return $this->belongsToMany(ProductCategory::class, 'product_recommendation_categories', 'product_id', 'product_category_id');
    }

    public function likes()
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function imageUrl(): Attribute
    {
        if (config('filesystems.default') === 'gcs') {
            $imageUrl = $this->image ? Storage::disk(config('services.diskname'))->url($this->image) : asset('assets/images/products/empty_product.svg');
        } else {
            $imageUrl = $this->image ? asset('storage/' . $this->image) : asset('assets/images/products/empty_product.svg');
        }

        return Attribute::make(
            get: fn() => $imageUrl
        );
    }

    public function scopeFilter($query, $filters)
    {
        if (@$filters['search']) {
            $query->where('name', 'like', '%' . $filters['search'] . '%');
        }

        if (@$filters['product_category']) {
            $query->where('product_category_id', $filters['product_category']);
        }
    }

    public function scopeIsRecommended($query)
    {
        $query->where('is_recommended', 1);
    }

    public function scopeIsAvailable($query)
    {
        $query->where('is_available', 1);
    }

    public function scopeIsPublished($query)
    {
        $query->where('is_published', 1);
    }

    public function scopeAddTotalSales($query)
    {
        $query->addSelect(
            [
                'total_sales' => OrderProduct::selectRaw('sum(quantity)')
                    ->whereColumn('order_products.product_id', 'products.id')
                    ->whereHas('order', function ($query) {
                        $query->where('status', OrderStatusEnum::COMPLETED);
                    })
            ]
        );
    }

    public function scopeAddTotalVoucherClaimed($query, $voucherIds)
    {
        $query->addSelect(
            [
                'total_voucher_claimed' => OrderProduct::selectRaw('count(*)')
                    ->whereColumn('order_products.product_id', 'products.id')
                    ->whereHas('order', function ($query)  use ($voucherIds) {
                        $query->whereIn('status', [OrderStatusEnum::COMPLETED, OrderStatusEnum::SUCCESS])
                            ->whereIn('voucher_id', $voucherIds);
                    })
            ]
        );
    }

    public function scopeAddLikeUser($query)
    {
        $user = auth()->user() ?? auth('sanctum')->user();

        $query->addSelect(
            [
                'is_liked' => Like::selectRaw('count(*)')
                    ->whereColumn('likes.likeable_id', 'products.id')
                    ->where('likes.likeable_type', Product::class)
                    ->where('likes.user_id', $user->id),
            ]
        );
    }

    public function scopeMostLiked($query)
    {
        $query->withCount(['likes' => function ($query) {
            $query->where('likeable_type', Product::class);
        }])
            ->orderBy('likes_count', 'desc');
    }

    public function scopeBestSelling($query)
    {
        $query->addTotalSales()
            ->orderBy('total_sales', 'desc');
    }

    public function scopeMostSearched($query)
    {
        $query->addSelect(
            [
                'search_count' => SearchStat::select('search_count')
                    ->whereColumn('search_stats.searchable_id', 'products.id')
                    ->where('search_stats.searchable_type', Product::class)
                    ->latest()
                    ->limit(1)
            ]
        )
            ->orderByDesc('search_count');
    }
}
