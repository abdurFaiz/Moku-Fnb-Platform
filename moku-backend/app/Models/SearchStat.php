<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SearchStat extends Model
{
    protected $table = 'search_stats';

    protected $fillable = [
        'searchable_type',
        'searchable_id',
        'search_count',
    ];

    public function searchable()
    {
        return $this->morphTo();
    }
}
