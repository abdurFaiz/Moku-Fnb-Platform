<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Services\OperationalScheduleService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OperationalScheduleController extends Controller
{
    protected OperationalScheduleService $scheduleService;

    public function __construct(OperationalScheduleService $scheduleService)
    {
        $this->scheduleService = $scheduleService;
    }

    public function index()
    {
        $outlet = Outlet::with(['operationalSchedules'])->findOrFail(auth()->user()->outlet_id);

        $data = [
            'user' => auth()->user()->load(['outlet.media']),
            'outlet' => $outlet,
        ];

        return view('pages.outlets.settings.schedule', $data);
    }

    public function update(Request $request, Outlet $outlet)
    {
        try {
            DB::beginTransaction();

            $this->scheduleService->update($outlet, $request);

            DB::commit();

            notyf("Jadwal operasional berhasil diupdate");
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf()->error("Jadwal operasional gagal diupdate");
            return redirect()->back();
        }
    }
}
