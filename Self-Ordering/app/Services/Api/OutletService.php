<?php

namespace App\Services\Api;

use App\Helpers\ResponseFormatter;
use App\Models\Outlet;
use Illuminate\Support\Facades\Http;

class OutletService
{
    public function checkOutletSchedule(Outlet $outlet)
    {
        $outlet->append('is_open');

        // check outlet available
        if ($outlet->is_open != true) {
            return ResponseFormatter::error(
                'Outlet '.$outlet->name . ' is not open',
                400
            );
        }

        // return true so caller can simply continue processing
        return true;
    }
}
