<x-panel-layout title="Manajemen Atribut Produk">
    <div class="p-4">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Manajemen Atribut Produk</h5>
                <div>
                    <x-button.create 
                        :url="route('outlets.product-attributes.create', [$currentOutlet->slug])"
                        text="Tambah Atribut Produk"
                    />
                </div>
            </div>
            <div class="card-body">
                <form action="" class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
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
                                <th>Nama</th>
                                <th>Tampilan</th>
                                <th>Total Variasi</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($productAttributes as $index => $attribute)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>{{ $attribute->name }}</td>
                                    <td>
                                        {{ $attribute->displayTypeLabel }}
                                    </td>
                                    <td>
                                        {{ $attribute->values_count }}
                                    </td>
                                    <td>
                                        <a href="{{ route('outlets.product-attributes.values.index', [$currentOutlet->slug, $attribute->id]) }}" class="btn btn-secondary btn-sm">
                                            <i class="mdi mdi-eye-outline me-1"></i>
                                            Lihat Variasi
                                        </a>
                                        <x-button.edit 
                                            :url="route('outlets.product-attributes.edit', [$currentOutlet->slug, $attribute->id])"
                                            :text="__('Edit')"
                                        />
                                        <x-button.delete 
                                            :url="route('outlets.product-attributes.destroy', [$currentOutlet->slug, $attribute->id])"
                                        />
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center">Tidak ada data atribut produk.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <x-filter.pagination :data="$productAttributes" />
            </div>
        </div>
    </div>
</x-panel-layout>
