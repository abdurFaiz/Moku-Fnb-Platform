<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Feedback;
use App\Models\FeedbackAnswer;
use App\Models\FeedbackQuestion;
use App\Models\Outlet;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    /**
     * Get all feedback
     */
    public function index($outletSlug)
    {
        $user = auth()->user();
        $outlet = Outlet::where('slug', $outletSlug)->firstOrFail();

        $feedback = Feedback::with(['questions.options'])
            ->where('user_id', $user->id)
            ->where('outlet_id', $outlet->id)
            ->isNotDone()
            // ->inRandomOrder()
            ->first();

        if ($feedback) {
            $feedback->makeHidden(['id', 'user_id', 'outlet_id', 'questions.feedback_id', 'questions.outlet_id', 'questions.options']);
        }

        return ResponseFormatter::success([
            'feedback' => $feedback
        ], 'Feedback retrieved successfully');
    }

    /**
     * Get a specific feedback answer by ID
     */
    public function show($outletSlug, $uuid)
    {
        $user = auth()->user();

        $feedback = Feedback::where('uuid', $uuid)
            ->where('user_id', $user->id)
            ->with(['questions.options'])
            ->firstOrFail();

        $feedback->makeHidden(['id']);

        return ResponseFormatter::success([
            'feedback' => $feedback
        ], 'Feedback retrieved successfully');
    }

    /**
     * Update feedback answer (fill in comment and option)
     */
    public function update(Request $request, $outletSlug, $uuid)
    {
        $validated = $request->validate([
            'feedback_option_question_id' => 'array',
            'feedback_option_question_id.*' => 'exists:feedback_option_questions,id',
            'comment' => 'array',
            'comment.*' => 'string|max:1000',
            'is_anonymous' => 'boolean',
        ]);

        $user = auth()->user();

        $feedback = Feedback::where('uuid', $uuid)
            ->where('user_id', $user->id)
            ->with(['questions'])
            ->firstOrFail();

        $feedback->update([
            'is_anonymous' => $validated['is_anonymous'],
            'is_done' => true,
        ]);

        $answers = $feedback->answers()->get();

        foreach ($answers as $key => $answer) {
            $answer->update([
                'feedback_option_question_id' => $validated['feedback_option_question_id'][$key],
                'comment' => $validated['comment'][$key],
            ]);
        }

        $feedback->load(['questions']);

        $feedback->makeHidden(['id']);

        return ResponseFormatter::success([
            'feedback' => $feedback
        ], 'Feedback answer updated successfully');
    }
}
