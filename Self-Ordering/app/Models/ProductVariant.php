<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{    
    protected $fillable = [
        'product_id',
        'product_attribute_id',
    ];

    public function productAttribute()
    {
        return $this->belongsTo(ProductAttribute::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
    
    public function scopeFilter($query, $filter)
    {
        if (@$filter['search']) {
            $query->whereHas('productAttribute', function ($query) use ($filter) {
                $query->where('name', 'like', "%{$filter['search']}%");
            });
        }
    }
}
