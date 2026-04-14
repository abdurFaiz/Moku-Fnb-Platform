<x-panel-layout title="{{ $title }}">
    @include('includes.libs.select2')

    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card my-4">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="card-title mb-0">{{ $title }}</h5>
                        <x-button.back :url="route('outlets.feedback-questions.index', $currentOutlet->slug)" />
                    </div>

                    <x-form action="{{ $action }}" method="POST">
                        @if (@$question)
                            @method('PUT')
                        @endif

                        <div class="mb-3">
                            <x-form.input-label :required="true">Pertanyaan</x-form.input-label>
                            <x-form.input type="text" name="question" placeholder="Masukkan pertanyaan" required
                                value="{{ old('question', @$question->question) }}" />
                            <x-form.input-error name="question" />
                        </div>

                        <div class="mb-3">
                            <x-form.input-label :required="true">Kategori</x-form.input-label>
                            <x-form.select name="category" required id="category-select">
                                <option value="">Pilih Kategori</option>
                                @foreach ($categories as $key => $description)
                                    <option value="{{ $key }}"
                                        {{ old('category', @$question->category) == $key ? 'selected' : '' }}>
                                        {{ $description }}
                                    </option>
                                @endforeach
                            </x-form.select>
                            <x-form.input-error name="category" />
                        </div>

                        <div class="mb-3" id="product-select-container" style="display: none;">
                            <x-form.input-label :required="true">Pilih Produk</x-form.input-label>
                            <x-form.select name="product_ids[]" class="select2" id="product-select" multiple>
                                @foreach ($products as $product)
                                    <option value="{{ $product->id }}"
                                        {{ in_array($product->id, old('product_ids', @$question ? $question->questionables->pluck('questionable_id')->toArray() : [])) ? 'selected' : '' }}>
                                        {{ $product->name }}
                                    </option>
                                @endforeach
                            </x-form.select>
                            <x-form.input-error name="product_ids" />
                        </div>

                        <div class="mb-3">
                            <x-form.input-label>Opsi Jawaban (Opsional)</x-form.input-label>
                            <p class="text-muted small">Tambahkan opsi jika pertanyaan ini bertipe pilihan ganda.</p>

                            <div id="options-container">
                                @if (old('options', @$question && $question->options ? $question->options->pluck('option')->toArray() : []))
                                    @foreach (old('options', @$question && $question->options ? $question->options->pluck('option')->toArray() : []) as $index => $option)
                                        <div class="input-group mb-2 option-row">
                                            <input type="text" name="options[]" class="form-control"
                                                placeholder="Opsi jawaban" value="{{ $option }}">
                                            <button class="btn btn-outline-danger remove-option" type="button">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    @endforeach
                                @endif
                            </div>

                            <button type="button" class="btn btn-outline-primary btn-sm mt-2" id="add-option">
                                <i class="fas fa-plus me-1"></i> Tambah Opsi
                            </button>
                            <x-form.input-error name="options" />
                        </div>

                        <div class="d-grid mt-4">
                            <x-button.submit>Simpan</x-button.submit>
                        </div>
                    </x-form>
                </div>
            </div>
        </div>
    </div>

    @push('scripts')
        <script>
            $(document).ready(function() {
                // Initialize Select2 for product select
                $('.select2').select2({
                    placeholder: "Pilih Produk",
                    allowClear: true,
                    width: '100%'
                });

                const productCategoryValue = "{{ App\Enums\FeedbackQuestionCategoryEnum::PRODUCT }}";
                const $categorySelect = $('#category-select');
                const $productContainer = $('#product-select-container');
                const $productSelect = $('#product-select');

                function toggleProductSelect() {
                    if ($categorySelect.val() == productCategoryValue) {
                        $productContainer.slideDown();
                        $productSelect.prop('required', true);
                    } else {
                        $productContainer.slideUp();
                        $productSelect.prop('required', false);
                        $productSelect.val('').trigger('change');
                    }
                }

                // Initial check
                toggleProductSelect();

                // On change
                $categorySelect.on('change', function() {
                    toggleProductSelect();
                });

                $('#add-option').on('click', function() {
                    const newRow = `
                        <div class="input-group mb-2 option-row">
                            <input type="text" name="options[]" class="form-control" placeholder="Opsi jawaban" required>
                            <button class="btn btn-outline-danger remove-option" type="button">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    $('#options-container').append(newRow);
                });

                $(document).on('click', '.remove-option', function() {
                    $(this).closest('.option-row').remove();
                });
            });
        </script>
    @endpush
</x-panel-layout>
