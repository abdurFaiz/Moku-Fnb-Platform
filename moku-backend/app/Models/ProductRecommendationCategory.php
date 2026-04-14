<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductRecommendationCategory extends Model
{
    protected $table = 'product_recommendation_categories';

    protected $fillable = [
        'product_id',
        'product_category_id',
    ];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function categories()
    {
        return $this->belongsToMany(ProductCategory::class);
    }
}
