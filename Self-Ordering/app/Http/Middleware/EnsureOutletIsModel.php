<?php

namespace App\Http\Middleware;

use App\Models\Outlet;
use Closure;
use Illuminate\Http\Request;

class EnsureOutletIsModel
{
    public function handle(Request $request, Closure $next)
    {
        $outletParam = $request->route('outlet');

        // Jika parameter masih string (belum jadi model)
        if (is_string($outletParam)) {
            $outlet = Outlet::where('slug', $outletParam)->firstOrFail();

            // Ganti parameter di route dengan model
            $request->route()->setParameter('outlet', $outlet);
        }

        return $next($request);
    }
}
