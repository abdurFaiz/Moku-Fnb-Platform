<?php

namespace App\Console\Commands;

use App\Mail\CustomerRetentionMail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendCustomerRetentionEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'emails:send-retention';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send retention emails to customers who ordered exactly 2 weeks ago and not since.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $targetDate = Carbon::today()->subDays(14);

        $this->info("Checking for customers dormant since: " . $targetDate->toDateString());

        // Find users whose *latest* order was on $targetDate.
        // Logic:
        // 1. Must have an order on that day (whereDate created_at = target)
        // 2. Must NOT have any order AFTER that day (whereDate created_at > target)

        $users = User::whereHas('orders', function ($q) use ($targetDate) {
            $q->whereDate('created_at', $targetDate);
        })->whereDoesntHave('orders', function ($q) use ($targetDate) {
            $q->whereDate('created_at', '>', $targetDate);
        })->get();

        $this->info("Found " . $users->count() . " eligible users.");

        foreach ($users as $user) {
            // Get that specific last order to use context (outlet, etc)
            $lastOrder = $user->orders()
                ->whereDate('created_at', $targetDate)
                ->latest()
                ->first();

            if ($lastOrder && $user->email) {
                try {
                    Mail::to($user->email)->send(new CustomerRetentionMail($lastOrder));
                    $this->info("Sent email to: " . $user->email);
                    Log::info("Retention email sent to {$user->email} for order {$lastOrder->id}");
                } catch (\Exception $e) {
                    $this->error("Failed to send to {$user->email}: " . $e->getMessage());
                    Log::error("Failed to send retention email to {$user->email}: " . $e->getMessage());
                }
            }
        }

        $this->info("Done.");
    }
}
