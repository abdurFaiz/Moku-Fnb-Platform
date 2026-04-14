<?php

namespace App\Models;

use App\Models\Scopes\AscendingPositionColumn;
use Illuminate\Database\Eloquent\Attributes\ScopedBy;
use Illuminate\Database\Eloquent\Model;

#[ScopedBy([AscendingPositionColumn::class])]
class ProductCategory extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['position', 'name', 'outlet_id'];

    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
