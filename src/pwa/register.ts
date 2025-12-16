export function register() {
    if ('serviceWorker' in navigator && import.meta.env.PROD) {
        window.addEventListener('load', () => {
            const swUrl = '/sw.js';
            navigator.serviceWorker
                .register(swUrl)
                .then((registration) => {
                    console.log('[SW] Registration successful with scope:', registration.scope);

                    // Check for updates periodically
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    // New content available, trigger update
                                    console.log('[SW] New content available, will update on next refresh');
                                    newWorker.postMessage('SKIP_WAITING');
                                }
                            });
                        }
                    });
                })
                .catch((error) => {
                    console.error('[SW] Registration failed:', error);
                });
        });
    }
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister();
                // Also clear all caches
                if ('caches' in window) {
                    caches.keys().then((names) => {
                        names.forEach((name) => caches.delete(name));
                    });
                }
            })
            .catch((error) => {
                console.error('[SW] Unregister error:', error.message);
            });
    }
}

// Utility to force clear all caches (call from console if issues)
export function clearAllCaches() {
    if ('caches' in window) {
        caches.keys().then((names) => {
            names.forEach((name) => {
                console.log('[SW] Clearing cache:', name);
                caches.delete(name);
            });
        });
    }
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage('CLEAR_CACHE');
    }
}
