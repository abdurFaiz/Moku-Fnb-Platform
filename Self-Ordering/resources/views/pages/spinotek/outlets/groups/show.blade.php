<x-panel-layout>
    <div class="d-grid p-4">
        <!-- Card Detail Outlet Group -->
        <div class="card mb-3">
            <div class="card-header">
                <div class="d-flex align-items-center justify-content-between">
                    <h5 class="card-title mb-0">Detail Outlet Group</h5>
                    <div class="d-flex gap-2">
                        <x-button.link :url="route('spinotek.outlet-groups.edit', $outletGroup->slug)" class="btn-primary">
                            <i class="mdi mdi-square-edit-outline me-1"></i>
                            Edit
                        </x-button.link>
                        <x-button.back :url="route('spinotek.outlet-groups.index')" />
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="d-flex gap-4">
                    <div style="flex-shrink: 0;">
                        @if ($outletGroup->imageUrl)
                            <img src="{{ $outletGroup->imageUrl }}" alt="{{ $outletGroup->name }}" class="rounded"
                                style="width: 150px; height: 150px; object-fit: cover;">
                        @else
                            <div class="bg-light d-flex align-items-center justify-content-center border rounded"
                                style="width: 150px; height: 150px;">
                                <i class="bi bi-image text-muted fs-2"></i>
                            </div>
                        @endif
                    </div>
                    <div class="flex-grow-1">
                        <table class="table table-borderless mb-0">
                            <tr>
                                <th style="width: 150px;">Nama Group</th>
                                <td>{{ $outletGroup->name }}</td>
                            </tr>
                            <tr>
                                <th>Slug</th>
                                <td>{{ $outletGroup->slug }}</td>
                            </tr>
                            <tr>
                                <th>Deskripsi</th>
                                <td>{{ $outletGroup->description ?? '-' }}</td>
                            </tr>
                            <tr>
                                <th>Jumlah Outlet</th>
                                <td>{{ $outletGroup->members->count() }}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Card Daftar Outlet Anggota -->
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Daftar Outlet Anggota</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">
                        <thead>
                            <tr>
                                <th>{{ __('No') }}</th>
                                <th>{{ __('Nama Outlet') }}</th>
                                <th>{{ __('Alamat') }}</th>
                                <th>{{ __('Status') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($outletGroup->members as $key => $outlet)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td>{{ $outlet->name }}</td>
                                    <td>{{ $outlet->address ?? '-' }}</td>
                                    <td>
                                        @if ($outlet->is_active)
                                            <span class="badge bg-success">
                                                <i class="mdi mdi-check-circle me-1"></i>Aktif
                                            </span>
                                        @else
                                            <span class="badge bg-danger">
                                                <i class="mdi mdi-close-circle me-1"></i>Tidak Aktif
                                            </span>
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center">Tidak ada outlet dalam group ini.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</x-panel-layout>
