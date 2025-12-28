const CACHE_NAME = 'portfolio-v1.0.0';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    '/projects.json',
    '/publications.json',
    '/assets/cover.jpg',
    '/assets/bottube.png',
    '/assets/project_jobs.png',
    '/assets/ruff.png',
    '/assets/emotion_modeling_for_robots.png',
    '/assets/vision_guided_teleoperation.png'
];

// Install Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('Cache addAll failed:', error);
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request because it's a stream
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response because it's a stream
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // Fallback for offline scenarios
                if (event.request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline form submissions (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'contact-form-sync') {
        event.waitUntil(
            // Handle offline form submissions when back online
            console.log('Background sync triggered')
        );
    }
});

// Push notification handling (future enhancement)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'New update available!',
        icon: '/assets/cover.jpg',
        badge: '/assets/cover.jpg',
        vibrate: [100, 50, 100],
        actions: [
            {
                action: 'explore',
                title: 'View Portfolio',
                icon: '/assets/cover.jpg'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/assets/cover.jpg'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('Portfolio Update', options)
    );
});