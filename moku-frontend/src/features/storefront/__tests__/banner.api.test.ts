import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BannerAPI } from '../api/banner.api';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';
import type { BannerResponse } from '../types/Banner';

vi.mock('@/lib/axios');
vi.mock('sonner');

const mockMediaItem = {
    id: 1,
    model_type: 'Banner',
    model_id: 1,
    uuid: 'media-uuid-1',
    collection_name: 'banners',
    name: 'banner1',
    file_name: 'banner1.jpg',
    mime_type: 'image/jpeg',
    disk: 'public',
    conversions_disk: 'public',
    size: 102400,
    manipulations: [],
    custom_properties: [],
    generated_conversions: [],
    responsive_images: [],
    order_column: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    original_url: 'https://example.com/banner1.jpg',
    preview_url: 'https://example.com/banner1-preview.jpg',
};

const mockBannerResponse: BannerResponse = {
    status: 'success',
    message: 'Banners retrieved successfully',
    data: {
        banners: [
            {
                id: 1,
                link: '/products/summer-sale',
                outlet_id: 1,
                banner_url: 'https://example.com/banner1.jpg',
                media: [mockMediaItem],
            },
            {
                id: 2,
                link: '/products/new',
                outlet_id: 1,
                banner_url: 'https://example.com/banner2.jpg',
                media: [{ ...mockMediaItem, id: 2, model_id: 2, uuid: 'media-uuid-2' }],
            },
        ],
    },
};

describe('BannerAPI', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getListBanner', () => {
        describe('Successful Requests', () => {
            it('should fetch banners successfully', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockBannerResponse,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/test-outlet/banner');
                expect(result).toEqual(mockBannerResponse);
                expect(toast.info).not.toHaveBeenCalled();
            });

            it('should handle empty banner list', async () => {
                const emptyResponse: BannerResponse = {
                    status: 'success',
                    message: 'No banners found',
                    data: {
                        banners: [],
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: emptyResponse,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(result).toEqual(emptyResponse);
                expect(result.data.banners).toHaveLength(0);
            });

            it('should handle single banner', async () => {
                const singleBannerResponse: BannerResponse = {
                    ...mockBannerResponse,
                    data: {
                        banners: [mockBannerResponse.data.banners[0]],
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: singleBannerResponse,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(result.data.banners).toHaveLength(1);
            });

            it('should handle multiple banners', async () => {
                const multipleBanners: BannerResponse = {
                    ...mockBannerResponse,
                    data: {
                        banners: [
                            ...mockBannerResponse.data.banners,
                            {
                                id: 3,
                                link: '/flash-sale',
                                outlet_id: 1,
                                banner_url: 'https://example.com/banner3.jpg',
                                media: [{ ...mockMediaItem, id: 3, model_id: 3, uuid: 'media-uuid-3' }],
                            },
                        ],
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: multipleBanners,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(result.data.banners).toHaveLength(3);
            });

            it('should handle different outlet slugs', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockBannerResponse,
                });

                await BannerAPI.getListBanner('different-outlet');

                expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/different-outlet/banner');
            });

            it('should handle outlet slug with special characters', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockBannerResponse,
                });

                await BannerAPI.getListBanner('cafe-123-test');

                expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/cafe-123-test/banner');
            });

            it('should handle banners with empty media', async () => {
                const emptyMediaBannerResponse: BannerResponse = {
                    ...mockBannerResponse,
                    data: {
                        banners: [
                            {
                                ...mockBannerResponse.data.banners[0],
                                media: [],
                            },
                        ],
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: emptyMediaBannerResponse,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(result.data.banners[0].media).toHaveLength(0);
            });
        });

        describe('Error Handling', () => {
            it('should handle error response with message', async () => {
                const errorResponse: BannerResponse = {
                    status: 'error',
                    message: 'Banners not found',
                    data: {
                        banners: [],
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: errorResponse,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(result).toEqual(errorResponse);
                expect(toast.info).toHaveBeenCalledWith('Banners not found');
            });

            it('should handle error response without message', async () => {
                const errorResponse: BannerResponse = {
                    status: 'error',
                    message: '',
                    data: {
                        banners: [],
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: errorResponse,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(result).toEqual(errorResponse);
                expect(toast.info).toHaveBeenCalledWith('Failed to get banner information, refresh the page');
            });

            it('should throw error on network failure', async () => {
                vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Network error'));

                await expect(BannerAPI.getListBanner('test-outlet')).rejects.toThrow(
                    'Failed to fetch banner information for: test-outlet with Error: Network error'
                );
            });

            it('should throw error on timeout', async () => {
                vi.mocked(axiosInstance.get).mockRejectedValue(new Error('Timeout'));

                await expect(BannerAPI.getListBanner('test-outlet')).rejects.toThrow(
                    'Failed to fetch banner information for: test-outlet with Error: Timeout'
                );
            });

            it('should throw error on 404', async () => {
                const error = new Error('Request failed with status code 404');
                vi.mocked(axiosInstance.get).mockRejectedValue(error);

                await expect(BannerAPI.getListBanner('non-existent-outlet')).rejects.toThrow(
                    'Failed to fetch banner information for: non-existent-outlet'
                );
            });

            it('should throw error on 500', async () => {
                const error = new Error('Request failed with status code 500');
                vi.mocked(axiosInstance.get).mockRejectedValue(error);

                await expect(BannerAPI.getListBanner('test-outlet')).rejects.toThrow(
                    'Failed to fetch banner information for: test-outlet'
                );
            });

            it('should handle axios error with response', async () => {
                const axiosError = {
                    response: {
                        status: 403,
                        data: { message: 'Forbidden' },
                    },
                    message: 'Request failed',
                };
                vi.mocked(axiosInstance.get).mockRejectedValue(axiosError);

                await expect(BannerAPI.getListBanner('test-outlet')).rejects.toThrow();
            });
        });

        describe('Edge Cases', () => {
            it('should handle empty outlet slug', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockBannerResponse,
                });

                await BannerAPI.getListBanner('');

                expect(axiosInstance.get).toHaveBeenCalledWith('/outlet//banner');
            });

            it('should handle very long outlet slug', async () => {
                const longSlug = 'a'.repeat(200);
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockBannerResponse,
                });

                await BannerAPI.getListBanner(longSlug);

                expect(axiosInstance.get).toHaveBeenCalledWith(`/outlet/${longSlug}/banner`);
            });

            it('should handle outlet slug with spaces', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockBannerResponse,
                });

                await BannerAPI.getListBanner('test outlet');

                expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/test outlet/banner');
            });

            it('should handle outlet slug with unicode characters', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockBannerResponse,
                });

                await BannerAPI.getListBanner('café-ñoño');

                expect(axiosInstance.get).toHaveBeenCalledWith('/outlet/café-ñoño/banner');
            });

            it('should handle null banner data', async () => {
                const nullDataResponse: any = {
                    status: 'success',
                    message: 'Success',
                    data: null,
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: nullDataResponse,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(result.data).toBeNull();
            });

            it('should handle undefined banner properties', async () => {
                const undefinedPropsResponse: any = {
                    status: 'success',
                    message: 'Success',
                    data: {
                        banners: [
                            {
                                id: 1,
                                link: '/test',
                                outlet_id: 1,
                                banner_url: 'https://example.com/banner.jpg',
                                media: [],
                            },
                        ],
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: undefinedPropsResponse,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(result.data.banners[0].id).toBe(1);
            });
        });

        describe('Response Structure', () => {
            it('should return correct response structure', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockBannerResponse,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(result).toHaveProperty('status');
                expect(result).toHaveProperty('message');
                expect(result).toHaveProperty('data');
                expect(result.data).toHaveProperty('banners');
            });

            it('should return banners with correct properties', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockBannerResponse,
                });

                const result = await BannerAPI.getListBanner('test-outlet');
                const banner = result.data.banners[0];

                expect(banner).toHaveProperty('id');
                expect(banner).toHaveProperty('link');
                expect(banner).toHaveProperty('outlet_id');
                expect(banner).toHaveProperty('banner_url');
                expect(banner).toHaveProperty('media');
            });

            it('should return banners in correct order', async () => {
                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: mockBannerResponse,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(result.data.banners[0].id).toBe(1);
                expect(result.data.banners[1].id).toBe(2);
            });
        });

        describe('Performance', () => {
            it('should handle large number of banners', async () => {
                const largeBannerList: BannerResponse = {
                    status: 'success',
                    message: 'Success',
                    data: {
                        banners: Array.from({ length: 100 }, (_, i) => ({
                            id: i + 1,
                            link: `/banner${i + 1}`,
                            outlet_id: 1,
                            banner_url: `https://example.com/banner${i + 1}.jpg`,
                            media: [{ ...mockMediaItem, id: i + 1, model_id: i + 1, uuid: `media-uuid-${i + 1}` }],
                        })),
                    },
                };

                vi.mocked(axiosInstance.get).mockResolvedValue({
                    data: largeBannerList,
                });

                const result = await BannerAPI.getListBanner('test-outlet');

                expect(result.data.banners).toHaveLength(100);
            });
        });
    });
});
