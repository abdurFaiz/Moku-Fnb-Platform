import { describe, it, expect } from 'vitest';
import { ProductAttributeService } from '../services/ProductAttributeService';
import { mockProductAttributes, mockToppingValues } from './mockData';
import type { ProductAttribute } from '../types/DetailProduct';

describe('ProductAttributeService', () => {
    describe('initializeDefaultSelections', () => {
        it('should initialize with default values', () => {
            const selections = ProductAttributeService.initializeDefaultSelections(
                mockProductAttributes
            );

            expect(selections.size).toBe(2);

            // Size attribute should have default (Small - id: 1)
            const sizeSelections = selections.get(1);
            expect(sizeSelections).toBeDefined();
            expect(sizeSelections?.has('1-1')).toBe(true); // attr-1, value-1
        });

        it('should handle attributes with no default values', () => {
            const attributesNoDefaults: ProductAttribute[] = [
                {
                    ...mockProductAttributes[0],
                    values: mockProductAttributes[0].values.map(v => ({
                        ...v,
                        is_default: 0,
                    })),
                },
            ];

            const selections = ProductAttributeService.initializeDefaultSelections(
                attributesNoDefaults
            );

            const sizeSelections = selections.get(1);
            expect(sizeSelections?.size).toBe(0);
        });

        it('should handle empty attributes array', () => {
            const selections = ProductAttributeService.initializeDefaultSelections([]);
            expect(selections.size).toBe(0);
        });

        it('should handle multiple default values for checkbox attributes', () => {
            const multiDefaultAttr: ProductAttribute[] = [
                {
                    id: 2,
                    name: 'Toppings',
                    display_type: 2,
                    outlet_id: 1,
                    created_at: '2024-01-01T00:00:00.000Z',
                    updated_at: '2024-01-01T00:00:00.000Z',
                    laravel_through_key: 1,
                    values: [
                        { ...mockToppingValues[0], is_default: 1 },
                        { ...mockToppingValues[1], is_default: 1 },
                    ],
                },
            ];

            const selections = ProductAttributeService.initializeDefaultSelections(
                multiDefaultAttr
            );

            const toppingSelections = selections.get(2);
            expect(toppingSelections?.size).toBe(2);
        });
    });

    describe('initializeFromVariants', () => {
        it('should initialize selections from variant IDs', () => {
            const variantIds = [2, 4]; // Medium size + Extra Shot
            const selections = ProductAttributeService.initializeFromVariants(
                mockProductAttributes,
                variantIds
            );

            expect(selections.size).toBe(2);

            // Should have Medium selected
            const sizeSelections = selections.get(1);
            expect(sizeSelections?.has('1-2')).toBe(true);

            // Should have Extra Shot selected
            const toppingSelections = selections.get(2);
            expect(toppingSelections?.has('2-4')).toBe(true);
        });

        it('should fall back to defaults when variantIds is empty', () => {
            const selections = ProductAttributeService.initializeFromVariants(
                mockProductAttributes,
                []
            );

            // Should use default selections
            const sizeSelections = selections.get(1);
            expect(sizeSelections?.has('1-1')).toBe(true); // Default Small
        });

        it('should fall back to defaults when variantIds is undefined', () => {
            const selections = ProductAttributeService.initializeFromVariants(
                mockProductAttributes,
                undefined
            );

            const sizeSelections = selections.get(1);
            expect(sizeSelections?.has('1-1')).toBe(true);
        });

        it('should handle multiple variant IDs for same attribute', () => {
            const variantIds = [4, 5]; // Extra Shot + Whipped Cream
            const selections = ProductAttributeService.initializeFromVariants(
                mockProductAttributes,
                variantIds
            );

            const toppingSelections = selections.get(2);
            expect(toppingSelections?.size).toBe(2);
            expect(toppingSelections?.has('2-4')).toBe(true);
            expect(toppingSelections?.has('2-5')).toBe(true);
        });

        it('should ignore invalid variant IDs', () => {
            const variantIds = [1, 999]; // Valid + Invalid
            const selections = ProductAttributeService.initializeFromVariants(
                mockProductAttributes,
                variantIds
            );

            const sizeSelections = selections.get(1);
            expect(sizeSelections?.has('1-1')).toBe(true);
            expect(sizeSelections?.size).toBe(1);
        });
    });

    describe('toggleSelection', () => {
        it('should toggle radio selection (replace existing)', () => {
            const currentSelections = new Map<number, Set<string>>();
            currentSelections.set(1, new Set(['1-1'])); // Small selected

            const newSelections = ProductAttributeService.toggleSelection(
                currentSelections,
                1,
                '1-2', // Select Medium
                true // isRadio
            );

            const sizeSelections = newSelections.get(1);
            expect(sizeSelections?.has('1-1')).toBe(false);
            expect(sizeSelections?.has('1-2')).toBe(true);
            expect(sizeSelections?.size).toBe(1);
        });

        it('should toggle checkbox selection (add)', () => {
            const currentSelections = new Map<number, Set<string>>();
            currentSelections.set(2, new Set(['2-4'])); // Extra Shot selected

            const newSelections = ProductAttributeService.toggleSelection(
                currentSelections,
                2,
                '2-5', // Add Whipped Cream
                false // isCheckbox
            );

            const toppingSelections = newSelections.get(2);
            expect(toppingSelections?.has('2-4')).toBe(true);
            expect(toppingSelections?.has('2-5')).toBe(true);
            expect(toppingSelections?.size).toBe(2);
        });

        it('should toggle checkbox selection (remove)', () => {
            const currentSelections = new Map<number, Set<string>>();
            currentSelections.set(2, new Set(['2-4', '2-5']));

            const newSelections = ProductAttributeService.toggleSelection(
                currentSelections,
                2,
                '2-4', // Remove Extra Shot
                false
            );

            const toppingSelections = newSelections.get(2);
            expect(toppingSelections?.has('2-4')).toBe(false);
            expect(toppingSelections?.has('2-5')).toBe(true);
            expect(toppingSelections?.size).toBe(1);
        });

        it('should create new set if attribute not in selections', () => {
            const currentSelections = new Map<number, Set<string>>();

            const newSelections = ProductAttributeService.toggleSelection(
                currentSelections,
                1,
                '1-1',
                true
            );

            const sizeSelections = newSelections.get(1);
            expect(sizeSelections?.has('1-1')).toBe(true);
        });

        it('should not mutate original selections map', () => {
            const currentSelections = new Map<number, Set<string>>();
            currentSelections.set(1, new Set(['1-1']));

            const newSelections = ProductAttributeService.toggleSelection(
                currentSelections,
                1,
                '1-2',
                true
            );

            // Original should still have old value
            expect(currentSelections.get(1)?.has('1-1')).toBe(true);
            // New should have new value
            expect(newSelections.get(1)?.has('1-2')).toBe(true);
        });
    });

    describe('extractVariantIds', () => {
        it('should extract variant IDs from selections', () => {
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-2'])); // Medium
            selections.set(2, new Set(['2-4', '2-5'])); // Extra Shot + Whipped Cream

            const variantIds = ProductAttributeService.extractVariantIds(
                mockProductAttributes,
                selections
            );

            expect(variantIds).toContain(2);
            expect(variantIds).toContain(4);
            expect(variantIds).toContain(5);
            expect(variantIds).toHaveLength(3);
        });

        it('should handle empty selections', () => {
            const selections = new Map<number, Set<string>>();

            const variantIds = ProductAttributeService.extractVariantIds(
                mockProductAttributes,
                selections
            );

            expect(variantIds).toHaveLength(0);
        });

        it('should handle selections with no matching attributes', () => {
            const selections = new Map<number, Set<string>>();
            selections.set(999, new Set(['999-1'])); // Non-existent attribute

            const variantIds = ProductAttributeService.extractVariantIds(
                mockProductAttributes,
                selections
            );

            expect(variantIds).toHaveLength(0);
        });

        it('should parse value IDs correctly', () => {
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-3'])); // Large

            const variantIds = ProductAttributeService.extractVariantIds(
                mockProductAttributes,
                selections
            );

            expect(variantIds[0]).toBe(3);
            expect(typeof variantIds[0]).toBe('number');
        });
    });

    describe('extractAttributeData', () => {
        it('should extract formatted attribute strings', () => {
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-2'])); // Medium
            selections.set(2, new Set(['2-4'])); // Extra Shot

            const attributeData = ProductAttributeService.extractAttributeData(
                mockProductAttributes,
                selections
            );

            expect(attributeData).toContain('Size: Medium');
            expect(attributeData).toContain('Toppings: Extra Shot');
            expect(attributeData).toHaveLength(2);
        });

        it('should handle multiple selections for same attribute', () => {
            const selections = new Map<number, Set<string>>();
            selections.set(2, new Set(['2-4', '2-5'])); // Both toppings

            const attributeData = ProductAttributeService.extractAttributeData(
                mockProductAttributes,
                selections
            );

            expect(attributeData).toContain('Toppings: Extra Shot');
            expect(attributeData).toContain('Toppings: Whipped Cream');
            expect(attributeData).toHaveLength(2);
        });

        it('should handle empty selections', () => {
            const selections = new Map<number, Set<string>>();

            const attributeData = ProductAttributeService.extractAttributeData(
                mockProductAttributes,
                selections
            );

            expect(attributeData).toHaveLength(0);
        });

        it('should skip invalid value IDs', () => {
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-999'])); // Invalid value ID

            const attributeData = ProductAttributeService.extractAttributeData(
                mockProductAttributes,
                selections
            );

            expect(attributeData).toHaveLength(0);
        });
    });

    describe('calculateExtraPrice', () => {
        it('should calculate extra price from selections', () => {
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-3'])); // Large (+10000)
            selections.set(2, new Set(['2-4'])); // Extra Shot (+8000)

            const extraPrice = ProductAttributeService.calculateExtraPrice(
                mockProductAttributes,
                selections
            );

            expect(extraPrice).toBe(18000);
        });

        it('should return 0 for default selections with no extra price', () => {
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-1'])); // Small (no extra price)

            const extraPrice = ProductAttributeService.calculateExtraPrice(
                mockProductAttributes,
                selections
            );

            expect(extraPrice).toBe(0);
        });

        it('should sum multiple selections', () => {
            const selections = new Map<number, Set<string>>();
            selections.set(2, new Set(['2-4', '2-5'])); // Extra Shot (+8000) + Whipped Cream (+5000)

            const extraPrice = ProductAttributeService.calculateExtraPrice(
                mockProductAttributes,
                selections
            );

            expect(extraPrice).toBe(13000);
        });

        it('should handle empty selections', () => {
            const selections = new Map<number, Set<string>>();

            const extraPrice = ProductAttributeService.calculateExtraPrice(
                mockProductAttributes,
                selections
            );

            expect(extraPrice).toBe(0);
        });

        it('should handle invalid value IDs gracefully', () => {
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-999'])); // Invalid

            const extraPrice = ProductAttributeService.calculateExtraPrice(
                mockProductAttributes,
                selections
            );

            expect(extraPrice).toBe(0);
        });

        it('should calculate complex combination correctly', () => {
            const selections = new Map<number, Set<string>>();
            selections.set(1, new Set(['1-2'])); // Medium (+5000)
            selections.set(2, new Set(['2-4', '2-5'])); // Extra Shot (+8000) + Whipped Cream (+5000)

            const extraPrice = ProductAttributeService.calculateExtraPrice(
                mockProductAttributes,
                selections
            );

            expect(extraPrice).toBe(18000); // 5000 + 8000 + 5000
        });
    });
});
