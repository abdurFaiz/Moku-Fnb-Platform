<x-panel-layout title="Manajemen Produk">
    @include('includes.helpers.format-rupiah')
    @include('includes.libs.select2')

    <div class="p-4">
        @include('pages.outlets.products._header')

        <x-form action="{{ $action }}" method="POST" enctype="multipart/form-data">
            <div class="card">
                <div class="card-body">
                    @if (@$product)
                        @method('PUT')
                    @endif
                    @csrf

                    <div class="d-grid">

                        <div class="row">
                            <div class="col">
                                <div class="mb-3">
                                    <x-form.input-label :required="true">Nama Produk</x-form.input-label>
                                    <x-form.input type="text" name="name" placeholder="masukkan nama produk"
                                        required value="{{ old('name', @$product->name) }}" />
                                    <x-form.input-error name="name" />
                                </div>
                            </div>
                            <div class="col">
                                <div class="mb-3">
                                    <x-form.input-label :required="true">Harga Produk</x-form.input-label>
                                    <x-form.input-group-currency>
                                        <x-form.input type="text" name="price_display" id="price_display"
                                            placeholder="masukkan harga produk" required
                                            value="{{ old('price_display', @$product->price) }}" data-format="rupiah" />
                                    </x-form.input-group-currency>
                                    <input type="hidden" id="price" name="price"
                                        value="{{ old('price', @$product->price) }}" required>
                                    <x-form.input-error name="price" />
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="mb-3 col-md-6">
                                <x-form.input-label :required="true">Kategori</x-form.input-label>
                                <x-form.select name="category_id" class="select2" required>
                                    <option value="">Pilih Kategori</option>
                                    @foreach ($categories as $category)
                                        <option value="{{ $category->id }}"
                                            {{ old('category_id', @$product->product_category_id ?? @$selectedCategory) == $category->id ? 'selected' : '' }}>
                                            {{ $category->name }}</option>
                                    @endforeach
                                </x-form.select>
                                <x-form.input-error name="category_id" />
                            </div>
                            <div class="mb-3 col-md-6">
                                <x-form.input-label>
                                    Rekomendasi Kategori
                                    <span class="ms-1" data-bs-toggle="tooltip" data-bs-placement="top"
                                        title="Pilih kategori produk yang akan ditampilkan ketika customer membeli produk ini">
                                        <i class="mdi mdi-help-circle-outline"></i>
                                    </span>
                                </x-form.input-label>
                                <x-form.select name="product_recommendation_categories[]" class="select2" multiple>
                                    @foreach ($categories as $category)
                                        <option value="{{ $category->id }}"
                                            {{ in_array($category->id, old('product_recommendation_categories', @$product && @$product->recommendationCategories ? $product->recommendationCategories->pluck('id')->toArray() : [])) ? 'selected' : '' }}>
                                            {{ $category->name }}
                                        </option>
                                    @endforeach
                                </x-form.select>
                                <x-form.input-error name="product_recommendation_categories" />
                            </div>
                        </div>
                        <div class="mb-3">
                            <x-form.input-label :required="true">Deskripsi</x-form.input-label>
                            <x-form.textarea name="description" placeholder="masukkan deskripsi produk"
                                required>{{ old('description', @$product->description) }}</x-form.textarea>
                            <x-form.input-error name="description" />
                        </div>
                        <div class="mb-3">
                            <x-form.input-label>
                                Gambar
                            </x-form.input-label>
                            <p class="text-muted">Unggah gambar dengan format JPG, PNG, atau JPEG. Maksimal ukuran
                                gambar 2MB.</p>
                            <input type="file" class="dropify" name="image"
                                data-default-file="{{ old('image', @$product->imageUrl) }}" />
                            <x-form.input-error name="image" />
                        </div>
                        <div class="mb-3">
                            <x-form.checkbox name="is_available" id="is_available" :checked="old('is_available', @$product->is_available)">
                                Apakah produk tersedia?
                            </x-form.checkbox>
                        </div>
                        <div class="mb-3">
                            <x-form.checkbox name="is_published" id="is_published" :checked="old('is_published', @$product->is_published)">
                                Apakah produk ini dipublikasikan?
                            </x-form.checkbox>
                        </div>
                        <div class="">
                            <x-form.checkbox name="is_recommended" id="is_recommended" :checked="old('is_recommended', @$product->is_recommended)">
                                Apakah produk direkomendasikan?
                            </x-form.checkbox>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card">
                <div class="card-body">
                    <x-form.input-label>Attribut Produk</x-form.input-label>
                    <div class="table-responsive">
                        <table class="table table-striped align-middle" id="product-attributes-table">
                            <thead>
                                <tr>
                                    <th style="width: 45%">Attribut</th>
                                    <th style="width: 45%">Nilai</th>
                                    <th style="width: 10%" class="text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                @if (@$variants)
                                    @foreach ($variants as $index => $variant)
                                        <tr class="attribute-row" data-row-index="{{ $index }}">
                                            <td>
                                                <x-form.select name="product_attributes[]"
                                                    class="product-attribute-select"
                                                    onchange="showAttributeValues(this, '#attribute-badges-{{ $index }}')"
                                                    required>
                                                    <option value="">Pilih Attribut</option>
                                                    @foreach ($productAttributes as $attribute)
                                                        <option value="{{ $attribute->id }}"
                                                            data-values='@json($attribute->values->map(fn($v) => ['id' => $v->id, 'name' => $v->name])->values())'
                                                            {{ $variant->product_attribute_id === $attribute->id ? 'selected' : '' }}>
                                                            {{ $attribute->name }}
                                                        </option>
                                                    @endforeach
                                                </x-form.select>
                                            </td>
                                            <td>
                                                <div class="attribute-value-badges"
                                                    id="attribute-badges-{{ $index }}">
                                                    @foreach ($variant->productAttribute->values as $value)
                                                        <span
                                                            class="badge text-bg-secondary me-1 mb-1">{{ $value->name }}</span>
                                                    @endforeach
                                                </div>
                                            </td>
                                            <td class="text-center">
                                                <a href="{{ route('outlets.product-attributes.edit', [$currentOutlet->slug, $variant->product_attribute_id]) }}"
                                                    class="btn btn-sm btn-success">
                                                    <i class="mdi mdi-square-edit-outline"></i>
                                                </a>
                                                <x-button.delete :url="route('outlets.products.settings.attributes.destroy', [
                                                    $currentOutlet->slug,
                                                    $product->id,
                                                    $variant->id,
                                                ])" :hasText="false" />
                                            </td>
                                        </tr>
                                    @endforeach
                                @else
                                    {{-- <tr class="attribute-row" data-row-index="0">
                                        <td>
                                            <x-form.select name="product_attributes[]" class="product-attribute-select"
                                                onchange="showAttributeValues(this, '#attribute-badges-0')">
                                                <option value="">Pilih Attribut</option>
                                                @foreach ($productAttributes as $attribute)
                                                    <option value="{{ $attribute->id }}"
                                                        data-values='@json($attribute->values->map(fn($v) => ['id' => $v->id, 'name' => $v->name])->values())'>
                                                        {{ $attribute->name }}
                                                    </option>
                                                @endforeach
                                            </x-form.select>
                                        </td>
                                        <td>
                                            <div class="attribute-value-badges" id="attribute-badges-0"></div>
                                        </td>
                                        <td class="text-center">
                                            <button type="button" class="btn btn-danger btn-sm remove-attribute-row">
                                                <i class="mdi mdi-trash-can-outline"></i>
                                            </button>
                                        </td>
                                    </tr> --}}
                                @endif
                                <tr id="add-attribute-row">
                                    <td colspan="3" class="text-center">
                                        <button type="button" class="btn btn-secondary btn-sm" id="add-attribute">
                                            <i class="fas fa-plus me-1"></i> Tambah baris
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="mt-3 d-grid">
                <x-button.submit>
                    Simpan
                </x-button.submit>
            </div>
        </x-form>
    </div>

    @push('scripts')
        <script>
            $(document).ready(function() {
                $('.select2').select2({
                    placeholder: "Pilih Kategori Rekomendasi",
                    allowClear: true,
                    width: '100%'
                });
            });

            function showAttributeValues(selectElement, idElement) {
                const selectedOption = selectElement.options[selectElement.selectedIndex];
                const attributeId = selectedOption.value;
                const attributeValues = JSON.parse(selectedOption.dataset.values || '[]');

                $(idElement).html('');
                attributeValues.forEach(value => {
                    $(idElement).append(`<span class="badge text-bg-secondary me-1 mb-1">${value.name}</span>`);
                });
            }

            // Add row directly on button click
            $('#add-attribute').on('click', function() {
                const table = $('#product-attributes-table');
                const lastRowIndex = table.find('.attribute-row').length - 1;
                const newRowIndex = lastRowIndex + 1;

                const newRow = `
                    <tr class="attribute-row" data-row-index="${newRowIndex}">
                        <td>
                            <x-form.select name="product_attributes[]" class="product-attribute-select" onchange="showAttributeValues(this, '#attribute-badges-${newRowIndex}')">
                                <option value="">Pilih Attribut</option>
                                @foreach ($productAttributes as $attribute)
                                    <option value="{{ $attribute->id }}" data-values='@json($attribute->values->map(fn($v) => ['id' => $v->id, 'name' => $v->name])->values())'>
                                        {{ $attribute->name }}
                                    </option>
                                @endforeach
                            </x-form.select>
                        </td>
                        <td>
                            <div class="attribute-value-badges" id="attribute-badges-${newRowIndex}"></div>
                        </td>
                        <td class="text-center">
                            <button type="button" class="btn btn-danger btn-sm remove-attribute-row">
                                <i class="mdi mdi-trash-can-outline"></i>
                            </button>
                        </td>
                    </tr>
                `;

                $('#add-attribute-row').before(newRow);
            });

            // Remove row directly on button click
            $(document).on('click', '.remove-attribute-row', function() {
                $(this).closest('.attribute-row').remove();
            });
        </script>
    @endpush
</x-panel-layout>
