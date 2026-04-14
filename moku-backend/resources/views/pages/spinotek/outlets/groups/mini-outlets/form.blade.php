<x-form action="{{ $action }}" method="POST">
    @if (@$miniOutlet)
        @method('PUT')
    @endif
    @csrf
    <div class="d-grid">
        <div class="mb-3">
            <x-form.input-label :required="true">Nama Mini Outlet</x-form.input-label>
            <x-form.input name="name" placeholder="Masukkan nama mini outlet" :value="@$miniOutlet->name" required />
        </div>

        <x-button.submit>Simpan</x-button.submit>
    </div>
</x-form>
