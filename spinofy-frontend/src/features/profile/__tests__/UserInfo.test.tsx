import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserInfo from '../pages/Components/UserInfo';
import { useAuth } from '@/features/auth/hooks/auth.hooks';
import './setup';

// Mock dependencies
vi.mock('@/features/auth/hooks/auth.hooks');

const mockUser = {
    id: 1,
    uuid: 'user-uuid-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '081234567890',
    avatar_url: null,
    short_name: 'JD',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    customer_profile: {
        id: 1,
        uuid: 'profile-uuid-123',
        job: 'Software Engineer',
        date_birth: '1990-01-01',
        gender: 1,
        user_id: 1,
        avatar: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
};

describe('UserInfo', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Component Rendering', () => {
        it('should render the component', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            const { container } = render(<UserInfo />);
            expect(container.firstChild).toBeInTheDocument();
        });

        it('should render with correct z-index', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            const { container } = render(<UserInfo />);
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper).toHaveClass('relative', 'z-10');
        });
    });

    describe('User Name Display', () => {
        it('should display user name from API', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(/Hi, John Doe 👋/)).toBeInTheDocument();
        });

        it('should display name from props when provided', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo name="Custom Name" />);

            expect(screen.getByText(/Hi, Custom Name 👋/)).toBeInTheDocument();
        });

        it('should prioritize props name over API name', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo name="Props Name" />);

            expect(screen.getByText(/Hi, Props Name 👋/)).toBeInTheDocument();
            expect(screen.queryByText(/Hi, John Doe 👋/)).not.toBeInTheDocument();
        });

        it('should display dash when no name is available', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, name: null },
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(/Hi, - 👋/)).toBeInTheDocument();
        });

        it('should display dash when user is null', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(/Hi, - 👋/)).toBeInTheDocument();
        });

        it('should display dash when user is undefined', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: undefined,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(/Hi, - 👋/)).toBeInTheDocument();
        });

        it('should display empty string name as dash', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, name: '' },
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(/Hi, - 👋/)).toBeInTheDocument();
        });

        it('should include waving hand emoji', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(/👋/)).toBeInTheDocument();
        });

        it('should truncate long names with line-clamp', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            const { container } = render(<UserInfo />);
            const nameElement = container.querySelector('h1');
            expect(nameElement).toHaveClass('line-clamp-1');
        });
    });

    describe('Email Display', () => {
        it('should display user email from API', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });

        it('should display dash when email is null', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, email: null },
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText('-')).toBeInTheDocument();
        });

        it('should display dash when email is empty string', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, email: '' },
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText('-')).toBeInTheDocument();
        });

        it('should display dash when user is null', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            const paragraphs = screen.getAllByText('-');
            expect(paragraphs.length).toBeGreaterThan(0);
        });
    });

    describe('Loading State', () => {
        it('should show loading skeleton when isLoadingProfile is true', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: true,
            } as any);

            const { container } = render(<UserInfo />);

            const skeleton = container.querySelector('.animate-pulse');
            expect(skeleton).toBeInTheDocument();
        });

        it('should show two skeleton elements when loading', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: true,
            } as any);

            const { container } = render(<UserInfo />);

            const skeletonElements = container.querySelectorAll('.bg-white\\/20');
            expect(skeletonElements.length).toBe(2);
        });

        it('should not show user data when loading', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: true,
            } as any);

            render(<UserInfo />);

            expect(screen.queryByText(/Hi, John Doe 👋/)).not.toBeInTheDocument();
            expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
        });

        it('should show user data when not loading', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(/Hi, John Doe 👋/)).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });

        it('should have correct skeleton styling', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: true,
            } as any);

            const { container } = render(<UserInfo />);

            const nameSkeleton = container.querySelector('.h-8');
            const emailSkeleton = container.querySelector('.h-6');

            expect(nameSkeleton).toHaveClass('bg-white/20', 'rounded', 'mb-2', 'w-48');
            expect(emailSkeleton).toHaveClass('bg-white/20', 'rounded', 'w-32');
        });
    });

    describe('Styling', () => {
        it('should have white text color for name', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            const { container } = render(<UserInfo />);
            const nameElement = container.querySelector('h1');
            expect(nameElement).toHaveClass('text-white', 'text-2xl', 'font-medium');
        });

        it('should have white text color for email', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            const { container } = render(<UserInfo />);
            const emailElement = container.querySelector('p');
            expect(emailElement).toHaveClass('text-white', 'text-base');
        });

        it('should have correct font sizes', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            const { container } = render(<UserInfo />);
            const nameElement = container.querySelector('h1');
            const emailElement = container.querySelector('p');

            expect(nameElement).toHaveClass('text-2xl');
            expect(emailElement).toHaveClass('text-base');
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long names', () => {
            const longName = 'A'.repeat(100);
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, name: longName },
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(new RegExp(`Hi, ${longName}`))).toBeInTheDocument();
        });

        it('should handle very long emails', () => {
            const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com';
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, email: longEmail },
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(longEmail)).toBeInTheDocument();
        });

        it('should handle special characters in name', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, name: "O'Brien & Co." },
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(/Hi, O'Brien & Co\./)).toBeInTheDocument();
        });

        it('should handle unicode characters in name', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, name: '张三 🎉' },
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(/Hi, 张三 🎉/)).toBeInTheDocument();
        });

        it('should handle invalid email formats', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, email: 'not-an-email' },
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText('not-an-email')).toBeInTheDocument();
        });

        it('should handle whitespace-only name', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, name: '   ' },
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText(/Hi,    👋/)).toBeInTheDocument();
        });

        it('should handle whitespace-only email', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, email: '   ' },
                isLoadingProfile: false,
            } as any);

            render(<UserInfo />);

            expect(screen.getByText('   ')).toBeInTheDocument();
        });
    });

    describe('Props Override', () => {
        it('should use props name even when empty string', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo name="" />);

            expect(screen.getByText(/Hi, - 👋/)).toBeInTheDocument();
        });

        it('should not affect email display with name prop', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo name="Custom Name" />);

            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });

        it('should handle undefined name prop', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            render(<UserInfo name={undefined} />);

            expect(screen.getByText(/Hi, John Doe 👋/)).toBeInTheDocument();
        });
    });

    describe('Accessibility', () => {
        it('should use semantic HTML heading for name', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            const { container } = render(<UserInfo />);
            const heading = container.querySelector('h1');
            expect(heading).toBeInTheDocument();
        });

        it('should use paragraph for email', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isLoadingProfile: false,
            } as any);

            const { container } = render(<UserInfo />);
            const paragraph = container.querySelector('p');
            expect(paragraph).toBeInTheDocument();
        });
    });
});
