<?php

namespace App\Jobs;

use App\Models\Feedback;
use App\Models\FeedbackAnswer;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use App\Models\Order;

class SendFeedbackRequestJob implements ShouldQueue
{
    use Queueable;

    protected $order;
    protected $feedback;

    /**
     * Create a new job instance.
     */
    public function __construct(Order $order, Feedback $feedback)
    {
        $this->order = $order;
        $this->feedback = $feedback;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Use cache to prevent duplicate emails for the same order (expires in 24 hours)
        $cacheKey = 'feedback_email_sent_' . $this->order->id;
        if (\Illuminate\Support\Facades\Cache::get($cacheKey)) {
            return;
        }

        // Ensure order exists and has customer email
        if ($this->order && $this->order->user && $this->order->user->email) {
            \Illuminate\Support\Facades\Mail::to($this->order->user->email)
                ->send(new \App\Mail\FeedbackRequestMail($this->feedback));

            // Mark as sent
            \Illuminate\Support\Facades\Cache::put($cacheKey, true, now()->addHours(24));
        }
    }
}
