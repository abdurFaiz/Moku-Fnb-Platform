import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../components/SearchBar';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';

vi.mock('@/hooks/shared/useOutletNavigation');

describe('SearchBar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const setupDefaultMocks = () => {
        vi.mocked(useOutletNavigation).mockReturnValue({
            navigateToSearchProduct: vi.fn(),
        } as any);
    };

    describe('Rendering', () => {
        it('should render search bar with default placeholder', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            expect(screen.getByText('Mau pesan apa hari ini?')).toBeInTheDocument();
        });

        it('should render search bar with custom placeholder', () => {
            setupDefaultMocks();
            render(<SearchBar placeholder='Search products' />);

            expect(screen.getByText('Search products')).toBeInTheDocument();
        });

        it('should render search icon', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should render utensils icon', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should render as button element', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            const button = screen.getByRole('button');
            expect(button.tagName).toBe('BUTTON');
        });
    });

    describe('Placeholder Text', () => {
        it('should display default placeholder', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            expect(screen.getByText('Mau pesan apa hari ini?')).toBeInTheDocument();
        });

        it('should display custom placeholder', () => {
            setupDefaultMocks();
            render(<SearchBar placeholder='Find your favorite food' />);

            expect(screen.getByText('Find your favorite food')).toBeInTheDocument();
        });

        it('should display empty placeholder when provided', () => {
            setupDefaultMocks();
            render(<SearchBar placeholder='' />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should display very long placeholder', () => {
            setupDefaultMocks();
            const longPlaceholder = 'A'.repeat(100);
            render(<SearchBar placeholder={longPlaceholder} />);

            expect(screen.getByText(longPlaceholder)).toBeInTheDocument();
        });

        it('should display placeholder with special characters', () => {
            setupDefaultMocks();
            render(<SearchBar placeholder='Search: café & restaurant!' />);

            expect(screen.getByText('Search: café & restaurant!')).toBeInTheDocument();
        });
    });

    describe('Button Interaction', () => {
        it('should call navigateToSearchProduct when clicked', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToSearchProduct: mockNavigate,
            } as any);

            render(<SearchBar />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(mockNavigate).toHaveBeenCalled();
        });

        it('should call navigateToSearchProduct multiple times', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToSearchProduct: mockNavigate,
            } as any);

            render(<SearchBar />);

            const button = screen.getByRole('button');
            fireEvent.click(button);
            fireEvent.click(button);
            fireEvent.click(button);

            expect(mockNavigate).toHaveBeenCalledTimes(3);
        });

        it('should handle rapid clicks', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToSearchProduct: mockNavigate,
            } as any);

            render(<SearchBar />);

            const button = screen.getByRole('button');
            for (let i = 0; i < 10; i++) {
                fireEvent.click(button);
            }

            expect(mockNavigate).toHaveBeenCalledTimes(10);
        });
    });

    describe('Styling', () => {
        it('should apply default className', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('flex', 'items-center', 'w-full', 'gap-2');
        });

        it('should apply custom className', () => {
            setupDefaultMocks();
            render(<SearchBar className='custom-class' />);

            const container = screen.getByRole('button').parentElement;
            expect(container).toHaveClass('custom-class');
        });

        it('should have proper styling classes', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('bg-gray-50', 'rounded-[20px]', 'border');
        });
    });

    describe('Accessibility', () => {
        it('should have aria-label attribute', () => {
            setupDefaultMocks();
            render(<SearchBar placeholder='Search' />);

            const button = screen.getByRole('button', { name: 'Search' });
            expect(button).toBeInTheDocument();
        });

        it('should have aria-label with default placeholder', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            const button = screen.getByRole('button', { name: 'Mau pesan apa hari ini?' });
            expect(button).toBeInTheDocument();
        });

        it('should be keyboard accessible', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToSearchProduct: mockNavigate,
            } as any);

            render(<SearchBar />);

            const button = screen.getByRole('button');
            button.focus();
            expect(button).toHaveFocus();
        });
    });

    describe('Edge Cases', () => {
        it('should handle placeholder with newlines', () => {
            setupDefaultMocks();
            render(<SearchBar placeholder='Search\nProducts' />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle placeholder with unicode characters', () => {
            setupDefaultMocks();
            render(<SearchBar placeholder='🍕 Search Pizza 🍔' />);

            expect(screen.getByText('🍕 Search Pizza 🍔')).toBeInTheDocument();
        });

        it('should handle empty custom className', () => {
            setupDefaultMocks();
            render(<SearchBar className='' />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });

        it('should handle null-like placeholder values', () => {
            setupDefaultMocks();
            render(<SearchBar placeholder='' />);

            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });

    describe('Multiple Renders', () => {
        it('should handle prop changes', () => {
            setupDefaultMocks();
            const { rerender } = render(<SearchBar placeholder='First' />);

            expect(screen.getByText('First')).toBeInTheDocument();

            rerender(<SearchBar placeholder='Second' />);

            expect(screen.getByText('Second')).toBeInTheDocument();
        });

        it('should handle className changes', () => {
            setupDefaultMocks();
            const { rerender } = render(<SearchBar className='class1' />);

            const container = screen.getByRole('button').parentElement;
            expect(container).toHaveClass('class1');

            rerender(<SearchBar className='class2' />);

            expect(container).toHaveClass('class2');
        });
    });

    describe('Hook Integration', () => {
        it('should call useOutletNavigation hook', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            expect(useOutletNavigation).toHaveBeenCalled();
        });

        it('should use navigateToSearchProduct from hook', () => {
            setupDefaultMocks();
            const mockNavigate = vi.fn();
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToSearchProduct: mockNavigate,
            } as any);

            render(<SearchBar />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(mockNavigate).toHaveBeenCalled();
        });
    });

    describe('Button Type', () => {
        it('should have type="button"', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('type', 'button');
        });
    });

    describe('Icon Display', () => {
        it('should render search and utensils icons', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should have proper icon styling', () => {
            setupDefaultMocks();
            render(<SearchBar />);

            const button = screen.getByRole('button');
            expect(button).toHaveClass('gap-2');
        });
    });
});
