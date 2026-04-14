<?php

namespace App\Models;

use App\Enums\OrderStatusEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Reward extends Model
{
    protected $fillable = [
        'name',
        'point',
        'voucher_id',
        'product_id',
        'outlet_id',
    ];

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function voucherProducts(): HasManyThrough
    {
        return $this->hasManyThrough(
            Product::class,
            VoucherProduct::class,
            'voucher_id',
            'id',
            'voucher_id',
            'product_id',
        );
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function validUntil(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->voucher?->end_date ?? now()->addDays(14)->format('Y-m-d'),
        );
    }

    public function isProductReward(): Attribute
    {
        return Attribute::make(
            get: fn () => $this?->voucher?->is_hidden ? true : false,
        );
    }

    public function scopeFilter($query, $filters)
    {
        $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->where('name', 'like', "%{$search}%");
        });
    }

    public function scopeAddTotalUsed($query)
    {
        $userId = auth()?->user()?->id ?? auth('sanctum')->id();

        $query->addSelect([
            'total_used' => Order::selectRaw('count(*)')
                ->whereIn('status', [OrderStatusEnum::SUCCESS, OrderStatusEnum::COMPLETED])
                ->whereColumn('voucher_id', 'rewards.voucher_id')
                ->where('user_id', $userId),
        ]);
    }
}
