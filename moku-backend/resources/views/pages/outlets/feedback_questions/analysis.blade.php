<x-panel-layout :title="$title" bgClass="bg-light">
    <div class="p-4">

        <div class="card mb-4">
            <div class="card-header d-flex align-items-center justify-content-between">
                <div>
                    <h5 class="card-title mb-0">Detail Pertanyaan</h5>
                </div>
                <div>
                    <a href="{{ route('outlets.feedback-questions.index', $currentOutlet->slug) }}"
                        class="btn btn-secondary btn-sm">
                        <i class="fas fa-arrow-left me-1"></i> Kembali
                    </a>
                </div>
            </div>
            <div class="card-body">
                <h4 class="mb-3">{{ $question->question }}</h4>
                <div class="row">
                    <div class="col-md-6">
                        <table class="table table-borderless table-sm">
                            <tr>
                                <td style="width: 150px" class="text-muted">Kategori</td>
                                <td>:
                                    @php
                                        $badgeClass = match ($question->category) {
                                            App\Enums\FeedbackQuestionCategoryEnum::GENERAL => 'bg-primary',
                                            App\Enums\FeedbackQuestionCategoryEnum::PRODUCT => 'bg-success',
                                            default => 'bg-secondary',
                                        };
                                    @endphp
                                    <span class="badge {{ $badgeClass }}">
                                        {{ App\Enums\FeedbackQuestionCategoryEnum::getDescription($question->category) }}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td class="text-muted">Total Jawaban</td>
                                <td>: {{ $answers->count() }} Responden</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        @if ($optionStats->isNotEmpty())
            <div class="card mb-4">
                <div class="card-header">
                    <h5 class="card-title mb-0">Statistik Jawaban</h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        @foreach ($optionStats as $stat)
                            <div class="col-md-6 mb-3">
                                <div class="d-flex justify-content-between mb-1">
                                    <span class="fw-semibold">{{ $stat['label'] }}</span>
                                    <span>{{ $stat['count'] }} ({{ $stat['percentage'] }}%)</span>
                                </div>
                                <div class="progress" style="height: 20px;">
                                    <div class="progress-bar" role="progressbar"
                                        style="width: {{ $stat['percentage'] }}%; background-color: {{ $stat['color'] }}"
                                        aria-valuenow="{{ $stat['percentage'] }}" aria-valuemin="0"
                                        aria-valuemax="100"></div>
                                </div>
                            </div>
                        @endforeach
                    </div>
                </div>
            </div>
        @endif

        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Daftar Jawaban Customer</h5>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-striped table-hover">
                        <thead>
                            <tr>
                                <th style="width: 5%">No</th>
                                <th style="width: 20%">Customer</th>
                                <th style="width: 15%">Jawaban</th>
                                <th style="width: 35%">Komentar</th>
                                <th style="width: 25%">Waktu Pengerjaan</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($answers as $index => $answer)
                                <tr>
                                    <td>{{ $index + 1 }}</td>
                                    <td>
                                        {{-- @if ($answer->feedback && $answer->feedback->is_anonymous) --}}
                                        <span class="text-muted fst-italic">Anonymous</span>
                                        {{-- @else
                                            @if ($answer->user)
                                                <div class="d-flex flex-column">
                                                    <span class="fw-bold">{{ $answer->user->name }}</span>
                                                    <small class="text-muted">{{ $answer->user->email }}</small>
                                                </div>
                                            @else
                                                <span class="text-muted">-</span>
                                            @endif
                                        @endif --}}
                                    </td>
                                    <td>
                                        @if ($answer->feedbackOptionQuestion)
                                            <span class="badge badge-soft-primary">
                                                {{ $answer->feedbackOptionQuestion->option }}
                                            </span>
                                        @endif
                                    </td>
                                    <td>
                                        @if ($answer->comment)
                                            <span class="fst-italic">"{{ $answer->comment }}"</span>
                                        @else
                                            -
                                        @endif
                                    </td>
                                    <td>
                                        @if ($answer->feedback && $answer->feedback->updated_at)
                                            <div class="d-flex flex-column">
                                                <span
                                                    class="fw-semibold">{{ $answer->feedback->updated_at->locale('id')->diffForHumans() }}</span>
                                                <small
                                                    class="text-muted">{{ $answer->feedback->updated_at->locale('id')->isoFormat('D MMM Y, HH:mm') }}</small>
                                            </div>
                                        @else
                                            <span class="text-muted">-</span>
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center py-4 text-muted">
                                        Belum ada jawaban
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</x-panel-layout>
