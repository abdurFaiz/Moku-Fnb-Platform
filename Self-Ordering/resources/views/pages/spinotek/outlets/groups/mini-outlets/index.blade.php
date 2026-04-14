<x-panel-layout title="Daftar Mini Outlet">
    <div class="p-4">
        <div class="card">
            <div class="card-header">
                <div class="d-flex align-items-center justify-content-between">
                    <h5 class="card-title mb-0">Daftar Mini Outlet - {{ $outletGroup->name }}</h5>
                    <div class="flex gap-3">
                        <a href="#!" class="btn btn-primary" data-bs-toggle="modal" data-bs-target=".mini-outlet-form"
                            data-url="{{ route('spinotek.outlets.groups.mini-outlets.create', ['outlet' => $outlet->slug, 'group' => $outletGroup->slug]) }}"
                            data-title="Tambah Mini Outlet">
                            <i class="fas fa-plus me-1"></i>
                            Tambah
                        </a>
                        <x-button.back :url="route('spinotek.outlets.groups.index', $outlet->slug)" />
                    </div>
                </div>
            </div>
            <div class="card-body">
                <form action=""
                    class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                    <div class="d-flex align-items-center gap-3">
                        <x-filter.rows />
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <x-filter.input-search placeholder="Cari Mini Outlet..." />
                    </div>
                </form>

                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Nama</th>
                                <th>Dibuat Pada</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($miniOutlets as $miniOutlet)
                                <tr>
                                    <td>{{ $loop->iteration + $miniOutlets->firstItem() - 1 }}</td>
                                    <td>{{ $miniOutlet->name }}</td>
                                    <td>{{ $miniOutlet->created_at->format('d M Y H:i') }}</td>
                                    <td class="d-flex gap-2">
                                        <a href="#!" class="btn btn-sm btn-success" data-bs-toggle="modal"
                                            data-bs-target=".mini-outlet-form"
                                            data-url="{{ route('spinotek.outlets.groups.mini-outlets.edit', ['outlet' => $outlet->slug, 'group' => $outletGroup->slug, 'mini_outlet' => $miniOutlet->id]) }}"
                                            data-title="Edit Mini Outlet">
                                            <i class="fas fa-edit"></i>
                                            Edit
                                        </a>
                                        <x-button.delete :url="route('spinotek.outlets.groups.mini-outlets.destroy', [
                                            'outlet' => $outlet->slug,
                                            'group' => $outletGroup->slug,
                                            'mini_outlet' => $miniOutlet->id,
                                        ])" />
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center">Tidak ada data</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <div class="mt-3">
                    {{ $miniOutlets->withQueryString()->links() }}
                </div>
            </div>
        </div>
    </div>

    <x-modal.dynamic class="mini-outlet-form" />
</x-panel-layout>
