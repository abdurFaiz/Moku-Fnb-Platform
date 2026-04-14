<div>
    <h5 class="mb-3">Kategori Produk</h5>

    @if ($isMobile)
        {{-- Mobile View: Select Dropdown --}}
        <div class="mb-3">
            <select wire:change="selectCategory($event.target.value)" class="form-select">
                <option value="">Semua Kategori ({{ $outlet->products_count }})</option>
                @foreach ($productCategories as $productCategory)
                    <option value="{{ $productCategory->id }}"
                        {{ $selectedCategory == $productCategory->id ? 'selected' : '' }}>
                        {{ $productCategory->name }} ({{ $productCategory->products_count }})
                    </option>
                @endforeach
            </select>
        </div>

        {{-- Mobile View: Add/Edit Category Button --}}
        <div class="d-flex gap-2 mb-3">
            <button type="button" class="btn btn-primary flex-grow-1" data-bs-toggle="modal"
                data-bs-target="#categoryModal-{{ $this->getId() }}">
                <i class="fas fa-{{ $id ? 'edit' : 'plus' }} me-1"></i> {{ $id ? 'Ubah Kategori' : 'Tambah Kategori' }}
            </button>
            @if ($id)
                <button type="button" class="btn btn-danger action-delete"
                    data-url="{{ route('outlets.product-categories.destroy', [$outlet->slug, $id]) }}"
                    data-item="Kategori {{ $name }}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            @endif
        </div>

        {{-- Mobile View: Modal --}}
        <div class="modal fade" id="categoryModal-{{ $this->getId() }}" tabindex="-1" aria-hidden="true"
            wire:ignore.self>
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ $id ? 'Ubah' : 'Tambah' }} Kategori</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form wire:submit="{{ $id ? 'update' : 'store' }}">
                            <div class="mb-3">
                                <label class="form-label">Nama Kategori</label>
                                <input type="text" class="form-control" wire:model="name"
                                    placeholder="cth. Arabika" />
                                <x-form.input-error name="name" />
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-{{ $id ? 'save' : 'plus' }} me-1"></i>
                                    {{ $id ? 'Ubah Kategori' : 'Tambah Kategori' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    @else
        {{-- Desktop View --}}
        @if ($productCategories->count() > 0)
            <div class="d-grid gap-2 mb-3">
                <button type="button" wire:click="selectCategory"
                    class="btn btn-menu text-start fw-medium {{ !$selectedCategory ? 'btn-menu-active' : '' }}">
                    <div class="d-flex align-items-center justify-content-between">
                        <span class="d-flex align-items-center gap-2">
                            <span
                                class="btn hover-light p-0 avatar-sm rounded-circle d-flex align-items-center justify-content-center">
                                <i class="bx bxs-coffee-alt text-secondary"></i>
                            </span>
                            Semua Kategori
                        </span>
                        <span
                            class="badge fw-normal  {{ !$selectedCategory ? 'badge-soft-primary' : 'badge-soft-dark' }}">{{ $outlet->products_count }}</span>
                    </div>
                </button>
                @foreach ($productCategories as $productCategory)
                    <button type="button" wire:click="selectCategory({{ $productCategory->id }})"
                        class="btn btn-menu text-start fw-medium {{ $selectedCategory == $productCategory->id ? 'btn-menu-active' : '' }}">
                        <div class="d-flex align-items-center justify-content-between">
                            <div class="d-flex align-items-center gap-2">
                                <div class="btn-group">
                                    <span type="button" wire:click.stop
                                        class="btn hover-light p-0 avatar-sm rounded-circle d-flex align-items-center justify-content-center"
                                        data-bs-toggle="dropdown" aria-expanded="false">
                                        <i class="mdi mdi-dots-vertical"></i>
                                    </span>
                                    <div class="dropdown-menu dropdownmenu-primary">
                                        <a class="dropdown-item d-flex align-items-center" href="#!"
                                            wire:click="edit({{ $productCategory->id }}, '{{ $productCategory->name }}')">
                                            <i class="bx bxs-edit-alt me-1"></i> Ubah
                                        </a>
                                        <a class="dropdown-item d-flex align-items-center action-delete" href="#!"
                                            data-url="{{ route('outlets.product-categories.destroy', [$outlet->slug, $productCategory->id]) }}"
                                            data-item="Kategori {{ $productCategory->name }}">
                                            <i class="bx bx-trash-alt me-1"></i> Hapus
                                        </a>
                                    </div>
                                </div>
                                <span>{{ $productCategory->name }}</span>
                            </div>
                            <span
                                class="badge fw-normal {{ $selectedCategory == $productCategory->id ? 'badge-soft-primary' : 'badge-soft-dark' }}">
                                {{ $productCategory->products_count }}
                            </span>
                        </div>
                    </button>
                @endforeach
            </div>
        @else
            <div class="mb-3 text-center border-dashed border-2 border-light p-3">
                belum ada kategori
            </div>
        @endif

        <form wire:submit="{{ $id ? 'update' : 'store' }}">
            <div class="mb-2">
                <p class="mb-2 fw-medium">Form {{ $id ? 'Ubah' : 'Tambah' }} Kategori:</p>
                <input type="text" class="form-control" wire:model="name" placeholder="cth. Arabika" />
                <x-form.input-error name="name" />
            </div>
            <div class="d-grid">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-{{ $id ? 'save' : 'plus' }} me-1"></i>
                    {{ $id ? 'Ubah Kategori' : 'Tambah Kategori' }}
                </button>
            </div>
        </form>
    @endif
</div>
