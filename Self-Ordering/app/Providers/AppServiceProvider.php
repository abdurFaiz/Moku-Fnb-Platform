<?php

namespace App\Providers;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\ServiceProvider;
use Opcodes\LogViewer\Facades\LogViewer;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Prevent lazy loading in local or staging development
        Model::preventLazyLoading(! $this->app->isProduction());

        // Use bootstrap for pagination
        Paginator::useBootstrapFive();

        LogViewer::auth(function ($request) {
            if ($request->user()) {
                if ($request->user()->hasRole('admin spinotek') || $request->user()->hasRole('outlet')) {
                    return true;
                }
            }
        });
    }
}
