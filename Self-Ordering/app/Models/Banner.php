<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class Banner extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'link',
        'is_published',
        'outlet_id',
    ];

    public function outlet()
    {
        return $this->belongsTo(Outlet::class);
    }

    public function bannerUrl(): Attribute
    {
        return Attribute::make(
            get: fn() => $this->hasMedia('banners') ? $this->getFirstMediaUrl('banners') : asset('assets/images/logo/spinotek_logo.svg'),
        );
    }

    public function scopeIsPublished($query)
    {
        return $query->where('is_published', 1);
    }
}
