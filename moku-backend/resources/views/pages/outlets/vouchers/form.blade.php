@php
    use Illuminate\Support\Arr;

    $productIds = Arr::wrap(old('product_id'));
    $rowCount = max(count($productIds), 0);

    if ($rowCount === 0) {
        $rowCount = 0;
        $productIds = [''];
    } else {
        $productIds = array_pad($productIds, $rowCount, '');
    }

    // Tentukan apakah klaim tipe adalah admin (2)
    $isAdminClaim = old('claim_type', @$voucher->claim_type ?? '') == 2;
@endphp

<x-panel-layout title="Manajemen Produk">
    @include('includes.helpers.format-rupiah')

    <div class="p-4">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-sm order-2 order-sm-1">
                                <div class="d-flex align-items-center mt-3 mt-sm-0">
                                    <div class="flex-shrink-0">
                                        <div class="me-3">
                                            <div
                                                class="avatar-xl bg-light rounded d-flex align-items-center justify-content-center">
                                                <i class="bx bxs-purchase-tag text-secondary display-5"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex-grow-1">
                                        <div>
                                            <h5 class="font-size-16 mb-0">{{ $title }}</h5>
                                        </div>
                                    </div>
                                    <div class="ms-auto">
                                        <x-button.back :url="route('outlets.vouchers.index', $currentOutlet->slug)" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- end card body -->
                </div>

                <x-form action="{{ $action }}" method="POST" enctype="multipart/form-data">
                    <div class="card">
                        <div class="card-body">
                            @if (@$voucher)
                                @method('PUT')
                            @endif
                            @csrf

                            <div class="d-grid">
                                <div class="row align-items-center">
                                    <div class="col-12 col-md-6">
                                        <div class="mb-3">
                                            <x-form.input-label :required="true">Nama Voucher</x-form.input-label>
                                            <x-form.input type="text" name="name" placeholder="masukkan nama voucher"
                                                required value="{{ old('name', @$voucher->name) }}" />
                                            <x-form.input-error name="name" />
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <div class="mb-3">
                                            <x-form.input-label :required="true">Tipe Harga</x-form.input-label>
                                            <div class="d-flex gap-3">
                                                @foreach ($voucher_price_types as $key => $price_type)
                                                    <div class="form-check">
                                                        <x-form.radio
                                                            name="price_type"
                                                            id="price-type-{{ $key }}"
                                                            :value="$key"
                                                            :checked="old('price_type', @$voucher->price_type ?? '') == $key"
                                                            class="form-check-input"
                                                        />
                                                        <label class="form-check-label" for="price-type-{{ $key }}">
                                                            {{ $price_type }}
                                                        </label>
                                                    </div>
                                                @endforeach
                                            </div>
                                            <x-form.input-error name="price_type" />
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <x-form.input-label :required="true">Kode Voucher</x-form.input-label>
                                    <x-form.input type="text" name="code" placeholder="masukkan kode voucher"
                                        required value="{{ old('code', @$voucher->code) }}" />
                                    <x-form.input-error name="code" />
                                </div>
                                <div class="mb-3" id="discount-percent-group" style="display: none;">
                                    <x-form.input-label :required="true">Diskon Persentase</x-form.input-label>
                                    <x-form.input type="number" name="discount_percent" placeholder="masukkan diskon persentase"
                                                value="{{ old('discount_percent', @$voucher->discount_percent) }}" />
                                    <x-form.input-error name="discount_percent" />
                                </div>
                                <div class="mb-3" id="discount-fix-group" style="display: none;">
                                    <x-form.input-label :required="true">Diskon Fix</x-form.input-label>
                                    <x-form.input-group-currency>
                                        <x-form.input type="text" name="discount_fixed_display" id="discount_fixed_display"
                                            placeholder="masukkan diskon fix"
                                            value="{{ old('discount_fixed_display', @$voucher->discount_fixed) }}" data-format="rupiah" />
                                    </x-form.input-group-currency>
                                    <input type="hidden" id="discount_fixed" name="discount_fixed"
                                        value="{{ old('discount_fixed', @$voucher->discount_fixed) }}">
                                    <x-form.input-error name="discount_fixed" />
                                </div>
                                <div class="row">
                                    <div class="col-12 col-md-6 mb-3">
                                        <x-form.input-label>
                                            Minimal Transaksi
                                            <span class="ms-1" data-bs-toggle="tooltip" data-bs-placement="top" title="Masukkan minimal transaksi yang harus dibayarkan untuk mendapatkan diskon.">
                                                <i class="mdi mdi-help-circle-outline"></i>
                                            </span>
                                        </x-form.input-label>
                                        <x-form.input-group-currency>
                                            <x-form.input type="text" name="min_transaction_display" id="min_transaction_display"
                                                placeholder="masukkan minimal transaksi"
                                                value="{{ old('min_transaction_display', @$voucher->min_transaction) }}" data-format="rupiah" />
                                        </x-form.input-group-currency>
                                        <input type="hidden" id="min_transaction" name="min_transaction"
                                            value="{{ old('min_transaction', @$voucher->min_transaction) }}">
                                        <x-form.input-error name="min_transaction" />
                                    </div>
                                    <div class="col-12 col-md-6 mb-3">
                                        <x-form.input-label>
                                            Maksimal Jumlah Penggunaan
                                            <span class="ms-1" data-bs-toggle="tooltip" data-bs-placement="top" title="Masukkan maksimal jumlah penggunaan voucher.">
                                                <i class="mdi mdi-help-circle-outline"></i>
                                            </span>
                                        </x-form.input-label>
                                        <x-form.input type="number" name="max_usage" placeholder="masukkan minimal jumlah penggunaan"
                                                    value="{{ old('max_usage', @$voucher->max_usage) }}" />
                                        <x-form.input-error name="max_usage" />
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-12 col-md-6 mb-3">
                                        <x-form.input-label :required="true">
                                            Tipe Klaim
                                            <span class="ms-1" data-bs-toggle="tooltip" data-bs-placement="top" title="Klaim Platform: Voucher dapat diklaim oleh pengguna di platform website. Klaim Admin: Voucher harus diklaim melalui admin secara manual.">
                                                <i class="mdi mdi-help-circle-outline"></i>
                                            </span>
                                        </x-form.input-label>
                                        <div class="d-flex gap-3">
                                            @foreach ($voucher_claim_types as $key => $claim_type)
                                                <div class="form-check">
                                                    <x-form.radio
                                                        name="claim_type"
                                                        id="claim_type-{{ $key }}"
                                                        :value="$key"
                                                        :checked="old('claim_type', @$voucher->claim_type ?? '') == $key"
                                                        class="form-check-input toggle-claim-type"
                                                    />
                                                    <label class="form-check-label" for="claim_type-{{ $key }}">
                                                        {{ $claim_type }}
                                                    </label>
                                                </div>
                                            @endforeach
                                        </div>
                                        <x-form.input-error name="claim_type" />
                                    </div>
                                    <div class="col-12 col-md-6 mb-3" id="type-voucher-group" style="{{ $isAdminClaim ? 'display:none;' : '' }}">
                                        <x-form.input-label :required="true">
                                            Tipe Voucher
                                            <span class="ms-1" data-bs-toggle="tooltip" data-bs-placement="top" title="Voucher Public: Voucher dapat digunakan oleh semua pengguna. Voucher Private: Voucher hanya dapat digunakan dengan menginputkan kode voucher dan bisa ditambahkan sebagai reward.">
                                                <i class="mdi mdi-help-circle-outline"></i>
                                            </span>
                                        </x-form.input-label>
                                        <div class="d-flex gap-3">
                                            @foreach ($voucher_types as $key => $type)
                                                <div class="form-check">
                                                    <x-form.radio
                                                        name="type"
                                                        id="type-{{ $key }}"
                                                        :value="$key"
                                                        :checked="old('type', @$voucher->type ?? ($isAdminClaim ? 2 : '')) == $key"
                                                        class="form-check-input toggle-date-fields"
                                                    />
                                                    <label class="form-check-label" for="type-{{ $key }}">
                                                        {{ $type }}
                                                    </label>
                                                </div>
                                            @endforeach
                                        </div>
                                        <x-form.input-error name="type" />
                                    </div>
                                </div>
                                <div class="row" id="date-fields-container" style="{{ $isAdminClaim ? 'display:none;' : '' }}">
                                    <div class="col-12 col-md-6">
                                        <div class="mb-3">
                                            <x-form.input-label :required="true">Tanggal Mulai</x-form.input-label>
                                            <x-form.input type="date" name="start_date" placeholder="masukkan tanggal mulai"
                                                required value="{{ old('start_date', @$voucher->start_date) }}" />
                                            <x-form.input-error name="start_date" />
                                        </div>
                                    </div>
                                    <div class="col-12 col-md-6">
                                        <div class="mb-3">
                                            <x-form.input-label :required="true">Tanggal Berakhir</x-form.input-label>
                                            <x-form.input type="date" name="end_date" placeholder="masukkan tanggal berakhir"
                                                required value="{{ old('end_date', @$voucher->end_date) }}" />
                                            <x-form.input-error name="end_date" />
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <x-form.input-label>Deskripsi Voucher</x-form.input-label>
                                    <x-form.textarea name="description" placeholder="masukkan deskripsi voucher">{{ old('description', @$voucher->description) }}</x-form.textarea>
                                    <x-form.input-error name="description" />
                                </div>
                                <div class="mb-3">
                                    <x-form.checkbox name="is_active" id="is_active" :checked="old('is_active', @$voucher->is_active)">
                                        Apakah voucher dapat digunakan?
                                    </x-form.checkbox>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card">
                        <div class="card-body">
                            <x-form.input-label>Voucher Produk <small>(Kosongkan jika digunakan untuk semua produk)</small></x-form.input-label>
                            <div class="table-responsive">
                                <table class="table table-striped align-middle" id="voucher-attributes-table">
                                    <thead>
                                        <tr>
                                            <th>Produk</th>
                                            <th class="text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        @if (@$voucher && @$voucher->voucherProducts->count() > 0)
                                            @foreach ($voucher->voucherProducts as $voucherProduct)
                                                <tr class="attribute-row" data-row-index="{{ $voucherProduct->id }}">
                                                    <td>
                                                        <x-form.select name="product_id[{{ $voucherProduct->id }}]"
                                                            class="voucher-product-select" required>
                                                            <option value="">Pilih Produk</option>
                                                            @foreach ($products as $product)
                                                                <option value="{{ $product->id }}"
                                                                    {{ $voucherProduct->product_id == $product->id ? 'selected' : '' }}>
                                                                    {{ $product->name }}
                                                                </option>
                                                            @endforeach
                                                        </x-form.select>
                                                    </td>
                                                    <td class="text-center">
                                                        <x-button.edit :url="route('outlets.products.edit', [$currentOutlet->slug, $voucherProduct->product_id])" :hasText="false"/>
                                                        <x-button.delete :url="route('outlets.vouchers.products.destroy', [
                                                            $currentOutlet->slug,
                                                            $voucherProduct->id,
                                                        ])" :hasText="false" />
                                                    </td>
                                                </tr>
                                            @endforeach
                                        @else
                                            @if ($rowCount > 0)
                                                @foreach (range(0, $rowCount - 1) as $index)
                                                    <tr class="attribute-row" data-row-index="{{ $index }}">
                                                        <td>
                                                            <x-form.select name="product_id[]" class="product-select" required>
                                                                <option value="">Pilih Produk</option>
                                                                @foreach ($products as $product)
                                                                    <option value="{{ $product->id }}"
                                                                        {{ (string) old('product_id.' . $index, $productIds[$index]) === (string) $product->id ? 'selected' : '' }}>
                                                                        {{ $product->name }}
                                                                    </option>
                                                                @endforeach
                                                            </x-form.select>
                                                            <x-form.input-error name="product_id.{{ $index }}" class="product-select-error" />
                                                        </td>
                                                        <td class="text-center">
                                                            <button type="button" class="btn btn-danger btn-sm remove-attribute-row">
                                                                <i class="mdi mdi-trash-can-outline"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                @endforeach
                                            @endif
                                        @endif
                                        <tr id="add-attribute-row">
                                            <td colspan="2" class="text-center">
                                                <button type="button" class="btn btn-secondary btn-sm" id="add-attribute">
                                                    <i class="fas fa-plus me-1"></i> Tambah baris
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="mt-3 d-grid">
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
            function updateRowNumbers() {
                $('#voucher-attributes-table .attribute-row').each(function(index) {
                    $(this).attr('data-row-index', index);
                });
            }

            function toggleRemoveButtons() {
                const rows = $('#voucher-attributes-table .attribute-row');
                if (rows.length <= 1) {
                    rows.find('.remove-attribute-row').addClass('disabled').prop('disabled', true);
                } else {
                    rows.find('.remove-attribute-row').removeClass('disabled').prop('disabled', false);
                }
            }

            $('#add-attribute').on('click', function() {
                const newRowIndex = $('#voucher-attributes-table .attribute-row').length;

                const newRow = `
                    <tr class="attribute-row" data-row-index="${newRowIndex}">
                        <td>
                            <x-form.select name="product_id[]" class="product-select" required>
                                <option value="">Pilih Produk</option>
                                @foreach ($products as $product)
                                    <option value="{{ $product->id }}">
                                        {{ $product->name }}
                                    </option>
                                @endforeach
                            </x-form.select>
                        </td>
                        <td class="text-center">
                            <button type="button" class="btn btn-danger btn-sm remove-attribute-row">
                                <i class="mdi mdi-trash-can-outline"></i>
                            </button>
                        </td>
                    </tr>
                `;

                $('#add-attribute-row').before(newRow);

                updateRowNumbers();
                toggleRemoveButtons();
            });

            $(document).on('click', '.remove-attribute-row', function() {
                if ($('#voucher-attributes-table .attribute-row').length <= 1) {
                    return;
                }

                $(this).closest('tr').remove();
                updateRowNumbers();
                toggleRemoveButtons();
            });

            $(document).ready(function() {
                updateRowNumbers();
                toggleRemoveButtons();
            });
        </script>
    @endpush

    @push('scripts')
        <script>
            function toggleDiscountFields() {
                const val = $('input[name="price_type"]:checked').val();
                if (val == 1) {
                    $('#discount-percent-group').slideDown(300).find('input').prop('required', true);
                    $('#discount-fix-group').slideUp(300).find('input').prop('required', false);
                } else if (val == 2) {
                    $('#discount-percent-group').slideUp(300).find('input').prop('required', false);
                    $('#discount-fix-group').slideDown(300).find('input').prop('required', true);
                }
            }

            function toggleClaimTypeFields() {
                const isAdmin = $('input[name="claim_type"]:checked').val() == '2';
                if (isAdmin) {
                    // Sembunyikan tipe voucher dan set nilai ke 2
                    $('#type-voucher-group').slideUp(300).find('input').prop('required', false);
                    $('#type-2').prop('checked', true);
                    // Sembunyikan date fields
                    $('#date-fields-container').slideUp(300).find('input').prop('required', false);
                } else {
                    // Tampilkan kembali
                    $('#type-voucher-group').slideDown(300).find('input').prop('required', true);
                    $('#date-fields-container').slideDown(300).find('input').prop('required', true);
                }
            }

            $(document).ready(function() {
                toggleDiscountFields();                
                toggleClaimTypeFields();
                $('input[name="price_type"]').on('change', toggleDiscountFields);
                $('input[name="claim_type"]').on('change', toggleClaimTypeFields);
            });
        </script>
    @endpush
</x-panel-layout>
