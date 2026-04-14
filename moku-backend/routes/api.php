<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\CustomerProfileController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OutletController;
use App\Http\Controllers\Api\PaymentAllController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PaymentIpaymuController;
use App\Http\Controllers\Api\PaymentProductController;
use App\Http\Controllers\Api\ImageController;
use App\Http\Controllers\Api\PaymentVoucherController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductVoucherController;
use App\Http\Controllers\Api\RewardController;
use App\Http\Controllers\Api\TableNumberController;
use App\Http\Controllers\Api\UserVoucherController;
use App\Http\Controllers\Api\VoucherController;
use App\Http\Controllers\Webhook\FonnteController;
use App\Http\Controllers\Webhook\PaymentHandleIpaymuController;
use App\Http\Controllers\Webhook\PaymentHandlerController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

Route::post('/image/download', [ImageController::class, 'download']);

Route::get('/webhook/fonnte/handler', [FonnteController::class, 'handle']);
// Route::post('/webhook/payment/handler', [PaymentHandlerController::class, 'handle'])->name('webhook.payment.handler');
Route::post('/webhook/payment/handler', [PaymentHandleIpaymuController::class, 'handle'])->name('webhook.payment.handler');

// outlet
Route::get('/outlet', [OutletController::class, 'index']);
Route::get('/outlet/{outlet:slug}', [OutletController::class, 'show']);

Route::prefix('/outlet/{outlet:slug}')
    ->group(function () {
        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/most-liked', [ProductController::class, 'mostLiked']);
        Route::get('/products/most-searched', [ProductController::class, 'mostSearched']);
        Route::get('/products/best-selling', [ProductController::class, 'bestSelling']);
        Route::get('/products/{uuid}/recommendations', [ProductController::class, 'recommendations']);
        Route::get('/products/recommendations', [ProductController::class, 'recommendationsByProducts']);
        Route::get('/products/{uuid}', [ProductController::class, 'show']);

        Route::get('/banner', [BannerController::class, 'index']);
    });

Route::middleware(['auth:sanctum', 'role:customer'])->group(function () {
    Route::post('/refresh-token', [AuthController::class, 'refresh']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // customer profile
    Route::post('/customer-profile', [CustomerProfileController::class, 'update']);

    Route::prefix('/outlet/{outlet:slug}')
        ->group(function () {
            // payment all
            Route::post('/payment-all', [PaymentAllController::class, 'store']);

            // payment
            Route::get('/payment', [PaymentController::class, 'index']);
            Route::post('/payment/{order:code}/store', [PaymentController::class, 'store']);
            Route::delete('/payment/{order:code}', [PaymentController::class, 'destroy']);

            // Route::put('/payment/{order:code}', [PaymentController::class, 'update']); //midtrans
            Route::put('/payment/{order:code}', [PaymentIpaymuController::class, 'update']); // ipaymu

            // product like
            Route::put('/products/{uuid}/like', [ProductController::class, 'toggleLike']);

            // product voucher check
            Route::post('/product/check-voucher', [ProductVoucherController::class, 'checkVoucher']);
            Route::post('/product/voucher/input-code', [ProductVoucherController::class, 'useInputCodeVoucher']);

            // payment voucher
            Route::put('/payment/{voucher:code}/voucher', [PaymentVoucherController::class, 'useVoucher']);
            Route::put('/payment/voucher/input-code', [PaymentVoucherController::class, 'useInputCodeVoucher']);
            Route::delete('/payment/{order:code}/voucher', [PaymentVoucherController::class, 'removeVoucher']);

            // payment product
            Route::post('/payment/product', [PaymentProductController::class, 'storeProduct']);
            Route::put('/payment/product/{orderProduct}', [PaymentProductController::class, 'updateOrderProduct']);
            Route::put('/payment/product/{orderProduct}/quantity', [PaymentProductController::class, 'updateQuantityOrderProduct']);
            Route::delete('/payment/product/{orderProduct}', [PaymentProductController::class, 'destroyProduct']);

            // checkout
            Route::get('/checkout/{order:code}', [CheckoutController::class, 'show']);

            // order
            Route::get('/order', [OrderController::class, 'index']);
            Route::get('/order/{order:code}', [OrderController::class, 'show']);
            Route::post('/order', [OrderController::class, 'store']);

            // reward
            Route::get('/reward', [RewardController::class, 'index']);
            Route::get('/reward/history', [RewardController::class, 'history']);

            // voucher
            Route::get('/voucher', [VoucherController::class, 'index']);
            Route::post('/voucher/{reward:id}', [VoucherController::class, 'claim']);
            Route::get('/voucher/products/list', [VoucherController::class, 'voucherProduct']);
            Route::get('/voucher/rewards/list', [VoucherController::class, 'voucherReward']);

            // user voucher
            Route::get('/user-voucher', [UserVoucherController::class, 'index']);
            Route::get('/user-voucher/{order:code}/order', [UserVoucherController::class, 'VoucherOrder']);
            Route::get('/user-voucher/product', [UserVoucherController::class, 'VoucherProduct']);

            // table number
            Route::get('/table-number', [TableNumberController::class, 'index']);
            Route::get('/table-number/{number}', [TableNumberController::class, 'show']);

            // customer profile
            Route::get('/customer-profile', [CustomerProfileController::class, 'index']);

            // feedback
            Route::get('/feedback', [FeedbackController::class, 'index']);
            Route::get('/feedback/{uuid}', [FeedbackController::class, 'show']);
            Route::put('/feedback/{uuid}', [FeedbackController::class, 'update']);

            // invoice
            Route::get('/invoice/{order:code}', [InvoiceController::class, 'show']);
        });
});
