const CACHE_VERSION = 'v3'; // Increment on each deployment
const CACHE_NAME = `invoices-app-${CACHE_VERSION}`;

// MINIMAL pre-cache - only offline fallback
const PRECACHE_URLS = [
    '/offline.html'
];

// Install SW
self.addEventListener('install', (event) => {
    console.log('[SW] Installing version:', CACHE_VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting()) // Activate immediately
    );
});

// Activate - AGGRESSIVELY clear ALL old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating version:', CACHE_VERSION);
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete ALL caches that aren't current version
                        if (cacheName !== CACHE_NAME) {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim()) // Take control immediately
    );
});

// Fetch - NETWORK FIRST for everything, minimal caching
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // NEVER interfere with API calls or external requests
    if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
        return;
    }

    // Navigation requests: NETWORK FIRST (prevents black screen)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match('/offline.html'))
        );
        return;
    }

    // Static assets: NETWORK FIRST with fallback to cache
    // This ensures fresh content but works offline
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Only cache successful responses
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data === 'CLEAR_ALL_CACHES') {
        caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
        });
    }
});
