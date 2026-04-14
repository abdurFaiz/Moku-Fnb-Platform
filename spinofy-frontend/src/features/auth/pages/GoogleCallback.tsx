import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { ScreenWrapper } from '@/components/layout/ScreenWrapper';
import { SkeletonLoader } from '@/components';

const GoogleCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<{ isLoading: boolean; error: string | null }>({
        isLoading: true,
        error: null
    });
    const login = useAuthStore((state) => state.login);

    const handleTokensFromUrl = (token: string, refreshToken: string, userId?: string, userName?: string, userEmail?: string) => {


        // Create user object if we have data
        const user = userId && userName ? {
            id: Number.parseInt(userId, 10),
            uuid: userId,
            name: userName,
            email: userEmail || '',
            short_name: userName.charAt(0).toUpperCase(),
            avatar_url: '',
            phone: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            customer_profile: {
                id: Number.parseInt(userId, 10),
                uuid: userId,
                job: null,
                date_birth: null,
                gender: null,
                user_id: Number.parseInt(userId, 10),
                total_point: 0,
                avatar: null,
                total_order: 0,
                total_user_voucher: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
        } : null;

        if (user) {
            // Use auth store login method
            login({
                access_token: token,
                refresh_token: refreshToken,
                user
            });

            navigate('/outlet-selection', { replace: true });
        } else {
            throw new Error('Invalid user data received');
        }
    }

    useEffect(() => {
        const handleGoogleCallback = async () => {
            try {


                // Check for OAuth error first
                const oauthError = searchParams.get('error');
                if (oauthError) {
                    console.error('OAuth error from URL:', oauthError);
                    throw new Error(`Google OAuth error: ${oauthError}`);
                }

                // ✅ Only handle direct tokens from Laravel redirect
                const token = searchParams.get('access_token') || searchParams.get('token');
                const refreshToken = searchParams.get('refresh_token');

                if (token && refreshToken) {
                    // Direct token approach - Laravel sent tokens directly
                    const userId = searchParams.get('user_id');
                    const userName = searchParams.get('user_name');
                    const userEmail = searchParams.get('user_email');

                    handleTokensFromUrl(token, refreshToken, userId || undefined, userName || undefined, userEmail || undefined);
                } else {
                    // ❌ Remove OAuth code handling - let Laravel handle everything
                    console.error('No tokens received from backend');
                    throw new Error('No authentication tokens received from server. Please try again.');
                }
            } catch (err) {
                console.error('Google callback error:', err);
                setStatus({ isLoading: false, error: err instanceof Error ? err.message : 'Authentication failed' });

                // Redirect to onboard page after a delay
                setTimeout(() => {
                    navigate('/onboard?error=oauth_failed', { replace: true });
                }, 3000);
            } finally {
                setStatus((prev) => ({ ...prev, isLoading: false }));
            }
        };

        const timeoutId = setTimeout(handleGoogleCallback, 100);
        return () => clearTimeout(timeoutId);
    }, [searchParams, navigate, login]);

    if (status.isLoading) {
        return (
            <ScreenWrapper>
                <SkeletonLoader />
            </ScreenWrapper>
        );
    }

    if (status.error) {
        return (
            <ScreenWrapper>
                <div className="flex flex-col items-center justify-center h-screen gap-4 px-4">
                    <div className="text-red-500 text-center">
                        <h2 className="text-xl font-bold mb-2">Login Gagal</h2>
                        <p className="text-sm">{status.error}</p>
                    </div>
                    <p className="text-body-grey text-sm text-center">
                        Akan kembali ke halaman utama dalam beberapa detik...
                    </p>
                </div>
            </ScreenWrapper>
        );
    }

    return null;
};

export default GoogleCallback;