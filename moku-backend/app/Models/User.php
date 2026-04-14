<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;

use App\Enums\RoleEnum;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements HasMedia
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles, HasUuids, InteractsWithMedia, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'uuid',
        'name',
        'email',
        'phone',
        'password',
        'pin',
        'outlet_id',
        'google_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
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

    /**
     * Get the outlet that owns the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function outlet()
    {
        return $this->belongsTo(Outlet::class, 'outlet_id');
    }

    /**
     * Get the customer profile associated with the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasOne
     */
    public function customerProfile()
    {
        return $this->hasOne(CustomerProfile::class);
    }

    /**
     * Get the orders for the user.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function orders()
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Get the avatar URL attribute.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    public function avatarUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->getMedia('avatar')->first()?->getUrl() ?? asset('assets/images/avatar/avatar-1.png'),
        );
    }

    /**
     * Get the short name attribute.
     *
     * @return \Illuminate\Database\Eloquent\Casts\Attribute
     */
    public function shortName(): Attribute
    {
        return Attribute::make(
            get: fn() => explode(' ', trim($this->name))[0] ?? '',
        );
    }

    /**
     * Scope a query to only include users with the Admin Spinotek role.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeIsAdminSpinotek($query)
    {
        return $query->whereHas('roles', function ($query) {
            $query->where('name', RoleEnum::ADMIN_SPINOTEK);
        });
    }

    /**
     * Scope a query to only include users with the Outlet role.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeIsOutlet($query)
    {
        return $query->whereHas('roles', function ($query) {
            $query->where('name', RoleEnum::OUTLET);
        });
    }

    /**
     * Scope a query to only include users with the Customer role.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeIsCustomer($query)
    {
        return $query->whereHas('roles', function ($query) {
            $query->where('name', RoleEnum::CUSTOMER);
        });
    }

    public function scopeFilter($query, $filter)
    {
        if (@$filter['search']) {
            $query->where('name', 'like', '%' . $filter['search'] . '%');
        }

        if (@$filter['outlet']) {
            $query->where('outlet_id', $filter['outlet']);
        }
    }

    public function scopeAddTotalAveragePointTransaction($query)
    {
        $query->addSelect([
            'total_average_point_transaction' => CustomerPoint::whereColumn('user_id', 'users.id')
                ->selectRaw('COALESCE(ROUND(AVG(point)), 0)')
                ->where('outlet_id', auth()->user()->outlet_id)
                ->groupBy('user_id'),
        ]);
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }
}
