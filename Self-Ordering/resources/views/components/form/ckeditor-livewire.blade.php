@props(['name', 'id' => 'ckeditor', 'value' => ''])
<div wire:ignore.self>
    <textarea name="{{ $name }}" {!! $attributes->merge(['class' => 'form-control']) !!} {!! $attributes !!} id="{{ $id }}"></textarea>

    <script>
        ClassicEditor.create(document.querySelector("#{{ $id }}"), {
                simpleUpload: {
                    // The URL that the images are uploaded to.
                    uploadUrl: "{{ route('ckeditor.upload') . '?_token=' . csrf_token() }}",
                }
            }).then(editor => {
                // editor.setData(`{!! $value !!}`),
                // editor.setData(@this.get(`{{ $name }}`)),
                editor.model.document.on('change:data', () => {
                    @this.set(`{{ $name }}`, editor.getData());
                })
            })
            .catch((error) => {
                console.error(error);
            });
    </script>
</div>
