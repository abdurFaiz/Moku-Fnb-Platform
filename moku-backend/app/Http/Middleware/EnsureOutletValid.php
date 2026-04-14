<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class EnsureOutletValid
{
    public function handle($request, Closure $next)
    {
        $outlet = $request->route('outlet');

        // Jika belum login, lewati (nanti dicegat oleh auth middleware)
        if (!Auth::check()) {
            return $next($request);
        }

        // Jika user tidak punya relasi outlet atau outlet berbeda
        if (!Auth::user()->outlet || Auth::user()->outlet->slug !== $outlet->slug) {
            abort(403, 'Unauthorized access to this outlet.');
        }

        return $next($request);
    }
}
