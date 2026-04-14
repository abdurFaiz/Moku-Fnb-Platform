<x-panel-layout>
    @include('includes.libs.chart-js')

    <div class="p-4">
        <div class="mb-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-1">Analisa Poin</h5>
            <div class="d-flex gap-2">
                <a href="{{ route('outlets.analytic.poin.index', $currentOutlet->slug) }}" class="btn btn-light btn-sm"><i
                        class="mdi mdi-refresh"></i></a>
                <div class="dropdown">
                    <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <i class="mdi mdi-calendar-month-outline me-1"></i> {{ ucfirst($filterType) }}
                    </button>
                    <ul class="dropdown-menu">
                        {{-- <li><a class="dropdown-item" href="#">Weekly</a></li> --}}
                        <li><a class="dropdown-item" href="{{ url()->current() . '?filter_type=monthly' }}">Monthly</a>
                        </li>
                        <li><a class="dropdown-item" href="{{ url()->current() . '?filter_type=yearly' }}">Yearly</a>
                        </li>
                    </ul>
                </div>
                {{-- <button class="btn btn-primary btn-sm"><i class="mdi mdi-download me-1"></i> Download</button> --}}
            </div>
        </div>

        {{-- Top Cards --}}
        <div class="row g-3 mb-4">
            {{-- Total Points Issued --}}
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Poin Dikeluarkan</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-tag-plus-outline fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ number_format($stats['total_issued']['value']) }}</h3>
                            <span
                                class="badge {{ $stats['total_issued']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_issued']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_issued']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_issued']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['total_issued']['diff']) }}
                                {{ $stats['total_issued']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Total Points Redeemed --}}
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Poin Redeem</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-tag-text-outline fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ number_format($stats['total_redeemed']['value']) }}
                            </h3>
                            <span
                                class="badge {{ $stats['total_redeemed']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_redeemed']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_redeemed']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_redeemed']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['total_redeemed']['diff']) }}
                                {{ $stats['total_redeemed']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Average Points per Transaction --}}
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Rata-rata Poin / Transaksi</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-order-bool-descending-variant fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">
                                {{ number_format($stats['average_per_transaction']['value']) }}</h3>
                            <span
                                class="badge {{ $stats['average_per_transaction']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['average_per_transaction']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['average_per_transaction']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['average_per_transaction']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['average_per_transaction']['diff']) }}
                                {{ $stats['average_per_transaction']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-lg-8">
                {{-- Main Chart --}}
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h6 class="mb-1 fw-semibold">Statistik Poin Dikeluarkan</h6>
                            </div>
                            <div class="d-flex gap-2">
                                <form action="{{ url()->current() }}" method="GET" class="d-flex gap-2">
                                    <input type="hidden" name="filter_type" value="{{ $filterType }}">
                                    @if ($filterType === 'monthly')
                                        <select name="month" class="form-select form-select-sm border-0 bg-light"
                                            style="width: auto;" onchange="this.form.submit()">
                                            @foreach ($months as $key => $val)
                                                <option value="{{ $key }}"
                                                    {{ $filterMonth == $key ? 'selected' : '' }}>{{ $val }}
                                                </option>
                                            @endforeach
                                        </select>
                                    @endif
                                    <select name="year" class="form-select form-select-sm border-0 bg-light"
                                        style="width: auto;" onchange="this.form.submit()">
                                        @foreach ($years as $year)
                                            <option value="{{ $year }}"
                                                {{ $filterYear == $year ? 'selected' : '' }}>{{ $year }}
                                            </option>
                                        @endforeach
                                    </select>
                                </form>
                            </div>
                        </div>
                        <div style="height: 300px;">
                            <canvas id="poinChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                {{-- Top Redeemed Products --}}
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3 gap-3">
                            <span class="badge bg-secondary-subtle text-secondary rounded-circle p-2">
                                <i class="mdi mdi-trophy text-dark fs-5"></i>
                            </span>
                            <div>
                                <p class="text-uppercase text-muted fs-7 fw-semibold mb-1">Top Redeemed Products</p>
                                <h5 class="fw-semibold mb-0">Most Claimed Rewards</h5>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th scope="col" class="ps-3" style="width: 70px;">Rank</th>
                                        <th scope="col">Product</th>
                                        <th scope="col" class="text-end pe-3">Total Claim</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($products as $index => $product)
                                        <tr>
                                            <td class="ps-3 fw-semibold">#{{ $index + 1 }}</td>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <img src="{{ $product->imageUrl }}" class="rounded me-2"
                                                        width="32" height="32" alt="{{ $product->name }}">
                                                    <span class="fw-semibold text-dark">{{ $product->name }}</span>
                                                </div>
                                            </td>
                                            <td class="text-end pe-3 fw-semibold">
                                                {{ $product->total_voucher_claimed }}</td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="3" class="text-center py-4">
                                                <div class="d-flex flex-column align-items-center">
                                                    <i class="mdi mdi-package-variant-closed text-muted fs-1 mb-2"></i>
                                                    <p class="text-muted mb-0">No data available</p>
                                                </div>
                                            </td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-12">
            <div class="card border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3 gap-3">
                        <span class="badge bg-secondary-subtle text-secondary rounded-circle p-2">
                            <i class="mdi mdi-account-star text-dark fs-5"></i>
                        </span>
                        <div>
                            <p class="text-uppercase text-muted fs-7 fw-semibold mb-1">Top Customers</p>
                            <h5 class="fw-semibold mb-0">Highest Average Points per Transaction</h5>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th scope="col" class="ps-3">Rank</th>
                                    <th scope="col">Nama</th>
                                    <th scope="col">Email</th>
                                    <th scope="col">No. Telepon</th>
                                    <th scope="col">Pekerjaan</th>
                                    <th scope="col" class="text-end pe-3">Rata-rata Poin</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($customers as $customer)
                                    <tr>
                                        <td class="ps-3 fw-semibold" style="width: 70px;">#{{ $loop->iteration }}
                                        </td>
                                        <td>{{ $customer->name }}</td>
                                        <td>{{ $customer->email }}</td>
                                        <td>{{ $customer->phone ?? '-' }}</td>
                                        <td>{{ @$customer?->customerProfile?->job ?? '-' }}</td>
                                        <td class="text-end pe-3 fw-semibold">
                                            {{ number_format($customer->current_avg_points, 1) }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="6" class="text-center py-4">
                                            <div class="d-flex flex-column align-items-center">
                                                <i class="mdi mdi-account-off text-muted fs-1 mb-2"></i>
                                                <p class="text-muted mb-0">No customer data available</p>
                                            </div>
                                        </td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const ctx = document.getElementById('poinChart').getContext('2d');

                // Gradient for Points Issued
                const gradientPoints = ctx.createLinearGradient(0, 0, 0, 400);
                gradientPoints.addColorStop(0, 'rgba(234, 106, 18, 0.2)');
                gradientPoints.addColorStop(1, 'rgba(234, 106, 18, 0)');

                // Gradient for Previous Period
                const gradientPrev = ctx.createLinearGradient(0, 0, 0, 400);
                gradientPrev.addColorStop(0, 'rgba(114, 124, 245, 0.2)');
                gradientPrev.addColorStop(1, 'rgba(114, 124, 245, 0)');

                const poinChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: {!! json_encode($chartData['labels']) !!},
                        datasets: [{
                                label: 'Points Issued',
                                data: {!! json_encode($chartData['datasets'][0]['data']) !!},
                                borderColor: '#ea6a12',
                                backgroundColor: gradientPoints,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 0,
                                pointHoverRadius: 5,
                                borderWidth: 2
                            },
                            {
                                label: 'Last Period',
                                data: {!! json_encode($chartData['datasets'][1]['data']) !!},
                                borderColor: '#727cf5',
                                backgroundColor: gradientPrev,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 0,
                                pointHoverRadius: 5,
                                borderWidth: 2,
                                borderDash: [5, 5]
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                align: 'end',
                                labels: {
                                    usePointStyle: true,
                                    boxWidth: 8
                                }
                            },
                            tooltip: {
                                mode: 'index',
                                intersect: false,
                                backgroundColor: '#fff',
                                titleColor: '#6c757d',
                                bodyColor: '#343a40',
                                borderColor: '#e9ecef',
                                borderWidth: 1,
                                padding: 10,
                                displayColors: true,
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        if (context.parsed.y !== null) {
                                            label += context.parsed.y;
                                        }
                                        return label;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: {
                                    display: false,
                                    drawBorder: false
                                },
                                ticks: {
                                    color: '#98a6ad'
                                }
                            },
                            y: {
                                grid: {
                                    color: '#f1f3fa',
                                    drawBorder: false,
                                    borderDash: [5, 5]
                                },
                                ticks: {
                                    color: '#98a6ad'
                                }
                            }
                        },
                        interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false
                        }
                    }
                });
            });
        </script>
    @endpush
</x-panel-layout>
