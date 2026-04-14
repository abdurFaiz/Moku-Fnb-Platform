<?php

require __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

// Test broadcast
use Illuminate\Support\Facades\Broadcast;

$data = [
    'order_id' => 123,
    'order_code' => 'TEST-001',
    'status' => 3,
    'payment_status' => 'paid',
    'message' => 'Test payment berhasil!'
];

// Broadcast to channel
Broadcast::channel('new-order-line-created.1')->broadcast(
    'new-order-line-created',
    $data
);

echo "Event broadcasted to channel: new-order-line-created.1\n";
echo "Data: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
