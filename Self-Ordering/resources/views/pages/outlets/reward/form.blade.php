<x-form action="{{ $action }}" method="POST">

    @if (@$reward)
        @method('PUT')
    @endif
    @csrf
    <div class="d-grid">
        <div class="mb-3">
            <input type="hidden" id="reward_type" name="reward_type" value="{{ $reward->product_id ? 'product' : 'voucher' }}">
            <x-form.input-label :required="true">Reward</x-form.input-label>
            <x-form.select id="reward_id" name="reward_id" required onchange="updaterewardType()" disabled class="bg-light">
                <option value="">Pilih Reward</option>
                <optgroup label="Produk">
                    @foreach ($products as $product)
                        @php
                            $isSelectedProduct = $reward->product_id === $product->id;
                        @endphp
                        <option value="{{ $product->id }}" data-type="product" {{ $isSelectedProduct ? 'selected' : '' }}>{{ $product->name }}</option>
                    @endforeach
                </optgroup>
                <optgroup label="Voucher">
                    @foreach ($vouchers as $voucher)
                        @php
                            $isSelectedVoucher = $reward->voucher_id === $voucher->id;
                        @endphp
                        <option value="{{ $voucher->id }}" data-type="voucher" {{ $isSelectedVoucher ? 'selected' : '' }}>{{ $voucher->name }}</option>
                    @endforeach
                </optgroup>
            </x-form.select>
        </div>
        <div class="mb-3">
            <x-form.input-label :required="true">Poin Penukaran</x-form.input-label>
            <x-form.input id="point" name="point" placeholder="masukkan poin penukaran" :value="old('point', @$reward->point)" required />
        </div>
        
        <x-button.submit>Simpan</x-button.submit>
    </div>
</x-form>
