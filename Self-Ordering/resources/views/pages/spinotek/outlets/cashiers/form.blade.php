<x-form :action="$action">
    @if (@$cashier)
        @method('PUT')
    @endif
    <div class="d-grid">
        <div class="mb-3">
            <x-form.input-label :required="true">Nama Kasir</x-form.input-label>
            <x-form.input name="name" placeholder="masukkan nama kasir" :value="@$cashier->name" required />
        </div>
        <div class="mb-3">
            <x-form.input-label :required="true">Email</x-form.input-label>
            <x-form.input type="email" name="email" placeholder="masukkan email kasir" :value="@$cashier->email" required autocomplete="off" />
        </div>
        <div class="mb-3">
            <x-form.input-label :required="true">
                Password
                @if (@$cashier)
                    <small>(Kosongkan jika tidak ada perubahan)</small>
                @endif
            </x-form.input-label>
            {{-- <x-form.input type="password" name="password" placeholder="&bull; &bull; &bull; &bull; &bull; &bull;" autocomplete="off" /> --}}
            <x-form.input-password name="password" placeholder="••••••••" />
        </div>
        <x-button.submit>Simpan</x-button.submit>
    </div>
</x-form>
