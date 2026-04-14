<x-panel-layout title="Manajemen Outlet Group">
    @include('includes.libs.select2')

    <div class="p-4">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="card-title">{{ $title }}</h5>
                        <div>
                            <x-button.back :url="route('spinotek.outlet-groups.index')" />
                        </div>
                    </div>
                    <div class="card-body">
                        <x-form action="{{ $action }}" method="POST" enctype="multipart/form-data">
                            @if (@$outletGroup)
                                @method('PUT')
                            @endif
                            @csrf
                            <div class="d-grid">
                                <div class="row">
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <x-form.input-label :required="true">Nama Group</x-form.input-label>
                                            <x-form.input name="name" placeholder="masukkan nama group"
                                                :value="@$outletGroup->name" required />
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <x-form.input-label :required="true">Slug</x-form.input-label>
                                            <x-form.input name="slug" placeholder="masukkan slug (contoh: group-1)"
                                                :value="@$outletGroup->slug" required />
                                            <small class="text-muted">Slug harus unik dan menggunakan format: huruf
                                                kecil, angka, dan tanda hubung (-)</small>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <x-form.input-label>Deskripsi</x-form.input-label>
                                            <x-form.textarea name="description" placeholder="masukkan deskripsi"
                                                :value="@$outletGroup->description" />
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <div class="d-flex justify-content-between align-items-center mb-2">
                                                <x-form.input-label>Pilih Outlet</x-form.input-label>
                                                <button type="button" class="btn btn-sm btn-outline-primary"
                                                    id="toggleInlineForm">
                                                    <i class="fas fa-plus me-1"></i> Tambah Outlet Baru
                                                </button>
                                            </div>

                                            <!-- Inline Form for New Outlet -->
                                            <div id="inlineOutletForm" class="card mb-3 bg-light"
                                                style="display: none;">
                                                <div class="card-body">
                                                    <h6 class="card-title mb-3">Tambah Outlet Baru</h6>
                                                    <div class="row">
                                                        <div class="col-md-6 mb-2">
                                                            <label class="form-label small">Nama Outlet <span
                                                                    class="text-danger">*</span></label>
                                                            <input type="text" class="form-control form-control-sm"
                                                                id="new_outlet_name" placeholder="Nama Outlet">
                                                        </div>
                                                        <div class="col-md-6 mb-2">
                                                            <label class="form-label small">Slug <span
                                                                    class="text-danger">*</span></label>
                                                            <input type="text" class="form-control form-control-sm"
                                                                id="new_outlet_slug" placeholder="slug-outlet">
                                                        </div>
                                                        <div class="col-md-6 mb-2">
                                                            <label class="form-label small">No. Telepon <span
                                                                    class="text-danger">*</span></label>
                                                            <input type="text" class="form-control form-control-sm"
                                                                id="new_outlet_phone" placeholder="08123456789">
                                                        </div>
                                                        <div class="col-md-6 mb-2">
                                                            <label class="form-label small">Link Map <span
                                                                    class="text-danger">*</span></label>
                                                            <input type="text" class="form-control form-control-sm"
                                                                id="new_outlet_map"
                                                                placeholder="https://maps.google.com/...">
                                                        </div>
                                                        <div class="col-12 mb-3">
                                                            <label class="form-label small">Alamat <span
                                                                    class="text-danger">*</span></label>
                                                            <textarea class="form-control form-control-sm" id="new_outlet_address" rows="2" placeholder="Alamat lengkap"></textarea>
                                                        </div>
                                                        <div class="col-12 text-end">
                                                            <button type="button" class="btn btn-sm btn-primary"
                                                                id="saveOutletBtn">
                                                                <i class="fas fa-save me-1"></i> Simpan Outlet
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <select name="outlets[]" id="outletsSelect" class="form-control"
                                                multiple="multiple">
                                                @foreach ($outlets as $outlet)
                                                    <option value="{{ $outlet->id }}"
                                                        {{ @$outletGroup && $outletGroup->members->contains($outlet->id) ? 'selected' : '' }}>
                                                        {{ $outlet->name }}
                                                    </option>
                                                @endforeach
                                            </select>
                                            <small class="text-muted">Pilih outlet yang akan menjadi anggota group
                                                ini</small>
                                        </div>
                                    </div>
                                    <div class="col-12">
                                        <div class="mb-3">
                                            <x-form.input-label>Gambar</x-form.input-label>
                                            <input type="file" name="image" class="dropify"
                                                data-default-file="{{ @$outletGroup->imageUrl }}" accept="image/*"
                                                id="imageInput">
                                            <small class="text-muted">Format: JPG, JPEG, PNG, GIF, SVG. Maksimal
                                                2MB</small>
                                        </div>
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
                // Initialize Select2 for outlets
                $('#outletsSelect').select2({
                    placeholder: 'Pilih outlet...',
                    allowClear: true,
                    width: '100%'
                });

                // Toggle inline form
                $('#toggleInlineForm').on('click', function() {
                    const $form = $('#inlineOutletForm');
                    const $icon = $(this).find('i');

                    if ($form.is(':visible')) {
                        $form.slideUp();
                        $icon.removeClass('fa-minus').addClass('fa-plus');
                        $(this).html('<i class="fas fa-plus me-1"></i> Tambah Outlet Baru');
                    } else {
                        $form.slideDown();
                        $icon.removeClass('fa-plus').addClass('fa-minus');
                        $(this).html('<i class="fas fa-minus me-1"></i> Batal Tambah Outlet');
                    }
                });

                // Handle inline form submission
                $('#saveOutletBtn').on('click', function(e) {
                    e.preventDefault();

                    // Reset errors
                    $('.invalid-feedback').remove();
                    $('.is-invalid').removeClass('is-invalid');

                    const $btn = $(this);
                    const originalText = $btn.html();
                    $btn.prop('disabled', true).html(
                        '<i class="fas fa-spinner fa-spin me-1"></i> Menyimpan...');

                    const formData = new FormData();
                    formData.append('name', $('#new_outlet_name').val());
                    formData.append('slug', $('#new_outlet_slug').val());
                    formData.append('phone', $('#new_outlet_phone').val());
                    formData.append('address', $('#new_outlet_address').val());
                    formData.append('map', $('#new_outlet_map').val());
                    formData.append('_token', '{{ csrf_token() }}');

                    $.ajax({
                        url: '{{ route('spinotek.outlets.store') }}',
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        headers: {
                            'Accept': 'application/json'
                        },
                        success: function(response) {
                            if (response.status === 'success') {
                                // Add new option to Select2
                                const newOption = new Option(response.data.name, response.data.id,
                                    true, true);
                                $('#outletsSelect').append(newOption).trigger('change');

                                // Reset form and hide it
                                $('#new_outlet_name').val('');
                                $('#new_outlet_slug').val('');
                                $('#new_outlet_phone').val('');
                                $('#new_outlet_address').val('');
                                $('#new_outlet_map').val('');

                                $('#toggleInlineForm').click();

                                notyf.success(response.message);
                            }
                        },
                        error: function(xhr) {
                            if (xhr.status === 422) {
                                const errors = xhr.responseJSON.errors;
                                Object.keys(errors).forEach(function(key) {
                                    const input = $('#new_outlet_' + key);
                                    input.addClass('is-invalid');
                                    input.after(
                                        `<div class="invalid-feedback">${errors[key][0]}</div>`
                                    );
                                });
                                notyf.error('Mohon periksa kembali inputan anda');
                            } else {
                                notyf.error(xhr.responseJSON?.message ||
                                    'Terjadi kesalahan saat menyimpan outlet');
                            }
                        },
                        complete: function() {
                            $btn.prop('disabled', false).html(originalText);
                        }
                    });
                });
            });
        </script>
    @endpush

</x-panel-layout>
