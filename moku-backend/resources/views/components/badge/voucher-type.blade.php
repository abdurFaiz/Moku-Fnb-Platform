@props(['status'])

@php
    switch ($status) {
        case 1:
            $bg = 'primary-subtle';
            $color = 'primary';
            break;
        case 2:
            $bg = 'secondary-subtle';
            $color = 'secondary';
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