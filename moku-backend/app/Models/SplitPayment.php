<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SplitPayment extends Model
{
    protected $fillable = [
        'spinofy',
        'outlet',
        'payment_service',
        'order_id',
        'outlet_id',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
}
