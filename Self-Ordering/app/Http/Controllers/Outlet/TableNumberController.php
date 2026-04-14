<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\TableNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use ZipArchive;

class TableNumberController extends Controller
{
    public function downloadQrCodeZip(Outlet $outlet)
    {
        $zip = new ZipArchive();
        $tempFile = tempnam(sys_get_temp_dir(), 'zip');

        if ($zip->open($tempFile, ZipArchive::CREATE) === TRUE) {
            $files = File::files(storage_path("app/public/qrcodes/{$outlet->id}"));

            foreach ($files as $file) {
                $zip->addFile($file, basename($file));
            }

            $zip->close();
        }

        return response()->download($tempFile, 'kode-qr-meja.zip')->deleteFileAfterSend(true);
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Outlet $outlet)
    {
        $params = request()->query();
        $tableNumberLocations = $outlet->tableNumberLocations()->with('tableNumbers')->get();
        $tableNumbers = $outlet->tableNumbers()->with('tableNumberLocation')->filter($params)->paginate(30);
        $currentTableLocation = request('table_number_location_id') ? $outlet->tableNumberLocations()->findOrFail(request('table_number_location_id')) : null;

        return view('pages.outlets.table-numbers.index', compact('tableNumberLocations', 'tableNumbers', 'currentTableLocation'));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Outlet $outlet, Request $request)
    {
        try {
            DB::beginTransaction();

            $data = $request->validate([
                'number' => 'required',
                'table_number_location_id' => 'required',
            ]);

            // check outlet table location
            $outletTableNumberLocation = $outlet->tableNumberLocations()->findOrFail($request->table_number_location_id);

            // check number exists
            $check = $outlet->tableNumbers()->where('number', $request->number)->first();
            if ($check) {
                $location = $check->tableNumberLocation;
                return back()->withErrors(['number' => "Nomor meja $request->number sudah terdaftar di lokasi $location->name."])->withInput();
            }

            $tableNumber = $outlet->tableNumbers()->create($data);

            // generate qr code
            $qrCodeUrl = env('FE_APP_URL') . "/onboard?outlet=$outlet->slug&table=$tableNumber->number";
            $qrCodePath = "qrcodes/$outlet->id/$tableNumber->number.png";
            $fullQrCodePath = storage_path("app/public/$qrCodePath");

            // check if folder exists
            if (!file_exists(dirname($fullQrCodePath))) {
                mkdir(dirname($fullQrCodePath), 0755, true);
            }

            // generate qr code
            $qrCode = QrCode::format('png')->size(200)->generate($qrCodeUrl, $fullQrCodePath);
            $tableNumber->update([
                'qr_code_path' => $qrCodePath,
            ]);

            DB::commit();

            notyf("Nomor meja $request->number berhasil ditambahkan");
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Outlet $outlet, TableNumber $tableNumber)
    {
        $tableNumber->load('outlet');

        $data = [
            'tableNumber' => $tableNumber,
        ];

        return view('pages.outlets.table-numbers.show', $data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Outlet $outlet, TableNumber $tableNumber)
    {
        $data = [
            'action' => route('outlets.table-numbers.update', [$outlet->slug, $tableNumber->id]),
            'tableNumberLocations' => $outlet->tableNumberLocations()->get(),
            'tableNumber' => $tableNumber,
        ];

        return view('pages.outlets.table-numbers.edit', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outlet $outlet, TableNumber $tableNumber)
    {
        $request->validate([
            'number' => 'required',
            'table_number_location_id' => 'required',
        ]);

        try {
            DB::beginTransaction();

            // check outlet table location
            $outletTableNumberLocation = $outlet->tableNumberLocations()->findOrFail($request->table_number_location_id);

            // check number exists
            $check = $outlet->tableNumbers()->where('number', $request->number)->first();
            if ($check && $check->id != $tableNumber->id) {
                $location = $check->tableNumberLocation;
                notfy()->error("Nomor meja $request->number sudah terdaftar di lokasi $location->name.");
                return back();
            }

            $tableNumber->update($request->all());

            DB::commit();

            notyf("Nomor meja $request->number berhasil diupdate");
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();
            throw $th;
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Outlet $outlet, TableNumber $tableNumber)
    {
        try {
            $outletTableNumber = $outlet->tableNumbers()->find($tableNumber->id);

            if (!$outletTableNumber) {
                throw new \Exception("Anda tidak mendapat akses.");
            }

            // delete qr code
            if (file_exists($tableNumber->qr_code_path)) {
                unlink($tableNumber->qr_code_path);
            }

            $tableNumber->delete();

            return response()->json([
                "message" => "Nomor meja $tableNumber->number berhasil dihapus"
            ]);
        } catch (\Throwable $th) {
            throw $th;
        }
    }
}
