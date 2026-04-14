<x-panel-layout>
    @include('includes.libs.chart-js')

    <div class="p-4">
        <div class="mb-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-1">Analisa Customer</h5>
            <div class="d-flex gap-2">
                <a href="{{ route('outlets.analytic.customer.index', $currentOutlet->slug) }}"
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
            </div>
        </div>

        {{-- Top Cards --}}
        <div class="row g-3 mb-4">
            {{-- Total Customers --}}
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Customers</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-account-group fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ number_format($stats['total_customers']['value']) }}
                            </h3>
                            <span
                                class="badge {{ $stats['total_customers']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_customers']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_customers']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_customers']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['total_customers']['diff']) }}
                                {{ $stats['total_customers']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Active Customers --}}
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Active Customers</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-account-check fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ number_format($stats['active_customers']['value']) }}
                            </h3>
                            <span
                                class="badge {{ $stats['active_customers']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['active_customers']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['active_customers']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['active_customers']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['active_customers']['diff']) }}
                                {{ $stats['active_customers']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Total Revenue --}}
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Revenue</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="mdi mdi-cash-multiple fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ rupiahFormat($stats['total_revenue']['value']) }}</h3>
                            <span
                                class="badge {{ $stats['total_revenue']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_revenue']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_revenue']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_revenue']['diff'] > 0 ? '+' : '' }}{{ rupiahFormat($stats['total_revenue']['diff']) }}
                                {{ $stats['total_revenue']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row g-3 mb-4">
            <div class="col-lg-8">
                {{-- Main Chart & Ranking --}}
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h6 class="mb-1 fw-semibold">Total Customer Purchases</h6>
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
                            <canvas id="customerChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                {{-- Top Customers Ranking --}}
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3 gap-3">
                            <span class="badge bg-secondary-subtle text-secondary rounded-circle p-2">
                                <i class="mdi mdi-trophy text-dark fs-5"></i>
                            </span>
                            <div>
                                <p class="text-uppercase text-muted fs-7 fw-semibold mb-1">Top Customers</p>
                                <h5 class="fw-semibold mb-0">Most Frequent Buyers</h5>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th scope="col" class="ps-3" style="width: 70px;">Rank</th>
                                        <th scope="col">Customer</th>
                                        <th scope="col">Total Purchases</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($topCustomers as $index => $customer)
                                        <tr>
                                            <td class="ps-3 fw-semibold">#{{ $index + 1 }}</td>
                                            <td>
                                                <div class="d-flex align-items-center">
                                                    <img src="{{ $customer['image'] }}" class="rounded-circle me-2"
                                                        width="32" height="32" alt="{{ $customer['name'] }}">
                                                    <span class="fw-semibold text-dark">{{ $customer['name'] }}</span>
                                                </div>
                                            </td>
                                            <td>{{ $customer['total_purchases'] }} Orders</td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="3" class="text-center py-4">
                                                <div class="d-flex flex-column align-items-center">
                                                    <i class="mdi mdi-account-off text-muted fs-1 mb-2"></i>
                                                    <p class="text-muted mb-0">No customer data available for this
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

    @push('scripts')
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                const ctx = document.getElementById('customerChart').getContext('2d');

                // Gradient for Customer Growth
                const gradientCustomer = ctx.createLinearGradient(0, 0, 0, 400);
                gradientCustomer.addColorStop(0, 'rgba(234, 106, 18, 0.2)');
                gradientCustomer.addColorStop(1, 'rgba(234, 106, 18, 0)');

                // Gradient for Previous Period
                const gradientPrev = ctx.createLinearGradient(0, 0, 0, 400);
                gradientPrev.addColorStop(0, 'rgba(114, 124, 245, 0.2)');
                gradientPrev.addColorStop(1, 'rgba(114, 124, 245, 0)');

                const customerChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: {!! json_encode($chartData['labels']) !!},
                        datasets: [{
                                label: 'Total Purchases',
                                data: {!! json_encode($chartData['datasets'][0]['data']) !!},
                                borderColor: '#ea6a12',
                                backgroundColor: gradientCustomer,
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
