<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::routes(['middleware' => ['web', 'auth']]);
Broadcast::routes(['prefix' => 'api', 'middleware' => ['api', 'auth:sanctum']]);

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('new-order-line-created.{outletId}', function ($user, $outletId) {
    // Allow authenticated users to listen to order updates in this outlet
    // This is needed for customers to receive real-time payment status updates
    return $user !== null;
});

Broadcast::channel('order-completed.{code}', function ($user, $code) {
    // Allow authenticated users to listen to their order completion updates
    // This is needed for transaction detail page real-time updates
    return $user !== null;
});
