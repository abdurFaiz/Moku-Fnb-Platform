<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class OutletGroup extends Model implements HasMedia
{
    use InteractsWithMedia;

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    /**
     * Get the image URL attribute.
     */
    public function getImageUrlAttribute()
    {
        return $this->getFirstMediaUrl('image');
    }

    /**
     * Register media collections.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('image')
            ->singleFile();
    }

    public function outlets()
    {
        return $this->hasMany(Outlet::class, 'outlet_group_id');
    }

    public function members()
    {
        return $this->belongsToMany(Outlet::class, 'outlet_group_members', 'outlet_group_id', 'outlet_id')
            ->withTimestamps();
    }

    public function outletGroupMembers()
    {
        return $this->hasMany(OutletGroupMember::class);
    }

    public function scopeFilter($query, $filters)
    {
        return $query->when($filters['search'] ?? null, function ($query, $search) {
            $query->whereHas('outlets', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            });
        });
    }
}
