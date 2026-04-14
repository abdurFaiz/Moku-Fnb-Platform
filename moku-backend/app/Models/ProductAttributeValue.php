<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductAttributeValue extends Model
{
    protected $fillable = [
        'name',
        'extra_price',
        'product_attribute_id',
        'outlet_id',
        'is_default',
    ];

    public function productAttribute()
    {
        return $this->belongsTo(ProductAttribute::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function scopeFilter($query, $filter)
    {
        if (@$filter['search']) {
            $query->where('name', 'like', '%' . $filter['search'] . '%');
        }
    }
}
