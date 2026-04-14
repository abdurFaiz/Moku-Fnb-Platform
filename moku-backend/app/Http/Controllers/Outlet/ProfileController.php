<?php

namespace App\Http\Controllers\Outlet;

use App\Http\Controllers\Controller;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProfileController extends Controller
{
    protected ImageCompressionService $imageCompressionService;

    public function __construct(ImageCompressionService $imageCompressionService)
    {
        $this->imageCompressionService = $imageCompressionService;
    }

    public function index()
    {
        $user = auth()->user();

        $data = [
            'user' => $user,
        ];

        return view('pages.outlets.settings.profile', $data);
    }

    public function update(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'password' => 'nullable|string|min:8',
        ]);

        try {
            DB::beginTransaction();
            $user = auth()->user();

            $user->name = $request->input('name');

            if ($request->hasFile('avatar') && @$request->avatar) {
                $user->clearMediaCollection('avatar');

                $this->imageCompressionService->compress($request->file('avatar'));
                $user->addMediaFromRequest('avatar')->toMediaCollection('avatar');
            }

            if ($request->password) {
                $user->password = \Illuminate\Support\Facades\Hash::make($request->password);
            }

            $user->save();

            DB::commit();

            notyf('Profil berhasil diperbarui');

            return redirect()->back();
        } catch (\Throwable $th) {
            DB::rollBack();

            if (app()->environment('local')) {
                throw $th;
            }

            notyf('Profil gagal diperbarui');

            return redirect()->back();
        }
    }
}
