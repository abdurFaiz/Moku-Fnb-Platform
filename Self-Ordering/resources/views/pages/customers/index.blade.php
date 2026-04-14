<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="ltr">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, minimal-ui">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#FF6B35">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="{{ config('app.name', 'Self Order') }}">
    <meta name="application-name" content="{{ config('app.name', 'Self Order') }}">
    <meta name="description" content="Order makanan langsung dari meja Anda dengan mudah dan cepat">
    <meta name="format-detection" content="telephone=no">
    <title>{{ config('app.name', 'Self Ordering System') }}</title>

    <!-- PWA assets -->
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/icons/pwa-192x192.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon-180x180.png">
    <link rel="icon" type="image/png" sizes="512x512" href="/icons/pwa-512x512.png">
    <link rel="icon" type="image/png" sizes="192x192" href="/icons/pwa-192x192.png">
    <link rel="icon" type="image/png" sizes="64x64" href="/icons/pwa-64x64.png">
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <!-- Preload critical assets -->
    <link rel="preconnect" href="{{ url('/') }}">
    <link rel="dns-prefetch" href="{{ url('/') }}">

    <!-- Styles and Scripts -->
    @viteReactRefresh
    @vite(['resources/frontend/css/app.css', 'resources/frontend/src/App.jsx'])
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
        rel="stylesheet">
</head>

<body>
    <noscript>
        <div style="padding: 20px; text-align: center;">
            <p>This application requires JavaScript to be enabled. Please enable JavaScript to continue.</p>
        </div>
    </noscript>
    <div id="app"></div>
</body>

</html>
