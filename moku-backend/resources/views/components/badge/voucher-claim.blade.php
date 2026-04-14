@props(['status'])

@php
    switch ($status) {
        case 1:
            $bg = 'success-subtle';
            $color = 'success';
            break;
        case 2:
            $bg = 'info-subtle';
            $color = 'info';
            break;
        default:
            $bg = 'default';
            $color = 'default';
            break;
    }
@endphp

<span
    class="badge rounded-pill fw-medium bg-{{ $bg }} {{ @$color ? 'text-'. $color : '' }}">
    {{ $slot }}
</span>