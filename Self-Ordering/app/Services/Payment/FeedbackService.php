<?php

namespace App\Services\Payment;

use App\Enums\FeedbackQuestionCategoryEnum;
use App\Enums\OrderStatusEnum;
use App\Models\Feedback;
use App\Models\FeedbackAnswer;
use App\Models\FeedbackQuestion;
use App\Models\Order;
use App\Models\Outlet;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class FeedbackService
{
    /**
     * Create a new feedback entry for a completed order.
     *
     * @param Order $order
     * @return Feedback|null
     */
    public function createFeedback(Order $order): ?Feedback
    {
        // validate order status
        if (!in_array($order->status, [OrderStatusEnum::SUCCESS, OrderStatusEnum::COMPLETED])) {
            return null;
        }

        // Check frequency: Max 2 emails in 2 weeks
        $twoWeeksAgo = now()->subWeeks(2);
        $recentFeedbacksCount = Feedback::where('user_id', $order->user_id)
            ->where('outlet_id', $order->outlet_id)
            ->where('created_at', '>=', $twoWeeksAgo)
            ->count();

        if ($recentFeedbacksCount >= 2) {
            return null;
        }

        return DB::transaction(function () use ($order) {
            // 1. Create Feedback
            $feedback = Feedback::create([
                'user_id' => $order->user_id,
                'outlet_id' => $order->outlet_id,
            ]);

            // 2. Select question (Re-ask logic)
            $question = null;

            // Check if there was a feedback in the last 2 weeks
            $lastFeedback = Feedback::where('user_id', $order->user_id)
                ->where('outlet_id', $order->outlet_id)
                ->where('id', '!=', $feedback->id) // exclude current
                ->where('created_at', '<=', now()->subWeeks(2))
                ->latest()
                ->first();

            if ($lastFeedback) {
                // Get the question from that feedback
                $lastAnswer = FeedbackAnswer::where('feedback_id', $lastFeedback->id)->first();

                // if answerable product, check same product if don't same not continue
                if ($lastAnswer->answerable_type == Product::class) {
                    $lastProduct = $lastAnswer->answerable;
                    $orderProducts = $order->products()->pluck('products.id')->toArray();
                    if (!in_array($lastProduct->id, $orderProducts)) {
                        $lastAnswerCheckSameProduct = true;
                    }
                }

                // check last answer type null or same product
                if ($lastAnswer && ($lastAnswer->answerable_type == null || $lastAnswerCheckSameProduct)) {
                    $questionId = $lastAnswer->feedback_question_id;

                    // Check how many times this question has been answered by this user
                    $countTimesAsked = FeedbackAnswer::where('user_id', $order->user_id)
                        ->where('feedback_question_id', $questionId)
                        ->where('answerable_type', $lastAnswer->answerable_type)
                        ->where('answerable_id', $lastAnswer->answerable_id)
                        ->count();

                    // If less than 2 times, ask again
                    if ($countTimesAsked < 2) {
                        $question = FeedbackQuestion::find($questionId);
                    }
                }
            }

            // If no re-ask question selected, get random one
            if (!$question) {
                $question = $this->getRandomQuestionForOrder($order);
            }

            if ($question) {
                $feedbackAnswerData = [
                    'feedback_id' => $feedback->id,
                    'feedback_question_id' => $question->id,
                    'user_id' => $order->user_id,
                    'outlet_id' => $order->outlet_id,
                    'comment' => null, // Waiting for user input
                ];

                if ($question->category == FeedbackQuestionCategoryEnum::PRODUCT) {
                    $feedbackAnswerData['answerable_type'] = Product::class;
                    $feedbackAnswerData['answerable_id'] = $question->questionable->questionable_id;
                }

                // 3. Create FeedbackAnswer
                FeedbackAnswer::create($feedbackAnswerData);
            }

            return $feedback;
        });
    }

    /**
     * get random question for order
     * 
     * @param Order $order
     * @return FeedbackQuestion|null
     */
    protected function getRandomQuestionForOrder(Order $order): ?FeedbackQuestion
    {
        $userId = $order->user_id;
        $outletId = $order->outlet_id;
        $productIds = $order->products()->pluck('products.id')->toArray();

        // get expect feedback question general
        $expectFeedbackAnswer = FeedbackAnswer::where('user_id', $userId)
            ->where('outlet_id', $outletId)
            ->whereNull('answerable_id')
            ->get();
        $expectFeedbackAnswerIds = $expectFeedbackAnswer->pluck('feedback_question_id')->toArray();

        // get expect feedback question product
        $expectFeedbackProductAnswer = FeedbackAnswer::where('user_id', $userId)
            ->where('outlet_id', $outletId)
            ->whereIn('answerable_id', $productIds)
            ->where('answerable_type', Product::class)
            ->get();
        $expectFeedbackQuestionIds = $expectFeedbackProductAnswer->pluck('feedback_question_id')->toArray();
        $expectFeedbackAnswerProductIds = $expectFeedbackProductAnswer->pluck('answerable_id')->toArray();

        // check expect feedback answer product with $productIds
        $productIds = array_diff($productIds, $expectFeedbackAnswerProductIds);

        // get feedback question product
        $questionableFilter = function ($query) use ($productIds) {
            $query->whereIn('questionable_id', $productIds)
                ->where('questionable_type', Product::class);
        };

        $feedbackQuestion = FeedbackQuestion::where('category', FeedbackQuestionCategoryEnum::PRODUCT)
            ->where('outlet_id', $outletId)
            ->whereHas('questionable', $questionableFilter)
            ->with(['questionable' => $questionableFilter])
            ->inRandomOrder()
            ->first();

        // if dont get feedback question product, get feedback question general
        if (!@$feedbackQuestion) {
            $feedbackQuestion = FeedbackQuestion::where('category', FeedbackQuestionCategoryEnum::GENERAL)
                ->whereNotIn('id', $expectFeedbackAnswerIds)
                ->where('outlet_id', $outletId)
                ->first();
        }

        // return feedback question
        return $feedbackQuestion;
    }
}
