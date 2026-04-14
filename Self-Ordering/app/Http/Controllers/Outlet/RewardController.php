<?php

namespace App\Http\Controllers\Outlet;

use App\Enums\VoucherClaimTypeEnum;
use App\Enums\VoucherPriceTypeEnum;
use App\Enums\VoucherTypeEnum;
use App\Helpers\GeneratingHelper;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\Product;
use App\Models\Reward;
use App\Models\Voucher;
use App\Models\VoucherProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class RewardController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Outlet $outlet)
    {
        $param = request()->query();

        $rewards = Reward::with(['voucher', 'product'])
            ->where('outlet_id', $outlet->id)
            ->filter($param)
            ->paginate(maxRowParams());

        $data = [
            'rewards' => $rewards,
        ];

        return view('pages.outlets.reward.index', $data);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(Outlet $outlet)
    {
        $reward = Reward::where('outlet_id', $outlet->id)->get();
        $voucherIdPluck = $reward->pluck('voucher_id');
        $productIdPluck = $reward->where('product_id', '!=', null)->pluck('product_id');

        $data = [
            'action' => route('outlets.rewards.store', $outlet->slug),
            'products' => Product::where('outlet_id', $outlet->id)->whereNotIn('id', $productIdPluck)->get(),
            'vouchers' => Voucher::where('outlet_id', $outlet->id)->isPrivate()->whereNotIn('id', $voucherIdPluck)->get(),
        ];

        return view('pages.outlets.reward.create', $data);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, Outlet $outlet)
    {
        try {
            DB::beginTransaction();

            $validated = $request->validate([
                'point' => 'required|array|min:1',
                'point.*' => 'required|integer|min:0',
                'reward_type' => 'required|array|min:1',
                'reward_type.*' => ['required', 'string', Rule::in(['voucher', 'product'])],
                'reward_id' => 'required|array|min:1',
                'reward_id.*' => 'required|integer|min:0',
            ]);

            // check if reward_id, reward_type, and point have the same count
            if (
                count($validated['reward_id']) !== count($validated['reward_type']) ||
                count($validated['reward_id']) !== count($validated['point'])   
            ) {
                throw ValidationException::withMessages([
                    'reward_id' => 'Data reward tidak valid.',
                ]);
            }

            // format validated data
            $rows = collect($validated['reward_id'])->map(function ($id, $index) use ($validated) {
                $rawType = $validated['reward_type'][$index];

                return [
                    'reward_type' => $rawType,
                    'voucher_id' => $rawType === 'voucher' ? $id : null,
                    'product_id' => $rawType === 'product' ? $id : null,
                    'point' => (int) $validated['point'][$index],
                ];
            });

            // check if reward_type is valid
            if ($rows->contains(fn ($row) => empty($row['reward_type']))) {
                throw ValidationException::withMessages([
                    'reward_type' => 'Tipe reward tidak valid.',
                ]);
            }

            $createdRewards = [];

            foreach ($rows as $row) {
                if($row['reward_type'] == 'voucher') {
                    $voucher = Voucher::findOrFail($row['voucher_id']);

                    // create reward
                    Reward::updateOrCreate(
                        [
                            'voucher_id' => $voucher->id,
                            'outlet_id' => $outlet->id,
                        ],
                        [
                            'name' => $voucher->name,
                            'point' => $row['point'],
                        ]
                    );
                } else {
                    $product = Product::findOrFail($row['product_id']);

                    // check product
                    $checkReward = Reward::where('outlet_id', $outlet->id)
                        ->where('product_id', $product->id)
                        ->first();

                    if($checkReward) {
                        notyf()->error('Produk ' . $product->name . ' terduplikat, silahkan periksa kembali');

                        throw ValidationException::withMessages([
                            'product_id' => 'Produk ' . $product->name . ' sudah memiliki reward.',
                        ]);
                    }

                    // create voucher
                    $voucher = Voucher::create([
                        'name' => 'Voucher ' . $product->name,
                        'code' => GeneratingHelper::generateMixedCode('vouchers'),
                        'price_type' => VoucherPriceTypeEnum::PERCENT,
                        'claim_type' => VoucherClaimTypeEnum::PLATFORM,
                        'outlet_id' => $outlet->id,
                        'discount_percent' => 100,
                        'type' => VoucherTypeEnum::PRIVATE,
                        'is_active' => true,
                        'is_hidden' => true,
                    ]);

                    // create voucher product
                    VoucherProduct::create([
                        'voucher_id' => $voucher->id,
                        'product_id' => $product->id,
                    ]);

                    // create reward
                    Reward::create([
                        'name' => $product->name,
                        'point' => $row['point'],
                        'voucher_id' => $voucher->id,
                        'product_id' => $product->id,
                        'outlet_id' => $outlet->id,
                    ]);
                }

                $createdRewards[] = @$product->name ?? @$voucher->name;
            }

            DB::commit();

            if (count($createdRewards) === 1) {
                notyf("Reward {$createdRewards[0]} berhasil dibuat");
            } else {
                notyf(count($createdRewards) . ' reward berhasil dibuat');
            }
            return redirect()->route('outlets.rewards.index', [$outlet->slug]);
        } catch (ValidationException $e) {
            DB::rollBack();

            throw $e;
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Reward gagal dibuat");
            return redirect()->back()->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Reward $reward)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Outlet $outlet, Reward $reward)
    {
        $voucherIdPluck = $reward->where('id', '!=', $reward->voucher_id)->pluck('voucher_id');
        $productIdPluck = $reward->where('product_id', '!=', null)->where('id', '!=', $reward->id)->pluck('product_id');

        $data = [
            'title' => 'Edit Reward',
            'action' => route('outlets.rewards.update', [$outlet->slug, $reward->id]),
            'products' => Product::where('outlet_id', $outlet->id)->whereNotIn('id', $productIdPluck)->get(),
            'vouchers' => Voucher::where('outlet_id', $outlet->id)->isPrivate()->whereNotIn('id', $voucherIdPluck)->get(),
            'reward' => $reward->load(['voucher', 'product']),
        ];

        return view('pages.outlets.reward.form', $data);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Outlet $outlet, Reward $reward)
    {
        try {
            DB::beginTransaction();

            $request->validate([
                'point' => 'required|integer|min:0',
            ]);


            $reward->update([
                'point' => $request->point,
            ]);

            DB::commit();

            notyf("Reward $reward->name berhasil diupdate");
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Reward gagal diupdate");
            return redirect()->back();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Outlet $outlet, Reward $reward)
    {
        try {
            DB::beginTransaction();

            $voucher = Voucher::where('id', $reward->voucher_id)->firstOrFail();
            $reward->delete();

            if ($reward->product_id != null) {                
                $voucher->voucherProducts()->delete();
                $voucher->delete();
            }

            DB::commit();

            notyf("Reward $reward->name berhasil dihapus");
            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf("Reward gagal dihapus");
            return redirect()->back();
        }
    }
}
