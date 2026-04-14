<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OutletGroupMember extends Model
{
    protected $fillable = [
        'outlet_group_id',
        'outlet_id',
    ];

    public function outletGroup()
    {
        return $this->belongsTo(OutletGroup::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }
}
