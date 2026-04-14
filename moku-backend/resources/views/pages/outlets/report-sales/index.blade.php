<x-panel-layout title="Laporan Penjualan">
    <div class="p-4">
        <h5 class="mb-3">
            Laporan Penjualan Tahun {{ date('Y') }}
        </h5>
        <div class="row">
            <div class="col-md-6 col-lg-4">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <p class="text-muted mb-1">Total Order</p>
                                <h4 class="mb-0">{{ $totalOrders }}</h4>
                            </div>
                            <div>
                                <div class="badge bg-primary-subtle text-primary p-3">
                                    <i class="mdi mdi-list-status fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-4">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <p class="text-muted mb-1">Total Pendapatan</p>
                                <h4 class="mb-0">{{ rupiahFormat($totalSales) }}</h4>
                            </div>
                            <div>
                                <div class="badge bg-primary-subtle text-primary p-3">
                                    <i class="mdi mdi-cash-multiple fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6 col-lg-4">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex align-items-center justify-content-between">
                            <div>
                                <p class="text-muted mb-1">Total Keuntungan</p>
                                <h4 class="mb-0">{{ rupiahFormat($totalProfit) }}</h4>
                            </div>
                            <div>
                                <div class="badge bg-primary-subtle text-primary p-3">
                                    <i class="mdi mdi-currency-usd fs-4"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card">
            <div class="card-body">
                <form action="" class="row justify-content-between align-items-md-center gap-3 mb-3">
                    <div class="col-md-4 col-lg-3 d-flex align-items-center gap-3">
                        <x-filter.rows />
                        <x-form.select name="status" onchange="this.form.submit()">
                            <option value="">Semua Status</option>
                            <option value="1" {{ request()->query('status') == 1 ? 'selected' : '' }}>
                                Pending
                            </option>
                            <option value="2" {{ request()->query('status') == 2 ? 'selected' : '' }}>
                                Menunggu Konfirmasi
                            </option>
                            <option value="3" {{ request()->query('status') == 3 ? 'selected' : '' }}>
                                Dalam Proses
                            </option>
                            <option value="4" {{ request()->query('status') == 4 ? 'selected' : '' }}>
                                Selesai
                            </option>
                            <option value="5" {{ request()->query('status') == 5 ? 'selected' : '' }}>
                                Gagal
                            </option>
                            <option value="6" {{ request()->query('status') == 6 ? 'selected' : '' }}>
                                Expired
                            </option>
                        </x-form.select>
                    </div>
                    <div class="col-auto d-flex align-items-center gap-3">
                        <x-filter.input-search placeholder="Kode, Nama Customer ...." />
                    </div>
                </form>
                <div class="table-responsive">
                    <table class="table text-sm table-hover">
                        <thead>
                            <tr class="table-light">
                                <th></th>
                                <th>Kode Order</th>
                                <th>Nama</th>
                                <th>Sub Total</th>
                                <th>Diskon</th>
                                <th>Pajak</th>
                                <th>Biaya Layanan</th>
                                <th>Total Bayar</th>
                                <th>Total Net</th>
                                <th>Status</th>
                                <th>Status Layanan</th>
                                <th>Periode</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($reports as $index => $report)
                                <tr class="align-middle">
                                    <td>
                                        <button class="btn btn-sm border shadow rounded-circle"
                                            data-bs-toggle="collapse" data-bs-target="#detail-{{ $report->id }}"
                                            aria-expanded="false" aria-controls="detail-{{ $report->id }}">
                                            <i class="mdi mdi-chevron-right chevron-icon collapse-icon fs-6"></i>
                                        </button>
                                    </td>
                                    <td>{{ $report->code }}</td>
                                    <td>{{ $report->user->name }}</td>
                                    <td>{{ $report->sub_total }}</td>
                                    <td>
                                        ({{ rupiahFormat($report->discount) }})
                                    </td>
                                    <td>{{ rupiahFormat($report->tax) }}</td>
                                    <td>
                                        @if (@$report->service_fee_config == 1)
                                            ({{ rupiahFormat($report->total_fee_service) }})
                                        @else
                                            {{ rupiahFormat($report->total_fee_service) }}
                                        @endif
                                    </td>
                                    <td>{{ rupiahFormat($report->total) }}</td>
                                    <td>
                                        @if ($report->service_fee_config == 1 && $report->total > 0)
                                            {{ rupiahFormat($report->total - $report->total_fee_service) }}
                                        @else
                                            {{ rupiahFormat($report->total) }}
                                        @endif
                                    </td>
                                    <td>
                                        <x-badge.order-status :status="$report->status">
                                            {{ $report->statusLabel }}
                                        </x-badge.order-status>
                                    </td>
                                    <td>
                                        <x-badge.service-fee-config :status="$report->service_fee_config">
                                            {{ $report->serviceFeeConfigLabel }}
                                        </x-badge.service-fee-config>
                                    </td>
                                    <td>{{ $report->periodDate }}</td>
                                    <td>
                                        {{-- @if ($report->status == 3 || $report->status == 4)
                                            <div class="d-flex gap-2">
                                                <a href="{{ route('outlets.invoice.generate', [$currentOutlet->slug, $report->code]) }}"
                                                    target="_blank" class="btn btn-sm btn-secondary">
                                                    <i class="mdi mdi-file-document-outline"></i> Invoice
                                                </a>
                                            </div>
                                        @endif --}}
                                        <div class="d-flex align-items-center gap-2">
                                            <form
                                                action="{{ route('outlets.reports.sales.feedback', [$currentOutlet->slug, $report->id]) }}"
                                                method="POST" class="d-inline">
                                                @csrf
                                                <button type="submit" class="btn btn-sm btn-secondary text-nowrap"
                                                    title="Kirim Feedback Mandiri">
                                                    <i class="mdi mdi-email-fast-outline me-1"></i> Feedback
                                                </button>
                                            </form>
                                            <form
                                                action="{{ route('outlets.reports.sales.retention', [$currentOutlet->slug, $report->id]) }}"
                                                method="POST" class="d-inline">
                                                @csrf
                                                <button type="submit"
                                                    class="btn btn-sm btn-warning text-white text-nowrap"
                                                    title="Kirim Email Pengingat">
                                                    <i class="mdi mdi-bell-ring-outline me-1"></i> Ingatkan
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                                <tr class="collapse" id="detail-{{ $report->id }}">
                                    <td colspan="13">
                                        <div class="p-3 rounded-3">
                                            <h6 class="mb-3 fw-bold text-dark border-bottom pb-2">Detail Order</h6>

                                            <!-- Ringkasan Order -->
                                            <div class="row g-2 mb-3">
                                                <div class="col-md-3 text-muted">Kode Order</div>
                                                <div class="col-md-9 fw-semibold">{{ $report->code ?? '-' }}</div>

                                                <div class="col-md-3 text-muted">Customer</div>
                                                <div class="col-md-9">
                                                    <span class="fw-semibold">{{ $report->user->name }}</span>
                                                    <small class="text-muted">({{ $report->user->email }})</small>
                                                </div>

                                                <div class="col-md-3 text-muted">Tanggal</div>
                                                <div class="col-md-9">{{ $report->created_at->format('d M Y H:i') }}
                                                </div>
                                            </div>

                                            <!-- Daftar Produk -->
                                            <div class="list-group list-group-flush">
                                                @foreach ($report->orderProducts as $orderProduct)
                                                    <div class="list-group-item p-2 border-0 border-top">
                                                        <div class="d-flex justify-content-between align-items-start">
                                                            <div>
                                                                <p class="mb-1 fw-semibold">
                                                                    {{ $orderProduct->quantity }}×
                                                                    {{ $orderProduct->product->name }}
                                                                </p>

                                                                @if ($orderProduct->orderProductVariants->isNotEmpty())
                                                                    <ul class="small text-muted mb-1">
                                                                        @foreach ($orderProduct->orderProductVariants as $variant)
                                                                            <li>
                                                                                {{ $variant->productAttributeValue->productAttribute->name ?? 'Varian' }}:
                                                                                {{ $variant->productAttributeValue->name }}
                                                                            </li>
                                                                        @endforeach
                                                                    </ul>
                                                                @endif

                                                                @if ($orderProduct->note)
                                                                    <p class="mb-0 small fst-italic text-muted">
                                                                        Catatan: {{ $orderProduct->note }}
                                                                    </p>
                                                                @endif
                                                            </div>
                                                            <span class="fw-bold text-primary">
                                                                {{ rupiahFormat($orderProduct->total) }}
                                                            </span>
                                                        </div>
                                                    </div>
                                                @endforeach
                                            </div>

                                            <!-- Biaya Tambahan -->
                                            <div class="list-group list-group-flush border-bottom">
                                                @if ($report->discount)
                                                    <div
                                                        class="list-group-item d-flex justify-content-between p-2 border-0 border-top">
                                                        <span class="text-muted">Diskon</span>
                                                        <span
                                                            class="fw-semibold text-primary">{{ rupiahFormat($report->discount) }}</span>
                                                    </div>
                                                @endif

                                                @if ($report->tax)
                                                    <div
                                                        class="list-group-item d-flex justify-content-between p-2 border-0 border-top">
                                                        <span class="text-muted">Pajak</span>
                                                        <span
                                                            class="fw-semibold text-primary">{{ rupiahFormat($report->tax) }}</span>
                                                    </div>
                                                @endif

                                                @if ($report->total_fee_service)
                                                    <div
                                                        class="list-group-item d-flex justify-content-between p-2 border-0 border-top">
                                                        <span class="text-muted">Biaya Layanan</span>
                                                        <span class="fw-semibold text-primary">
                                                            {{ @$report->service_fee_config == 1 ? '-' : '' }}
                                                            {{ rupiahFormat($report->total_fee_service) }}</span>
                                                    </div>
                                                @endif
                                            </div>

                                            <!-- Total -->
                                            <div
                                                class="d-flex justify-content-between align-items-center p-2 bg-white rounded-bottom shadow-sm">
                                                <span class="fw-bold text-dark">Total Order</span>
                                                <span class="fw-bold text-primary fs-5">
                                                    @if ($report->service_fee_config == 1 && $report->total > 0)
                                                        {{ rupiahFormat($report->total - $report->total_fee_service) }}
                                                    @else
                                                        {{ rupiahFormat($report->total) }}
                                                    @endif
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="13" class="text-center">Tidak ada data laporan penjualan.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
                <x-filter.pagination :data="$reports" />
            </div>
        </div>
    </div>

    @push('styles')
        <style>
            .collapse-icon {
                display: inline-block;
                transition: transform 0.35s ease-in-out;
            }

            .collapse-icon.rotated {
                transform: rotate(90deg);
            }
        </style>
    @endpush

    @push('scripts')
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                document.querySelectorAll('[data-bs-toggle="collapse"]').forEach(btn => {
                    const icon = btn.querySelector('.collapse-icon');
                    const targetId = btn.getAttribute('data-bs-target');
                    const target = document.querySelector(targetId);

                    btn.addEventListener('click', function() {
                        // toggle langsung (tanpa nunggu animasi collapse)
                        icon.classList.toggle('rotated');
                    });

                    // sinkronisasi ketika collapse ditutup paksa (misal dari JS lain)
                    target.addEventListener('hidden.bs.collapse', () => {
                        icon.classList.remove('rotated');
                    });
                    target.addEventListener('shown.bs.collapse', () => {
                        icon.classList.add('rotated');
                    });
                });
            });
        </script>
    @endpush
</x-panel-layout>
