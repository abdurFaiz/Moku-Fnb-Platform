<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class RedirectIfOutletAuthenticated
{
    public function handle($request, Closure $next)
    {
        if (Auth::check() && Auth::user()->hasRole('outlet')) {
            // Dapatkan outlet dari route
            $outlet = $request->route('outlet');

            // Arahkan ke dashboard outlet terkait
            return redirect()->route('outlets.dashboard', ['outlet' => $outlet->slug]);
        }

        return $next($request);
    }
}
