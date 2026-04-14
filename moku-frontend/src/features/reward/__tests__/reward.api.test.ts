import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RewardAPI } from '../api/reward.api';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import type { RewardResponse } from '../types/Reward';

// Mock dependencies
vi.mock('@/lib/axios');
vi.mock('sonner');

describe('RewardAPI', () => {
    const mockOutletSlug = 'test-outlet';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('getListRewardPoint', () => {
        it('should successfully fetch reward points list', async () => {
            // Arrange
            const mockResponse: RewardResponse = {
                status: 'success',
                message: 'Reward points fetched successfully',
                data: {
                    point_balance: 150,
                    vouchers: [
                        {
                            id: 1,
                            outlet_id: 1,
                            name: 'Discount 10%',
                            code: 'DISC10',
                            type: 1,
                            discount_percent: 10,
                            point: 50,
                            valid_until: '2026-12-31',
                            created_at: '2026-01-01',
                            updated_at: '2026-01-01',
                            is_active: 1,
                        },
                    ],
                    customer_points: [],
                },
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockResponse });

            // Act
            const result = await RewardAPI.getListRewardPoint(mockOutletSlug);

            // Assert
            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${mockOutletSlug}/reward`);
            expect(result).toEqual(mockResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should show toast notification when API returns error status', async () => {
            // Arrange
            const mockErrorResponse: RewardResponse = {
                status: 'error',
                message: 'Failed to fetch rewards',
                data: {
                    point_balance: 0,
                    vouchers: [],
                    customer_points: [],
                },
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockErrorResponse });

            // Act
            const result = await RewardAPI.getListRewardPoint(mockOutletSlug);

            // Assert
            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${mockOutletSlug}/reward`);
            expect(toast.info).toHaveBeenCalledWith('Failed to fetch rewards');
            expect(result).toEqual(mockErrorResponse);
        });

        it('should show default error message when API returns error without message', async () => {
            // Arrange
            const mockErrorResponse: RewardResponse = {
                status: 'error',
                message: '',
                data: {
                    point_balance: 0,
                    vouchers: [],
                    customer_points: [],
                },
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockErrorResponse });

            // Act
            await RewardAPI.getListRewardPoint(mockOutletSlug);

            // Assert
            expect(toast.info).toHaveBeenCalledWith(
                'Failed to get reward points information, refresh the page'
            );
        });

        it('should throw error when network request fails', async () => {
            // Arrange
            const networkError = new Error('Network error');
            vi.mocked(axiosInstance.get).mockRejectedValue(networkError);

            // Act & Assert
            await expect(RewardAPI.getListRewardPoint(mockOutletSlug)).rejects.toThrow(
                `Failed to fetch reward points information for: ${mockOutletSlug} with Error: Network error`
            );
        });

        it('should handle empty outlet slug', async () => {
            // Arrange
            const emptySlug = '';
            vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Invalid slug'));

            // Act & Assert
            await expect(RewardAPI.getListRewardPoint(emptySlug)).rejects.toThrow();
            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${emptySlug}/reward`);
        });

        it('should handle special characters in outlet slug', async () => {
            // Arrange
            const specialSlug = 'test-outlet-123!@#';
            const mockResponse: RewardResponse = {
                status: 'success',
                message: 'Success',
                data: {
                    point_balance: 0,
                    vouchers: [],
                    customer_points: [],
                },
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockResponse });

            // Act
            await RewardAPI.getListRewardPoint(specialSlug);

            // Assert
            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${specialSlug}/reward`);
        });
    });

    describe('getHistoryRewardPoint', () => {
        it('should successfully fetch reward points history', async () => {
            // Arrange
            const mockResponse: RewardResponse = {
                status: 'success',
                message: 'History fetched successfully',
                data: {
                    point_balance: 100,
                    vouchers: [],
                    customer_points: [
                        {
                            id: 1,
                            outlet_id: 1,
                            user_id: 1,
                            point: 50,
                            type: 1,
                            pointable_type: 'Order',
                            pointable_id: 123,
                            info: 'Purchase reward',
                            created_at: '2026-01-01',
                            updated_at: '2026-01-01',
                        },
                    ],
                },
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockResponse });

            // Act
            const result = await RewardAPI.getHistoryRewardPoint(mockOutletSlug);

            // Assert
            expect(axiosInstance.get).toHaveBeenCalledWith(
                `/outlet/${mockOutletSlug}/reward/history`
            );
            expect(result).toEqual(mockResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should show toast notification when history API returns error status', async () => {
            // Arrange
            const mockErrorResponse: RewardResponse = {
                status: 'error',
                message: 'Failed to fetch history',
                data: {
                    point_balance: 0,
                    vouchers: [],
                    customer_points: [],
                },
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockErrorResponse });

            // Act
            const result = await RewardAPI.getHistoryRewardPoint(mockOutletSlug);

            // Assert
            expect(toast.info).toHaveBeenCalledWith('Failed to fetch history');
            expect(result).toEqual(mockErrorResponse);
        });

        it('should show default error message when history API returns error without message', async () => {
            // Arrange
            const mockErrorResponse: RewardResponse = {
                status: 'error',
                message: '',
                data: {
                    point_balance: 0,
                    vouchers: [],
                    customer_points: [],
                },
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockErrorResponse });

            // Act
            await RewardAPI.getHistoryRewardPoint(mockOutletSlug);

            // Assert
            expect(toast.info).toHaveBeenCalledWith(
                'Failed to get reward points history information, refresh the page'
            );
        });

        it('should throw error when history network request fails', async () => {
            // Arrange
            const networkError = new Error('Connection timeout');
            vi.mocked(axiosInstance.get).mockRejectedValue(networkError);

            // Act & Assert
            await expect(RewardAPI.getHistoryRewardPoint(mockOutletSlug)).rejects.toThrow(
                `Failed to fetch reward points history information for: ${mockOutletSlug} with Error: Connection timeout`
            );
        });

        it('should handle null response data', async () => {
            // Arrange
            vi.mocked(axiosInstance.get).mockResolvedValue({ data: null });

            // Act & Assert
            await expect(RewardAPI.getHistoryRewardPoint(mockOutletSlug)).rejects.toThrow();
        });

        it('should handle undefined response', async () => {
            // Arrange
            vi.mocked(axiosInstance.get).mockResolvedValue({ data: undefined });

            // Act & Assert
            await expect(RewardAPI.getHistoryRewardPoint(mockOutletSlug)).rejects.toThrow();
        });

        it('should handle multiple customer points in history', async () => {
            // Arrange
            const mockResponse: RewardResponse = {
                status: 'success',
                message: 'Success',
                data: {
                    point_balance: 200,
                    vouchers: [],
                    customer_points: [
                        {
                            id: 1,
                            outlet_id: 1,
                            user_id: 1,
                            point: 50,
                            type: 1,
                            pointable_type: 'Order',
                            pointable_id: 123,
                            info: 'Purchase reward',
                            created_at: '2026-01-01',
                            updated_at: '2026-01-01',
                        },
                        {
                            id: 2,
                            outlet_id: 1,
                            user_id: 1,
                            point: -30,
                            type: 2,
                            pointable_type: 'Voucher',
                            pointable_id: 456,
                            info: 'Voucher redemption',
                            created_at: '2026-01-02',
                            updated_at: '2026-01-02',
                        },
                    ],
                },
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({ data: mockResponse });

            // Act
            const result = await RewardAPI.getHistoryRewardPoint(mockOutletSlug);

            // Assert
            expect(result.data.customer_points).toHaveLength(2);
            expect(result.data.customer_points[0].point).toBe(50);
            expect(result.data.customer_points[1].point).toBe(-30);
        });
    });
});
