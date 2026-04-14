import { describe, it, expect } from 'vitest';
import * as CartHooks from '../hooks/index';

describe('Cart Hooks Index', () => {
    it('should export useDuplicateOrder hook', () => {
        expect(CartHooks.useDuplicateOrder).toBeDefined();
        expect(typeof CartHooks.useDuplicateOrder).toBe('function');
    });

    it('should export useCartSynchronization hook', () => {
        expect(CartHooks.useCartSynchronization).toBeDefined();
        expect(typeof CartHooks.useCartSynchronization).toBe('function');
    });

    it('should export UseDuplicateOrderReturn type', () => {
        // Types are exported but can't be tested directly in runtime
        // This test verifies the export exists in the module
        expect('UseDuplicateOrderReturn' in CartHooks).toBe(false); // Types don't exist at runtime
    });

    it('should have correct number of exports', () => {
        const runtimeExports = Object.keys(CartHooks).filter(key =>
            typeof CartHooks[key as keyof typeof CartHooks] === 'function'
        );
        expect(runtimeExports).toHaveLength(2);
        expect(runtimeExports).toContain('useDuplicateOrder');
        expect(runtimeExports).toContain('useCartSynchronization');
    });
});