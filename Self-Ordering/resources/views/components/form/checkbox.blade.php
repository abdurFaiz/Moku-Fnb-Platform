@props(['name', 'id', 'value' => 1, 'checked' => false])

<div class="form-check">
    <input class="form-check-input" name="{{ $name }}" value="{{ $value }}" type="checkbox"
        id="{{ $id }}" @checked($checked)>
    <label class="form-check-label" for="{{ $id }}">
        {{ $slot }}
    </label>
</div>
