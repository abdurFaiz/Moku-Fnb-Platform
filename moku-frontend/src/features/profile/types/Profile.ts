export interface CustomerProfileResponse {
    status: string;
    message: string;
    data: {
        user: User;
    };
}

export interface User {
    id: number;
    uuid: string;
    name: string;
    email: string | null;
    phone: string;
    avatar_url: string;
    email_verified_at: string | null;
    pin: string | null;
    outlet_id: number | null;
    created_at: string;
    updated_at: string;
    customer_profile: CustomerProfile;
}
export interface CustomerProfile {
    id: number;
    uuid: string;
    gender: string | null;
    job: string;
    date_birth: string;
    user_id: number;
    avatar: string | null;
    created_at: string;
    updated_at: string;
}