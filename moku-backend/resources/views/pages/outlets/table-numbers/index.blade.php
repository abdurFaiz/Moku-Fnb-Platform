<x-panel-layout title="Manajemen Nomor Meja" bgClass="bg-white">

    @include('includes.helpers.copy-clipboard')

    @if ($tableNumberLocations->count() > 0)
        <div class="row">
            <div class="col-sm-3 pe-0 bg-light-200">
                <div class="px-3 py-3">
                    <h4 class="mb-3">Lokasi</h4>
                    <div class="d-grid gap-2">
                        <a class="btn btn-menu text-start fw-medium {{ !request('table_number_location_id') ? 'btn-menu-active' : '' }}"
                            href="{{ route('outlets.table-numbers.index', $currentOutlet->slug) }}">
                            <div class="d-flex align-items-center justify-content-between">
                                <span class="d-flex align-items-center gap-2">
                                    <span
                                        class="btn hover-light p-0 avatar-sm rounded-circle d-flex align-items-center justify-content-center">
                                        <i class="bx bxs-map-pin text-secondary"></i>
                                    </span>
                                    Semua Lokasi
                                </span>
                                <span
                                    class="badge fw-normal {{ !request('table_number_location_id') ? 'badge-soft-primary' : 'badge-soft-dark' }}">{{ $currentOutlet->tableNumbers->count() }}</span>
                            </div>
                        </a>
                        @foreach ($tableNumberLocations as $tableNumberLocation)
                            <div class="card-clickable btn btn-menu text-start fw-medium {{ request('table_number_location_id') == $tableNumberLocation->id ? 'btn-menu-active' : '' }}"
                                data-url="{{ route('outlets.table-numbers.index', [$currentOutlet->slug, 'table_number_location_id' => $tableNumberLocation->id]) }}">
                                <div class="d-flex align-items-center justify-content-between">
                                    <div class="d-flex align-items-center gap-2">
                                        <div class="btn-group" ignore-clickable-parent>
                                            <span type="button"
                                                class="btn hover-light p-0 avatar-sm rounded-circle d-flex align-items-center justify-content-center"
                                                data-bs-toggle="dropdown" aria-expanded="false">
                                                <i class="mdi mdi-dots-vertical"></i>
                                            </span>
                                            <div class="dropdown-menu dropdownmenu-primary">
                                                <button type="button" class="dropdown-item d-flex align-items-center"
                                                    data-bs-toggle="modal" data-bs-target=".edit-table-number-locations"
                                                    data-url="{{ route('outlets.table-number-locations.edit', [$currentOutlet->slug, $tableNumberLocation->id]) }}"
                                                    data-title="Ubah Lokasi">
                                                    <i class="bx bxs-edit-alt me-1"></i> Ubah
                                                </button>
                                                <button type="button"
                                                    class="dropdown-item d-flex align-items-center action-delete"
                                                    data-url="{{ route('outlets.table-number-locations.destroy', [$currentOutlet->slug, $tableNumberLocation->id]) }}"
                                                    data-item="Lokasi {{ $tableNumberLocation->name }}">
                                                    <i class="bx bx-trash-alt me-1"></i> Hapus
                                                </button>
                                            </div>
                                        </div>
                                        <span>{{ $tableNumberLocation->name }}</span>
                                    </div>
                                    <span
                                        class="badge fw-normal {{ request('table_number_location_id') == $tableNumberLocation->id ? 'badge-soft-primary' : 'badge-soft-dark' }}">
                                        {{ $tableNumberLocation->tableNumbers->count() }}
                                    </span>
                                </div>
                            </div>
                        @endforeach
                    </div>
                    <div class="mt-3 d-grid">
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-location">
                            <i class="fas fa-plus me-1"></i> Tambah Lokasi
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-sm-9">
                <div class="px-3 py-3">
                    <div class="row align-items-center">
                        <div class="col-sm-9">
                            <p class="mb-2 fw-medium">Tambah Nomor Meja:</p>
                            <x-form :action="route('outlets.table-numbers.store', $currentOutlet->slug)" class="row mb-3">
                                <div class="col-sm-4">
                                    <x-form.select name="table_number_location_id">
                                        <option value="">-Pilih Lokasi-</option>
                                        @foreach ($tableNumberLocations as $tableNumberLocation)
                                            <option value="{{ $tableNumberLocation->id }}"
                                                @selected(old('table_number_location_id', request('table_number_location_id')) == $tableNumberLocation->id)>
                                                {{ $tableNumberLocation->name }}
                                            </option>
                                        @endforeach
                                    </x-form.select>
                                </div>
                                <div class="col-sm-5">
                                    <x-form.input name="number"
                                        class="{{ Session::get('please_input_table_number') ? 'border-primary' : '' }}"
                                        placeholder="cth. MJ-01" :value="old('number')" required />
                                    <x-form.input-error name="number" />
                                    <div class="mt-2 text-primary bg-primary-subtle text-center">
                                        <i class="fas fa-info-circle"></i>
                                        Tambah
                                        nomor meja
                                        disini.
                                    </div>
                                </div>
                                <div class="col-sm-3">
                                    <x-button.submit>
                                        <i class="fas fa-plus me-1"></i> Simpan
                                    </x-button.submit>
                                </div>
                            </x-form>
                        </div>
                    </div>

                    <div class="p-3 rounded min-h-screen" style="background-color: var(--bs-gray-100);">
                        <h5 class="mb-3">List Nomor Meja ({{ $tableNumbers->count() }})</h5>
                        <x-form method="GET">
                            @if ($currentTableLocation)
                                <input type="hidden" name="table_number_location_id"
                                    value="{{ $currentTableLocation->id }}">
                            @endif
                            <div class="row">
                                <div class="col-sm-6 mb-3">
                                    <div class="input-group">
                                        <div class="input-group-text px-3"><i class="bx bx-search-alt"></i></div>
                                        <input type="text" class="form-control" name="search"
                                            value="{{ request('search') }}" placeholder="Cari Nomor Meja...">
                                    </div>
                                </div>
                                <div class="col-sm-3">
                                    <x-button.submit class="btn-dark px-4">
                                        <i class="bx bx-search-alt"></i>
                                        Cari
                                    </x-button.submit>
                                </div>
                                <div class="col-auto ms-auto">
                                    <a href="{{ route('outlets.table-numbers.download-qr-codes', $currentOutlet->slug) }}" class="btn btn-primary">
                                        <i class='bx bx-download'></i>
                                        Unduh Semua Kode QR
                                    </a>
                                </div>
                            </div>
                        </x-form>

                        @if ($tableNumbers->count() > 0)
                            <div class="row mt-3">
                                @foreach ($tableNumbers as $tableNumber)
                                    <div class="col-sm-4">
                                        <div class="card w-100 mb-3 border-0 shadow-sm">
                                            <div class="card-body p-2">
                                                <div class="d-flex align-items-center justify-content-between gap-3">
                                                    <div class="d-flex align-items-center gap-2">
                                                        <div class="badge bg-light-subtle text-primary p-3 rounded-3">
                                                            <i class="mdi mdi-qrcode-scan fs-4"></i>
                                                        </div>
                                                        <div>
                                                            <h4 class="mb-0 fw-semibold">
                                                                {{ $tableNumber->number }}
                                                            </h4>
                                                            <p class="mb-0 text-sm text-muted">
                                                                {{ $tableNumber->tableNumberLocation->name }}</p>
                                                        </div>
                                                    </div>

                                                    <div class="btn-group">
                                                        <button type="button"
                                                            class="btn hover-light p-0 avatar-sm rounded-circle"
                                                            data-bs-toggle="dropdown" aria-expanded="false">
                                                            <i class="mdi mdi-dots-vertical"></i>
                                                        </button>
                                                        <div class="dropdown-menu dropdownmenu-primary" style="">
                                                            <a href="#!"
                                                                data-bs-toggle="modal" data-bs-target=".edit-table-number-locations"
                                                                data-url="{{ route('outlets.table-numbers.show', [$currentOutlet->slug, $tableNumber->id]) }}"
                                                                data-title="Lihat Link QR Code"
                                                                class="dropdown-item">
                                                                <i class="mdi mdi-arrow-collapse-all me-1"></i>
                                                                View Links
                                                            </a>
                                                            <a href="#!" class="dropdown-item"
                                                                data-bs-toggle="modal" data-bs-target=".edit-table-number-locations"
                                                                data-url="{{ route('outlets.table-numbers.edit', [$currentOutlet->slug, $tableNumber->id]) }}"
                                                                data-title="Edit Nomor Meja">
                                                                <i class="mdi mdi-square-edit-outline me-1"></i>
                                                                Edit Nomor Meja
                                                            </a>
                                                            <a class="dropdown-item action-delete"
                                                                data-url="{{ route('outlets.table-numbers.destroy', [$currentOutlet->slug, $tableNumber->id]) }}"
                                                                data-item="Nomor Meja {{ $tableNumber->number }}"
                                                                href="#!">
                                                                <i class="fas fa-trash-alt me-1"></i> Hapus
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        @else
                            <div class="row justify-content-center">
                                <div class="col-sm-4 py-5">
                                    <div class="text-center">
                                        <x-ilustration.empty class="mb-3" />
                                        @if (request('search'))
                                            <p>Kata kunci <span class="fw-semibold">"{{ request('search') }}"</span>
                                                tidak
                                                ditemukan.
                                            </p>
                                        @else
                                            <p>Belum ada nomor meja, silakan tambahkan lokasi terlebih dahulu.</p>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        @endif

                        <div class="mt-3">
                            {{ $tableNumbers->withQueryString()->links() }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    @else
        <div class="row justify-content-center">
            <div class="col-sm-4 py-5">
                <div class="text-center">
                    <x-ilustration.empty class="mb-3" />
                    <p>Belum ada nomor meja, silakan tambahkan lokasi terlebih dahulu.</p>
                </div>

                <div class="text-center">
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-location">
                        <i class="fas fa-plus me-1"></i> Tambah Lokasi
                    </button>
                </div>
            </div>
        </div>
    @endif

    <x-modal.dynamic class="edit-table-number-locations" />

    <x-modal title="Tambah Lokasi" id="add-location">
        <x-form :action="route('outlets.table-number-locations.store', $currentOutlet->slug)">
            <div class="d-grid">
                <div class="mb-3">
                    <x-form.input-label>Nama Lokasi</x-form.input-label>
                    <x-form.input name="name" placeholder="cth. Indoor" required />
                </div>
                <x-button.submit>Simpan</x-button.submit>
            </div>
        </x-form>
    </x-modal>
</x-panel-layout>
