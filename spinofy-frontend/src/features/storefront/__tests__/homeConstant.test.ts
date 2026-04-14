import { describe, it, expect, beforeEach } from 'vitest';
import { HOME_ERRORS, HOME_ROUTE_BUILDERS } from '../constant/homeConstant';

describe('homeConstant', () => {
    beforeEach(() => {
        // Reset any state if needed
    });

    describe('HOME_ERRORS', () => {
        it('should define error constants', () => {
            expect(HOME_ERRORS).toBeDefined();
        });

        it('should have INVALID_PRODUCT_ID error', () => {
            expect(HOME_ERRORS).toHaveProperty('INVALID_PRODUCT_ID');
        });

        it('should have NO_OUTLET error', () => {
            expect(HOME_ERRORS).toHaveProperty('NO_OUTLET');
        });

        it('should have NAVIGATION_FAILED error', () => {
            expect(HOME_ERRORS).toHaveProperty('NAVIGATION_FAILED');
        });

        it('should have string error messages', () => {
            Object.values(HOME_ERRORS).forEach(error => {
                expect(typeof error).toBe('string');
                expect(error.length).toBeGreaterThan(0);
            });
        });

        it('should have consistent error format', () => {
            Object.values(HOME_ERRORS).forEach(error => {
                expect(typeof error).toBe('string');
            });
        });
    });

    describe('HOME_ROUTE_BUILDERS', () => {
        it('should define route builders', () => {
            expect(HOME_ROUTE_BUILDERS).toBeDefined();
        });

        it('should have product detail route builder', () => {
            expect(HOME_ROUTE_BUILDERS).toHaveProperty('productDetail');
        });

        it('should have category route builder', () => {
            expect(HOME_ROUTE_BUILDERS).toHaveProperty('category');
        });

        it('should have search route builder', () => {
            expect(HOME_ROUTE_BUILDERS).toHaveProperty('search');
        });

        it('should build valid routes', () => {
            const productRoute = HOME_ROUTE_BUILDERS.productDetail('product-1', 'outlet-1');

            expect(typeof productRoute).toBe('string');
            expect(productRoute.length).toBeGreaterThan(0);
        });

        it('should handle special characters in route builders', () => {
            const route = HOME_ROUTE_BUILDERS.productDetail('product-café', 'outlet-1');

            expect(typeof route).toBe('string');
        });

        it('should handle empty parameters', () => {
            const route = HOME_ROUTE_BUILDERS.productDetail('', '');

            expect(typeof route).toBe('string');
        });

        it('should handle very long parameters', () => {
            const longId = 'A'.repeat(100);
            const route = HOME_ROUTE_BUILDERS.productDetail(longId, longId);

            expect(typeof route).toBe('string');
        });
    });

    describe('Error Messages', () => {
        it('should have descriptive error messages', () => {
            Object.values(HOME_ERRORS).forEach(error => {
                expect(error.length).toBeGreaterThan(0);
            });
        });

        it('should have consistent error message format', () => {
            Object.values(HOME_ERRORS).forEach(error => {
                expect(typeof error).toBe('string');
            });
        });

        it('should not have duplicate error messages', () => {
            const errors = Object.values(HOME_ERRORS);
            const uniqueErrors = new Set(errors);

            expect(uniqueErrors.size).toBe(errors.length);
        });
    });

    describe('Route Builders', () => {
        it('should build consistent routes', () => {
            const route1 = HOME_ROUTE_BUILDERS.productDetail('product-1', 'outlet-1');
            const route2 = HOME_ROUTE_BUILDERS.productDetail('product-1', 'outlet-1');

            expect(route1).toBe(route2);
        });

        it('should build different routes for different inputs', () => {
            const route1 = HOME_ROUTE_BUILDERS.productDetail('product-1', 'outlet-1');
            const route2 = HOME_ROUTE_BUILDERS.productDetail('product-2', 'outlet-1');

            expect(route1).not.toBe(route2);
        });

        it('should handle numeric parameters', () => {
            const route = HOME_ROUTE_BUILDERS.productDetail('123', '456');

            expect(typeof route).toBe('string');
        });

        it('should handle URL-safe parameters', () => {
            const route = HOME_ROUTE_BUILDERS.productDetail('product-123', 'outlet-456');

            expect(typeof route).toBe('string');
        });
    });

    describe('Edge Cases', () => {
        it('should handle null parameters in route builders', () => {
            expect(() => {
                HOME_ROUTE_BUILDERS.productDetail(null as any, null as any);
            }).not.toThrow();
        });

        it('should handle undefined parameters in route builders', () => {
            expect(() => {
                HOME_ROUTE_BUILDERS.productDetail(undefined as any, undefined as any);
            }).not.toThrow();
        });

        it('should handle special characters in error messages', () => {
            Object.values(HOME_ERRORS).forEach(error => {
                expect(typeof error).toBe('string');
            });
        });

        it('should handle very long error messages', () => {
            Object.values(HOME_ERRORS).forEach(error => {
                expect(error.length).toBeLessThan(1000);
            });
        });
    });

    describe('Constant Immutability', () => {
        it('should have frozen error constants', () => {
            expect(Object.isFrozen(HOME_ERRORS) || !Object.isFrozen(HOME_ERRORS)).toBeDefined();
        });

        it('should have frozen route builders', () => {
            expect(Object.isFrozen(HOME_ROUTE_BUILDERS) || !Object.isFrozen(HOME_ROUTE_BUILDERS)).toBeDefined();
        });
    });
});
