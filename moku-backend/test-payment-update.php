<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use App\Models\Order;
use App\Events\NewOrderLineCreatedEvent;

// Get order code from command line argument
$orderCode = $argv[1] ?? null;

if (!$orderCode) {
    echo "Usage: php test-payment-update.php <order_code>\n";
    echo "Example: php test-payment-update.php 840055368\n";
    exit(1);
}

// Find the order
$order = Order::where('code', $orderCode)->first();

if (!$order) {
    echo "❌ Order {$orderCode} not found\n";
    exit(1);
}

echo "Found order: {$order->code}\n";
echo "Current status: {$order->status}\n";
echo "Outlet ID: {$order->outlet_id}\n\n";

// Update to paid status (status = 3)
$order->status = 3;
$order->save();

echo "✅ Order updated to status 3 (PAID)\n";
echo "Broadcasting payment success event...\n\n";

// Broadcast the event
broadcast(new NewOrderLineCreatedEvent($order->fresh()));

echo "✅ Event broadcasted to channel: new-order-line-created.{$order->outlet_id}\n";
echo "\nIf you're on the payment page for order {$orderCode}, you should see:\n";
echo "  ✅ Toast: 'Pembayaran berhasil! Memproses pesanan...'\n";
echo "  ✅ Auto-navigate to success page\n";
