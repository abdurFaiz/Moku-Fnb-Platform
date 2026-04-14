import { authAPI } from '@/features/auth/api/auth.api';

export const GoogleLoginButton = () => {
    const handleGoogleClick = async () => {
        try {
            // Use the API method to initiate Google login
            await authAPI.loginWithGoogle();
        } catch (error) {
            console.error('Error during Google login:', error);
        }
    };

    return (
        <button
            onClick={handleGoogleClick}
            className="flex items-center cursor-pointer justify-center gap-3 w-full py-4 px-6 bg-white border-2 border-title-black transition-colors rounded-[32px] text-title-black font-medium text-base hover:bg-gray-50"
        >
            <img
                loading='lazy'
                src="/icons/icon-google.svg"
                alt="Google Icon"
                className="w-6 h-6"
                width={24}
                height={24}
            />
            <span>Continue with Google</span>
        </button>
    );
};