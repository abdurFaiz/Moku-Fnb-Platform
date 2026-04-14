import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    ApiResponseValidator,
    ApiError,
    DefaultErrorHandlingStrategy,
    createErrorHandler,
} from '../services/apiResponseValidator';
import { mockOutletResponse, mockSingleOutletResponse, mockErrorOutletResponse } from './mockData';

describe('ApiResponseValidator', () => {
    describe('validateOutletListResponse', () => {
        it('should validate successful outlet list response', () => {
            const result = ApiResponseValidator.validateOutletListResponse(mockOutletResponse);

            expect(result).toEqual(mockOutletResponse);
        });

        it('should throw ApiError when response is null', () => {
            expect(() => {
                ApiResponseValidator.validateOutletListResponse(null);
            }).toThrow(ApiError);

            try {
                ApiResponseValidator.validateOutletListResponse(null);
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect((error as ApiError).code).toBe('EMPTY_RESPONSE');
                expect((error as ApiError).message).toBe('No response received from API');
            }
        });

        it('should throw ApiError when response is undefined', () => {
            expect(() => {
                ApiResponseValidator.validateOutletListResponse(undefined);
            }).toThrow(ApiError);
        });

        it('should throw ApiError when status is not success', () => {
            expect(() => {
                ApiResponseValidator.validateOutletListResponse(mockErrorOutletResponse);
            }).toThrow(ApiError);

            try {
                ApiResponseValidator.validateOutletListResponse(mockErrorOutletResponse);
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect((error as ApiError).code).toBe('API_ERROR');
                expect((error as ApiError).message).toContain('Failed to fetch outlets');
            }
        });

        it('should throw ApiError when outlets data is missing', () => {
            const responseWithoutOutlets = {
                status: 'success',
                message: 'Success',
                data: {},
            };

            expect(() => {
                ApiResponseValidator.validateOutletListResponse(responseWithoutOutlets);
            }).toThrow(ApiError);

            try {
                ApiResponseValidator.validateOutletListResponse(responseWithoutOutlets);
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect((error as ApiError).code).toBe('MISSING_DATA');
                expect((error as ApiError).message).toBe('No outlets found in API response');
            }
        });

        it('should throw ApiError with unknown error message when message is missing', () => {
            const errorResponseWithoutMessage = {
                status: 'error',
                message: '',
                data: { outlets: [] },
            };

            try {
                ApiResponseValidator.validateOutletListResponse(errorResponseWithoutMessage);
            } catch (error) {
                expect((error as ApiError).message).toContain('Unknown error');
            }
        });

        it('should include original response in error', () => {
            try {
                ApiResponseValidator.validateOutletListResponse(mockErrorOutletResponse);
            } catch (error) {
                expect((error as ApiError).originalError).toEqual(mockErrorOutletResponse);
            }
        });

        it('should handle response with empty outlets array', () => {
            const responseWithEmptyOutlets = {
                status: 'success',
                message: 'Success',
                data: {
                    outlets: [],
                },
            };

            const result = ApiResponseValidator.validateOutletListResponse(responseWithEmptyOutlets);

            expect(result.data.outlets).toEqual([]);
        });
    });

    describe('validateSingleOutletResponse', () => {
        const testSlug = 'test-outlet';

        it('should validate successful single outlet response', () => {
            const result = ApiResponseValidator.validateSingleOutletResponse(
                mockSingleOutletResponse,
                testSlug
            );

            expect(result).toEqual(mockSingleOutletResponse);
        });

        it('should throw ApiError when response is null', () => {
            expect(() => {
                ApiResponseValidator.validateSingleOutletResponse(null, testSlug);
            }).toThrow(ApiError);

            try {
                ApiResponseValidator.validateSingleOutletResponse(null, testSlug);
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect((error as ApiError).code).toBe('EMPTY_RESPONSE');
                expect((error as ApiError).message).toContain(testSlug);
            }
        });

        it('should throw ApiError when response is undefined', () => {
            expect(() => {
                ApiResponseValidator.validateSingleOutletResponse(undefined, testSlug);
            }).toThrow(ApiError);
        });

        it('should throw ApiError when status is not success', () => {
            const errorResponse = {
                status: 'error',
                message: 'Outlet not found',
                data: { outlet: null },
            };

            expect(() => {
                ApiResponseValidator.validateSingleOutletResponse(errorResponse, testSlug);
            }).toThrow(ApiError);

            try {
                ApiResponseValidator.validateSingleOutletResponse(errorResponse, testSlug);
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect((error as ApiError).code).toBe('API_ERROR');
                expect((error as ApiError).message).toContain(testSlug);
                expect((error as ApiError).message).toContain('Outlet not found');
            }
        });

        it('should throw ApiError when outlet data is missing', () => {
            const responseWithoutOutlet = {
                status: 'success',
                message: 'Success',
                data: {},
            };

            expect(() => {
                ApiResponseValidator.validateSingleOutletResponse(responseWithoutOutlet, testSlug);
            }).toThrow(ApiError);

            try {
                ApiResponseValidator.validateSingleOutletResponse(responseWithoutOutlet, testSlug);
            } catch (error) {
                expect(error).toBeInstanceOf(ApiError);
                expect((error as ApiError).code).toBe('OUTLET_NOT_FOUND');
                expect((error as ApiError).message).toContain(testSlug);
            }
        });

        it('should throw ApiError with unknown error when message is missing', () => {
            const errorResponseWithoutMessage = {
                status: 'error',
                message: '',
                data: { outlet: null },
            };

            try {
                ApiResponseValidator.validateSingleOutletResponse(errorResponseWithoutMessage, testSlug);
            } catch (error) {
                expect((error as ApiError).message).toContain('Unknown error');
            }
        });

        it('should include slug in error messages', () => {
            const customSlug = 'custom-outlet-slug';

            try {
                ApiResponseValidator.validateSingleOutletResponse(null, customSlug);
            } catch (error) {
                expect((error as ApiError).message).toContain(customSlug);
            }
        });
    });
});

describe('ApiError', () => {
    it('should create ApiError with code and message', () => {
        const error = new ApiError('TEST_CODE', 'Test message');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiError);
        expect(error.code).toBe('TEST_CODE');
        expect(error.message).toBe('Test message');
        expect(error.name).toBe('ApiError');
    });

    it('should create ApiError with original error', () => {
        const originalError = new Error('Original error');
        const error = new ApiError('TEST_CODE', 'Test message', originalError);

        expect(error.originalError).toBe(originalError);
    });

    it('should create ApiError without original error', () => {
        const error = new ApiError('TEST_CODE', 'Test message');

        expect(error.originalError).toBeUndefined();
    });
});

describe('DefaultErrorHandlingStrategy', () => {
    let consoleErrorSpy: any;

    beforeEach(() => {
        consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    it('should handle ApiError', () => {
        const strategy = new DefaultErrorHandlingStrategy();
        const originalError = new Error('Original');
        const apiError = new ApiError('TEST_CODE', 'Test message', originalError);

        strategy.handle(apiError);

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[TEST_CODE] Test message',
            originalError
        );
    });

    it('should handle regular Error', () => {
        const strategy = new DefaultErrorHandlingStrategy();
        const error = new Error('Regular error');

        strategy.handle(error);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error:', 'Regular error');
    });

    it('should handle unknown error type', () => {
        const strategy = new DefaultErrorHandlingStrategy();
        const unknownError = 'String error';

        strategy.handle(unknownError);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown error:', unknownError);
    });

    it('should handle null error', () => {
        const strategy = new DefaultErrorHandlingStrategy();

        strategy.handle(null);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown error:', null);
    });

    it('should handle undefined error', () => {
        const strategy = new DefaultErrorHandlingStrategy();

        strategy.handle(undefined);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown error:', undefined);
    });

    it('should handle object error', () => {
        const strategy = new DefaultErrorHandlingStrategy();
        const objectError = { code: 500, message: 'Server error' };

        strategy.handle(objectError);

        expect(consoleErrorSpy).toHaveBeenCalledWith('Unknown error:', objectError);
    });
});

describe('createErrorHandler', () => {
    it('should create DefaultErrorHandlingStrategy when no strategy provided', () => {
        const handler = createErrorHandler();

        expect(handler).toBeInstanceOf(DefaultErrorHandlingStrategy);
    });

    it('should return provided strategy', () => {
        const customStrategy = {
            handle: vi.fn(),
        };

        const handler = createErrorHandler(customStrategy);

        expect(handler).toBe(customStrategy);
    });

    it('should use custom strategy for error handling', () => {
        const customStrategy = {
            handle: vi.fn(),
        };

        const handler = createErrorHandler(customStrategy);
        const error = new Error('Test');

        handler.handle(error);

        expect(customStrategy.handle).toHaveBeenCalledWith(error);
    });
});
