export interface MediaItem {
    id: number
    model_type: string
    model_id: number
    uuid: string
    collection_name: string
    name: string
    file_name: string
    mime_type: string
    disk: string
    conversions_disk: string
    size: number
    manipulations: any[]
    custom_properties: any[]
    generated_conversions: any[]
    responsive_images: any[]
    order_column: number
    created_at: string
    updated_at: string
    original_url: string
    preview_url: string
}

export interface Banner {
    id: number
    link: string
    outlet_id: number
    banner_url: string
    media: MediaItem[]
}

export interface BannerData {
    banners: Banner[]
}

export interface BannerResponse {
    status: string
    message: string
    data: BannerData
}
