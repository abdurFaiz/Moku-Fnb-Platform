@props([
    'url' => null,
    'hasIcon' => true,
    'hasText' => true,
    'text' => 'Delete',
    'size' => 'sm',
    'itemName' => null,
    'redirect' => null,
])

@php
    $btnSize = 'btn-md';

    if ($size == 'sm') {
        $btnSize = 'btn-sm';
    } elseif ($size == 'lg') {
        $btnSize = 'btn-lg';
    }
@endphp

<button type="button" class="btn btn-danger waves-effect waves-light action-delete {{ $btnSize }}"
    data-url="{{ $url }}" data-item="{{ $itemName }}" data-redirect="{{ $redirect }}"
    {!! $attributes !!}>
    @if ($hasIcon)
        <i class="mdi mdi-trash-can-outline {{ $hasText ? 'me-1' : '' }}"></i>
    @endif

    @if ($hasText)
        {{ $text }}
    @endif
</button>
