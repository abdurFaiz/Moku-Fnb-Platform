import { describe, it, expect, beforeEach } from 'vitest';
import { getErrorMessage } from '../utils/errorHandler';

describe('errorHandler', () => {
    beforeEach(() => {
        // Reset any state if needed
    });

    describe('getErrorMessage', () => {
        it('should handle string errors', () => {
            const error = 'Test error message';
            const result = getErrorMessage(error);

            expect(result).toBe('Test error message');
        });

        it('should handle Error objects', () => {
            const error = new Error('Test error');
            const result = getErrorMessage(error);

            expect(result).toContain('Test error');
        });

        it('should handle null errors', () => {
            const result = getErrorMessage(null);

            expect(result).toBeDefined();
        });

        it('should handle undefined errors', () => {
            const result = getErrorMessage(undefined);

            expect(result).toBeDefined();
        });

        it('should handle object errors', () => {
            const error = { message: 'Object error' };
            const result = getErrorMessage(error);

            expect(result).toBeDefined();
        });

        it('should handle empty string errors', () => {
            const result = getErrorMessage('');

            expect(result).toBeDefined();
        });

        it('should handle very long error messages', () => {
            const longError = 'A'.repeat(1000);
            const result = getErrorMessage(longError);

            expect(result).toBeDefined();
        });

        it('should handle special characters in errors', () => {
            const error = 'Error: Café & Restaurant failed!';
            const result = getErrorMessage(error);

            expect(result).toContain('Café & Restaurant');
        });

        it('should handle network errors', () => {
            const error = new Error('Network error');
            const result = getErrorMessage(error);

            expect(result).toBeDefined();
        });

        it('should handle validation errors', () => {
            const error = 'Validation failed: Invalid input';
            const result = getErrorMessage(error);

            expect(result).toBeDefined();
        });

        it('should handle API errors', () => {
            const error = { status: 500, message: 'Internal Server Error' };
            const result = getErrorMessage(error);

            expect(result).toBeDefined();
        });
    });

    describe('Error Formatting', () => {
        it('should format error messages consistently', () => {
            const error1 = getErrorMessage('Error 1');
            const error2 = getErrorMessage('Error 2');

            expect(typeof error1).toBe(typeof error2);
        });

        it('should preserve error context', () => {
            const error = 'Failed to load products';
            const result = getErrorMessage(error);

            expect(result).toContain('products');
        });
    });

    describe('Edge Cases', () => {
        it('should handle circular references', () => {
            const obj: any = {};
            obj.self = obj;

            expect(() => getErrorMessage(obj)).not.toThrow();
        });

        it('should handle very large objects', () => {
            const largeObj = { message: 'A'.repeat(10000) };

            expect(() => getErrorMessage(largeObj)).not.toThrow();
        });

        it('should handle mixed error types', () => {
            const errors = [
                'String error',
                new Error('Error object'),
                { message: 'Object error' },
                null,
                undefined,
            ];

            errors.forEach(error => {
                expect(() => getErrorMessage(error)).not.toThrow();
            });
        });
    });
});
