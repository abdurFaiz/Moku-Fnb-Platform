<x-panel-layout title="Manajemen Pertanyaan Feedback" bgClass="bg-white">
    <div class="p-4">
        <div class="card">
            <div class="card-header">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Daftar Pertanyaan Feedback</h5>
                    <x-button.create :url="route('outlets.feedback-questions.create', $currentOutlet->slug)" text="Tambah Pertanyaan" />
                </div>
            </div>
            <div class="card-body">
                <form action="" class="d-flex justify-content-between align-items-center mb-3">
                    <div class="row">
                        <div class="col">
                            <x-filter.rows />
                        </div>
                        <div class="col-auto">
                            <x-form.select name="category" onchange="this.form.submit()">
                                <option value="">Semua Kategori</option>
                                @foreach ($categories as $key => $description)
                                    <option value="{{ $key }}"
                                        {{ request('category') == $key ? 'selected' : '' }}>
                                        {{ $description }}
                                    </option>
                                @endforeach
                            </x-form.select>
                        </div>
                    </div>
                    <div>
                        <x-filter.input-search placeholder="Cari Pertanyaan..." />
                    </div>
                </form>

                <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">
                        <thead>
                            <tr>
                                <th style="width: 5%">No</th>
                                <th style="width: 40%">Pertanyaan</th>
                                <th style="width: 20%">Kategori</th>
                                <th style="width: 15%">Opsi</th>
                                <th style="width: 20%" class="text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse ($questions as $index => $question)
                                <tr>
                                    <td>{{ $questions->firstItem() + $index }}</td>
                                    <td>
                                        <div class="d-flex flex-column">
                                            <span>{{ $question->question }}</span>
                                            @if ($question->questionable_type === 'App\Models\Product')
                                                <small class="text-muted">
                                                    <i class="fas fa-box me-1"></i>
                                                    {{ $question->questionable->name ?? 'Produk Terhapus' }}
                                                </small>
                                            @endif
                                        </div>
                                    </td>
                                    <td>
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
                                    <td>
                                        @if ($question->options_count > 0)
                                            <span class="badge bg-secondary">{{ $question->options_count }} Opsi</span>
                                        @else
                                            <span class="text-muted fst-italic">Tidak ada opsi</span>
                                        @endif
                                    </td>
                                    <td class="text-center">
                                        @if ($question->answers_count > 0)
                                            <a href="{{ route('outlets.feedback-questions.analysis', [$currentOutlet->slug, $question->id]) }}"
                                                class="btn btn-sm btn-soft-info me-1" data-bs-toggle="tooltip"
                                                title="Lihat Analisa">
                                                <i class="fas fa-chart-pie collapsed"></i>
                                            </a>
                                            {{-- <button class="btn btn-sm btn-secondary me-1" disabled
                                                data-bs-toggle="tooltip"
                                                title="Tidak dapat diubah karena sudah ada jawaban">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="btn btn-sm btn-secondary" disabled data-bs-toggle="tooltip"
                                                title="Tidak dapat dihapus karena sudah ada jawaban">
                                                <i class="fas fa-trash"></i>
                                            </button> --}}
                                        @else
                                            <a href="{{ route('outlets.feedback-questions.edit', [$currentOutlet->slug, $question->id]) }}"
                                                class="btn btn-sm btn-warning me-1" data-bs-toggle="tooltip"
                                                title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </a>
                                            <x-button.delete :url="route('outlets.feedback-questions.destroy', [
                                                $currentOutlet->slug,
                                                $question->id,
                                            ])" />
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center py-4 text-muted">
                                        <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                                        Belum ada pertanyaan feedback
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <div class="mt-3">
                    <x-filter.pagination :data="$questions" />
                </div>
            </div>
        </div>
    </div>
</x-panel-layout>
