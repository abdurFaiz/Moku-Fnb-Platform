@props(['theme' => 'light'])
<header id="page-topbar" class="{{ $theme == 'primary' ? '' : '' }}">
    <div class="navbar-header">
        <div class="d-flex">
            <!-- LOGO -->
            <div class="navbar-brand-box {{ $theme == 'primary' ? 'bg-primary-theme' : 'bg-white' }} border-0">
                <a href="" class="logo logo-dark">
                    <span class="logo-sm">
                        <img src="{{ asset('assets/images/logo/spinofy_logo_symbol_white.png') }}" alt=""
                            height="24">
                    </span>
                    <span class="logo-lg">
                        <img src="{{ asset('assets/images/logo/spinofy_logo_white.png') }}" alt=""
                            height="24">
                    </span>
                </a>
                <a href="" class="logo logo-light">
                    <span class="logo-sm">
                        <img src="{{ asset('assets/images/logo/spinofy_logo_symbol_white.png') }}" alt=""
                            height="24">
                    </span>
                    <span class="logo-lg">
                        <img src="{{ asset('assets/images/logo/spinofy_logo_white.png') }}" alt=""
                            height="24">
                    </span>
                </a>
            </div>

            <button type="button" class="btn btn-sm px-3 font-size-16 header-item" id="vertical-menu-btn">
                <i class="fa fa-fw fa-bars"></i>
            </button>

            <div class="d-flex align-items-center gap-2">
                <h6 class="fw-medium mb-0">{{ $title }}</h6>
            </div>
        </div>

        <div class="d-flex align-items-center gap-2">
            @role('outlet')
                <div class="dropdown d-none d-lg-inline-block ms-1">
                    <button type="button" class="btn header-item" data-bs-toggle="dropdown" aria-haspopup="true"
                        aria-expanded="false">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                            stroke-linejoin="round" class="feather feather-grid icon-lg">
                            <rect x="3" y="3" width="7" height="7"></rect>
                            <rect x="14" y="3" width="7" height="7"></rect>
                            <rect x="14" y="14" width="7" height="7"></rect>
                            <rect x="3" y="14" width="7" height="7"></rect>
                        </svg>
                    </button>
                    <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end">
                        <div class="p-2">
                            <h6 class="dropdown-header">Produk</h6>
                            <div class="row g-3">
                                <div class="col-4">
                                    <a class="dropdown-icon-item"
                                        href="{{ route('outlets.products.index', $currentOutlet->slug) }}">
                                        <i class="bx bx-coffee fs-2"></i>
                                        <span>List</span>
                                    </a>
                                </div>
                                <div class="col-4">
                                    <a class="dropdown-icon-item"
                                        href="{{ route('outlets.order-lines.index', $currentOutlet->slug) }}">
                                        <i class='bx bxs-bookmark-alt-minus fs-2'></i>
                                        <span>Order Line</span>
                                    </a>
                                </div>
                                <div class="col-4">
                                    <a class="dropdown-icon-item"
                                        href="{{ env('FE_APP_URL') . '/' . $currentOutlet->slug . '/home' }}"
                                        target="_blank">
                                        <i class='bx bx-store fs-2'></i>
                                        <span>Toko Anda</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div class="p-2">
                            <h6 class="dropdown-header">Analisa</h6>
                            <div class="row g-3">
                                <div class="col-4">
                                    <a class="dropdown-icon-item"
                                        href="{{ route('outlets.analytic.poin.index', $currentOutlet->slug) }}">
                                        <i class='bx bxs-badge-dollar fs-2'></i>
                                        <span>Poin</span>
                                    </a>
                                </div>
                                <div class="col-4">
                                    <a class="dropdown-icon-item"
                                        href="{{ route('outlets.analytic.sales.index', $currentOutlet->slug) }}">
                                        <i class='bx bx-line-chart fs-2'></i>
                                        <span>Sales</span>
                                    </a>
                                </div>
                                <div class="col-4">
                                    <a class="dropdown-icon-item"
                                        href="{{ route('outlets.analytic.customer.index', $currentOutlet->slug) }}">
                                        <i class='bx bxs-user-detail fs-2'></i>
                                        <span>Customer</span>
                                    </a>
                                </div>
                                <div class="col-4">
                                    <a class="dropdown-icon-item"
                                        href="{{ route('outlets.analytic.product.index', $currentOutlet->slug) }}">
                                        <i class='bx bx-bar-chart fs-2'></i>
                                        <span>Produk</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            @endrole

            <div class="dropdown d-inline-block">
                <button type="button"
                    class="btn waves-effect waves-light btn-sm rounded-pill btn-profile-pic d-flex align-items-center gap-1"
                    id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <img class="rounded-circle header-profile-user object-cover" src="{{ auth()->user()->avatarUrl }}"
                        alt="Header Avatar">
                    <div class="d-grid text-start me-2">
                        <h6 class="d-none d-xl-inline-block fw-medium mb-0">{{ auth()->user()->name }}</h6>
                        @role('outlet')
                            <span class="text-xs text-muted">{{ $currentOutlet->name }}</span>
                        @endrole
                    </div>
                    <i class="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
                </button>
                <div class="dropdown-menu dropdown-menu-end mt-2 border-0 shadow">
                    <!-- item-->
                    @role('outlet')
                        <a class="dropdown-item"
                            href="{{ route('outlets.settings.profile.index', $currentOutlet->slug) }}">
                            <i class="mdi mdi-account-circle font-size-16 align-middle me-1"></i>
                            Profil
                        </a>
                    @endrole
                    @role('admin spinotek')
                        <a class="dropdown-item" href="{{ route('spinotek.profile.index') }}">
                            <i class="mdi mdi-account-circle font-size-16 align-middle me-1"></i>
                            Profil
                        </a>
                    @endrole
                    <a class="dropdown-item" href="#!"
                        onclick="event.preventDefault();document.getElementById('logout-form').submit();">
                        <i class="mdi mdi-logout font-size-16 align-middle me-1"></i>
                        Logout
                    </a>
                    @role('admin spinotek')
                        <form id="logout-form" action="{{ route('spinotek.logout') }}" method="POST" class="d-none">
                            @csrf
                        </form>
                    @endrole
                    @role('outlet')
                        <form id="logout-form" action="{{ route('outlets.logout', auth()->user()->outlet->slug) }}"
                            method="POST" class="d-none">
                            @csrf
                        </form>
                    @endrole
                </div>
            </div>
        </div>
    </div>
</header>

@if ($theme == 'primary')
    {{-- @push('styles')
        <style>
            .sidebar-enable .navbar-header #vertical-menu-btn {
                color: white;
            }
        </style>
    @endpush --}}

    <script>
        $(document).ready(function() {
            function updateBtnColor() {
                var w = $(window).width();
                // Jika layar ponsel (< 768px), abaikan (reset style agar ikut css default)
                if (w < 768) {
                    $('#vertical-menu-btn').css('color', '');
                    return;
                }

                if (w < 1200) {
                    // Layar menengah/tablet (< 1200px)
                    // Sidebar show (ada class sidebar-enable) -> Hitam
                    // Sidebar hidden (tidak ada class) -> Putih
                    // console.log('Sidebar show (ada class sidebar-enable) -> Hitam');
                    $('#vertical-menu-btn').css('color', $('body').hasClass('sidebar-enable') ? 'white' :
                        'black');
                } else {
                    // Layar besar/laptop (>= 1200px)
                    // Sidebar hidden (vertical-collpsed) -> Putih
                    // Sidebar show (default) -> Hitam
                    $('#vertical-menu-btn').css('color', $('body').hasClass('sidebar-enable') ? 'black' :
                        'white');
                }
            }


            updateBtnColor();
            $('#vertical-menu-btn').on('click', function() {
                // Increased timeout to ensure class is applied by the template script
                setTimeout(updateBtnColor, 100);
            });

            // Update saat window di-resize
            $(window).on('resize', updateBtnColor);
        });
    </script>
@endif
