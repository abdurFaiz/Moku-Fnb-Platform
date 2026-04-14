import {
    queryOptions,
    useQuery,
    type QueryClient,
    type UseQueryOptions,
} from '@tanstack/react-query';

import { ProfileApi } from '@/features/profile/api/profile.api';
import type { AuthResponse } from '@/features/profile/types/Auth';
import { authQueryKeys } from '@/features/profile/services/auth.keys';
import { AUTH_CONFIG } from '@/features/profile/services/auth.constants';

const ensureProfileSuccess = (response: AuthResponse, slug: string) => {
    if (response.status === 'error' || !response.data?.user) {
        throw new Error(response.message || `Failed to load profile for ${slug}`);
    }

    return response;
};

const fetchProfile = async (slug: string) => {
    const response = await ProfileApi.getProfile(slug);
    return ensureProfileSuccess(response, slug);
};

export const profileQueryOptions = <TData = AuthResponse>(slug: string) =>
    queryOptions<
        AuthResponse,
        Error,
        TData,
        ReturnType<typeof authQueryKeys.profile>
    >({
        queryKey: authQueryKeys.profile(slug),
        queryFn: () => fetchProfile(slug),
        staleTime: AUTH_CONFIG.STALE_TIME,
        gcTime: AUTH_CONFIG.GC_TIME,
        refetchOnWindowFocus: false,
    });

type ProfileQueryKey = ReturnType<typeof authQueryKeys.profile>;

type ProfileQueryOptions<TData> = Omit<
    UseQueryOptions<AuthResponse, Error, TData, ProfileQueryKey>,
    'queryKey' | 'queryFn'
>;

export const useQueryProfile = <TData = AuthResponse>(
    slug?: string | null,
    options?: ProfileQueryOptions<TData>
) => {
    if (!slug) {
        return useQuery<AuthResponse, Error, TData, ProfileQueryKey>({
            queryKey: authQueryKeys.profile(''),
            queryFn: async () => {
                throw new Error('Outlet slug is required');
            },
            enabled: false,
            ...(options ?? {}),
        });
    }

    return useQuery<AuthResponse, Error, TData, ProfileQueryKey>({
        ...profileQueryOptions<TData>(slug),
        ...(options ?? {}),
    });
};

export const prefetchProfile = (queryClient: QueryClient, slug: string) =>
    queryClient.prefetchQuery(profileQueryOptions(slug));
