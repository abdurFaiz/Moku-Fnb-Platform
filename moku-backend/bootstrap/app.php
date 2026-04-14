<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withBroadcasting(__DIR__ . '/../routes/channels.php')
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'auth' => \App\Http\Middleware\Authenticate::class,
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'ensure.outlet.model' => \App\Http\Middleware\EnsureOutletIsModel::class,
            'ensure.outlet.valid' => \App\Http\Middleware\EnsureOutletValid::class,
            'session.per.outlet' => \App\Http\Middleware\SetSessionNameByOutlet::class,
            'outlet.guest' => \App\Http\Middleware\RedirectIfOutletAuthenticated::class,
            'set.current.outlet' => \App\Http\Middleware\SetCurrentOutlet::class,
            'user.guest' => \App\Http\Middleware\RedirectifAuthenticated::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
