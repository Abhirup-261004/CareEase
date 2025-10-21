// service worker for CareEase - handles offline caching and background tasks
// this file runs in the background and intercepts network requests

const CACHE_NAME = 'careease-v1';
const RUNTIME_CACHE = 'careease-runtime-v1';
const OFFLINE_PAGE = 'offline.html';

// files we want to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/contact.html',
  '/auth.html',
  '/reminders.html',
  '/profile.html',
  '/about.html',
  '/blog.html',
  '/terms.html',
  '/license.html',
  '/css/style.css',
  '/css/darkmode.css',
  '/css/form-validation.css',
  '/auth.css',
  '/profile.css',
  '/js/app.js',
  '/js/darkmode.js',
  '/js/form-validator.js',
  '/js/contact.js',
  '/js/auth.js',
  '/js/reminders.js',
  '/js/profile.js',
  '/offline.html'
];

// install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('some assets could not be cached during install', err);
      });
    })
  );
  self.skipWaiting();
});

// activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // don't cache non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // skip external resources we can't reliably cache
  if (url.origin !== location.origin) {
    return;
  }

  // strategy: cache first, fallback to network
  event.respondWith(
    caches.match(request).then((response) => {
      // if we have it cached, use it
      if (response) {
        return response;
      }

      // if not cached, try the network
      return fetch(request)
        .then((networkResponse) => {
          // don't cache bad responses
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
            return networkResponse;
          }

          // cache successful responses for later
          const responseToCache = networkResponse.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // if network fails, try to serve offline page for HTML requests
          if (request.destination === 'document' || request.headers.get('accept').includes('text/html')) {
            return caches.match(OFFLINE_PAGE);
          }

          // for other requests, return a basic error response
          return new Response('Offline - resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
    })
  );
});

// listen for messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
