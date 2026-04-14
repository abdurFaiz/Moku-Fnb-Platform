<?php

namespace App\Http\Controllers\Spinotek;

use App\Enums\RoleEnum;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Http\Request;

class CashierController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = request()->query();

        $cashiers = User::with(['outlet'])->isOutlet()->filter($query)->latest()->paginate(maxRowParams());

        $data = [
            'cashiers' => $cashiers,
            'outlets' => Outlet::latest()->get(),
        ];

        return view('pages.spinotek.cashiers.index', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $data = [
            'action' => route('spinotek.cashiers.store', ['outlet_id' => request()->query('outlet_id')]),            
        ];

        return view('pages.spinotek.outlets.cashiers.form', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'outlet_id' => 'required|exists:outlets,id',
        ]);

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => bcrypt($request->password),
                'outlet_id' => $request->outlet_id,
            ]);

            // assign role
            $user->assignRole(RoleEnum::OUTLET);

            notyf("Kasir berhasil ditambahkan");
            return redirect()->back();
        } catch (\Throwable $th) {
            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Kasir gagal ditambahkan");
            return redirect()->back();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit($user)
    {
        $cashier = User::findOrFail($user);

        $data = [
            'action' => route('spinotek.cashiers.update', $cashier),
            'cashier' => $cashier,
        ];

        return view('pages.spinotek.outlets.cashiers.form', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $user)
    {   
        $cashier = User::findOrFail($user);

        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users,email,' . $cashier->id,
            'password' => 'nullable|min:6',
        ]);

        try {
            $data = [
                'name' => $request->name,
                'email' => $request->email,
            ];

            if ($request->password) {
                $data['password'] = bcrypt($request->password);
            }

            $cashier->update($data);

            notyf("Kasir berhasil diupdate");
            return redirect()->back();
        } catch (\Throwable $th) {
            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Kasir gagal diupdate");
            return redirect()->back();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($user)
    {
        $cashier = User::findOrFail($user);

        try {
            $cashier->delete();

            notyf("Kasir berhasil dihapus");
            return redirect()->back();
        } catch (\Throwable $th) {
            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Kasir gagal dihapus");
            return redirect()->back();
        }
    }
}
