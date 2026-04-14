const CACHE_NAME = "self-order-v3";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
    const urlsToCache = [
        "/",
        OFFLINE_URL,
        "/manifest.json",
        "/favicon.ico",
    ].map((url) => new URL(url, self.location.origin).href);

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Pre-caching assets");
            return cache.addAll(urlsToCache).catch((error) => {
                console.error(
                    "[Service Worker] Failed to pre-cache assets:",
                    error
                );
            });
        })
    );

    globalThis.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => {
                        console.log(
                            "[Service Worker] Deleting old cache:",
                            cacheName
                        );
                        return caches.delete(cacheName);
                    })
            );
        })
    );

    return globalThis.clients.claim();
});

self.addEventListener("fetch", (event) => {
    const { request } = event;
    const requestUrl = new URL(request.url);

    if (!requestUrl.protocol.startsWith("http")) {
        return;
    }

    // Bagian navigasi Anda (Network-first) sudah benar.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then((response) => response)
                .catch((error) => {
                    console.error(
                        "[Service Worker] Navigation fetch failed:",
                        request.url,
                        error
                    );
                    // Fallback ke halaman offline
                    return caches.match(OFFLINE_URL).then(
                        (offlineResponse) =>
                            offlineResponse ||
                            new Response("Offline page not found", {
                                status: 404,
                                statusText: "Not Found",
                            })
                    );
                })
        );
        return;
    }

    // === INI ADALAH BAGIAN YANG DIPERBAIKI ===
    // Strategi: Network-First, falling back to Cache (untuk aset)
    event.respondWith(
        fetch(request) // 1. Selalu coba ambil dari network DULU
            .then((networkResponse) => {
                // 2. Berhasil! Cache respons baru yang valid
                if (
                    networkResponse &&
                    networkResponse.status === 200 &&
                    (networkResponse.type === "basic" ||
                        networkResponse.type === "cors")
                ) {
                    // Cek ukuran file (seperti kode Anda sebelumnya)
                    const contentLength =
                        networkResponse.headers.get("content-length");
                    if (
                        contentLength &&
                        Number.parseInt(contentLength) > 5 * 1024 * 1024 // 5MB limit
                    ) {
                        return networkResponse; // Terlalu besar, jangan di-cache
                    }

                    // Clone respons untuk disimpan di cache
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache).catch((error) => {
                            console.warn(
                                "[Service Worker] Failed to cache:",
                                request.url,
                                error
                            );
                        });
                    });
                }

                // 3. Kembalikan respons BARU dari network
                return networkResponse;
            })
            .catch((error) => {
                // 4. Gagal ambil dari network (misal: offline)
                console.error(
                    "[Service Worker] Fetch failed, trying cache:",
                    request.url,
                    error
                );

                // 5. Sekarang, coba ambil dari cache sebagai fallback
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse; // Berhasil, tampilkan dari cache
                    }

                    // 6. Gagal di network DAN tidak ada di cache
                    // Penanganan error API (seperti kode Anda sebelumnya)
                    if (request.url.includes("/api/")) {
                        return new Response(
                            JSON.stringify({
                                error: "Network request failed",
                                offline: true,
                            }),
                            {
                                status: 503,
                                statusText: "Service Unavailable",
                                headers: { "Content-Type": "application/json" },
                            }
                        );
                    }

                    // Fallback umum ke halaman offline
                    // (Anda mungkin ingin fallback aset yang rusak/gambar, tapi OFFLINE_URL juga bisa)
                    return caches.match(OFFLINE_URL).then(
                        (offlineResponse) =>
                            offlineResponse ||
                            new Response("Resource not available offline", {
                                status: 503,
                                statusText: "Service Unavailable",
                            })
                    );
                });
            })
    );
});
self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        globalThis.skipWaiting();
    }

    if (event.data && event.data.type === "CLEAR_CACHE") {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});
