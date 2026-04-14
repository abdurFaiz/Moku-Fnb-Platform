<x-panel-layout title="Manajemen Produk Attribut">
    <div class="p-4">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Daftar Attribut Produk {{ $product->name }}</h5>
                <div>
                    <x-button.back :url="route('outlets.products.index', [$currentOutlet->slug])" />
                </div>
            </div>
            <div class="card-body">
                <div class="d-flex align-items-center gap-2 mb-3">
                    <x-form
                        action="{{ route('outlets.products.settings.attributes.store', [$currentOutlet->slug, $product->id]) }}"
                        class="d-flex align-items-center gap-2">
                        <x-form.select name="attribute_id" required>
                            <option value="">Pilih Attribut</option>
                            @foreach ($productAttributes as $productAttribute)
                                <option value="{{ $productAttribute->id }}">{{ $productAttribute->name }}</option>
                            @endforeach
                        </x-form.select>
                        <button type="submit" class="btn btn-primary text-nowrap">
                            <i class="mdi mdi-plus me-1"></i>
                            Tambah
                        </button>
                    </x-form>
                </div>
                <form action=""
                    class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                    <div class="d-flex align-items-center gap-3">
                        <x-filter.rows />
                    </div>
                    <div>
                        <x-filter.input-search placeholder="Cari Produk Attribut..." />
                    </div>
                </form>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Atribut</th>
                                <th>Variasi</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($productVariants as $index => $variant)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>{{ $variant->productAttribute->name }}</td>
                                    <td>
                                        @foreach ($variant->productAttribute->values as $value)
                                            <span class="badge text-bg-secondary me-1">{{ $value->name }}</span>
                                        @endforeach
                                    </td>
                                    <td>
                                        <x-button.delete :url="route('outlets.products.settings.attributes.destroy', [
                                            $currentOutlet->slug,
                                            $product->id,
                                            $variant->id,
                                        ])" />
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center">Tidak ada data atribut produk.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <x-filter.pagination :data="$productVariants" />
            </div>
        </div>
    </div>
</x-panel-layout>
