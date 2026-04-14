<x-panel-layout>
    <div class="d-grid p-4">
        <div class="card">
            <div class="card-header">
                <div class="d-flex align-items-center justify-content-between">
                    <h5 class="card-title mb-0">Daftar Outlet Group</h5>
                    <div class="flex gap-3">
                        <x-button.create url="{{ route('spinotek.outlet-groups.create') }}" text="Tambah" />
                    </div>
                </div>
            </div>
            <div class="card-body">
                <form action=""
                    class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                    <div class="d-flex align-items-center gap-3">
                        <x-filter.rows />
                    </div>
                    <div>
                        <x-filter.input-search placeholder="Cari Outlet Group..." />
                    </div>
                </form>
                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">
                        <thead>
                            <tr>
                                <th>{{ __('No') }}</th>
                                <th>{{ __('Nama') }}</th>
                                <th>{{ __('Jumlah Outlet') }}</th>
                                <th>{{ __('Action') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($outletGroups as $key => $outletGroup)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td>
                                        <div class="d-flex align-items-center gap-2">
                                            @if ($outletGroup->imageUrl)
                                                <img src="{{ $outletGroup->imageUrl }}" alt="{{ $outletGroup->name }}"
                                                    class="rounded-circle"
                                                    style="width: 40px; height: 40px; object-fit: cover;">
                                            @else
                                                <div class="rounded-circle bg-light d-flex align-items-center justify-content-center"
                                                    style="width: 40px; height: 40px;">
                                                    <i class="bi bi-image text-muted"></i>
                                                </div>
                                            @endif
                                            <span>{{ $outletGroup->name }}</span>
                                        </div>
                                    </td>
                                    <td>{{ $outletGroup->outlet_group_members_count }}</td>
                                    <td>
                                        <x-button.link :url="route('spinotek.outlet-groups.show', $outletGroup->slug)" class="btn-secondary btn-sm">
                                            <i class="mdi mdi-storefront-outline"></i>
                                            List Outlet
                                        </x-button.link>
                                        <x-button.edit :url="route('spinotek.outlet-groups.edit', $outletGroup->slug)" />
                                        <x-button.delete :url="route('spinotek.outlet-groups.destroy', $outletGroup->slug)" />
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="3" class="text-center">Tidak ada outlet group ditemukan.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <x-filter.pagination :data="$outletGroups" />
            </div>
        </div>
    </div>
</x-panel-layout>
