const CACHE_VERSION = 'skylabben-sw-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.info('[ServiceWorker] Install');
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
