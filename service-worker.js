// CACHE_VERSION oppdateres av scripts/update-version.js
const CACHE_VERSION = '2025-11-22+012610-f6e6c39';

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
  './assets/js/pwa-install.js',
  './assets/js/visibility.js',
  './assets/js/version.js',
  './assets/js/celebration/index.js',
  './assets/js/celebration/emoji.js',
  './assets/js/celebration/lottie.js',
  './assets/js/celebration/sound.js',
  './assets/js/lottie.min.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

const ANIMATION_ASSETS = [
  './assets/animations/confetti.json',
  './assets/animations/emoji.json',
  './assets/animations/stars.json',
  './assets/animations/stars2.json',
  './assets/animations/stars3.json',
  './assets/animations/celebrate.json'
];

const PRECACHE_URLS = [...PRECACHE_PATHS, ...ANIMATION_ASSETS].map((path) => new URL(path, self.location).href);
const PRECACHE_URL_SET = new Set(PRECACHE_URLS);
const INDEX_URL = new URL('./index.html', self.location).href;

// Cache-navn for forskjellige typer ressurser
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;
const JSON_CACHE = `${CACHE_VERSION}-json`;
const AUDIO_CACHE = `${CACHE_VERSION}-audio`;

// Cache-quota begrensninger (i bytes)
const MAX_IMAGE_CACHE_SIZE = 50 * 1024 * 1024; // 50 MB maks for bilder
const MAX_AUDIO_CACHE_SIZE = 20 * 1024 * 1024; // 20 MB maks for lydfiler

// Hjelpefunksjoner for å identifisere ressurstyper
function isImageRequest(url) {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
}

function isJsonRequest(url) {
  return /\.json(\?|$)/i.test(url);
}

function isAudioRequest(url) {
  return /\.(mp3|wav|ogg|m4a|aac)(\?|$)/i.test(url);
}

function isProjectResource(url) {
  return url.includes('/projects/');
}

/**
 * Beregner størrelsen på en cache
 * @param {Cache} cache - Cache-objektet
 * @returns {Promise<number>} Størrelse i bytes
 */
async function getCacheSize(cache) {
  const keys = await cache.keys();
  let totalSize = 0;
  
  for (const key of keys) {
    const response = await cache.match(key);
    if (response) {
      const blob = await response.blob();
      totalSize += blob.size;
    }
  }
  
  return totalSize;
}

/**
 * Fjerner eldste entries fra cache hvis størrelsen overstiger maks
 * @param {Cache} cache - Cache-objektet
 * @param {number} maxSize - Maksimal størrelse i bytes
 * @returns {Promise<void>}
 */
async function enforceCacheQuota(cache, maxSize) {
  const currentSize = await getCacheSize(cache);
  
  if (currentSize <= maxSize) {
    return; // Cache er innenfor kvoten
  }
  
  // Hent alle keys med timestamp (fra response headers)
  const keys = await cache.keys();
  const entries = [];
  
  for (const key of keys) {
    const response = await cache.match(key);
    if (response) {
      const blob = await response.blob();
      const dateHeader = response.headers.get('date') || response.headers.get('last-modified');
      const timestamp = dateHeader ? new Date(dateHeader).getTime() : Date.now();
      
      entries.push({
        key,
        size: blob.size,
        timestamp
      });
    }
  }
  
  // Sorter etter timestamp (eldste først)
  entries.sort((a, b) => a.timestamp - b.timestamp);
  
  // Fjern entries til vi er under kvoten
  let sizeToRemove = currentSize - maxSize;
  for (const entry of entries) {
    if (sizeToRemove <= 0) {
      break;
    }
    await cache.delete(entry.key);
    sizeToRemove -= entry.size;
  }
  
  console.info(`[ServiceWorker] Cache-quota håndtert. Fjernet ${currentSize - await getCacheSize(cache)} bytes`);
}

self.addEventListener('install', (event) => {
  console.info('[ServiceWorker] Install', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
      caches.open(IMAGE_CACHE),
      caches.open(JSON_CACHE),
      caches.open(AUDIO_CACHE)
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.info('[ServiceWorker] Activate', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Slett alle caches som ikke matcher nåværende versjon
      const validCaches = [STATIC_CACHE, IMAGE_CACHE, JSON_CACHE, AUDIO_CACHE];
      return Promise.all(
        cacheNames
          .filter((cacheName) => !validCaches.includes(cacheName))
          .map((cacheName) => {
            console.info('[ServiceWorker] Sletter gammel cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(async () => {
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach((client) => {
        client.postMessage({ type: 'SW_UPDATE_AVAILABLE' });
      });
    })
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);

  // Navigasjon: Network First med fallback til index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(INDEX_URL))
    );
    return;
  }

  // Statiske ressurser (precached): Cache First
  if (PRECACHE_URL_SET.has(requestUrl.href)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Bilder: Cache First (sjekk cache først, hent fra nettverk hvis ikke funnet)
  if (isImageRequest(requestUrl.href) && isProjectResource(requestUrl.href)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            // Cache kun hvis responsen er OK
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone()).then(() => {
                // Håndter cache-quota etter caching
                enforceCacheQuota(cache, MAX_IMAGE_CACHE_SIZE).catch(err => {
                  console.warn('[ServiceWorker] Kunne ikke håndtere cache-quota:', err);
                });
              });
            }
            return networkResponse;
          }).catch((error) => {
            console.warn('[ServiceWorker] Kunne ikke hente bilde:', requestUrl.href, error);
            // Prøv å hente fra cache igjen hvis nettverk feiler
            return cache.match(request).then((fallbackResponse) => {
              return fallbackResponse || new Response('Bilde ikke tilgjengelig', { status: 404 });
            });
          });
        });
      })
    );
    return;
  }

  // JSON-data: Network First (hent fra nettverk først, fallback til cache)
  if (isJsonRequest(requestUrl.href) && isProjectResource(requestUrl.href)) {
    event.respondWith(
      caches.open(JSON_CACHE).then((cache) => {
        return fetch(request).then((networkResponse) => {
          // Cache kun hvis responsen er OK
          if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch((error) => {
          console.warn('[ServiceWorker] Nettverk feilet, prøver cache:', requestUrl.href, error);
          // Fallback til cache hvis nettverk feiler
          return cache.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Hvis ingen cache, returner feil
            return new Response('JSON-data ikke tilgjengelig', { 
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        });
      })
    );
    return;
  }

  // Lydfiler: Cache First (samme som bilder)
  if (isAudioRequest(requestUrl.href) && isProjectResource(requestUrl.href)) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            // Cache kun hvis responsen er OK
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone()).then(() => {
                // Håndter cache-quota etter caching
                enforceCacheQuota(cache, MAX_AUDIO_CACHE_SIZE).catch(err => {
                  console.warn('[ServiceWorker] Kunne ikke håndtere cache-quota:', err);
                });
              });
            }
            return networkResponse;
          }).catch((error) => {
            console.warn('[ServiceWorker] Kunne ikke hente lydfil:', requestUrl.href, error);
            // Prøv å hente fra cache igjen hvis nettverk feiler
            return cache.match(request).then((fallbackResponse) => {
              return fallbackResponse || new Response('Lydfil ikke tilgjengelig', { status: 404 });
            });
          });
        });
      })
    );
    return;
  }

  // For alle andre requests, la nettleseren håndtere det normalt
});
