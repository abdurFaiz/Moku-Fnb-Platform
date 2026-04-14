<x-panel-layout>
    @include('includes.libs.chart-js')

    <div class="p-4">
        <div class="mb-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-1">Analisa Produk</h5>
            <div class="d-flex gap-2">
                <a href="{{ route('outlets.analytic.product.index', $currentOutlet->slug) }}"
                    class="btn btn-light btn-sm"><i class="mdi mdi-refresh"></i></a>
                <div class="dropdown">
                    <button class="btn btn-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown"
                        aria-expanded="false">
                        <i class="mdi mdi-calendar-month-outline me-1"></i> {{ ucfirst($filterType) }}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="{{ url()->current() . '?filter_type=monthly' }}">Monthly</a>
                        </li>
                        <li><a class="dropdown-item" href="{{ url()->current() . '?filter_type=yearly' }}">Yearly</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        {{-- Top Cards --}}
        <div class="row g-3 mb-4">
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

            {{-- Total Product Revenue --}}
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Product Revenue</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-wallet fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">
                                {{ rupiahFormat($stats['total_product_revenue']['value']) }}</h3>
                            <span
                                class="badge {{ $stats['total_product_revenue']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_product_revenue']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_product_revenue']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_product_revenue']['diff'] > 0 ? '+' : '' }}{{ rupiahFormat($stats['total_product_revenue']['diff']) }}
                                {{ $stats['total_product_revenue']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Total Orders --}}
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Orders</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-shopping fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ number_format($stats['total_orders']['value']) }}</h3>
                            <span
                                class="badge {{ $stats['total_orders']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_orders']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_orders']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_orders']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['total_orders']['diff']) }}
                                {{ $stats['total_orders']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Avg Items Per Order --}}
            <div class="col-md-6 col-lg-3">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Avg Items / Order</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-chart-bar fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">
                                {{ number_format($stats['avg_items_per_order']['value'], 1) }}</h3>
                            <span
                                class="badge {{ $stats['avg_items_per_order']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['avg_items_per_order']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['avg_items_per_order']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['avg_items_per_order']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['avg_items_per_order']['diff'], 1) }}
                                {{ $stats['avg_items_per_order']['label'] }}</p>
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
                                <h6 class="mb-1 fw-semibold">Items Sold Overview</h6>
                                <h3 class="mb-0 fw-semibold">{{ number_format($stats['total_items_sold']['value']) }}
                                    <span
                                        class="badge {{ $stats['total_items_sold']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} fs-7 align-middle ms-2"><i
                                            class="mdi {{ $stats['total_items_sold']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                        {{ $stats['total_items_sold']['percentage'] }}%</span>
                                </h3>
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
                            <canvas id="productChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                {{-- Top Selling Products --}}
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
                                        <th scope="col">Sold</th>
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
                                            <td>{{ $product['sold'] }}</td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="3" class="text-center py-4">
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

        {{-- Most Liked & Most Searched --}}
        <div class="row g-3">
            {{-- Most Liked --}}
            <div class="col-md-6">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3 gap-3">
                            <span class="badge bg-pink-subtle text-pink rounded-circle p-2"
                                style="background-color: rgba(255, 107, 107, 0.1); color: #ff6b6b;">
                                <i class="mdi mdi-heart fs-5"></i>
                            </span>
                            <div>
                                <p class="text-uppercase text-muted fs-7 fw-semibold mb-1">Customer Favorites</p>
                                <h5 class="fw-semibold mb-0">Most Liked Products</h5>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th class="ps-3">Product</th>
                                        <th class="text-end pe-3">Likes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($mostLikedProducts as $product)
                                        <tr>
                                            <td class="ps-3">
                                                <div class="d-flex align-items-center">
                                                    <img src="{{ $product['image'] }}" class="rounded me-2"
                                                        width="32" height="32" alt="{{ $product['name'] }}">
                                                    <div>
                                                        <h6 class="mb-0 fs-7 fw-semibold text-dark">
                                                            {{ $product['name'] }}
                                                        </h6>
                                                        <small
                                                            class="text-muted">{{ rupiahFormat($product['price']) }}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="text-end pe-3">
                                                <span
                                                    class="badge bg-danger-subtle text-danger rounded-pill px-2 py-1">
                                                    <i class="mdi mdi-heart me-1"></i>{{ $product['likes'] }}
                                                </span>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="2" class="text-center py-4 text-muted">
                                                No likes data available
                                            </td>
                                        </tr>
                                    @endforelse
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Most Searched --}}
            <div class="col-md-6">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3 gap-3">
                            <span class="badge bg-info-subtle text-info rounded-circle p-2">
                                <i class="mdi mdi-magnify fs-5"></i>
                            </span>
                            <div>
                                <p class="text-uppercase text-muted fs-7 fw-semibold mb-1">Trending Searches</p>
                                <h5 class="fw-semibold mb-0">Most Searched</h5>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th class="ps-3">Product</th>
                                        <th class="text-end pe-3">Searches</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($mostSearchedProducts as $product)
                                        <tr>
                                            <td class="ps-3">
                                                <div class="d-flex align-items-center">
                                                    <img src="{{ $product['image'] }}" class="rounded me-2"
                                                        width="32" height="32" alt="{{ $product['name'] }}">
                                                    <div>
                                                        <h6 class="mb-0 fs-7 fw-semibold text-dark">
                                                            {{ $product['name'] }}
                                                        </h6>
                                                        <small
                                                            class="text-muted">{{ rupiahFormat($product['price']) }}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td class="text-end pe-3">
                                                <span class="badge bg-info-subtle text-info rounded-pill px-2 py-1">
                                                    <i
                                                        class="mdi mdi-magnify me-1"></i>{{ number_format($product['search_count']) }}
                                                </span>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="2" class="text-center py-4 text-muted">
                                                No search data available
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

    @push('scripts')
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const ctx = document.getElementById('productChart').getContext('2d');

                // Gradient for Items Sold
                const gradientNet = ctx.createLinearGradient(0, 0, 0, 400);
                gradientNet.addColorStop(0, 'rgba(234, 106, 18, 0.2)');
                gradientNet.addColorStop(1, 'rgba(234, 106, 18, 0)');

                // Gradient for Previous Period
                const gradientPrev = ctx.createLinearGradient(0, 0, 0, 400);
                gradientPrev.addColorStop(0, 'rgba(114, 124, 245, 0.2)');
                gradientPrev.addColorStop(1, 'rgba(114, 124, 245, 0)');

                const productChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: {!! json_encode($chartData['labels']) !!},
                        datasets: [{
                                label: 'Items Sold',
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
