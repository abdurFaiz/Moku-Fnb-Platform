<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use Illuminate\Http\Request;

class TableNumberController extends Controller
{
    public function index(Outlet $outlet)
    {
        $tableLocations = $outlet->tableNumberLocations()->select('id', 'name', 'outlet_id')->get();
        $tableNumbers = $outlet->tableNumbers()->with('tableNumberLocation')->select('id', 'number', 'outlet_id', 'table_number_location_id')->get();

        $data = [
            'table_numbers' => $tableNumbers,
            'table_locations' => $tableLocations,
        ];

        return ResponseFormatter::success($data, 'List of table numbers');
    }

    public function show(Outlet $outlet, $number)
    {
        $tableNumber = $outlet->tableNumbers()->where('number', $number)->first();

        if (!$tableNumber) {
            return ResponseFormatter::error('Table number not found', 404);
        }

        return ResponseFormatter::success($tableNumber, 'Table number details');
    }
}
