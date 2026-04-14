<?php

namespace App\Models;

use App\Enums\OrderStatusEnum;
use App\Enums\PaymentStatusCodeEnum;
use App\Helpers\GeneratingHelper;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Order extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid',
        'code',
        'sub_total',
        'discount',
        'tax',
        'fee_service',
        'spinofy_fee',
        'total',
        'status',
        'order_number',
        'user_id',
        'table_number_id',
        'outlet_id',
        'voucher_id',
        'fee_service_id',
        'total_fee_service',
        'meta_data',
        'user_meta_data',
        'payment_method_id',
        'service_fee_config',
    ];

    protected $casts = [
        'meta_data' => 'array',
        'user_meta_data' => 'array',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            $order->code = GeneratingHelper::generateCode('orders');

            // set service fee config from outlet
            if (empty($order->service_fee_config) && $order->outlet_id) {
                $order->service_fee_config = Outlet::find($order->outlet_id)?->service_fee_config;
            }
        });
    }

    /**
     * Get the columns that should receive a unique identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function orderProducts()
    {
        return $this->hasMany(OrderProduct::class, 'order_id');
    }

    public function products()
    {
        return $this->hasManyThrough(Product::class, OrderProduct::class, 'order_id', 'id', 'id', 'product_id');
    }

    public function voucher()
    {
        return $this->belongsTo(Voucher::class);
    }

    public function customerPoint()
    {
        return $this->morphOne(CustomerPoint::class, 'pointable');
    }

    public function tableNumber()
    {
        return $this->belongsTo(TableNumber::class);
    }

    public function paymentLogs()
    {
        return $this->hasMany(PaymentLog::class, 'order_id');
    }

    public function paymentLog()
    {
        return $this->hasOne(PaymentLog::class, 'order_id');
    }

    public function splitPayment()
    {
        return $this->hasOne(SplitPayment::class, 'order_id');
    }

    /**
     * Get the order's status label/description.
     */
    protected function statusLabel(): Attribute
    {
        if ($this->status == OrderStatusEnum::PENDING) {
            $status = 'Pending';
        } elseif ($this->status == OrderStatusEnum::WAITING_CONFIRMATION) {
            $status = 'Menunggu Konfirmasi';
        } elseif ($this->status == OrderStatusEnum::SUCCESS) {
            $status = 'Pesanan dalam proses';
        } elseif ($this->status == OrderStatusEnum::COMPLETED) {
            $status = 'Selesai';
        } elseif ($this->status == OrderStatusEnum::FAILED) {
            $status = 'Gagal';
        } elseif ($this->status == OrderStatusEnum::EXPIRED) {
            $status = 'Expired';
        } elseif ($this->status == OrderStatusEnum::CHALLENGE) {
            $status = 'Challenge';
        } elseif ($this->status == OrderStatusEnum::CANCEL) {
            $status = 'Dibatalkan';
        } elseif ($this->status == OrderStatusEnum::REJECT) {
            $status = 'Ditolak';
        }

        return Attribute::make(
            get: fn() => $status,
        );
    }

    protected function serviceFeeConfigLabel(): Attribute
    {
        if ($this->service_fee_config == 1) {
            $status = 'Ditanggung Outlet';
        } elseif ($this->service_fee_config == 2) {
            $status = 'Ditanggung Customer';
        }

        return Attribute::make(
            get: fn() => $status,
        );
    }

    /**
     * Get the order's created_at in Indonesian formatted date.
     */
    protected function createdAtFormatted(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->created_at->locale('id')->isoFormat('D MMMM Y'),
        );
    }

    /**
     * Get the order's created_at in Indonesian formatted time.
     */
    protected function createdAtDateTimeFormatted(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->created_at->locale('id')->isoFormat('D MMM Y HH:mm'),
        );
    }

    /**
     * Get the order's created_at in Indonesian formatted time.
     */
    protected function createdAtTimeFormatted(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->created_at->locale('id')->isoFormat('HH:mm'),
        );
    }

    public function periodDate(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->created_at->locale('id')->isoFormat('MMMM YYYY'),
        );
    }

    public function scopeFilter($query, $params)
    {
        $query->when($params['status'] ?? null, function ($query, $status) {
            $query->where('status', $status);
        });

        $query->when($params['search'] ?? null, function ($query, $search) {
            $query->where('code', 'like', '%' . $search . '%')
                ->orWhereHas('user', function ($query) use ($search) {
                    $query->where('name', 'like', '%' . $search . '%');
                });
        });
    }

    public function scopeIsSuccess($query)
    {
        $query->where('status', OrderStatusEnum::SUCCESS);
    }

    public function scopeIsCompleted($query)
    {
        $query->where('status', OrderStatusEnum::COMPLETED);
    }

    public function scopeIsFinishedOrder($query)
    {
        $query->whereIn('status', [OrderStatusEnum::SUCCESS, OrderStatusEnum::COMPLETED]);
    }

    public function scopeFilterChartSales($query, $filters)
    {
        $query->when($filters['chart_type'] === 'year' ?? null, function ($query, $year) {
            $query->salesPerYear(date('Y'));
        });

        $query->when($filters['chart_type'] === 'month' ?? null, function ($query, $month) {
            $query->salesPerMonth(date('Y'));
        });
    }

    // Group by month
    public function scopeSalesPerMonth($query, $year)
    {
        return $query->select(
            DB::raw("MONTH(created_at) as label"),
            DB::raw("SUM(total) as total_sales")
        )
            ->whereYear('created_at', $year)
            ->isCompleted()
            ->groupBy('label')
            ->orderBy('label', 'ASC');
    }

    // Group by year
    public function scopeSalesPerYear($query)
    {
        return $query->select(
            DB::raw("YEAR(created_at) as label"),
            DB::raw("SUM(total) as total_sales")
        )
            ->isCompleted()
            ->groupBy('label')
            ->orderBy('label', 'ASC');
    }
}
