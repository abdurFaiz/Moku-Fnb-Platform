import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import FormProfile from '../pages/Form/FormProfile';
import { useAuth } from '@/features/auth/hooks/auth.hooks';
import { useOutletNavigation } from '@/hooks/shared/useOutletNavigation';
import * as authServices from '../services';
import { toast } from 'sonner';
import './setup';

// Mock dependencies
vi.mock('@/features/auth/hooks/auth.hooks');
vi.mock('@/hooks/shared/useOutletNavigation');
vi.mock('../services');
vi.mock('sonner');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

const mockUser = {
    id: 1,
    uuid: 'user-123',
    name: 'John Doe',
    phone: '081234567890',
    email: 'john@example.com',
    avatar_url: 'http://localhost:8000/avatar.jpg',
    short_name: 'JD',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    customer_profile: {
        id: 1,
        uuid: 'profile-123',
        job: 'Software Engineer',
        date_birth: '1990-01-01',
        gender: 1,
        user_id: 1,
        avatar: 'avatar.jpg',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
    },
};

describe('FormProfile', () => {
    let queryClient: QueryClient;

    const createWrapper = () => {
        const wrapper = ({ children }: { children: ReactNode }) =>
            createElement(
                QueryClientProvider,
                { client: queryClient },
                createElement(BrowserRouter, null, children)
            );
        return wrapper;
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
                mutations: { retry: false },
            },
        });

        vi.clearAllMocks();
        localStorage.clear();

        // Default mocks
        vi.mocked(useOutletNavigation).mockReturnValue({
            navigateToAccount: vi.fn(),
            outletSlug: 'test-outlet',
        } as any);

        vi.mocked(toast).mockReturnValue({} as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('Registration Mode (New User)', () => {
        beforeEach(() => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                isAuthenticated: false,
            } as any);

            vi.mocked(authServices.useRegister).mockReturnValue({
                mutate: vi.fn(),
                isPending: false,
            } as any);

            vi.mocked(authServices.useUpdateProfile).mockReturnValue({
                mutate: vi.fn(),
                isPending: false,
            } as any);
        });

        it('should render registration form', () => {
            render(<FormProfile />, { wrapper: createWrapper() });

            expect(screen.getByText('Lengkapi Data Diri')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Nama Lengkap*')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Nomor WhatsApp*')).toBeInTheDocument();
            expect(screen.getByText('Daftar Sekarang')).toBeInTheDocument();
        });

        it('should validate required fields', async () => {
            render(<FormProfile />, { wrapper: createWrapper() });

            const submitButton = screen.getByText('Daftar Sekarang');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Nama lengkap wajib diisi/i)).toBeInTheDocument();
            });
        });

        it('should validate name minimum length', async () => {
            render(<FormProfile />, { wrapper: createWrapper() });

            const nameInput = screen.getByPlaceholderText('Nama Lengkap*');
            fireEvent.change(nameInput, { target: { value: 'Jo' } });

            const submitButton = screen.getByText('Daftar Sekarang');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/Nama lengkap minimal 3 karakter/i)).toBeInTheDocument();
            });
        });

        it('should validate phone number format', async () => {
            render(<FormProfile />, { wrapper: createWrapper() });

            const phoneInput = screen.getByPlaceholderText('Nomor WhatsApp*');
            fireEvent.change(phoneInput, { target: { value: 'abc123' } });

            const submitButton = screen.getByText('Daftar Sekarang');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/hanya boleh berisi angka/i)).toBeInTheDocument();
            });
        });

        it('should validate phone number length', async () => {
            render(<FormProfile />, { wrapper: createWrapper() });

            const phoneInput = screen.getByPlaceholderText('Nomor WhatsApp*');
            fireEvent.change(phoneInput, { target: { value: '123' } });

            const submitButton = screen.getByText('Daftar Sekarang');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(screen.getByText(/minimal 8 digit/i)).toBeInTheDocument();
            });
        });

        it('should submit registration with valid data', async () => {
            const mockMutate = vi.fn((_, options) => {
                options?.onSuccess?.();
            });

            vi.mocked(authServices.useRegister).mockReturnValue({
                mutate: mockMutate,
                isPending: false,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            fireEvent.change(screen.getByPlaceholderText('Nama Lengkap*'), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByPlaceholderText('Nomor WhatsApp*'), { target: { value: '081234567890' } });

            const submitButton = screen.getByText('Daftar Sekarang');
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'John Doe',
                        phone: '081234567890',
                    }),
                    expect.any(Object)
                );
            });
        });

        it('should show loading state during registration', () => {
            vi.mocked(authServices.useRegister).mockReturnValue({
                mutate: vi.fn(),
                isPending: true,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            expect(screen.getByText('Mendaftar...')).toBeInTheDocument();
            expect(screen.getByText('Mendaftar...')).toBeDisabled();
        });

        it('should navigate to onboard after successful registration', async () => {
            const mockMutate = vi.fn((_, options) => {
                options?.onSuccess?.();
            });

            vi.mocked(authServices.useRegister).mockReturnValue({
                mutate: mockMutate,
                isPending: false,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            fireEvent.change(screen.getByPlaceholderText('Nama Lengkap*'), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByPlaceholderText('Nomor WhatsApp*'), { target: { value: '081234567890' } });

            fireEvent.click(screen.getByText('Daftar Sekarang'));

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/test-outlet/onboard', { replace: true });
            });
        });

        it('should navigate to checkout if redirect flag is set', async () => {
            localStorage.setItem('redirectAfterProfileComplete', 'checkout');

            const mockMutate = vi.fn((_, options) => {
                options?.onSuccess?.();
            });

            vi.mocked(authServices.useRegister).mockReturnValue({
                mutate: mockMutate,
                isPending: false,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            fireEvent.change(screen.getByPlaceholderText('Nama Lengkap*'), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByPlaceholderText('Nomor WhatsApp*'), { target: { value: '081234567890' } });

            fireEvent.click(screen.getByText('Daftar Sekarang'));

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/test-outlet/checkout', { replace: true });
            });
        });
    });

    describe('Update Mode (Existing User)', () => {
        beforeEach(() => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isAuthenticated: true,
            } as any);

            vi.mocked(authServices.useRegister).mockReturnValue({
                mutate: vi.fn(),
                isPending: false,
            } as any);

            vi.mocked(authServices.useUpdateProfile).mockReturnValue({
                mutate: vi.fn(),
                isPending: false,
            } as any);
        });

        it('should render update form with title', () => {
            render(<FormProfile />, { wrapper: createWrapper() });

            expect(screen.getByText('Ubah Data Diri')).toBeInTheDocument();
            expect(screen.getByText('Simpan Perubahan')).toBeInTheDocument();
        });

        it('should pre-fill form with existing user data', async () => {
            render(<FormProfile />, { wrapper: createWrapper() });

            await waitFor(() => {
                const nameInput = screen.getByPlaceholderText('Nama Lengkap*') as HTMLInputElement;
                expect(nameInput.value).toBe('John Doe');

                const phoneInput = screen.getByPlaceholderText('Nomor WhatsApp*') as HTMLInputElement;
                expect(phoneInput.value).toBe('081234567890');
            });
        });

        it('should submit update with modified data', async () => {
            const mockMutate = vi.fn((_, options) => {
                options?.onSuccess?.();
            });

            vi.mocked(authServices.useUpdateProfile).mockReturnValue({
                mutate: mockMutate,
                isPending: false,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            await waitFor(() => {
                const nameInput = screen.getByPlaceholderText('Nama Lengkap*');
                expect(nameInput).toHaveValue('John Doe');
            });

            const nameInput = screen.getByPlaceholderText('Nama Lengkap*');
            fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

            fireEvent.click(screen.getByText('Simpan Perubahan'));

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'Jane Doe',
                    }),
                    expect.any(Object)
                );
            });
        });

        it('should show loading state during update', () => {
            vi.mocked(authServices.useUpdateProfile).mockReturnValue({
                mutate: vi.fn(),
                isPending: true,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            expect(screen.getByText('Menyimpan...')).toBeInTheDocument();
            expect(screen.getByText('Menyimpan...')).toBeDisabled();
        });

        it('should show success toast after update', async () => {
            const mockMutate = vi.fn((_, options) => {
                options?.onSuccess?.();
            });

            vi.mocked(authServices.useUpdateProfile).mockReturnValue({
                mutate: mockMutate,
                isPending: false,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Nama Lengkap*')).toHaveValue('John Doe');
            });

            fireEvent.click(screen.getByText('Simpan Perubahan'));

            await waitFor(() => {
                expect(toast.success).toHaveBeenCalledWith('Profil berhasil diperbarui.');
            });
        });

        it('should navigate to account after successful update', async () => {
            const mockMutate = vi.fn((_, options) => {
                options?.onSuccess?.();
            });

            vi.mocked(authServices.useUpdateProfile).mockReturnValue({
                mutate: mockMutate,
                isPending: false,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Nama Lengkap*')).toHaveValue('John Doe');
            });

            fireEvent.click(screen.getByText('Simpan Perubahan'));

            await waitFor(() => {
                expect(mockNavigate).toHaveBeenCalledWith('/test-outlet/account', { replace: true });
            });
        });
    });

    describe('Avatar Upload', () => {
        beforeEach(() => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                isAuthenticated: false,
            } as any);

            vi.mocked(authServices.useRegister).mockReturnValue({
                mutate: vi.fn(),
                isPending: false,
            } as any);
        });

        it('should show error for non-image file', async () => {
            render(<FormProfile />, { wrapper: createWrapper() });

            const fileInput = screen.getByLabelText(/Foto Profil/i) as HTMLInputElement;
            const file = new File(['content'], 'document.pdf', { type: 'application/pdf' });

            Object.defineProperty(fileInput, 'files', {
                value: [file],
                writable: false,
            });

            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('File harus berupa gambar');
            });
        });

        it('should show error for file size exceeding limit', async () => {
            render(<FormProfile />, { wrapper: createWrapper() });

            const fileInput = screen.getByLabelText(/Foto Profil/i) as HTMLInputElement;
            // Create a file larger than 5MB
            const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

            Object.defineProperty(fileInput, 'files', {
                value: [largeFile],
                writable: false,
            });

            fireEvent.change(fileInput);

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith('Ukuran gambar maksimal 5MB');
            });
        });
    });

    describe('Optional Fields', () => {
        beforeEach(() => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                isAuthenticated: false,
            } as any);

            vi.mocked(authServices.useRegister).mockReturnValue({
                mutate: vi.fn(),
                isPending: false,
            } as any);
        });

        it('should allow submission without optional fields', async () => {
            const mockMutate = vi.fn((_, options) => {
                options?.onSuccess?.();
            });

            vi.mocked(authServices.useRegister).mockReturnValue({
                mutate: mockMutate,
                isPending: false,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            fireEvent.change(screen.getByPlaceholderText('Nama Lengkap*'), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByPlaceholderText('Nomor WhatsApp*'), { target: { value: '081234567890' } });

            fireEvent.click(screen.getByText('Daftar Sekarang'));

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalled();
            });
        });

        it('should include optional fields when provided', async () => {
            const mockMutate = vi.fn((_, options) => {
                options?.onSuccess?.();
            });

            vi.mocked(authServices.useRegister).mockReturnValue({
                mutate: mockMutate,
                isPending: false,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            fireEvent.change(screen.getByPlaceholderText('Nama Lengkap*'), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByPlaceholderText('Nomor WhatsApp*'), { target: { value: '081234567890' } });
            fireEvent.change(screen.getByPlaceholderText('Pekerjaan'), { target: { value: 'Engineer' } });

            fireEvent.click(screen.getByText('Daftar Sekarang'));

            await waitFor(() => {
                expect(mockMutate).toHaveBeenCalledWith(
                    expect.objectContaining({
                        job: 'Engineer',
                    }),
                    expect.any(Object)
                );
            });
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            vi.mocked(useAuth).mockReturnValue({
                user: null,
                isAuthenticated: false,
            } as any);
        });

        it('should handle registration error', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const mockError = new Error('Registration failed');

            const mockMutate = vi.fn((_, options) => {
                options?.onError?.(mockError);
            });

            vi.mocked(authServices.useRegister).mockReturnValue({
                mutate: mockMutate,
                isPending: false,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            fireEvent.change(screen.getByPlaceholderText('Nama Lengkap*'), { target: { value: 'John Doe' } });
            fireEvent.change(screen.getByPlaceholderText('Nomor WhatsApp*'), { target: { value: '081234567890' } });

            fireEvent.click(screen.getByText('Daftar Sekarang'));

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Registration failed:', mockError);
            });

            consoleErrorSpy.mockRestore();
        });

        it('should handle update error', async () => {
            const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
            const mockError = new Error('Update failed');

            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isAuthenticated: true,
            } as any);

            const mockMutate = vi.fn((_, options) => {
                options?.onError?.(mockError);
            });

            vi.mocked(authServices.useUpdateProfile).mockReturnValue({
                mutate: mockMutate,
                isPending: false,
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            await waitFor(() => {
                expect(screen.getByPlaceholderText('Nama Lengkap*')).toHaveValue('John Doe');
            });

            fireEvent.click(screen.getByText('Simpan Perubahan'));

            await waitFor(() => {
                expect(consoleErrorSpy).toHaveBeenCalledWith('Update profile failed:', mockError);
            });

            consoleErrorSpy.mockRestore();
        });
    });

    describe('Navigation', () => {
        beforeEach(() => {
            vi.mocked(useAuth).mockReturnValue({
                user: mockUser,
                isAuthenticated: true,
            } as any);

            vi.mocked(authServices.useUpdateProfile).mockReturnValue({
                mutate: vi.fn(),
                isPending: false,
            } as any);
        });

        it('should navigate back to account on back button click', () => {
            const mockNavigateToAccount = vi.fn();

            vi.mocked(useOutletNavigation).mockReturnValue({
                navigateToAccount: mockNavigateToAccount,
                outletSlug: 'test-outlet',
            } as any);

            render(<FormProfile />, { wrapper: createWrapper() });

            const backButton = screen.getByRole('button', { name: /back/i });
            fireEvent.click(backButton);

            expect(mockNavigateToAccount).toHaveBeenCalled();
        });
    });
});
