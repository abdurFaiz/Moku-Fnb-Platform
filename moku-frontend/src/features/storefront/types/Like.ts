export interface LikeResponse {
    status: string;
    message: string;
    data: LikeData;
}

export interface LikeData {
    product_uuid: string;
    is_liked: boolean;
    likes_count: number;
}

