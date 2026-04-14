import { useMemo } from 'react';

/**
 * Hook untuk menghitung points berdasarkan harga
 * Formula: Setiap Rp 10.000 mendapatkan 1 point
 * @param price - Harga total dalam Rupiah
 * @returns Jumlah points yang didapatkan
 */
export const usePointsCalculation = (price: number): number => {
    return useMemo(() => {
        if (!price || price <= 0) return 0;

        // Setiap 10.000 mendapat 1 point
        const pointsPerPrice = 10000;
        const points = Math.floor(price / pointsPerPrice);

        return points;
    }, [price]);
};

/**
 * Helper function untuk menghitung points (non-hook version)
 * Berguna untuk digunakan di luar React components
 */
export const calculatePoints = (price: number): number => {
    if (!price || price <= 0) return 0;

    const pointsPerPrice = 10000;
    return Math.floor(price / pointsPerPrice);
};

/**
 * Helper function untuk format points dengan label
 */
export const formatPoints = (points: number): string => {
    return `${points} Poin`;
};
