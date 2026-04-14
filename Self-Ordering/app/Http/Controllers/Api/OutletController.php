<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use Illuminate\Http\Request;

class OutletController extends Controller
{
    public function index()
    {
        $outlets = Outlet::with(['products', 'media', 'operationalSchedules'])->withCount(['products'])->isActive();

        // Periksa token API dengan request()->bearerToken() sebagai alternatif auth()->check()
        if (request()->bearerToken()) {
            // Jika token ada, coba dapatkan user dari token
            $user = auth('sanctum')->user();

            $outlets = $outlets->totalPoint()->get();
        } else {
            $outlets = $outlets->get();
        }

        $outlets->append('logo_url');
        $outlets->append('preview_outlet_url');
        $outlets->append('is_table_service');
        $outlets->append('service_config_label');

        return ResponseFormatter::success([
            'outlets' => $outlets
        ]);
    }

    public function show(Outlet $outlet)
    {
        $outlet->load(['media']);
        $outlet->append('logo_url');
        $outlet->append('is_table_service');
        $outlet->append('service_config_label');

        return ResponseFormatter::success([
            'outlet' => $outlet
        ]);
    }
}
