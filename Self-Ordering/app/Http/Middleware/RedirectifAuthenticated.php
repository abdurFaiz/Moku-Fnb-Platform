<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectifAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check() && Auth::user()->hasRole('outlet')) {
            // Dapatkan outlet dari route
            $outlet = Auth::user()->outlet;

            // Arahkan ke dashboard outlet terkait
            return redirect()->route('outlets.dashboard', ['outlet' => $outlet->slug]);
        } else if (Auth::check() && Auth::user()->hasRole('admin spinotek')) {
            // Arahkan ke dashboard admin spinotek
            return redirect()->route('spinotek.dashboard');
        }

        return $next($request);
    }
}
