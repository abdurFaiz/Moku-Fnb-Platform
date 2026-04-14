<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderProduct extends Model
{
    protected $fillable = [
        'price',
        'quantity',
        'extra_price',
        'sub_total',
        'total',
        'note',
        'meta_data',
        'order_id',
        'product_id',
        'user_id',
    ];

    protected $casts = [
        'meta_data' => 'array',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orderProductVariants(): HasMany
    {
        return $this->hasMany(OrderProductVariant::class, 'order_product_id');
    }
}
