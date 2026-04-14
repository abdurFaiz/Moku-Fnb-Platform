import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAttributeSelections } from '../hooks/useAttributeSelections';
import { mockProductAttributes } from './mockData';
import type { EditModeData } from '../services/DetailItemModeHandler';

describe('useAttributeSelections', () => {
    describe('initialization', () => {
        it('should initialize with default selections', () => {
            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, null)
            );

            expect(result.current.selections.size).toBe(2);

            // Size attribute should have default (Small - id: 1)
            const sizeSelections = result.current.selections.get(1);
            expect(sizeSelections?.has('1-1')).toBe(true);
        });

        it('should initialize with empty selections when no attributes', () => {
            const { result } = renderHook(() => useAttributeSelections([], null));

            expect(result.current.selections.size).toBe(0);
        });

        it('should initialize from edit mode data', () => {
            const editData: EditModeData = {
                editMode: true,
                cartEditMode: false,
                variantIds: [2, 4], // Medium + Extra Shot
                quantity: 1,
                note: '',
            };

            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, editData)
            );

            // Should have Medium selected
            const sizeSelections = result.current.selections.get(1);
            expect(sizeSelections?.has('1-2')).toBe(true);

            // Should have Extra Shot selected
            const toppingSelections = result.current.selections.get(2);
            expect(toppingSelections?.has('2-4')).toBe(true);
        });

        it('should initialize from cart edit mode data', () => {
            const editData: EditModeData = {
                editMode: false,
                cartEditMode: true,
                variantIds: [3, 5], // Large + Whipped Cream
                quantity: 2,
                note: 'Extra hot',
            };

            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, editData)
            );

            const sizeSelections = result.current.selections.get(1);
            expect(sizeSelections?.has('1-3')).toBe(true);

            const toppingSelections = result.current.selections.get(2);
            expect(toppingSelections?.has('2-5')).toBe(true);
        });

        it('should use defaults when edit mode has no variantIds', () => {
            const editData: EditModeData = {
                editMode: true,
                cartEditMode: false,
                variantIds: undefined,
                quantity: 1,
                note: '',
            };

            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, editData)
            );

            // Should fall back to defaults
            const sizeSelections = result.current.selections.get(1);
            expect(sizeSelections?.has('1-1')).toBe(true);
        });

        it('should use defaults when edit mode has empty variantIds', () => {
            const editData: EditModeData = {
                editMode: true,
                cartEditMode: false,
                variantIds: [],
                quantity: 1,
                note: '',
            };

            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, editData)
            );

            const sizeSelections = result.current.selections.get(1);
            expect(sizeSelections?.has('1-1')).toBe(true);
        });
    });

    describe('toggleSelection', () => {
        it('should toggle radio selection (replace)', () => {
            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, null)
            );

            // Initially Small is selected
            expect(result.current.selections.get(1)?.has('1-1')).toBe(true);

            // Toggle to Medium
            act(() => {
                result.current.toggleSelection(1, '1-2', true);
            });

            // Should now have Medium, not Small
            expect(result.current.selections.get(1)?.has('1-1')).toBe(false);
            expect(result.current.selections.get(1)?.has('1-2')).toBe(true);
            expect(result.current.selections.get(1)?.size).toBe(1);
        });

        it('should toggle checkbox selection (add)', () => {
            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, null)
            );

            // Add Extra Shot
            act(() => {
                result.current.toggleSelection(2, '2-4', false);
            });

            const toppingSelections = result.current.selections.get(2);
            expect(toppingSelections?.has('2-4')).toBe(true);

            // Add Whipped Cream
            act(() => {
                result.current.toggleSelection(2, '2-5', false);
            });

            expect(result.current.selections.get(2)?.has('2-4')).toBe(true);
            expect(result.current.selections.get(2)?.has('2-5')).toBe(true);
            expect(result.current.selections.get(2)?.size).toBe(2);
        });

        it('should toggle checkbox selection (remove)', () => {
            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, null)
            );

            // Add both toppings
            act(() => {
                result.current.toggleSelection(2, '2-4', false);
                result.current.toggleSelection(2, '2-5', false);
            });

            expect(result.current.selections.get(2)?.size).toBe(2);

            // Remove Extra Shot
            act(() => {
                result.current.toggleSelection(2, '2-4', false);
            });

            expect(result.current.selections.get(2)?.has('2-4')).toBe(false);
            expect(result.current.selections.get(2)?.has('2-5')).toBe(true);
            expect(result.current.selections.get(2)?.size).toBe(1);
        });

        it('should handle multiple radio toggles in sequence', () => {
            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, null)
            );

            // Toggle through all sizes
            act(() => {
                result.current.toggleSelection(1, '1-2', true); // Medium
            });
            expect(result.current.selections.get(1)?.has('1-2')).toBe(true);

            act(() => {
                result.current.toggleSelection(1, '1-3', true); // Large
            });
            expect(result.current.selections.get(1)?.has('1-2')).toBe(false);
            expect(result.current.selections.get(1)?.has('1-3')).toBe(true);

            act(() => {
                result.current.toggleSelection(1, '1-1', true); // Back to Small
            });
            expect(result.current.selections.get(1)?.has('1-3')).toBe(false);
            expect(result.current.selections.get(1)?.has('1-1')).toBe(true);
        });

        it('should handle toggling same checkbox twice (add then remove)', () => {
            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, null)
            );

            // Add Extra Shot
            act(() => {
                result.current.toggleSelection(2, '2-4', false);
            });
            expect(result.current.selections.get(2)?.has('2-4')).toBe(true);

            // Remove Extra Shot
            act(() => {
                result.current.toggleSelection(2, '2-4', false);
            });
            expect(result.current.selections.get(2)?.has('2-4')).toBe(false);
        });

        it('should maintain independent state for different attributes', () => {
            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, null)
            );

            // Change size
            act(() => {
                result.current.toggleSelection(1, '1-3', true); // Large
            });

            // Add toppings
            act(() => {
                result.current.toggleSelection(2, '2-4', false); // Extra Shot
                result.current.toggleSelection(2, '2-5', false); // Whipped Cream
            });

            // Both attributes should maintain their own state
            expect(result.current.selections.get(1)?.has('1-3')).toBe(true);
            expect(result.current.selections.get(2)?.has('2-4')).toBe(true);
            expect(result.current.selections.get(2)?.has('2-5')).toBe(true);
        });
    });

    describe('re-initialization on attribute changes', () => {
        it('should re-initialize when attributes change', () => {
            const { result, rerender } = renderHook(
                ({ attrs }) => useAttributeSelections(attrs, null),
                { initialProps: { attrs: mockProductAttributes } }
            );

            const initialSelections = result.current.selections;
            expect(initialSelections.size).toBe(2);

            // Change attributes (simulate loading different product)
            const newAttributes = [mockProductAttributes[0]]; // Only size attribute
            rerender({ attrs: newAttributes });

            expect(result.current.selections.size).toBe(1);
        });

        it('should re-initialize when editData changes', () => {
            const editData1: EditModeData = {
                editMode: true,
                cartEditMode: false,
                variantIds: [2], // Medium
                quantity: 1,
                note: '',
            };

            const { result, rerender } = renderHook(
                ({ edit }) => useAttributeSelections(mockProductAttributes, edit),
                { initialProps: { edit: editData1 } }
            );

            expect(result.current.selections.get(1)?.has('1-2')).toBe(true);

            // Change edit data
            const editData2: EditModeData = {
                ...editData1,
                variantIds: [3], // Large
            };
            rerender({ edit: editData2 });

            expect(result.current.selections.get(1)?.has('1-3')).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle rapid toggles', () => {
            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, null)
            );

            // Rapidly toggle checkboxes
            act(() => {
                result.current.toggleSelection(2, '2-4', false);
                result.current.toggleSelection(2, '2-5', false);
                result.current.toggleSelection(2, '2-4', false);
                result.current.toggleSelection(2, '2-5', false);
            });

            // Both should be removed
            expect(result.current.selections.get(2)?.size).toBe(0);
        });

        it('should handle toggling non-existent attribute', () => {
            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, null)
            );

            // Toggle attribute that doesn't exist
            act(() => {
                result.current.toggleSelection(999, '999-1', true);
            });

            // Should create new entry
            expect(result.current.selections.has(999)).toBe(true);
            expect(result.current.selections.get(999)?.has('999-1')).toBe(true);
        });

        it('should preserve selections during re-renders without prop changes', () => {
            const { result, rerender } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, null)
            );

            // Make some selections
            act(() => {
                result.current.toggleSelection(1, '1-3', true);
                result.current.toggleSelection(2, '2-4', false);
            });

            // Re-render without changing props
            rerender();

            // Selections should be maintained
            expect(result.current.selections.get(1)?.has('1-3')).toBe(true);
            expect(result.current.selections.get(2)?.has('2-4')).toBe(true);
        });
    });

    describe('integration scenarios', () => {
        it('should handle complete order customization flow', () => {
            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, null)
            );

            // Customer selects Large
            act(() => {
                result.current.toggleSelection(1, '1-3', true);
            });

            // Customer adds Extra Shot
            act(() => {
                result.current.toggleSelection(2, '2-4', false);
            });

            // Customer adds Whipped Cream
            act(() => {
                result.current.toggleSelection(2, '2-5', false);
            });

            // Verify final state
            expect(result.current.selections.get(1)?.has('1-3')).toBe(true);
            expect(result.current.selections.get(2)?.has('2-4')).toBe(true);
            expect(result.current.selections.get(2)?.has('2-5')).toBe(true);
        });

        it('should handle cart edit flow', () => {
            // Initial cart item: Medium with Extra Shot
            const editData: EditModeData = {
                editMode: false,
                cartEditMode: true,
                variantIds: [2, 4],
                quantity: 1,
                note: '',
            };

            const { result } = renderHook(() =>
                useAttributeSelections(mockProductAttributes, editData)
            );

            // Verify initial state from cart
            expect(result.current.selections.get(1)?.has('1-2')).toBe(true);
            expect(result.current.selections.get(2)?.has('2-4')).toBe(true);

            // Customer changes to Large
            act(() => {
                result.current.toggleSelection(1, '1-3', true);
            });

            // Customer removes Extra Shot
            act(() => {
                result.current.toggleSelection(2, '2-4', false);
            });

            // Customer adds Whipped Cream
            act(() => {
                result.current.toggleSelection(2, '2-5', false);
            });

            // Verify updated state
            expect(result.current.selections.get(1)?.has('1-3')).toBe(true);
            expect(result.current.selections.get(2)?.has('2-4')).toBe(false);
            expect(result.current.selections.get(2)?.has('2-5')).toBe(true);
        });
    });
});
