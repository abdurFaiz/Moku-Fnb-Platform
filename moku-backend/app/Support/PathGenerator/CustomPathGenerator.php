<?php

namespace App\Support\PathGenerator;

use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\MediaLibrary\Support\PathGenerator\DefaultPathGenerator;

class CustomPathGenerator extends DefaultPathGenerator
{
    /*
     * Get the path for the given media, relative to the root storage path.
     */
    public function getPath(Media $media): string
    {
        $path = match ($media->collection_name) {
            'banners' => 'banners/',
            'logo' => 'logo-outlets/',
            'avatar' => 'avatars/',
            default => $media->collection_name . '/',
        };

        return $path . $media->id . '/';
    }
}
