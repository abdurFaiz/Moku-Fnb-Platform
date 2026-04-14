<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\PublishmentController;
use App\Http\Controllers\Webhook\FonnteController;
use App\Http\Controllers\Webhook\GoogleSocialiteControler;
use App\Models\FeedbackAnswer;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::middleware(['user.guest'])->group(function () {
    Auth::routes([
        "login" => true,
        "register" => false,
        "reset" => false,
    ]);
});

Route::redirect('/', '/login');

Route::get('/webhook/google/redirect', [GoogleSocialiteControler::class, 'redirect']);
Route::get('/webhook/google/callback', [GoogleSocialiteControler::class, 'callback']);

Route::middleware(['auth'])
    ->group(function () {
        // publishment
        Route::post('/publishment', [PublishmentController::class, 'publishing'])->name('published.update');
    });

// Outlet
require __DIR__ . '/roles/outlets.php';

// Admin Spinotek
require __DIR__ . '/roles/spinotek.php';

// Add signed route for feedback
Route::get('/feedback/{order}', [\App\Http\Controllers\PublicFeedbackController::class, 'create'])
    ->name('feedback.create')
    ->middleware('signed');

// Preview email (for testing only - remove in production)
Route::get('/preview-email/{id}', function ($id) {
    $order = \App\Models\Order::find($id);
    if (!$order) return 'Order not found';
    return new \App\Mail\FeedbackRequestMail($order);
})->name('preview.email');

// Route of Customers
Route::middleware(['user.guest'])->group(function () {
    Route::view('/{path?}', 'pages.customers.index')
        ->where('path', '.*');
});
