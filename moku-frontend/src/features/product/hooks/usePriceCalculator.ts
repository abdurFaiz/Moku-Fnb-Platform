import type { ProductDetail } from '@/features/product/types/DetailProduct';
import { ProductAttributeService } from '@/features/product/services/ProductAttributeService';

/**
 * Custom hook for calculating product prices based on selections and quantity
 */
export const usePriceCalculator = () => {
    /**
     * Calculate the price per unit including base price and extra charges
     * @param product Product detail object
     * @param selections Map of attribute selections
     * @returns Price per unit in currency units
     */
    const calculateUnitPrice = (
        product: ProductDetail,
        selections: Map<number, Set<string>>
    ): number => {
        const basePrice = Number.parseInt(product.price);
        const extraPrice = ProductAttributeService.calculateExtraPrice(
            product.attributes || [],
            selections
        );
        return basePrice + extraPrice;
    };

    /**
     * Calculate total price (unit price × quantity)
     * @param product Product detail object
     * @param selections Map of attribute selections
     * @param quantity Quantity to purchase
     * @returns Total price
     */
    const calculateTotalPrice = (
        product: ProductDetail,
        selections: Map<number, Set<string>>,
        quantity: number
    ): number => {
        const unitPrice = calculateUnitPrice(product, selections);
        return unitPrice * quantity;
    };

    /**
     * Get base price from product
     * @param product Product detail object
     * @returns Base price
     */
    const getBasePrice = (product: ProductDetail): number => {
        return Number.parseInt(product.price);
    };

    return {
        calculateUnitPrice,
        calculateTotalPrice,
        getBasePrice,
    };
};
