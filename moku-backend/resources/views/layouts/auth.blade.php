<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    @include('layouts.includes.meta')
    <title>{{ config('app.name', 'Login') }}</title>
    @include('layouts.includes.styles')
    @stack('styles')
    <style>
        .left-section {
            background-color: #fff;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding: 7rem;
            overflow: hidden;
        }

        .right-section {
            background-color: var(--bs-gray-300);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 2rem;
        }
    </style>
</head>

<body>
    <main>
        <div class="container-fluid">
            <div class="row min-h-screen">
                <!-- Left Section -->
                <div class="col-sm-6 left-section d-none d-sm-flex">
                    @include('layouts.includes.auth-left-section')
                </div>

                <!-- Right Section -->
                <div class="col-sm-6 right-section">
                    {{ $slot }}
                </div>
            </div>
        </div>
    </main>

    @include('layouts.includes.scripts')
    @stack('scripts')
    @livewireScripts
</body>

</html>
