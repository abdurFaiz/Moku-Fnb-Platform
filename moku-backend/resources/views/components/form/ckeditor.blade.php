@props(['name' => null, 'id' => 'editor', 'value' => '', 'placeholder' => 'Type your content here...'])
<textarea name="{{ $name }}" id="{{ $id }}" {!! $attributes->merge(['class' => 'form-control']) !!} {!! $attributes !!}>{{ old($name, $value) }}</textarea>

@push('scripts')
    <script>
        ClassicEditor.create(document.querySelector("#{{ $id }}"), {
                // hidden ckeditor toolbar
                toolbar: {
                    items: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'underline',
                        'strikethrough',
                        'subscript',
                        'superscript',
                        '|',
                        'fontColor',
                        'fontBackgroundColor',
                        'highlight',
                        '|',
                        'alignment',
                        'bulletedList',
                        'numberedList',
                        'codeblock',
                        '|',
                        'indent',
                        'outdent',
                        '|',
                        'link',
                        'blockQuote',
                        'insertTable',
                        'mediaEmbed',
                        '|',
                        'undo',
                        'redo'
                    ]
                },
                // ckeditor placeholder
                placeholder: '{{ $placeholder }}',
            })
            .catch((error) => {
                console.error(error);
            });
    </script>
@endpush
