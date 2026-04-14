<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class FonnteService
{
    public $base_url;

    public function __construct()
    {
        $this->base_url = config('fonnte.base_url');
    }

    protected function makeRequest($endpoint, $params = [], $token)
    {
        // Gunakan JSON format dan pastikan Content-Type header benar
        $response = Http::withHeaders([
            'Authorization' => $token,
            'Content-Type'  => 'application/json', // Tambahkan header
        ])->post($endpoint, $params);

        if ($response->failed()) {
            return [
                'status' => false,
                'error'  => $response->json()['reason'] ?? 'Unknown error occurred',
            ];
        }

        return [
            'status' => true,
            'data'   => $response->json(),
        ];
    }

    public function sendWhatsAppMessage($phoneNumber, $message)
    {
        return $this->makeRequest($this->base_url . '/send', [
            'target'  => $phoneNumber,
            'message' => $message,
        ], config('fonnte.api_key'));
    }
}
