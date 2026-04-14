import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/stores/auth.store';

export interface UserStats {
    total_voucher: number;
    total_point: number;
    total_order: number;
}

export interface UseUserStatsReturn {
    stats: UserStats;
}

export const useUserStats = (): UseUserStatsReturn => {
    const { total_point, total_order, total_user_voucher } = useAuthStore();

    const stats: UserStats = useMemo(() => {
        return {
            total_voucher: total_user_voucher ?? 0,
            total_point: total_point ?? 0,
            total_order: total_order ?? 0,
        };
    }, [total_user_voucher, total_point, total_order]);

    return {
        stats,
    };
};
