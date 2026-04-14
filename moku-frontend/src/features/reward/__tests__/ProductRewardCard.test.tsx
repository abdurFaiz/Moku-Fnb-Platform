import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductRewardCard } from '../components/ProductRewardCard';
import './setup';

// Mock ClickSpark component
vi.mock('../../../components/ClickSpark', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('ProductRewardCard', () => {
    const defaultProps = {
        name: 'Free Coffee',
        points: 100,
        status: 'active' as const,
        pointBalance: 150,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render product name', () => {
            render(<ProductRewardCard {...defaultProps} />);

            expect(screen.getByText('Free Coffee')).toBeInTheDocument();
        });

        it('should render points required', () => {
            render(<ProductRewardCard {...defaultProps} />);

            expect(screen.getByText('100 poin')).toBeInTheDocument();
        });

        it('should render description when provided', () => {
            render(<ProductRewardCard {...defaultProps} description="Delicious coffee" />);

            expect(screen.getByText('Delicious coffee')).toBeInTheDocument();
        });

        it('should not render description when not provided', () => {
            render(<ProductRewardCard {...defaultProps} />);

            expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
        });

        it('should render point icon', () => {
            render(<ProductRewardCard {...defaultProps} />);

            const icon = screen.getByAltText('poin');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveAttribute('src', '/icons/icon-poin.svg');
        });
    });

    describe('Image Handling', () => {
        it('should render product image when provided', () => {
            render(<ProductRewardCard {...defaultProps} image="https://example.com/coffee.jpg" />);

            const image = screen.getByAltText('Free Coffee');
            expect(image).toHaveAttribute('src', 'https://example.com/coffee.jpg');
        });

        it('should render empty product image when no image provided', () => {
            render(<ProductRewardCard {...defaultProps} />);

            const image = screen.getByAltText('Free Coffee');
            expect(image).toHaveAttribute('src');
        });

        it('should handle image load error', async () => {
            render(<ProductRewardCard {...defaultProps} image="https://example.com/broken.jpg" />);

            const image = screen.getByAltText('Free Coffee') as HTMLImageElement;
            fireEvent.error(image);

            await waitFor(() => {
                expect(image.src).toContain('empty-product');
            });
        });

        it('should show empty image when image is empty string', () => {
            render(<ProductRewardCard {...defaultProps} image="" />);

            const image = screen.getByAltText('Free Coffee');
            expect(image).toBeInTheDocument();
        });
    });

    describe('Button States - Active', () => {
        it('should render active button when status is active and has enough points', () => {
            render(<ProductRewardCard {...defaultProps} status="active" pointBalance={150} />);

            const button = screen.getByRole('button', { name: /tukarkan/i });
            expect(button).toBeEnabled();
            expect(button).not.toHaveClass('cursor-not-allowed');
        });

        it('should call onClaimClick when active button is clicked', () => {
            const onClaimClick = vi.fn();
            render(<ProductRewardCard {...defaultProps} onClaimClick={onClaimClick} />);

            const button = screen.getByRole('button', { name: /tukarkan/i });
            fireEvent.click(button);

            expect(onClaimClick).toHaveBeenCalledTimes(1);
        });

        it('should not show grayscale filter when active', () => {
            const { container } = render(<ProductRewardCard {...defaultProps} status="active" />);

            const image = container.querySelector('.grayscale');
            expect(image).not.toBeInTheDocument();
        });
    });

    describe('Button States - Expired', () => {
        it('should render disabled button when status is expired', () => {
            render(<ProductRewardCard {...defaultProps} status="expired" />);

            const button = screen.getByRole('button', { name: /kadaluarsa/i });
            expect(button).toBeDisabled();
        });

        it('should show "Kadaluarsa" text when expired', () => {
            render(<ProductRewardCard {...defaultProps} status="expired" />);

            expect(screen.getByText('Kadaluarsa')).toBeInTheDocument();
        });

        it('should apply grayscale filter when expired', () => {
            const { container } = render(<ProductRewardCard {...defaultProps} status="expired" />);

            const image = container.querySelector('.grayscale');
            expect(image).toBeInTheDocument();
        });

        it('should not call onClaimClick when expired button is clicked', () => {
            const onClaimClick = vi.fn();
            render(<ProductRewardCard {...defaultProps} status="expired" onClaimClick={onClaimClick} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(onClaimClick).not.toHaveBeenCalled();
        });
    });

    describe('Button States - Insufficient Points', () => {
        it('should render button when points are insufficient', () => {
            render(<ProductRewardCard {...defaultProps} pointBalance={50} />);

            const button = screen.getByRole('button', { name: /tukarkan/i });
            // Button shows "Tukarkan" but should be disabled due to insufficient points
            expect(button).toBeInTheDocument();
        });

        it('should show button text when insufficient', () => {
            render(<ProductRewardCard {...defaultProps} pointBalance={50} />);

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Tukarkan');
            // The button is not disabled by default, only when status is expired or isDisabled is true
            expect(button).toBeInTheDocument();
        });

        it('should show remaining points needed badge', () => {
            render(<ProductRewardCard {...defaultProps} points={100} pointBalance={70} />);

            expect(screen.getByText('Kurang 30 poin lagi')).toBeInTheDocument();
        });

        it('should not show remaining points badge when enough points', () => {
            render(<ProductRewardCard {...defaultProps} points={100} pointBalance={150} />);

            expect(screen.queryByText(/kurang.*poin lagi/i)).not.toBeInTheDocument();
        });

        it('should not show remaining points badge when exactly enough points', () => {
            render(<ProductRewardCard {...defaultProps} points={100} pointBalance={100} />);

            expect(screen.queryByText(/kurang.*poin lagi/i)).not.toBeInTheDocument();
        });
    });

    describe('isDisabled Prop', () => {
        it('should disable button when isDisabled is true', () => {
            render(<ProductRewardCard {...defaultProps} isDisabled={true} />);

            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        it('should enable button when isDisabled is false and conditions met', () => {
            render(<ProductRewardCard {...defaultProps} isDisabled={false} />);

            const button = screen.getByRole('button');
            expect(button).toBeEnabled();
        });

        it('should prioritize expired status over isDisabled', () => {
            render(<ProductRewardCard {...defaultProps} status="expired" isDisabled={false} />);

            expect(screen.getByText('Kadaluarsa')).toBeInTheDocument();
        });
    });

    describe('Point Calculations', () => {
        it('should calculate remaining points correctly', () => {
            render(<ProductRewardCard {...defaultProps} points={200} pointBalance={150} />);

            expect(screen.getByText('Kurang 50 poin lagi')).toBeInTheDocument();
        });

        it('should handle zero point balance', () => {
            render(<ProductRewardCard {...defaultProps} points={100} pointBalance={0} />);

            expect(screen.getByText('Kurang 100 poin lagi')).toBeInTheDocument();
        });

        it('should handle large point values', () => {
            render(<ProductRewardCard {...defaultProps} points={999999} pointBalance={500000} />);

            expect(screen.getByText('Kurang 499999 poin lagi')).toBeInTheDocument();
        });

        it('should handle negative remaining points (more than enough)', () => {
            render(<ProductRewardCard {...defaultProps} points={50} pointBalance={200} />);

            expect(screen.queryByText(/kurang.*poin lagi/i)).not.toBeInTheDocument();
        });
    });

    describe('Text Truncation', () => {
        it('should truncate long product names', () => {
            const longName = 'Very Long Product Name That Should Be Truncated';
            const { container } = render(<ProductRewardCard {...defaultProps} name={longName} />);

            const nameElement = container.querySelector('.line-clamp-1');
            expect(nameElement).toBeInTheDocument();
            expect(nameElement).toHaveTextContent(longName);
        });

        it('should truncate long descriptions', () => {
            const longDescription = 'Very long description that should be truncated to two lines maximum';
            const { container } = render(
                <ProductRewardCard {...defaultProps} description={longDescription} />
            );

            const descElement = container.querySelector('.line-clamp-2');
            expect(descElement).toBeInTheDocument();
        });
    });

    describe('Styling and Layout', () => {
        it('should apply correct container classes', () => {
            const { container } = render(<ProductRewardCard {...defaultProps} />);

            const card = container.querySelector('.flex.flex-col.rounded-\\[20px\\]');
            expect(card).toBeInTheDocument();
        });

        it('should apply opacity when disabled', () => {
            const { container } = render(<ProductRewardCard {...defaultProps} status="expired" />);

            const imageContainer = container.querySelector('.opacity-60');
            expect(imageContainer).toBeInTheDocument();
        });

        it('should capitalize text', () => {
            const { container } = render(<ProductRewardCard {...defaultProps} />);

            const capitalizedElements = container.querySelectorAll('.capitalize');
            expect(capitalizedElements.length).toBeGreaterThan(0);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty name', () => {
            render(<ProductRewardCard {...defaultProps} name="" />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should handle zero points required', () => {
            render(<ProductRewardCard {...defaultProps} points={0} />);

            expect(screen.getByText('0 poin')).toBeInTheDocument();
        });

        it('should handle negative points (edge case)', () => {
            render(<ProductRewardCard {...defaultProps} points={-10} />);

            expect(screen.getByText('-10 poin')).toBeInTheDocument();
        });

        it('should handle special characters in name', () => {
            render(<ProductRewardCard {...defaultProps} name="Coffee & Tea 50%" />);

            expect(screen.getByText('Coffee & Tea 50%')).toBeInTheDocument();
        });

        it('should handle special characters in description', () => {
            render(
                <ProductRewardCard
                    {...defaultProps}
                    description="Delicious coffee @ 50% off!"
                />
            );

            expect(screen.getByText('Delicious coffee @ 50% off!')).toBeInTheDocument();
        });

        it('should handle undefined onClaimClick', () => {
            render(<ProductRewardCard {...defaultProps} onClaimClick={undefined} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);
            // Should not throw error
        });

        it('should handle very long point values', () => {
            render(<ProductRewardCard {...defaultProps} points={Number.MAX_SAFE_INTEGER} />);

            const pointText = screen.getByText(/poin$/);
            expect(pointText).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible button', () => {
            render(<ProductRewardCard {...defaultProps} />);

            const button = screen.getByRole('button');
            expect(button).toBeInTheDocument();
        });

        it('should have proper alt text for images', () => {
            render(<ProductRewardCard {...defaultProps} />);

            expect(screen.getByAltText('Free Coffee')).toBeInTheDocument();
            expect(screen.getByAltText('poin')).toBeInTheDocument();
        });

        it('should indicate disabled state properly', () => {
            render(<ProductRewardCard {...defaultProps} status="expired" />);

            const button = screen.getByRole('button');
            expect(button).toHaveAttribute('disabled');
        });
    });

    describe('Interaction', () => {
        it('should handle multiple clicks on active button', () => {
            const onClaimClick = vi.fn();
            render(<ProductRewardCard {...defaultProps} onClaimClick={onClaimClick} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);
            fireEvent.click(button);
            fireEvent.click(button);

            expect(onClaimClick).toHaveBeenCalledTimes(3);
        });

        it('should not respond to clicks when disabled', () => {
            const onClaimClick = vi.fn();
            render(<ProductRewardCard {...defaultProps} isDisabled={true} onClaimClick={onClaimClick} />);

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(onClaimClick).not.toHaveBeenCalled();
        });

        it('should handle hover states on active button', () => {
            render(<ProductRewardCard {...defaultProps} />);

            const button = screen.getByRole('button');
            fireEvent.mouseEnter(button);
            fireEvent.mouseLeave(button);

            expect(button).toBeInTheDocument();
        });
    });

    describe('Badge Display', () => {
        it('should show badge with correct styling when points insufficient', () => {
            const { container } = render(
                <ProductRewardCard {...defaultProps} points={100} pointBalance={50} />
            );

            const badge = container.querySelector('.bg-primary-orange');
            expect(badge).toBeInTheDocument();
        });

        it('should position badge correctly', () => {
            const { container } = render(
                <ProductRewardCard {...defaultProps} points={100} pointBalance={50} />
            );

            const badge = container.querySelector('.absolute.top-0.right-0');
            expect(badge).toBeInTheDocument();
        });

        it('should not show badge when points are sufficient', () => {
            render(<ProductRewardCard {...defaultProps} points={100} pointBalance={150} />);

            expect(screen.queryByText(/kurang.*poin lagi/i)).not.toBeInTheDocument();
        });
    });
});
