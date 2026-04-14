<form action="{{ $action }}" method="POST">
    @if (@$productAttribute)
        @method('PUT')
    @endif
    @csrf
    <div class="d-grid">
        <div class="mb-3">
            <x-form.input-label :required="true">Nama Atribut</x-form.input-label>
            <x-form.input name="name" placeholder="masukkan nama atribut" :value="@$productAttribute->name" required />
        </div>
        <div class="mb-3">
            <x-form.input-label :required="true">Tipe Atribut</x-form.input-label>
            <x-form.select name="display_type" placeholder="pilih tipe atribut" required>
                <option value="">Pilih Tipe Atribut</option>
                <option value="1" @if (@$productAttribute->display_type == 1) selected @endif>Radio</option>
                <option value="2" @if (@$productAttribute->display_type == 2) selected @endif>Multi Checkbox</option>
            </x-form.select>
        </div>
        
        <x-button.submit>Simpan</x-button.submit>
    </div>
</form>
