<x-form method="POST" action="{{ $action }}" enctype="multipart/form-data">
    @if (@$banner)
        @method('PUT')
    @endif
    @csrf
    <div class="mb-3">
        <x-form.input-label :required="true">Link</x-form.input-label>
        <x-form.input type="text" name="link" placeholder="masukkan link"
            required value="{{ old('link', @$banner->link) }}" />
        <x-form.input-error name="link" />
    </div>
    <div class="mb-3">
        <x-form.input-label :required="@$banner ? false : true">Gambar Banner @if (@$banner) <small>(Kosongkan jika tidak ada perubahan)</small> @endif</x-form.input-label>
        <p class="text-muted">Unggah gambar dengan format JPG, PNG, atau JPEG. Disarankan ukuran 800 x 500 px.</p>
        <x-form.input type="file" name="banner" accept="image/*" :required="@$banner ? false : true" />
        <x-form.input-error name="banner" />
    </div>

    <x-button.submit>
        Simpan
    </x-button.submit>
</x-form>
