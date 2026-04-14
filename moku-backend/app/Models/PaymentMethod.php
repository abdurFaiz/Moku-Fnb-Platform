<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'name',
        'code',
        'channel',
        'percentage_fee',
        'is_published',
    ];

    public function scopeIsPublished($query)
    {
        return $query->where('is_published', true);
    }
}
