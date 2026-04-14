import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { useQueryProfile, prefetchProfile } from '../hooks/api/useQueryProfile';
import { ProfileApi } from '../api/profile.api';
import type { AuthResponse } from '../types/Auth';
import './setup';

// Mock ProfileApi
vi.mock('../api/profile.api', () => ({
    ProfileApi: {
        getProfile: vi.fn(),
    },
}));

const mockAuthResponse: AuthResponse = {
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

describe('useQueryProfile', () => {
    let queryClient: QueryClient;

    const createWrapper = () => {
        const wrapper = ({ children }: { children: ReactNode }) =>
            createElement(QueryClientProvider, { client: queryClient }, children);
        return wrapper;
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                },
            },
        });
        vi.clearAllMocks();
    });

    describe('useQueryProfile hook', () => {
        it('should fetch profile successfully', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useQueryProfile('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(result.current.data).toEqual(mockAuthResponse);
            expect(ProfileApi.getProfile).toHaveBeenCalledWith('test-outlet');
        });

        it('should handle null slug', () => {
            const { result } = renderHook(() => useQueryProfile(null), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.data).toBeUndefined();
        });

        it('should handle undefined slug', () => {
            const { result } = renderHook(() => useQueryProfile(undefined), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.data).toBeUndefined();
        });

        it('should handle API error', async () => {
            const error = new Error('API Error');
            vi.mocked(ProfileApi.getProfile).mockRejectedValue(error);

            const { result } = renderHook(() => useQueryProfile('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(result.current.error).toEqual(error);
        });

        it('should handle error response status', async () => {
            const errorResponse: AuthResponse = {
                status: 'error',
                message: 'Profile not found',
                data: {} as any,
            };
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(errorResponse);

            const { result } = renderHook(() => useQueryProfile('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(result.current.error?.message).toContain('Profile not found');
        });

        it('should accept custom options', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(
                () => useQueryProfile('test-outlet', { enabled: false }),
                { wrapper: createWrapper() }
            );

            expect(result.current.isLoading).toBe(false);
            expect(result.current.data).toBeUndefined();
            expect(ProfileApi.getProfile).not.toHaveBeenCalled();
        });
    });

    describe('prefetchProfile', () => {
        it('should prefetch profile data', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            await prefetchProfile(queryClient, 'test-outlet');

            expect(ProfileApi.getProfile).toHaveBeenCalledWith('test-outlet');
        });

        it('should cache prefetched data', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            await prefetchProfile(queryClient, 'test-outlet');

            const { result } = renderHook(() => useQueryProfile('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            // Should only call API once (during prefetch)
            expect(ProfileApi.getProfile).toHaveBeenCalledTimes(1);
        });

        it('should handle prefetch error gracefully', async () => {
            const error = new Error('Prefetch failed');
            vi.mocked(ProfileApi.getProfile).mockRejectedValue(error);

            // prefetchQuery doesn't throw, it just fails silently
            await prefetchProfile(queryClient, 'test-outlet');

            // Verify the error was attempted to be fetched
            expect(ProfileApi.getProfile).toHaveBeenCalledWith('test-outlet');
        });

        it('should prefetch with different slugs', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            await prefetchProfile(queryClient, 'outlet-1');
            await prefetchProfile(queryClient, 'outlet-2');

            expect(ProfileApi.getProfile).toHaveBeenCalledWith('outlet-1');
            expect(ProfileApi.getProfile).toHaveBeenCalledWith('outlet-2');
            expect(ProfileApi.getProfile).toHaveBeenCalledTimes(2);
        });

        it('should handle empty slug in prefetch', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            await prefetchProfile(queryClient, '');

            expect(ProfileApi.getProfile).toHaveBeenCalledWith('');
        });
    });

    describe('Edge Cases', () => {
        it('should handle slug with special characters', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useQueryProfile('test-outlet-123!@#'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(ProfileApi.getProfile).toHaveBeenCalledWith('test-outlet-123!@#');
        });

        it('should handle slug with unicode', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useQueryProfile('测试-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(ProfileApi.getProfile).toHaveBeenCalledWith('测试-outlet');
        });

        it('should handle very long slug', async () => {
            const longSlug = 'a'.repeat(1000);
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(() => useQueryProfile(longSlug), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(ProfileApi.getProfile).toHaveBeenCalledWith(longSlug);
        });

        it('should handle response with missing user data', async () => {
            const invalidResponse: AuthResponse = {
                status: 'success',
                message: 'Success',
                data: {
                    ...mockAuthResponse.data,
                    user: null as any,
                },
            };
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(invalidResponse);

            const { result } = renderHook(() => useQueryProfile('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            // The error message comes from ensureProfileSuccess function
            expect(result.current.error?.message).toBeDefined();
        });

        it('should handle response with undefined data', async () => {
            const invalidResponse: AuthResponse = {
                status: 'success',
                message: 'Success',
                data: undefined as any,
            };
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(invalidResponse);

            const { result } = renderHook(() => useQueryProfile('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isError).toBe(true));
        });

        it('should handle 404 not found error', async () => {
            const notFoundError = {
                response: {
                    status: 404,
                    data: {
                        message: 'Profile not found',
                    },
                },
            };
            vi.mocked(ProfileApi.getProfile).mockRejectedValue(notFoundError);

            const { result } = renderHook(() => useQueryProfile('non-existent'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isError).toBe(true));
        });

        it('should handle 403 forbidden error', async () => {
            const forbiddenError = {
                response: {
                    status: 403,
                    data: {
                        message: 'Access forbidden',
                    },
                },
            };
            vi.mocked(ProfileApi.getProfile).mockRejectedValue(forbiddenError);

            const { result } = renderHook(() => useQueryProfile('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isError).toBe(true));
        });

        it('should handle network timeout', async () => {
            const timeoutError = new Error('timeout of 5000ms exceeded');
            vi.mocked(ProfileApi.getProfile).mockRejectedValue(timeoutError);

            const { result } = renderHook(() => useQueryProfile('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => expect((result.current as any).isError).toBe(true));

            expect(result.current.error?.message).toContain('timeout');
        });

        it('should handle concurrent queries with same slug', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result: result1 } = renderHook(() => useQueryProfile('test-outlet'), {
                wrapper: createWrapper(),
            });

            const { result: result2 } = renderHook(() => useQueryProfile('test-outlet'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result1.current.isSuccess).toBe(true);
                expect(result2.current.isSuccess).toBe(true);
            });

            // Should only call API once due to caching
            expect(ProfileApi.getProfile).toHaveBeenCalledTimes(1);
        });

        it('should handle concurrent queries with different slugs', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result: result1 } = renderHook(() => useQueryProfile('outlet-1'), {
                wrapper: createWrapper(),
            });

            const { result: result2 } = renderHook(() => useQueryProfile('outlet-2'), {
                wrapper: createWrapper(),
            });

            await waitFor(() => {
                expect(result1.current.isSuccess).toBe(true);
                expect(result2.current.isSuccess).toBe(true);
            });

            // Should call API twice for different slugs
            expect(ProfileApi.getProfile).toHaveBeenCalledTimes(2);
        });

        it('should handle enabled option set to true', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(
                () => useQueryProfile('test-outlet', { enabled: true }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(ProfileApi.getProfile).toHaveBeenCalled();
        });

        it('should handle refetchOnMount option', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(
                () => useQueryProfile('test-outlet', { refetchOnMount: true }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));
        });

        it('should handle custom staleTime option', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result } = renderHook(
                () => useQueryProfile('test-outlet', { staleTime: 10000 }),
                { wrapper: createWrapper() }
            );

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));
        });

        it('should handle empty string slug', () => {
            const { result } = renderHook(() => useQueryProfile(''), {
                wrapper: createWrapper(),
            });

            expect(result.current.isLoading).toBe(false);
            expect(result.current.data).toBeUndefined();
            expect(ProfileApi.getProfile).not.toHaveBeenCalled();
        });

        it('should handle whitespace slug', () => {
            const { result } = renderHook(() => useQueryProfile('   '), {
                wrapper: createWrapper(),
            });

            // Whitespace is truthy, so it should attempt to fetch
            expect(result.current.isLoading).toBe(true);
        });

        it('should handle slug change', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result, rerender } = renderHook(
                ({ slug }) => useQueryProfile(slug),
                {
                    wrapper: createWrapper(),
                    initialProps: { slug: 'outlet-1' },
                }
            );

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            // Change slug
            rerender({ slug: 'outlet-2' });

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            expect(ProfileApi.getProfile).toHaveBeenCalledWith('outlet-1');
            expect(ProfileApi.getProfile).toHaveBeenCalledWith('outlet-2');
        });

        it('should handle slug change from valid to null', async () => {
            vi.mocked(ProfileApi.getProfile).mockResolvedValue(mockAuthResponse);

            const { result, rerender } = renderHook(
                ({ slug }) => useQueryProfile(slug),
                {
                    wrapper: createWrapper(),
                    initialProps: { slug: 'outlet-1' as string | null },
                }
            );

            await waitFor(() => expect((result.current as any).isSuccess).toBe(true));

            // Change to null
            rerender({ slug: null });

            expect(result.current.data).toBeUndefined();
        });
    });
});
