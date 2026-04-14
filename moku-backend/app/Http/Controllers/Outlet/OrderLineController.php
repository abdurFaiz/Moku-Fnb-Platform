<?php

namespace App\Http\Controllers\Outlet;

use App\Enums\OrderStatusEnum;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use Illuminate\Http\Request;

class OrderLineController extends Controller
{
    public function index(Outlet $outlet)
    {
        $data = [
            'outlet' => $outlet,
        ];

        return view('pages.outlets.order-lines.index', $data);
    }
}
