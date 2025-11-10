// Service Worker for Menurai PWA
const CACHE_NAME = 'menurai-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache when possible
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip Firebase and external API requests
  const url = new URL(event.request.url);
  if (url.hostname.includes('firebase') ||
      url.hostname.includes('googleapis') ||
      url.hostname.includes('firebaseio.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch new
        if (response) {
          return response;
        }

        return fetch(event.request).then(response => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        return caches.match('/index.html');
      })
  );
});

// Background sync for offline capability
self.addEventListener('sync', event => {
  if (event.tag === 'sync-menu-scans') {
    event.waitUntil(syncMenuScans());
  }
});

async function syncMenuScans() {
  // Sync any offline menu scans when back online
  console.log('Syncing offline menu scans...');
}

// Push notification support
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update from Menurai',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png'
  };

  event.waitUntil(
    self.registration.showNotification('Menurai', options)
  );
});