/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const csrfToken = document.head.querySelector('meta[name="csrf-token"]')?.content ?? undefined;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    wsPath: import.meta.env.VITE_REVERB_APP_PATH ?? '',
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    withCredentials: true,
    auth: {
        headers: csrfToken
            ? {
                  'X-CSRF-TOKEN': csrfToken,
              }
            : {},
    },
});

const NEW_ORDER_SOUND_PATH = '/assets/sounds/new-order.mp3';

function playNewOrderSound() {
    try {
        const audio = new Audio(NEW_ORDER_SOUND_PATH);
        audio.volume = 1.0;
        audio.preload = 'auto';

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    console.log('New order sound played successfully');
                })
                .catch((err) => {
                    console.warn('Autoplay prevented or failed:', err);
                });
        }
    } catch (error) {
        console.error('Failed to create/play new order sound', error);
    }
}

document.addEventListener('livewire:init', () => {
    const outletId = window?.currentOutletId;

    if (!outletId) {
        return;
    }

    const channel = window.Echo.private(`new-order-line-created.${outletId}`);

    channel.listen('.newOrderLineCreated', (event) => {
        Livewire.dispatch('newOrderLineCreated', event);

        const message = `Terdapat pesanan baru, silahkan cek di halaman Order Line.`;

        if (typeof window.showSuccess === 'function') {
            window.showSuccess(message);
        }

        playNewOrderSound();
    });
});