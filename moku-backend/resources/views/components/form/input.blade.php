@props(['name' => null])

@php
    $classes = 'form-control';

    if ($errors->has($name)) {
        $classes .= ' is-invalid';
    }
@endphp

<input name="{{ $name }}" {!! $attributes->merge(['class' => $classes]) !!} {!! $attributes !!} />
