import { describe, it, expect } from 'vitest';
import { DynamicProductOrganizer } from '../services/dynamicProductOrganizer';
import { mockProducts, mockCategories } from './mockData';

describe('DynamicProductOrganizer', () => {
    describe('organizeProductsByCategories', () => {
        it('should organize products by categories correctly', () => {
            const result = DynamicProductOrganizer.organizeProductsByCategories(
                mockProducts,
                mockCategories
            );

            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('coffee');
            expect(result).toHaveProperty('teabeverages');
            expect(result).toHaveProperty('snacks');
        });

        it('should filter out unpublished products', () => {
            const result = DynamicProductOrganizer.organizeProductsByCategories(
                mockProducts,
                mockCategories
            );

            // Check all categories don't include unpublished product
            const allProducts = [
                ...result.recommendations,
                ...result.coffee,
                ...result.teabeverages,
                ...result.snacks,
            ];

            const hasUnpublished = allProducts.some(p => p.name === 'Unpublished Product');
            expect(hasUnpublished).toBe(false);
        });

        it('should separate recommended products correctly', () => {
            const result = DynamicProductOrganizer.organizeProductsByCategories(
                mockProducts,
                mockCategories
            );

            expect(result.recommendations).toHaveLength(2);
            expect(result.recommendations[0].isRecommended).toBe(true);
            expect(result.recommendations[1].isRecommended).toBe(true);
        });

        it('should transform products to HomeProduct format', () => {
            const result = DynamicProductOrganizer.organizeProductsByCategories(
                mockProducts,
                mockCategories
            );

            const firstProduct = result.coffee[0];
            expect(firstProduct).toHaveProperty('id');
            expect(firstProduct).toHaveProperty('name');
            expect(firstProduct).toHaveProperty('price');
            expect(firstProduct).toHaveProperty('description');
            expect(firstProduct).toHaveProperty('image');
            expect(firstProduct).toHaveProperty('isAvailable');
            expect(firstProduct).toHaveProperty('isPublished');
            expect(firstProduct).toHaveProperty('isRecommended');
            expect(firstProduct).toHaveProperty('categoryId');
        });

        it('should convert price from string to number', () => {
            const result = DynamicProductOrganizer.organizeProductsByCategories(
                mockProducts,
                mockCategories
            );

            const firstProduct = result.coffee[0];
            expect(typeof firstProduct.price).toBe('number');
            expect(firstProduct.price).toBe(25000);
        });

        it('should handle empty products array', () => {
            const result = DynamicProductOrganizer.organizeProductsByCategories(
                [],
                mockCategories
            );

            expect(result.recommendations).toHaveLength(0);
            expect(result.coffee).toHaveLength(0);
            expect(result.teabeverages).toHaveLength(0);
            expect(result.snacks).toHaveLength(0);
        });

        it('should handle empty categories array', () => {
            const result = DynamicProductOrganizer.organizeProductsByCategories(
                mockProducts,
                []
            );

            expect(result.recommendations).toHaveLength(2);
            // No category keys should exist
            expect(Object.keys(result).length).toBe(1); // Only recommendations
        });

        it('should place products in correct categories', () => {
            const result = DynamicProductOrganizer.organizeProductsByCategories(
                mockProducts,
                mockCategories
            );

            // Coffee category should have coffee products
            expect(result.coffee.some(p => p.name === 'Espresso')).toBe(true);
            expect(result.coffee.some(p => p.name === 'Cappuccino')).toBe(true);

            // Tea category should have tea products
            expect(result.teabeverages.some(p => p.name === 'Green Tea')).toBe(true);

            // Snacks category should have snack products (but not unpublished)
            expect(result.snacks.some(p => p.name === 'Croissant')).toBe(true);
        });

        it('should handle products with unavailable status', () => {
            const result = DynamicProductOrganizer.organizeProductsByCategories(
                mockProducts,
                mockCategories
            );

            // Croissant is unavailable but published, should still be included
            const croissant = result.snacks.find(p => p.name === 'Croissant');
            expect(croissant).toBeDefined();
            expect(croissant?.isAvailable).toBe(false);
        });
    });

    describe('getCategoryKey', () => {
        it('should convert category name to lowercase key', () => {
            const key = DynamicProductOrganizer.getCategoryKey('Coffee');
            expect(key).toBe('coffee');
        });

        it('should remove spaces from category name', () => {
            const key = DynamicProductOrganizer.getCategoryKey('Tea & Beverages');
            expect(key).toBe('teabeverages');
        });

        it('should remove special characters', () => {
            const key = DynamicProductOrganizer.getCategoryKey('Hot & Cold Drinks!');
            expect(key).toBe('hotcolddrinks');
        });

        it('should handle empty string', () => {
            const key = DynamicProductOrganizer.getCategoryKey('');
            expect(key).toBe('');
        });

        it('should handle multiple spaces', () => {
            const key = DynamicProductOrganizer.getCategoryKey('Hot   Cold   Drinks');
            expect(key).toBe('hotcolddrinks');
        });
    });

    describe('getCategoryDisplayName', () => {
        it('should return original category name from key', () => {
            const displayName = DynamicProductOrganizer.getCategoryDisplayName(
                'coffee',
                mockCategories
            );
            expect(displayName).toBe('Coffee');
        });

        it('should return original name with special characters', () => {
            const displayName = DynamicProductOrganizer.getCategoryDisplayName(
                'teabeverages',
                mockCategories
            );
            expect(displayName).toBe('Tea & Beverages');
        });

        it('should return key if category not found', () => {
            const displayName = DynamicProductOrganizer.getCategoryDisplayName(
                'nonexistent',
                mockCategories
            );
            expect(displayName).toBe('nonexistent');
        });

        it('should handle empty categories array', () => {
            const displayName = DynamicProductOrganizer.getCategoryDisplayName(
                'coffee',
                []
            );
            expect(displayName).toBe('coffee');
        });
    });

    describe('createSectionId', () => {
        it('should create kebab-case section ID', () => {
            const sectionId = DynamicProductOrganizer.createSectionId('Coffee');
            expect(sectionId).toBe('coffee');
        });

        it('should replace spaces with hyphens', () => {
            const sectionId = DynamicProductOrganizer.createSectionId('Tea & Beverages');
            expect(sectionId).toBe('tea--beverages');
        });

        it('should remove special characters except hyphens', () => {
            const sectionId = DynamicProductOrganizer.createSectionId('Hot & Cold!');
            expect(sectionId).toBe('hot--cold');
        });

        it('should handle empty string', () => {
            const sectionId = DynamicProductOrganizer.createSectionId('');
            expect(sectionId).toBe('');
        });

        it('should convert to lowercase', () => {
            const sectionId = DynamicProductOrganizer.createSectionId('COFFEE DRINKS');
            expect(sectionId).toBe('coffee-drinks');
        });
    });
});