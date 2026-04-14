import { useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { authAPI } from "@/features/auth/api/auth.api";
import { toast } from "sonner";

export const ModalRefreshToken = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showRefreshModal, setShowRefreshModal] = useState(false);

    const handleRefreshToken = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            console.log(' Attempting to refresh token...');
            const accessToken = localStorage.getItem('access_token');
            const refreshToken = localStorage.getItem('refresh_token');
            console.log(' Access token exists:', !!accessToken);
            console.log(' Refresh token exists:', !!refreshToken);

            const response = await authAPI.refreshToken();

            console.log(' Refresh response received:', response);

            // authAPI.refreshToken() returns response.data which is { status, message, data: { access_token, refresh_token, user } }
            if (response?.data?.access_token && response?.data?.refresh_token) {
                const { access_token, refresh_token } = response.data;

                localStorage.setItem('access_token', access_token);
                localStorage.setItem('refresh_token', refresh_token);

                // Update expiration timestamp - 14 days from now (based on backend access_token expiration)
                const now = Date.now();
                sessionStorage.setItem('token_timestamp', now.toString());
                sessionStorage.setItem('token_expiry_time', (now + 14 * 24 * 60 * 60 * 1000).toString());
                if (response.data.user) {
                    localStorage.setItem('user_id', response.data.user.id.toString());
                    localStorage.setItem('user_name', response.data.user.name);
                    if (response.data.user.email) {
                        localStorage.setItem('user_email', response.data.user.email);
                    }
                }

                // Close modal
                setShowRefreshModal(false);
                console.log(' Token refreshed successfully!');
                toast.success('Sesi berhasil diperbarui!');
            } else {
                console.error(' Invalid response format:', response?.data);
                toast.error('Gagal memperbarui sesi. Respons tidak valid.');
            }
        } catch (error) {
            console.error(' [Modal] Error refreshing token:', error);
            toast.error('Gagal memperbarui sesi. Silakan login kembali.');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle dismiss/cancel
    const handleDismiss = () => {
        setShowRefreshModal(false);
    };

    return (
        <AlertDialog open={showRefreshModal} onOpenChange={setShowRefreshModal}>
            <AlertDialogTrigger asChild>
                {/* Hidden trigger - modal is controlled by useTokenExpiration hook */}
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Sesi Kamu Hampir Habis</AlertDialogTitle>
                    <AlertDialogDescription>
                        Waktunya diperbarui biar kamu tetap bisa lanjut tanpa gangguan.
                        Yuk segarkan sesi kamu sekarang.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel
                        className="w-full"
                        onClick={handleDismiss}
                        disabled={isLoading}
                    >
                        Nanti aja
                    </AlertDialogCancel>
                    <AlertDialogAction
                        className="w-full"
                        onClick={handleRefreshToken}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Memperbarui...' : 'Perbarui Sekarang'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
