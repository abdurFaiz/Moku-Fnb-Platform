@props(['url' => null, 'hasIcon' => true, 'hasText' => true, 'text' => null, 'size' => 'md'])

@php
    $btnSize = 'btn-md';

    if ($size == 'sm') {
        $btnSize = 'btn-sm';
    } elseif ($size == 'lg') {
        $btnSize = 'btn-lg';
    }
@endphp

<a href="{{ $url }}" class="btn btn-primary {{ $btnSize }}">
    @if ($hasIcon)
        <i class="mdi mdi-plus-circle {{ $hasText ? 'me-1' : '' }}"></i>
    @endif

    @if ($hasText)
        {{ $text }}
    @endif
</a>
