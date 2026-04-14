<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use App\Models\Order;
use App\Events\OrderCompletedEvent;

// Get order code from command line argument or use default
$orderCode = $argv[1] ?? null;

if ($orderCode) {
    // Find specific order by code
    $order = Order::where('code', $orderCode)->first();
    
    if ($order) {
        echo "Found order: {$order->code}\n";
        echo "Order status: {$order->status}\n";
        echo "Outlet ID: {$order->outlet_id}\n";
        echo "\nBroadcasting event to channel: order-completed.{$order->code}\n";
        
        broadcast(new OrderCompletedEvent($order));
        
        echo "✅ Event broadcasted successfully!\n";
        echo "\nCheck your frontend:\n";
        echo "  - Browser console should show: [TransactionWebSocket] Received event\n";
        echo "  - Transaction detail page should update automatically\n";
        echo "  - No repeated refetching should occur\n";
    } else {
        echo "❌ Order {$orderCode} not found\n";
    }
} else {
    echo "Usage: php test-order-completed.php <order_code>\n";
    echo "Example: php test-order-completed.php 108\n\n";
    
    echo "Available orders:\n";
    $orders = Order::latest()->take(10)->get(['id', 'code', 'status', 'outlet_id']);
    foreach ($orders as $o) {
        echo "  - Order {$o->code} (status: {$o->status}, outlet: {$o->outlet_id})\n";
    }
}
