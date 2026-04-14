<?php

namespace App\Http\Controllers\Spinotek;

use App\Enums\ProductAttributeDisplayTypeEnum;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\OutletGroup;
use App\Models\ProductAttribute;
use App\Models\ProductAttributeValue;
use App\Models\User;
use App\Services\ImageCompressionService;
use App\Services\Merchant\IpaymuMerchantService;
use App\Services\OperationalScheduleService;
use App\Services\OutletDuplicationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

use function Flasher\Notyf\Prime\notyf;

class OutletController extends Controller
{
    protected OperationalScheduleService $scheduleService;
    protected OutletDuplicationService $duplicationService;
    protected ImageCompressionService $imageCompressionService;
    protected IpaymuMerchantService $ipaymuMerchantService;

    public function __construct(
        OperationalScheduleService $scheduleService,
        OutletDuplicationService $duplicationService,
        ImageCompressionService $imageCompressionService,
        IpaymuMerchantService $ipaymuMerchantService
    ) {
        $this->scheduleService = $scheduleService;
        $this->duplicationService = $duplicationService;
        $this->imageCompressionService = $imageCompressionService;
        $this->ipaymuMerchantService = $ipaymuMerchantService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $query = request()->query();

        $outlets = Outlet::filter($query)->latest()->paginate(maxRowParams());

        $data = [
            'outlets' => $outlets,
            'allOutlets' => Outlet::select('id', 'name')->get(),
        ];

        return view('pages.spinotek.outlets.index', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $outletGroups = OutletGroup::all();

        $data = [
            'title' => 'Tambah Outlet',
            'action' => route('spinotek.outlets.store'),
            'outletGroups' => $outletGroups,
        ];

        return view('pages.spinotek.outlets.form', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'slug' => 'required|unique:outlets,slug',
            'email' => 'required|email|unique:outlets,email',
            'phone' => 'required|numeric|unique:outlets,phone',
            'address' => 'required',
            'map' => 'required',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $request->merge([
                'phone' => normalizePhoneNumber($request->phone),
            ]);

            $outlet = Outlet::create([
                'name' => $request->name,
                'slug' => $request->slug,
                'email' => $request->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'map' => $request->map,
            ]);

            if ($request->hasFile('logo') && @$request->logo) {
                $this->imageCompressionService->compress($request->file('logo'));
                $outlet->addMedia($request->file('logo'))->toMediaCollection('logo');
            }

            // create operational schedule
            $this->scheduleService->create($outlet, $request->operational_schedules);

            // create default attribute product
            $dataAttribute = [
                [
                    'name' => 'Minuman Panas',
                    'outlet_id' => $outlet->id,
                    'display_type' => ProductAttributeDisplayTypeEnum::PILLBADGE,
                    'values' => [
                        [
                            'name' => 'Hot',
                            'extra_price' => 0,
                        ]
                    ],
                ],
                [
                    'name' => 'Minuman Dingin',
                    'outlet_id' => $outlet->id,
                    'display_type' => ProductAttributeDisplayTypeEnum::PILLBADGE,
                    'values' => [
                        [
                            'name' => 'Cold',
                            'extra_price' => 0,
                        ]
                    ],
                ],
                [
                    'name' => 'Minuman Panas Dan Dingin',
                    'outlet_id' => $outlet->id,
                    'display_type' => ProductAttributeDisplayTypeEnum::PILLBADGE,
                    'values' => [
                        [
                            'name' => 'Cold',
                            'extra_price' => 0,
                        ],
                        [
                            'name' => 'Hot',
                            'extra_price' => 0,
                        ],
                    ],
                ]
            ];

            foreach ($dataAttribute as $attribute) {
                $productAttribute = ProductAttribute::create([
                    'name' => $attribute['name'],
                    'outlet_id' => $attribute['outlet_id'],
                    'display_type' => $attribute['display_type']
                ]);

                foreach ($attribute['values'] as $value) {
                    ProductAttributeValue::create([
                        'name' => $value['name'],
                        'extra_price' => $value['extra_price'],
                        'product_attribute_id' => $productAttribute->id,
                        'outlet_id' => $productAttribute->outlet_id
                    ]);
                }
            }

            // Sync outlet groups
            if ($request->has('outlet_groups')) {
                $outlet->groups()->sync($request->outlet_groups);
            }

            // store data merchant ipaymu
            $merchantStatus = $this->ipaymuMerchantService->registerMerchant($outlet);

            if (!$merchantStatus['status']) {
                notyf('Akun Ipaymu Outlet Gagal dibuat: ' . $merchantStatus['message'], 'error');
            } else {
                notyf('Akun Ipaymu Outlet Berhasil di Buat');
            }

            DB::commit();

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Outlet berhasil ditambahkan',
                    'data' => $outlet
                ]);
            }

            notyf("Outlet berhasil ditambahkan");
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            if ($request->wantsJson()) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Outlet gagal ditambahkan',
                    'error' => $th->getMessage()
                ], 500);
            }

            notyf("Outlet gagal ditambahkan", 'error');
            return redirect()->back();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Outlet $outlet)
    {
        $query = request()->query();

        $cashiers = User::where('outlet_id', $outlet->id)->filter($query)->latest()->paginate(maxRowParams());

        // show cashier
        $data = [
            'outlet' => $outlet,
            'cashiers' => $cashiers,
        ];

        return view('pages.spinotek.outlets.cashiers.index', $data);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Outlet $outlet)
    {
        $outletGroups = OutletGroup::all();

        $data = [
            'title' => 'Edit Outlet',
            'action' => route('spinotek.outlets.update', $outlet->id),
            'outlet' => $outlet,
            'outletGroups' => $outletGroups,
        ];

        return view('pages.spinotek.outlets.form', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outlet $outlet)
    {
        $request->validate([
            'name' => 'required',
            'slug' => 'required|unique:outlets,slug,' . $outlet->id,
            'email' => 'required|email|unique:outlets,email,' . $outlet->id,
            'phone' => 'required|unique:outlets,phone,' . $outlet->id,
            'va_name' => 'required',
            'va_number' => 'required',
            'address' => 'required',
            'map' => 'required',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        try {
            DB::beginTransaction();

            $request->merge([
                'phone' => normalizePhoneNumber($request->phone),
            ]);

            $outlet->update([
                'name' => $request->name,
                'slug' => $request->slug,
                'email' => $request->email,
                'phone' => $request->phone,
                'va_name' => $request->va_name,
                'va_number' => $request->va_number,
                'address' => $request->address,
                'map' => $request->map,
            ]);

            if ($request->hasFile('logo') && @$request->logo) {
                // delete old logo
                $outlet->clearMediaCollection('logo');

                $this->imageCompressionService->compress($request->file('logo'));
                $outlet->addMedia($request->file('logo'))->toMediaCollection('logo');
            }

            // Sync outlet groups
            if ($request->has('outlet_groups')) {
                $outlet->groups()->sync($request->outlet_groups);
            }

            DB::commit();

            notyf("Outlet berhasil diupdate");
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Outlet gagal diupdate");
            return redirect()->back();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Outlet $outlet)
    {
        try {
            // check if outlet has users
            if ($outlet->users()->count() > 0) {
                notyf("Outlet gagal dihapus, karena memiliki pengguna");
                return redirect()->back();
            }

            DB::beginTransaction();

            // delete old logo
            $outlet->clearMediaCollection('logo');

            $outlet->delete();

            DB::commit();

            notyf("Outlet berhasil dihapus");
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Outlet gagal dihapus");
            return redirect()->back();
        }
    }
    public function duplicate(Request $request)
    {
        $request->validate([
            'source_outlet_id' => 'required|exists:outlets,id',
            'target_outlet_id' => 'required|exists:outlets,id|different:source_outlet_id',
            'options' => 'required|array',
        ]);

        try {
            $sourceOutlet = Outlet::findOrFail($request->source_outlet_id);
            $targetOutlet = Outlet::findOrFail($request->target_outlet_id);

            $this->duplicationService->duplicate($sourceOutlet, $targetOutlet, $request->options);

            notyf("Data berhasil diduplikasi");
            return redirect()->back();
        } catch (\Throwable $th) {
            if (app()->environment('local')) {
                throw $th;
            }
            notyf("Data gagal diduplikasi: " . $th->getMessage());
            return redirect()->back();
        }
    }
}
