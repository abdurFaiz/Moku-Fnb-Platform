<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class TableNumber extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = ['number', 'qr_code_path', 'table_number_location_id', 'outlet_id'];

    public function scopeFilter($query, $params)
    {
        $query->when(@$params['table_number_location_id'], function ($query, $location_id) {
            $query->where('table_number_location_id', $location_id);
        });

        $query->when(@$params['search'], function ($query, $search) {
            $query->where('number', 'like', "%$search%");
        });
    }

    public function tableNumberLocation()
    {
        return $this->belongsTo(tableNumberLocation::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function qrCodeUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => asset('storage/' . $this->qr_code_path),
        );
    }

    public function qrCodeLinkRedirect(): Attribute
    {

        return Attribute::make(
            get: fn () => env('FE_APP_URL') . "/onboard?outlet=" . $this->outlet->slug . "&table=$this->number",
        );
    }
}
