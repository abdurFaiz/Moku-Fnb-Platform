@props(['text' => 'Muat Ulang'])

@props([
    'href' => request()->fullUrlWithoutQuery([
        'row',
        'search',
        'page',
        'email',
        'type',
        'category',
        'level',
        'area',
        'status',
        'product',
        'school_id',
    ]),
    'text' => 'Muat Ulang',
])

<a href="{{ $href }}" {!! $attributes->merge(['class' => 'btn border-dark']) !!}>
    @if (@$text)
        <i class="fas fa-sync-alt me-1"></i> {{ $text }}
    @else
        <i class="fas fa-sync-alt"></i>
    @endif
</a>
