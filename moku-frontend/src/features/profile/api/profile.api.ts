import { axiosInstance } from "@/lib/axios";
import type { FormValues } from "../schemas";
import type { AuthResponse } from "../types/Auth";

const genderToNumber = (gender: string | undefined): number | undefined => {
    if (!gender) return undefined;
    return gender === 'male' ? 1 : 2;
};
export const ProfileApi = new (class {
    async updateProfile(data: FormValues): Promise<AuthResponse> {
        const formData = new FormData();

        // Add required fields
        formData.append('name', data.name);
        formData.append('phone', data.phone);

        // Only include optional fields if they have values
        if (data.date_birth) {
            formData.append('date_birth', data.date_birth);
        }
        if (data.gender) {
            formData.append('gender', genderToNumber(data.gender)!.toString());
        }
        if (data.job) {
            formData.append('job', data.job);
        }
        if (data.avatar instanceof File) {
            formData.append('avatar', data.avatar);
        }

        const response = await axiosInstance.post("/customer-profile", formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    // Logout user
    async logout(): Promise<{ status: string; message: string }> {
        const response = await axiosInstance.post("logout");
        return response.data;
    }

    // Get current user profile
    async getProfile(outletSlug: string): Promise<AuthResponse> {
        const response = await axiosInstance.get(`/outlet/${outletSlug}/customer-profile`);
        return response.data;
    }

})();
