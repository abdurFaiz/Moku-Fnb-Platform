<div class="row justify-content-center">
    <div class="col-md-8 card mb-3">
        <div class="card-body">
            <div class="row">
                <div class="col-sm order-2 order-sm-1">
                    <div class="d-flex align-items-center mt-3 mt-sm-0">
                        <div class="flex-shrink-0">
                            <div class="avatar-xl me-3">
                                <img src="{{ auth()->user()->avatarUrl }}" alt=""
                                    class="img-fluid rounded-circle d-block">
                            </div>
                        </div>
                        <div class="flex-grow-1">
                            <div>
                                <h5 class="font-size-16 mb-1">{{ $user->name }}</h5>
                                <p class="text-muted font-size-13 mb-0">{{ $user->outlet->name }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
    
            <ul class="nav nav-tabs-custom card-header-tabs border-top mt-4" id="pills-tab" role="tablist">
                <li class="nav-item" role="presentation">
                    <a class="nav-link px-3 {{ active('outlets.settings.outlet.*') }}"
                        href="{{ route('outlets.settings.outlet.index', $currentOutlet->slug) }}">Outlet</a>
                </li>
                <li class="nav-item" role="presentation">
                    <a class="nav-link px-3 {{ active('outlets.settings.profile.*') }}"
                        href="{{ route('outlets.settings.profile.index', $currentOutlet->slug) }}">Profil</a>
                </li>
                <li class="nav-item" role="presentation">
                    <a href="{{ route('outlets.settings.schedule.index', $currentOutlet->slug) }}" class="nav-link px-3 {{ active('outlets.settings.schedule.*') }}"
                        tabindex="-1">Jam Operasional</a>
                </li>
            </ul>
        </div>
        <!-- end card body -->
    </div>
</div>
