@props(['status'])

@php
    switch ($status) {
        case 1:
            $bg = 'primary';
            break;
        case 2:
            $bg = 'secondary';
            break;
        default:
            $bg = 'default';
            break;
    }
@endphp

<span class="badge rounded-pill fw-medium bg-{{ $bg }}">
    {{ $slot }}
</span>
