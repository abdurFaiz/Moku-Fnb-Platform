<x-panel-layout>
    @include('includes.helpers.update-published')

    <div class="d-grid p-4">
        <div class="card">
            <div class="card-header">
                <div class="d-flex align-items-center justify-content-between">
                    <h5 class="card-title mb-0">Daftar Outlet</h5>
                    <div>
                        <button type="button" class="btn btn-secondary" data-bs-toggle="modal"
                            data-bs-target="#duplicateModal">
                            <i class="mdi mdi-content-copy me-1"></i>
                            {{ __('Duplicate Data') }}
                        </button>
                        <x-button.create :url="route('spinotek.outlets.create')" :text="__('Tambah Outlet')" />
                    </div>
                </div>
            </div>
            <div class="card-body">
                <form action="" class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <x-filter.rows />
                    </div>
                    <div>
                        <x-filter.input-search placeholder="Cari Outlet..." />
                    </div>
                </form>
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>{{ __('No') }}</th>
                                <th>{{ __('Nama Outlet') }}</th>
                                <th>{{ __('Aktif') }}</th>
                                <th>{{ __('Status Ipaymu') }}</th>
                                <th>{{ __('Aksi') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($outlets as $key => $outlet)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td>{{ $outlet->name }}</td>
                                    <td>
                                        <x-form.update-published :data="$outlet" table="outlets" field="is_active" />
                                    </td>
                                    <td>
                                        <x-badge.outlet-ipaymu-status :outlet="$outlet" />
                                    </td>
                                    <td>
                                        <a href="{{ route('spinotek.outlets.show', $outlet) }}"
                                            class="btn btn-sm btn-secondary">
                                            <i class="mdi mdi-account-box-multiple me-1"></i>
                                            {{ __('Cashier') }}
                                        </a>
                                        <a href="{{ route('spinotek.outlets.schedule.index', $outlet->slug) }}"
                                            class="btn btn-sm btn-warning">
                                            <i class="mdi mdi mdi-clock-outline me-1"></i>
                                            {{ __('Schedule') }}
                                        </a>
                                        <a href="{{ route('spinotek.outlets.banners.index', $outlet->slug) }}"
                                            class="btn btn-sm btn-info">
                                            <i class="mdi mdi-image-multiple-outline me-1"></i>
                                            {{ __('Banner') }}
                                        </a>
                                        <x-button.edit :url="route('spinotek.outlets.edit', $outlet)" :text="__('Edit')" />
                                        <x-button.delete :url="route('spinotek.outlets.destroy', $outlet)" />
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center">Tidak ada outlet tersedia.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <x-filter.pagination :data="$outlets" />
            </div>
        </div>
    </div>
    @include('pages.spinotek.outlets.modals.duplicate')
</x-panel-layout>
