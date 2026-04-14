/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import { CacheFirst } from 'workbox-strategies'

declare let self: ServiceWorkerGlobalScope

// Version untuk cache busting - increment saat deploy baru
const CACHE_VERSION = 'v1';
const CACHE_PREFIX = 'spinocafe-';

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING')
    self.skipWaiting()

  // Handle manual cache clear request
  if (event.data?.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
})

// Clean old caches on activate
self.addEventListener('activate', (event) => {


  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete caches yang bukan versi sekarang
            if (cacheName.startsWith(CACHE_PREFIX)) {
              return cacheName !== `${CACHE_PREFIX}${CACHE_VERSION}`;
            }
            return false;
          })
          .map((cacheName) => {

            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // Claim all clients
      return self.clients.claim();
    })
  );
});

// self.__WB_MANIFEST is the default injection point
precacheAndRoute(self.__WB_MANIFEST)

// clean old assets
cleanupOutdatedCaches()

/** @type {RegExp[] | undefined} */
let allowlist
// in dev mode, we disable precaching to avoid caching issues
if (import.meta.env.DEV)
  allowlist = [/^\/$/]

// Navigation route untuk handle navigasi - gunakan NetworkFirst untuk mencoba network dulu
registerRoute(
  new NavigationRoute(
    createHandlerBoundToURL('index.html'),
    {
      allowlist,
      // Hindari redirect ke offline.html untuk route aplikasi
      denylist: [/offline\.html$/],
    }
  )
)
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style',
  new CacheFirst({
    cacheName: 'spinocafe-static-v1',
    matchOptions: {
      ignoreSearch: true
    }
  })
)

// Cache font
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: 'spinocafe-fonts-v1'
  })
)

// Cache gambar
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'spinocafe-images-v1'
  })
)

// Fallback untuk offline - hanya jika benar-benar offline
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        // Hanya tampilkan offline page jika benar-benar tidak ada koneksi
        const cachedIndex = await caches.match('index.html')
        if (cachedIndex) {
          return cachedIndex
        }

        try {
          return await fetch('/offline.html')
        } catch {
          return new Response('Offline', { status: 503 })
        }
      })
    )
  }
})
