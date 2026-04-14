<?php

namespace App\Http\Controllers\Spinotek;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Models\Outlet;
use App\Services\BannerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BannerController extends Controller
{
    protected $bannerService;

    public function __construct(BannerService $bannerService)
    {
        $this->bannerService = $bannerService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Outlet $outlet)
    {
        $banners = Banner::with(['media'])->where('outlet_id', $outlet->id)->paginate(maxRowParams());

        $data = [
            'outlet' => $outlet,
            'banners' => $banners,
        ];

        return view('pages.spinotek.outlets.banner.index', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Outlet $outlet)
    {
        $data = [
            'action' => route('spinotek.outlets.banners.store', $outlet),
        ];

        return view('pages.spinotek.outlets.banner.form', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Outlet $outlet)
    {
        $rules = $this->bannerService->rules();

        $request->validate($rules);

        try {
            DB::beginTransaction();

            $this->bannerService->store($request, $outlet);

            DB::commit();

            notyf('Banner berhasil disimpan');
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf()->error($th->getMessage());
            return back();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Banner $banner)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Outlet $outlet, Banner $banner)
    {
        $data = [
            'action' => route('spinotek.outlets.banners.update', [$outlet, $banner]),
            'banner' => $banner,
        ];

        return view('pages.spinotek.outlets.banner.form', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outlet $outlet, Banner $banner)
    {
        $rules = $this->bannerService->rules();

        $request->validate($rules);

        try {
            DB::beginTransaction();

            $this->bannerService->update($request, $banner);

            DB::commit();

            notyf('Banner berhasil diupdate');
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf()->error($th->getMessage());
            return back();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Outlet $outlet, Banner $banner)
    {
        try {
            DB::beginTransaction();

            $this->bannerService->destroy($banner);

            DB::commit();

            notyf('Banner berhasil dihapus');
            return back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf()->error($th->getMessage());
            return back();
        }
    }
}
