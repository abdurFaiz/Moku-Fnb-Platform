<?php

namespace App\Models;

use App\Enums\VoucherTypeEnum;
use App\Helpers\GeneratingHelper;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Voucher extends Model
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'type',
        'price_type',
        'claim_type',
        'discount_percent',
        'discount_fixed',
        'min_transaction',
        'max_usage',
        'start_date',
        'end_date',
        'is_active',
        'is_hidden',
        'outlet_id',
    ];

    // protected static function boot()
    // {
    //     parent::boot();

    //     static::creating(function ($voucher) {
    //         $voucher->code = GeneratingHelper::generateMixedCode('vouchers');
    //     });
    // }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function voucherProducts(): HasMany
    {
        return $this->hasMany(VoucherProduct::class);
    }

    public function products(): HasManyThrough
    {
        return $this->hasManyThrough(
            Product::class,
            VoucherProduct::class,
            'voucher_id',
            'id',
            'id',
            'product_id',
        );
    }

    public function reward(): HasOne
    {
        return $this->hasOne(Reward::class);
    }

    public function periodDateFormatted(): Attribute
    {
        $startDate = $this->start_date ? Carbon::parse($this->start_date)->isoFormat('D MMM YYYY') : null;
        $endDate = $this->end_date ? Carbon::parse($this->end_date)->isoFormat('D MMM YYYY') : null;

        return Attribute::make(
            get: function () use ($startDate, $endDate) {
                if (!$startDate && $endDate) {
                    return 'Sampai ' . $endDate;
                }
                if ($startDate && !$endDate) {
                    return 'Berlaku Mulai ' . $startDate;
                }
                return $startDate . ' - ' . $endDate;
            },
        );
    }

    public function scopeFilter($query, $filters)
    {
        $query->when($filters['search'] ?? false, function ($query, $search) {
            $query->where('name', 'like', '%' . $search . '%');
        });

        $query->when($filters['type'] ?? false, function ($query, $type) {
            $query->where('type', $type);
        });

        $query->when($filters['claim_type'] ?? false, function ($query, $claimType) {
            $query->where('claim_type', $claimType);
        });
    }

    public function scopeIsActive($query)
    {
        $query->where('is_active', true);
    }

    public function scopeIsCanUse($query)
    {
        $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('start_date')
                    ->orWhereDate('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                    ->orWhereDate('end_date', '>=', now());
            });
    }

    public function scopeAddCanUsedVoucherByProducts($query, $productIds)
    {
        $query->addSelect([
            'can_used' => VoucherProduct::whereIn('product_id', $productIds)
                ->whereColumn('voucher_id', 'vouchers.id')
                ->selectRaw('IF(COUNT(*), 1, 0)')
                ->limit(1),
        ]);
    }

    public function scopeAddExpiredUserVoucher($query)
    {
        $query->addSelect([
            'expired_at' => UserVoucher::whereColumn('voucher_id', 'vouchers.id')
                ->whereColumn('outlet_id', 'vouchers.outlet_id')
                ->where('is_used', false)
                ->selectRaw('MAX(expired_at)')
                ->limit(1),
        ]);
    }

    public function scopeIsNotHidden($query)
    {
        $query->where('is_hidden', false);
    }

    public function scopeIsPrivate($query)
    {
        $query->where('type', VoucherTypeEnum::PRIVATE);
    }

    public function scopeIsPublic($query)
    {
        $query->where('type', VoucherTypeEnum::PUBLIC);
    }
}
