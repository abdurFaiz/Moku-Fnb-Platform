{{-- <x-panel-layout>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card">
                    <div class="card-header">{{ __('Dashboard') }}</div>

                    <div class="card-body">
                        @if (session('status'))
                            <div class="alert alert-success" role="alert">
                                {{ session('status') }}
                            </div>
                        @endif

                        {{ __('You are logged in!') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-panel-layout> --}}

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Dashboard')</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

    <style>
        body {
            font-family: "Inter", system-ui, sans-serif;
            background-color: #f8f9fa;
            overflow-x: hidden;
        }

        /* SIDEBAR */
        .sidebar {
            width: 250px;
            height: 100vh;
            background: #fff;
            border-right: 1px solid #dee2e6;
            position: fixed;
            top: 0;
            left: 0;
            transition: all 0.3s ease;
            overflow-y: auto;
        }

        .sidebar:hover {
            overflow-y: scroll;
        }

        .sidebar::-webkit-scrollbar {
            width: 6px;
        }

        .sidebar::-webkit-scrollbar-thumb {
            background-color: #adb5bd;
            border-radius: 10px;
        }

        .sidebar .nav-link {
            color: #495057;
            border-radius: 0.5rem;
            margin: 2px 10px;
            transition: all 0.2s ease-in-out;
        }

        .sidebar .nav-link:hover {
            background-color: #e9ecef;
        }

        .sidebar .nav-link.active {
            background-color: #e7f1ff;
            color: #0d6efd;
            font-weight: 600;
        }

        .sidebar-section {
            padding: 10px 15px;
            text-transform: uppercase;
            font-size: 0.75rem;
            color: #6c757d;
            margin-top: 1rem;
        }

        /* NAVBAR */
        .navbar {
            background: #fff;
            border-bottom: 1px solid #dee2e6;
            padding: 0.75rem 1rem;
            position: fixed;
            top: 0;
            left: 250px;
            right: 0;
            z-index: 1000;
            transition: left 0.3s ease;
        }

        /* MAIN CONTENT */
        .main-content {
            margin-left: 250px;
            margin-top: 60px;
            padding: 1.5rem;
            transition: margin-left 0.3s ease;
        }

        /* RESPONSIVE */
        @media (max-width: 992px) {
            .sidebar {
                left: -250px;
            }

            .sidebar.active {
                left: 0;
            }

            .navbar {
                left: 0;
            }

            .main-content {
                margin-left: 0;
            }
        }
    </style>
</head>

<body>
    <!-- SIDEBAR -->
    <div class="sidebar" id="sidebar">
        <div class="p-3 border-bottom">
            <h5 class="mb-0 text-primary fw-bold">Spinotek</h5>
        </div>

        <div class="sidebar-section">Main</div>
        <nav class="nav flex-column">
            <a href="#" class="nav-link active"><i class="bi bi-house"></i> Dashboard</a>
            <a href="#" class="nav-link"><i class="bi bi-bar-chart"></i> Analytics</a>
            <a href="#" class="nav-link"><i class="bi bi-folder"></i> Projects</a>
        </nav>

        <div class="sidebar-section">Settings</div>
        <nav class="nav flex-column">
            <a href="#" class="nav-link"><i class="bi bi-people"></i> Users</a>
            <a href="#" class="nav-link"><i class="bi bi-gear"></i> System</a>
            <a href="#" class="nav-link"><i class="bi bi-lock"></i> Security</a>
        </nav>

        <div class="sidebar-section">Settings</div>
        <nav class="nav flex-column">
            <a href="#" class="nav-link"><i class="bi bi-people"></i> Users</a>
            <a href="#" class="nav-link"><i class="bi bi-gear"></i> System</a>
            <a href="#" class="nav-link"><i class="bi bi-lock"></i> Security</a>
        </nav>

        <div class="sidebar-section">Settings</div>
        <nav class="nav flex-column">
            <a href="#" class="nav-link"><i class="bi bi-people"></i> Users</a>
            <a href="#" class="nav-link"><i class="bi bi-gear"></i> System</a>
            <a href="#" class="nav-link"><i class="bi bi-lock"></i> Security</a>
        </nav>

        <div class="sidebar-section">Settings</div>
        <nav class="nav flex-column">
            <a href="#" class="nav-link"><i class="bi bi-people"></i> Users</a>
            <a href="#" class="nav-link"><i class="bi bi-gear"></i> System</a>
            <a href="#" class="nav-link"><i class="bi bi-lock"></i> Security</a>
        </nav>
    </div>

    <!-- NAVBAR -->
    <nav class="navbar navbar-expand-lg">
        <button class="btn btn-outline-primary me-3 d-lg-none" id="toggleSidebar">
            <i class="bi bi-list"></i>
        </button>
        <div class="navbar-brand fw-semibold">Dashboard</div>
        <div class="ms-auto d-flex align-items-center gap-3">
            <div class="text-secondary small">Hi, Admin</div>
            <img src="https://ui-avatars.com/api/?name=Admin" class="rounded-circle" width="36" height="36">
        </div>
    </nav>

    <!-- MAIN CONTENT -->
    <main class="main-content">
        @yield('content')
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.js"></script>
    <script>
        const toggleBtn = document.getElementById('toggleSidebar');
        const sidebar = document.getElementById('sidebar');

        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    </script>
</body>

</html>
