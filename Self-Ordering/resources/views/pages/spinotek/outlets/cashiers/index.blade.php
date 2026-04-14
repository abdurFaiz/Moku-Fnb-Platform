<x-panel-layout>
    <div class="d-grid p-4">
        <div class="card">
            <div class="card-header">
                <div class="d-flex align-items-center justify-content-between">
                    <h5 class="card-title mb-0">Daftar Kasir {{ $outlet->name }}</h5>
                    <div class="flex gap-3">
                        <a href="#!" class="btn btn-primary"
                            data-bs-toggle="modal"
                            data-bs-target=".cashier-form"
                            data-url="{{ route('spinotek.cashiers.create', ['outlet_id' => $outlet->id]) }}"
                            data-title="Tambah Kasir"
                        >
                            <i class="mdi mdi-plus-circle me-1"></i>
                            {{ __('Tambah Kasir') }}
                        </a>
                        <x-button.back url="{{ route('spinotek.outlets.index') }}" />
                    </div>
                </div>
            </div>
            <div class="card-body">
                <form action="" class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                    <div class="d-flex align-items-center gap-3">
                        <x-filter.rows />
                    </div>
                    <div>
                        <x-filter.input-search placeholder="Cari Kasir..." />
                    </div>
                </form>
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th>{{ __('No') }}</th>
                                <th>{{ __('Cashier Name') }}</th>
                                <th>{{ __('Email') }}</th>
                                <th>{{ __('Action') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($cashiers as $key => $cashier)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td>{{ $cashier->name }}</td>
                                    <td>{{ $cashier->email }}</td>
                                    <td>
                                        <a href="#!" class="btn btn-sm btn-success"
                                            data-bs-toggle="modal"
                                            data-bs-target=".cashier-form"
                                            data-url="{{ route('spinotek.cashiers.edit', $cashier) }}"
                                            data-title="Edit Kasir"
                                        >
                                            <i class="mdi mdi-square-edit-outline me-1"></i>
                                            {{ __('Edit') }}
                                        </a>
                                        <x-button.delete 
                                            :url="route('spinotek.cashiers.destroy', $cashier)"
                                        />
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="4" class="text-center">Tidak ada kasir ditemukan.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <x-filter.pagination :data="$cashiers" />
            </div>
        </div>
    </div>

    <x-modal.dynamic class="cashier-form" />
</x-panel-layout>
