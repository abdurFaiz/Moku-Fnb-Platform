<?php

namespace App\Console\Commands;

use App\Enums\OrderStatusEnum;
use App\Models\Order;
use App\Models\SplitPayment;
use Illuminate\Console\Command;

class SyncSplitPaymentCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:sync-split-payment';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync split payment data for orders that don\'t have split payment records';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting split payment sync...');

        // Find orders without split payment records
        // Filter for confirmed orders (WAITING_CONFIRMATION, SUCCESS, COMPLETED)
        $orders = Order::whereDoesntHave('splitPayment')
            ->whereIn('status', [
                OrderStatusEnum::WAITING_CONFIRMATION,
                OrderStatusEnum::SUCCESS,
                OrderStatusEnum::COMPLETED,
            ])
            ->whereNotNull('total_fee_service')
            ->get();

        $this->info("Found {$orders->count()} orders without split payment records.");

        if ($orders->isEmpty()) {
            $this->info('No orders to sync.');
            return Command::SUCCESS;
        }

        $syncedCount = 0;
        $errorCount = 0;

        foreach ($orders as $order) {
            try {
                // Calculate outlet split using same logic as PaymentService
                $totalOutletSplit = $order->total - $order->total_fee_service;

                // Create split payment record
                SplitPayment::insert([
                    [
                        'order_id' => $order->id,
                        'outlet_id' => $order->outlet_id,
                        'spinofy' => $order->spinofy_fee ?? 0,
                        'payment_service' => $order->fee_service ?? 0,
                        'outlet' => $totalOutletSplit,
                        'created_at' => $order->created_at,
                        'updated_at' => $order->updated_at,
                    ]
                ]);

                $syncedCount++;
            } catch (\Exception $e) {
                $this->error("Failed to sync order ID {$order->id}: {$e->getMessage()}");
                $errorCount++;
            }
        }

        $this->info("Sync completed!");
        $this->info("Successfully synced: {$syncedCount} records");

        if ($errorCount > 0) {
            $this->warn("Failed to sync: {$errorCount} records");
        }

        return Command::SUCCESS;
    }
}
