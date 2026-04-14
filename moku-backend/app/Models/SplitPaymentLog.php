<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SplitPaymentLog extends Model
{
    protected $table = 'split_payment_logs';

    protected $fillable = [
        'raw_response',
        'split_payment_id',
        'order_id',
    ];

    protected $casts = [
        'raw_response' => 'array',
    ];

    public function splitPayment()
    {
        return $this->belongsTo(SplitPayment::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
