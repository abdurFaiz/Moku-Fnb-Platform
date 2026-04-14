<x-panel-layout title="Manajemen Voucher" bgClass="bg-white">
    @include('includes.helpers.update-published')

    <div class="row">
        <div class="col">
            <div class="px-3 py-3">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="">
                        <h5 class="mb-0">List Voucher ({{ $vouchers->count() }})</h5>
                    </div>
                    <div class="">
                        <x-button.create :url="route('outlets.vouchers.create', $currentOutlet->slug)" text="Tambah Voucher" />
                    </div>
                </div>

                <div class="p-3 rounded min-h-screen" style="background-color: var(--bs-gray-100);">
                    <x-form method="GET">
                        <div class="row">
                            <div class="col-md-4 mb-3">
                                <div class="input-group">
                                    <div class="input-group-text px-3"><i class="bx bx-search-alt"></i></div>
                                    <input type="text" class="form-control" name="search"
                                        value="{{ request('search') }}" placeholder="Cari Voucher...">
                                </div>
                            </div>
                            <div class="col-md-3 mb-3">
                                <select name="type" class="form-select" onchange="this.form.submit()">
                                    <option value="">Semua Tipe</option>
                                    @foreach ($voucher_types as $key => $value)
                                        <option value="{{ $key }}"
                                            {{ request('type') == $key ? 'selected' : '' }}>
                                            {{ $value }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-3 mb-3">
                                <select name="claim_type" class="form-select" onchange="this.form.submit()">
                                    <option value="">Semua Klaim</option>
                                    @foreach ($voucher_claim_types as $key => $value)
                                        <option value="{{ $key }}"
                                            {{ request('claim_type') == $key ? 'selected' : '' }}>
                                            {{ $value }}
                                        </option>
                                    @endforeach
                                </select>
                            </div>
                            <div class="col-md-2">
                                <x-button.submit class="btn-dark px-4 w-100">
                                    <i class="bx bx-search-alt"></i>
                                    Cari
                                </x-button.submit>
                            </div>
                        </div>
                    </x-form>

                    @if ($vouchers->count() > 0)
                        <div class="row mt-3">
                            @foreach ($vouchers as $voucher)
                                <div class="col-md-6 col-xl-4 mb-4">
                                    <div class="voucher-ticket shadow-sm h-100">
                                        <!-- Top Section -->
                                        <div
                                            class="voucher-top p-3 d-flex flex-column justify-content-between position-relative">
                                            <div
                                                class="d-flex flex-column justify-content-between align-items-start pe-5">
                                                <h5 class="fw-bold mb-1 text-dark mt-4 mt-xl-0"
                                                    style="font-size: 1.1rem; line-height: 1.4;">{{ $voucher->name }}
                                                </h5>
                                                <div class="d-flex gap-1">
                                                    <x-badge.voucher-type :status="$voucher->type" class="fs-6">
                                                        {{ $voucher->type == 1 ? 'Public' : 'Private' }}
                                                    </x-badge.voucher-type>
                                                    <x-badge.voucher-claim :status="$voucher->claim_type" class="fs-6">
                                                        {{ $voucher->claim_type == 1 ? 'Platform' : 'Admin' }}
                                                    </x-badge.voucher-claim>
                                                </div>
                                            </div>

                                            <!-- Badge Top Right -->
                                            <div class="voucher-badge position-absolute top-0 end-0 mt-0 me-0 px-3 py-1 text-white"
                                                style="background: #FFD8C2; border-bottom-left-radius: 12px; border-top-right-radius: 12px; color: #E65100 !important; font-size: 0.8rem; font-weight: 600;">
                                                Limit Pakai •
                                                {{ $voucher->max_usage ? $voucher->max_usage . 'x' : 'Unlimited' }}
                                            </div>
                                        </div>

                                        <!-- Divider -->
                                        <div class="voucher-divider">
                                            <div class="voucher-divider-line"></div>
                                        </div>

                                        <!-- Bottom Section -->
                                        <div class="voucher-bottom p-3">
                                            <div
                                                class="d-flex flex-column flex-xxl-row justify-content-between align-items-xxl-end gap-3">
                                                <div class="d-flex flex-wrap gap-3 row-gap-2">
                                                    <div>
                                                        <div class="text-muted small mb-1">Berlaku Hingga</div>
                                                        <div class="fw-bold text-dark">
                                                            {{ $voucher->end_date ? \Carbon\Carbon::parse($voucher->end_date)->format('d M Y') : 'Selamanya' }}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div class="text-muted small mb-1">Min.Poin</div>
                                                        <div class="fw-bold text-dark d-flex align-items-center gap-1">
                                                            <i class="mdi mdi-star-circle text-warning"></i>
                                                            {{ $voucher->reward->point ?? '-' }}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div class="text-muted small mb-1">Max.Diskon</div>
                                                        <div class="fw-bold text-dark">
                                                            @if ($voucher->discount_percent)
                                                                {{ $voucher->discount_percent }}%
                                                            @elseif($voucher->discount_fixed)
                                                                {{ rupiahFormat($voucher->discount_fixed) }}
                                                            @else
                                                                -
                                                            @endif
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="w-100 w-xxl-auto">
                                                    <!-- Action Button / Dropdown -->
                                                    <div class="d-flex gap-2 w-100">
                                                        <a href="{{ route('outlets.vouchers.edit', [$currentOutlet->slug, $voucher->id]) }}"
                                                            class="btn btn-light rounded-pill px-3 fw-bold text-primary flex-fill flex-xxl-grow-0 text-center"
                                                            style="background-color: #FFF3E0; color: #E65100 !important; border: none;">
                                                            <i class="mdi mdi-pencil-box-multiple me-1"></i> Edit
                                                        </a>
                                                        <a href="#!"
                                                            class="btn btn-light rounded-pill px-3 fw-bold text-danger action-delete flex-fill flex-xxl-grow-0 text-center"
                                                            data-url="{{ route('outlets.vouchers.destroy', [$currentOutlet->slug, $voucher->id]) }}"
                                                            data-item="Voucher {{ $voucher->name }}"
                                                            style="background-color: #FFEBEE; color: #D32F2F !important; border: none;">
                                                            <i class="fas fa-trash-alt me-1"></i> Hapus
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach

                            <style>
                                .voucher-ticket {
                                    background: white;
                                    border-radius: 16px;
                                    position: relative;
                                    border: 1px solid #FFD8C2;
                                    /* Orange border color */
                                }

                                /* Move bites to the divider to ensure alignment */
                                .voucher-divider::before,
                                .voucher-divider::after {
                                    content: "";
                                    position: absolute;
                                    top: 50%;
                                    width: 24px;
                                    height: 24px;
                                    background-color: var(--bs-gray-100);
                                    /* Match parent bg */
                                    border-radius: 50%;
                                    transform: translateY(-50%);
                                    border: 1px solid #FFD8C2;
                                    z-index: 2;
                                    box-sizing: border-box;
                                }

                                .voucher-divider::before {
                                    left: -32px;
                                    /* 20px margin + 12px half-width */
                                    clip-path: inset(0 0 0 45%);
                                    /* Hide left half (outer part) */
                                }

                                .voucher-divider::after {
                                    right: -32px;
                                    /* 20px margin + 12px half-width */
                                    clip-path: inset(0 45% 0 0);
                                    /* Hide right half (outer part) */
                                }

                                .voucher-divider {
                                    position: relative;
                                    height: 1px;
                                    margin: 0 20px;
                                    z-index: 1;
                                }

                                .voucher-divider-line {
                                    border-top: 2px dashed #E0E0E0;
                                    width: 100%;
                                    position: absolute;
                                    top: 50%;
                                }

                                .voucher-top {
                                    min-height: 100px;
                                    /* Adjust as needed */
                                }

                                .voucher-bottom {
                                    /* height: 80px; */
                                }
                            </style>
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
                                        <p>Belum ada voucher, silakan tambahkan voucher terlebih dahulu.</p>
                                    @endif
                                </div>
                            </div>
                        </div>
                    @endif

                    <div class="mt-3">
                        {{ $vouchers->withQueryString()->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-panel-layout>
