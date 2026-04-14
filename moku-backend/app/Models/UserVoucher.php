<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphOne;

class UserVoucher extends Model
{
    protected $fillable = [
        'user_id',
        'voucher_id',
        'outlet_id',
        'is_used',
        'expired_at',
    ];

    protected $casts = [
        'expired_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(Voucher::class);
    }

    public function outlet(): BelongsTo
    {
        return $this->belongsTo(Outlet::class);
    }

    public function customerPoint(): MorphOne
    {
        return $this->morphOne(CustomerPoint::class, 'pointable');
    }

    public function scopeIsActive($query)
    {
        $query->where('is_used', false)
            ->where('expired_at', '>', now());
    }

    public function scopeAddCanUsedVoucher($query, $productIds)
    {
        $query->addSelect([
            'can_used' => VoucherProduct::whereIn('product_id', $productIds)
                ->whereColumn('voucher_id', 'user_vouchers.voucher_id')
                ->selectRaw('IF(COUNT(*), 1, 0)')
                ->limit(1),
        ]);
    }

    public function scopeJoinVoucher($query)
    {
        $query->join('vouchers', 'user_vouchers.voucher_id', '=', 'vouchers.id')
            ->select(
                'vouchers.*',
                'user_vouchers.expired_at',
                'user_vouchers.is_used',
            );
    }
}
