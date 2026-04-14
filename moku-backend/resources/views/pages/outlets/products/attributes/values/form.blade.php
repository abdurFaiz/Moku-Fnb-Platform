<x-form action="{{ $action }}" method="POST">

    @if (@$value)
        @method('PUT')
    @endif
    @csrf
    <div class="d-grid">
        <div class="mb-3">
            <x-form.input-label :required="true">Nama</x-form.input-label>
            <x-form.input name="name" placeholder="masukkan nama atribut" :value="@$value->name" required />
        </div>
        <div class="mb-3">
            <x-form.input-label :required="true">Extra Harga</x-form.input-label>
            <x-form.input-group-currency>
                <x-form.input id="extra_price_display" name="extra_price_display" placeholder="masukkan harga atribut" :value="thousandSeparator(@$value->extra_price)" data-format="rupiah" required />
            </x-form.input-group-currency>
            <input type="hidden" id="extra_price" name="extra_price" value="{{ old('extra_price', @$value->extra_price) }}" required>
        </div>
        
        <x-button.submit>Simpan</x-button.submit>
    </div>
</x-form>
