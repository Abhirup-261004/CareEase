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

// fetch event - serve from network, fallback to cache for serving assets when offline
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

  // strategy: network first whilst updating the cache with latest version, fallback to cache when offline
  event.respondWith(
    fetch(request)
      .then((response) => {
        // cache a copy of successful responses
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }

        return response;
      })
      .catch(async () => {
        // fallback to cache if network fails
        const cachedResponse = await caches.match(request);

        if (cachedResponse) {
          return cachedResponse;
        }

        // fallback to offline page for HTML which was not cached
        if (request.destination === 'document' || request.headers.get('accept').includes('text/html')) {
          return caches.match(OFFLINE_PAGE);
        }

        // generic fallback for other assets
        return new Response('Offline - resource not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' }),
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
