<?php

namespace App\Actions;

use Illuminate\Support\Facades\Storage;

class UploadStorageAction
{
    /**
     * Get url
     */
    public function url($path)
    {
        return Storage::disk(config('services.diskname'))->url($path);
    }

    /**
     * Store image to storage
     */
    public function store($path, $image)
    {
        return Storage::disk(config('services.diskname'))->put($path, $image);
    }

    /**
     * Delete image from storage
     */
    public function delete($image)
    {
        if ($image) Storage::disk(config('services.diskname'))->delete($image);
    }
}
