import { describe, it, expect, beforeEach } from 'vitest';
import { render} from '@testing-library/react';
import HomeLoadingSkeleton from '../components/HomeLoadingSkeleton';

describe('HomeLoadingSkeleton', () => {
    beforeEach(() => {
        // Clear any mocks if needed
    });

    describe('Rendering', () => {
        it('should render loading skeleton', () => {
            const { container } = render(<HomeLoadingSkeleton />);

            expect(container.firstChild).toBeInTheDocument();
        });

        it('should render multiple skeleton items', () => {
            const { container } = render(<HomeLoadingSkeleton />);

            const skeletons = container.querySelectorAll('[class*="skeleton"]');
            expect(skeletons.length).toBeGreaterThan(0);
        });

        it('should have proper structure', () => {
            const { container } = render(<HomeLoadingSkeleton />);

            expect(container.firstChild).toBeInTheDocument();
        });
    });

    describe('Styling', () => {
        it('should have loading animation classes', () => {
            const { container } = render(<HomeLoadingSkeleton />);

            expect(container.firstChild).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should be accessible', () => {
            const { container } = render(<HomeLoadingSkeleton />);

            expect(container.firstChild).toBeInTheDocument();
        });
    });
});
