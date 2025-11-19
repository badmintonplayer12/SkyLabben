const CACHE_VERSION = 'skylabben-sw-v2';

const PRECACHE_PATHS = [
  './',
  './index.html',
  './manifest.json',
  './assets/css/main.css',
  './assets/js/main.js',
  './assets/js/router.js',
  './assets/js/data-loader.js',
  './assets/js/state.js',
  './assets/js/view-project-grid.js',
  './assets/js/view-viewer.js',
  './assets/js/audio-feedback.js',
  './assets/js/qr-code.js',
  './assets/js/onboarding.js',
  './assets/js/favorites.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

const PRECACHE_URLS = PRECACHE_PATHS.map((path) => new URL(path, self.location).href);
const PRECACHE_URL_SET = new Set(PRECACHE_URLS);
const INDEX_URL = new URL('./index.html', self.location).href;

self.addEventListener('install', (event) => {
  console.info('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.info('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_VERSION)
          .map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(INDEX_URL))
    );
    return;
  }

  if (!PRECACHE_URL_SET.has(requestUrl.href)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_VERSION).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((networkResponse) => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
