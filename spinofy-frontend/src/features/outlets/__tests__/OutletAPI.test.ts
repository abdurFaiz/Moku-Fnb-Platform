import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OutletAPI } from '../api/outlet.api';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import { mockOutletResponse, mockSingleOutletResponse, mockErrorOutletResponse, mockErrorSingleOutletResponse } from './mockData';

vi.mock('@/lib/axios');
vi.mock('sonner');

describe('OutletAPI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getListOutlets', () => {
        it('should successfully fetch outlets list', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockOutletResponse,
            });

            const result = await OutletAPI.getListOutlets();

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet');
            expect(result).toEqual(mockOutletResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should show toast when API returns error status', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockErrorOutletResponse,
            });

            const result = await OutletAPI.getListOutlets();

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet');
            expect(toast.info).toHaveBeenCalledWith('Failed to fetch outlets');
            expect(result).toEqual(mockErrorOutletResponse);
        });

        it('should show default error message when API returns error without message', async () => {
            const errorResponseWithoutMessage = {
                ...mockErrorOutletResponse,
                message: '',
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: errorResponseWithoutMessage,
            });

            await OutletAPI.getListOutlets();

            expect(toast.info).toHaveBeenCalledWith('Failed to get outlets information, refresh the page');
        });

        it('should throw error when network request fails', async () => {
            const networkError = new Error('Network error');
            vi.mocked(axiosInstance.get).mockRejectedValue(networkError);

            await expect(OutletAPI.getListOutlets()).rejects.toThrow(
                'Failed to fetch outlets information: Error: Network error'
            );
        });

        it('should handle axios timeout error', async () => {
            const timeoutError = new Error('timeout of 5000ms exceeded');
            vi.mocked(axiosInstance.get).mockRejectedValue(timeoutError);

            await expect(OutletAPI.getListOutlets()).rejects.toThrow(
                'Failed to fetch outlets information:'
            );
        });

        it('should handle 404 error', async () => {
            const notFoundError = { response: { status: 404 } };
            vi.mocked(axiosInstance.get).mockRejectedValue(notFoundError);

            await expect(OutletAPI.getListOutlets()).rejects.toThrow();
        });

        it('should handle 500 server error', async () => {
            const serverError = { response: { status: 500 } };
            vi.mocked(axiosInstance.get).mockRejectedValue(serverError);

            await expect(OutletAPI.getListOutlets()).rejects.toThrow();
        });
    });

    describe('getOutlet', () => {
        const testSlug = 'test-outlet';

        it('should successfully fetch single outlet', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockSingleOutletResponse,
            });

            const result = await OutletAPI.getOutlet(testSlug);

            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${testSlug}`);
            expect(result).toEqual(mockSingleOutletResponse);
            expect(toast.info).not.toHaveBeenCalled();
        });

        it('should show toast when API returns error status', async () => {
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockErrorSingleOutletResponse,
            });

            const result = await OutletAPI.getOutlet(testSlug);

            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${testSlug}`);
            expect(toast.info).toHaveBeenCalledWith('Outlet not found');
            expect(result).toEqual(mockErrorSingleOutletResponse);
        });

        it('should show default error message when API returns error without message', async () => {
            const errorResponseWithoutMessage = {
                ...mockErrorSingleOutletResponse,
                message: '',
            };

            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: errorResponseWithoutMessage,
            });

            await OutletAPI.getOutlet(testSlug);

            expect(toast.info).toHaveBeenCalledWith('Failed to get outlet information, refresh the page');
        });

        it('should throw error when network request fails', async () => {
            const networkError = new Error('Network error');
            vi.mocked(axiosInstance.get).mockRejectedValue(networkError);

            await expect(OutletAPI.getOutlet(testSlug)).rejects.toThrow(
                `Failed to fetch outlet information for: ${testSlug}`
            );
        });

        it('should handle special characters in slug', async () => {
            const specialSlug = 'test-outlet-café';
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockSingleOutletResponse,
            });

            await OutletAPI.getOutlet(specialSlug);

            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${specialSlug}`);
        });

        it('should handle empty slug', async () => {
            const emptySlug = '';
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockSingleOutletResponse,
            });

            await OutletAPI.getOutlet(emptySlug);

            expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/');
        });

        it('should handle slug with numbers', async () => {
            const numericSlug = 'outlet-123';
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockSingleOutletResponse,
            });

            await OutletAPI.getOutlet(numericSlug);

            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${numericSlug}`);
        });

        it('should handle slug with hyphens', async () => {
            const hyphenatedSlug = 'test-outlet-name-here';
            vi.mocked(axiosInstance.get).mockResolvedValue({
                data: mockSingleOutletResponse,
            });

            await OutletAPI.getOutlet(hyphenatedSlug);

            expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${hyphenatedSlug}`);
        });
    });
});
