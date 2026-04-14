import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecomendationProductContainer from '../components/RecomendationProductContainer';

describe('RecomendationProductContainer', () => {
    it('should render children correctly', () => {
        render(
            <RecomendationProductContainer>
                <div>Child Component</div>
            </RecomendationProductContainer>
        );

        expect(screen.getByText('Child Component')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
        render(
            <RecomendationProductContainer>
                <div>Child 1</div>
                <div>Child 2</div>
            </RecomendationProductContainer>
        );

        expect(screen.getByText('Child 1')).toBeInTheDocument();
        expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
});
