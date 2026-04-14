<div class="card mb-3">
    <div class="card-body">
        <div class="row">
            <div class="col-sm order-2 order-sm-1">
                <div class="d-flex align-items-center mt-3 mt-sm-0">
                    <div class="flex-shrink-0">
                        <div class="me-3">
                            @if (@$product)
                                <img src="{{ $product->imageUrl }}" alt=""
                                    class="img-fluid avatar-xl rounded d-block">
                            @else
                                <div
                                    class="avatar-xl bg-light rounded d-flex align-items-center justify-content-center">
                                    <i class="bx bxs-coffee-alt text-secondary display-5"></i>
                                </div>
                            @endif
                        </div>
                    </div>
                    <div class="flex-grow-1">
                        <div>
                            <h5 class="font-size-16 mb-0">{{ $title }}</h5>
                        </div>
                    </div>
                    <div class="ms-auto">
                        <x-button.back :url="route('outlets.products.index', $currentOutlet->slug)" />
                    </div>
                </div>
            </div>
        </div>

        {{-- @if (@$product)
            <ul class="nav nav-tabs-custom card-header-tabs border-top mt-4" id="pills-tab" role="tablist">
                <li class="nav-item" role="presentation">
                    <a class="nav-link px-3 {{ active('outlets.products.edit') }}"
                        href="{{ route('outlets.products.edit', [$currentOutlet->slug, $product->id]) }}">
                        Informasi Umum
                    </a>
                </li>
                <li class="nav-item" role="presentation">
                    <a class="nav-link px-3 {{ active('outlets.products.settings.attributes.index') }}"
                        href="{{ route('outlets.products.settings.attributes.index', [$currentOutlet->slug, $product->id]) }}">
                        Atribut
                    </a>
                </li>
            </ul>
        @endif --}}
    </div>
    <!-- end card body -->
</div>
