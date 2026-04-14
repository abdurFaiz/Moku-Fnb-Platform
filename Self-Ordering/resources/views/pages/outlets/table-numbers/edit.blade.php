<x-form action="{{ $action }}" method="POST">

    @if (@$tableNumber)
        @method('PUT')
    @endif
    @csrf
    <div class="d-grid">        
        <div class="mb-3">
            <x-form.input-label :required="true">Lokasi</x-form.input-label>
            <x-form.select id="table_number_location_id" name="table_number_location_id" required onchange="updateRewardableType()">
                <option value="">Pilih Lokasi</option>
                @foreach ($tableNumberLocations as $tableNumberLocation)
                    <option value="{{ $tableNumberLocation->id }}" {{ $tableNumberLocation->id == old('table_number_location_id', @$tableNumber->table_number_location_id) ? 'selected' : '' }}>{{ $tableNumberLocation->name }}</option>
                @endforeach
            </x-form.select>
        </div>
        <div class="mb-3">
            <x-form.input-label :required="true">Nomor Meja</x-form.input-label>
            <x-form.input id="number" name="number" placeholder="masukkan poin penukaran" :value="old('number', @$tableNumber->number)" required />
        </div>
        
        <x-button.submit>Simpan</x-button.submit>
    </div>
</x-form>
