<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ImageController extends Controller
{
    /**
     * Download image from URL
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function download(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
        ]);

        $url = $request->input('url');

        try {
            $response = Http::get($url);

            if ($response->successful()) {
                $content = $response->body();
                $mimeType = $response->header('Content-Type');
                $filename = basename(parse_url($url, PHP_URL_PATH));

                // If filename is empty or invalid, generate a random one
                if (!$filename || $filename === '/') {
                    $extension = explode('/', $mimeType)[1] ?? 'jpg';
                    $filename = 'image_' . time() . '.' . $extension;
                }

                return response($content)
                    ->header('Content-Type', $mimeType)
                    ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
            }

            return ResponseFormatter::error(null, 'Failed to fetch image from URL', 400);
        } catch (\Exception $e) {
            return ResponseFormatter::error(null, 'Error downloading image: ' . $e->getMessage(), 500);
        }
    }
}
