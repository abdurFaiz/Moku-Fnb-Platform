<x-panel-layout title="Manajemen Nomor Meja">

    @if ($tableNumberLocations->count() > 0)
        <div class="mb-3">
            <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#add-location">
                <i class="fas fa-plus me-1"></i> Tambah Lokasi
            </button>
        </div>
        <div class="d-grid">
            @foreach ($tableNumberLocations as $tableNumberLocation)
                <div class="card">
                    <div class="card-header d-flex align-items-center justify-content-between py-2">
                        <div class="d-flex align-items-center gap-2">
                            <span class="fw-medium">{{ $loop->iteration }}. {{ $tableNumberLocation->name }}</span>
                            <span
                                class="badge badge-soft-primary">{{ $tableNumberLocation->tableNumbers->count() }}</span>
                        </div>
                        <div class="btn-group">
                            <button type="button" class="btn hover-light p-0 avatar-sm rounded-circle"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="mdi mdi-dots-vertical"></i>
                            </button>
                            <div class="dropdown-menu dropdownmenu-primary" style="">
                                <a class="dropdown-item" href="#!" data-bs-toggle="modal"
                                    data-bs-target=".edit-table-number-locations"
                                    data-url="{{ route('outlets.table-number-locations.edit', [$currentOutlet->slug, $tableNumberLocation->id]) }}"
                                    data-title="Ubah Lokasi">
                                    <i class="fas fa-edit me-1"></i> Ubah
                                </a>
                                <a class="dropdown-item action-delete" href="#!"
                                    data-url="{{ route('outlets.table-number-locations.destroy', [$currentOutlet->slug, $tableNumberLocation->id]) }}"
                                    data-item="Lokasi {{ $tableNumberLocation->name }}">
                                    <i class="fas fa-trash-alt me-1"></i> Hapus
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <p class="mb-2 fw-medium">Tambahkan Nomor Meja:</p>
                        <x-form :action="route('outlets.table-numbers.store', $currentOutlet->slug)" class="row">
                            <div class="col-sm-3">
                                <input type="hidden" name="table_number_location_id"
                                    value="{{ $tableNumberLocation->id }}">
                                <x-form.input name="number" placeholder="cth. MJ-01" required />
                            </div>
                            <div class="col-sm-3">
                                <x-button.submit>Simpan</x-button.submit>
                            </div>
                        </x-form>
                        @if ($tableNumberLocation->tableNumbers->count() > 0)
                            <div class="row mt-3">
                                @foreach ($tableNumberLocation->tableNumbers as $tableNumber)
                                    <div class="col-sm-3">
                                        <div class="card w-100 mb-3 mb-sm-0">
                                            <div class="card-body p-2">
                                                <div class="d-flex align-items-center justify-content-between gap-3">
                                                    <div class="d-flex align-items-center gap-2">
                                                        <div class="badge bg-light-subtle text-primary p-3 rounded-3">
                                                            <i class="mdi mdi-qrcode-scan fs-4"></i>
                                                        </div>
                                                        <div>
                                                            <h4 class="mb-0 fw-semibold">{{ $tableNumber->number }}</h4>
                                                        </div>
                                                    </div>

                                                    <div class="btn-group">
                                                        <button type="button"
                                                            class="btn hover-light p-0 avatar-sm rounded-circle"
                                                            data-bs-toggle="dropdown" aria-expanded="false">
                                                            <i class="mdi mdi-dots-vertical"></i>
                                                        </button>
                                                        <div class="dropdown-menu dropdownmenu-primary" style="">
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
                                            <div class="card-footer p-2">
                                                <a href="#!"
                                                    class="d-flex justify-content-between align-items-center fw-normal text-sm hover-primary-subtle py-1 px-2 rounded-3 text-primary">
                                                    <div class="d-flex align-items-center">
                                                        <i class="mdi mdi-pencil-box-multiple me-2"></i>
                                                        View Links
                                                    </div>
                                                    <i class="fas fa-angle-right ms-1"></i>
                                                </a>
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
                                        <p>Belum ada nomor meja, silakan tambahkan terlebih dahulu.</p>
                                    </div>
                                </div>
                            </div>
                        @endif
                    </div>
                </div>
            @endforeach
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
