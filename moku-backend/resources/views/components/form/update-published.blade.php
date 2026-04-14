@props(['label' => [], 'id' => 'update-published-', 'data', 'table', 'field' => 'is_published', 'url' => route('published.update')])

<div class="form-check form-switch mb-0">
    <input class="form-check-input" type="checkbox" id="{{ $id }}{{ $data->id }}" data-url="{{ $url }}"
        data-table="{{ $table }}" data-label-on="{{ $label[0] ?? '' }}" data-label-off="{{ $label[1] ?? '' }}"
        onchange="toggleUpdatePublished('{{ $data->id }}', '{{ $field }}', '{{ $id }}{{ $data->id }}')"
        {{ $data->{$field} ? 'checked' : '' }}>
    @if (@$label && is_array($label) && count($label) >= 2)
        <label class="form-check-label" for="{{ $id }}{{ $data->id }}"
            id="label-{{ $field }}-{{ $data->id }}">
            {{ $data->{$field} ? $label[0] : $label[1] }}
        </label>
    @endif
</div>
