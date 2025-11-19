/**
 * Datahenting fra JSON-filer
 * 
 * Henter projects.json og meta.json for prosjekter/underprosjekter.
 */

const resolvedBase = window.__APP_BASE_URL__ || window.location.href.split('#')[0];
const APP_BASE_URL = new URL('.', resolvedBase).href; // peker til katalogen som index.html ligger i
const PROJECTS_JSON_URL = new URL('./projects.json', APP_BASE_URL).href;
const BASE_URL = new URL('./projects/', APP_BASE_URL).href;
const CACHE_VERSION = '1.0'; // Øk dette når cache-struktur endres
const META_CACHE_KEY = 'legoInstructions.metaCache';
const PROJECTS_CACHE_KEY = 'legoInstructions.projectsCache';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 timer

/**
 * ProjectMeta struktur (fra meta.json)
 * @typedef {Object} ProjectMeta
 * @property {string} id
 * @property {string} name
 * @property {string} [coverImage]
 * @property {string[]} steps
 * @property {Array<{id: string, name: string, path: string, hidden?: boolean}>} children
 */

/**
 * Henter cached metadata hvis den finnes og ikke er utløpt
 * @param {string} key - Cache key
 * @returns {Object|null} Cached data eller null
 */
function getCachedData(key) {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const parsed = JSON.parse(cached);
    if (parsed.version !== CACHE_VERSION) return null;
    if (Date.now() > parsed.expiry) return null;
    
    return parsed.data;
  } catch (e) {
    return null;
  }
}

/**
 * Lagrer data i cache med utløpstid
 * @param {string} key - Cache key
 * @param {*} data - Data å lagre
 */
function setCachedData(key, data) {
  try {
    const cacheEntry = {
      version: CACHE_VERSION,
      expiry: Date.now() + CACHE_EXPIRY_MS,
      data: data
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
  } catch (e) {
    // Hvis localStorage er full, prøv å rydde gamle entries
    console.warn('Kunne ikke lagre i cache, localStorage kan være full:', e);
  }
}

/**
 * Henter meta.json for et prosjekt/underprosjekt med caching
 * @param {string} path - Prosjektpath (f.eks. "project1" eller "project1/sub-a")
 * @returns {Promise<ProjectMeta>} Prosjektmetadata
 */
export async function loadProjectMeta(path) {
  const cacheKey = `${META_CACHE_KEY}.${path}`;
  
  // Sjekk cache først
  const cached = getCachedData(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Hent fra server
  const url = `${BASE_URL}${path}/meta.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Lagre i cache
    setCachedData(cacheKey, data);
    
    return data;
  } catch (error) {
    console.error(`Kunne ikke laste meta.json for ${path}:`, error);
    throw error;
  }
}

/**
 * Henter projects.json med caching
 * @returns {Promise<Array<{id: string, name: string, path: string, hidden?: boolean}>>} Liste over prosjekter
 */
export async function loadProjects() {
  // Sjekk cache først
  const cached = getCachedData(PROJECTS_CACHE_KEY);
  if (cached) {
    return cached;
  }
  
  // Hent fra server
  try {
    const response = await fetch(PROJECTS_JSON_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Lagre i cache
    setCachedData(PROJECTS_CACHE_KEY, data);
    
    return data;
  } catch (error) {
    console.error('Kunne ikke laste projects.json:', error);
    throw error;
  }
}

/**
 * Rydder cache (nyttig for debugging eller ved oppdateringer)
 */
export function clearCache() {
  try {
    // Rydd alle cache-entries
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(META_CACHE_KEY) || key === PROJECTS_CACHE_KEY) {
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.error('Kunne ikke rydde cache:', e);
  }
}

/**
 * Bygger URL til et bilde
 * @param {string} path - Prosjektpath
 * @param {string} imageName - Filnavn på bildet
 * @returns {string} Full URL til bildet
 */
export function getImageUrl(path, imageName) {
  return `${BASE_URL}${path}/${imageName}`;
}

/**
 * Bygger URL til en lydfil (for steg-hjelp)
 * @param {string} path - Prosjektpath
 * @param {string} audioName - Filnavn på lydfil (kan ligge i /audio/)
 * @returns {string} Full URL til lydfilen
 */
export function getAudioUrl(path, audioName) {
  return `${BASE_URL}${path}/${audioName}`;
}

/**
 * Trekker ut steg-nummer fra filnavn for sortering
 * @param {string} filename - Filnavn (f.eks. "1_1x.png", "174_1x.png")
 * @returns {number|null} Steg-nummer eller null hvis ikke funnet
 */
export function extractStepNumber(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
