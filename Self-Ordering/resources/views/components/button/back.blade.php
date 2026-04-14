@props(['url' => null])

<a href="{{ @$_GET['back'] ?? $url }}" {!! $attributes->merge(['class' => 'btn btn-light shadow-sm waves-effect waves-light']) !!}>
    <i class="fas fa-angle-left me-1"></i> Back
</a>
