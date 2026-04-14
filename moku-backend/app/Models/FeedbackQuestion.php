<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedbackQuestion extends Model
{
    protected $table = 'feedback_questions';

    protected $fillable = [
        'question',
        'category',
        'outlet_id',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function options()
    {
        return $this->hasMany(FeedbackOptionQuestion::class);
    }

    public function answers()
    {
        return $this->hasMany(FeedbackAnswer::class);
    }

    public function questionables()
    {
        return $this->hasMany(FeedbackQuestionable::class, 'feedback_question_id', 'id');
    }

    public function questionable()
    {
        return $this->hasOne(FeedbackQuestionable::class);
    }

    public function scopeFilter($query, array $filters)
    {
        // $query->when($filters['outlet'] ?? false, function ($query, $outlet) {
        //     $productIds = $outlet->products()->pluck('id');
        //     $query->where(function ($query) use ($outlet, $productIds) {
        //         $query->whereHas('questionables', function ($subQuery) use ($outlet) {
        //             $subQuery->where('questionable_type', Outlet::class)
        //                 ->where('questionable_id', $outlet->id);
        //         })->orWhereHas('questionables', function ($subQuery) use ($productIds) {
        //             $subQuery->where('questionable_type', Product::class)
        //                 ->whereIn('questionable_id', $productIds);
        //         });
        //     });
        // });

        $query->when($filters['search'] ?? false, function ($query, $search) {
            $query->where('question', 'like', '%' . $search . '%');
        });

        $query->when($filters['category'] ?? false, function ($query, $category) {
            $query->where('category', $category);
        });
    }
}
