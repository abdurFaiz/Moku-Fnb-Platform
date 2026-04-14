import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FAQ from '../pages/legal/FAQ';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import { faqData } from '@/features/profile/constants/dataFAQConstant';
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
vi.mock('@/components/ui/accordion', () => ({
    Accordion: ({ children, ...props }: any) => <div data-testid="accordion" {...props}>{children}</div>,
    AccordionItem: ({ children, value }: any) => <div data-testid={`accordion-item-${value}`}>{children}</div>,
    AccordionTrigger: ({ children }: any) => <button data-testid="accordion-trigger">{children}</button>,
    AccordionContent: ({ children }: any) => <div data-testid="accordion-content">{children}</div>,
}));

const mockNavigateToAccount = vi.fn();

describe('FAQ', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useOutletNavigation).mockReturnValue({
            navigateToAccount: mockNavigateToAccount,
        } as any);
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <FAQ />
            </BrowserRouter>
        );
    };

    describe('Component Rendering', () => {
        it('should render the component', () => {
            renderComponent();
            expect(screen.getByTestId('screen-wrapper')).toBeInTheDocument();
        });

        it('should render header with FAQ title', () => {
            renderComponent();
            expect(screen.getByText('FAQ')).toBeInTheDocument();
        });

        it('should render main heading', () => {
            renderComponent();
            expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
        });

        it('should render description text', () => {
            renderComponent();
            expect(screen.getByText(/Temukan jawaban seputar cara kerja/)).toBeInTheDocument();
        });

        it('should render accordion component', () => {
            renderComponent();
            expect(screen.getByTestId('accordion')).toBeInTheDocument();
        });
    });

    describe('FAQ Data Display', () => {
        it('should render all FAQ items', () => {
            renderComponent();
            faqData.items.forEach(item => {
                expect(screen.getByText(item.question)).toBeInTheDocument();
            });
        });

        it('should render FAQ answers', () => {
            renderComponent();
            faqData.items.forEach(item => {
                expect(screen.getByText(item.answer)).toBeInTheDocument();
            });
        });

        it('should render accordion items with correct IDs', () => {
            renderComponent();
            faqData.items.forEach(item => {
                expect(screen.getByTestId(`accordion-item-${item.id}`)).toBeInTheDocument();
            });
        });

        it('should render accordion triggers for each item', () => {
            renderComponent();
            const triggers = screen.getAllByTestId('accordion-trigger');
            expect(triggers.length).toBe(faqData.items.length);
        });

        it('should render accordion content for each item', () => {
            renderComponent();
            const contents = screen.getAllByTestId('accordion-content');
            expect(contents.length).toBe(faqData.items.length);
        });
    });

    describe('Accordion Configuration', () => {
        it('should configure accordion as single type', () => {
            renderComponent();
            const accordion = screen.getByTestId('accordion');
            expect(accordion).toHaveAttribute('type', 'single');
        });

        it('should configure accordion as collapsible', () => {
            renderComponent();
            const accordion = screen.getByTestId('accordion');
            expect(accordion).toHaveAttribute('collapsible');
        });
    });

    describe('Navigation', () => {
        it('should call navigateToAccount when back button is clicked', () => {
            renderComponent();
            const backButton = screen.getByRole('button', { name: 'Back' });
            backButton.click();
            expect(mockNavigateToAccount).toHaveBeenCalledTimes(1);
        });

        it('should pass navigateToAccount to HeaderBar', () => {
            renderComponent();
            const backButton = screen.getByRole('button', { name: 'Back' });
            expect(backButton).toBeInTheDocument();
        });
    });

    describe('Styling', () => {
        it('should have correct container styling', () => {
            const { container } = renderComponent();
            const mainContainer = container.querySelector('.mt-6');
            expect(mainContainer).toHaveClass('flex', 'flex-col', 'gap-4', 'min-h-screen', 'px-4');
        });

        it('should have correct heading styling', () => {
            const { container } = renderComponent();
            const heading = container.querySelector('h1');
            expect(heading).toHaveClass('text-title-black', 'font-medium', 'text-lg', 'font-rubik');
        });

        it('should have correct description styling', () => {
            const { container } = renderComponent();
            const description = container.querySelector('p');
            expect(description).toHaveClass('text-base', 'text-body-grey');
        });

        it('should have gap between accordion items', () => {
            const { container } = renderComponent();
            const accordion = container.querySelector('[data-testid="accordion"]');
            expect(accordion).toHaveClass('flex', 'flex-col', 'gap-3');
        });
    });

    describe('Accordion Item Styling', () => {
        it('should have border styling on accordion items', () => {
            const { container } = renderComponent();
            const accordionItems = container.querySelectorAll('[data-testid^="accordion-item-"]');
            accordionItems.forEach(item => {
                expect(item).toHaveClass('border', 'border-border', 'rounded-xl');
            });
        });

        it('should have background color on accordion items', () => {
            const { container } = renderComponent();
            const accordionItems = container.querySelectorAll('[data-testid^="accordion-item-"]');
            accordionItems.forEach(item => {
                expect(item).toHaveClass('bg-white');
            });
        });

        it('should have shadow on accordion items', () => {
            const { container } = renderComponent();
            const accordionItems = container.querySelectorAll('[data-testid^="accordion-item-"]');
            accordionItems.forEach(item => {
                expect(item).toHaveClass('shadow-xs');
            });
        });

        it('should have transition classes', () => {
            const { container } = renderComponent();
            const accordionItems = container.querySelectorAll('[data-testid^="accordion-item-"]');
            accordionItems.forEach(item => {
                expect(item).toHaveClass('transition-shadow', 'hover:shadow-sm');
            });
        });

        it('should have duration and easing', () => {
            const { container } = renderComponent();
            const accordionItems = container.querySelectorAll('[data-testid^="accordion-item-"]');
            accordionItems.forEach(item => {
                expect(item).toHaveClass('duration-300', 'ease-in-out');
            });
        });
    });

    describe('Accordion Trigger Styling', () => {
        it('should have correct trigger styling', () => {
            const { container } = renderComponent();
            const triggers = container.querySelectorAll('[data-testid="accordion-trigger"]');
            triggers.forEach(trigger => {
                expect(trigger).toHaveClass('px-4', 'text-base', 'font-medium', 'text-title-black');
            });
        });

        it('should have active state styling', () => {
            const { container } = renderComponent();
            const triggers = container.querySelectorAll('[data-testid="accordion-trigger"]');
            triggers.forEach(trigger => {
                expect(trigger).toHaveClass('active:text-primary-orange');
            });
        });
    });

    describe('Accordion Content Styling', () => {
        it('should have correct content styling', () => {
            const { container } = renderComponent();
            const contents = container.querySelectorAll('[data-testid="accordion-content"]');
            contents.forEach(content => {
                expect(content).toHaveClass('px-4', 'text-sm', 'text-body', 'leading-relaxed', 'text-body-grey');
            });
        });
    });

    describe('Layout Structure', () => {
        it('should have header section', () => {
            renderComponent();
            expect(screen.getByTestId('header-bar')).toBeInTheDocument();
        });

        it('should have content section with heading and description', () => {
            const { container } = renderComponent();
            const contentSection = container.querySelector('.flex.flex-col.gap-1');
            expect(contentSection).toBeInTheDocument();
        });

        it('should have accordion section', () => {
            renderComponent();
            expect(screen.getByTestId('accordion')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty FAQ data gracefully', () => {
            vi.mock('@/features/profile/constants/dataFAQConstant', () => ({
                faqData: { items: [] },
            }));

            const { container } = renderComponent();
            expect(container).toBeInTheDocument();
        });

        it('should render with minimum height', () => {
            const { container } = renderComponent();
            const mainContainer = container.querySelector('.min-h-screen');
            expect(mainContainer).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should use semantic heading for title', () => {
            const { container } = renderComponent();
            const heading = container.querySelector('h1');
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('Frequently Asked Questions');
        });

        it('should have descriptive text for screen readers', () => {
            renderComponent();
            expect(screen.getByText(/Temukan jawaban seputar/)).toBeInTheDocument();
        });

        it('should have clickable accordion triggers', () => {
            renderComponent();
            const triggers = screen.getAllByTestId('accordion-trigger');
            triggers.forEach(trigger => {
                expect(trigger).toBeInTheDocument();
            });
        });
    });

    describe('Content Verification', () => {
        it('should display questions in triggers', () => {
            renderComponent();
            faqData.items.forEach(item => {
                const triggers = screen.getAllByTestId('accordion-trigger');
                const hasQuestion = triggers.some(trigger =>
                    trigger.textContent?.includes(item.question)
                );
                expect(hasQuestion).toBe(true);
            });
        });

        it('should display answers in content', () => {
            renderComponent();
            faqData.items.forEach(item => {
                const contents = screen.getAllByTestId('accordion-content');
                const hasAnswer = contents.some(content =>
                    content.textContent?.includes(item.answer)
                );
                expect(hasAnswer).toBe(true);
            });
        });
    });

    describe('Responsive Design', () => {
        it('should have responsive padding', () => {
            const { container } = renderComponent();
            const mainContainer = container.querySelector('.px-4');
            expect(mainContainer).toBeInTheDocument();
        });

        it('should have responsive margin top', () => {
            const { container } = renderComponent();
            const mainContainer = container.querySelector('.mt-6');
            expect(mainContainer).toBeInTheDocument();
        });
    });
});
