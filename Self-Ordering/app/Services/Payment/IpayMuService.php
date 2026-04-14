<?php

namespace App\Services\Payment;

class IpayMuService
{
    public $baseUrl;

    public function __construct()
    {
        $this->baseUrl = env('IPAYMU_HOST'); // Menggunakan IPAYMU_HOST sesuai permintaan sebelumnya
    }

    public function header($body, $method = 'POST')
    {
        $va = env('IPAYMU_VA'); // Menggunakan IPAYMU_VA sesuai permintaan sebelumnya
        $secret = env('IPAYMU_SECRET'); // Menggunakan IPAYMU_SECRET sesuai permintaan sebelumnya

        // *Don't change this
        if ($body) {
            $jsonBody = json_encode($body, JSON_UNESCAPED_SLASHES);
        } else {
            $jsonBody = '{}';
        }
        $requestBody = strtolower(hash('sha256', $jsonBody));
        $stringToSign = strtoupper($method).':'.$va.':'.$requestBody.':'.$secret;
        $signature = hash_hmac('sha256', $stringToSign, $secret);
        $timestamp = date('YmdHis');
        // End Generate Signature

        return [
            'signature' => $signature,
            'timestamp' => $timestamp,
            'va' => $va,
            'body' => $body,
        ];
    }

    public function send($endPoint, $body, $contentType = 'application/json', $method = 'POST') // Default content type ke application/json
    {
        $header = $this->header($body, $method);

        $curl = curl_init();

        $httpHeader = [
            'Content-Type: '.$contentType,
            'signature: '.$header['signature'],
            'va: '.env('IPAYMU_VA'), // Menggunakan IPAYMU_VA
            'timestamp: '.$header['timestamp'],
        ];

        // Jika content type adalah multipart/form-data, hapus Content-Type dari header
        if ($contentType == 'multipart/form-data') {
            $httpHeader = array_filter($httpHeader, function ($h) {
                return strpos($h, 'Content-Type') === false;
            });
        }

        curl_setopt_array($curl, [
            CURLOPT_URL => $this->baseUrl.$endPoint,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
            CURLOPT_POSTFIELDS => $contentType == 'application/json' ? json_encode($header['body']) : $header['body'], // Sesuaikan pengiriman body
            CURLOPT_HTTPHEADER => $httpHeader,
        ]);

        $response = curl_exec($curl);
        curl_close($curl);
        $res = json_decode($response, true);

        return $res;
    }
}
