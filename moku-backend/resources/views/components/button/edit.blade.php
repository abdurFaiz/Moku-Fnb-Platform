@props(['url' => null, 'hasIcon' => true, 'hasText' => true, 'text' => 'Edit', 'size' => 'sm'])

@php
    $btnSize = 'btn-md';

    if ($size == 'sm') {
        $btnSize = 'btn-sm';
    } elseif ($size == 'lg') {
        $btnSize = 'btn-lg';
    }
@endphp

<a href="{{ $url }}" class="btn btn-success waves-effect waves-light shadow-sm {{ $btnSize }}"
    {!! $attributes !!}>
    @if ($hasIcon)
        <i class="mdi mdi-square-edit-outline {{ $hasText ? 'me-1' : '' }}"></i>
    @endif

    @if ($hasText)
        {{ $text }}
    @endif
</a>
