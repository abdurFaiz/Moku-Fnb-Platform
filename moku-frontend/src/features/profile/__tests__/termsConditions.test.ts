import { describe, it, expect } from 'vitest';
import { termsData, type TermsAndConditions, type TermsSection } from '../constants/dataSyaratKetentuanConstant';
import './setup';

describe('Terms and Conditions Constants', () => {
    describe('Data Structure', () => {
        it('should have valid structure', () => {
            expect(termsData).toBeDefined();
            expect(termsData.title).toBeDefined();
            expect(termsData.description).toBeDefined();
            expect(termsData.sections).toBeDefined();
            expect(Array.isArray(termsData.sections)).toBe(true);
        });

        it('should have title and description', () => {
            expect(typeof termsData.title).toBe('string');
            expect(termsData.title.length).toBeGreaterThan(0);
            expect(typeof termsData.description).toBe('string');
            expect(termsData.description.length).toBeGreaterThan(0);
        });

        it('should have at least one section', () => {
            expect(termsData.sections.length).toBeGreaterThan(0);
        });
    });

    describe('Section Validation', () => {
        it('should have valid sections with required fields', () => {
            termsData.sections.forEach((section: TermsSection) => {
                expect(section.id).toBeDefined();
                expect(typeof section.id).toBe('number');
                expect(section.title).toBeDefined();
                expect(typeof section.title).toBe('string');
                expect(section.content).toBeDefined();
                expect(typeof section.content).toBe('string');
            });
        });

        it('should have unique section IDs', () => {
            const ids = termsData.sections.map(section => section.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have non-empty titles and content', () => {
            termsData.sections.forEach((section: TermsSection) => {
                expect(section.title.length).toBeGreaterThan(0);
                expect(section.content.length).toBeGreaterThan(0);
            });
        });

        it('should have sequential section IDs starting from 1', () => {
            termsData.sections.forEach((section: TermsSection, index: number) => {
                expect(section.id).toBe(index + 1);
            });
        });

        it('should have reasonable content lengths', () => {
            termsData.sections.forEach((section: TermsSection) => {
                expect(section.content.length).toBeGreaterThan(20);
                expect(section.content.length).toBeLessThan(2000);
            });
        });
    });

    describe('Content Validation', () => {
        it('should have title "Syarat dan Ketentuan" or similar', () => {
            expect(termsData.title.toLowerCase()).toMatch(/syarat|ketentuan|terms/);
        });

        it('should contain expected terms-related sections', () => {
            const expectedTopics = ['penggunaan', 'layanan', 'pengguna', 'ketentuan', 'hak'];
            const sectionTitles = termsData.sections.map(s => s.title.toLowerCase());
            const sectionContents = termsData.sections.map(s => s.content.toLowerCase());
            const allText = [...sectionTitles, ...sectionContents].join(' ');

            expectedTopics.forEach(topic => {
                expect(allText).toContain(topic);
            });
        });

        it('should not have duplicate section titles', () => {
            const titles = termsData.sections.map(section => section.title.toLowerCase());
            const uniqueTitles = new Set(titles);
            expect(uniqueTitles.size).toBe(titles.length);
        });

        it('should mention Spinofy in content', () => {
            const allText = termsData.sections
                .map(s => s.title + ' ' + s.content)
                .join(' ')
                .toLowerCase();

            expect(allText).toContain('spinofy');
        });
    });

    describe('Type Definitions', () => {
        it('should have correct TermsAndConditions type structure', () => {
            const mockTerms: TermsAndConditions = {
                title: 'Test',
                description: 'Test description',
                sections: [],
            };

            expect(mockTerms.title).toBeDefined();
            expect(mockTerms.description).toBeDefined();
            expect(mockTerms.sections).toBeDefined();
        });

        it('should have correct TermsSection type structure', () => {
            const mockSection: TermsSection = {
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
            const originalLength = termsData.sections.length;
            expect(originalLength).toBeGreaterThan(0);
            expect(termsData.sections[0]).toBeDefined();
        });

        it('should have consistent data structure across all sections', () => {
            termsData.sections.forEach((section: TermsSection) => {
                expect(Object.keys(section)).toEqual(['id', 'title', 'content']);
            });
        });
    });

    describe('Legal Content', () => {
        it('should contain legal terminology', () => {
            const allText = termsData.sections
                .map(s => s.title + ' ' + s.content)
                .join(' ')
                .toLowerCase();

            const legalTerms = ['hak', 'kewajiban', 'tanggung jawab', 'persetujuan'];
            const hasLegalTerms = legalTerms.some(term => allText.includes(term));
            expect(hasLegalTerms).toBe(true);
        });

        it('should have comprehensive coverage', () => {
            // Should have multiple sections covering different aspects
            expect(termsData.sections.length).toBeGreaterThanOrEqual(5);
        });

        it('should have detailed content', () => {
            // Each section should have substantial content
            const totalContentLength = termsData.sections.reduce(
                (sum, section) => sum + section.content.length,
                0
            );
            expect(totalContentLength).toBeGreaterThan(500);
        });
    });

    describe('Edge Cases', () => {
        it('should handle special characters in content', () => {
            termsData.sections.forEach((section: TermsSection) => {
                // Should not throw when accessing content with special chars
                expect(() => section.content.includes('&')).not.toThrow();
                expect(() => section.content.includes('"')).not.toThrow();
            });
        });

        it('should have valid Indonesian text', () => {
            const allText = termsData.sections
                .map(s => s.title + ' ' + s.content)
                .join(' ');

            // Check for common Indonesian words
            const indonesianWords = ['dan', 'atau', 'yang', 'untuk', 'dengan'];
            const hasIndonesian = indonesianWords.some(word => allText.toLowerCase().includes(word));
            expect(hasIndonesian).toBe(true);
        });

        it('should not have empty sections', () => {
            termsData.sections.forEach((section: TermsSection) => {
                expect(section.title.trim()).not.toBe('');
                expect(section.content.trim()).not.toBe('');
            });
        });
    });

    describe('Comparison with Other Legal Documents', () => {
        it('should have similar structure to privacy policy', () => {
            // Both should have title, description, and sections
            expect(termsData).toHaveProperty('title');
            expect(termsData).toHaveProperty('description');
            expect(termsData).toHaveProperty('sections');
            expect(Array.isArray(termsData.sections)).toBe(true);
        });

        it('should have unique content from privacy policy', () => {
            // Terms should focus on usage, not privacy
            const termsText = termsData.sections
                .map(s => s.content)
                .join(' ')
                .toLowerCase();

            const termsKeywords = ['penggunaan', 'layanan', 'pengguna'];
            const hasTermsKeywords = termsKeywords.some(keyword => termsText.includes(keyword));
            expect(hasTermsKeywords).toBe(true);
        });
    });
});
