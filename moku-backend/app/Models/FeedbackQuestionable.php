<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedbackQuestionable extends Model
{
    protected $fillable = [
        'feedback_question_id',
        'questionable_id',
        'questionable_type',
    ];

    public function feedbackQuestion()
    {
        return $this->belongsTo(FeedbackQuestion::class);
    }

    public function questionable()
    {
        return $this->morphTo();
    }
}
