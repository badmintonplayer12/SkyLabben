/**
 * State management og localStorage-integrasjon
 * 
 * Holder styr på applikasjonens tilstand og synkroniserer progresjon med localStorage.
 */

const STORAGE_KEY = 'legoInstructions.progress';

/**
 * AppState struktur
 * @typedef {Object} AppState
 * @property {string|null} currentPath - Nåværende prosjektpath
 * @property {number} currentStepIndex - Nåværende steg-indeks (0-basert)
 * @property {ProjectMeta|null} currentProjectMeta - Nåværende prosjektmetadata
 */

// Modul-global state
let appState = {
  currentPath: null,
  currentStepIndex: 0,
  currentProjectMeta: null
};

/**
 * Henter nåværende AppState
 * @returns {AppState} Nåværende state
 */
export function getState() {
  return { ...appState }; // Returner kopi
}

/**
 * Oppdaterer AppState
 * @param {Partial<AppState>} updates - Delvis oppdatering av state
 * @returns {AppState} Oppdatert state
 */
export function updateState(updates) {
  appState = { ...appState, ...updates };
  return getState();
}

/**
 * Henter lagret progresjon fra localStorage
 * @returns {Object<string, number>} Kart med path → steg-indeks
 */
export function loadProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error('Kunne ikke lese progresjon fra localStorage:', e);
    return {};
  }
}

/**
 * Lagrer progresjon til localStorage
 * @param {Object<string, number>} progressMap - Kart med path → steg-indeks
 */
export function saveProgress(progressMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progressMap));
  } catch (e) {
    console.error('Kunne ikke lagre progresjon til localStorage:', e);
  }
}

/**
 * Henter siste steg for en path
 * @param {string} path - Prosjektpath
 * @returns {number} Steg-indeks (0 hvis ikke funnet)
 */
export function getLastStepFor(path) {
  const progress = loadProgress();
  return progress[path] ?? 0;
}

/**
 * Setter steg for en path
 * @param {string} path - Prosjektpath
 * @param {number} stepIndex - Steg-indeks
 */
export function setStepFor(path, stepIndex) {
  const progress = loadProgress();
  progress[path] = stepIndex;
  saveProgress(progress);
}

/**
 * Nullstiller progresjon for en spesifikk path
 * @param {string} path - Prosjektpath
 */
export function resetProgressFor(path) {
  const progress = loadProgress();
  delete progress[path];
  saveProgress(progress);
}

/**
 * Nullstiller all progresjon
 */
export function resetAllProgress() {
  saveProgress({});
}
