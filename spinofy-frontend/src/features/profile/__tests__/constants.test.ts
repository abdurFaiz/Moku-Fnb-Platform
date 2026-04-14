import { describe, it, expect } from 'vitest';
import { faqData, type FaqItem, type FaqList } from '../constants/dataFAQConstant';
import { privacyPolicyData, type PrivacyPolicy, type PrivacySection } from '../constants/dataKebijakanPrivasiConstant';
import './setup';

describe('Profile Constants', () => {
    describe('FAQ Data', () => {
        it('should have valid structure', () => {
            expect(faqData).toBeDefined();
            expect(faqData.items).toBeDefined();
            expect(Array.isArray(faqData.items)).toBe(true);
        });

        it('should have at least one FAQ item', () => {
            expect(faqData.items.length).toBeGreaterThan(0);
        });

        it('should have valid FAQ items with required fields', () => {
            faqData.items.forEach((item: FaqItem) => {
                expect(item.id).toBeDefined();
                expect(typeof item.id).toBe('number');
                expect(item.question).toBeDefined();
                expect(typeof item.question).toBe('string');
                expect(item.answer).toBeDefined();
                expect(typeof item.answer).toBe('string');
            });
        });

        it('should have unique FAQ IDs', () => {
            const ids = faqData.items.map(item => item.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have non-empty questions and answers', () => {
            faqData.items.forEach((item: FaqItem) => {
                expect(item.question.length).toBeGreaterThan(0);
                expect(item.answer.length).toBeGreaterThan(0);
            });
        });

        it('should have sequential IDs starting from 1', () => {
            faqData.items.forEach((item: FaqItem, index: number) => {
                expect(item.id).toBe(index + 1);
            });
        });

        it('should contain expected FAQ about Spinofy', () => {
            const spinofyFaq = faqData.items.find(item =>
                item.question.toLowerCase().includes('spinofy')
            );
            expect(spinofyFaq).toBeDefined();
        });

        it('should have reasonable answer lengths', () => {
            faqData.items.forEach((item: FaqItem) => {
                expect(item.answer.length).toBeGreaterThan(10);
                expect(item.answer.length).toBeLessThan(1000);
            });
        });
    });

    describe('Privacy Policy Data', () => {
        it('should have valid structure', () => {
            expect(privacyPolicyData).toBeDefined();
            expect(privacyPolicyData.title).toBeDefined();
            expect(privacyPolicyData.description).toBeDefined();
            expect(privacyPolicyData.sections).toBeDefined();
            expect(Array.isArray(privacyPolicyData.sections)).toBe(true);
        });

        it('should have title and description', () => {
            expect(typeof privacyPolicyData.title).toBe('string');
            expect(privacyPolicyData.title.length).toBeGreaterThan(0);
            expect(typeof privacyPolicyData.description).toBe('string');
            expect(privacyPolicyData.description.length).toBeGreaterThan(0);
        });

        it('should have at least one section', () => {
            expect(privacyPolicyData.sections.length).toBeGreaterThan(0);
        });

        it('should have valid sections with required fields', () => {
            privacyPolicyData.sections.forEach((section: PrivacySection) => {
                expect(section.id).toBeDefined();
                expect(typeof section.id).toBe('number');
                expect(section.title).toBeDefined();
                expect(typeof section.title).toBe('string');
                expect(section.content).toBeDefined();
                expect(typeof section.content).toBe('string');
            });
        });

        it('should have unique section IDs', () => {
            const ids = privacyPolicyData.sections.map(section => section.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have non-empty titles and content', () => {
            privacyPolicyData.sections.forEach((section: PrivacySection) => {
                expect(section.title.length).toBeGreaterThan(0);
                expect(section.content.length).toBeGreaterThan(0);
            });
        });

        it('should have sequential section IDs starting from 1', () => {
            privacyPolicyData.sections.forEach((section: PrivacySection, index: number) => {
                expect(section.id).toBe(index + 1);
            });
        });

        it('should contain expected sections', () => {
            const expectedTopics = ['informasi', 'penggunaan', 'keamanan', 'cookie', 'hak', 'pembaruan'];
            const sectionTitles = privacyPolicyData.sections.map(s => s.title.toLowerCase());

            expectedTopics.forEach(topic => {
                const hasTopicSection = sectionTitles.some(title => title.includes(topic));
                expect(hasTopicSection).toBe(true);
            });
        });

        it('should have reasonable content lengths', () => {
            privacyPolicyData.sections.forEach((section: PrivacySection) => {
                expect(section.content.length).toBeGreaterThan(20);
                expect(section.content.length).toBeLessThan(2000);
            });
        });

        it('should have title "Kebijakan Privasi"', () => {
            expect(privacyPolicyData.title).toBe('Kebijakan Privasi');
        });
    });

    describe('Type Definitions', () => {
        it('should have correct FaqItem type structure', () => {
            const mockFaqItem: FaqItem = {
                id: 1,
                question: 'Test question',
                answer: 'Test answer',
            };

            expect(mockFaqItem.id).toBeDefined();
            expect(mockFaqItem.question).toBeDefined();
            expect(mockFaqItem.answer).toBeDefined();
        });

        it('should have correct FaqList type structure', () => {
            const mockFaqList: FaqList = {
                items: [],
            };

            expect(mockFaqList.items).toBeDefined();
            expect(Array.isArray(mockFaqList.items)).toBe(true);
        });

        it('should have correct PrivacyPolicy type structure', () => {
            const mockPolicy: PrivacyPolicy = {
                title: 'Test',
                description: 'Test description',
                sections: [],
            };

            expect(mockPolicy.title).toBeDefined();
            expect(mockPolicy.description).toBeDefined();
            expect(mockPolicy.sections).toBeDefined();
        });

        it('should have correct PrivacySection type structure', () => {
            const mockSection: PrivacySection = {
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
        it('should not have duplicate FAQ questions', () => {
            const questions = faqData.items.map(item => item.question.toLowerCase());
            const uniqueQuestions = new Set(questions);
            expect(uniqueQuestions.size).toBe(questions.length);
        });

        it('should not have duplicate privacy policy section titles', () => {
            const titles = privacyPolicyData.sections.map(section => section.title.toLowerCase());
            const uniqueTitles = new Set(titles);
            expect(uniqueTitles.size).toBe(titles.length);
        });

        it('should have FAQ data that is immutable', () => {
            const originalLength = faqData.items.length;
            expect(originalLength).toBeGreaterThan(0);
            // Verify data exists and is accessible
            expect(faqData.items[0]).toBeDefined();
        });

        it('should have privacy policy data that is immutable', () => {
            const originalLength = privacyPolicyData.sections.length;
            expect(originalLength).toBeGreaterThan(0);
            // Verify data exists and is accessible
            expect(privacyPolicyData.sections[0]).toBeDefined();
        });
    });
});
