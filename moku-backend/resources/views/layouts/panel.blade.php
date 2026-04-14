@props(['bgClass' => 'bg-light-100'])

<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    @include('layouts.includes.meta')
    <title>{{ config('app.name', 'Laravel') }}</title>
    @include('layouts.includes.styles')
    @stack('styles')
    @livewireStyles
</head>

<body data-sidebar="light" class="{{ $bgClass }}">
    <script>
        if (window.innerWidth >= 768 && window.innerWidth <= 1366) {
            document.body.setAttribute('data-sidebar-size', 'sm');
        }
    </script>
    <div id="layout-wrapper" data-outlet-id="{{ optional(auth()->user())->outlet_id }}">
        @php
            $theme = 'primary'; // Options: 'light', 'primary'
        @endphp
        @include('layouts.includes.navbar', ['theme' => $theme])
        @include('layouts.includes.sidebar', ['theme' => $theme])

        <div class="main-content">
            <div class="page-content">
                <div class="container-fluid min-h-screen px-0">
                    {{ $slot }}
                </div>
            </div>
        </div>
    </div>

    @stack('modals')
    @include('layouts.includes.scripts')
    @stack('scripts')
    @livewireScripts
</body>

</html>
