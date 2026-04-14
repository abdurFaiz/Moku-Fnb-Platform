<form wire:submit.prevent="store" enctype="multipart/form-data">
    <div class="d-grid">
        <div class="row">
            <div class="col">
                <div class="mb-3">
                    <x-form.input-label :required="true">Nama Produk</x-form.input-label>
                    <input type="text" class="form-control" wire:model="name" placeholder="masukkan nama produk" required />
                    <x-form.input-error name="name" />
                </div>
            </div>
            <div class="col">
                <div class="mb-3">
                    <x-form.input-label :required="true">Harga Produk</x-form.input-label>
                    <input type="number" class="form-control" wire:model="price" placeholder="masukkan harga produk" required />
                    <x-form.input-error name="price" />
                </div>  
            </div>
        </div>
        <div class="mb-3">
            <x-form.input-label :required="true">Kategori</x-form.input-label>
            <select class="form-select" wire:model="category_id" required>
                <option value="">Pilih Kategori</option>
                @foreach ($categories as $category)
                    <option value="{{ $category->id }}">{{ $category->name }}</option>
                @endforeach
            </select>
            <x-form.input-error name="category_id" />
        </div>
        <div class="mb-3">
            <x-form.input-label :required="true">Deskripsi</x-form.input-label>
            <textarea class="form-control" wire:model="description" placeholder="masukkan deskripsi produk" required></textarea>
            <x-form.input-error name="description" />
        </div>
        <div class="mb-3">
            <x-form.input-label :required="true">Gambar</x-form.input-label>
            <input type="file" class="form-control" wire:model="image" required />
            <x-form.input-error name="image" />
        </div>

        <button type="submit" class="btn btn-primary">
            Simpan
        </button>
    </div>
</form>
