@props(['url' => request()->url()])

<a href="{{ $url }}" {!! $attributes->merge(['class' => 'btn btn-soft-light waves-effect waves-light']) !!}>
    <i class="bx bx-reset me-1"></i> Reset
</a>
