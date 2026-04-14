import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import UserInfoCard from '../pages/Components/UserInfoCard';
import { useAuth } from '@/features/auth/hooks/auth.hooks';
import './setup';

// Mock dependencies
vi.mock('@/features/auth/hooks/auth.hooks');
vi.mock('./UserInfo', () => ({
    default: () => createElement('div', { 'data-testid': 'user-info' }, 'User Info'),
}));

const mockUser = {
    id: 1,
    uuid: 'user-uuid-123',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '081234567890',
    avatar_url: 'http://localhost:8000/avatars/user.jpg',
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
        avatar: 'http://localhost:8000/avatars/profile.jpg',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
    },
};

describe('UserInfoCard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the component', () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            render(<UserInfoCard />);

            expect(screen.getByTestId('user-info')).toBeInTheDocument();
        });

        it('should render decorative background shapes', () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const bgImages = container.querySelectorAll('img[src*="beans-bg"]');
            expect(bgImages.length).toBe(2);
        });

        it('should render with correct styling classes', () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const header = container.querySelector('header');
            expect(header).toHaveClass('bg-linear-to-r', 'from-dark-yellow', 'to-primary-orange');
        });
    });

    describe('Avatar Display', () => {
        it('should display avatar image when avatar_url is available', () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const avatar = container.querySelector('img[alt="Profile"]');
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveAttribute('src', mockUser.avatar_url);
        });

        it('should display avatar from customer_profile when avatar_url is not available', () => {
            const userWithoutAvatarUrl = {
                ...mockUser,
                avatar_url: null,
            };
            vi.mocked(useAuth).mockReturnValue({ user: userWithoutAvatarUrl } as any);

            const { container } = render(<UserInfoCard />);

            const avatar = container.querySelector('img[alt="Profile"]');
            expect(avatar).toBeInTheDocument();
            expect(avatar).toHaveAttribute('src', mockUser.customer_profile.avatar);
        });

        it('should fix localhost URL without port', () => {
            const userWithBrokenUrl = {
                ...mockUser,
                avatar_url: 'http://localhost/avatars/user.jpg',
            };
            vi.mocked(useAuth).mockReturnValue({ user: userWithBrokenUrl } as any);

            const { container } = render(<UserInfoCard />);

            const avatar = container.querySelector('img[alt="Profile"]');
            expect(avatar).toHaveAttribute('src', 'http://localhost:8000/avatars/user.jpg');
        });

        it('should display User icon when no avatar URL is available', () => {
            const userWithoutAvatar = {
                ...mockUser,
                avatar_url: null,
                customer_profile: {
                    ...mockUser.customer_profile,
                    avatar: null,
                },
            };
            vi.mocked(useAuth).mockReturnValue({ user: userWithoutAvatar } as any);

            const { container } = render(<UserInfoCard />);

            const userIcon = container.querySelector('svg');
            expect(userIcon).toBeInTheDocument();
            expect(userIcon).toHaveClass('text-white');
        });

        it('should display User icon when user is null', () => {
            vi.mocked(useAuth).mockReturnValue({ user: null } as any);

            const { container } = render(<UserInfoCard />);

            const userIcon = container.querySelector('svg');
            expect(userIcon).toBeInTheDocument();
        });

        it('should handle image load error and show icon', async () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const avatar = container.querySelector('img[alt="Profile"]') as HTMLImageElement;
            expect(avatar).toBeInTheDocument();

            // Simulate image load error
            avatar.dispatchEvent(new Event('error'));

            await waitFor(() => {
                const userIcon = container.querySelector('svg');
                expect(userIcon).toBeInTheDocument();
            });
        });

        it('should log error when image fails to load', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const avatar = container.querySelector('img[alt="Profile"]') as HTMLImageElement;
            avatar.dispatchEvent(new Event('error'));

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    'Failed to load avatar:',
                    mockUser.avatar_url
                );
            });

            consoleErrorSpy.mockRestore();
        });

        it('should reset error state when image loads successfully', async () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const avatar = container.querySelector('img[alt="Profile"]') as HTMLImageElement;

            // Simulate error then success
            avatar.dispatchEvent(new Event('error'));
            await waitFor(() => {
                expect(container.querySelector('svg')).toBeInTheDocument();
            });

            avatar.dispatchEvent(new Event('load'));
            await waitFor(() => {
                expect(container.querySelector('img[alt="Profile"]')).toBeInTheDocument();
            });
        });
    });

    describe('Avatar Container Styling', () => {
        it('should have correct avatar container classes', () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const avatarContainer = container.querySelector('.size-24');
            expect(avatarContainer).toHaveClass(
                'rounded-full',
                'bg-white/20',
                'backdrop-blur-sm',
                'border-2',
                'border-white/40'
            );
        });

        it('should have overflow-hidden for image clipping', () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const avatarContainer = container.querySelector('.size-24');
            expect(avatarContainer).toHaveClass('overflow-hidden');
        });
    });

    describe('Layout', () => {
        it('should render UserInfo component', () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            render(<UserInfoCard />);

            expect(screen.getByTestId('user-info')).toBeInTheDocument();
        });

        it('should have flex layout with gap', () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const flexContainer = container.querySelector('.flex.flex-row.gap-3');
            expect(flexContainer).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle undefined user', () => {
            vi.mocked(useAuth).mockReturnValue({ user: undefined } as any);

            const { container } = render(<UserInfoCard />);

            const userIcon = container.querySelector('svg');
            expect(userIcon).toBeInTheDocument();
        });

        it('should handle empty avatar_url string', () => {
            const userWithEmptyAvatar = {
                ...mockUser,
                avatar_url: '',
            };
            vi.mocked(useAuth).mockReturnValue({ user: userWithEmptyAvatar } as any);

            const { container } = render(<UserInfoCard />);

            const userIcon = container.querySelector('svg');
            expect(userIcon).toBeInTheDocument();
        });

        it('should handle malformed avatar URL', () => {
            const userWithMalformedUrl = {
                ...mockUser,
                avatar_url: 'not-a-valid-url',
            };
            vi.mocked(useAuth).mockReturnValue({ user: userWithMalformedUrl } as any);

            const { container } = render(<UserInfoCard />);

            const avatar = container.querySelector('img[alt="Profile"]');
            expect(avatar).toHaveAttribute('src', 'not-a-valid-url');
        });

        it('should handle very long avatar URLs', () => {
            const longUrl = 'http://localhost:8000/' + 'a'.repeat(1000) + '.jpg';
            const userWithLongUrl = {
                ...mockUser,
                avatar_url: longUrl,
            };
            vi.mocked(useAuth).mockReturnValue({ user: userWithLongUrl } as any);

            const { container } = render(<UserInfoCard />);

            const avatar = container.querySelector('img[alt="Profile"]');
            expect(avatar).toHaveAttribute('src', longUrl);
        });

        it('should handle special characters in avatar URL', () => {
            const specialUrl = 'http://localhost:8000/avatars/user%20name.jpg';
            const userWithSpecialUrl = {
                ...mockUser,
                avatar_url: specialUrl,
            };
            vi.mocked(useAuth).mockReturnValue({ user: userWithSpecialUrl } as any);

            const { container } = render(<UserInfoCard />);

            const avatar = container.querySelector('img[alt="Profile"]');
            expect(avatar).toHaveAttribute('src', specialUrl);
        });
    });

    describe('Accessibility', () => {
        it('should have alt text for avatar image', () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const avatar = container.querySelector('img[alt="Profile"]');
            expect(avatar).toHaveAttribute('alt', 'Profile');
        });

        it('should have empty alt for decorative images', () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const decorativeImages = container.querySelectorAll('img[alt=""]');
            expect(decorativeImages.length).toBe(2);
        });

        it('should use lazy loading for decorative images', () => {
            vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);

            const { container } = render(<UserInfoCard />);

            const decorativeImages = container.querySelectorAll('img[loading="lazy"]');
            expect(decorativeImages.length).toBe(2);
        });
    });
});
