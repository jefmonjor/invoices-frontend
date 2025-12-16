const CACHE_VERSION = 'v2'; // Increment this on each deployment
const CACHE_NAME = `invoices-app-${CACHE_VERSION}`;

// Assets to pre-cache (only truly static content)
const PRECACHE_URLS = [
    '/offline.html'
];

// Install SW - precache minimal assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Installing, cache version:', CACHE_VERSION);
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => {
                // Skip waiting to activate immediately
                return self.skipWaiting();
            })
    );
});

// Activate - clear old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('invoices-app-') && name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                // Take control of all clients immediately
                return self.clients.claim();
            })
    );
});

// Fetch handler
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 1. NEVER cache API calls or external requests
    if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
        return; // Let browser handle normally
    }

    // 2. Navigation requests: NETWORK-FIRST with offline fallback
    // This prevents stale page caching issues on mobile
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Cache successful navigation for offline use
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Offline: try cache, then offline page
                    return caches.match(event.request)
                        .then((cached) => cached || caches.match('/offline.html'));
                })
        );
        return;
    }

    // 3. Static assets (JS, CSS, images): STALE-WHILE-REVALIDATE
    // Serve from cache immediately, update cache in background
    if (
        url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/) ||
        url.pathname.startsWith('/assets/')
    ) {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request)
                    .then((networkResponse) => {
                        if (networkResponse.ok) {
                            const responseClone = networkResponse.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(event.request, responseClone);
                            });
                        }
                        return networkResponse;
                    })
                    .catch(() => cachedResponse);

                // Return cached version immediately, or wait for network
                return cachedResponse || fetchPromise;
            })
        );
        return;
    }

    // 4. Everything else: NETWORK-ONLY
    // Don't interfere with normal requests
});

// Handle cache updates from the app
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data === 'CLEAR_CACHE') {
        caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
        });
    }
});
