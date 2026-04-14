<?php

use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\Spinotek\BannerController;
use App\Http\Controllers\Spinotek\OperationalScheduleController;
use App\Http\Controllers\Spinotek\CashierController;
use App\Http\Controllers\Spinotek\DashboardController;
use App\Http\Controllers\Spinotek\MiniOutletController;
use App\Http\Controllers\Spinotek\OutletController;
use App\Http\Controllers\Spinotek\OutletGroupController;
use App\Http\Controllers\Spinotek\ProfileController;
use Illuminate\Support\Facades\Route;

// Admin Spinotek Login Routes
Route::get('/admin/spinotek/login', [AdminLoginController::class, 'showLoginForm'])->name('spinotek.login');
Route::post('/admin/spinotek/login', [AdminLoginController::class, 'login'])->name('spinotek.login.post');

Route::prefix('/spinotek')
    ->middleware(['auth', 'role:admin spinotek'])
    ->as('spinotek.')
    ->group(function () {
        Route::get('/admin/dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::post('admin/logout', [AdminLoginController::class, 'logout'])->name('logout');

        Route::post('outlets/duplicate', [OutletController::class, 'duplicate'])->name('outlets.duplicate');
        Route::resource('outlets', OutletController::class);
        Route::resource('outlet-groups', OutletGroupController::class)->parameters(['outlet-groups' => 'outletGroup:slug']);
        Route::resource('cashiers', CashierController::class)->except(['show', 'index']);

        // Operational Schedule Routes
        Route::get('outlets/{outlet}/schedule', [OperationalScheduleController::class, 'index'])->name('outlets.schedule.index');
        Route::put('outlets/{outlet}/schedule', [OperationalScheduleController::class, 'update'])->name('outlets.schedule.update');

        // Banner Routes
        Route::resource('outlets.banners', BannerController::class)
            ->except(['show'])
            ->parameters(['outlets' => 'outlet:slug']);

        // profile routes
        Route::get('profile', [ProfileController::class, 'index'])->name('profile.index');
        Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');
    });
