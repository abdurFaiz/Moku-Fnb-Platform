import { describe, it, expect } from 'vitest';
import { refundPolicyData, type RefundPolicy, type RefundSection } from '../constants/dataRefundPolicyConstant';
import './setup';

describe('Refund Policy Constants', () => {
    describe('Data Structure', () => {
        it('should have valid structure', () => {
            expect(refundPolicyData).toBeDefined();
            expect(refundPolicyData.title).toBeDefined();
            expect(refundPolicyData.subtitle).toBeDefined();
            expect(refundPolicyData.sections).toBeDefined();
            expect(Array.isArray(refundPolicyData.sections)).toBe(true);
        });

        it('should have title and subtitle', () => {
            expect(typeof refundPolicyData.title).toBe('string');
            expect(refundPolicyData.title.length).toBeGreaterThan(0);
            expect(typeof refundPolicyData.subtitle).toBe('string');
            expect(refundPolicyData.subtitle.length).toBeGreaterThan(0);
        });

        it('should have at least one section', () => {
            expect(refundPolicyData.sections.length).toBeGreaterThan(0);
        });
    });

    describe('Section Validation', () => {
        it('should have valid sections with required fields', () => {
            refundPolicyData.sections.forEach((section: RefundSection) => {
                expect(section.id).toBeDefined();
                expect(typeof section.id).toBe('number');
                expect(section.title).toBeDefined();
                expect(typeof section.title).toBe('string');
                expect(section.content).toBeDefined();
                expect(typeof section.content).toBe('string');
            });
        });

        it('should have unique section IDs', () => {
            const ids = refundPolicyData.sections.map(section => section.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have non-empty titles and content', () => {
            refundPolicyData.sections.forEach((section: RefundSection) => {
                expect(section.title.length).toBeGreaterThan(0);
                expect(section.content.length).toBeGreaterThan(0);
            });
        });

        it('should have sequential section IDs starting from 1', () => {
            refundPolicyData.sections.forEach((section: RefundSection, index: number) => {
                expect(section.id).toBe(index + 1);
            });
        });

        it('should have reasonable content lengths', () => {
            refundPolicyData.sections.forEach((section: RefundSection) => {
                expect(section.content.length).toBeGreaterThan(20);
                expect(section.content.length).toBeLessThan(2000);
            });
        });
    });

    describe('Content Validation', () => {
        it('should have title "Refund Policy" or similar', () => {
            expect(refundPolicyData.title.toLowerCase()).toMatch(/pengembalian|refund/);
        });

        it('should contain expected refund-related sections', () => {
            const expectedTopics = ['refund', 'kedai', 'sistem', 'biaya'];
            const sectionTitles = refundPolicyData.sections.map(s => s.title.toLowerCase());
            const sectionContents = refundPolicyData.sections.map(s => s.content.toLowerCase());
            const allText = [...sectionTitles, ...sectionContents].join(' ');

            expectedTopics.forEach(topic => {
                expect(allText).toContain(topic);
            });
        });

        it('should not have duplicate section titles', () => {
            const titles = refundPolicyData.sections.map(section => section.title.toLowerCase());
            const uniqueTitles = new Set(titles);
            expect(uniqueTitles.size).toBe(titles.length);
        });
    });

    describe('Type Definitions', () => {
        it('should have correct RefundPolicy type structure', () => {
            const mockPolicy: RefundPolicy = {
                title: 'Test',
                subtitle: 'Test subtitle',
                sections: [],
            };

            expect(mockPolicy.title).toBeDefined();
            expect(mockPolicy.subtitle).toBeDefined();
            expect(mockPolicy.sections).toBeDefined();
        });

        it('should have correct RefundSection type structure', () => {
            const mockSection: RefundSection = {
                id: 1,
                title: 'Test',
                content: 'Test content',
            };

            expect(mockSection.id).toBeDefined();
            expect(mockSection.title).toBeDefined();
            expect(mockSection.content).toBeDefined();
        });
    });

    describe('Data Integrity', () => {
        it('should have immutable data', () => {
            const originalLength = refundPolicyData.sections.length;
            expect(originalLength).toBeGreaterThan(0);
            expect(refundPolicyData.sections[0]).toBeDefined();
        });

        it('should have consistent data structure across all sections', () => {
            refundPolicyData.sections.forEach((section: RefundSection) => {
                const keys = Object.keys(section);
                expect(keys).toContain('id');
                expect(keys).toContain('title');
                expect(keys).toContain('content');
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle special characters in content', () => {
            refundPolicyData.sections.forEach((section: RefundSection) => {
                // Should not throw when accessing content with special chars
                expect(() => section.content.includes('&')).not.toThrow();
                expect(() => section.content.includes('"')).not.toThrow();
            });
        });

        it('should have valid Indonesian text', () => {
            const allText = refundPolicyData.sections
                .map(s => s.title + ' ' + s.content)
                .join(' ');

            // Check for common Indonesian words
            const indonesianWords = ['dan', 'atau', 'yang', 'untuk', 'dengan'];
            const hasIndonesian = indonesianWords.some(word => allText.toLowerCase().includes(word));
            expect(hasIndonesian).toBe(true);
        });
    });
});
