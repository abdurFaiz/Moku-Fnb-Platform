<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Outlet;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\Request;

class OutletLoginController extends Controller
{
    public function index(Outlet $outlet)
    {
        return view('pages.outlets.auth.login', compact('outlet'));
    }

    public function authenticate(Request $request, Outlet $outlet)
    {
        // Validasi input
        $request->validate([
            'pin' => ['required', 'digits:6'],
        ]);

        // Key untuk rate limiter berdasarkan IP + outlet
        $key = 'login-attempts:' . $outlet->id . ':' . $request->ip();

        // Cek apakah sudah terlalu banyak percobaan login
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            throw ValidationException::withMessages([
                'pin' => "Terlalu banyak percobaan login. Coba lagi dalam $seconds detik.",
            ]);
        }

        // Cari user berdasarkan outlet_id dan pin
        $user = User::where('outlet_id', $outlet->id)->get()
            ->first(function ($u) use ($request) {
                return Hash::check($request->pin, $u->pin);
            });

        // Validasi PIN
        if (!$user) {
            // Tambah hit ke rate limiter
            RateLimiter::hit($key, 60); // 60 detik timeout

            throw ValidationException::withMessages([
                'pin' => 'PIN salah atau tidak ditemukan.',
            ]);
        }


        // Jika berhasil, hapus limit dan login
        RateLimiter::clear($key);
        Auth::login($user);

        notyf("Selamat Anda berhasil masuk.");
        return to_route('outlets.dashboard', $outlet->slug);
    }

    public function logout(Request $request, Outlet $outlet)
    {
        // Logout user
        auth()->logout();

        // Hapus semua session outlet-nya
        $request->session()->flush();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        notyf()->addSuccess('Anda berhasil keluar.');

        // Redirect ke halaman login outlet terkait
        // return redirect()->route('outlets.login', ['outlet' => $outlet->slug]);
        
        // return to login page
        return redirect()->route('login');
    }
}
