@props(['name', 'id' => 'editor', 'value' => ''])
<textarea name="{{ $name }}" id="{{ $id }}" {!! $attributes->merge(['class' => 'form-control']) !!} {!! $attributes !!}>{{ old($name, $value) }}</textarea>

@push('scripts')
    <script>
        tinymce.init({
            selector: 'textarea#{{ $id }}',
            plugins: 'code table lists codesample',
            toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | indent outdent | bullist numlist | code | table'
        });
    </script>
@endpush
