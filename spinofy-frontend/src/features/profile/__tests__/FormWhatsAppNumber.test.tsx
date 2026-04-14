import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FormWhatsAppNumber from '../pages/Form/FormWhatsAppNumber';
import { useAuth } from '@/features/auth/hooks/auth.hooks';
import { useUpdateProfile } from '@/features/profile/services';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import './setup';

// Mock dependencies
vi.mock('@/features/auth/hooks/auth.hooks');
vi.mock('@/features/profile/services');
vi.mock('@/hooks/shared/useOutletNavigation');
vi.mock('@/components/HeaderBar', () => ({
    default: ({ title, onBack }: any) => (
        <div data-testid="header-bar">
            <span>{title}</span>
            <button onClick={onBack}>Back</button>
        </div>
    ),
}));
vi.mock('@/components/layout/ScreenWrapper', () => ({
    ScreenWrapper: ({ children }: any) => <div data-testid="screen-wrapper">{children}</div>,
}));

const mockNavigate = vi.fn();
const mockNavigateToAccount = vi.fn();
const mockMutate = vi.fn();

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

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('FormWhatsAppNumber', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
        vi.mocked(useOutletNavigation).mockReturnValue({
            navigateToAccount: mockNavigateToAccount,
            outletSlug: 'test-outlet',
        } as any);
        vi.mocked(useUpdateProfile).mockReturnValue({
            mutate: mockMutate,
            isPending: false,
        } as any);
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter>
                <FormWhatsAppNumber />
            </BrowserRouter>
        );
    };

    describe('Component Rendering', () => {
        it('should render the component successfully', () => {
            renderComponent();

            expect(screen.getByTestId('screen-wrapper')).toBeInTheDocument();
            expect(screen.getByTestId('header-bar')).toBeInTheDocument();
        });

        it('should render header with correct title', () => {
            renderComponent();

            expect(screen.getByText('Nomor WhatsApp')).toBeInTheDocument();
        });

        it('should render current phone number section', () => {
            renderComponent();

            expect(screen.getByText('Nomor WhatsApp Anda Saat Ini')).toBeInTheDocument();
        });

        it('should render new phone number section', () => {
            renderComponent();

            expect(screen.getByText(/Nomor WhatsApp Baru/)).toBeInTheDocument();
        });

        it('should render phone input field', () => {
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            expect(input).toBeInTheDocument();
            expect(input).toHaveAttribute('type', 'tel');
        });

        it('should render submit button', () => {
            renderComponent();

            expect(screen.getByRole('button', { name: 'Simpan Perubahan' })).toBeInTheDocument();
        });

        it('should render required field indicator', () => {
            renderComponent();

            const requiredIndicator = screen.getByText('*');
            expect(requiredIndicator).toHaveClass('text-dark-red');
        });
    });

    describe('Phone Number Display', () => {
        it('should display formatted current phone number', () => {
            renderComponent();

            expect(screen.getByText('+62 812-3456-7890')).toBeInTheDocument();
        });

        it('should format phone number starting with 62', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, phone: '6281234567890' },
            } as any);

            renderComponent();

            expect(screen.getByText('+62 812-3456-7890')).toBeInTheDocument();
        });

        it('should handle phone number without full formatting', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, phone: '62812' },
            } as any);

            renderComponent();

            expect(screen.getByText('+62 812')).toBeInTheDocument();
        });

        it('should display dash when phone is null', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, phone: null },
            } as any);

            renderComponent();

            expect(screen.getByText('-')).toBeInTheDocument();
        });

        it('should display dash when phone is empty string', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, phone: '' },
            } as any);

            renderComponent();

            expect(screen.getByText('-')).toBeInTheDocument();
        });

        it('should display phone as-is if not starting with 62', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, phone: '081234567890' },
            } as any);

            renderComponent();

            expect(screen.getByText('081234567890')).toBeInTheDocument();
        });

        it('should display "Loading..." when user is null', () => {
            vi.mocked(useAuth).mockReturnValue({ user: null } as any);

            renderComponent();

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });

        it('should display "Loading..." when user is undefined', () => {
            vi.mocked(useAuth).mockReturnValue({ user: undefined } as any);

            renderComponent();

            expect(screen.getByText('Loading...')).toBeInTheDocument();
        });
    });

    describe('Form Validation', () => {
        it('should accept valid phone number', async () => {
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            fireEvent.change(input, { target: { value: '081234567890' } });

            expect(input).toHaveValue('081234567890');
        });

        it('should show validation error for invalid phone number', async () => {
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.queryByText(/phone/i)).toBeInTheDocument();
            });
        });

        it('should clear validation error when valid input is provided', async () => {
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '123' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.queryByText(/phone/i)).toBeInTheDocument();
            });

            fireEvent.change(input, { target: { value: '' } });
            fireEvent.change(input, { target: { value: '081234567890' } });

            await waitFor(() => {
                expect(screen.queryByText(/phone/i)).not.toBeInTheDocument();
            });
        });
    });

    describe('Form Submission', () => {
        it('should submit form with valid data', async () => {
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '081234567890' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'John Doe',
                        phone: '081234567890',
                        date_birth: '1990-01-01',
                        gender: 'male',
                        job: 'Software Engineer',
                    }),
                    expect.any(Object)
                );
            });
        });

        it('should not submit when user data is not available', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            vi.mocked(useAuth).mockReturnValue({ user: null } as any);

            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '081234567890' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('User data not available');
                expect(mockMutate).not.toHaveBeenCalled();
            });

            consoleErrorSpy.mockRestore();
        });

        it('should not submit when customer_profile is missing', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, customer_profile: null },
            } as any);

            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '081234567890' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('User data not available');
                expect(mockMutate).not.toHaveBeenCalled();
            });

            consoleErrorSpy.mockRestore();
        });

        it('should handle empty date_birth', async () => {
            vi.mocked(useAuth).mockReturnValue({
                user: {
                    ...mockUser,
                    customer_profile: { ...mockUser.customer_profile, date_birth: null },
                },
            } as any);

            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '081234567890' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        date_birth: '',
                    }),
                    expect.any(Object)
                );
            });
        });

        it('should handle empty job', async () => {
            vi.mocked(useAuth).mockReturnValue({
                user: {
                    ...mockUser,
                    customer_profile: { ...mockUser.customer_profile, job: null },
                },
            } as any);

            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '081234567890' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        job: '',
                    }),
                    expect.any(Object)
                );
            });
        });

        it('should handle null gender', async () => {
            vi.mocked(useAuth).mockReturnValue({
                user: {
                    ...mockUser,
                    customer_profile: { ...mockUser.customer_profile, gender: null },
                },
            } as any);

            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '081234567890' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalled();
            });
        });
    });

    describe('Success Handling', () => {
        it('should navigate to account page on success', async () => {
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '081234567890' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalled();
            });

            // Simulate success callback
            const mutateCall = mockMutate.mock.calls[0];
            const callbacks = mutateCall[1];
            callbacks.onSuccess();

            expect(mockNavigate).toHaveBeenCalledWith('/test-outlet/account', { replace: true });
        });

        it('should use correct outlet slug in navigation', async () => {
            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToAccount: mockNavigateToAccount,
                outletSlug: 'custom-outlet',
            } as any);

            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '081234567890' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalled();
            });

            const mutateCall = mockMutate.mock.calls[0];
            const callbacks = mutateCall[1];
            callbacks.onSuccess();

            expect(mockNavigate).toHaveBeenCalledWith('/custom-outlet/account', { replace: true });
        });
    });

    describe('Error Handling', () => {
        it('should log error on submission failure', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '081234567890' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalled();
            });

            const mutateCall = mockMutate.mock.calls[0];
            const callbacks = mutateCall[1];
            const error = new Error('Update failed');
            callbacks.onError(error);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Update phone number failed:', error);

            consoleErrorSpy.mockRestore();
        });

        it('should log error response data', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });

            fireEvent.change(input, { target: { value: '081234567890' } });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalled();
            });

            const mutateCall = mockMutate.mock.calls[0];
            const callbacks = mutateCall[1];
            const error = {
                response: {
                    data: { message: 'Invalid phone number' },
                    status: 400,
                },
            };
            callbacks.onError(error);

            expect(consoleErrorSpy).toHaveBeenCalledWith('Error response:', error.response.data);
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error status:', error.response.status);

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Loading States', () => {
        it('should show loading text when mutation is pending', () => {
            vi.mocked(useUpdateProfile).mockReturnValue({
                mutate: mockMutate,
                isPending: true,
            } as any);

            renderComponent();

            expect(screen.getByRole('button', { name: 'Menyimpan...' })).toBeInTheDocument();
        });

        it('should disable submit button when mutation is pending', () => {
            vi.mocked(useUpdateProfile).mockReturnValue({
                mutate: mockMutate,
                isPending: true,
            } as any);

            renderComponent();

            const submitButton = screen.getByRole('button', { name: 'Menyimpan...' });
            expect(submitButton).toBeDisabled();
        });

        it('should enable submit button when mutation is not pending', () => {
            renderComponent();

            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });
            expect(submitButton).not.toBeDisabled();
        });
    });

    describe('Navigation', () => {
        it('should call navigateToAccount when back button is clicked', () => {
            renderComponent();

            const backButton = screen.getByRole('button', { name: 'Back' });
            backButton.click();

            expect(mockNavigateToAccount).toHaveBeenCalled();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long phone numbers', async () => {
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            fireEvent.change(input, { target: { value: '08123456789012345678901234567890' } });

            expect(input).toHaveValue('08123456789012345678901234567890');
        });

        it('should handle special characters in phone input', async () => {
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            fireEvent.change(input, { target: { value: '+62-812-3456-7890' } });

            expect(input).toHaveValue('+62-812-3456-7890');
        });

        it('should handle phone number with spaces', async () => {
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            fireEvent.change(input, { target: { value: '0812 3456 7890' } });

            expect(input).toHaveValue('0812 3456 7890');
        });

        it('should format phone number with only country code', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, phone: '62' },
            } as any);

            renderComponent();

            expect(screen.getByText('+62 ')).toBeInTheDocument();
        });

        it('should handle phone number with non-numeric characters in formatting', () => {
            vi.mocked(useAuth).mockReturnValue({
                user: { ...mockUser, phone: '62-812-345-6789' },
            } as any);

            renderComponent();

            expect(screen.getByText('+62 812-345-6789')).toBeInTheDocument();
        });
    });

    describe('Form Layout', () => {
        it('should have correct form structure', () => {
            const { container } = renderComponent();

            const form = container.querySelector('form');
            expect(form).toBeInTheDocument();
            expect(form).toHaveClass('flex', 'flex-col', 'justify-between');
        });

        it('should have correct input styling', () => {
            renderComponent();

            const input = screen.getByPlaceholderText('Contoh: 081234567890');
            expect(input).toHaveClass('text-primary-orange');
        });

        it('should have correct button styling', () => {
            renderComponent();

            const submitButton = screen.getByRole('button', { name: 'Simpan Perubahan' });
            expect(submitButton).toHaveClass('mb-10');
        });
    });
});
