import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCheckoutPayment } from '../hooks/useCheckoutPayment';
import CheckoutPaymentService from '../services/checkoutPaymentService';
import { useCheckoutSideEffects } from '../hooks/useCheckoutSideEffects';
import { useOutletSlug } from '@/features/outlets/hooks/useOutletSlug';

// Mock dependencies
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

vi.mock('../services/checkoutPaymentService', () => ({
    default: {
        processCheckout: vi.fn(),
    },
    CheckoutPaymentService: {
        processCheckout: vi.fn(),
    },
}));

vi.mock('../hooks/useCheckoutSideEffects', () => ({
    useCheckoutSideEffects: vi.fn(() => ({
        handleCheckoutSuccess: vi.fn(),
        handleCheckoutError: vi.fn(),
    })),
}));

vi.mock('@/features/outlets/hooks/useOutletSlug', () => ({
    useOutletSlug: vi.fn(() => 'test-outlet'),
}));

const mockNavigate = vi.fn();
const mockHandleCheckoutSuccess = vi.fn();
const mockHandleCheckoutError = vi.fn();
const mockProcessCheckout = vi.fn();

describe('useCheckoutPayment', () => {
    let queryClient: QueryClient;

    function createWrapper() {
        const Wrapper = ({ children }: { children: React.ReactNode }) => {
            return React.createElement(QueryClientProvider, { client: queryClient }, children);
        };
        return Wrapper;
    }

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });

        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(useCheckoutSideEffects).mockReturnValue({
            handleCheckoutSuccess: mockHandleCheckoutSuccess,
            handleCheckoutError: mockHandleCheckoutError,
        });
        vi.mocked(useOutletSlug).mockReturnValue('test-outlet');
        vi.mocked(CheckoutPaymentService.processCheckout).mockImplementation(mockProcessCheckout);
    });

    it('should return checkout payment mutation functions and states', () => {
        const { result } = renderHook(() => useCheckoutPayment(), { wrapper: createWrapper() });

        expect(result.current.checkoutPayment).toBeDefined();
        expect(typeof result.current.checkoutPayment).toBe('function');
        expect(typeof result.current.isLoading).toBe('boolean');
        expect(typeof result.current.isSuccess).toBe('boolean');
        expect(result.current.error).toBeNull();
    });

    it('should call CheckoutPaymentService.processCheckout with correct parameters', async () => {
        const mockResult = {
            success: true,
            orderCode: 'ORDER123',
            paymentUrl: 'https://payment.example.com',
            qrCode: 'qr-code-data'
        };

        mockProcessCheckout.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useCheckoutPayment(), { wrapper: createWrapper() });

        const checkoutParams = {
            orderCode: 'ORDER123',
            paymentMethodId: 1,
            tableNumberId: 5,
            subtotal: 25000,
            tax: 2500,
            discount: 0,
            finalPrice: 27500,
            appliedVoucher: null,
            paymentMethodFee: 0,
            platformFee: 0
        };

        result.current.checkoutPayment(checkoutParams);

        await waitFor(() => {
            expect(mockProcessCheckout).toHaveBeenCalledWith(
                'test-outlet',
                'ORDER123',
                1,
                5,
                {
                    subtotal: 25000,
                    tax: 2500,
                    discount: 0,
                    finalPrice: 27500,
                    appliedVoucher: null,
                    paymentMethodFee: 0,
                    platformFee: 0
                }
            );
        });
    });

    it('should handle successful checkout', async () => {
        const mockResult = {
            success: true,
            orderCode: 'ORDER123',
            paymentUrl: 'https://payment.example.com'
        };

        mockProcessCheckout.mockResolvedValue(mockResult);

        const { result } = renderHook(() => useCheckoutPayment(), { wrapper: createWrapper() });

        const checkoutParams = {
            orderCode: 'ORDER123',
            paymentMethodId: 1,
            tableNumberId: 5,
            subtotal: 25000,
            tax: 2500,
            discount: 0,
            finalPrice: 27500,
            appliedVoucher: null,
            paymentMethodFee: 0,
            platformFee: 0
        };

        result.current.checkoutPayment(checkoutParams);

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        await waitFor(() => {
            expect(mockHandleCheckoutSuccess).toHaveBeenCalledWith(mockResult, mockNavigate);
        });
    });

    it('should handle checkout error', async () => {
        const mockError = new Error('Payment failed');
        mockProcessCheckout.mockRejectedValue(mockError);

        const { result } = renderHook(() => useCheckoutPayment(), { wrapper: createWrapper() });

        const checkoutParams = {
            orderCode: 'ORDER123',
            paymentMethodId: 1,
            tableNumberId: 5,
            subtotal: 25000,
            tax: 2500,
            discount: 0,
            finalPrice: 27500,
            appliedVoucher: null,
            paymentMethodFee: 0,
            platformFee: 0
        };

        result.current.checkoutPayment(checkoutParams);

        await waitFor(() => {
            expect(result.current.error).toEqual(mockError);
        });

        await waitFor(() => {
            expect(mockHandleCheckoutError).toHaveBeenCalledWith(mockError);
        });
    });

    it('should handle null outlet slug', async () => {
        vi.mocked(useOutletSlug).mockReturnValue(undefined);

        const { result } = renderHook(() => useCheckoutPayment(), { wrapper: createWrapper() });

        const checkoutParams = {
            orderCode: 'ORDER123',
            paymentMethodId: 1,
            tableNumberId: 5,
            subtotal: 25000,
            tax: 2500,
            discount: 0,
            finalPrice: 27500,
            appliedVoucher: null,
            paymentMethodFee: 0,
            platformFee: 0
        };

        result.current.checkoutPayment(checkoutParams);

        await waitFor(() => {
            expect(mockProcessCheckout).toHaveBeenCalledWith(
                null,
                'ORDER123',
                1,
                5,
                expect.any(Object)
            );
        });
    });

    it('should track loading state correctly', async () => {
        let resolvePromise: (value: any) => void;
        const pendingPromise = new Promise(resolve => {
            resolvePromise = resolve;
        });

        mockProcessCheckout.mockReturnValue(pendingPromise);

        const { result } = renderHook(() => useCheckoutPayment(), { wrapper: createWrapper() });

        expect(result.current.isLoading).toBe(false);

        const checkoutParams = {
            orderCode: 'ORDER123',
            paymentMethodId: 1,
            tableNumberId: undefined, // Allow undefined for tableNumberId
            subtotal: 25000,
            tax: 2500,
            discount: 0,
            finalPrice: 27500,
            appliedVoucher: null,
            paymentMethodFee: 0,
            platformFee: 0
        };

        result.current.checkoutPayment(checkoutParams);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(true);
        });

        resolvePromise!({ order: null, orderCode: 'ORDER123' });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });
    });
});