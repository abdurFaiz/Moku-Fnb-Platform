@props(['status'])

@php
    switch ($status) {
        case 1:
            $bg = 'secondary';
            break;
        case 2:
            $bg = 'warning';
            break;
        case 3:
            $bg = 'info';
            break;
        case 4:
            $bg = 'success';
            break;
        case '5':
            $bg = 'danger';
            break;
        case '6':
            $bg = 'dark';
            break;
        default:
            $bg = 'default';
            $color = 'default';
            break;
    }
@endphp

<span class="badge rounded-pill fw-medium bg-{{ $bg }} {{ @$color ? 'text-' . $color : '' }}">
    {{ $slot }}
</span>
