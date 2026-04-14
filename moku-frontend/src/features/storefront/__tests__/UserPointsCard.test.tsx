import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserPointsCard } from '../components/headerprofileuser/UserPointsCard';

vi.mock('@/hooks/shared/useOutletNavigation', () => ({
    useOutletNavigation: () => ({
        navigateToRewardPoin: vi.fn(),
    }),
}));

describe('UserPointsCard', () => {
    const defaultProps = {
        name: 'John Doe',
        points: 1000,
        vouchers: 5,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render points card', () => {
            render(<UserPointsCard {...defaultProps} />);

            expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
        });

        it('should display points', () => {
            render(<UserPointsCard {...defaultProps} />);

            expect(screen.getByText('1000 Points')).toBeInTheDocument();
        });

        it('should display vouchers', () => {
            render(<UserPointsCard {...defaultProps} />);

            expect(screen.getByText('5 Vouchers')).toBeInTheDocument();
        });
    });

    describe('Points Display', () => {
        it('should display zero points', () => {
            render(<UserPointsCard {...defaultProps} points={0} />);

            expect(screen.getByText('0 Points')).toBeInTheDocument();
        });

        it('should display large points', () => {
            render(<UserPointsCard {...defaultProps} points={999999} />);

            expect(screen.getByText('999999 Points')).toBeInTheDocument();
        });

        it('should display formatted points', () => {
            render(<UserPointsCard {...defaultProps} points={1000000} />);

            expect(screen.getByText('1000000 Points')).toBeInTheDocument();
        });
    });

    describe('Vouchers Display', () => {
        it('should display zero vouchers', () => {
            render(<UserPointsCard {...defaultProps} vouchers={0} />);

            expect(screen.getByText('0 Vouchers')).toBeInTheDocument();
        });

        it('should display many vouchers', () => {
            render(<UserPointsCard {...defaultProps} vouchers={100} />);

            expect(screen.getByText('100 Vouchers')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle negative points', () => {
            render(<UserPointsCard {...defaultProps} points={-100} />);

            expect(screen.getByText('-100 Points')).toBeInTheDocument();
        });

        it('should handle negative vouchers', () => {
            render(<UserPointsCard {...defaultProps} vouchers={-5} />);

            expect(screen.getByText('-5 Vouchers')).toBeInTheDocument();
        });

        it('should handle very large numbers', () => {
            render(<UserPointsCard {...defaultProps} points={999999999} vouchers={999999} />);

            expect(screen.getByText('999999999 Points')).toBeInTheDocument();
            expect(screen.getByText('999999 Vouchers')).toBeInTheDocument();
        });
    });

    describe('Multiple Renders', () => {
        it('should handle points changes', () => {
            const { rerender } = render(<UserPointsCard {...defaultProps} points={1000} />);

            expect(screen.getByText('1000 Points')).toBeInTheDocument();

            rerender(<UserPointsCard {...defaultProps} points={2000} />);

            expect(screen.getByText('2000 Points')).toBeInTheDocument();
        });

        it('should handle vouchers changes', () => {
            const { rerender } = render(<UserPointsCard {...defaultProps} vouchers={5} />);

            expect(screen.getByText('5 Vouchers')).toBeInTheDocument();

            rerender(<UserPointsCard {...defaultProps} vouchers={10} />);

            expect(screen.getByText('10 Vouchers')).toBeInTheDocument();
        });
    });
});
