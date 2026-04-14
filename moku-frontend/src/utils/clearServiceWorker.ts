/**
 * Utility untuk membersihkan Service Worker dan cache
 * Gunakan saat development atau troubleshooting
 */
export async function clearServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            // Unregister semua service workers
            const registrations = await navigator.serviceWorker.getRegistrations()

            for (const registration of registrations) {
                await registration.unregister()
            }

            // Clear semua caches
            if ('caches' in window) {
                const cacheNames = await caches.keys()

                for (const cacheName of cacheNames) {
                    await caches.delete(cacheName)
                }
            }
            return true
        } catch (error) {
            return false
        }
    }

    return false
}

// Ekspor untuk digunakan di console browser
if (typeof window !== 'undefined') {
    (window as any).clearServiceWorker = clearServiceWorker
}
