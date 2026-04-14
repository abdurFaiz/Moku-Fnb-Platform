<?php

namespace App\Models;

use App\Enums\ProductAttributeDisplayTypeEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class ProductAttribute extends Model
{
    protected $fillable = [
        'name',
        'display_type',
        'outlet_id',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function values()
    {
        return $this->hasMany(ProductAttributeValue::class);
    }

    public function scopeFilter($query, $filter)
    {
        if (@$filter['search']) {
            $query->where('name', 'like', "%{$filter['search']}%");
        }
    }

    public function displayTypeLabel(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                switch ($this->display_type) {
                    case 1:
                        return 'Radio';
                    case 2:
                        return 'Multi Check Box';
                    default:
                        return 'Unknown';
                }
            },
        );
    }
}
