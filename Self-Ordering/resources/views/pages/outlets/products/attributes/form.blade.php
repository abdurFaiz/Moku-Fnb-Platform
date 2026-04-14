<x-panel-layout title="Manajemen Atribut Produk">
    <div class="p-4">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title">Manajemen Atribut Produk</h5>
                        <div>
                            <x-button.back :url="route('outlets.product-attributes.index', [$currentOutlet->slug])" />
                        </div>
                    </div>
                    <div class="card-body">
                        <x-form action="{{ $action }}" method="POST">
                            @if (@$productAttribute)
                                @method('PUT')
                            @endif
                            @csrf
                            <div class="d-grid">
                                <div class="row">
                                    <div class="col">
                                        <div class="mb-3">
                                            <x-form.input-label :required="true">Nama Atribut</x-form.input-label>
                                            <x-form.input name="name" placeholder="masukkan nama atribut"
                                                :value="@$productAttribute->name" required />
                                        </div>
                                    </div>
                                    <div class="col">
                                        <div class="mb-3">
                                            <x-form.input-label :required="true">Tipe Atribut</x-form.input-label>
                                            <x-form.select name="display_type" placeholder="pilih tipe atribut"
                                                required>
                                                <option value="">Pilih Tipe Atribut</option>
                                                <option value="1"
                                                    @if (@$productAttribute->display_type == 1) selected @endif>Radio
                                                </option>
                                                <option value="2"
                                                    @if (@$productAttribute->display_type == 2) selected @endif>Multi
                                                    Checkbox
                                                </option>
                                            </x-form.select>
                                        </div>
                                    </div>

                                    <div class="table-responsive">
                                        <table id="attributes-table" class="table table-striped table-hover">
                                            <thead>
                                                <tr class="fw-semibold">
                                                    <td>
                                                        Nama Variasi <span class="text-danger">*</span>
                                                    </td>
                                                    <td>Extra Harga</td>
                                                    <td class="text-center">Default</td>
                                                    <td>Aksi</td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                @if (@$productAttribute && count(@$productAttribute->values) > 0)
                                                    @foreach (@$productAttribute->values as $key => $value)
                                                        <tr class="variation-row align-middle">
                                                            <td>
                                                                <x-form.input name="valueName[{{ $value->id }}]"
                                                                    placeholder="masukkan nama variasi"
                                                                    :value="old(
                                                                        'valueName.' . $value->id,
                                                                        @$value->name,
                                                                    )" required />
                                                            </td>
                                                            <td>
                                                                <x-form.input
                                                                    name="valueExtraPrice[{{ $value->id }}]"
                                                                    placeholder="masukkan harga variasi"
                                                                    :value="old(
                                                                        'valueExtraPrice.' . $value->id,
                                                                        @$value->extra_price,
                                                                    )" />
                                                            </td>
                                                            <td class="text-center">
                                                                <input type="checkbox" name="default_variant"
                                                                    value="{{ $value->id }}"
                                                                    class="form-check-input default-variant-checkbox"
                                                                    @if (@$value->is_default) checked @endif>
                                                            </td>
                                                            <td>
                                                                <a href="#!" class="btn btn-sm btn-success"
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target=".product-attribute-value-form"
                                                                    data-url="{{ route('outlets.product-attributes.values.edit', [$currentOutlet->slug, $productAttribute, $value]) }}"
                                                                    data-title="Edit Nilai Attribut">
                                                                    <i class="mdi mdi-square-edit-outline"></i>
                                                                </a>
                                                                <x-button.delete :url="route(
                                                                    'outlets.product-attributes.values.destroy',
                                                                    [$currentOutlet->slug, $productAttribute, $value],
                                                                )" :hasText="false" />
                                                            </td>
                                                        </tr>
                                                    @endforeach
                                                @else
                                                    <tr class="variation-row align-middle">
                                                        <td>
                                                            <x-form.input name="valueName[]"
                                                                placeholder="masukkan nama variasi" :value="old(
                                                                    'valueName.0',
                                                                    @$productAttribute->valueName[0],
                                                                )"
                                                                required />
                                                        </td>
                                                        <td>
                                                            <x-form.input name="valueExtraPrice[]"
                                                                placeholder="masukkan harga variasi"
                                                                :value="old(
                                                                    'valueExtraPrice.0',
                                                                    @$productAttribute->valueExtraPrice[0],
                                                                )" />
                                                        </td>
                                                        <td class="text-center">
                                                            <input type="checkbox" name="default_variant" value="0"
                                                                class="form-check-input default-variant-checkbox">
                                                        </td>
                                                        <td>
                                                            <button type="button"
                                                                class="btn btn-danger btn-sm remove-row">
                                                                <i class="mdi mdi-trash-can-outline"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                @endif
                                                <tr id="add-row-tr">
                                                    <td colspan="4" class="text-center">
                                                        <button type="button" id="add-row"
                                                            class="btn btn-secondary btn-sm">
                                                            <i class="fas fa-plus me-1"></i>
                                                            Tambah baris
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <x-button.submit>Simpan</x-button.submit>
                            </div>
                        </x-form>

                    </div>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            $(function() {
                // Template baris baru
                const rowTemplate = `
                <tr class="variation-row align-middle">
                    <td>
                        <input type="text" name="valueName[${Date.now()}]" class="form-control" placeholder="masukkan nama variasi" required>
                    </td>
                    <td>
                        <input type="number" name="valueExtraPrice[${Date.now()}]" class="form-control" placeholder="masukkan harga variasi">
                    </td>
                    <td class="text-center">
                        <input type="checkbox" name="default_variant" value="${Date.now()}" class="form-check-input default-variant-checkbox">
                    </td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm remove-row">
                            <i class="mdi mdi-trash-can-outline"></i>
                        </button>
                    </td>
                </tr>
            `;

                // Tambah baris sebelum baris tombol tambah
                $('#add-row').on('click', function() {
                    $('#add-row-tr').before(rowTemplate);
                });

                // Hapus baris
                $(document).on('click', '.remove-row', function() {
                    $(this).closest('tr').remove();
                });

                // Checkbox single selection logic
                $(document).on('change', '.default-variant-checkbox', function() {
                    if ($(this).is(':checked')) {
                        $('.default-variant-checkbox').not(this).prop('checked', false);
                    }
                });
            });
        </script>
    @endpush

    <x-modal.dynamic class="product-attribute-value-form" />
</x-panel-layout>
