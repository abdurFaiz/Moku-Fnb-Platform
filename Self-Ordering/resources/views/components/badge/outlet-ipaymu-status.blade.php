@props(['outlet'])

@php
    if ($outlet->va_number != null) {
        $badge = 'soft-success';
    } else {
        $badge = 'soft-danger';
    }
@endphp

<span class="badge rounded-pill fw-medium badge-{{ $badge }}">
    @if ($outlet->va_number != null)
        Aktif
    @else
        Tidak Aktif
    @endif
</span>
