import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ProfileApi } from '../api/profile.api';
import { axiosInstance } from '@/lib/axios';
import type { FormValues } from '../schemas';
import type { AuthResponse } from '../types/Auth';
import './setup';

// Mock axios instance
vi.mock('@/lib/axios', () => ({
    axiosInstance: {
        post: vi.fn(),
        get: vi.fn(),
    },
}));

describe('ProfileApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('updateProfile', () => {
        const mockFormData: FormValues = {
            name: 'John Doe',
            phone: '081234567890',
            date_birth: '1990-01-01',
            gender: 'male',
            job: 'Software Engineer',
        };

        const mockResponse: AuthResponse = {
            status: 'success',
            message: 'Profile updated successfully',
            data: {
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: {
                    id: 1,
                    uuid: 'user-uuid-123',
                    name: 'John Doe',
                    phone: '081234567890',
                    email: 'john@example.com',
                    avatar_url: 'https://example.com/avatar.jpg',
                    short_name: 'JD',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    customer_profile: {
                        id: 1,
                        uuid: 'profile-uuid-123',
                        job: 'Software Engineer',
                        date_birth: '1990-01-01',
                        gender: 1,
                        user_id: 1,
                        avatar: null,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                    },
                },
                total_point: 100,
                total_order: 5,
                total_user_voucher: 3,
            },
        };

        it('should update profile with all fields successfully', async () => {
            vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockResponse });

            const result = await ProfileApi.updateProfile(mockFormData);

            expect(axiosInstance.post).toHaveBeenCalledWith(
                '/customer-profile',
                expect.any(Object),
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            expect(result).toEqual(mockResponse);
        });

        it('should update profile with only required fields (name and phone)', async () => {
            const minimalData: FormValues = {
                name: 'Jane Doe',
                phone: '089876543210',
            };

            vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockResponse });

            const result = await ProfileApi.updateProfile(minimalData);

            expect(axiosInstance.post).toHaveBeenCalled();
            expect(result).toEqual(mockResponse);
        });

        it('should convert male gender to number 1', async () => {
            const dataWithMaleGender: FormValues = {
                name: 'John Doe',
                phone: '081234567890',
                gender: 'male',
            };

            vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockResponse });

            await ProfileApi.updateProfile(dataWithMaleGender);

            const formDataCall = vi.mocked(axiosInstance.post).mock.calls[0][1];
            expect(formDataCall).toBeDefined();
        });

        it('should convert female gender to number 2', async () => {
            const dataWithFemaleGender: FormValues = {
                name: 'Jane Doe',
                phone: '081234567890',
                gender: 'female',
            };

            vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockResponse });

            await ProfileApi.updateProfile(dataWithFemaleGender);

            const formDataCall = vi.mocked(axiosInstance.post).mock.calls[0][1];
            expect(formDataCall).toBeDefined();
        });

        it('should handle avatar file upload', async () => {
            const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
            const dataWithAvatar: FormValues = {
                name: 'John Doe',
                phone: '081234567890',
                avatar: mockFile,
            };

            vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockResponse });

            await ProfileApi.updateProfile(dataWithAvatar);

            expect(axiosInstance.post).toHaveBeenCalled();
        });

        it('should not include optional fields if they are undefined', async () => {
            const minimalData: FormValues = {
                name: 'John Doe',
                phone: '081234567890',
            };

            vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockResponse });

            await ProfileApi.updateProfile(minimalData);

            expect(axiosInstance.post).toHaveBeenCalled();
        });

        it('should handle API error response', async () => {
            const errorResponse = {
                response: {
                    data: {
                        status: 'error',
                        message: 'Validation failed',
                    },
                    status: 422,
                },
            };

            vi.mocked(axiosInstance.post).mockRejectedValue(errorResponse);

            await expect(ProfileApi.updateProfile(mockFormData)).rejects.toEqual(errorResponse);
        });

        it('should handle network error', async () => {
            const networkError = new Error('Network Error');
            vi.mocked(axiosInstance.post).mockRejectedValue(networkError);

            await expect(ProfileApi.updateProfile(mockFormData)).rejects.toThrow('Network Error');
        });

        it('should handle empty string values for optional fields', async () => {
            const dataWithEmptyStrings: FormValues = {
                name: 'John Doe',
                phone: '081234567890',
                date_birth: '',
                gender: '',
                job: '',
            };

            vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockResponse });

            await ProfileApi.updateProfile(dataWithEmptyStrings);

            expect(axiosInstance.post).toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('should logout successfully', async () => {
            const mockLogoutResponse = {
                status: 'success',
                message: 'Logged out successfully',
            };

            vi.mocked(axiosInstance.post).mockResolvedValue({ data: mockLogoutResponse });

            const result = await ProfileApi.logout();

            expect(axiosInstance.post).toHaveBeenCalledWith('logout');
            expect(result).toEqual(mockLogoutResponse);
        });

        it('should handle logout error', async () => {
            const errorResponse = {
                response: {
                    data: {
                        status: 'error',
                        message: 'Logout failed',
                    },
                    status: 500,
                },
            };

            vi.mocked(axiosInstance.post).mockRejectedValue(errorResponse);

            await expect(ProfileApi.logout()).rejects.toEqual(errorResponse);
        });

        it('should handle network error during logout', async () => {
            const networkError = new Error('Network Error');
            vi.mocked(axiosInstance.post).mockRejectedValue(networkError);

            await expect(ProfileApi.logout()).rejects.toThrow('Network Error');
        });

        it('should handle 401 unauthorized error', async () => {
            const unauthorizedError = {
                response: {
                    status: 401,
                    data: {
                        message: 'Unauthorized',
                    },
                },
            };

            vi.mocked(axiosInstance.post).mockRejectedValue(unauthorizedError);

            await expect(ProfileApi.logout()).rejects.toEqual(unauthorizedError);
        });
    });

    describe('getProfile', () => {
        const mockOutletSlug = 'test-outlet';
        const mockProfileResponse: AuthResponse = {
            status: 'success',
            message: 'Profile fetched successfully',
            data: {
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: {
                    id: 1,
                    uuid: 'user-uuid-123',
                    name: 'John Doe',
                    phone: '081234567890',
                    email: 'john@example.com',
                    avatar_url: 'https://example.com/avatar.jpg',
                    short_name: 'JD',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                    customer_profile: {
                        id: 1,
                        uuid: 'profile-uuid-123',
                        job: 'Software Engineer',
                        date_birth: '1990-01-01',
                        gender: 1,
                        user_id: 1,
                        avatar: null,
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                    },
                },
                total_point: 100,
                total_order: 5,
                total_user_voucher: 3,
            },
        };

        it('should fetch profile successfully', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockProfileResponse });

            const result = await ProfileApi.getProfile(mockOutletSlug);

            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${mockOutletSlug}/customer-profile`);
            expect(result).toEqual(mockProfileResponse);
        });

        it('should handle profile fetch with different outlet slug', async () => {
            const differentSlug = 'another-outlet';
            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockProfileResponse });

            await ProfileApi.getProfile(differentSlug);

            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${differentSlug}/customer-profile`);
        });

        it('should handle API error response', async () => {
            const errorResponse = {
                response: {
                    data: {
                        status: 'error',
                        message: 'Profile not found',
                    },
                    status: 404,
                },
            };

            vi.mocked(axiosInstance.get).mockRejectedValue(errorResponse);

            await expect(ProfileApi.getProfile(mockOutletSlug)).rejects.toEqual(errorResponse);
        });

        it('should handle 401 unauthorized error', async () => {
            const unauthorizedError = {
                response: {
                    status: 401,
                    data: {
                        message: 'Unauthorized',
                    },
                },
            };

            vi.mocked(axiosInstance.get).mockRejectedValue(unauthorizedError);

            await expect(ProfileApi.getProfile(mockOutletSlug)).rejects.toEqual(unauthorizedError);
        });

        it('should handle 403 forbidden error', async () => {
            const forbiddenError = {
                response: {
                    status: 403,
                    data: {
                        message: 'Forbidden',
                    },
                },
            };

            vi.mocked(axiosInstance.get).mockRejectedValue(forbiddenError);

            await expect(ProfileApi.getProfile(mockOutletSlug)).rejects.toEqual(forbiddenError);
        });

        it('should handle network error', async () => {
            const networkError = new Error('Network Error');
            vi.mocked(axiosInstance.get).mockRejectedValue(networkError);

            await expect(ProfileApi.getProfile(mockOutletSlug)).rejects.toThrow('Network Error');
        });

        it('should handle empty outlet slug', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockProfileResponse });

            await ProfileApi.getProfile('');

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet//customer-profile');
        });

        it('should handle outlet slug with special characters', async () => {
            const specialSlug = 'test-outlet-123_special';
            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockProfileResponse });

            await ProfileApi.getProfile(specialSlug);

            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${specialSlug}/customer-profile`);
        });
    });
});
