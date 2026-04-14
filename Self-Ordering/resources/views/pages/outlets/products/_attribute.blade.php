<x-panel-layout title="Manajemen Produk">
    <div class="p-4">
        @include('pages.outlets.products._header')

        <div class="card">
            <div class="card-body">
                <x-form action="" method="POST">
                    <div class="d-grid">
                        <div class="table-responsive">
                            <table class="table table-striped table-hover" id="attribute-table">
                                <thead>
                                    <tr>
                                        <th>Atribut Produk</th>
                                        <th>Nilai Atribut</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr class="variation-row align-middle">
                                        <td>
                                            <x-form.select name="attributeId[]" class="attribute-select" required>
                                                <option value="">Pilih Atribut</option>
                                                @foreach ($productAttributes as $productAttribute)
                                                    <option value="{{ $productAttribute->id }}" data-route="{{ route('outlets.products.settings.attributes.values.index', [$currentOutlet->slug, $productAttribute->id]) }}">{{ $productAttribute->name }}</option>
                                                @endforeach
                                            </x-form.select>
                                        </td>
                                        <td class="attribute-values-cell"></td>
                                        <td>
                                            <button type="button" class="btn btn-danger btn-sm remove-row">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr id="add-row-tr">
                                        <td colspan="3" class="text-center">
                                            <button type="button" id="add-row" class="btn btn-secondary btn-sm">
                                                <i class="fas fa-plus me-1"></i>
                                                Tambah baris
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <x-button.submit>
                            Simpan
                        </x-button.submit>
                    </div>
                </x-form>
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            $(document).ready(function (url) {                
                // Load attribute values via AJAX
                function loadAttributeValues(selectElement) {
                    const attributeId = $(selectElement).val();
                    const $valuesCell = $(selectElement).closest('tr').find('.attribute-values-cell');

                    if (!attributeId) {
                        $valuesCell.empty();
                        return;
                    }

                    $.ajax({
                        url: attributeValuesUrl,
                        type: 'GET',
                        data: { attribute_id: attributeId },
                        success: function (data) {
                            let html = '';
                            if (data.length) {
                                html += '<ul class="list-unstyled mb-0">';
                                data.forEach(function (value) {
                                    html += `<li>${value.name}</li>`;
                                });
                                html += '</ul>';
                            } else {
                                html = '<span class="text-muted">Tidak ada nilai</span>';
                            }
                            $valuesCell.html(html);
                        },
                        error: function () {
                            $valuesCell.html('<span class="text-danger">Gagal memuat nilai</span>');
                        }
                    });
                }

                // Trigger on change for existing and future rows
                $(document).on('change', '.attribute-select', function () {
                    const attributeRoute = $(this).find('option:selected').data('route');
                    if (attributeRoute) {
                        loadAttributeValues(this);
                    }
                });

                // Add new row
                $('#add-row').click(function () {
                    const newRow = `
                        <tr class="variation-row align-middle">
                            <td>
                                <x-form.select name="attributeId[]" class="attribute-select" required>
                                    <option value="">Pilih Atribut</option>
                                    @foreach ($productAttributes as $productAttribute)
                                        <option value="{{ $productAttribute->id }}">{{ $productAttribute->name }}</option>
                                    @endforeach
                                </x-form.select>
                            </td>
                            <td class="attribute-values-cell"></td>
                            <td>
                                <button type="button" class="btn btn-danger btn-sm remove-row">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>`;
                    $('#add-row-tr').before(newRow);
                });

                // Remove row
                $(document).on('click', '.remove-row', function () {
                    $(this).closest('tr').remove();
                });
            });
        </script>
    @endpush
</x-panel-layout>
