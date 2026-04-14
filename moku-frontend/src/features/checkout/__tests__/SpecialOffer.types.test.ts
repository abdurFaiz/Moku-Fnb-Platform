import { describe, it, expect } from 'vitest';
import type { SpecialOffer } from '../types/SpecialOffer';

describe('SpecialOffer Types', () => {
    describe('SpecialOffer interface', () => {
        it('should define correct SpecialOffer structure', () => {
            const mockSpecialOffer: SpecialOffer = {
                id: 'offer-1',
                name: 'Coffee + Pastry Bundle',
                description: 'Get any coffee with your favorite pastry at discounted price',
                price: 45000,
                image: 'https://example.com/coffee-pastry-bundle.jpg'
            };

            expect(mockSpecialOffer).toHaveProperty('id');
            expect(mockSpecialOffer).toHaveProperty('name');
            expect(mockSpecialOffer).toHaveProperty('description');
            expect(mockSpecialOffer).toHaveProperty('price');
            expect(mockSpecialOffer).toHaveProperty('image');

            expect(typeof mockSpecialOffer.id).toBe('string');
            expect(typeof mockSpecialOffer.name).toBe('string');
            expect(typeof mockSpecialOffer.description).toBe('string');
            expect(typeof mockSpecialOffer.price).toBe('number');
            expect(typeof mockSpecialOffer.image).toBe('string');
        });

        it('should handle different price formats', () => {
            const expensiveOffer: SpecialOffer = {
                id: 'expensive-offer',
                name: 'Premium Package',
                description: 'Luxury dining experience',
                price: 1500000, // Large number
                image: 'premium.jpg'
            };

            const cheapOffer: SpecialOffer = {
                id: 'cheap-offer',
                name: 'Student Discount',
                description: 'Special price for students',
                price: 15000, // Small number
                image: 'student.jpg'
            };

            expect(expensiveOffer.price).toBe(1500000);
            expect(cheapOffer.price).toBe(15000);
            expect(typeof expensiveOffer.price).toBe('number');
            expect(typeof cheapOffer.price).toBe('number');
        });

        it('should handle different name lengths', () => {
            const shortName: SpecialOffer = {
                id: 'short',
                name: 'Tea',
                description: 'Simple tea',
                price: 5000,
                image: 'tea.jpg'
            };

            const longName: SpecialOffer = {
                id: 'long',
                name: 'Premium Indonesian Single Origin Arabica Coffee with Hand-Selected Beans from Mount Bromo',
                description: 'Very detailed description of our premium coffee offering',
                price: 75000,
                image: 'premium-coffee.jpg'
            };

            expect(shortName.name.length).toBeGreaterThan(0);
            expect(longName.name.length).toBeGreaterThan(50);
            expect(typeof shortName.name).toBe('string');
            expect(typeof longName.name).toBe('string');
        });

        it('should handle different image URL formats', () => {
            const httpImage: SpecialOffer = {
                id: 'http-image',
                name: 'HTTP Image Offer',
                description: 'Offer with HTTP image',
                price: 25000,
                image: 'http://example.com/image.jpg'
            };

            const httpsImage: SpecialOffer = {
                id: 'https-image',
                name: 'HTTPS Image Offer',
                description: 'Offer with HTTPS image',
                price: 25000,
                image: 'https://example.com/image.jpg'
            };

            const relativeImage: SpecialOffer = {
                id: 'relative-image',
                name: 'Relative Image Offer',
                description: 'Offer with relative image path',
                price: 25000,
                image: '/images/offer.jpg'
            };

            const filename: SpecialOffer = {
                id: 'filename',
                name: 'Filename Offer',
                description: 'Offer with just filename',
                price: 25000,
                image: 'offer.jpg'
            };

            expect(httpImage.image).toMatch(/^http:/);
            expect(httpsImage.image).toMatch(/^https:/);
            expect(relativeImage.image).toMatch(/^\/images/);
            expect(filename.image).toBe('offer.jpg');
        });

        it('should handle special characters in strings', () => {
            const specialCharsOffer: SpecialOffer = {
                id: 'special-chars',
                name: 'Café Açaí & Crème Brûlée',
                description: 'Special café offering with açaí bowl & crème brûlée - 50% off!',
                price: 65000,
                image: 'café-açaí.jpg'
            };

            expect(specialCharsOffer.name).toContain('Café');
            expect(specialCharsOffer.name).toContain('Açaí');
            expect(specialCharsOffer.name).toContain('&');
            expect(specialCharsOffer.description).toContain('%');
            expect(specialCharsOffer.description).toContain('!');
        });

        it('should handle empty strings (edge case)', () => {
            const emptyStringsOffer: SpecialOffer = {
                id: '',
                name: '',
                description: '',
                price: 0,
                image: ''
            };

            expect(typeof emptyStringsOffer.id).toBe('string');
            expect(typeof emptyStringsOffer.name).toBe('string');
            expect(typeof emptyStringsOffer.description).toBe('string');
            expect(typeof emptyStringsOffer.price).toBe('number');
            expect(typeof emptyStringsOffer.image).toBe('string');

            expect(emptyStringsOffer.id).toBe('');
            expect(emptyStringsOffer.name).toBe('');
            expect(emptyStringsOffer.description).toBe('');
            expect(emptyStringsOffer.price).toBe(0);
            expect(emptyStringsOffer.image).toBe('');
        });

        it('should handle numeric IDs as strings', () => {
            const numericIdOffer: SpecialOffer = {
                id: '12345',
                name: 'Numeric ID Offer',
                description: 'Offer with numeric string ID',
                price: 30000,
                image: 'numeric.jpg'
            };

            expect(typeof numericIdOffer.id).toBe('string');
            expect(numericIdOffer.id).toBe('12345');
            expect(isNaN(Number(numericIdOffer.id))).toBe(false);
        });

        it('should support array of SpecialOffers', () => {
            const offers: SpecialOffer[] = [
                {
                    id: 'offer-1',
                    name: 'Coffee Special',
                    description: 'Buy 2 get 1 free',
                    price: 30000,
                    image: 'coffee.jpg'
                },
                {
                    id: 'offer-2',
                    name: 'Lunch Combo',
                    description: 'Main dish + drink',
                    price: 55000,
                    image: 'lunch.jpg'
                },
                {
                    id: 'offer-3',
                    name: 'Weekend Brunch',
                    description: 'All-day brunch menu',
                    price: 85000,
                    image: 'brunch.jpg'
                }
            ];

            expect(Array.isArray(offers)).toBe(true);
            expect(offers).toHaveLength(3);

            offers.forEach(offer => {
                expect(offer).toHaveProperty('id');
                expect(offer).toHaveProperty('name');
                expect(offer).toHaveProperty('description');
                expect(offer).toHaveProperty('price');
                expect(offer).toHaveProperty('image');
            });

            expect(offers[0].name).toBe('Coffee Special');
            expect(offers[1].price).toBe(55000);
            expect(offers[2].image).toBe('brunch.jpg');
        });

        it('should handle sorting by price', () => {
            const offers: SpecialOffer[] = [
                {
                    id: 'high-price',
                    name: 'Expensive',
                    description: 'High price offer',
                    price: 100000,
                    image: 'expensive.jpg'
                },
                {
                    id: 'low-price',
                    name: 'Cheap',
                    description: 'Low price offer',
                    price: 15000,
                    image: 'cheap.jpg'
                },
                {
                    id: 'mid-price',
                    name: 'Medium',
                    description: 'Medium price offer',
                    price: 50000,
                    image: 'medium.jpg'
                }
            ];

            const sortedByPrice = [...offers].sort((a, b) => a.price - b.price);

            expect(sortedByPrice[0].price).toBe(15000);
            expect(sortedByPrice[1].price).toBe(50000);
            expect(sortedByPrice[2].price).toBe(100000);

            expect(sortedByPrice[0].name).toBe('Cheap');
            expect(sortedByPrice[2].name).toBe('Expensive');
        });
    });
});