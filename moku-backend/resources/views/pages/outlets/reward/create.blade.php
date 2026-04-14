@php
    use Illuminate\Support\Arr;

    $rewardIds = Arr::wrap(old('reward_id'));
    $rewardTypes = Arr::wrap(old('reward_type'));
    $points = Arr::wrap(old('point'));

    $rowCount = max(count($rewardIds), count($rewardTypes), count($points));

    if ($rowCount === 0) {
        $rowCount = 1;
        $rewardIds = [''];
        $rewardTypes = [''];
        $points = [''];
    } else {
        $rewardIds = array_pad($rewardIds, $rowCount, '');
        $rewardTypes = array_pad($rewardTypes, $rowCount, '');
        $points = array_pad($points, $rowCount, '');
    }
@endphp

<x-panel-layout title="Tambah Reward">
    <div class="p-4">
        <x-form action="{{ $action }}" method="POST">
            @csrf

            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Tambah Reward</h5>
                    <x-button.back :url="route('outlets.rewards.index', $currentOutlet)" />
                </div>
                <div class="card-body">
                    {{-- Single form using provided $action; remove nested form --}}
                        <div class="table-responsive">
                            <table class="table table-striped" id="reward-table">
                                <thead>
                                    <tr>
                                        <th style="width: 10%">No</th>
                                        <th style="width: 45%">Reward</th>
                                        <th style="width: 35%">Poin</th>
                                        <th style="width: 10%" class="text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @foreach (range(0, $rowCount - 1) as $index)
                                        <tr class="reward-row" data-row-index="{{ $index }}">
                                            <td class="row-number align-middle">{{ $index + 1 }}</td>
                                            <td>
                                                <input type="hidden" name="reward_type[]" class="reward-type" value="{{ $rewardTypes[$index] }}">
                                                <x-form.select name="reward_id[]" class="reward-select" required>
                                                    <option value="">Pilih Reward</option>
                                                    <optgroup label="Produk">
                                                        @foreach ($products as $product)
                                                            <option value="{{ $product->id }}" data-type="product"
                                                                {{ ((string) $rewardIds[$index] === (string) $product->id && $rewardTypes[$index] === 'product') ? 'selected' : '' }}>
                                                                {{ $product->name }}</option>
                                                        @endforeach
                                                    </optgroup>
                                                    <optgroup label="Voucher">
                                                        @foreach ($vouchers as $voucher)
                                                            <option value="{{ $voucher->id }}" data-type="voucher"
                                                                {{ ((string) $rewardIds[$index] === (string) $voucher->id && $rewardTypes[$index] === 'voucher') ? 'selected' : '' }}>
                                                                {{ $voucher->name }}</option>
                                                        @endforeach
                                                    </optgroup>
                                                </x-form.select>
                                                <x-form.input-error name="reward_id.{{ $index }}" class="reward-select-error" />
                                            </td>
                                            <td>
                                                <x-form.input type="number" name="point[]" min="0" placeholder="masukkan poin penukaran"
                                                    value="{{ $points[$index] }}" required />
                                                <x-form.input-error name="point.{{ $index }}" class="point-input-error" />
                                            </td>
                                            <td class="text-center">
                                                <button type="button" class="btn btn-danger btn-sm remove-reward-row">
                                                    <i class="mdi mdi-trash-can-outline"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    @endforeach
                                    <tr id="add-reward-row">
                                        <td colspan="4" class="text-center">
                                            <button type="button" class="btn btn-secondary btn-sm" id="add-reward">
                                                <i class="fas fa-plus me-1"></i> Tambah baris
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-3 d-grid">
                            <x-button.submit>
                                Simpan
                            </x-button.submit>
                        </div>
                    {{-- End single form --}}
                </div>
            </div>
        </x-form>
    </div>

    @push('scripts')
        <script>
            function updaterewardType(selectElement) {
                const $select = $(selectElement);
                const type = $select.find(':selected').data('type') || '';
                $select.closest('tr').find('.reward-type').val(type);
            }

            function updateRowNumbers() {
                $('#reward-table .reward-row').each(function(index) {
                    $(this).attr('data-row-index', index);
                    $(this).find('.row-number').text(index + 1);
                });
            }

            function toggleRemoveButtons() {
                const rows = $('#reward-table .reward-row');
                if (rows.length <= 1) {
                    rows.find('.remove-reward-row').addClass('disabled').prop('disabled', true);
                } else {
                    rows.find('.remove-reward-row').removeClass('disabled').prop('disabled', false);
                }
            }

            $('#add-reward').on('click', function() {
                const newRowIndex = $('#reward-table .reward-row').length;

                const newRow = `
                    <tr class="reward-row" data-row-index="${newRowIndex}">
                        <td class="row-number align-middle">${newRowIndex + 1}</td>
                        <td>
                            <input type="hidden" name="reward_type[]" class="reward-type">
                            <x-form.select name="reward_id[]" class="reward-select" required>
                                <option value="">Pilih Reward</option>
                                <optgroup label="Produk">
                                    @foreach ($products as $product)
                                    <option value="{{ $product->id }}" data-type="product">{{ $product->name }}</option>
                                    @endforeach
                                </optgroup>
                                <optgroup label="Voucher">
                                    @foreach ($vouchers as $voucher)
                                        <option value="{{ $voucher->id }}" data-type="voucher">{{ $voucher->name }}</option>
                                    @endforeach
                                </optgroup>
                            </x-form.select>
                        </td>
                        <td>
                            <x-form.input type="number" name="point[]" min="0" placeholder="masukkan poin penukaran" required />
                        </td>
                        <td class="text-center">
                            <button type="button" class="btn btn-danger btn-sm remove-reward-row">
                                <i class="mdi mdi-trash-can-outline"></i>
                            </button>
                        </td>
                    </tr>
                `;

                $('#add-reward-row').before(newRow);

                updateRowNumbers();
                toggleRemoveButtons();
            });

            $(document).on('change', '.reward-select', function() {
                updaterewardType(this);
            });

            $(document).on('click', '.remove-reward-row', function() {
                if ($('#reward-table .reward-row').length <= 1) {
                    return;
                }

                $(this).closest('tr').remove();
                updateRowNumbers();
                toggleRemoveButtons();
            });

            $(document).ready(function() {
                $('.reward-select').each(function() {
                    updaterewardType(this);
                });

                updateRowNumbers();
                toggleRemoveButtons();
            });
        </script>
    @endpush
</x-panel-layout>
