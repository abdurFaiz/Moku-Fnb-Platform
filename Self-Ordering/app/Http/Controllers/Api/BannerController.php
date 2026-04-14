<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseFormatter;
use App\Http\Controllers\Controller;
use App\Models\Outlet;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function index(Outlet $outlet)
    {
        $banners = $outlet->banners()->with(['media'])->isPublished()->select('id', 'link', 'outlet_id')->get();
        $banners->append(['banner_url']);

        return ResponseFormatter::success([
            'banners' => $banners,
        ]);
    }
}
