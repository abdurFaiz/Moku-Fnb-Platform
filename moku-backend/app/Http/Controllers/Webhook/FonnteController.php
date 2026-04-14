<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\FonnteService;
use Illuminate\Http\Request;

class FonnteController extends Controller
{
    public $fonnteService;

    public function __construct(FonnteService $fonnteService)
    {
        $this->fonnteService = $fonnteService;
    }

    public function handle(Request $request)
    {
        $message = $request->input('message');
        $sender = $request->input('sender');

        if (empty($sender) || empty($message)) {
            return response()->json(['status' => 'error', 'message' => 'Data tidak lengkap']);
        }
        
        // Check if message contains 'login' or 'register'
        $lowerMessage = strtolower($message);
        if (!str_contains($lowerMessage, 'login') && !str_contains($lowerMessage, 'register')) {
            return response()->json(['status' => 'ignored', 'message' => 'Pesan tidak mengandung kata login atau register']);
        }

        // Normalize phone number
        $senderNormalized = normalizePhoneNumber($sender);

        // search user by phone number
        $user = User::where('phone', $senderNormalized)->first();

        if (!$user) {
            // If user not found, send link to register user
            $this->fonnteService->sendWhatsAppMessage($senderNormalized, 'Selamat datang di Self-Ordering, silahkan daftar di ' . env('FE_APP_URL') . '/register');
            return response()->json(['status' => 'success', 'message' => 'Link pendaftaran terkirim']);
        }

        // if user found, send message login and create token access user
        $token = $user->createToken('auth-token');
        $refreshToken = $user->createToken('refresh-token', ['refresh-token'])->plainTextToken;

        $response = $this->fonnteService->sendWhatsAppMessage(
            $senderNormalized,
            'Selamat datang kembali! Silakan kunjungi ' . env('FE_APP_URL') . '/login?token=' . $token->plainTextToken
        );

        return response()->json([
            $response,
        ]);
    }
}
