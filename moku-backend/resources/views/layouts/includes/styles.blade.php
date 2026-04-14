<!-- Scripts -->
@vite(['resources/backend/sass/app.scss', 'resources/backend/js/app.js'])

<!-- dropify -->
<link rel="stylesheet" href="{{ asset('assets/libs/dropify/css/dropify.min.css') }}">

{{-- Scripts --}}
<script src="{{ asset('assets/libs/jquery/jquery.min.js') }}"></script>

<style>
    .bg-primary-theme {
        background: linear-gradient(135deg, #DD4100 0%, #FF7043 100%) !important;
        /* Base #DD4100 to lighter orange */
    }

    /* Sidebar overrides for primary theme */
    .vertical-menu.bg-primary-theme {
        border-right: none;
    }

    /* Text color white for dark background */
    .vertical-menu.bg-primary-theme #sidebar-menu ul li a {
        color: rgba(255, 255, 255, 0.8);
    }

    .vertical-menu.bg-primary-theme #sidebar-menu ul li a:hover,
    .vertical-menu.bg-primary-theme #sidebar-menu ul li a.mm-active,
    .vertical-menu.bg-primary-theme #sidebar-menu ul li.mm-active>a,
    .vertical-menu.bg-primary-theme #sidebar-menu ul li a.active {
        color: #DD4100 !important;
        /* Dark orange text */
        background-color: #ffffff !important;
        /* Solid white background for contrast */
        font-weight: 700;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* Specific fix for sub-menus */
    .vertical-menu.bg-primary-theme #sidebar-menu ul.sub-menu li a.active,
    .vertical-menu.bg-primary-theme #sidebar-menu ul.sub-menu li a.mm-active {
        background-color: rgba(255, 255, 255, 0.9) !important;
        /* Almost solid white for sub-menus */
        color: #DD4100 !important;
    }

    .vertical-menu.bg-primary-theme #sidebar-menu ul li a i {
        color: rgba(255, 255, 255, 0.8);
    }

    .vertical-menu.bg-primary-theme #sidebar-menu ul li a:hover i,
    .vertical-menu.bg-primary-theme #sidebar-menu ul li a.mm-active i,
    .vertical-menu.bg-primary-theme #sidebar-menu ul li.mm-active>a i {
        color: #DD4100 !important;
        /* Dark orange icon */
    }

    /* Navbar overrides for primary theme */
    .navbar-brand-box.bg-primary-theme {
        background-color: transparent !important;
    }

    header#page-topbar.bg-primary-theme {
        background-color: transparent !important;
        box-shadow: none;
    }

    /* Adjust logo for primary theme if needed, or assume white logo is available/visible */

    /* Sub-menu spacing */
    #sidebar-menu ul.sub-menu {
        /* display: grid; */
        gap: 0.25rem;
        margin-top: 0.25rem;
        margin-bottom: 0.25rem;
    }

    #sidebar-menu ul.sub-menu li {
        margin-top: 0.25rem;
        margin-bottom: 0.25rem;
    }
</style>
