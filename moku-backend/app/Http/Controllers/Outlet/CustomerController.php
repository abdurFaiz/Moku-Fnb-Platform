<?php

namespace App\Http\Controllers\Outlet;

use App\Enums\RoleEnum;
use App\Http\Controllers\Controller;
use App\Models\MemberOutlet;
use App\Models\User;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index()
    {
        $param = request()->query();

        $users = User::role(RoleEnum::CUSTOMER)
            ->with('customerProfile')
            ->whereHas('orders', function ($query) {
                $query->where('outlet_id', auth()->user()->outlet_id);
            })
            ->whereHas('customerProfile', function ($query) use ($param) {
                $query->filter($param);
            })            
            ->paginate(maxRowParams());

        $data = [
            'customers' => $users,
        ];

        return view('pages.outlets.customers.index', $data);
    }
}
