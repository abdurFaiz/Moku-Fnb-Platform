<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class ImageCompressionService
{
    /**
     * Compress and resize image using native GD
     * 
     * @param \Illuminate\Http\UploadedFile $file
     * @param int $maxWidth
     * @param int $quality
     * @return void
     */
    public function compress($file, $maxWidth = 1000, $quality = 60)
    {
        try {
            $sourcePath = $file->getPathname();
            $info = getimagesize($sourcePath);

            if (!$info) return;

            $mime = $info['mime'];
            $image = null;

            switch ($mime) {
                case 'image/jpeg':
                    $image = imagecreatefromjpeg($sourcePath);
                    break;
                case 'image/png':
                    $image = imagecreatefrompng($sourcePath);
                    break;
                case 'image/gif':
                    $image = imagecreatefromgif($sourcePath);
                    break;
            }

            if (!$image) return;

            // Resize if needed
            $maxHeight = $maxWidth; // Square constraint
            $width = imagesx($image);
            $height = imagesy($image);

            if ($width > $maxWidth || $height > $maxHeight) {
                $ratio = $width / $height;
                if ($maxWidth / $maxHeight > $ratio) {
                    $newWidth = $maxHeight * $ratio;
                    $newHeight = $maxHeight;
                } else {
                    $newHeight = $maxWidth / $ratio;
                    $newWidth = $maxWidth;
                }

                $newImage = imagecreatetruecolor($newWidth, $newHeight);

                // Handle transparency
                if ($mime == 'image/png' || $mime == 'image/gif') {
                    $transparency = imagecolortransparent($image);
                    if ($transparency >= 0) {
                        $transparentColor = imagecolorsforindex($image, $transparency);
                        $transparencyIndex = imagecolorallocate($newImage, $transparentColor['red'], $transparentColor['green'], $transparentColor['blue']);
                        imagefill($newImage, 0, 0, $transparencyIndex);
                        imagecolortransparent($newImage, $transparencyIndex);
                    } elseif ($mime == 'image/png') {
                        imagealphablending($newImage, false);
                        imagesavealpha($newImage, true);
                        $transparent = imagecolorallocatealpha($newImage, 255, 255, 255, 127);
                        imagefilledrectangle($newImage, 0, 0, $newWidth, $newHeight, $transparent);
                    }
                }

                imagecopyresampled($newImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
                imagedestroy($image);
                $image = $newImage;
            }

            // Save compressed
            if ($mime === 'image/jpeg') {
                imagejpeg($image, $sourcePath, $quality);
            } elseif ($mime === 'image/png') {
                imagealphablending($image, false);
                imagesavealpha($image, true);
                imagepng($image, $sourcePath, 9); // Max compression for PNG
            } elseif ($mime === 'image/gif') {
                imagegif($image, $sourcePath);
            }

            imagedestroy($image);
        } catch (\Throwable $th) {
            Log::error('ImageCompressionService failed: ' . $th->getMessage());
        }
    }
}
