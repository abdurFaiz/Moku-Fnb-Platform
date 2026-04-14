<?php

namespace App\Http\Controllers\Spinotek;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\OutletGroup;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OutletGroupController extends Controller
{
    protected ImageCompressionService $imageCompressionService;

    public function __construct(ImageCompressionService $imageCompressionService)
    {
        $this->imageCompressionService = $imageCompressionService;
    }
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = request()->query();

        $outletGroups = OutletGroup::withCount('outletGroupMembers')->filter($query)->latest()->paginate(maxRowParams());

        $data = [
            'outletGroups' => $outletGroups,
        ];

        return view('pages.spinotek.outlets.groups.index', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $outlets = Outlet::orderBy('name')->get();

        $data = [
            'title' => 'Tambah Outlet Group',
            'action' => route('spinotek.outlet-groups.store'),
            'outlets' => $outlets,
        ];

        return view('pages.spinotek.outlets.groups.form', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'slug' => 'required|unique:outlet_groups,slug',
            'description' => 'nullable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'outlets' => 'nullable|array',
            'outlets.*' => 'exists:outlets,id',
        ]);

        try {
            DB::beginTransaction();

            $outletGroup = OutletGroup::create([
                'name' => $request->name,
                'slug' => $request->slug,
                'description' => $request->description,
            ]);

            if ($request->hasFile('image') && @$request->image) {
                $this->imageCompressionService->compress($request->file('image'));
                $outletGroup->addMedia($request->file('image'))->toMediaCollection('image');
            }

            // Attach selected outlets
            if ($request->outlets) {
                $outletGroup->members()->attach($request->outlets);
            }

            DB::commit();

            notyf("Outlet Group berhasil ditambahkan");
            return redirect()->route('spinotek.outlet-groups.index');
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Outlet Group gagal ditambahkan");
            return redirect()->back();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(OutletGroup $outletGroup)
    {
        $outletGroup->load('members');

        $data = [
            'title' => 'Detail Outlet Group',
            'outletGroup' => $outletGroup,
        ];

        return view('pages.spinotek.outlets.groups.show', $data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(OutletGroup $outletGroup)
    {
        $outlets = \App\Models\Outlet::orderBy('name')->get();

        $data = [
            'title' => 'Edit Outlet Group',
            'action' => route('spinotek.outlet-groups.update', $outletGroup->slug),
            'outletGroup' => $outletGroup,
            'outlets' => $outlets,
        ];

        return view('pages.spinotek.outlets.groups.form', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, OutletGroup $outletGroup)
    {
        $request->validate([
            'name' => 'required',
            'slug' => 'required|unique:outlet_groups,slug,' . $outletGroup->id,
            'description' => 'nullable',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'outlets' => 'nullable|array',
            'outlets.*' => 'exists:outlets,id',
        ]);

        try {
            DB::beginTransaction();

            $outletGroup->update([
                'name' => $request->name,
                'slug' => $request->slug,
                'description' => $request->description,
            ]);

            if ($request->hasFile('image') && @$request->image) {
                // delete old image
                if ($outletGroup->imageUrl) {
                    $outletGroup->clearMediaCollection('image');
                }

                $this->imageCompressionService->compress($request->file('image'));
                $outletGroup->addMedia($request->file('image'))->toMediaCollection('image');

            }

            // Sync selected outlets
            $outletGroup->members()->sync($request->outlets ?? []);

            DB::commit();

            notyf("Outlet Group berhasil diupdate");
            return redirect()->route('spinotek.outlet-groups.index');
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Outlet Group gagal diupdate");
            return redirect()->back();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(OutletGroup $outletGroup)
    {
        try {
            // check if outlet group has outlets
            if ($outletGroup->members()->count() > 0) {
                notyf("Outlet Group gagal dihapus, karena memiliki outlet");
                return redirect()->back();
            }

            DB::beginTransaction();

            // delete image
            $outletGroup->clearMediaCollection('image');

            $outletGroup->delete();

            DB::commit();

            notyf("Outlet Group berhasil dihapus");
            return redirect()->route('spinotek.outlet-groups.index');
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Outlet Group gagal dihapus");
            return redirect()->back();
        }
    }
}
