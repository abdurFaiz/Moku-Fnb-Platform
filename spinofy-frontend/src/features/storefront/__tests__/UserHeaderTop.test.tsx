import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserHeaderTop } from '../components/headerprofileuser/UserHeaderTop';

describe('UserHeaderTop', () => {
    const defaultProps = {
        name: 'Test User',
        vouchers: 5,
        points: 100,
    };

    describe('Rendering', () => {
        it('should render user name correctly', () => {
            render(<UserHeaderTop {...defaultProps} />);
            expect(screen.getByText('Hi, Test User 👋')).toBeInTheDocument();
        });

        it('should render vouchers count', () => {
            render(<UserHeaderTop {...defaultProps} />);
            // Assuming UserStatItem renders the value
            expect(screen.getByText('5')).toBeInTheDocument();
        });

        it('should render points count', () => {
            render(<UserHeaderTop {...defaultProps} />);
            expect(screen.getByText('100')).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle long names', () => {
            const longName = 'A'.repeat(50);
            render(<UserHeaderTop {...defaultProps} name={longName} />);
            expect(screen.getByText(`Hi, ${longName} 👋`)).toBeInTheDocument();
        });

        it('should handle zero values for stats', () => {
            render(<UserHeaderTop {...defaultProps} vouchers={0} points={0} />);
            const zeros = screen.getAllByText('0');
            expect(zeros.length).toBeGreaterThanOrEqual(2);
        });
    });
});
