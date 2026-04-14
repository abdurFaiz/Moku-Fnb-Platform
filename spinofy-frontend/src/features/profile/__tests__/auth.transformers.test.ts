import { describe, it, expect } from 'vitest';
import {
    transformAuthResponse,
    transformUserData,
    transformCustomerProfile,
    extractUserFromAuthResponse,
} from '../services/auth.transformers';
import type { AuthResponse } from '../types/Auth';
import './setup';

describe('auth.transformers', () => {
    const mockAuthResponse: AuthResponse = {
        status: 'success',
        message: 'Success',
        data: {
            access_token: 'mock_access_token_123',
            refresh_token: 'mock_refresh_token_456',
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
                    avatar: 'avatar.jpg',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
            },
            total_point: 100,
            total_order: 5,
            total_user_voucher: 3,
        },
    };

    describe('transformAuthResponse', () => {
        it('should transform auth response with tokens correctly', () => {
            const result = transformAuthResponse(mockAuthResponse);

            expect(result).toHaveProperty('access_token', 'mock_access_token_123');
            expect(result).toHaveProperty('refresh_token', 'mock_refresh_token_456');
            expect(result).toHaveProperty('user');
            expect(result.user).toHaveProperty('id', 1);
            expect(result.user).toHaveProperty('name', 'John Doe');
        });

        it('should include stats when available', () => {
            const result = transformAuthResponse(mockAuthResponse);

            expect(result).toHaveProperty('access_token', 'mock_access_token_123');
            expect(result).toHaveProperty('refresh_token', 'mock_refresh_token_456');
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('total_point', 100);
            expect(result).toHaveProperty('total_order', 5);
            expect(result).toHaveProperty('total_user_voucher', 3);
        });

        it('should handle response without stats', () => {
            const responseWithoutStats: AuthResponse = {
                ...mockAuthResponse,
                data: {
                    ...mockAuthResponse.data,
                    total_point: 0,
                    total_order: 0,
                    total_user_voucher: 0,
                },
            };

            const result = transformAuthResponse(responseWithoutStats);

            expect(result).toHaveProperty('access_token', 'mock_access_token_123');
            expect(result).toHaveProperty('refresh_token', 'mock_refresh_token_456');
            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('total_point', 0);
            expect(result).toHaveProperty('total_order', 0);
            expect(result).toHaveProperty('total_user_voucher', 0);
        });

        it('should transform user data within response', () => {
            const result = transformAuthResponse(mockAuthResponse);

            expect(result.user).toHaveProperty('uuid', 'user-uuid-123');
            expect(result.user).toHaveProperty('email', 'john@example.com');
            expect(result.user).toHaveProperty('customer_profile');
        });

        it('should handle missing tokens gracefully', () => {
            const responseWithoutTokens: AuthResponse = {
                ...mockAuthResponse,
                data: {
                    ...mockAuthResponse.data,
                    access_token: '',
                    refresh_token: '',
                },
            };

            const result = transformAuthResponse(responseWithoutTokens);

            expect(result).toHaveProperty('access_token', '');
            expect(result).toHaveProperty('refresh_token', '');
        });
    });

    describe('transformUserData', () => {
        it('should transform user data correctly', () => {
            const result = transformUserData(mockAuthResponse.data.user);

            expect(result).toEqual({
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
                    avatar: 'avatar.jpg',
                    created_at: '2024-01-01T00:00:00Z',
                    updated_at: '2024-01-01T00:00:00Z',
                },
            });
        });

        it('should handle user without phone number', () => {
            const userWithoutPhone = {
                ...mockAuthResponse.data.user,
                phone: undefined,
            };

            const result = transformUserData(userWithoutPhone);

            expect(result).toHaveProperty('phone', undefined);
        });

        it('should handle user with null avatar_url', () => {
            const userWithNullAvatar = {
                ...mockAuthResponse.data.user,
                avatar_url: '',
            };

            const result = transformUserData(userWithNullAvatar);

            expect(result).toHaveProperty('avatar_url', '');
        });

        it('should preserve all user fields', () => {
            const result = transformUserData(mockAuthResponse.data.user);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('uuid');
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('email');
            expect(result).toHaveProperty('created_at');
            expect(result).toHaveProperty('updated_at');
            expect(result).toHaveProperty('short_name');
        });

        it('should transform nested customer profile', () => {
            const result = transformUserData(mockAuthResponse.data.user);

            expect(result.customer_profile).toBeDefined();
            expect(result.customer_profile).toHaveProperty('id', 1);
            expect(result.customer_profile).toHaveProperty('job', 'Software Engineer');
        });
    });

    describe('transformCustomerProfile', () => {
        it('should transform customer profile correctly', () => {
            const result = transformCustomerProfile(mockAuthResponse.data.user.customer_profile);

            expect(result).toEqual({
                id: 1,
                uuid: 'profile-uuid-123',
                job: 'Software Engineer',
                date_birth: '1990-01-01',
                gender: 1,
                user_id: 1,
                avatar: 'avatar.jpg',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
            });
        });

        it('should handle null job field', () => {
            const profileWithNullJob = {
                ...mockAuthResponse.data.user.customer_profile,
                job: null,
            };

            const result = transformCustomerProfile(profileWithNullJob);

            expect(result).toHaveProperty('job', null);
        });

        it('should handle null date_birth field', () => {
            const profileWithNullBirthDate = {
                ...mockAuthResponse.data.user.customer_profile,
                date_birth: null,
            };

            const result = transformCustomerProfile(profileWithNullBirthDate);

            expect(result).toHaveProperty('date_birth', null);
        });

        it('should handle null gender field', () => {
            const profileWithNullGender = {
                ...mockAuthResponse.data.user.customer_profile,
                gender: null,
            };

            const result = transformCustomerProfile(profileWithNullGender);

            expect(result).toHaveProperty('gender', null);
        });

        it('should handle null avatar field', () => {
            const profileWithNullAvatar = {
                ...mockAuthResponse.data.user.customer_profile,
                avatar: null,
            };

            const result = transformCustomerProfile(profileWithNullAvatar);

            expect(result).toHaveProperty('avatar', null);
        });

        it('should handle female gender (2)', () => {
            const profileWithFemaleGender = {
                ...mockAuthResponse.data.user.customer_profile,
                gender: 2,
            };

            const result = transformCustomerProfile(profileWithFemaleGender);

            expect(result).toHaveProperty('gender', 2);
        });

        it('should preserve all profile fields', () => {
            const result = transformCustomerProfile(mockAuthResponse.data.user.customer_profile);

            expect(result).toHaveProperty('id');
            expect(result).toHaveProperty('uuid');
            expect(result).toHaveProperty('user_id');
            expect(result).toHaveProperty('created_at');
            expect(result).toHaveProperty('updated_at');
        });
    });

    describe('extractUserFromAuthResponse', () => {
        it('should extract user from auth response', () => {
            const result = extractUserFromAuthResponse(mockAuthResponse);

            expect(result).toHaveProperty('id', 1);
            expect(result).toHaveProperty('uuid', 'user-uuid-123');
            expect(result).toHaveProperty('name', 'John Doe');
            expect(result).toHaveProperty('email', 'john@example.com');
        });

        it('should include customer profile in extracted user', () => {
            const result = extractUserFromAuthResponse(mockAuthResponse);

            expect(result).toHaveProperty('customer_profile');
            expect(result.customer_profile).toHaveProperty('job', 'Software Engineer');
        });

        it('should handle response with minimal user data', () => {
            const minimalResponse: AuthResponse = {
                status: 'success',
                message: 'Success',
                data: {
                    access_token: 'token',
                    refresh_token: 'refresh',
                    user: {
                        id: 2,
                        uuid: 'uuid-2',
                        name: 'Jane Doe',
                        email: 'jane@example.com',
                        avatar_url: '',
                        short_name: 'JD',
                        created_at: '2024-01-01T00:00:00Z',
                        updated_at: '2024-01-01T00:00:00Z',
                        customer_profile: {
                            id: 2,
                            uuid: 'profile-uuid-2',
                            job: null,
                            date_birth: null,
                            gender: null,
                            user_id: 2,
                            avatar: null,
                            created_at: '2024-01-01T00:00:00Z',
                            updated_at: '2024-01-01T00:00:00Z',
                        },
                    },
                    total_point: 0,
                    total_order: 0,
                    total_user_voucher: 0,
                },
            };

            const result = extractUserFromAuthResponse(minimalResponse);

            expect(result).toHaveProperty('id', 2);
            expect(result).toHaveProperty('name', 'Jane Doe');
            expect(result.customer_profile.job).toBeNull();
        });

        it('should be equivalent to transformUserData', () => {
            const extractedUser = extractUserFromAuthResponse(mockAuthResponse);
            const transformedUser = transformUserData(mockAuthResponse.data.user);

            expect(extractedUser).toEqual(transformedUser);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty strings in user data', () => {
            const responseWithEmptyStrings: AuthResponse = {
                ...mockAuthResponse,
                data: {
                    ...mockAuthResponse.data,
                    user: {
                        ...mockAuthResponse.data.user,
                        name: '',
                        email: '',
                        avatar_url: '',
                        short_name: '',
                    },
                },
            };

            const result = transformUserData(responseWithEmptyStrings.data.user);

            expect(result.name).toBe('');
            expect(result.email).toBe('');
            expect(result.avatar_url).toBe('');
            expect(result.short_name).toBe('');
        });

        it('should handle very long strings', () => {
            const longString = 'a'.repeat(1000);
            const responseWithLongStrings: AuthResponse = {
                ...mockAuthResponse,
                data: {
                    ...mockAuthResponse.data,
                    user: {
                        ...mockAuthResponse.data.user,
                        name: longString,
                    },
                },
            };

            const result = transformUserData(responseWithLongStrings.data.user);

            expect(result.name).toBe(longString);
            expect(result.name.length).toBe(1000);
        });

        it('should handle special characters in strings', () => {
            const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const responseWithSpecialChars: AuthResponse = {
                ...mockAuthResponse,
                data: {
                    ...mockAuthResponse.data,
                    user: {
                        ...mockAuthResponse.data.user,
                        name: specialChars,
                    },
                },
            };

            const result = transformUserData(responseWithSpecialChars.data.user);

            expect(result.name).toBe(specialChars);
        });

        it('should handle unicode characters', () => {
            const unicodeString = '你好世界 🌍 مرحبا';
            const responseWithUnicode: AuthResponse = {
                ...mockAuthResponse,
                data: {
                    ...mockAuthResponse.data,
                    user: {
                        ...mockAuthResponse.data.user,
                        name: unicodeString,
                    },
                },
            };

            const result = transformUserData(responseWithUnicode.data.user);

            expect(result.name).toBe(unicodeString);
        });
    });
});
