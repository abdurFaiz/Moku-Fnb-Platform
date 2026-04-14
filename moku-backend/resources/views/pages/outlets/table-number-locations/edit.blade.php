<x-form :action="route('outlets.table-number-locations.update', [$currentOutlet->slug, $tableNumberLocation->id])">
    @method('PUT')
    <div class="d-grid">
        <div class="mb-3">
            <x-form.input-label>Nama Lokasi</x-form.input-label>
            <x-form.input name="name" placeholder="cth. Indoor" :value="$tableNumberLocation->name" required />
        </div>
        <x-button.submit>Simpan</x-button.submit>
    </div>
</x-form>
