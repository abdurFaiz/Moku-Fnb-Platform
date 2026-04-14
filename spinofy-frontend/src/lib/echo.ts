import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Make Pusher available globally for Laravel Echo
// Reverb uses the Pusher protocol, so we use pusher-js as the client
window.Pusher = Pusher;

// Check if Reverb is properly configured
const isReverbConfigured = () => {
    const key = import.meta.env.VITE_REVERB_APP_KEY;
    const host = import.meta.env.VITE_REVERB_HOST;
    return key && host && key !== '';
};

// Initialize Laravel Echo with Reverb configuration
let echo: Echo<any> | null = null;

if (isReverbConfigured()) {
    try {
        const reverbHost = import.meta.env.VITE_REVERB_HOST || 'localhost';
        const reverbPort = import.meta.env.VITE_REVERB_PORT || '8080';
        const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || 'http';

        const useTLS = reverbScheme === 'https';
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

        echo = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: reverbHost,
            wsPort: parseInt(reverbPort),
            wssPort: parseInt(reverbPort),
            forceTLS: useTLS,
            enabledTransports: useTLS ? ['wss'] : ['ws'],
            enableStats: false,
            disableStats: true,
            authEndpoint: `${apiBaseUrl}/broadcasting/auth`,
            auth: {
                headers: {
                    get Authorization() {
                        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
                        return token ? `Bearer ${token}` : '';
                    },
                    Accept: 'application/json',
                },
            },
        });

    } catch (error) {
        console.error('[Echo] Failed to initialize:', error);
    }
} else {
    if (import.meta.env.MODE === 'development') {
        console.warn('[Echo] Reverb not configured.');
    }   
}

export { echo };
    export default echo;
