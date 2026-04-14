<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function logout(Request $request)
    {
        // Logout user
        auth()->logout();

        // Hapus semua session outlet-nya
        $request->session()->flush();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        notyf()->addSuccess('Anda berhasil keluar.');
        
        // return to login page
        return redirect()->route('login');
    }
}
