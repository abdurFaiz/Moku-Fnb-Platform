import { describe, it, expect, beforeEach } from 'vitest';
import { useBarcodeStore } from '../stores/useBarcodeStore';

describe('useBarcodeStore', () => {
    beforeEach(() => {
        useBarcodeStore.setState({
            barcode: null,
            outletSlug: null,
        });
    });

    describe('Initial State', () => {
        it('should initialize with null barcode', () => {
            expect(useBarcodeStore.getState().barcode).toBeNull();
        });

        it('should initialize with null outletSlug', () => {
            expect(useBarcodeStore.getState().outletSlug).toBeNull();
        });

        it('should have setBarcode method', () => {
            expect(typeof useBarcodeStore.getState().setBarcode).toBe('function');
        });

        it('should have setOutletSlug method', () => {
            expect(typeof useBarcodeStore.getState().setOutletSlug).toBe('function');
        });

        it('should have clearBarcode method', () => {
            expect(typeof useBarcodeStore.getState().clearBarcode).toBe('function');
        });

        it('should have clearOutletSlug method', () => {
            expect(typeof useBarcodeStore.getState().clearOutletSlug).toBe('function');
        });

        it('should have clearAll method', () => {
            expect(typeof useBarcodeStore.getState().clearAll).toBe('function');
        });
    });

    describe('Set Barcode', () => {
        it('should set barcode value', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            expect(useBarcodeStore.getState().barcode).toBe('123456789');
        });

        it('should update barcode value', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().setBarcode('987654321');
            expect(useBarcodeStore.getState().barcode).toBe('987654321');
        });

        it('should handle empty string barcode', () => {
            useBarcodeStore.getState().setBarcode('');
            expect(useBarcodeStore.getState().barcode).toBe('');
        });

        it('should handle null barcode', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().setBarcode(null);
            expect(useBarcodeStore.getState().barcode).toBeNull();
        });

        it('should handle barcode with special characters', () => {
            useBarcodeStore.getState().setBarcode('123-456-789');
            expect(useBarcodeStore.getState().barcode).toBe('123-456-789');
        });

        it('should handle barcode with letters', () => {
            useBarcodeStore.getState().setBarcode('ABC123XYZ');
            expect(useBarcodeStore.getState().barcode).toBe('ABC123XYZ');
        });

        it('should handle very long barcode', () => {
            const longBarcode = '1'.repeat(500);
            useBarcodeStore.getState().setBarcode(longBarcode);
            expect(useBarcodeStore.getState().barcode).toBe(longBarcode);
        });

        it('should handle barcode with unicode characters', () => {
            useBarcodeStore.getState().setBarcode('barcode-🎉-123');
            expect(useBarcodeStore.getState().barcode).toBe('barcode-🎉-123');
        });

        it('should not affect outletSlug when setting barcode', () => {
            useBarcodeStore.getState().setOutletSlug('test-outlet');
            useBarcodeStore.getState().setBarcode('123456789');
            expect(useBarcodeStore.getState().outletSlug).toBe('test-outlet');
            expect(useBarcodeStore.getState().barcode).toBe('123456789');
        });
    });

    describe('Set Outlet Slug', () => {
        it('should set outlet slug value', () => {
            useBarcodeStore.getState().setOutletSlug('test-outlet');
            expect(useBarcodeStore.getState().outletSlug).toBe('test-outlet');
        });

        it('should update outlet slug value', () => {
            useBarcodeStore.getState().setOutletSlug('test-outlet-1');
            useBarcodeStore.getState().setOutletSlug('test-outlet-2');
            expect(useBarcodeStore.getState().outletSlug).toBe('test-outlet-2');
        });

        it('should handle empty string outlet slug', () => {
            useBarcodeStore.getState().setOutletSlug('');
            expect(useBarcodeStore.getState().outletSlug).toBe('');
        });

        it('should handle null outlet slug', () => {
            useBarcodeStore.getState().setOutletSlug('test-outlet');
            useBarcodeStore.getState().setOutletSlug(null);
            expect(useBarcodeStore.getState().outletSlug).toBeNull();
        });

        it('should handle outlet slug with special characters', () => {
            useBarcodeStore.getState().setOutletSlug('café-outlet-123');
            expect(useBarcodeStore.getState().outletSlug).toBe('café-outlet-123');
        });

        it('should handle outlet slug with hyphens', () => {
            useBarcodeStore.getState().setOutletSlug('test-outlet-with-many-hyphens');
            expect(useBarcodeStore.getState().outletSlug).toBe('test-outlet-with-many-hyphens');
        });

        it('should handle very long outlet slug', () => {
            const longSlug = 'outlet-' + 'a'.repeat(200);
            useBarcodeStore.getState().setOutletSlug(longSlug);
            expect(useBarcodeStore.getState().outletSlug).toBe(longSlug);
        });

        it('should not affect barcode when setting outlet slug', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().setOutletSlug('test-outlet');
            expect(useBarcodeStore.getState().barcode).toBe('123456789');
            expect(useBarcodeStore.getState().outletSlug).toBe('test-outlet');
        });
    });

    describe('Clear Barcode', () => {
        it('should clear barcode value', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().clearBarcode();
            expect(useBarcodeStore.getState().barcode).toBeNull();
        });

        it('should not affect outlet slug when clearing barcode', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().setOutletSlug('test-outlet');
            useBarcodeStore.getState().clearBarcode();
            expect(useBarcodeStore.getState().barcode).toBeNull();
            expect(useBarcodeStore.getState().outletSlug).toBe('test-outlet');
        });

        it('should handle clearing already null barcode', () => {
            useBarcodeStore.getState().clearBarcode();
            expect(useBarcodeStore.getState().barcode).toBeNull();
        });

        it('should allow setting barcode after clearing', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().clearBarcode();
            useBarcodeStore.getState().setBarcode('987654321');
            expect(useBarcodeStore.getState().barcode).toBe('987654321');
        });
    });

    describe('Clear Outlet Slug', () => {
        it('should clear outlet slug value', () => {
            useBarcodeStore.getState().setOutletSlug('test-outlet');
            useBarcodeStore.getState().clearOutletSlug();
            expect(useBarcodeStore.getState().outletSlug).toBeNull();
        });

        it('should not affect barcode when clearing outlet slug', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().setOutletSlug('test-outlet');
            useBarcodeStore.getState().clearOutletSlug();
            expect(useBarcodeStore.getState().barcode).toBe('123456789');
            expect(useBarcodeStore.getState().outletSlug).toBeNull();
        });

        it('should handle clearing already null outlet slug', () => {
            useBarcodeStore.getState().clearOutletSlug();
            expect(useBarcodeStore.getState().outletSlug).toBeNull();
        });

        it('should allow setting outlet slug after clearing', () => {
            useBarcodeStore.getState().setOutletSlug('test-outlet-1');
            useBarcodeStore.getState().clearOutletSlug();
            useBarcodeStore.getState().setOutletSlug('test-outlet-2');
            expect(useBarcodeStore.getState().outletSlug).toBe('test-outlet-2');
        });
    });

    describe('Clear All', () => {
        it('should clear both barcode and outlet slug', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().setOutletSlug('test-outlet');
            useBarcodeStore.getState().clearAll();
            expect(useBarcodeStore.getState().barcode).toBeNull();
            expect(useBarcodeStore.getState().outletSlug).toBeNull();
        });

        it('should handle clearing when both are already null', () => {
            useBarcodeStore.getState().clearAll();
            expect(useBarcodeStore.getState().barcode).toBeNull();
            expect(useBarcodeStore.getState().outletSlug).toBeNull();
        });

        it('should handle clearing when only barcode is set', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().clearAll();
            expect(useBarcodeStore.getState().barcode).toBeNull();
            expect(useBarcodeStore.getState().outletSlug).toBeNull();
        });

        it('should handle clearing when only outlet slug is set', () => {
            useBarcodeStore.getState().setOutletSlug('test-outlet');
            useBarcodeStore.getState().clearAll();
            expect(useBarcodeStore.getState().barcode).toBeNull();
            expect(useBarcodeStore.getState().outletSlug).toBeNull();
        });

        it('should allow setting values after clearing all', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().setOutletSlug('test-outlet');
            useBarcodeStore.getState().clearAll();
            useBarcodeStore.getState().setBarcode('987654321');
            useBarcodeStore.getState().setOutletSlug('new-outlet');
            expect(useBarcodeStore.getState().barcode).toBe('987654321');
            expect(useBarcodeStore.getState().outletSlug).toBe('new-outlet');
        });
    });

    describe('Store Reactivity', () => {
        it('should notify subscribers on barcode change', () => {
            let callCount = 0;
            const unsubscribe = useBarcodeStore.subscribe(
                () => {
                    callCount++;
                }
            );

            useBarcodeStore.getState().setBarcode('123456789');
            expect(callCount).toBeGreaterThan(0);
            unsubscribe();
        });

        it('should notify subscribers on outlet slug change', () => {
            let callCount = 0;
            const unsubscribe = useBarcodeStore.subscribe(
                () => {
                    callCount++;
                }
            );

            useBarcodeStore.getState().setOutletSlug('test-outlet');
            expect(callCount).toBeGreaterThan(0);
            unsubscribe();
        });

        it('should notify subscribers on clear barcode', () => {
            useBarcodeStore.getState().setBarcode('123456789');

            let callCount = 0;
            const unsubscribe = useBarcodeStore.subscribe(
                () => {
                    callCount++;
                }
            );

            useBarcodeStore.getState().clearBarcode();
            expect(callCount).toBeGreaterThan(0);
            unsubscribe();
        });

        it('should notify subscribers on clear all', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().setOutletSlug('test-outlet');

            let callCount = 0;
            const unsubscribe = useBarcodeStore.subscribe(
                () => {
                    callCount++;
                }
            );

            useBarcodeStore.getState().clearAll();
            expect(callCount).toBeGreaterThan(0);
            unsubscribe();
        });
    });

    describe('Concurrent Operations', () => {
        it('should handle rapid barcode updates', () => {
            for (let i = 0; i < 100; i++) {
                useBarcodeStore.getState().setBarcode(`barcode-${i}`);
            }
            expect(useBarcodeStore.getState().barcode).toBe('barcode-99');
        });

        it('should handle rapid outlet slug updates', () => {
            for (let i = 0; i < 100; i++) {
                useBarcodeStore.getState().setOutletSlug(`outlet-${i}`);
            }
            expect(useBarcodeStore.getState().outletSlug).toBe('outlet-99');
        });

        it('should handle mixed rapid operations', () => {
            for (let i = 0; i < 50; i++) {
                useBarcodeStore.getState().setBarcode(`barcode-${i}`);
                useBarcodeStore.getState().setOutletSlug(`outlet-${i}`);
            }
            expect(useBarcodeStore.getState().barcode).toBe('barcode-49');
            expect(useBarcodeStore.getState().outletSlug).toBe('outlet-49');
        });

        it('should handle alternating set and clear operations', () => {
            useBarcodeStore.getState().setBarcode('barcode-1');
            useBarcodeStore.getState().setOutletSlug('outlet-1');
            useBarcodeStore.getState().clearBarcode();
            useBarcodeStore.getState().setBarcode('barcode-2');
            useBarcodeStore.getState().clearOutletSlug();
            useBarcodeStore.getState().setOutletSlug('outlet-2');
            useBarcodeStore.getState().clearAll();
            expect(useBarcodeStore.getState().barcode).toBeNull();
            expect(useBarcodeStore.getState().outletSlug).toBeNull();
        });
    });

    describe('Edge Cases', () => {
        it('should handle null-like string values', () => {
            useBarcodeStore.getState().setBarcode('null');
            useBarcodeStore.getState().setOutletSlug('undefined');
            expect(useBarcodeStore.getState().barcode).toBe('null');
            expect(useBarcodeStore.getState().outletSlug).toBe('undefined');
        });

        it('should handle whitespace-only values', () => {
            useBarcodeStore.getState().setBarcode('   ');
            useBarcodeStore.getState().setOutletSlug('   ');
            expect(useBarcodeStore.getState().barcode).toBe('   ');
            expect(useBarcodeStore.getState().outletSlug).toBe('   ');
        });

        it('should handle values with newlines', () => {
            useBarcodeStore.getState().setBarcode('barcode\nwith\nnewlines');
            useBarcodeStore.getState().setOutletSlug('outlet\nwith\nnewlines');
            expect(useBarcodeStore.getState().barcode).toBe('barcode\nwith\nnewlines');
            expect(useBarcodeStore.getState().outletSlug).toBe('outlet\nwith\nnewlines');
        });

        it('should handle values with tabs', () => {
            useBarcodeStore.getState().setBarcode('barcode\twith\ttabs');
            useBarcodeStore.getState().setOutletSlug('outlet\twith\ttabs');
            expect(useBarcodeStore.getState().barcode).toBe('barcode\twith\ttabs');
            expect(useBarcodeStore.getState().outletSlug).toBe('outlet\twith\ttabs');
        });

        it('should handle numeric-like strings', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().setOutletSlug('999');
            expect(useBarcodeStore.getState().barcode).toBe('123456789');
            expect(useBarcodeStore.getState().outletSlug).toBe('999');
        });

        it('should handle boolean-like strings', () => {
            useBarcodeStore.getState().setBarcode('true');
            useBarcodeStore.getState().setOutletSlug('false');
            expect(useBarcodeStore.getState().barcode).toBe('true');
            expect(useBarcodeStore.getState().outletSlug).toBe('false');
        });
    });

    describe('State Persistence', () => {
        it('should maintain state across multiple accesses', () => {
            useBarcodeStore.getState().setBarcode('123456789');
            useBarcodeStore.getState().setOutletSlug('test-outlet');

            const store2 = useBarcodeStore.getState();
            expect(store2.barcode).toBe('123456789');
            expect(store2.outletSlug).toBe('test-outlet');
        });

        it('should share state between different getState calls', () => {
            useBarcodeStore.getState().setBarcode('barcode-1');
            useBarcodeStore.getState().setOutletSlug('outlet-1');

            const store3 = useBarcodeStore.getState();
            expect(store3.barcode).toBe('barcode-1');
            expect(store3.outletSlug).toBe('outlet-1');
        });
    });
});
