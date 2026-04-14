<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FeedbackOptionQuestion extends Model
{
    protected $table = 'feedback_option_questions';

    protected $fillable = [
        'feedback_question_id',
        'option',
        'outlet_id',
    ];

    public function feedbackQuestion()
    {
        return $this->belongsTo(FeedbackQuestion::class);
    }
}
