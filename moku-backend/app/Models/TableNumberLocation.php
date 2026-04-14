<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TableNumberLocation extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['name', 'outlet_id'];

    public function tableNumbers()
    {
        return $this->hasMany(TableNumber::class);
    }
}
