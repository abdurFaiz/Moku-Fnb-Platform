@props(['name' => null])

@php
    $classes = 'form-control';

    if ($errors->has($name)) {
        $classes .= ' is-invalid';
    }
@endphp

<textarea name="{{ $name }}" {!! $attributes->merge(['class' => $classes]) !!} {!! $attributes !!}>{{ $slot }}</textarea>
