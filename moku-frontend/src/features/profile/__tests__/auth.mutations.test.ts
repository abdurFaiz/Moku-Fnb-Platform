import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import {
    useRegister,
    useUpdateProfile,
    useLogout,
    useRefreshToken,
} from '../services/auth.mutations';
import { authAPI } from '@/features/auth/api/auth.api';
import { ProfileApi } from '../api/profile.api';
import { useAuthStore } from '@/features/auth/stores/auth.store';
import type { AuthResponse } from '../types/Auth';
import type { FormValues } from '../schemas/profile.schemas';
import './setup';

// Mock dependencies
vi.mock('@/features/auth/api/auth.api', () => ({
    authAPI: {
        register: vi.fn(),
        refreshToken: vi.fn(),
    },
}));

vi.mock('../api/profile.api', () => ({
    ProfileApi: {
        updateProfile: vi.fn(),
        logout: vi.fn(),
    },
}));

vi.mock('@/features/auth/stores/auth.store', () => ({
    useAuthStore: vi.fn(),
}));

const mockAuthResponse: AuthResponse = {
    status: 'success',
    message: 'Success',
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

describe('auth.mutations', () => {
    let queryClient: QueryClient;
    let mockLogin: ReturnType<typeof vi.fn>;
    let mockUpdateUser: ReturnType<typeof vi.fn>;
    let mockLogout: ReturnType<typeof vi.fn>;
    let mockUpdateTokens: ReturnType<typeof vi.fn>;
    let mockClearAuth: ReturnType<typeof vi.fn>;

    const createWrapper = () => {
        const wrapper = ({ children }: { children: ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);
        return wrapper;
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                mutations: {
                    retry: false,
                },
                queries: {
                    retry: false,
                },
            },
        });

        mockLogin = vi.fn();
        mockUpdateUser = vi.fn();
        mockLogout = vi.fn();
        mockUpdateTokens = vi.fn();
        mockClearAuth = vi.fn();

        vi.mocked(useAuthStore).mockImplementation((selector: any) => {
            const store = {
                login: mockLogin,
                updateUser: mockUpdateUser,
                logout: mockLogout,
                updateTokens: mockUpdateTokens,
                clearAuth: mockClearAuth,
            };
            return selector(store);
        });

        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('useRegister', () => {
        const mockFormData: FormValues = {
            name: 'John Doe',
            phone: '081234567890',
            date_birth: '1990-01-01',
            gender: 'male',
            job: 'Software Engineer',
        };

        it('should register user successfully', async () => {
            vi.mocked(authAPI.register).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useRegister(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(mockFormData);

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(authAPI.register).toHaveBeenCalledWith(mockFormData);
            expect(mockLogin).toHaveBeenCalledWith({
                access_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: expect.objectContaining({
                    id: 1,
                    name: 'John Doe',
                }),
            });
        });

        it('should handle registration error', async () => {
            const error = new Error('Registration failed');
            vi.mocked(authAPI.register).mockRejectedValue(error);

            const { result } = renderHook(() => useRegister(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(mockFormData);

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(result.current.error).toBeDefined();
            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('should handle missing tokens in response', async () => {
            const responseWithoutTokens: AuthResponse = {
                ...mockAuthResponse,
                data: {
                    ...mockAuthResponse.data,
                    access_token: '',
                    refresh_token: '',
                },
            };
            vi.mocked(authAPI.register).mockResolvedValue(responseWithoutTokens);

            const { result } = renderHook(() => useRegister(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(mockFormData);

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('should handle API error response', async () => {
            const apiError = {
                response: {
                    data: {
                        status: 'error',
                        message: 'Email already exists',
                    },
                    status: 422,
                },
            };
            vi.mocked(authAPI.register).mockRejectedValue(apiError);

            const { result } = renderHook(() => useRegister(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(mockFormData);

            await waitFor(() => expect((result.current as any).isError).toBe(true));
        });

        it('should handle network error', async () => {
            const networkError = new Error('Network Error');
            vi.mocked(authAPI.register).mockRejectedValue(networkError);

            const { result } = renderHook(() => useRegister(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(mockFormData);

            await waitFor(() => expect((result.current as any).isError).toBe(true));
        });
    });

    describe('useUpdateProfile', () => {
        const mockUpdateData: FormValues = {
            name: 'Jane Doe',
            phone: '089876543210',
        };

        it('should update profile successfully', async () => {
            vi.mocked(ProfileApi.updateProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useUpdateProfile(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(mockUpdateData);

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(ProfileApi.updateProfile).toHaveBeenCalledWith(mockUpdateData);
            expect(mockUpdateUser).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    name: 'John Doe',
                })
            );
        });

        it('should invalidate profile query after update', async () => {
            vi.mocked(ProfileApi.updateProfile).mockResolvedValue(mockAuthResponse);
            const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

            const { result } = renderHook(() => useUpdateProfile(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(mockUpdateData);

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(invalidateQueriesSpy).toHaveBeenCalled();
        });

        it('should handle update error', async () => {
            const error = new Error('Update failed');
            vi.mocked(ProfileApi.updateProfile).mockRejectedValue(error);

            const { result } = renderHook(() => useUpdateProfile(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(mockUpdateData);

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(mockUpdateUser).not.toHaveBeenCalled();
        });

        it('should handle API validation error', async () => {
            const validationError = {
                response: {
                    data: {
                        status: 'error',
                        message: 'Phone number already exists',
                    },
                    status: 422,
                },
            };
            vi.mocked(ProfileApi.updateProfile).mockRejectedValue(validationError);

            const { result } = renderHook(() => useUpdateProfile(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(mockUpdateData);

            await waitFor(() => expect((result.current as any).isError).toBe(true));
        });

        it('should handle update with avatar file', async () => {
            const mockFile = new File(['avatar'], 'avatar.jpg', { type: 'image/jpeg' });
            const dataWithAvatar: FormValues = {
                ...mockUpdateData,
                avatar: mockFile,
            };

            vi.mocked(ProfileApi.updateProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useUpdateProfile(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(dataWithAvatar);

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(ProfileApi.updateProfile).toHaveBeenCalledWith(dataWithAvatar);
        });
    });

    describe('useLogout', () => {
        it('should logout successfully', async () => {
            vi.mocked(ProfileApi.logout).mockResolvedValue({
                status: 'success',
                message: 'Logged out',
            });

            const clearSpy = vi.spyOn(queryClient, 'clear');

            const { result } = renderHook(() => useLogout(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(ProfileApi.logout).toHaveBeenCalled();
            expect(mockLogout).toHaveBeenCalled();
            expect(clearSpy).toHaveBeenCalled();
        });

        it('should clear local state even on logout error', async () => {
            const error = new Error('Logout failed');
            vi.mocked(ProfileApi.logout).mockRejectedValue(error);

            const clearSpy = vi.spyOn(queryClient, 'clear');

            const { result } = renderHook(() => useLogout(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(mockLogout).toHaveBeenCalled();
            expect(clearSpy).toHaveBeenCalled();
        });

        it('should handle network error during logout', async () => {
            const networkError = new Error('Network Error');
            vi.mocked(ProfileApi.logout).mockRejectedValue(networkError);

            const { result } = renderHook(() => useLogout(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(mockLogout).toHaveBeenCalled();
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
            vi.mocked(ProfileApi.logout).mockRejectedValue(unauthorizedError);

            const { result } = renderHook(() => useLogout(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(mockLogout).toHaveBeenCalled();
        });
    });

    describe('useRefreshToken', () => {
        const mockRefreshResponse = {
            status: 'success',
            message: 'Token refreshed',
            data: {
                access_token: 'new_access_token',
                refresh_token: 'new_refresh_token',
            },
        };

        it('should refresh token successfully', async () => {
            vi.mocked(authAPI.refreshToken).mockResolvedValue(mockRefreshResponse as any);

            const { result } = renderHook(() => useRefreshToken(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(authAPI.refreshToken).toHaveBeenCalled();
            expect(mockUpdateTokens).toHaveBeenCalledWith(
                'new_access_token',
                'new_refresh_token'
            );
        });

        it('should clear auth on refresh error', async () => {
            const error = new Error('Refresh failed');
            vi.mocked(authAPI.refreshToken).mockRejectedValue(error);

            const { result } = renderHook(() => useRefreshToken(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(mockClearAuth).toHaveBeenCalled();
            expect(mockUpdateTokens).not.toHaveBeenCalled();
        });

        it('should handle 401 unauthorized error', async () => {
            const unauthorizedError = {
                response: {
                    status: 401,
                    data: {
                        message: 'Invalid refresh token',
                    },
                },
            };
            vi.mocked(authAPI.refreshToken).mockRejectedValue(unauthorizedError);

            const { result } = renderHook(() => useRefreshToken(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(mockClearAuth).toHaveBeenCalled();
        });

        it('should handle network error', async () => {
            const networkError = new Error('Network Error');
            vi.mocked(authAPI.refreshToken).mockRejectedValue(networkError);

            const { result } = renderHook(() => useRefreshToken(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(mockClearAuth).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle concurrent register mutations', async () => {
            vi.mocked(authAPI.register).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useRegister(), {
                wrapper: createWrapper(),
            });

            const formData1: FormValues = { name: 'User 1', phone: '081111111111' };
            const formData2: FormValues = { name: 'User 2', phone: '082222222222' };

            result.current.mutate(formData1);
            result.current.mutate(formData2);

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            // Should only call login once with the last mutation
            expect(mockLogin).toHaveBeenCalled();
        });

        it('should handle concurrent update mutations', async () => {
            vi.mocked(ProfileApi.updateProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useUpdateProfile(), {
                wrapper: createWrapper(),
            });

            const update1: FormValues = { name: 'Update 1', phone: '081111111111' };
            const update2: FormValues = { name: 'Update 2', phone: '082222222222' };

            result.current.mutate(update1);
            result.current.mutate(update2);

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(mockUpdateUser).toHaveBeenCalled();
        });

        it('should handle very large form data', async () => {
            const largeFormData: FormValues = {
                name: 'A'.repeat(1000),
                phone: '081234567890',
                job: 'B'.repeat(1000),
            };

            vi.mocked(ProfileApi.updateProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useUpdateProfile(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(largeFormData);

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));
        });

        it('should handle special characters in form data', async () => {
            const specialFormData: FormValues = {
                name: 'John Doe <script>alert("xss")</script>',
                phone: '081234567890',
                job: 'Engineer & Developer',
            };

            vi.mocked(ProfileApi.updateProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useUpdateProfile(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(specialFormData);

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));
        });

        it('should handle register with transformation error', async () => {
            const invalidResponse: any = {
                status: 'success',
                message: 'Success',
                data: null, // Invalid data that will cause transformation error
            };
            vi.mocked(authAPI.register).mockResolvedValue(invalidResponse);

            const { result } = renderHook(() => useRegister(), {
                wrapper: createWrapper(),
            });

            const formData: FormValues = { name: 'Test', phone: '081234567890' };

            result.current.mutate(formData);

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(mockLogin).not.toHaveBeenCalled();
        });

        it('should handle update with transformation error', async () => {
            const invalidResponse: any = {
                status: 'success',
                message: 'Success',
                data: null,
            };
            vi.mocked(ProfileApi.updateProfile).mockResolvedValue(invalidResponse);

            const { result } = renderHook(() => useUpdateProfile(), {
                wrapper: createWrapper(),
            });

            const formData: FormValues = { name: 'Test', phone: '081234567890' };

            result.current.mutate(formData);

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(mockUpdateUser).not.toHaveBeenCalled();
        });

        it('should handle refresh with invalid response', async () => {
            const invalidResponse: any = {
                status: 'success',
                message: 'Success',
                data: {
                    access_token: '',
                    refresh_token: '',
                },
            };
            vi.mocked(authAPI.refreshToken).mockResolvedValue(invalidResponse);

            const { result } = renderHook(() => useRefreshToken(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            // Should still call updateTokens even with empty strings
            expect(mockUpdateTokens).toHaveBeenCalledWith('', '');
        });

        it('should handle multiple consecutive logout calls', async () => {
            vi.mocked(ProfileApi.logout).mockResolvedValue({
                status: 'success',
                message: 'Logged out',
            });

            const { result } = renderHook(() => useLogout(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();
            result.current.mutate();
            result.current.mutate();

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(mockLogout).toHaveBeenCalled();
        });

        it('should handle multiple consecutive refresh calls', async () => {
            const mockRefreshResponse = {
                status: 'success',
                message: 'Token refreshed',
                data: {
                    access_token: 'new_token',
                    refresh_token: 'new_refresh',
                },
            };
            vi.mocked(authAPI.refreshToken).mockResolvedValue(mockRefreshResponse as any);

            const { result } = renderHook(() => useRefreshToken(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();
            result.current.mutate();

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(mockUpdateTokens).toHaveBeenCalled();
        });

        it('should handle register with unicode characters', async () => {
            const unicodeFormData: FormValues = {
                name: '张三 محمد José',
                phone: '081234567890',
                job: 'مهندس برمجيات',
            };

            vi.mocked(authAPI.register).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useRegister(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(unicodeFormData);

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));
        });

        it('should handle update with emoji in data', async () => {
            const emojiFormData: FormValues = {
                name: 'John Doe 😊',
                phone: '081234567890',
                job: 'Developer 💻',
            };

            vi.mocked(ProfileApi.updateProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useUpdateProfile(), {
                wrapper: createWrapper(),
            });

            result.current.mutate(emojiFormData);

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));
        });

        it('should handle 500 server error', async () => {
            const serverError = {
                response: {
                    status: 500,
                    data: {
                        message: 'Internal Server Error',
                    },
                },
            };
            vi.mocked(authAPI.register).mockRejectedValue(serverError);

            const { result } = renderHook(() => useRegister(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({ name: 'Test', phone: '081234567890' });

            await waitFor(() => expect((result.current as any).isError).toBe(true));
        });

        it('should handle 503 service unavailable error', async () => {
            const serviceError = {
                response: {
                    status: 503,
                    data: {
                        message: 'Service Unavailable',
                    },
                },
            };
            vi.mocked(ProfileApi.updateProfile).mockRejectedValue(serviceError);

            const { result } = renderHook(() => useUpdateProfile(), {
                wrapper: createWrapper(),
            });

            result.current.mutate({ name: 'Test', phone: '081234567890' });

            await waitFor(() => expect((result.current as any).isError).toBe(true));
        });

        it('should handle timeout error', async () => {
            const timeoutError = new Error('timeout of 5000ms exceeded');
            vi.mocked(authAPI.refreshToken).mockRejectedValue(timeoutError);

            const { result } = renderHook(() => useRefreshToken(), {
                wrapper: createWrapper(),
            });

            result.current.mutate();

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(mockClearAuth).toHaveBeenCalled();
        });
    });
});
