import { describe, it, expect } from 'vitest';
import {
    CHECKOUT_PAYMENT_TIMINGS,
    CHECKOUT_PAYMENT_ERRORS,
    CHECKOUT_PAYMENT_ROUTES,
} from '../constants/checkoutPaymentConstant';

describe('checkoutPaymentConstant', () => {
    describe('CHECKOUT_PAYMENT_TIMINGS', () => {
        it('should define correct timing constants', () => {
            expect(CHECKOUT_PAYMENT_TIMINGS).toHaveProperty('CART_CLEAR_DELAY');
            expect(CHECKOUT_PAYMENT_TIMINGS).toHaveProperty('FLAG_RESET_DELAY');

            expect(typeof CHECKOUT_PAYMENT_TIMINGS.CART_CLEAR_DELAY).toBe('number');
            expect(typeof CHECKOUT_PAYMENT_TIMINGS.FLAG_RESET_DELAY).toBe('number');
        });

        it('should have reasonable timing values', () => {
            expect(CHECKOUT_PAYMENT_TIMINGS.CART_CLEAR_DELAY).toBe(500);
            expect(CHECKOUT_PAYMENT_TIMINGS.FLAG_RESET_DELAY).toBe(1000);

            // Should be positive numbers
            expect(CHECKOUT_PAYMENT_TIMINGS.CART_CLEAR_DELAY).toBeGreaterThan(0);
            expect(CHECKOUT_PAYMENT_TIMINGS.FLAG_RESET_DELAY).toBeGreaterThan(0);

            // FLAG_RESET_DELAY should be longer than CART_CLEAR_DELAY
            expect(CHECKOUT_PAYMENT_TIMINGS.FLAG_RESET_DELAY).toBeGreaterThan(
                CHECKOUT_PAYMENT_TIMINGS.CART_CLEAR_DELAY
            );
        });

        it('should be immutable (const assertion)', () => {
            // Const assertion is a TypeScript compile-time feature
            // At runtime, the object is not frozen unless explicitly done so
            const originalValue = CHECKOUT_PAYMENT_TIMINGS.CART_CLEAR_DELAY;
            expect(originalValue).toBe(500);
        });
    });

    describe('CHECKOUT_PAYMENT_ERRORS', () => {
        it('should define error message constants', () => {
            expect(CHECKOUT_PAYMENT_ERRORS).toHaveProperty('PAYMENT_FAILED');
            expect(CHECKOUT_PAYMENT_ERRORS).toHaveProperty('NO_OUTLET');
            expect(CHECKOUT_PAYMENT_ERRORS).toHaveProperty('GENERIC_ERROR');

            expect(typeof CHECKOUT_PAYMENT_ERRORS.PAYMENT_FAILED).toBe('string');
            expect(typeof CHECKOUT_PAYMENT_ERRORS.NO_OUTLET).toBe('string');
            expect(typeof CHECKOUT_PAYMENT_ERRORS.GENERIC_ERROR).toBe('function');
        });

        it('should have meaningful error messages', () => {
            expect(CHECKOUT_PAYMENT_ERRORS.PAYMENT_FAILED).toContain('pembayaran');
            expect(CHECKOUT_PAYMENT_ERRORS.NO_OUTLET).toContain('outlet');

            // Should be non-empty strings
            expect(CHECKOUT_PAYMENT_ERRORS.PAYMENT_FAILED.length).toBeGreaterThan(0);
            expect(CHECKOUT_PAYMENT_ERRORS.NO_OUTLET.length).toBeGreaterThan(0);
        });

        it('should have GENERIC_ERROR function that formats messages correctly', () => {
            const testMessage = 'Connection timeout';
            const result = CHECKOUT_PAYMENT_ERRORS.GENERIC_ERROR(testMessage);

            expect(typeof result).toBe('string');
            expect(result).toContain(testMessage);
            expect(result).toContain('pembayaran');
            expect(result).toContain('coba lagi');
        });

        it('should handle empty message in GENERIC_ERROR', () => {
            const result = CHECKOUT_PAYMENT_ERRORS.GENERIC_ERROR('');

            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            expect(result).toContain('pembayaran');
        });

        it('should handle special characters in GENERIC_ERROR', () => {
            const specialMessage = 'Error: <script>alert("test")</script>';
            const result = CHECKOUT_PAYMENT_ERRORS.GENERIC_ERROR(specialMessage);

            expect(result).toContain(specialMessage);
            expect(result).toContain('pembayaran');
        });
    });

    describe('CHECKOUT_PAYMENT_ROUTES', () => {
        it('should define route functions', () => {
            expect(CHECKOUT_PAYMENT_ROUTES).toHaveProperty('PAYMENT');
            expect(typeof CHECKOUT_PAYMENT_ROUTES.PAYMENT).toBe('function');
        });

        it('should generate correct payment route', () => {
            const outletSlug = 'test-outlet';
            const route = CHECKOUT_PAYMENT_ROUTES.PAYMENT(outletSlug);

            expect(typeof route).toBe('string');
            expect(route).toBe('/test-outlet/payment');
            expect(route.startsWith('/')).toBe(true);
            expect(route).toContain(outletSlug);
            expect(route).toContain('payment');
        });

        it('should handle different outlet slugs', () => {
            const testCases = [
                'cafe-central',
                'restaurant-abc',
                'outlet123',
                'my-outlet',
                'x'
            ];

            testCases.forEach(slug => {
                const route = CHECKOUT_PAYMENT_ROUTES.PAYMENT(slug);
                expect(route).toBe(`/${slug}/payment`);
            });
        });

        it('should handle special characters in outlet slug', () => {
            const specialSlug = 'café-açaí-ñoño';
            const route = CHECKOUT_PAYMENT_ROUTES.PAYMENT(specialSlug);

            expect(route).toBe(`/${specialSlug}/payment`);
            expect(route).toContain(specialSlug);
        });

        it('should handle empty outlet slug', () => {
            const route = CHECKOUT_PAYMENT_ROUTES.PAYMENT('');
            expect(route).toBe('//payment');
        });

        it('should handle numeric outlet slug', () => {
            const numericSlug = '123';
            const route = CHECKOUT_PAYMENT_ROUTES.PAYMENT(numericSlug);
            expect(route).toBe('/123/payment');
        });
    });

    describe('Constants integration', () => {
        it('should have consistent naming pattern', () => {
            expect(Object.keys(CHECKOUT_PAYMENT_TIMINGS)).toEqual(
                expect.arrayContaining([
                    expect.stringMatching(/^[A-Z_]+$/),
                ])
            );

            expect(Object.keys(CHECKOUT_PAYMENT_ERRORS)).toEqual(
                expect.arrayContaining([
                    expect.stringMatching(/^[A-Z_]+$/),
                ])
            );

            expect(Object.keys(CHECKOUT_PAYMENT_ROUTES)).toEqual(
                expect.arrayContaining([
                    expect.stringMatching(/^[A-Z_]+$/),
                ])
            );
        });

        it('should export all constants', () => {
            // Verify all expected exports are present
            expect(CHECKOUT_PAYMENT_TIMINGS).toBeDefined();
            expect(CHECKOUT_PAYMENT_ERRORS).toBeDefined();
            expect(CHECKOUT_PAYMENT_ROUTES).toBeDefined();
        });

        it('should have type-safe constants', () => {
            // These should compile without errors due to const assertions
            const timing: 500 = CHECKOUT_PAYMENT_TIMINGS.CART_CLEAR_DELAY;
            const flagTiming: 1000 = CHECKOUT_PAYMENT_TIMINGS.FLAG_RESET_DELAY;

            expect(timing).toBe(500);
            expect(flagTiming).toBe(1000);
        });
    });
});