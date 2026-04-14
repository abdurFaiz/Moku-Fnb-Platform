<x-panel-layout>
    @include('includes.libs.chart-js')

    <div class="p-4">
        <div class="mb-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-1">Analisa Sales</h5>
            <div class="d-flex gap-2">
                <a href="{{ route('outlets.analytic.sales.index', $currentOutlet->slug) }}"
                    class="btn btn-light btn-sm"><i class="mdi mdi-refresh"></i></a>
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
            {{-- Net Income --}}
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">New Net Income</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-wallet fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ rupiahFormat($stats['net_income']['value']) }}</h3>
                            <span
                                class="badge {{ $stats['net_income']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['net_income']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['net_income']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['net_income']['diff'] > 0 ? '+' : '' }}{{ rupiahFormat($stats['net_income']['diff']) }}
                                {{ $stats['net_income']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Average Sales --}}
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Average Sales</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-chart-bar fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ rupiahFormat($stats['average_sales']['value']) }}</h3>
                            <span
                                class="badge {{ $stats['average_sales']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['average_sales']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['average_sales']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['average_sales']['diff'] > 0 ? '+' : '' }}{{ rupiahFormat($stats['average_sales']['diff']) }}
                                {{ $stats['average_sales']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Total Order --}}
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Order</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-shopping fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ number_format($stats['total_order']['value']) }}</h3>
                            <span
                                class="badge {{ $stats['total_order']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_order']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_order']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_order']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['total_order']['diff']) }}
                                {{ $stats['total_order']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Total Items Sold --}}
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Items Sold</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-package-variant fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ number_format($stats['total_items_sold']['value']) }}
                            </h3>
                            <span
                                class="badge {{ $stats['total_items_sold']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_items_sold']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_items_sold']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_items_sold']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['total_items_sold']['diff']) }}
                                {{ $stats['total_items_sold']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Main Chart & Conversion --}}
        <div class="row g-3 mb-4">
            {{-- Sales Chart --}}
            <div class="col-md-8">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h6 class="mb-1 fw-semibold">Overall Sales</h6>
                                <h3 class="mb-0 fw-semibold">{{ rupiahFormat($stats['net_income']['value']) }} <span
                                        class="badge {{ $stats['net_income']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} fs-7 align-middle ms-2"><i
                                            class="mdi {{ $stats['net_income']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                        {{ $stats['net_income']['percentage'] }}%</span></h3>
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
                            <canvas id="salesChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Order Info Chart --}}
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="mb-0 fw-semibold text-uppercase text-muted fs-7">Order Info</h6>
                            {{-- <div class="dropdown">
                                <button class="btn btn-light btn-sm rounded-circle" type="button"
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                    <i class="mdi mdi-dots-horizontal"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item" href="#">Action</a></li>
                                    <li><a class="dropdown-item" href="#">Another action</a></li>
                                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                                </ul>
                            </div> --}}
                        </div>

                        <div class="position-relative mb-4" style="height: 250px;">
                            <canvas id="orderInfoChart"></canvas>
                            <div class="position-absolute top-50 start-50 translate-middle text-center">
                                <p class="text-muted mb-0 fs-7">Total Orders</p>
                                <h3 class="fw-semibold mb-0">{{ number_format($orderInfo['total_orders']) }}</h3>
                            </div>
                        </div>

                        <div class="d-flex justify-content-center gap-4">
                            <div class="d-flex align-items-center">
                                <span class="badge rounded-circle p-1 me-2" style="background-color: #ffbc00;">
                                </span>
                                <span class="text-muted fs-7">At Table</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <span class="badge rounded-circle p-1 me-2" style="background-color: #727cf5;">
                                </span>
                                <span class="text-muted fs-7">At Cashier</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Bottom Section --}}
        <div class="row g-3">
            {{-- Upgrade Plan --}}
            {{-- <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <p class="text-uppercase text-muted fs-7 fw-semibold mb-1">Upgrade</p>
                                <h5 class="fw-semibold">Premium Plan</h5>
                            </div>
                            <button class="btn btn-primary btn-sm">Upgrade</button>
                        </div>
                        <p class="text-muted mb-4 fs-7">Supercharge your sales management and unlock your full
                            potential for extraordinary success.</p>

                        <div class="d-flex gap-3">
                            <div class="border-end pe-3">
                                <p class="text-muted mb-1 fs-7">Performance</p>
                                <h5 class="fw-semibold text-success"><i class="mdi mdi-arrow-up"></i> 79%</h5>
                            </div>
                            <div>
                                <p class="text-muted mb-1 fs-7">Tools</p>
                                <h5 class="fw-semibold text-warning"><i class="mdi mdi-tools"></i> 30+</h5>
                            </div>
                        </div>
                    </div>
                </div>
            </div> --}}

            {{-- Top Selling Products --}}
            <div class="col-12">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3 gap-3">
                            <span class="badge bg-secondary-subtle text-secondary rounded-circle p-2">
                                <i class="mdi mdi-trophy text-dark fs-5"></i>
                            </span>
                            <div>
                                <p class="text-uppercase text-muted fs-7 fw-semibold mb-1">Top Selling Products</p>
                                <h5 class="fw-semibold mb-0">Top 10 Rankings</h5>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th scope="col" class="ps-3" style="width: 70px;">Rank</th>
                                        <th scope="col">Product Info</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Sold</th>
                                        <th scope="col" class="pe-3 text-end">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($products as $index => $product)
                                        <tr>
                                            <td class="ps-3 fw-semibold">#{{ $index + 1 }}</td>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <img src="{{ $product['image'] }}" class="rounded me-2"
                                                        width="32" height="32" alt="{{ $product['name'] }}">
                                                    <span class="fw-semibold text-dark">{{ $product['name'] }}</span>
                                                </div>
                                            </td>
                                            <td>{{ rupiahFormat($product['price']) }}</td>
                                            <td>{{ $product['sold'] }}</td>
                                            <td class="pe-3 text-end fw-semibold">
                                                {{ rupiahFormat($product['revenue']) }}
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="5" class="text-center py-4">
                                                <div class="d-flex flex-column align-items-center">
                                                    <i class="mdi mdi-package-variant-closed text-muted fs-1 mb-2"></i>
                                                    <p class="text-muted mb-0">No product sales data available for this
                                                        period</p>
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
    </div>
    </div>
    </div>

    @push('scripts')
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const ctx = document.getElementById('salesChart').getContext('2d');

                // Gradient for Net Sales
                const gradientNet = ctx.createLinearGradient(0, 0, 0, 400);
                gradientNet.addColorStop(0, 'rgba(234, 106, 18, 0.2)');
                gradientNet.addColorStop(1, 'rgba(234, 106, 18, 0)');

                // Gradient for Previous Period
                const gradientPrev = ctx.createLinearGradient(0, 0, 0, 400);
                gradientPrev.addColorStop(0, 'rgba(114, 124, 245, 0.2)');
                gradientPrev.addColorStop(1, 'rgba(114, 124, 245, 0)');

                const salesChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: {!! json_encode($chartData['labels']) !!},
                        datasets: [{
                                label: 'Net Sales',
                                data: {!! json_encode($chartData['datasets'][0]['data']) !!},
                                borderColor: '#ea6a12',
                                backgroundColor: gradientNet,
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
                                            label += 'Rp ' + new Intl.NumberFormat('id-ID').format(context
                                                .parsed.y);
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
                        },
                        interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false
                        }
                    }
                });
            });

            // Order Info Doughnut Chart
            const orderInfoCtx = document.getElementById('orderInfoChart').getContext('2d');
            const orderInfoChart = new Chart(orderInfoCtx, {
                type: 'doughnut',
                data: {
                    labels: ['At Table', 'At Cashier'],
                    datasets: [{
                        data: [{{ $orderInfo['at_table'] }}, {{ $orderInfo['at_cashier'] }}],
                        backgroundColor: ['#ffbc00', '#727cf5'],
                        borderWidth: 0,
                        cutout: '75%'
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
                            displayColors: true,
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    let value = context.parsed || 0;
                                    let total = {{ $orderInfo['total_orders'] }};
                                    let percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    return label + ': ' + value + ' (' + percentage + '%)';
                                }
                            }
                        }
                    }
                }
            });
        </script>
    @endpush
</x-panel-layout>
