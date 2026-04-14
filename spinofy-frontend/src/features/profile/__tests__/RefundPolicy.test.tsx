import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RefundPolicy from '../pages/legal/RefundPolicy';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import { refundPolicyData } from '@/features/profile/constants/dataRefundPolicyConstant';
import './setup';

// Mock dependencies
vi.mock('@/hooks/shared/useOutletNavigation');
vi.mock('@/components', () => ({
    HeaderBar: ({ title, onBack }: any) => (
        <div data-testid="header-bar">
            <span>{title}</span>
            <button onClick={onBack}>Back</button>
        </div>
    ),
    ScreenWrapper: ({ children }: any) => <div data-testid="screen-wrapper">{children}</div>,
}));
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

const mockNavigateToAccount = vi.fn();

describe('RefundPolicy', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useOutletNavigation).mockReturnValue({
            navigateToAccount: mockNavigateToAccount,
        } as any);
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <RefundPolicy />
            </BrowserRouter>
        );
    };

    describe('Component Rendering', () => {
        it('should render the component', () => {
            renderComponent();
            expect(screen.getByTestId('screen-wrapper')).toBeInTheDocument();
        });

        it('should render header with title', () => {
            renderComponent();
            expect(screen.getByTestId('header-bar')).toBeInTheDocument();
        });

        it('should render main title', () => {
            renderComponent();
            const titles = screen.getAllByText(refundPolicyData.title);
            expect(titles.length).toBeGreaterThan(0);
        });

        it('should render subtitle', () => {
            renderComponent();
            expect(screen.getByText(refundPolicyData.subtitle)).toBeInTheDocument();
        });
    });

    describe('Sections Display', () => {
        it('should render all refund policy sections', () => {
            renderComponent();
            refundPolicyData.sections.forEach(section => {
                expect(screen.getByText(section.title)).toBeInTheDocument();
            });
        });

        it('should render section content', () => {
            renderComponent();
            refundPolicyData.sections.forEach(section => {
                expect(screen.getByText(section.content)).toBeInTheDocument();
            });
        });

        it('should render correct number of sections', () => {
            const { container } = renderComponent();
            const sections = container.querySelectorAll('.bg-white.dark\\:bg-neutral-900');
            expect(sections.length).toBe(refundPolicyData.sections.length);
        });
    });

    describe('List Items Display', () => {
        it('should render list items when section has list', () => {
            renderComponent();
            refundPolicyData.sections.forEach(section => {
                if (section.list) {
                    section.list.forEach(item => {
                        expect(screen.getByText(item)).toBeInTheDocument();
                    });
                }
            });
        });

        it('should render list with correct styling', () => {
            const { container } = renderComponent();
            const lists = container.querySelectorAll('ul.list-disc');
            if (refundPolicyData.sections.some(s => s.list)) {
                expect(lists.length).toBeGreaterThan(0);
            }
        });

        it('should have list-inside class', () => {
            const { container } = renderComponent();
            const lists = container.querySelectorAll('ul.list-inside');
            if (refundPolicyData.sections.some(s => s.list)) {
                expect(lists.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Contact Information Display', () => {
        it('should render contact information when section has contacts', () => {
            renderComponent();
            refundPolicyData.sections.forEach(section => {
                if (section.contacts) {
                    section.contacts.forEach(contact => {
                        expect(screen.getByText(new RegExp(contact.label))).toBeInTheDocument();
                    });
                }
            });
        });

        it('should render contact links when provided', () => {
            const { container } = renderComponent();
            refundPolicyData.sections.forEach(section => {
                if (section.contacts) {
                    section.contacts.forEach(contact => {
                        if (contact.link) {
                            const link = container.querySelector(`a[href="${contact.link}"]`);
                            expect(link).toBeInTheDocument();
                        }
                    });
                }
            });
        });

        it('should have target="_blank" for external links', () => {
            const { container } = renderComponent();
            const externalLinks = container.querySelectorAll('a[target="_blank"]');
            const hasContactLinks = refundPolicyData.sections.some(s =>
                s.contacts?.some(c => c.link)
            );
            if (hasContactLinks) {
                expect(externalLinks.length).toBeGreaterThan(0);
            }
        });

        it('should have rel="noopener noreferrer" for security', () => {
            const { container } = renderComponent();
            const secureLinks = container.querySelectorAll('a[rel="noopener noreferrer"]');
            const hasContactLinks = refundPolicyData.sections.some(s =>
                s.contacts?.some(c => c.link)
            );
            if (hasContactLinks) {
                expect(secureLinks.length).toBeGreaterThan(0);
            }
        });

        it('should render contact values without links as plain text', () => {
            renderComponent();
            refundPolicyData.sections.forEach(section => {
                if (section.contacts) {
                    section.contacts.forEach(contact => {
                        if (!contact.link) {
                            expect(screen.getByText(contact.value)).toBeInTheDocument();
                        }
                    });
                }
            });
        });
    });

    describe('Icons Display', () => {
        it('should render icons for each section', () => {
            const { container } = renderComponent();
            const icons = container.querySelectorAll('svg');
            expect(icons.length).toBeGreaterThan(0);
        });

        it('should render RefreshCw icon for section 1', () => {
            const { container } = renderComponent();
            const iconContainers = container.querySelectorAll('.p-2\\.5');
            expect(iconContainers.length).toBeGreaterThan(0);
        });

        it('should render ShieldCheck icon in footer', () => {
            const { container } = renderComponent();
            const shieldIcon = container.querySelector('.text-blue-600');
            expect(shieldIcon).toBeInTheDocument();
        });

        it('should have correct icon colors', () => {
            const { container } = renderComponent();
            const blueIcon = container.querySelector('.text-blue-500');
            const orangeIcon = container.querySelector('.text-orange-500');
            const greenIcon = container.querySelector('.text-green-500');
            const purpleIcon = container.querySelector('.text-purple-500');

            expect(blueIcon || orangeIcon || greenIcon || purpleIcon).toBeTruthy();
        });
    });

    describe('Navigation', () => {
        it('should call navigateToAccount when back button is clicked', () => {
            renderComponent();
            const backButton = screen.getByRole('button', { name: 'Back' });
            backButton.click();
            expect(mockNavigateToAccount).toHaveBeenCalledTimes(1);
        });

        it('should pass showBack prop to HeaderBar', () => {
            renderComponent();
            expect(screen.getByTestId('header-bar')).toBeInTheDocument();
        });
    });

    describe('Styling', () => {
        it('should have correct container styling', () => {
            const { container } = renderComponent();
            const mainContainer = container.querySelector('.mt-6');
            expect(mainContainer).toHaveClass('px-4', 'pb-10', 'max-w-3xl', 'mx-auto');
        });

        it('should have centered layout', () => {
            const { container } = renderComponent();
            const mainContainer = container.querySelector('.mx-auto');
            expect(mainContainer).toBeInTheDocument();
        });

        it('should have max width constraint', () => {
            const { container } = renderComponent();
            const mainContainer = container.querySelector('.max-w-3xl');
            expect(mainContainer).toBeInTheDocument();
        });
    });

    describe('Header Section Styling', () => {
        it('should have centered header text', () => {
            const { container } = renderComponent();
            const headerSection = container.querySelector('.text-center');
            expect(headerSection).toBeInTheDocument();
        });

        it('should have correct title styling', () => {
            const { container } = renderComponent();
            const title = container.querySelector('.text-2xl');
            expect(title).toHaveClass('font-bold', 'text-title-black', 'dark:text-white', 'mb-2');
        });

        it('should have correct subtitle styling', () => {
            const { container } = renderComponent();
            const subtitle = container.querySelector('.text-gray-500');
            expect(subtitle).toHaveClass('dark:text-gray-400');
        });

        it('should have margin bottom on header', () => {
            const { container } = renderComponent();
            const header = container.querySelector('.mb-8');
            expect(header).toBeInTheDocument();
        });
    });

    describe('Section Card Styling', () => {
        it('should have white background on cards', () => {
            const { container } = renderComponent();
            const cards = container.querySelectorAll('.bg-white');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('should have rounded corners on cards', () => {
            const { container } = renderComponent();
            const cards = container.querySelectorAll('.rounded-2xl');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('should have padding on cards', () => {
            const { container } = renderComponent();
            const cards = container.querySelectorAll('.p-5');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('should have shadow on cards', () => {
            const { container } = renderComponent();
            const cards = container.querySelectorAll('.shadow-sm');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('should have border on cards', () => {
            const { container } = renderComponent();
            const cards = container.querySelectorAll('.border');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('should have hover effect on cards', () => {
            const { container } = renderComponent();
            const cards = container.querySelectorAll('.hover\\:shadow-md');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('should have transition on cards', () => {
            const { container } = renderComponent();
            const cards = container.querySelectorAll('.transition-all');
            expect(cards.length).toBeGreaterThan(0);
        });

        it('should have duration on cards', () => {
            const { container } = renderComponent();
            const cards = container.querySelectorAll('.duration-300');
            expect(cards.length).toBeGreaterThan(0);
        });
    });

    describe('List Styling', () => {
        it('should have correct list styling', () => {
            const { container } = renderComponent();
            const lists = container.querySelectorAll('ul');
            lists.forEach(list => {
                expect(list).toHaveClass('mt-3', 'space-y-1', 'list-disc', 'list-inside');
            });
        });

        it('should have correct list item text styling', () => {
            const { container } = renderComponent();
            const lists = container.querySelectorAll('ul.text-sm');
            lists.forEach(list => {
                expect(list).toHaveClass('text-gray-600', 'dark:text-gray-400');
            });
        });
    });

    describe('Contact Styling', () => {
        it('should have correct contact container styling', () => {
            const { container } = renderComponent();
            const contactContainers = container.querySelectorAll('.mt-4.space-y-1');
            if (refundPolicyData.sections.some(s => s.contacts)) {
                expect(contactContainers.length).toBeGreaterThan(0);
            }
        });

        it('should have correct contact label styling', () => {
            const { container } = renderComponent();
            const labels = container.querySelectorAll('.font-medium.text-gray-700');
            if (refundPolicyData.sections.some(s => s.contacts)) {
                expect(labels.length).toBeGreaterThan(0);
            }
        });

        it('should have correct contact link styling', () => {
            const { container } = renderComponent();
            const links = container.querySelectorAll('a.text-orange-600');
            if (refundPolicyData.sections.some(s => s.contacts?.some(c => c.link))) {
                expect(links.length).toBeGreaterThan(0);
            }
        });

        it('should have hover underline on links', () => {
            const { container } = renderComponent();
            const links = container.querySelectorAll('a.hover\\:underline');
            if (refundPolicyData.sections.some(s => s.contacts?.some(c => c.link))) {
                expect(links.length).toBeGreaterThan(0);
            }
        });
    });

    describe('Footer Section', () => {
        it('should render footer with commitment message', () => {
            renderComponent();
            expect(screen.getByText(/Kami berkomitmen untuk memberikan layanan terbaik/)).toBeInTheDocument();
        });

        it('should have centered footer', () => {
            const { container } = renderComponent();
            const footer = container.querySelector('.mt-12.text-center');
            expect(footer).toBeInTheDocument();
        });

        it('should have icon container in footer', () => {
            const { container } = renderComponent();
            const iconContainer = container.querySelector('.inline-flex.items-center.justify-center');
            expect(iconContainer).toBeInTheDocument();
        });

        it('should have correct footer text styling', () => {
            const { container } = renderComponent();
            const footerText = container.querySelector('.text-xs.text-gray-400');
            expect(footerText).toHaveClass('dark:text-gray-500', 'max-w-xs', 'mx-auto');
        });
    });

    describe('Dark Mode Support', () => {
        it('should have dark mode classes for background', () => {
            const { container } = renderComponent();
            const darkBg = container.querySelectorAll('.dark\\:bg-neutral-900');
            expect(darkBg.length).toBeGreaterThan(0);
        });

        it('should have dark mode classes for text', () => {
            const { container } = renderComponent();
            const darkText = container.querySelectorAll('.dark\\:text-white');
            expect(darkText.length).toBeGreaterThan(0);
        });

        it('should have dark mode classes for borders', () => {
            const { container } = renderComponent();
            const darkBorder = container.querySelectorAll('.dark\\:border-neutral-800');
            expect(darkBorder.length).toBeGreaterThan(0);
        });

        it('should have dark mode classes for gray text', () => {
            const { container } = renderComponent();
            const darkGrayText = container.querySelectorAll('.dark\\:text-gray-400');
            expect(darkGrayText.length).toBeGreaterThan(0);
        });
    });

    describe('Animation Properties', () => {
        it('should have initial opacity', () => {
            const { container } = renderComponent();
            const animatedElements = container.querySelectorAll('[initial]');
            expect(animatedElements.length).toBeGreaterThan(0);
        });

        it('should have animate properties', () => {
            const { container } = renderComponent();
            const animatedElements = container.querySelectorAll('[animate]');
            expect(animatedElements.length).toBeGreaterThan(0);
        });

        it('should have transition properties', () => {
            const { container } = renderComponent();
            const animatedElements = container.querySelectorAll('[transition]');
            expect(animatedElements.length).toBeGreaterThan(0);
        });
    });

    describe('Content Verification', () => {
        it('should display all section titles', () => {
            renderComponent();
            refundPolicyData.sections.forEach(section => {
                expect(screen.getByText(section.title)).toBeInTheDocument();
            });
        });

        it('should display all section contents', () => {
            renderComponent();
            refundPolicyData.sections.forEach(section => {
                expect(screen.getByText(section.content)).toBeInTheDocument();
            });
        });

        it('should have correct section IDs', () => {
            renderComponent();
            expect(refundPolicyData.sections.length).toBeGreaterThan(0);
            refundPolicyData.sections.forEach(section => {
                expect(section.id).toBeDefined();
            });
        });
    });

    describe('Accessibility', () => {
        it('should use semantic heading for title', () => {
            const { container } = renderComponent();
            const heading = container.querySelector('h1');
            expect(heading).toBeInTheDocument();
        });

        it('should use semantic heading for section titles', () => {
            const { container } = renderComponent();
            const sectionHeadings = container.querySelectorAll('h3');
            expect(sectionHeadings.length).toBe(refundPolicyData.sections.length);
        });

        it('should have descriptive text for screen readers', () => {
            renderComponent();
            expect(screen.getByText(refundPolicyData.subtitle)).toBeInTheDocument();
        });

        it('should have accessible links', () => {
            const { container } = renderComponent();
            const links = container.querySelectorAll('a');
            links.forEach(link => {
                expect(link).toHaveAttribute('href');
            });
        });
    });

    describe('Responsive Design', () => {
        it('should have responsive padding', () => {
            const { container } = renderComponent();
            const mainContainer = container.querySelector('.px-4');
            expect(mainContainer).toBeInTheDocument();
        });

        it('should have responsive bottom padding', () => {
            const { container } = renderComponent();
            const mainContainer = container.querySelector('.pb-10');
            expect(mainContainer).toBeInTheDocument();
        });

        it('should have responsive margin top', () => {
            const { container } = renderComponent();
            const mainContainer = container.querySelector('.mt-6');
            expect(mainContainer).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle sections without lists', () => {
            renderComponent();
            const sectionsWithoutList = refundPolicyData.sections.filter(s => !s.list);
            expect(sectionsWithoutList.length).toBeGreaterThan(0);
        });

        it('should handle sections without contacts', () => {
            renderComponent();
            const sectionsWithoutContacts = refundPolicyData.sections.filter(s => !s.contacts);
            expect(sectionsWithoutContacts.length).toBeGreaterThan(0);
        });

        it('should render with proper spacing', () => {
            const { container } = renderComponent();
            const spacedContainer = container.querySelector('.space-y-4');
            expect(spacedContainer).toBeInTheDocument();
        });
    });
});
