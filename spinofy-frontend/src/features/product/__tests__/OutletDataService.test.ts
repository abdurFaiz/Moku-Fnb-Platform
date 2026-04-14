import { describe, it, expect, beforeEach } from 'vitest';
import { OutletDataService } from '../services/OutletDataService';
import { PRODUCT_ERROR_MESSAGES } from '../constant/productQueryConstant';
import type { Outlet } from '../types/ProductQuery';

describe('OutletDataService', () => {
    let service: OutletDataService;

    const mockOutlets: Outlet[] = [
        { id: 1, slug: 'cafe-1', name: 'Cafe 1', address: '123 St', phone: '123', is_active: 1 } as any,
        { id: 2, slug: 'cafe-2', name: 'Cafe 2', address: '456 St', phone: '456', is_active: 1 } as any,
        { id: 3, slug: 'cafe-3', name: 'Cafe 3', address: '789 St', phone: '789', is_active: 1 } as any,
    ];

    beforeEach(() => {
        service = new OutletDataService();
    });

    describe('findOutletBySlug', () => {
        it('should find outlet by slug', () => {
            const result = service.findOutletBySlug(mockOutlets, 'cafe-2');

            expect(result).toEqual(mockOutlets[1]);
            expect(result?.name).toBe('Cafe 2');
        });

        it('should return null when slug not found', () => {
            const result = service.findOutletBySlug(mockOutlets, 'non-existent');

            expect(result).toBeNull();
        });

        it('should return null when slug is null', () => {
            const result = service.findOutletBySlug(mockOutlets, null);

            expect(result).toBeNull();
        });

        it('should return null when slug is undefined', () => {
            const result = service.findOutletBySlug(mockOutlets, undefined);

            expect(result).toBeNull();
        });

        it('should return null when slug is empty string', () => {
            const result = service.findOutletBySlug(mockOutlets, '');

            expect(result).toBeNull();
        });

        it('should return null when outlets array is empty', () => {
            const result = service.findOutletBySlug([], 'cafe-1');

            expect(result).toBeNull();
        });

        it('should return null when outlets is not an array', () => {
            const result = service.findOutletBySlug(null as any, 'cafe-1');

            expect(result).toBeNull();
        });

        it('should handle case-sensitive slug matching', () => {
            const result = service.findOutletBySlug(mockOutlets, 'CAFE-1');

            expect(result).toBeNull(); // Should not match due to case sensitivity
        });

        it('should find first outlet when multiple outlets exist', () => {
            const result = service.findOutletBySlug(mockOutlets, 'cafe-1');

            expect(result).toEqual(mockOutlets[0]);
        });

        it('should find last outlet', () => {
            const result = service.findOutletBySlug(mockOutlets, 'cafe-3');

            expect(result).toEqual(mockOutlets[2]);
        });

        it('should handle special characters in slug', () => {
            const specialOutlets: Outlet[] = [
                { id: 1, slug: 'café-français', name: 'French Cafe', address: '', phone: '', is_active: 1 } as any,
            ];

            const result = service.findOutletBySlug(specialOutlets, 'café-français');

            expect(result).toEqual(specialOutlets[0]);
        });
    });

    describe('getFirstOutlet', () => {
        it('should return first outlet from array', () => {
            const result = service.getFirstOutlet(mockOutlets);

            expect(result).toEqual(mockOutlets[0]);
            expect(result.slug).toBe('cafe-1');
        });

        it('should throw error when outlets array is empty', () => {
            expect(() => service.getFirstOutlet([])).toThrow(
                PRODUCT_ERROR_MESSAGES.NO_OUTLETS_AVAILABLE
            );
        });

        it('should throw error when outlets is not an array', () => {
            expect(() => service.getFirstOutlet(null as any)).toThrow(
                PRODUCT_ERROR_MESSAGES.NO_OUTLETS_AVAILABLE
            );
        });

        it('should throw error when outlets is undefined', () => {
            expect(() => service.getFirstOutlet(undefined as any)).toThrow(
                PRODUCT_ERROR_MESSAGES.NO_OUTLETS_AVAILABLE
            );
        });

        it('should return first outlet even if only one exists', () => {
            const singleOutlet = [mockOutlets[0]];
            const result = service.getFirstOutlet(singleOutlet);

            expect(result).toEqual(mockOutlets[0]);
        });

        it('should return first outlet from large array', () => {
            const manyOutlets = [...mockOutlets, ...mockOutlets, ...mockOutlets];
            const result = service.getFirstOutlet(manyOutlets);

            expect(result).toEqual(mockOutlets[0]);
        });
    });

    describe('isValidOutlet', () => {
        it('should return true for valid outlet', () => {
            const result = service.isValidOutlet(mockOutlets[0]);

            expect(result).toBe(true);
        });

        it('should return false for null outlet', () => {
            const result = service.isValidOutlet(null);

            expect(result).toBe(false);
        });

        it('should return false for outlet with empty slug', () => {
            const invalidOutlet: Outlet = {
                id: 1,
                slug: '',
                name: 'Invalid',
                address: '',
                phone: '',
                is_active: 1,
            } as any;

            const result = service.isValidOutlet(invalidOutlet);

            expect(result).toBe(false);
        });

        it('should return false for outlet with null slug', () => {
            const invalidOutlet = {
                id: 1,
                slug: null,
                name: 'Invalid',
                address: '',
                phone: '',
                is_active: 1,
            } as any;

            const result = service.isValidOutlet(invalidOutlet);

            expect(result).toBe(false);
        });

        it('should return false for outlet with undefined slug', () => {
            const invalidOutlet = {
                id: 1,
                name: 'Invalid',
                address: '',
                phone: '',
                is_active: 1,
            } as any;

            const result = service.isValidOutlet(invalidOutlet);

            expect(result).toBe(false);
        });

        it('should return true for outlet with whitespace slug', () => {
            const outletWithWhitespace: Outlet = {
                id: 1,
                slug: '   ',
                name: 'Whitespace',
                address: '',
                phone: '',
                is_active: 1,
            } as any;

            const result = service.isValidOutlet(outletWithWhitespace);

            expect(result).toBe(true); // Has length > 0
        });

        it('should return false for undefined', () => {
            const result = service.isValidOutlet(undefined as any);

            expect(result).toBe(false);
        });
    });

    describe('getOutletSlug', () => {
        it('should return slug from valid outlet', () => {
            const result = service.getOutletSlug(mockOutlets[0]);

            expect(result).toBe('cafe-1');
        });

        it('should return null for null outlet', () => {
            const result = service.getOutletSlug(null);

            expect(result).toBeNull();
        });

        it('should return null for undefined outlet', () => {
            const result = service.getOutletSlug(undefined as any);

            expect(result).toBeNull();
        });

        it('should return null for outlet with undefined slug', () => {
            const outletNoSlug = {
                id: 1,
                name: 'No Slug',
                address: '',
                phone: '',
                is_active: 1,
            } as any;

            const result = service.getOutletSlug(outletNoSlug);

            expect(result).toBeNull();
        });

        it('should return empty string if outlet has empty slug', () => {
            const outletEmptySlug: Outlet = {
                id: 1,
                slug: '',
                name: 'Empty Slug',
                address: '',
                phone: '',
                is_active: 1,
            } as any;

            const result = service.getOutletSlug(outletEmptySlug);

            expect(result).toBeNull(); // Empty string is falsy
        });

        it('should return slug with special characters', () => {
            const specialOutlet: Outlet = {
                id: 1,
                slug: 'café-123',
                name: 'Special',
                address: '',
                phone: '',
                is_active: 1,
            } as any;

            const result = service.getOutletSlug(specialOutlet);

            expect(result).toBe('café-123');
        });

        it('should return slug with numbers', () => {
            const numericOutlet: Outlet = {
                id: 1,
                slug: 'outlet-123-456',
                name: 'Numeric',
                address: '',
                phone: '',
                is_active: 1,
            } as any;

            const result = service.getOutletSlug(numericOutlet);

            expect(result).toBe('outlet-123-456');
        });
    });
});
