@props(['theme' => 'light'])
<div class="vertical-menu {{ $theme == 'primary' ? 'bg-primary-theme' : 'bg-white' }} mm-active">

    <div data-simplebar="init" class="h-100 mm-show" id="sidebar">
        <div class="simplebar-wrapper" style="margin: 0px;">
            <div class="simplebar-height-auto-observer-wrapper">
                <div class="simplebar-height-auto-observer"></div>
            </div>
            <div class="simplebar-mask">
                <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
                    <div class="simplebar-content-wrapper" tabindex="0" role="region" aria-label="scrollable content"
                        style="height: 100%; overflow: hidden;">
                        <div class="simplebar-content" style="padding: 0px;">

                            <!--- Sidemenu -->
                            <div id="sidebar-menu" class="mm-active">
                                <!-- Left Menu Start -->
                                <ul class="metismenu list-unstyled mm-show" id="side-menu">
                                    @role('admin spinotek')
                                        <li class="{{ active('spinotek.dashboard', 'mm-active') }}">
                                            <a href="{{ route('spinotek.dashboard') }}"
                                                class="waves-effect waves-light{{ active('spinotek.dashboard') }}">
                                                <i class="bx bx bxs-dashboard me-1"></i>
                                                <span>Dashboard</span>
                                            </a>
                                        </li>
                                        <li class="{{ active('spinotek.outlets.*', 'mm-active') }}">
                                            <a href="{{ route('spinotek.outlets.index') }}"
                                                class="waves-effect waves-light {{ active('spinotek.outlets.*') }}">
                                                <i class='bx bx-store me-1'></i>
                                                <span>Outlet</span>
                                            </a>
                                        </li>
                                        <li class="{{ active('spinotek.outlet-groups.*', 'mm-active') }}">
                                            <a href="{{ route('spinotek.outlet-groups.index') }}"
                                                class="waves-effect waves-light {{ active('spinotek.outlet-groups.*') }}">
                                                <i class='bx bx-box me-1'></i>
                                                <span>Outlet Group</span>
                                            </a>
                                        </li>
                                        <li class="{{ active('spinotek.profile.*', 'mm-active') }}">
                                            <a href="{{ route('spinotek.profile.index') }}"
                                                class="waves-effect waves-light {{ active('spinotek.profile.*') }}">
                                                <i class='bx bx-user me-1'></i>
                                                <span>Profile</span>
                                            </a>
                                        </li>
                                    @endrole

                                    @role('outlet')
                                        <li class="{{ active('outlets.dashboard', 'mm-active') }}">
                                            <a href="{{ route('outlets.dashboard', $currentOutlet->slug) }}"
                                                class="waves-effect waves-light {{ active('outlets.dashboard') }}">
                                                <i class="bx bxs-dashboard me-1"></i>
                                                <span>Dashboard</span>
                                            </a>
                                        </li>
                                        <li class="{{ active('outlets.order-lines.*', 'mm-active') }}">
                                            <a href="{{ route('outlets.order-lines.index', $currentOutlet->slug) }}"
                                                class="waves-effect waves-light {{ active('outlets.order-lines.*') }}">
                                                <i class='bx bxs-bookmark-alt-minus me-1'></i>
                                                <span>Order Line</span>
                                            </a>
                                        </li>
                                        {{-- <li>
                        <a href="" class="waves-effect waves-light">
                            <i class="bx bx-desktop me-1"></i>
                            <span>POS</span>
                        </a>
                    </li> --}}
                                        <li class="{{ active('outlets.products.*', 'mm-active') }}">
                                            <a href="javascript: void(0);" class="has-arrow" aria-expanded="true">
                                                <i class="bx bx-coffee me-1"></i>
                                                <span>Produk</span>
                                            </a>
                                            <ul class="sub-menu mm-collapse mm-show" aria-expanded="true" style="">
                                                <li>
                                                    <a href="{{ route('outlets.products.index', $currentOutlet->slug) }}"
                                                        class="{{ active('outlets.products.*') }}">
                                                        <span>Daftar Produk</span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="{{ route('outlets.product-attributes.index', $currentOutlet->slug) }}"
                                                        class="{{ active('outlets.product-attributes.*') }}">
                                                        <span>Atribut Produk</span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                        <li class="{{ active('outlets.analytic.*', 'mm-active') }}">
                                            <a href="javascript: void(0);" class="has-arrow" aria-expanded="true">
                                                <i class='bx bx-bar-chart me-1'></i>
                                                <span>Analisa</span>
                                            </a>
                                            <ul class="sub-menu mm-collapse" aria-expanded="false" style="">
                                                <li>
                                                    <a href="{{ route('outlets.analytic.poin.index', $currentOutlet->slug) }}"
                                                        class="{{ active('outlets.analytic.poin.*') }}">
                                                        <span>Poin</span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="{{ route('outlets.analytic.sales.index', $currentOutlet->slug) }}"
                                                        class="{{ active('outlets.analytic.sales.*') }}">
                                                        <span>Sales</span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="{{ route('outlets.analytic.product.index', $currentOutlet->slug) }}"
                                                        class="{{ active('outlets.analytic.product.*') }}">
                                                        <span>Produk</span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="{{ route('outlets.analytic.customer.index', $currentOutlet->slug) }}"
                                                        class="{{ active('outlets.analytic.customer.*') }}">
                                                        <span>Customer</span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a href="{{ route('outlets.analytic.feedback.index', $currentOutlet->slug) }}"
                                                        class="{{ active('outlets.analytic.feedback.*') }}">
                                                        <span>Feedback</span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                        <li class="{{ active('outlets.vouchers.*', 'mm-active') }}">
                                            <a href="{{ route('outlets.vouchers.index', $currentOutlet->slug) }}"
                                                class="waves-effect waves-light {{ active('outlets.vouchers.*') }}">
                                                <i class='bx bxs-purchase-tag me-1'></i>
                                                <span>Voucher</span>
                                            </a>
                                        </li>
                                        <li class="{{ active('outlets.rewards.*', 'mm-active') }}">
                                            <a href="{{ route('outlets.rewards.index', $currentOutlet->slug) }}"
                                                class="waves-effect waves-light {{ active('outlets.rewards.*') }}">
                                                <i class='bx bx-gift me-1'></i>
                                                <span>Reward</span>
                                            </a>
                                        </li>
                                        <li class="{{ active('outlets.reports.sales.*', 'mm-active') }}">
                                            <a href="{{ route('outlets.reports.sales.index', $currentOutlet->slug) }}"
                                                class="waves-effect waves-light {{ active('outlets.reports.sales.*') }}">
                                                <i class="bx bxs-pie-chart-alt-2 me-1"></i>
                                                <span>All Order</span>
                                            </a>
                                        </li>
                                        <li class="{{ active('outlets.table-numbers.*', 'mm-active') }}">
                                            <a href="{{ route('outlets.table-numbers.index', $currentOutlet->slug) }}"
                                                class="waves-effect waves-light {{ active('outlets.table-numbers.*') }}">
                                                <i class="bx bx-table me-1"></i>
                                                <span>Nomor Meja</span>
                                            </a>
                                        </li>
                                        <li class="{{ active('outlets.customers.*', 'mm-active') }}">
                                            <a href="{{ route('outlets.customers.index', $currentOutlet->slug) }}"
                                                class="waves-effect waves-light {{ active('outlets.customers.*') }}">
                                                <i class="bx bxs-user-pin me-1"></i>
                                                <span>Pelanggan</span>
                                            </a>
                                        </li>
                                        <li class="{{ active('outlets.banners.*', 'mm-active') }}">
                                            <a href="{{ route('outlets.banners.index', $currentOutlet->slug) }}"
                                                class="waves-effect waves-light {{ active('outlets.banners.*') }}">
                                                <i class='bx bx-images me-1'></i>
                                                <span>Banner</span>
                                            </a>
                                        </li>
                                        <li class="{{ active('outlets.feedback-questions.*', 'mm-active') }}">
                                            <a href="{{ route('outlets.feedback-questions.index', $currentOutlet->slug) }}"
                                                class="waves-effect waves-light {{ active('outlets.feedback-questions.*') }}">
                                                <i class='bx bx-question-mark me-1'></i>
                                                <span>Feedback Question</span>
                                            </a>
                                        </li>
                                    @endrole
                                </ul>
                            </div>
                            <!-- Sidebar -->

                            <!-- Bagian bawah: menu tetap di bawah -->
                            <div id="sidebar-menu"
                                class="{{ $theme == 'primary' ? 'bg-transparent' : 'bg-white' }} py-3"
                                style="height: 40vh;">
                                <ul class="metismenu list-unstyled mm-show" id="side-menu-bottom">
                                    @role('outlet')
                                        <li>
                                            <a href="{{ route('outlets.settings.outlet.index', $currentOutlet->slug) }}"
                                                class="waves-effect waves-light {{ active('outlets.settings.*') }}">
                                                <i class="bx bxs-cog me-1"></i>
                                                <span>Pengaturan</span>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="https://wa.me/{{ config('app.contact_spinotek') }}" target="_blank"
                                                class="waves-effect waves-light">
                                                <i class="bx bxs-help-circle me-1"></i>
                                                <span>Bantuan</span>
                                            </a>
                                        </li>
                                    @endrole
                                    <li>
                                        <a href="#!"
                                            onclick="event.preventDefault();document.getElementById('logout-form').submit();"
                                            class="waves-effect waves-light">
                                            <i class="bx bx-log-out me-1"></i>
                                            <span>Keluar</span>
                                        </a>
                                        @role('admin spinotek')
                                            <form id="logout-form" action="{{ route('logout') }}" method="POST"
                                                class="d-none">
                                                @csrf
                                            </form>
                                        @endrole
                                        @role('outlet')
                                            <form id="logout-form"
                                                action="{{ route('outlets.logout', auth()->user()->outlet->slug) }}"
                                                method="POST" class="d-none">
                                                @csrf
                                            </form>
                                        @endrole
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="simplebar-placeholder" style="width: auto; height: auto;"></div>
        </div>
        <div class="simplebar-track simplebar-horizontal" style="visibility: hidden;">
            <div class="simplebar-scrollbar" style="width: 0px; display: none;"></div>
        </div>
        <div class="simplebar-track simplebar-vertical" style="visibility: hidden;">
            <div class="simplebar-scrollbar" style="height: 0px; display: none;"></div>
        </div>
    </div>
</div>
