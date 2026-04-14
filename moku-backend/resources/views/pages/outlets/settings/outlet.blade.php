<x-panel-layout title="Profil">
    <div class="p-4">
        @include('pages.outlets.settings._header')
        <div class="row justify-content-center">
            <div class="card col-md-8">
                <div class="card-body">
                    <x-form :action="route('outlets.settings.outlet.update', $currentOutlet->slug)" enctype="multipart/form-data">
                        @method('PUT')
                        <div class="d-grid">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <x-form.input-label :required="true">Nama Outlet</x-form.input-label>
                                    <x-form.input name="name" id="name-outlet" placeholder="masukkan nama outlet"
                                        :value="old('name', $user->outlet->name ?? '')" required />
                                    <x-form.input-error name="name" />
                                </div>
                                <div class="col-md-6 mb-3">
                                    <x-form.input-label>Email Outlet</x-form.input-label>
                                    <x-form.input name="name" id="name-outlet" :value="old('name', $user->outlet->email ?? '')" readonly />
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <x-form.input-label :required="true">Nomor Telepon</x-form.input-label>
                                    <div class="input-group">
                                        <span class="input-group-text">+62</span>
                                        <x-form.input name="phone" type="number" id="phone-outlet"
                                            placeholder="masukkan nomor telepon outlet" :value="old('phone', $user->outlet->phone ?? '')" required />
                                    </div>
                                    <x-form.input-error name="phone" />
                                </div>
                                <div class="col-md-6 mb-3">
                                    <x-form.input-label :required="true">
                                        Persentase Pajak
                                        <span class="ms-1" data-bs-toggle="tooltip" data-bs-placement="top"
                                            title="Masukkan nilai persentase pajak yang akan diterapkan di outlet ini. Contoh: 11 untuk PPN 11%.">
                                            <i class="mdi mdi-help-circle-outline"></i>
                                        </span>
                                    </x-form.input-label>
                                    <div class="input-group">
                                        <x-form.input name="fee_tax" type="number" id="fee-tax-outlet"
                                            placeholder="masukkan persentase pajak" :value="old('fee_tax', $user->outlet->fee_tax ?? '')" required />
                                        <span class="input-group-text">%</span>
                                    </div>
                                    <x-form.input-error name="fee_tax" />
                                </div>
                            </div>
                            <div class="mb-3">
                                <x-form.input-label :required="true">Alamat</x-form.input-label>
                                <x-form.input name="address" id="address-outlet" placeholder="masukkan alamat outlet"
                                    :value="old('address', $user->outlet->address ?? '')" required />
                                <x-form.input-error name="address" />
                            </div>
                            <div class="mb-3">
                                <x-form.input-label :required="true">Embed Link Google Maps</x-form.input-label>
                                <x-form.textarea name="map" id="map-outlet"
                                    placeholder="masukkan embed link google maps" required>
                                    {{ old('map', $user->outlet->map ?? '') }}
                                </x-form.textarea>
                                <x-form.input-error name="map" />
                            </div>
                            <div class="mb-3">
                                <x-form.input-label :required="@$user->outlet ? false : true">Logo @if (@$user->outlet)
                                        <small>(Kosongkan jika tidak ada perubahan)</small>
                                    @endif
                                </x-form.input-label>
                                <p class="text-muted">Unggah logo dengan format JPG, PNG, atau JPEG. Maksimal ukuran
                                    logo 2MB.</p>
                                <x-form.dropify name="logo" id="logo-outlet" />
                                {{-- data-default-file="{{ $user->outlet->logoUrl ?? '' }}" /> --}}
                                <x-form.input-error name="logo" />
                            </div>
                            <div class="mb-3">
                                <x-form.input-label :required="@$user->outlet ? false : true">Preview Outlet @if (@$user->outlet)
                                        <small>(Kosongkan jika tidak ada perubahan)</small>
                                    @endif
                                </x-form.input-label>
                                <p class="text-muted">Unggah preview outlet dengan format JPG, PNG, atau JPEG. Maksimal
                                    ukuran preview outlet 2MB.</p>
                                <x-form.dropify name="preview_outlet" id="preview-outlet"
                                    data-default-file="{{ $user->outlet->previewOutletUrl ?? '' }}" />
                                <x-form.input-error name="preview_outlet" />
                            </div>

                            <div class="mb-3">
                                <x-form.input-label :required="true">
                                    Tipe Outlet
                                    <span class="ms-1" data-bs-toggle="tooltip" data-bs-placement="top"
                                        title="Pilih tipe outlet yang sesuai dengan kebutuhan Anda.">
                                        <i class="mdi mdi-help-circle-outline"></i>
                                    </span>
                                </x-form.input-label>
                                <div class="d-flex gap-3">
                                    @foreach ($outlet_types as $key => $type)
                                        <div class="form-check">
                                            <x-form.checkbox name="type[]" id="outlet-type-{{ $key }}"
                                                :value="$key" :checked="old('type', $user->outlet->type ?? '') == $key ||
                                                    old('type', $user->outlet->type ?? '') == 3" class="form-check-input">
                                                {{ $type }}
                                                @if ($key == 1)
                                                    <span class="ms-1" data-bs-toggle="tooltip"
                                                        data-bs-placement="top"
                                                        title="Pelanggan dapat memesan di meja dan pesanan akan diantarkan">
                                                        <i class="mdi mdi-help-circle-outline"></i>
                                                    </span>
                                                @else
                                                    <span class="ms-1" data-bs-toggle="tooltip"
                                                        data-bs-placement="top"
                                                        title="Pelanggan mengambil pesanan langsung di kasir">
                                                        <i class="mdi mdi-help-circle-outline"></i>
                                                    </span>
                                                @endif
                                            </x-form.checkbox>
                                        </div>
                                    @endforeach
                                </div>
                                <x-form.input-error name="type" />
                            </div>

                            <div class="mb-3">
                                <x-form.input-label :required="true">
                                    Pembayaran Service Fee
                                    <span class="ms-1" data-bs-toggle="tooltip" data-bs-placement="top"
                                        title="Pilih siapa yang akan menanggung biaya layanan aplikasi.">
                                        <i class="mdi mdi-help-circle-outline"></i>
                                    </span>
                                </x-form.input-label>
                                <div class="d-flex gap-3">
                                    @foreach ($service_fee_configs as $config)
                                        <div class="form-check">
                                            <x-form.radio name="service_fee_config"
                                                id="service-fee-{{ $config['value'] }}" :value="$config['value']"
                                                :checked="old(
                                                    'service_fee_config',
                                                    $user->outlet->service_fee_config ?? 1,
                                                ) == $config['value']" class="form-check-input">
                                                {{ $config['label'] }}
                                                <span class="ms-1" data-bs-toggle="tooltip" data-bs-placement="top"
                                                    title="{{ $config['description'] }}">
                                                    <i class="mdi mdi-help-circle-outline"></i>
                                                </span>
                                            </x-form.radio>
                                        </div>
                                    @endforeach
                                </div>
                                <x-form.input-error name="service_fee_config" />
                            </div>

                            <x-button.submit>Simpan</x-button.submit>
                        </div>
                    </x-form>

                </div>
            </div>
        </div>
    </div>
</x-panel-layout>
