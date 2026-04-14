@props(['name' => null])

<input type="file" name="{{ $name }}" {!! $attributes->merge(['class' => 'dropify']) !!} {!! $attributes !!} />
