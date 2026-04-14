<?php

use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\OutletLoginController;
use App\Http\Controllers\Outlet\AnalyticPoinController;
use App\Http\Controllers\Outlet\AnalyticSalesController;
use App\Http\Controllers\Outlet\AnalyticProductController;
use App\Http\Controllers\Outlet\AnalyticCustomerController;
use App\Http\Controllers\Outlet\BannerController;
use App\Http\Controllers\Outlet\CustomerController;
use App\Http\Controllers\Outlet\DashboardController;
use App\Http\Controllers\Outlet\OperationalScheduleController;
use App\Http\Controllers\Outlet\FeedbackQuestionController;
use App\Http\Controllers\Outlet\InvoiceController;
use App\Http\Controllers\Outlet\OrderLineController;
use App\Http\Controllers\Outlet\OutletController;
use App\Http\Controllers\Outlet\ProductAttributeController;
use App\Http\Controllers\Outlet\ProductAttributeValueController;
use App\Http\Controllers\Outlet\ProductCategoryController;
use App\Http\Controllers\Outlet\ProductController;
use App\Http\Controllers\Outlet\ProductSettingAttributeController;
use App\Http\Controllers\Outlet\ProfileController;
use App\Http\Controllers\Outlet\ReportSaleController;
use App\Http\Controllers\Outlet\RewardController;
use App\Http\Controllers\Outlet\TableNumberController;
use App\Http\Controllers\Outlet\TableNumberLocationController;
use App\Http\Controllers\Outlet\VoucherController;
use App\Http\Controllers\Outlet\VoucherProductController;
use Illuminate\Support\Facades\Route;

Route::prefix('/{outlet:slug}')
  ->middleware(['ensure.outlet.model', 'ensure.outlet.valid', 'session.per.outlet', 'set.current.outlet'])
  ->as('outlets.')
  ->group(function () {

    Route::post('/logout', [LogoutController::class, 'logout'])->name('logout');

    Route::middleware(['outlet.guest'])->group(function () {
      // Authentication
      Route::get('/login', [OutletLoginController::class, 'index'])->name('login');
      Route::post('/authenticate', [OutletLoginController::class, 'authenticate'])->name('authenticate');
    });

    Route::middleware(['auth', 'role:outlet'])->group(function () {
      // Dashboard
      Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

      // Products
      Route::resource('products', ProductController::class);

      Route::get('/products/{id}/attributes', [ProductSettingAttributeController::class, 'index'])->name('products.settings.attributes.index');
      Route::post('/products/{id}/attributes', [ProductSettingAttributeController::class, 'store'])->name('products.settings.attributes.store');
      Route::delete('/products/{id}/attributes/{variantId}', [ProductSettingAttributeController::class, 'destroy'])->name('products.settings.attributes.destroy');
      Route::delete('product-categories/{id}', [ProductCategoryController::class, 'destroy'])->name('product-categories.destroy');

      Route::resource('product-attributes', ProductAttributeController::class);
      Route::resource('product-attributes.values', ProductAttributeValueController::class);

      // vouchers
      Route::resource('vouchers', VoucherController::class);
      Route::delete('/vouchers/products/{voucherProduct}', [VoucherProductController::class, 'destroy'])->name('vouchers.products.destroy');

      // rewards
      Route::resource('rewards', RewardController::class);

      // order lines
      Route::get('/order-lines', [OrderLineController::class, 'index'])->name('order-lines.index');

      // Invoice
      Route::get('/invoice/{order:code}/generate', [InvoiceController::class, 'generate'])->name('invoice.generate');

      // Table Numebers
      Route::get('/table-numbers/download-qr-codes', [TableNumberController::class, 'downloadQrCodeZip'])->name('table-numbers.download-qr-codes');
      Route::resource('table-numbers', TableNumberController::class);
      Route::resource('table-number-locations', TableNumberLocationController::class);

      // Reports
      Route::get('/reports/sales', [ReportSaleController::class, 'index'])->name('reports.sales.index');
      Route::post('/reports/sales/{order}/feedback', [ReportSaleController::class, 'sendFeedback'])->name('reports.sales.feedback');
      Route::post('/reports/sales/{order}/retention', [ReportSaleController::class, 'sendRetention'])->name('reports.sales.retention');

      // Customers
      Route::get('/customers', [CustomerController::class, 'index'])->name('customers.index');

      // settings
      Route::get('/settings/outlet', [OutletController::class, 'index'])->name('settings.outlet.index');
      Route::put('/settings/outlet', [OutletController::class, 'update'])->name('settings.outlet.update');

      // Operational Schedule
      Route::get('/settings/schedule', [OperationalScheduleController::class, 'index'])->name('settings.schedule.index');
      Route::put('/settings/schedule', [OperationalScheduleController::class, 'update'])->name('settings.schedule.update');

      // Profile
      Route::get('/settings/profile', [ProfileController::class, 'index'])->name('settings.profile.index');
      Route::put('/settings/profile', [ProfileController::class, 'update'])->name('settings.profile.update');

      // analytic
      Route::get('/analytic/poin', [AnalyticPoinController::class, 'index'])->name('analytic.poin.index');
      Route::get('/analytic/sales', [AnalyticSalesController::class, 'index'])->name('analytic.sales.index');
      Route::get('/analytic/product', [AnalyticProductController::class, 'index'])->name('analytic.product.index');
      Route::get('/analytic/customer', [AnalyticCustomerController::class, 'index'])->name('analytic.customer.index');
      Route::get('/analytic/feedback', [\App\Http\Controllers\Outlet\AnalyticFeedbackController::class, 'index'])->name('analytic.feedback.index');

      // banner
      Route::resource('banners', BannerController::class);

      // feedback questions
      Route::resource('feedback-questions', FeedbackQuestionController::class);
      Route::get('feedback-questions/{id}/analysis', [\App\Http\Controllers\Outlet\FeedbackQuestionController::class, 'analysis'])->name('feedback-questions.analysis');
    });
  });
