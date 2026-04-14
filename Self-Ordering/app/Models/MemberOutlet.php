<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class MemberOutlet extends Model
{
    use HasUuids;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'uuid',
        'user_id',
        'outlet_id',
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
     * Get the user that owns the member outlet.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the outlet that belongs to the member outlet.
     */
    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
}
