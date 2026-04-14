<x-panel-layout>
    @include('includes.libs.chart-js')

    <div class="p-4">
        <div class="mb-3 d-flex justify-content-between align-items-center">
            <h5 class="mb-1">Analisa Feedback Customer</h5>
            <div class="d-flex gap-2">
                <a href="{{ route('outlets.analytic.feedback.index', $currentOutlet->slug) }}"
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
            {{-- Total Feedback --}}
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Feedback</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="fas fa-comment-dots fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ number_format($stats['total_feedback']['value']) }}
                            </h3>
                            <span
                                class="badge {{ $stats['total_feedback']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_feedback']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_feedback']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_feedback']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['total_feedback']['diff']) }}
                                {{ $stats['total_feedback']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Response Rate --}}
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Response Rate</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="fas fa-percentage fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ number_format($stats['response_rate']['value'], 1) }}%
                            </h3>
                            <span
                                class="badge {{ $stats['response_rate']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['response_rate']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['response_rate']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['response_rate']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['response_rate']['diff'], 1) }}%
                                {{ $stats['response_rate']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Total Answers --}}
            <div class="col-md-6 col-lg-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <span class="text-muted text-uppercase fs-7 fw-semibold">Total Jawaban</span>
                            <div class="badge bg-primary-subtle text-primary p-2 rounded-3">
                                <i class="fas fa-list-ul fs-4"></i>
                            </div>
                        </div>
                        <div class="d-flex align-items-center mb-2">
                            <h3 class="mb-0 fw-semibold me-2">{{ number_format($stats['total_answers']['value']) }}
                            </h3>
                            <span
                                class="badge {{ $stats['total_answers']['is_increase'] ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger' }} rounded-pill">
                                <i
                                    class="mdi {{ $stats['total_answers']['is_increase'] ? 'mdi-arrow-up' : 'mdi-arrow-down' }}"></i>
                                {{ $stats['total_answers']['percentage'] }}%
                            </span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <p class="text-muted mb-0 fs-7">
                                {{ $stats['total_answers']['diff'] > 0 ? '+' : '' }}{{ number_format($stats['total_answers']['diff']) }}
                                {{ $stats['total_answers']['label'] }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Main Chart & Category Distribution --}}
        <div class="row g-3 mb-4">
            {{-- Feedback Growth Chart --}}
            <div class="col-md-8">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h6 class="mb-1 fw-semibold">Feedback Growth</h6>
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
                            <canvas id="feedbackChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            {{-- Category Distribution Chart --}}
            <div class="col-md-4">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <h6 class="mb-0 fw-semibold text-uppercase text-muted fs-7">Kategori Pertanyaan</h6>
                        </div>

                        <div class="position-relative mb-4" style="height: 250px;">
                            <canvas id="categoryChart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- Recent Feedbacks --}}
        <div class="row g-3">
            <div class="col-12">
                <div class="card h-100 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-3 gap-3">
                            <span class="badge bg-secondary-subtle text-secondary rounded-circle p-2">
                                <i class="fas fa-history text-dark fs-5"></i>
                            </span>
                            <div>
                                <p class="text-uppercase text-muted fs-7 fw-semibold mb-1">Question Analysis</p>
                                <h5 class="fw-semibold mb-0">Analisa Jawaban Terbanyak</h5>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-hover align-middle mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th scope="col" class="ps-3">Pertanyaan</th>
                                        <th scope="col">Kategori</th>
                                        <th scope="col">Jawaban Terpopuler</th>
                                        <th scope="col" class="text-end pe-3">Total Respon</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    @forelse ($recentFeedbacks as $stat)
                                        <tr>
                                            <td class="ps-3 fw-semibold">{{ $stat->question }}</td>
                                            <td>
                                                @php
                                                    $badgeClass = match ($stat->category) {
                                                        App\Enums\FeedbackQuestionCategoryEnum::GENERAL => 'bg-primary',
                                                        App\Enums\FeedbackQuestionCategoryEnum::PRODUCT => 'bg-success',
                                                        default => 'bg-secondary',
                                                    };
                                                @endphp
                                                <span
                                                    class="badge {{ $badgeClass }} bg-opacity-10 text-{{ str_replace('bg-', '', $badgeClass) }}">
                                                    {{ App\Enums\FeedbackQuestionCategoryEnum::getDescription($stat->category) }}
                                                </span>
                                            </td>
                                            <td>
                                                @if ($stat->top_option !== '-')
                                                    <div class="d-flex flex-column">
                                                        <span class="fw-bold text-dark">{{ $stat->top_option }}</span>
                                                        <small class="text-muted">{{ $stat->top_option_percent }}%
                                                            audience</small>
                                                    </div>
                                                @else
                                                    <span class="text-muted">-</span>
                                                @endif
                                            </td>
                                            <td class="text-end pe-3">
                                                <span class="fw-bold">{{ $stat->total_answers }}</span>
                                            </td>
                                        </tr>
                                    @empty
                                        <tr>
                                            <td colspan="4" class="text-center py-4">
                                                <p class="text-muted mb-0">Belum ada data</p>
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
                // Feedback Chart
                const ctx = document.getElementById('feedbackChart').getContext('2d');

                // Gradient for Feedback
                const gradientFeedback = ctx.createLinearGradient(0, 0, 0, 400);
                gradientFeedback.addColorStop(0, 'rgba(234, 106, 18, 0.2)');
                gradientFeedback.addColorStop(1, 'rgba(234, 106, 18, 0)');

                // Gradient for Previous Period
                const gradientPrev = ctx.createLinearGradient(0, 0, 0, 400);
                gradientPrev.addColorStop(0, 'rgba(114, 124, 245, 0.2)');
                gradientPrev.addColorStop(1, 'rgba(114, 124, 245, 0)');

                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: {!! json_encode($chartData['labels']) !!},
                        datasets: [{
                                label: 'Feedback',
                                data: {!! json_encode($chartData['datasets'][0]['data']) !!},
                                borderColor: '#ea6a12',
                                backgroundColor: gradientFeedback,
                                fill: true,
                                tension: 0.4,
                                pointRadius: 0,
                                pointHoverRadius: 5,
                                borderWidth: 2
                            },
                            {
                                label: 'Previous Period',
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
                                displayColors: true
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
                                beginAtZero: true,
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

                // Category Chart
                const catCtx = document.getElementById('categoryChart').getContext('2d');
                new Chart(catCtx, {
                    type: 'doughnut',
                    data: {
                        labels: {!! json_encode($categoryConfig['labels']) !!},
                        datasets: [{
                            data: {!! json_encode($categoryConfig['data']) !!},
                            backgroundColor: {!! json_encode($categoryConfig['colors']) !!},
                            borderWidth: 0,
                            hoverOffset: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                });
            });
        </script>
    @endpush
</x-panel-layout>
