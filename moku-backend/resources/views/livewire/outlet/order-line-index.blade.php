<div>
    <div class="d-flex align-items-center gap-3 mb-3">
        @foreach ($categories as $category)
            <button wire:click="setStatus({{ $category['id'] }})"
                class="btn {{ $status == $category['id'] ? 'btn-primary' : 'btn-outline-primary' }}">
                {{ $category['name'] }}
            </button>
        @endforeach
    </div>
    <div class="row">
        @forelse ($orderLines as $orderLine)
            <div class="col-sm-6 col-md-4 col-lg-3">
                <div class="card">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h5 class="d-flex align-items-center gap-1 mb-0">
                                #{{ $orderLine->order_number }}
                                @if ($orderLine->status == 3)
                                    <span class="badge text-bg-info p-1">Proses</span>
                                @elseif ($orderLine->status == 4)
                                    <span class="badge bg-success text-white p-1">Selesai</span>
                                @endif
                            </h5>
                            <p class="text-muted mb-0">
                                <i class='bx bx-time-five me-1'></i>
                                {{ $orderLine->created_at_time_formatted }}
                            </p>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h5 class="card-title mb-0">{{ $orderLine->user->name }}</h5>
                                <p class="text-muted mb-0">Kode: {{ $orderLine->code }}</p>
                            </div>
                            <div>
                                <p class="text-muted mb-0">
                                    @if ($orderLine->table_number_id)
                                        <i class='bx bx-dish me-1'></i>
                                        Meja: {{ $orderLine->tableNumber->number }}
                                    @else
                                        <i class='bx bx-dish me-1'></i>
                                        Pick Up
                                    @endif
                                </p>
                            </div>
                        </div>
                        <hr class="border-dashed">
                        <div class="mb-3">
                            <div class="d-flex justify-content-between align-items-center">
                                <p class="fw-semibold mb-1">
                                    {{ $orderLine->order_products_count }} item
                                </p>
                                <p class="text-primary fw-semibold mb-1">
                                    {{ rupiahFormat($orderLine->total) }}
                                </p>
                            </div>
                            @foreach ($orderLine->orderProducts as $orderProduct)
                                <div class="d-flex justify-content-between align-items-center">
                                    <p class="text-muted mb-1">
                                        {{ $orderProduct->quantity }} x {{ $orderProduct->product->name }}
                                    </p>
                                    <p class="text-muted mb-1">
                                        {{ rupiahFormat($orderProduct->total) }}
                                    </p>
                                </div>
                            @endforeach
                            @if (@$orderLine->discount)
                                <div class="d-flex justify-content-between align-items-center">
                                    <p class="text-muted mb-1">
                                        Diskon Voucher
                                    </p>
                                    <p class="text-muted mb-1">
                                        - {{ rupiahFormat($orderLine->discount) }}
                                    </p>
                                </div>
                            @endif
                            @if (@$orderLine->tax)
                                <div class="d-flex justify-content-between align-items-center">
                                    <p class="text-muted mb-1">
                                        Pajak {{ $outlet->fee_tax }}%
                                    </p>
                                    <p class="text-muted mb-1">
                                        {{ rupiahFormat($orderLine->tax) }}
                                    </p>
                                </div>
                            @endif
                            @if (@$orderLine->fee_service && @$orderLine->service_fee_config == 2)
                                <div class="d-flex justify-content-between align-items-center">
                                    <p class="text-muted mb-1">Biaya Layanan</p>
                                    <p class="text-muted mb-1">{{ rupiahFormat($orderLine->total_fee_service) }}</p>
                                </div>
                            @endif
                            <div class="text-center">
                                <button type="button" class="btn btn-link p-0 text-decoration-none"
                                    wire:click="showOrderDetail({{ $orderLine->id }})" wire:loading.attr="disabled"
                                    wire:target="showOrderDetail({{ $orderLine->id }})">
                                    Lihat Detail
                                </button>
                            </div>
                        </div>
                        @if ($orderLine->status == 3)
                            <div class="d-grid">
                                <button wire:key="complete-order-button-{{ $orderLine->id }}"
                                    wire:click="completeOrder({{ $orderLine->id }})" wire:loading.attr="disabled"
                                    wire:target="completeOrder({{ $orderLine->id }})" class="btn btn-primary">
                                    <span wire:loading.remove wire:target="completeOrder({{ $orderLine->id }})">
                                        Konfirmasi Selesai
                                    </span>
                                    <span wire:loading wire:target="completeOrder({{ $orderLine->id }})"
                                        wire:loading.class.remove="d-none"
                                        class="d-none d-inline-flex align-items-center justify-content-center gap-2">
                                        <span class="spinner-border spinner-border-sm" role="status"></span>
                                        Memproses...
                                    </span>
                                </button>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        @empty
            <div class="col-12 py-5 align-self-center justify-self-center">
                <div class="text-center">
                    <x-ilustration.empty class="mb-3" />
                    @if (request('search'))
                        <p>Kata kunci <span class="fw-semibold">"{{ $status }}"</span>
                            tidak
                            ditemukan.
                        </p>
                    @else
                        <p>Belum ada pesanan yang masuk.</p>
                    @endif
                </div>
            </div>
        @endforelse
    </div>


    <x-modal id="orderDetailModal" title="Detail Pesanan" closeButton="false">
        @php
            $selectedOrderStatusValue = null;
            $selectedOrderIsNew = false;

            if ($selectedOrder) {
                $selectedOrderStatusValue =
                    $selectedOrder->status instanceof \BenSampo\Enum\Enum
                        ? $selectedOrder->status->value
                        : (int) $selectedOrder->status;

                $selectedOrderIsNew = $selectedOrderStatusValue === \App\Enums\OrderStatusEnum::SUCCESS;
            }
        @endphp
        <div class="row g-3 mb-4">
            <div class="col-md-6">
                <div class="small text-muted mb-1">Pelanggan</div>
                <div class="fw-semibold">{{ @$selectedOrder->user->name }}</div>
            </div>
            <div class="col-md-6">
                <div class="small text-muted mb-1">Status</div>
                <div class="fw-semibold">{{ @$selectedOrder->status_label }}</div>
            </div>
            <div class="col-md-6">
                <div class="small text-muted mb-1">Total Item</div>
                <div class="fw-semibold">{{ @$selectedOrder->order_products_count }}</div>
            </div>
            <div class="col-md-6">
                <div class="small text-muted mb-1">Tanggal Pesanan</div>
                <div class="fw-semibold">{{ @$selectedOrder->created_at_date_time_formatted }}</div>
            </div>
            <div class="col-md-6">
                <div class="small text-muted mb-1">Meja</div>
                <div class="fw-semibold">
                    {{ @$selectedOrder->table_number_id ? $selectedOrder->tableNumber->number : 'Pick Up' }}</div>
            </div>
        </div>

        <div class="card border-0 shadow-sm">
            <div class="card-header border-0 bg-light">
                <h6 class="mb-0 fw-semibold">Daftar Produk</h6>
            </div>
            <div class="card-body p-0">
                <div class="list-group list-group-flush">
                    @if (@$selectedOrder)
                        @foreach ($selectedOrder->orderProducts as $orderProduct)
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p class="mb-1">{{ $orderProduct->quantity }} x
                                            {{ $orderProduct->product->name }}</p>
                                    </div>
                                    <p class="mb-0 fw-semibold text-primary">{{ rupiahFormat($orderProduct->total) }}
                                    </p>
                                </div>

                                @if ($orderProduct->orderProductVariants->isNotEmpty())
                                    <div class="mt-2">
                                        <div>
                                            <p class="mb-1">Varian :</p>
                                        </div>
                                        <ul class="mb-0 small">
                                            @foreach ($orderProduct->orderProductVariants as $variant)
                                                <li>
                                                    {{ $variant->productAttributeValue->productAttribute->name ?? 'Varian' }}:
                                                    {{ $variant->productAttributeValue->name }}
                                                </li>
                                            @endforeach
                                        </ul>
                                    </div>
                                @endif

                                @if ($orderProduct->note)
                                    <p class="mt-2 mb-0 small fst-italic text-muted">Catatan: {{ $orderProduct->note }}
                                    </p>
                                @endif
                            </div>
                        @endforeach
                        @if (@$selectedOrder->discount)
                            <div class="d-flex justify-content-between align-items-center">
                                <p class="text-muted mb-1">
                                    Diskon Voucher
                                </p>
                                <p class="text-muted mb-1">
                                    - {{ rupiahFormat($selectedOrder->discount) }}
                                </p>
                            </div>
                        @endif
                        @if (@$selectedOrder->tax)
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p class="mb-1">Pajak</p>
                                    </div>
                                    <p class="mb-0 fw-semibold text-primary">{{ rupiahFormat($selectedOrder->tax) }}
                                    </p>
                                </div>
                            </div>
                        @endif
                        @if (@$selectedOrder->fee_service && @$selectedOrder->service_fee_config == 2)
                            <div class="list-group-item">
                                <div class="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p class="mb-1">Biaya Layanan</p>
                                    </div>
                                    <p class="mb-0 fw-semibold text-primary">
                                        {{ rupiahFormat($selectedOrder->total_fee_service) }}
                                    </p>
                                </div>
                            </div>
                        @endif
                        <div class="list-group-item bg-light">
                            <div class="d-flex justify-content-between align-items-center">
                                <p class="mb-0 fw-semibold">Total Order</p>
                                <p class="mb-0 fw-semibold text-primary">
                                    {{ rupiahFormat($selectedOrder->total ?? 0) }}
                                </p>
                            </div>
                        </div>
                    @endif
                </div>
            </div>
        </div>
        <x-slot name="footer">
            <div class="d-flex justify-content-end gap-2 w-100">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
                @if ($selectedOrder && $selectedOrderIsNew)
                    <button wire:key="complete-order-modal-button-{{ $selectedOrder->id }}"
                        wire:click="completeOrder({{ $selectedOrder->id }})" wire:loading.attr="disabled"
                        wire:target="completeOrder({{ $selectedOrder->id }})" class="btn btn-primary">
                        <span wire:loading.remove wire:target="completeOrder({{ $selectedOrder->id }})">
                            Konfirmasi Selesai
                        </span>
                        <span wire:loading wire:target="completeOrder({{ $selectedOrder->id }})"
                            wire:loading.class.remove="d-none"
                            class="d-none d-inline-flex align-items-center justify-content-center gap-2">
                            <span class="spinner-border spinner-border-sm" role="status"></span>
                            Memproses...
                        </span>
                    </button>
                @endif
            </div>
        </x-slot>
    </x-modal>
</div>

@push('scripts')
    <script>
        document.addEventListener('livewire:init', () => {
            const modalElement = document.getElementById('orderDetailModal');

            if (!modalElement || typeof bootstrap === 'undefined') {
                return;
            }

            const getModalInstance = () => bootstrap.Modal.getOrCreateInstance(modalElement);

            Livewire.on('show-order-detail-modal', () => {
                getModalInstance().show();
            });

            Livewire.on('hide-order-detail-modal', () => {
                getModalInstance().hide();
            });

            modalElement.addEventListener('hidden.bs.modal', () => {
                Livewire.dispatch('orderDetailModalClosed');
            });
        });
    </script>
@endpush
