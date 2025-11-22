// CACHE_VERSION oppdateres av scripts/update-version.js
const CACHE_VERSION = '2025-11-22+175514-ad5be52';

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
  './assets/js/dialog.js',
  './assets/js/share.js',
  './assets/js/pwa-install.js',
  './assets/js/visibility.js',
  './assets/js/parent-quiz.js',
  './assets/js/version.js',
  './assets/js/offline-status.js',
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

const PROJECT_ASSETS = [
  './projects.json',
  './projects/huset-vaart/meta.json',
  './projects/huset-vaart/cover.png'
];

const PRECACHE_URLS = [...PRECACHE_PATHS, ...ANIMATION_ASSETS, ...PROJECT_ASSETS].map((path) => new URL(path, self.location).href);
const PRECACHE_URL_SET = new Set(PRECACHE_URLS);
const INDEX_URL = new URL('./index.html', self.location).href;

// Cache-navn for forskjellige typer ressurser
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE_AUTO = `${CACHE_VERSION}-images-auto`;
const IMAGE_CACHE_USER = `${CACHE_VERSION}-images-user`;
const JSON_CACHE_AUTO = `${CACHE_VERSION}-json-auto`;
const JSON_CACHE_USER = `${CACHE_VERSION}-json-user`;
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

function isAnimationRequest(url) {
  return url.includes('/assets/animations/') && /\.json(\?|$)/i.test(url);
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

const pinnedProjects = new Set();
let offlineAllEnabled = false;

function normalizeProjectPath(path) {
  if (!path) return null;
  // Strip leading ./ and trailing slashes
  let p = path.replace(/^\.?\/*/, '').replace(/\/+$/, '');
  if (!p.startsWith('projects/')) {
    p = `projects/${p}`;
  }
  return p;
}

function extractProjectKey(urlString) {
  try {
    const u = new URL(urlString);
    const parts = u.pathname.split('/');
    const idx = parts.indexOf('projects');
    if (idx === -1 || idx + 1 >= parts.length) return null;
    return `projects/${parts[idx + 1]}`;
  } catch {
    return null;
  }
}

function isPinned(urlString) {
  if (offlineAllEnabled) return true;
  const key = extractProjectKey(urlString);
  if (!key) return false;
  return pinnedProjects.has(key);
}

async function cacheProjectAssets(projectPath, options = {}) {
  const { cacheImages = true, cacheJson = true } = options;
  const key = normalizeProjectPath(projectPath);
  if (!key) return;
  // Hvis vi allerede er offline: hopp over prefetch nå
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    console.info('[ServiceWorker] Hopper over caching (offline):', key);
    return;
  }

  // Fetch parent meta
  const metaUrl = new URL(`./${key}/meta.json`, self.location).href;
  let meta = null;
  if (cacheJson) {
    try {
      const resp = await fetch(metaUrl);
      if (resp.ok) {
        meta = await resp.clone().json();
        const jsonCache = await caches.open(JSON_CACHE_USER);
        await jsonCache.put(metaUrl, resp.clone());
      }
    } catch (e) {
      console.warn('[ServiceWorker] Klarte ikke cache meta', metaUrl, e);
    }
  } else {
    try {
      const resp = await fetch(metaUrl);
      if (resp.ok) {
        meta = await resp.clone().json();
      }
    } catch (e) {
      // ignore
    }
  }

  // Cache images for parent
  if (cacheImages) {
    const imgCache = await caches.open(IMAGE_CACHE_USER);
    const cover = meta?.coverImage || 'cover.png';
    const coverUrl = new URL(`./${key}/${cover}`, self.location).href;
    try {
      const resp = await fetch(coverUrl);
      if (resp.ok) {
        await imgCache.put(coverUrl, resp.clone());
      }
    } catch (e) {
      console.warn('[ServiceWorker] Klarte ikke cache cover', coverUrl, e);
    }
    const steps = meta?.steps || [];
    for (const step of steps) {
      const stepUrl = new URL(`./${key}/${step}`, self.location).href;
      try {
        const resp = await fetch(stepUrl);
        if (resp.ok) {
          await imgCache.put(stepUrl, resp.clone());
        }
      } catch (e) {
        console.warn('[ServiceWorker] Klarte ikke cache steg', stepUrl, e);
      }
    }
  }

  // Cache children recursively
  const children = meta?.children || [];
  for (const child of children) {
    const childPath = child.path || child.id;
    if (!childPath) continue;
    await cacheProjectAssets(`${key}/${childPath}`, { cacheImages, cacheJson });
  }
}

self.addEventListener('install', (event) => {
  console.info('[ServiceWorker] Install', CACHE_VERSION);
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)),
      caches.open(IMAGE_CACHE_AUTO),
      caches.open(IMAGE_CACHE_USER),
      caches.open(JSON_CACHE_AUTO),
      caches.open(JSON_CACHE_USER),
      caches.open(AUDIO_CACHE)
    ])
  );
});

self.addEventListener('activate', (event) => {
  console.info('[ServiceWorker] Activate', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Slett alle caches som ikke matcher nåværende versjon
      const validCaches = [STATIC_CACHE, IMAGE_CACHE_AUTO, IMAGE_CACHE_USER, JSON_CACHE_AUTO, JSON_CACHE_USER, AUDIO_CACHE];
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
      // Prefetch animasjoner i bakgrunnen
      const staticCache = await caches.open(STATIC_CACHE);
      await Promise.all(
        (ANIMATION_ASSETS || []).map(async (path) => {
          const url = new URL(path, self.location).href;
          const cached = await staticCache.match(url);
          if (cached) return;
          try {
            const resp = await fetch(url);
            if (resp.ok) {
              await staticCache.put(url, resp.clone());
            }
          } catch (e) {
            console.warn('[ServiceWorker] Prefetch animasjon feilet:', url, e);
          }
        })
      );
    })
  );
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data.type === 'PIN_PROJECT') {
    const p = normalizeProjectPath(event.data.path);
    if (p) {
      pinnedProjects.add(p);
      cacheProjectAssets(p).catch(() => {});
    }
  }
  if (event.data.type === 'PIN_ALL') {
    const list = Array.isArray(event.data.paths) ? event.data.paths : [];
    list.forEach((p) => {
      const key = normalizeProjectPath(p);
      if (key) pinnedProjects.add(key);
    });
    list.forEach((p) => cacheProjectAssets(p).catch(() => {}));
  }
  if (event.data.type === 'SET_OFFLINE_ALL') {
    offlineAllEnabled = Boolean(event.data.enabled);
    const list = Array.isArray(event.data.paths) ? event.data.paths : [];
    if (offlineAllEnabled) {
      list.forEach((p) => {
        const key = normalizeProjectPath(p);
        if (key) pinnedProjects.add(key);
      });
      list.forEach((p) => cacheProjectAssets(p).catch(() => {}));
    }
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

  // Animasjoner: Cache First (bruk statisk cache)
  if (isAnimationRequest(requestUrl.href)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((resp) => {
            if (resp.ok) {
              cache.put(request, resp.clone());
            }
            return resp;
          }).catch(() => cached || new Response('Animajson ikke tilgjengelig', { status: 404 }));
        });
      })
    );
    return;
  }

  // Bilder: Cache First, men med pinned/auto-splitt
  if (isImageRequest(requestUrl.href) && isProjectResource(requestUrl.href)) {
    const pinned = isPinned(requestUrl.href);
    const targetCacheName = pinned ? IMAGE_CACHE_USER : IMAGE_CACHE_AUTO;
    event.respondWith(
      caches.open(targetCacheName).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            // Cache kun hvis responsen er OK
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone()).then(() => {
                if (!pinned) {
                  enforceCacheQuota(cache, MAX_IMAGE_CACHE_SIZE).catch(err => {
                    console.warn('[ServiceWorker] Kunne ikke håndtere cache-quota:', err);
                  });
                }
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

  // JSON-data: Pinned → cache-first i USER; ellers auto (network-first med fallback)
  if (isJsonRequest(requestUrl.href) && isProjectResource(requestUrl.href)) {
    const pinned = isPinned(requestUrl.href);
    if (pinned) {
      event.respondWith(
        caches.open(JSON_CACHE_USER).then((cache) => {
          return cache.match(request).then((cached) => {
            if (cached) return cached;
            return fetch(request).then((resp) => {
              if (resp.ok) {
                cache.put(request, resp.clone());
              }
              return resp;
            }).catch((error) => {
              console.warn('[ServiceWorker] Nettverk feilet (pinned), prøver cache:', requestUrl.href, error);
              return cache.match(request).then((fallback) => fallback || new Response('JSON-data ikke tilgjengelig', { status: 503 }));
            });
          });
        })
      );
    } else {
      event.respondWith(
        caches.open(JSON_CACHE_AUTO).then((cache) => {
          return fetch(request).then((networkResponse) => {
            if (networkResponse.ok) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            console.warn('[ServiceWorker] Nettverk feilet, prøver cache:', requestUrl.href, error);
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return new Response('JSON-data ikke tilgjengelig', { 
                status: 503,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
          });
        })
      );
    }
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
