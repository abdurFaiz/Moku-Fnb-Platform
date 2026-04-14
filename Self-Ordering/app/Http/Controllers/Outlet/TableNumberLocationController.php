<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\TableNumberLocation;
use Illuminate\Http\Request;

class TableNumberLocationController extends Controller
{
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Outlet $outlet)
    {
        $data = $request->validate([
            'name' => 'required'
        ]);

        $tableNumberLocation = $outlet->tableNumberLocations()->create($data);

        notyf("Lokasi $request->name berhasil ditambahkan");
        return to_route('outlets.table-numbers.index', [$outlet->slug, 'table_number_location_id' => $tableNumberLocation->id])->with('please_input_table_number', true);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Outlet $outlet, TableNumberLocation $tableNumberLocation)
    {
        return view('pages.outlets.table-number-locations.edit', compact('tableNumberLocation'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outlet $outlet, TableNumberLocation $tableNumberLocation)
    {
        $data = $request->validate([
            'name' => 'required'
        ]);

        $outletTableNumberLocation = $outlet->tableNumberLocations()->find($tableNumberLocation->id);

        if ($outletTableNumberLocation) {
            $outletTableNumberLocation->update($data);

            notyf("Lokasi berhasil diperbarui");
            return back();
        }

        return abort(403);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Outlet $outlet, TableNumberLocation $tableNumberLocation)
    {
        try {
            $outletTableNumberLocation = $outlet->tableNumberLocations()->find($tableNumberLocation->id);

            if (!$outletTableNumberLocation) {
                throw new \Exception("Anda tidak mendapat akses.");
            }

            if ($outletTableNumberLocation->tableNumbers->count() > 0) {
                throw new \Exception("Lokasi tidak dapat dihapus, mohon hapus semua nomor meja yang terdaftar di lokasi $tableNumberLocation->name.");
            }

            $outletTableNumberLocation->delete();
            return response()->json([
                "message" => "Lokasi $tableNumberLocation->number berhasil dihapus",
                "redirect" => route('outlets.table-numbers.index', $outlet->slug),
            ]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
