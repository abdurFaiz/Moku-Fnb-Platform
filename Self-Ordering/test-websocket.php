<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make('Illuminate\Contracts\Console\Kernel');
$kernel->bootstrap();

use App\Models\Order;
use App\Events\NewOrderLineCreatedEvent;

// Get the latest order in outlet 1
$order = Order::where('outlet_id', 1)->latest()->first();

if ($order) {
    echo "Found order: {$order->code}\n";
    echo "Order status: {$order->status}\n";
    echo "Outlet ID: {$order->outlet_id}\n";
    echo "\nBroadcasting event to channel: new-order-line-created.{$order->outlet_id}\n";
    
    broadcast(new NewOrderLineCreatedEvent($order));
    
    echo "✅ Event broadcasted successfully!\n";
    echo "\nCheck your frontend:\n";
    echo "  - Browser console should show: [WebSocket] Received event\n";
    echo "  - WebSocket Debugger should show the event\n";
    echo "  - If order code matches, you should see a toast notification\n";
} else {
    echo "❌ No orders found in outlet 1\n";
}
