<x-panel-layout>
    @include('includes.helpers.update-published')

    <div class="d-grid p-4">
        <div class="card">
            <div class="card-header">
                <div class="d-flex align-items-center justify-content-between">
                    <h5 class="card-title mb-0">Daftar Customer</h5>
                </div>
            </div>
            <div class="card-body">
                <form action="" class="d-flex justify-content-between align-items-center mb-3">
                    <div class="row">
                        <div class="col">
                            <x-filter.rows />
                        </div>
                        <div class="col-auto">
                            <x-form.select name="gender" onchange="this.form.submit()">
                                <option value="">Semua</option>
                                <option value="1" {{ @$_GET['gender'] == '1' ? 'selected' : '' }}>Pria</option>
                                <option value="2" {{ @$_GET['gender'] == '2' ? 'selected' : '' }}>Wanita</option>
                            </x-form.select>
                        </div>
                    </div>
                    <div>
                        <x-filter.input-search placeholder="Cari Customer..." />
                    </div>
                </form>
                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">
                        <thead>
                            <tr>
                                <th>{{ __('No') }}</th>
                                <th>Nama</th>
                                <th>Telepon</th>
                                <th>Jenis Kelamin</th>
                                <th>Pekerjaan</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($customers as $key => $customer)
                                <tr>
                                    <td>{{ $key + 1 }}</td>
                                    <td>
                                        <img src="{{ $customer->avatarUrl }}" alt="" class="avatar-sm rounded-circle me-2">
                                        {{ $customer->name }}
                                    </td>
                                    <td>{{ $customer->phone ?? '-' }}</td>
                                    <td>{{ $customer->customerProfile->genderDescription }}</td>
                                    <td>{{ $customer->customerProfile->job }}</td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center">Tidak ada customer tersedia.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <x-filter.pagination :data="$customers" />
            </div>
        </div>
    </div>
</x-panel-layout>
