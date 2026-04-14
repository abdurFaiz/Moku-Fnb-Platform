<?php

namespace App\Models;

use App\Enums\OutletServiceFeeConfigEnum;
use App\Enums\OutletTypeEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Outlet extends Model implements HasMedia
{
    use HasUuids, InteractsWithMedia;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'uuid',
        'name',
        'slug',
        'email',
        'phone',
        'va_name',
        'va_number',
        'address',
        'map',
        'is_active',
        'type',
        'fee_tax',
        'service_fee_config',
    ];

    /**
     * Get the columns that should receive a unique identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function tableNumberLocations()
    {
        return $this->hasMany(TableNumberLocation::class);
    }

    public function tableNumbers()
    {
        return $this->hasMany(TableNumber::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function productAttributes()
    {
        return $this->hasMany(ProductAttribute::class);
    }

    public function operationalSchedules()
    {
        return $this->hasMany(OperationalSchedule::class);
    }

    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    public function productCategories()
    {
        return $this->hasMany(ProductCategory::class);
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function customerPoints()
    {
        return $this->hasMany(CustomerPoint::class, 'outlet_id');
    }

    public function vouchers()
    {
        return $this->hasMany(Voucher::class);
    }

    public function userVouchers()
    {
        return $this->hasMany(UserVoucher::class);
    }

    public function rewards()
    {
        return $this->hasMany(Reward::class);
    }

    public function banners()
    {
        return $this->hasMany(Banner::class);
    }

    public function groups()
    {
        return $this->belongsToMany(OutletGroup::class, 'outlet_group_members', 'outlet_id', 'outlet_group_id')
            ->withTimestamps();
    }

    public function isTableService(): Attribute
    {
        return Attribute::make(
            get: fn() => ($this->type == OutletTypeEnum::TABLESERVICE || $this->type == OutletTypeEnum::ALL) ? 1 : 0,
        );
    }

    /**
     * Get the order's status label/description.
     */
    protected function serviceConfigLabel(): Attribute
    {
        if ($this->service_fee_config == OutletServiceFeeConfigEnum::PAID_BY_OUTLET) {
            $label = 'Paid by Outlet';
        } elseif ($this->service_fee_config == OutletServiceFeeConfigEnum::PAID_BY_CUSTOMER) {
            $label = 'Paid by Customer';
        }

        return Attribute::make(
            get: fn() => $label,
        );
    }

    public function scopeFilter($query, $filter)
    {
        if (@$filter['search']) {
            $query->where('name', 'like', '%' . $filter['search'] . '%');
        }
    }

    public function scopeIsActive($query)
    {
        $query->where('is_active', true);
    }

    public function scopeTotalPoint($query)
    {
        $userId = auth()?->user()?->id ?? auth('sanctum')->id();

        $query->addSelect([
            'total_point' => CustomerPoint::selectRaw('
            COALESCE(SUM(CASE 
                WHEN customer_points.type = 1 THEN customer_points.point 
                ELSE -customer_points.point 
            END), 0)
        ')
                ->where('customer_points.user_id', $userId)
                ->whereColumn('customer_points.outlet_id', 'outlets.id'),
        ]);
    }

    public function logoUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->hasMedia('logo') ? $this->getFirstMediaUrl('logo') : asset('assets/images/logo/spinofy_logo_basic.png'),
        );
    }

    public function previewOutletUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->hasMedia('preview_outlet') ? $this->getFirstMediaUrl('preview_outlet') : null,
        );
    }

    public function isOpen(): Attribute
    {
        // load operational schedules
        $this->load('operationalSchedules');

        // check if outlet is open on current day
        $isOpen = $this->operationalSchedules->where('open_time', '<', now()->format('H:i:s'))->where('close_time', '>', now()->format('H:i:s'))->contains('day', now()->dayOfWeek);

        return Attribute::make(
            get: fn() => $isOpen,
        );
    }
}
