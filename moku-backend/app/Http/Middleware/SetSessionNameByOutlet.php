<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Str;
use Illuminate\Http\Request;

class SetSessionNameByOutlet
{
    // SetSessionNameByOutlet.php
    public function handle($request, Closure $next)
    {
        if ($outlet = $request->route('outlet')) {
            $slug = is_string($outlet) ? $outlet : $outlet->slug;
            config(['session.cookie' => 'session_' . $slug]);
        }

        return $next($request);
    }
}
