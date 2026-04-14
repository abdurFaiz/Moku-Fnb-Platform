@props(['name', 'id', 'value' => 1, 'checked' => false])

@php
    $inputClasses = 'form-check-input';

    if ($errors->has($name)) {
        $inputClasses .= ' is-invalid';
    }
@endphp

<div class="form-check">
    <input type="radio" name="{{ $name }}" value="{{ $value }}" id="{{ $id }}"
        {!! $attributes->merge(['class' => $inputClasses]) !!} @checked($checked) />
    <label class="form-check-label" for="{{ $id }}">
        {{ $slot }}
    </label>
</div>
