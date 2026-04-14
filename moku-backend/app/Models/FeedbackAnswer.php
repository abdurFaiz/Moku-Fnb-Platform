<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedbackAnswer extends Model
{
    protected $fillable = [
        'comment',
        'feedback_question_id',
        'feedback_option_question_id',
        'feedback_id',
        'answerable_id',
        'answerable_type',
        'user_id',
        'outlet_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function feedbackQuestion()
    {
        return $this->belongsTo(FeedbackQuestion::class);
    }

    public function feedbackOptionQuestion()
    {
        return $this->belongsTo(FeedbackOptionQuestion::class);
    }

    public function feedback()
    {
        return $this->belongsTo(Feedback::class);
    }

    public function answerable()
    {
        return $this->morphTo();
    }
}
