import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBarcodeParams } from '../hooks/useBarcodeParams';
import { useBarcodeStore } from '../stores/useBarcodeStore';

vi.mock('../stores/useBarcodeStore');

describe('useBarcodeParams', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const setupDefaultMocks = () => {
        vi.mocked(useBarcodeStore).mockReturnValue({
            tableNumber: '1',
            barcodeOutlet: 'test-outlet',
            setTableNumber: vi.fn(),
            setBarcodeOutlet: vi.fn(),
            clearBarcodeData: vi.fn(),
            hasBarcodeData: vi.fn().mockReturnValue(true),
        });
    };

    describe('Hook Initialization', () => {
        it('should return all required properties', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current).toHaveProperty('tableNumber');
            expect(result.current).toHaveProperty('barcodeOutlet');
            expect(result.current).toHaveProperty('hasBarcodeData');
            expect(result.current).toHaveProperty('setTableNumber');
            expect(result.current).toHaveProperty('setBarcodeOutlet');
            expect(result.current).toHaveProperty('clearBarcodeData');
        });

        it('should call useBarcodeStore hook', () => {
            setupDefaultMocks();
            renderHook(() => useBarcodeParams());

            expect(useBarcodeStore).toHaveBeenCalled();
        });
    });

    describe('Table Number', () => {
        it('should return table number from store', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.tableNumber).toBe('1');
        });

        it('should return null when no table number', () => {
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: null,
                barcodeOutlet: 'test-outlet',
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(false),
            });

            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.tableNumber).toBeNull();
        });

        it('should set table number', () => {
            setupDefaultMocks();
            const mockSetTableNumber = vi.fn();
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: '1',
                barcodeOutlet: 'test-outlet',
                setTableNumber: mockSetTableNumber,
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            act(() => {
                result.current.setTableNumber('5');
            });

            expect(mockSetTableNumber).toHaveBeenCalledWith('5');
        });

        it('should handle numeric table numbers', () => {
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: '123',
                barcodeOutlet: 'test-outlet',
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.tableNumber).toBe('123');
        });

        it('should handle very long table numbers', () => {
            const longTableNumber = '1'.repeat(100);
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: longTableNumber,
                barcodeOutlet: 'test-outlet',
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.tableNumber).toBe(longTableNumber);
        });
    });

    describe('Barcode Outlet', () => {
        it('should return barcode outlet from store', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.barcodeOutlet).toBe('test-outlet');
        });

        it('should return null when no barcode outlet', () => {
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: '1',
                barcodeOutlet: null,
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(false),
            });

            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.barcodeOutlet).toBeNull();
        });

        it('should set barcode outlet', () => {
            setupDefaultMocks();
            const mockSetBarcodeOutlet = vi.fn();
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: '1',
                barcodeOutlet: 'test-outlet',
                setTableNumber: vi.fn(),
                setBarcodeOutlet: mockSetBarcodeOutlet,
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            act(() => {
                result.current.setBarcodeOutlet('new-outlet');
            });

            expect(mockSetBarcodeOutlet).toHaveBeenCalledWith('new-outlet');
        });

        it('should handle different outlet slugs', () => {
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: '1',
                barcodeOutlet: 'café-outlet',
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.barcodeOutlet).toBe('café-outlet');
        });
    });

    describe('Has Barcode Data', () => {
        it('should return true when barcode data exists', () => {
            setupDefaultMocks();
            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.hasBarcodeData).toBe(true);
        });

        it('should return false when no barcode data', () => {
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: null,
                barcodeOutlet: null,
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(false),
            });

            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.hasBarcodeData).toBe(false);
        });

        it('should return true when only table number exists', () => {
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: '1',
                barcodeOutlet: null,
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.hasBarcodeData).toBe(true);
        });

        it('should return true when only outlet exists', () => {
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: null,
                barcodeOutlet: 'test-outlet',
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.hasBarcodeData).toBe(true);
        });
    });

    describe('Clear Barcode Data', () => {
        it('should clear barcode data', () => {
            setupDefaultMocks();
            const mockClearBarcodeData = vi.fn();
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: '1',
                barcodeOutlet: 'test-outlet',
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: mockClearBarcodeData,
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            act(() => {
                result.current.clearBarcodeData();
            });

            expect(mockClearBarcodeData).toHaveBeenCalled();
        });

        it('should handle multiple clear calls', () => {
            setupDefaultMocks();
            const mockClearBarcodeData = vi.fn();
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: '1',
                barcodeOutlet: 'test-outlet',
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: mockClearBarcodeData,
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            act(() => {
                result.current.clearBarcodeData();
                result.current.clearBarcodeData();
                result.current.clearBarcodeData();
            });

            expect(mockClearBarcodeData).toHaveBeenCalledTimes(3);
        });
    });

    describe('Combined Operations', () => {
        it('should handle setting table number and outlet', () => {
            setupDefaultMocks();
            const mockSetTableNumber = vi.fn();
            const mockSetBarcodeOutlet = vi.fn();
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: '1',
                barcodeOutlet: 'test-outlet',
                setTableNumber: mockSetTableNumber,
                setBarcodeOutlet: mockSetBarcodeOutlet,
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            act(() => {
                result.current.setTableNumber('5');
                result.current.setBarcodeOutlet('new-outlet');
            });

            expect(mockSetTableNumber).toHaveBeenCalledWith('5');
            expect(mockSetBarcodeOutlet).toHaveBeenCalledWith('new-outlet');
        });

        it('should handle setting and clearing', () => {
            setupDefaultMocks();
            const mockSetTableNumber = vi.fn();
            const mockClearBarcodeData = vi.fn();
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: '1',
                barcodeOutlet: 'test-outlet',
                setTableNumber: mockSetTableNumber,
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: mockClearBarcodeData,
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            act(() => {
                result.current.setTableNumber('5');
                result.current.clearBarcodeData();
            });

            expect(mockSetTableNumber).toHaveBeenCalledWith('5');
            expect(mockClearBarcodeData).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle null values', () => {
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: null,
                barcodeOutlet: null,
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(false),
            });

            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.tableNumber).toBeNull();
            expect(result.current.barcodeOutlet).toBeNull();
            expect(result.current.hasBarcodeData).toBe(false);
        });

        it('should handle special characters', () => {
            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: 'table-café-123',
                barcodeOutlet: 'outlet-café-456',
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            const { result } = renderHook(() => useBarcodeParams());

            expect(result.current.tableNumber).toContain('café');
            expect(result.current.barcodeOutlet).toContain('café');
        });
    });

    describe('Multiple Renders', () => {
        it('should handle data changes', () => {
            setupDefaultMocks();
            const { result, rerender } = renderHook(() => useBarcodeParams());

            expect(result.current.tableNumber).toBe('1');

            vi.mocked(useBarcodeStore).mockReturnValue({
                tableNumber: '5',
                barcodeOutlet: 'test-outlet',
                setTableNumber: vi.fn(),
                setBarcodeOutlet: vi.fn(),
                clearBarcodeData: vi.fn(),
                hasBarcodeData: vi.fn().mockReturnValue(true),
            });

            rerender();

            expect(result.current.tableNumber).toBe('5');
        });
    });
});
