<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OperationalSchedule extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid',
        'outlet_id',
        'day',
        'open_time',
        'close_time',
        'is_open',
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

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function dayName(): Attribute
    {
        return Attribute::make(
            get: fn ($value, $attributes) => match ($attributes['day']) {
                1 => 'Senin',
                2 => 'Selasa',
                3 => 'Rabu',
                4 => 'Kamis',
                5 => 'Jumat',
                6 => 'Sabtu',
                7 => 'Minggu',
                default => null,
            },
        );
    }
}
