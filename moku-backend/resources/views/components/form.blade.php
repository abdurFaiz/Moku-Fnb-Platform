@props(['method' => 'POST'])

<form {{ $attributes }} x-data="{ loading: false }" method="{{ $method }}" @submit="loading = !loading">
    @if ($method != 'GET')
        @csrf
    @endif
    {{ $slot }}
</form>
