<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CustomerPoint extends Model
{
    protected $fillable = [
        'point',
        'type',
        'user_id',
        'outlet_id',
        'pointable_type',
        'pointable_id',
    ];

    public function pointable()
    {
        return $this->morphTo();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function scopeFilterChartAveragePoints($query, $filters)
    {
        $query->when(($filters['chart_type'] ?? null) === 'year', function ($query) {
            $query->averagePointsPerYear();
        });

        $query->when(($filters['chart_type'] ?? null) === 'month', function ($query) {
            $query->averagePointsPerMonth(date('Y'));
        });
    }

    public function scopeAveragePointsPerMonth($query, $year)
    {
        return $query->select(
                DB::raw('MONTH(created_at) as label'),
                DB::raw('AVG(point) as average_point')
            )
            ->whereYear('created_at', $year)
            ->where('outlet_id', auth()->user()->outlet_id)
            ->groupBy('label')
            ->orderBy('label', 'ASC');
    }

    public function scopeAveragePointsPerYear($query)
    {
        return $query->select(
                DB::raw('YEAR(created_at) as label'),
                DB::raw('AVG(point) as average_point')
            )
            ->whereYear('created_at', date('Y'))
            ->where('outlet_id', auth()->user()->outlet_id)
            ->groupBy('label')
            ->orderBy('label', 'ASC');
    }
}
