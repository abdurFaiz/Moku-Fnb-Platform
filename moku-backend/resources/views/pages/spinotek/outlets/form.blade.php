<x-panel-layout>
    @include('includes.libs.select2')
    <div class="d-grid p-4">
        <div class="card">
            <div class="card-header">
                <div class="d-flex align-items-center justify-content-between">
                    <h5 class="card-title mb-0">{{ $title }}</h5>
                    <x-button.back :url="route('spinotek.outlets.index')" />
                </div>
            </div>
            <div class="card-body">
                @if (@$outlet && $outlet->va_number == null)
                    <div class="alert alert-danger d-flex align-items-center gap-2" role="alert">
                        <div>
                            <i class='bx bx-error display-6'></i>
                        </div>
                        Akun iPaymu outlet tidak aktif.
                    </div>
                @endif
                <x-form :action="$action" enctype="multipart/form-data">
                    @isset($outlet)
                        @method('PUT')
                    @endisset
                    <div class="d-grid">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <x-form.input-label :required="true">Nama Outlet</x-form.input-label>
                                    <x-form.input name="name" id="name-outlet" placeholder="masukkan nama outlet"
                                        :value="$outlet->name ?? ''" required />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <x-form.input-label :required="true">Slug</x-form.input-label>
                                    <x-form.input name="slug" id="slug-outlet" placeholder="masukkan slug outlet"
                                        :value="$outlet->slug ?? ''" required />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <x-form.input-label :required="true">Email</x-form.input-label>
                                    <x-form.input name="email" type="email" id="email-outlet"
                                        placeholder="masukkan email outlet" :value="$outlet->email ?? ''" required />
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <x-form.input-label :required="true">Nomor Telepon</x-form.input-label>
                                    <div class="input-group">
                                        <span class="input-group-text">+62</span>
                                        <x-form.input name="phone" type="number" id="phone-outlet"
                                            placeholder="masukkan nomor telepon outlet" :value="@$outlet ? stripZeroPhoneNumber($outlet->phone) : ''" required />
                                    </div>
                                </div>
                            </div>
                        </div>
                        @if (@$outlet)
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <x-form.input-label :required="true">VA Name Ipaymu</x-form.input-label>
                                        <x-form.input name="va_name" type="text" id="va_name" :value="$outlet->va_name"
                                            required />
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <x-form.input-label :required="true">VA Number Ipaymu</x-form.input-label>
                                        <x-form.input name="va_number" type="text" id="va_number" :value="$outlet->va_number"
                                            required />
                                    </div>
                                </div>
                            </div>
                        @endif
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <x-form.input-label :required="true">Embed Link Google Maps</x-form.input-label>
                                    <x-form.textarea name="map" id="map-outlet"
                                        placeholder="masukkan embed link google maps" rows="1" required>
                                        {{ $outlet->map ?? '' }}
                                    </x-form.textarea>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <x-form.input-label>Outlet Groups</x-form.input-label>
                                    <select name="outlet_groups[]" id="outletGroupsSelect" class="form-control"
                                        multiple="multiple">
                                        @foreach ($outletGroups as $group)
                                            <option value="{{ $group->id }}"
                                                {{ isset($outlet) && $outlet->groups->contains($group->id) ? 'selected' : '' }}>
                                                {{ $group->name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    <small class="text-muted">Pilih outlet groups yang terkait dengan outlet ini</small>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <x-form.input-label :required="true">Alamat</x-form.input-label>
                            <x-form.textarea name="address" id="address-outlet" placeholder="masukkan alamat outlet"
                                required>
                                {{ $outlet->address ?? '' }}
                            </x-form.textarea>
                        </div>
                        <div class="mb-3">
                            <x-form.input-label :required="@$outlet ? false : true">Logo</x-form.input-label>
                            <x-form.dropify name="logo" id="logo-outlet"
                                data-default-file="{{ $outlet->logoUrl ?? '' }}" :required="@$outlet ? false : true" />
                        </div>

                        <x-button.submit>Simpan</x-button.submit>
                    </div>
                </x-form>

            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            $(function() {
                // Initialize Select2 for outlet groups
                $('#outletGroupsSelect').select2({
                    placeholder: 'Pilih outlet groups...',
                    allowClear: true,
                    width: '100%'
                });

                @if (!@$outlet)
                    $('#name-outlet').on('input', function() {
                        const slug = $(this).val()
                            .toLowerCase()
                            .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
                            .trim()
                            .replace(/\s+/g, '-') // replace spaces with dash
                            .replace(/-+/g, '-'); // replace multiple dashes with single dash
                        $('#slug-outlet').val(slug);
                    });
                @endif
            });
        </script>
    @endpush
</x-panel-layout>
