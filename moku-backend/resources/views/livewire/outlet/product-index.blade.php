<div>
    @include('includes.helpers.update-published')

    <div class="mb-3">
        <div class="row justify-content-between align-center gap-3">
            <div class="col-auto">
                <a href="{{ route('outlets.products.create', ['outlet' => $outlet->slug, 'category' => @$category_id]) }}"
                    class="btn btn-primary">
                    <i class="fas fa-plus me-1"></i>
                    Tambah Produk
                    @if (@$category_model)
                        - {{ $category_model?->name }}
                    @endif
                </a>
            </div>
            <form class="mb-3 col-md-5 col-lg-4">
                <div>
                    <div class="custom-search">
                        <i class='bx bx-search'></i>
                        <input type="search" name="search" id="search" wire:model.live.debounce.150ms="search"
                            class="form-control" placeholder="Cari Produk...">
                    </div>
                </div>
            </form>

        </div>
    </div>
    <div class="p-3 rounded min-h-screen" style="background-color: var(--bs-gray-100);">
        <h5 class="mb-3">List Produk ({{ $totalProducts }})</h5>

        <div class="row g-2 g-md-3">
            @forelse ($products as $product)
                <div class="col-6 col-md-4 col-lg-4 col-xxl-4">
                    <div class="card border-0 shadow-sm w-100 h-100 d-flex flex-column">
                        <div class="card-body d-flex flex-column p-2 p-md-3">
                            <div class="d-flex align-items-center justify-content-between mb-2 mb-md-3">
                                <div class="form-check d-flex align-items-center gap-1">
                                    <input id="recommend-{{ $product->id }}"
                                        class="form-check-input border-secondary form-check-input-product mt-0"
                                        type="checkbox" {{ $product->is_recommended ? 'checked' : '' }}
                                        wire:click="toggleRecommendation({{ $product->id }})">
                                    <label for="recommend-{{ $product->id }}"
                                        class="text-muted mb-0 d-none d-md-inline">Rekomendasi</label>
                                </div>
                                <div class="btn-group">
                                    <span type="button"
                                        class="btn hover-light p-0 avatar-sm rounded border-secondary d-flex align-items-center justify-content-center"
                                        data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="mdi mdi-dots-horizontal"></i>
                                    </span>
                                    <div class="dropdown-menu dropdownmenu-primary">
                                        <a class="dropdown-item d-flex align-items-center"
                                            href="{{ route('outlets.products.edit', [$outlet->slug, $product->id]) }}">
                                            <i class="bx bxs-edit-alt me-1"></i> Ubah
                                        </a>
                                        <a class="dropdown-item d-flex align-items-center action-delete" href="#!"
                                            data-url="{{ route('outlets.products.destroy', [$outlet->slug, $product->id]) }}">
                                            <i class="bx bx-trash-alt me-1"></i> Hapus
                                        </a>
                                        <a href="{{ route('outlets.products.settings.attributes.index', [$outlet->slug, $product->id]) }}"
                                            class="dropdown-item d-flex align-items-center">
                                            <i class='bx bx-bookmark-alt me-1'></i> Atribut
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <img src="{{ $product->imageUrl }}" class="img-fluid w-100 mb-2 mb-md-4"
                                style="border-radius: 0.5rem; object-fit: cover; aspect-ratio: 16 / 14; object-position: center;"
                                alt="">
                            <div>
                                <p class="text-xs text-md-sm text-muted mb-0">{{ $product->productCategory->name }}</p>
                                <p class="fw-medium fs-6 fs-md-5">{{ $product->name }}</p>
                            </div>
                            <div class="mt-auto">
                                <div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-1">
                                    <x-form.update-published :data="$product" table="products" field="is_published"
                                        :label="['Publish', 'Unpublish']" />
                                    <x-form.update-published :data="$product" table="products" field="is_available"
                                        id="update-available-" :label="['Tersedia', 'Habis']" />
                                </div>
                                <div>
                                    <p class="fw-medium mb-0 fs-6 fs-md-5">{{ rupiahFormat($product->price) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @empty
                <div class="row justify-content-center w-100">
                    <div class="col-sm-4 py-5">
                        <div class="text-center">
                            <x-ilustration.empty class="mb-3" />
                            @if ($search)
                                <p>Kata kunci <span class="fw-semibold">"{{ $search }}"</span>
                                    tidak
                                    ditemukan.
                                </p>
                            @else
                                <p>Belum ada produk, silakan tambah terlebih dahulu.</p>
                            @endif
                        </div>
                    </div>
                </div>
            @endforelse
        </div>

        {{-- Pagination Links --}}
        <div class="mt-4">
            {{ $products->links() }}
        </div>

        {{-- @push('scripts')
            <script>
                function toggleRecommend(el, id) {
                    let status = el.checked ? 1 : 0;
                    let url = el.dataset.url;
                    let field = el.dataset.field;
                    let table = el.dataset.table;
                    let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

                    fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken
                            },
                            body: JSON.stringify({
                                field: field,
                                id: id,
                                table: table,
                                status: status
                            })
                        })
                        .then(res => res.json())
                        .then(res => {
                            Swal.fire({
                                title: 'Berhasil!',
                                text: 'Status rekomendasi berhasil diubah',
                                icon: 'success',
                                confirmButtonText: 'OK'
                            });
                        })
                        .catch(err => {
                            console.error(err);
                            Swal.fire({
                                title: 'Gagal!',
                                text: 'Status rekomendasi gagal diubah',
                                icon: 'error',
                                confirmButtonText: 'OK'
                            });
                        });
                }
            </script>
        @endpush --}}
    </div>
</div>
