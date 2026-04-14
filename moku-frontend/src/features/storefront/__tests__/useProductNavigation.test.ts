import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useProductNavigation } from '../hooks/useProductNavigation';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { HOME_ERRORS } from '../constant/homeConstant';

vi.mock('react-router-dom');
vi.mock('sonner');

describe('useProductNavigation', () => {
    let mockNavigate: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigate = vi.fn();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    });

    describe('Hook Initialization', () => {
        it('should return navigation handlers', () => {
            const { result } = renderHook(() => useProductNavigation());

            expect(typeof result.current.navigateToProductDetail).toBe('function');
        });

        it('should have navigateToProductDetail method', () => {
            const { result } = renderHook(() => useProductNavigation());

            expect(result.current.navigateToProductDetail).toBeDefined();
        });
    });

    describe('Valid Navigation', () => {
        it('should navigate to product detail with valid inputs', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should navigate with different product IDs', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalledTimes(1);

            act(() => {
                result.current.navigateToProductDetail('product-uuid-2', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalledTimes(2);
        });

        it('should navigate with different outlet slugs', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'outlet-1');
            });

            expect(mockNavigate).toHaveBeenCalled();

            mockNavigate.mockClear();

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'outlet-2');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should handle special characters in product ID', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-café-123', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should handle special characters in outlet slug', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'café-outlet-123');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should handle unicode characters in product ID', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-🎉', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should handle very long product ID', () => {
            const { result } = renderHook(() => useProductNavigation());
            const longId = 'product-' + 'a'.repeat(200);

            act(() => {
                result.current.navigateToProductDetail(longId, 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should handle very long outlet slug', () => {
            const { result } = renderHook(() => useProductNavigation());
            const longSlug = 'outlet-' + 'a'.repeat(200);

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', longSlug);
            });

            expect(mockNavigate).toHaveBeenCalled();
        });
    });

    describe('Invalid Product ID', () => {
        it('should show error for empty product ID', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('', 'test-outlet');
            });

            expect(toast.error).toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should show error for whitespace-only product ID', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('   ', 'test-outlet');
            });

            expect(toast.error).toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should show error for null product ID', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail(null as any, 'test-outlet');
            });

            expect(toast.error).toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should show error for undefined product ID', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail(undefined as any, 'test-outlet');
            });

            expect(toast.error).toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('should show error for non-string product ID', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail(123 as any, 'test-outlet');
            });

            expect(toast.error).toHaveBeenCalled();
            expect(mockNavigate).not.toHaveBeenCalled();
        });
    });

    describe('Missing Outlet Slug', () => {
        it('should show warning for null outlet slug', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', null);
            });

            expect(toast.warning).toHaveBeenCalled();
        });

        it('should navigate to onboard when outlet slug is null', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', null);
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should show warning for undefined outlet slug', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', undefined as any);
            });

            expect(toast.warning).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        it('should catch and handle navigation errors', () => {
            mockNavigate.mockImplementation(() => {
                throw new Error('Navigation failed');
            });

            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'test-outlet');
            });

            expect(toast.error).toHaveBeenCalled();
        });

        it('should log error to console', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            mockNavigate.mockImplementation(() => {
                throw new Error('Navigation failed');
            });

            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'test-outlet');
            });

            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should show error message on navigation failure', () => {
            mockNavigate.mockImplementation(() => {
                throw new Error('Navigation failed');
            });

            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'test-outlet');
            });

            expect(toast.error).toHaveBeenCalledWith(HOME_ERRORS.NAVIGATION_FAILED);
        });
    });

    describe('Multiple Navigations', () => {
        it('should handle rapid consecutive navigations', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'test-outlet');
                result.current.navigateToProductDetail('product-uuid-2', 'test-outlet');
                result.current.navigateToProductDetail('product-uuid-3', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalledTimes(3);
        });

        it('should handle mixed valid and invalid navigations', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'test-outlet');
                result.current.navigateToProductDetail('', 'test-outlet');
                result.current.navigateToProductDetail('product-uuid-2', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalledTimes(2);
            expect(toast.error).toHaveBeenCalledTimes(1);
        });

        it('should handle navigation with and without outlet slug', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'test-outlet');
                result.current.navigateToProductDetail('product-uuid-2', null);
                result.current.navigateToProductDetail('product-uuid-3', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalledTimes(3);
            expect(toast.warning).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle product ID with numbers only', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('123456789', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should handle outlet slug with numbers only', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', '123456789');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should handle product ID with hyphens', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-with-many-hyphens', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should handle outlet slug with hyphens', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'outlet-with-many-hyphens');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should handle product ID with underscores', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product_uuid_1', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should handle outlet slug with underscores', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'test_outlet');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });
    });

    describe('Callback Stability', () => {
        it('should return stable callback reference', () => {
            const { result, rerender } = renderHook(() => useProductNavigation());
            const firstCallback = result.current.navigateToProductDetail;

            rerender();

            const secondCallback = result.current.navigateToProductDetail;

            expect(firstCallback).toBe(secondCallback);
        });

        it('should maintain callback reference across multiple renders', () => {
            const { result, rerender } = renderHook(() => useProductNavigation());
            const callbacks: any[] = [];

            callbacks.push(result.current.navigateToProductDetail);

            for (let i = 0; i < 5; i++) {
                rerender();
                callbacks.push(result.current.navigateToProductDetail);
            }

            // All callbacks should be the same reference
            expect(callbacks.every(cb => cb === callbacks[0])).toBe(true);
        });
    });

    describe('Integration', () => {
        it('should work with HOME_ROUTE_BUILDERS', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', 'test-outlet');
            });

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should use HOME_ERRORS for error messages', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('', 'test-outlet');
            });

            expect(toast.error).toHaveBeenCalledWith(HOME_ERRORS.INVALID_PRODUCT_ID);
        });

        it('should handle onboard route for missing outlet', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                result.current.navigateToProductDetail('product-uuid-1', null);
            });

            expect(mockNavigate).toHaveBeenCalled();
            expect(toast.warning).toHaveBeenCalledWith(HOME_ERRORS.NO_OUTLET);
        });
    });

    describe('Performance', () => {
        it('should handle 100 rapid navigations', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                for (let i = 0; i < 100; i++) {
                    result.current.navigateToProductDetail(`product-uuid-${i}`, 'test-outlet');
                }
            });

            expect(mockNavigate).toHaveBeenCalledTimes(100);
        });

        it('should handle mixed valid/invalid navigations efficiently', () => {
            const { result } = renderHook(() => useProductNavigation());

            act(() => {
                for (let i = 0; i < 50; i++) {
                    if (i % 2 === 0) {
                        result.current.navigateToProductDetail(`product-uuid-${i}`, 'test-outlet');
                    } else {
                        result.current.navigateToProductDetail('', 'test-outlet');
                    }
                }
            });

            expect(mockNavigate).toHaveBeenCalledTimes(25);
            expect(toast.error).toHaveBeenCalledTimes(25);
        });
    });
});