/**
 * Service Worker Update Handler
 * Menangani update Service Worker dan cache management
 */

export interface ServiceWorkerUpdateOptions {
    onUpdateFound?: () => void;
    onUpdateReady?: () => void;
    autoUpdate?: boolean;
    clearCacheOnUpdate?: boolean;
}

/**
 * Setup Service Worker update handler
 * Akan check update setiap kali page reload
 */
export function setupServiceWorkerUpdater(options: ServiceWorkerUpdateOptions = {}) {
    const {
        onUpdateFound = () => console.log('🔄 Service Worker update found...'),
        onUpdateReady = () => console.log('✅ Service Worker update ready!'),
        autoUpdate = true,
        clearCacheOnUpdate = false,
    } = options;

    if (!('serviceWorker' in navigator)) {
        console.warn('⚠️ Service Worker not supported');
        return;
    }

    // Check for updates on page load
    navigator.serviceWorker.ready.then((registration) => {
        // Check for updates immediately
        registration.update();

        // Check for updates every time page gains focus
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                registration.update();
            }
        });

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
            onUpdateFound();

            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker available
                    onUpdateReady();

                    if (clearCacheOnUpdate) {
                        // Clear old caches before activating new SW
                        clearOldCaches().then(() => {
                            if (autoUpdate) {
                                // Tell the new service worker to skip waiting
                                newWorker.postMessage({ type: 'SKIP_WAITING' });
                            }
                        });
                    } else if (autoUpdate) {
                        // Just skip waiting without clearing cache
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                    }
                }
            });
        });
    });

    // Listen for controller change (new service worker activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
       
        window.location.reload();
    });
}

/**
 * Clear old caches (keep only latest version)
 */
async function clearOldCaches(): Promise<void> {
    if (!('caches' in window)) return;

    try {
        const cacheNames = await caches.keys();
        const currentCaches = ['workbox-precache', 'api-data-cache', 'images-assets-cache'];

        const cachesToDelete = cacheNames.filter(cacheName => {
            // Delete caches that are not in the current list
            return !currentCaches.some(current => cacheName.startsWith(current));
        });

        await Promise.all(cachesToDelete.map(cacheName => {
            return caches.delete(cacheName);
        }));

    } catch (error) {
        throw new Error('Failed to clear old caches');
        console.error('❌ Error clearing old caches:', error);
    }
}

/**
 * Force clear ALL caches (use with caution!)
 * Gunakan hanya untuk development atau troubleshooting
 */
export async function forceCleanAllCaches(): Promise<boolean> {
    if (!('caches' in window)) {
        console.warn('⚠️ Cache API not supported');
        return false;
    }

    try {
        const cacheNames = await caches.keys();

        await Promise.all(
            cacheNames.map(cacheName => {
                return caches.delete(cacheName);
            })
        );

        return true;
    } catch (error) {
        console.error('❌ Error clearing caches:', error);
        return false;
    }
}

/**
 * Clear cache dan reload (untuk development)
 */
export async function clearCacheAndReload(): Promise<void> {
    await forceCleanAllCaches();

    // Unregister service worker juga
    if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
    }

    window.location.reload();
}

/**
 * Check if new version available
 */
export async function checkForUpdates(): Promise<boolean> {
    if (!('serviceWorker' in navigator)) return false;

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.update();

        return !!registration.waiting || !!registration.installing;
    } catch (error) {
        return false;
    }
}

/**
 * Development mode: Clear cache on every reload
 * ⚠️ ONLY USE IN DEVELOPMENT!
 */
export function enableDevModeAutoClear() {
    if (import.meta.env.DEV) {

        // Set flag in sessionStorage
        const AUTO_CLEAR_KEY = 'dev_auto_clear_cache';

        // Check if this is a fresh page load (not a refresh)
        const shouldClear = sessionStorage.getItem(AUTO_CLEAR_KEY);

        if (shouldClear === 'true') {
            // Clear cache
            forceCleanAllCaches().then(() => {
                console.log('✅ DEV: Cache cleared on reload');
            });
        }

        // Set flag for next reload
        sessionStorage.setItem(AUTO_CLEAR_KEY, 'true');

        // Clear flag when tab is closed (on beforeunload)
        window.addEventListener('beforeunload', () => {
            sessionStorage.removeItem(AUTO_CLEAR_KEY);
        });
    }
}

// Expose to window for console debugging
if (typeof window !== 'undefined') {
    (window as any).swUpdater = {
        checkForUpdates,
        clearCacheAndReload,
        forceCleanAllCaches,
    };
}
