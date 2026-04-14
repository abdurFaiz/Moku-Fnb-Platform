<x-modal id="duplicateModal" title="Duplikat Data Outlet">
    <x-form action="{{ route('spinotek.outlets.duplicate') }}" method="POST">
        @csrf
        <div class="mb-3">
            <label for="source_outlet_id" class="form-label">Outlet Asal</label>
            <select class="form-select" id="source_outlet_id" name="source_outlet_id" required>
                <option value="">Pilih Outlet Asal</option>
                @foreach ($allOutlets as $optOutlet)
                    <option value="{{ $optOutlet->id }}">{{ $optOutlet->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="mb-3">
            <label for="target_outlet_id" class="form-label">Outlet Tujuan</label>
            <select class="form-select" id="target_outlet_id" name="target_outlet_id" required>
                <option value="">Pilih Outlet Tujuan</option>
                @foreach ($allOutlets as $optOutlet)
                    <option value="{{ $optOutlet->id }}">{{ $optOutlet->name }}</option>
                @endforeach
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label">Data yang akan diduplikasi</label>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="products" id="checkProducts" name="options[]">
                <label class="form-check-label" for="checkProducts">
                    Produk (termasuk Kategori & Atribut)
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="vouchers" id="checkVouchers" name="options[]">
                <label class="form-check-label" for="checkVouchers">
                    Voucher
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="rewards" id="checkRewards" name="options[]">
                <label class="form-check-label" for="checkRewards">
                    Reward
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" value="table_numbers" id="checkTables" name="options[]">
                <label class="form-check-label" for="checkTables">
                    Nomor Meja
                </label>
            </div>
        </div>

        <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Batal</button>
            <x-button.submit>{{ __('Duplikat') }}</x-button.submit>
        </div>
    </x-form>
</x-modal>

@push('scripts')
    <script>
        // Optional: Prevent selecting same outlet for source and target
        document.getElementById('source_outlet_id').addEventListener('change', function() {
            var sourceId = this.value;
            var targetSelect = document.getElementById('target_outlet_id');

            for (var i = 0; i < targetSelect.options.length; i++) {
                if (targetSelect.options[i].value == sourceId) {
                    targetSelect.options[i].disabled = true;
                    if (targetSelect.value == sourceId) targetSelect.value = "";
                } else {
                    targetSelect.options[i].disabled = false;
                }
            }
        });

        document.getElementById('target_outlet_id').addEventListener('change', function() {
            var targetId = this.value;
            var sourceSelect = document.getElementById('source_outlet_id');

            for (var i = 0; i < sourceSelect.options.length; i++) {
                if (sourceSelect.options[i].value == targetId) {
                    sourceSelect.options[i].disabled = true;
                    if (sourceSelect.value == targetId) sourceSelect.value = "";
                } else {
                    sourceSelect.options[i].disabled = false;
                }
            }
        });
    </script>
@endpush
