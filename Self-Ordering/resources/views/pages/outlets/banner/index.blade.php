<x-panel-layout title="Manajemen Voucher" bgClass="bg-white">
    @include('includes.helpers.update-published')

    <div class="row">
        <div class="col">
            <div class="px-3 py-3">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="">
                        <h5 class="mb-0">List Banner ({{ $banners->count() }})</h5>
                    </div>
                    <div class="">
                        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target=".banner-modal"
                            data-url="{{ route('outlets.banners.create', [$currentOutlet->slug]) }}"
                            data-title="Tambah Banner">
                            <i class="fas fa-plus me-1"></i> Tambah Banner
                        </button>
                    </div>
                </div>

                <div class="p-3 rounded min-h-screen" style="background-color: var(--bs-gray-100);">
                    @if ($banners->count() > 0)
                        <div class="row mt-3">
                            @foreach ($banners as $banner)
                                <div class="col-sm-6 col-md-4 col-lg-4 col-xxl-4">
                                    <div class="card border-0 shadow-sm w-100 h-100 d-flex flex-column">
                                        <div class="card-body d-flex flex-column">
                                            <div class="d-flex align-items-center justify-content-between mb-3">
                                                <div>
                                                    <x-form.update-published :data="$banner" table="banners"
                                                        field="is_published" :label="['Publish', 'Unpublish']" />
                                                </div>
                                                <div class="btn-group">
                                                    <span type="button"
                                                        class="btn hover-light p-0 avatar-sm rounded border-secondary d-flex align-items-center justify-content-center"
                                                        data-bs-toggle="dropdown" aria-expanded="false">
                                                        <i class="mdi mdi-dots-horizontal"></i>
                                                    </span>
                                                    <div class="dropdown-menu dropdownmenu-primary">
                                                        <a href="{{ $banner->link }}" class="dropdown-item d-flex align-items-center" target="_blank">
                                                            <i class="mdi mdi-arrow-collapse-all me-1"></i>
                                                            Lihat Link
                                                        </a>
                                                        <a class="dropdown-item d-flex align-items-center"
                                                            href="#!" data-bs-toggle="modal"
                                                            data-bs-target=".banner-modal"
                                                            data-url="{{ route('outlets.banners.edit', [$currentOutlet->slug, $banner]) }}"
                                                            data-title="Ubah Banner">
                                                            <i class="bx bxs-edit-alt me-1"></i> Ubah
                                                        </a>
                                                        <a class="dropdown-item d-flex align-items-center action-delete"
                                                            href="#!"
                                                            data-url="{{ route('outlets.banners.destroy', [$currentOutlet->slug, $banner->id]) }}">
                                                            <i class="bx bx-trash-alt me-1"></i> Hapus
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                            <img src="{{ $banner->bannerUrl }}" class="img-fluid w-100 rounded"
                                                alt="">
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @else
                        <div class="row justify-content-center">
                            <div class="col-sm-4 py-5">
                                <div class="text-center">
                                    <x-ilustration.empty class="mb-3" />
                                    @if (request('search'))
                                        <p>Kata kunci <span class="fw-semibold">"{{ request('search') }}"</span>
                                            tidak
                                            ditemukan.
                                        </p>
                                    @else
                                        <p>Belum ada banner, silakan tambahkan banner terlebih dahulu.</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    @endif

                    <div class="mt-3">
                        {{ $banners->withQueryString()->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <x-modal.dynamic class="banner-modal" />
</x-panel-layout>
