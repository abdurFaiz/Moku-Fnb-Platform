<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Feedback extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid',
        'user_id',
        'outlet_id',
        'is_done',
        'is_anonymous',
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

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function answers()
    {
        return $this->hasMany(FeedbackAnswer::class);
    }

    public function questions()
    {
        return $this->hasManyThrough(
            FeedbackQuestion::class,
            FeedbackAnswer::class,
            'feedback_id',
            'id',
            'id',
            'feedback_question_id'
        );
    }

    public function scopeIsDone($query)
    {
        return $query->where('is_done', true);
    }

    public function scopeIsNotDone($query)
    {
        return $query->where('is_done', false);
    }
}
