<x-panel-layout title="Manajemen Produk Attribut">
    @include('includes.helpers.format-rupiah')

    <div class="p-4">
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">Manajemen Produk Attribut {{ $attribute->name }}</h5>
                <div>
                    <a href="#!" class="btn btn-primary" data-bs-toggle="modal"
                        data-bs-target=".product-attribute-value-form"
                        data-url="{{ route('outlets.product-attributes.values.create', [$currentOutlet->slug, $attribute]) }}"
                        data-title="Tambah Nilai Attribut">
                        <i class="mdi mdi-plus-circle me-1"></i>
                        Tambah Nilai Attribut
                    </a>
                    <x-button.back :url="route('outlets.product-attributes.index', $currentOutlet->slug)" />
                </div>
            </div>
            <div class="card-body">
                <form action=""
                    class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                    <div class="d-flex align-items-center gap-3">
                        <x-filter.rows />
                    </div>
                    <div>
                        <x-filter.input-search placeholder="Cari Variasi Attribut..." />
                    </div>
                </form>
                <div class="table-responsive">
                    <table class="table table-striped">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama</th>
                                <th>Extra Harga</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($values as $index => $value)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>{{ $value->name }}</td>
                                    <td>{{ rupiahFormat($value->extra_price) }}</td>
                                    <td>
                                        <a href="#!" class="btn btn-sm btn-success" data-bs-toggle="modal"
                                            data-bs-target=".product-attribute-value-form"
                                            data-url="{{ route('outlets.product-attributes.values.edit', [$currentOutlet->slug, $attribute, $value]) }}"
                                            data-title="Edit Nilai Attribut">
                                            <i class="mdi mdi-square-edit-outline me-1"></i>
                                            {{ __('Edit') }}
                                        </a>
                                        <x-button.delete :url="route('outlets.product-attributes.values.destroy', [
                                            $currentOutlet->slug,
                                            $attribute,
                                            $value,
                                        ])" />
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center">Tidak ada data nilai attribut.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <x-filter.pagination :data="$values" />
            </div>
        </div>
    </div>

    <x-modal.dynamic class="product-attribute-value-form" />
</x-panel-layout>
