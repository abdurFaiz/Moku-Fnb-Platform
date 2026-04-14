<x-panel-layout>
    @include('includes.libs.chart-js')

    <div class="p-4">
        <div class="mb-3 d-flex justify-content-between align-items-center">
            <div>
                <h5 class="mb-1">Dashboard</h5>
                <p class="text-muted mb-0">Selamat datang di dashboard, {{ $currentOutlet->name }}!</p>
            </div>
            <div class="d-flex gap-2">
                <a href="{{ route('outlets.order-lines.index', $currentOutlet->slug) }}" class="btn btn-secondary">
                    <i class='bx bxs-bookmark-alt-minus'></i> Order Line
                </a>
                <a href="{{ route('outlets.products.index', $currentOutlet->slug) }}" class="btn btn-primary">
                    <i class='bx bx-coffee'></i> Produk
                </a>
                {{-- <div class="dropdown">
                    <button class="btn btn-primary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <i class='bx bx-bar-chart'></i> Analisa
                    </button>
                        <ul class="dropdown-menu">
                            <a class="dropdown-item"
                                href="{{ route('outlets.analytic.poin.index', $currentOutlet->slug) }}">
                                Poin
                            </a>
                            <a class="dropdown-item"
                                href="{{ route('outlets.analytic.sales.index', $currentOutlet->slug) }}">
                                Sales
                            </a>
                            <a class="dropdown-item"
                                href="{{ route('outlets.analytic.customer.index', $currentOutlet->slug) }}">
                                Customer
                            </a>
                        </ul>
                    </div> --}}
            </div>
        </div>

        {{-- Top Cards --}}
        <div class="row g-3 mb-4">
            {{-- Total Produk Terjual --}}
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Produk Terjual</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-list-status fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">
                                {{ number_format($stats['total_completed_orders']['value']) }}
                            </h3>
                            <span
                                class="badge {{ $stats['total_completed_orders']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_completed_orders']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_completed_orders']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_completed_orders']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['total_completed_orders']['diff']) }}
                                from last year</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Total Sales --}}
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Sales</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-cash-multiple fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ rupiahFormat($stats['total_sales']['value']) }}</h3>
                            <span
                                class="badge {{ $stats['total_sales']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_sales']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_sales']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_sales']['diff'] > 0 ? '+' : '' }}{{ rupiahFormat($stats['total_sales']['diff']) }}
                                from last year</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Total Net Sales --}}
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Net Sales</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-currency-usd fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ rupiahFormat($stats['total_profit']['value']) }}</h3>
                            <span
                                class="badge {{ $stats['total_profit']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_profit']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_profit']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_profit']['diff'] > 0 ? '+' : '' }}{{ rupiahFormat($stats['total_profit']['diff']) }}
                                from last year</p>
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
                                <h6 class="mb-1 fw-semibold">Statistik Total Penjualan</h6>
                            </div>
                            <div class="d-flex gap-2">
                                <form action="{{ url()->current() }}" method="GET" class="d-flex gap-2">
                                    <x-filter.years />
                                </form>
                            </div>
                        </div>
                        <div style="height: 300px;">
                            <canvas id="totalSalesChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                {{-- Outlet Profile --}}
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <h5 class="card-title fw-semibold">Outlet Profil</h5>
                        <div class="text-center">
                            <div class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2"
                                style="background-color: #F8CFB3; width: 200px; height: 200px;">
                                <img src="{{ asset('assets/images/ilustrations/undraw_building_burz.svg') }}"
                                    class="img-fluid" style="width: 150px;" alt="">
                            </div>
                            <h6 class="text-capitalize fw-semibold">
                                {{ $currentOutlet->name }}
                            </h6>
                        </div>

                        <div class="row mt-3">
                            <div class="col-4">
                                <div class="text-center">
                                    <div class="badge bg-info-subtle text-info p-2 mb-2 rounded-circle">
                                        <i class="mdi mdi-account-multiple fs-3"></i>
                                    </div>
                                    <p class="text-muted mb-0 fs-7">Customer</p>
                                    <h5 class="mb-0 fw-semibold">{{ $totalCustomers }}</h5>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="text-center">
                                    <div class="badge bg-success-subtle text-success p-2 mb-2 rounded-circle">
                                        <i class="mdi mdi-package-variant fs-3"></i>
                                    </div>
                                    <p class="text-muted mb-0 fs-7">Produk</p>
                                    <h5 class="mb-0 fw-semibold">{{ $totalProducts }}</h5>
                                </div>
                            </div>
                            <div class="col-4">
                                <div class="text-center">
                                    <div class="badge bg-warning-subtle text-warning p-2 mb-2 rounded-circle">
                                        <i class="mdi mdi-cart-check fs-3"></i>
                                    </div>
                                    <p class="text-muted mb-0 fs-7">Order</p>
                                    <h5 class="mb-0 fw-semibold">{{ $totalOrders }}</h5>
                                </div>
                            </div>
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
                            <i class="mdi mdi-trophy text-dark fs-5"></i>
                        </span>
                        <div>
                            <p class="text-uppercase text-muted fs-7 fw-semibold mb-1">Popular Products</p>
                            <h5 class="fw-semibold mb-0">Top Selling Items</h5>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="table-light">
                                <tr>
                                    <th scope="col" class="ps-3" style="width: 70px;">Rank</th>
                                    <th scope="col">Produk</th>
                                    <th scope="col">Harga</th>
                                    <th scope="col" class="text-end pe-3">Total Terjual</th>
                                </tr>
                            </thead>
                            <tbody>
                                @forelse ($popularProducts as $index => $product)
                                    <tr>
                                        <td class="ps-3 fw-semibold">#{{ $index + 1 }}</td>
                                        <td>
                                            <div class="d-flex align-items-center">
                                                <img src="{{ $product->imageUrl }}" alt="{{ $product->name }}"
                                                    class="rounded me-2" style="width: 45px; height: 45px;">
                                                <span class="fw-semibold text-dark">{{ $product->name }}</span>
                                            </div>
                                        </td>
                                        <td>{{ rupiahFormat($product->price) }}</td>
                                        <td class="text-end pe-3 fw-semibold">{{ $product->total_sales }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" class="text-center py-4">
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

    @push('scripts')
        <script>
            const ctx = document.getElementById('totalSalesChart').getContext('2d');
            const totalSalesChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: {!! json_encode($totalSalesChart->pluck('label')->toArray()) !!},
                    datasets: [{
                        label: 'Total Penjualan',
                        data: {!! json_encode($totalSalesChart->pluck('total_sales')->toArray()) !!},
                        backgroundColor: [
                            'rgba(234, 106, 18, 0.8)',
                        ],
                        borderColor: [
                            'rgba(234, 106, 18, 1)',
                        ],
                        borderWidth: 1,
                        borderRadius: 4,
                        barPercentage: 0.6,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: '#fff',
                            titleColor: '#6c757d',
                            bodyColor: '#343a40',
                            borderColor: '#e9ecef',
                            borderWidth: 1,
                            padding: 10,
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += 'Rp ' + new Intl.NumberFormat('id-ID').format(context.parsed.y);
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
                                color: '#98a6ad',
                                callback: function(value, index, values) {
                                    if (value >= 1000000) {
                                        return 'Rp ' + (value / 1000000) + 'jt';
                                    } else if (value >= 1000) {
                                        return 'Rp ' + (value / 1000) + 'rb';
                                    }
                                    return 'Rp ' + value;
                                }
                            }
                        }
                    }
                }
            });
        </script>
    @endpush
</x-panel-layout>
