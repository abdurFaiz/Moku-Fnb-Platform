import { useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/auth.hooks';
import type { UserData } from '@/features/profile/types/User';
import { HOME_DATA_DEFAULTS, HOME_ERRORS } from '@/features/storefront/constant/homeConstant';


export interface UseUserDataReturn {
    user: UserData | null;
    isLoading: boolean;
    isPending: boolean;
    isError: boolean;
    error: string | null;
}

export const useUserDataFetch = (
    rewardVouchersCount?: number,
    rewardPointsBalance?: number
): UseUserDataReturn => {
    const { user, isLoadingProfile, isProfilePending, isProfileError, profileError } = useAuth();


    const userData: UserData | null = useMemo(() => {
        if (!user) return null;

        return {
            name: user.name ?? HOME_DATA_DEFAULTS.USER_NAME,
            vouchers: rewardVouchersCount ?? HOME_DATA_DEFAULTS.VOUCHERS_COUNT,
            points: rewardPointsBalance ?? HOME_DATA_DEFAULTS.POINTS_BALANCE,
        };
    }, [user, rewardVouchersCount, rewardPointsBalance]);


    const error: string | null = useMemo(() => {
        if (isLoadingProfile || isProfilePending) {
            return null;
        }
        if (isProfileError && profileError) {
            return profileError instanceof Error ? profileError.message : String(profileError);
        }
        return user ? null : HOME_ERRORS.FETCH_USER_FAILED;
    }, [isLoadingProfile, isProfilePending, isProfileError, profileError, user]);

    return {
        user: userData,
        isLoading: isLoadingProfile,
        isPending: isProfilePending,
        isError: isProfileError,
        error,
    };
};

export default useUserDataFetch;
