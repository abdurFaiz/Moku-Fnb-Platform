import type { AuthResponse } from "@/features/profile/types/Auth";

export const transformAuthResponse = (responseData: AuthResponse) => {
    return {
        access_token: responseData.data.access_token,
        refresh_token: responseData.data.refresh_token,
        user: transformUserData(responseData.data.user),
        total_point: responseData.data.total_point,
        total_order: responseData.data.total_order,
        total_user_voucher: responseData.data.total_user_voucher,
    };
};

export const transformUserData = (userData: AuthResponse['data']['user']) => {
    return {
        id: userData.id,
        uuid: userData.uuid,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        avatar_url: userData.avatar_url,
        short_name: userData.short_name,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
        customer_profile: transformCustomerProfile(userData.customer_profile),
    };
};

export const transformCustomerProfile = (profileData: AuthResponse['data']['user']['customer_profile']) => {
    return {
        id: profileData.id,
        uuid: profileData.uuid,
        job: profileData.job,
        date_birth: profileData.date_birth,
        gender: profileData.gender,
        user_id: profileData.user_id,
        avatar: profileData.avatar,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
    };
};

export const extractUserFromAuthResponse = (responseData: AuthResponse) => {
    return transformUserData(responseData.data.user);
};