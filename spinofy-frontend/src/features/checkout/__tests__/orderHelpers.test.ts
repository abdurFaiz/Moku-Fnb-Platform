import { describe, it, expect } from 'vitest';
import { isBlockingStatus, isOrderBlocking } from '../utils/orderHelpers';

describe('orderHelpers', () => {
    describe('isBlockingStatus', () => {
        it('should return false for undefined status', () => {
            expect(isBlockingStatus(undefined)).toBe(false);
        });

        it('should return false for null status', () => {
            expect(isBlockingStatus(null)).toBe(false);
        });

        it('should return true for numeric status 2', () => {
            expect(isBlockingStatus(2)).toBe(true);
        });

        it('should return false for other numeric statuses', () => {
            expect(isBlockingStatus(1)).toBe(false);
            expect(isBlockingStatus(0)).toBe(false);
            expect(isBlockingStatus(3)).toBe(false);
            expect(isBlockingStatus(4)).toBe(false);
            expect(isBlockingStatus(-1)).toBe(false);
        });

        it('should return true for string status "menunggu-konfirmasi"', () => {
            expect(isBlockingStatus('menunggu-konfirmasi')).toBe(true);
        });

        it('should return true for string status "2"', () => {
            expect(isBlockingStatus('2')).toBe(true);
        });

        it('should return false for other string statuses', () => {
            expect(isBlockingStatus('0')).toBe(false);
            expect(isBlockingStatus('1')).toBe(false);
            expect(isBlockingStatus('3')).toBe(false);
            expect(isBlockingStatus('pending')).toBe(false);
            expect(isBlockingStatus('completed')).toBe(false);
            expect(isBlockingStatus('cancelled')).toBe(false);
        });

        it('should return false for non-numeric strings', () => {
            expect(isBlockingStatus('abc')).toBe(false);
            expect(isBlockingStatus('status-text')).toBe(false);
            expect(isBlockingStatus('2abc')).toBe(false);
            expect(isBlockingStatus('abc2')).toBe(false);
        });

        it('should handle empty string', () => {
            expect(isBlockingStatus('')).toBe(false);
        });

        it('should handle whitespace strings', () => {
            expect(isBlockingStatus(' ')).toBe(false);
            expect(isBlockingStatus('  2  ')).toBe(false); // Number() will parse this as 2, but it should return false
        });

        it('should handle decimal numbers', () => {
            expect(isBlockingStatus(2.0)).toBe(true);
            expect(isBlockingStatus(2.5)).toBe(false);
        });

        it('should handle string decimal numbers', () => {
            expect(isBlockingStatus('2.0')).toBe(true);
            expect(isBlockingStatus('2.5')).toBe(false);
        });
    });

    describe('isOrderBlocking', () => {
        it('should return false for undefined order', () => {
            expect(isOrderBlocking(undefined)).toBe(false);
        });

        it('should return false for null order', () => {
            expect(isOrderBlocking(null)).toBe(false);
        });

        it('should return false for order without status', () => {
            const order = {
                id: 1,
                code: 'ORDER123'
            };
            expect(isOrderBlocking(order)).toBe(false);
        });

        it('should return true for order with blocking status', () => {
            const order = {
                id: 1,
                code: 'ORDER123',
                status: 2
            };
            expect(isOrderBlocking(order)).toBe(true);
        });

        it('should return true for order with string blocking status', () => {
            const order = {
                id: 1,
                code: 'ORDER123',
                status: 'menunggu-konfirmasi'
            };
            expect(isOrderBlocking(order)).toBe(true);
        });

        it('should return true for order with string numeric blocking status', () => {
            const order = {
                id: 1,
                code: 'ORDER123',
                status: '2'
            };
            expect(isOrderBlocking(order)).toBe(true);
        });

        it('should return false for order with non-blocking status', () => {
            const order = {
                id: 1,
                code: 'ORDER123',
                status: 1
            };
            expect(isOrderBlocking(order)).toBe(false);
        });

        it('should return false for order with non-blocking string status', () => {
            const order = {
                id: 1,
                code: 'ORDER123',
                status: 'completed'
            };
            expect(isOrderBlocking(order)).toBe(false);
        });

        it('should return false for empty object', () => {
            expect(isOrderBlocking({})).toBe(false);
        });

        it('should handle complex order objects', () => {
            const order = {
                id: 1,
                uuid: 'order-uuid',
                code: 'ORDER123',
                status: 2,
                user_meta_data: {
                    name: 'John Doe',
                    email: 'john@example.com'
                },
                order_products: []
            };
            expect(isOrderBlocking(order)).toBe(true);
        });

        it('should handle order with nested status', () => {
            const order = {
                id: 1,
                payment_log: {
                    status: 2
                }
            };
            // This should return false because we're looking for order.status, not nested status
            expect(isOrderBlocking(order)).toBe(false);
        });
    });

    describe('edge cases and performance', () => {
        it('should handle very large numbers', () => {
            expect(isBlockingStatus(Number.MAX_SAFE_INTEGER)).toBe(false);
            expect(isBlockingStatus(Number.MIN_SAFE_INTEGER)).toBe(false);
        });

        it('should handle floating point precision', () => {
            expect(isBlockingStatus(1.9999999999999998)).toBe(true); // This rounds to 2
            expect(isBlockingStatus(2.0000000000000004)).toBe(true); // This rounds to 2
        });

        it('should handle boolean values', () => {
            // Type is MaybeStatus which includes number, string, undefined, null
            // but not boolean, so this tests runtime behavior
            expect(isBlockingStatus(true as any)).toBe(false);
            expect(isBlockingStatus(false as any)).toBe(false);
        });

        it('should handle array and object values', () => {
            expect(isBlockingStatus([] as any)).toBe(false);
            expect(isBlockingStatus({} as any)).toBe(false);
            expect(isBlockingStatus([2] as any)).toBe(false);
            expect(isBlockingStatus({ value: 2 } as any)).toBe(false);
        });

        it('should be consistent with repeated calls', () => {
            const status = 2;
            expect(isBlockingStatus(status)).toBe(true);
            expect(isBlockingStatus(status)).toBe(true);
            expect(isBlockingStatus(status)).toBe(true);
        });

        it('should handle special numeric values', () => {
            expect(isBlockingStatus(NaN)).toBe(false);
            expect(isBlockingStatus(Infinity)).toBe(false);
            expect(isBlockingStatus(-Infinity)).toBe(false);
        });

        it('should handle special string values', () => {
            expect(isBlockingStatus('NaN')).toBe(false);
            expect(isBlockingStatus('Infinity')).toBe(false);
            expect(isBlockingStatus('-Infinity')).toBe(false);
        });
    });
});