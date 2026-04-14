<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\View;

class SetCurrentOutlet
{
    public function handle(Request $request, Closure $next)
    {
        $outlet = $request->route('outlet');

        // Pastikan outlet valid dan berupa model
        if (is_object($outlet)) {
            // Bagikan ke semua view
            View::share('currentOutlet', $outlet);
            // Simpan juga di container agar bisa diakses di seluruh app
            app()->instance('currentOutlet', $outlet);
        }

        return $next($request);
    }
}
