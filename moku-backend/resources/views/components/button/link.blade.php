@props(['url' => null])
<a href="{{ $url }}" {{ $attributes->merge(['class' => 'btn waves-effect waves-light']) }}>
    {{ $slot }}
</a>
