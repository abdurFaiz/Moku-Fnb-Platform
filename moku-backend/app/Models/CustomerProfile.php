<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class CustomerProfile extends Model
{
    use HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'uuid',
        'gender',
        'job',
        'date_birth',
        'user_id',
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

    /**
     * Get the user that owns the customer profile.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the gender of the customer profile.
     */
    public function genderDescription(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $this->gender == 1 ? 'Pria' : 'Wanita',
        );
    }

    /**
     * Scope a query to filter by any column value.
     */
    public function scopeFilter($query, $filter)
    {
        if(@$filter['gender']) {
            $query->where('gender', $filter['gender']);
        }

        if(@$filter['search']) {
            $query->where('job', 'like', '%' . $filter['search'] . '%')
                ->orWhereHas('user', function ($query) use ($filter) {
                    $query->where('name', 'like', '%' . $filter['search'] . '%');
                });
        }
    }
}
