<?php
namespace App\Services;

use App\Models\Banner;
use App\Models\Outlet;
use App\Services\ImageCompressionService;
use Illuminate\Http\Request;

class BannerService
{
    protected ImageCompressionService $imageCompressionService;

    public function __construct(ImageCompressionService $imageCompressionService)
    {
        $this->imageCompressionService = $imageCompressionService;
    }

    public function rules()
    {
        return [
            'link' => 'required|string',
            'banner' => request()->isMethod('post') ? 'required|image|mimes:jpeg,png,jpg|max:2048' : 'image|mimes:jpeg,png,jpg|max:2048',
        ];
    }

    public function store(Request $request, Outlet $outlet)
    {
        $request->validate($this->rules());

        $banner = $outlet->banners()->create([
            'link' => $request->link,
        ]);

        if ($request->hasFile('banner')) {
            $this->imageCompressionService->compress($request->file('banner'));
            $banner->addMediaFromRequest('banner')->toMediaCollection('banners');
        }
    }

    public function update(Request $request, Banner $banner)
    {
        $request->validate($this->rules());

        $banner->update([
            'link' => $request->link,
        ]);

        if ($request->hasFile('banner')) {
            $this->imageCompressionService->compress($request->file('banner'));
            $banner->clearMediaCollection('banners');
            $banner->addMediaFromRequest('banner')->toMediaCollection('banners');
        }
    }

    public function destroy(Banner $banner)
    {
        $banner->clearMediaCollection('banners');
        $banner->delete();
    }
}