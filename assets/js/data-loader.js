/**
 * Datahenting fra JSON-filer
 * 
 * Henter projects.json og meta.json for prosjekter/underprosjekter.
 */

const BASE_URL = '/projects/';

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
 * Henter meta.json for et prosjekt/underprosjekt
 * @param {string} path - Prosjektpath (f.eks. "project1" eller "project1/sub-a")
 * @returns {Promise<ProjectMeta>} Prosjektmetadata
 */
export async function loadProjectMeta(path) {
  const url = `${BASE_URL}${path}/meta.json`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Kunne ikke laste meta.json for ${path}:`, error);
    throw error;
  }
}

/**
 * Henter projects.json
 * @returns {Promise<Array<{id: string, name: string, path: string, hidden?: boolean}>>} Liste over prosjekter
 */
export async function loadProjects() {
  try {
    const response = await fetch('/projects.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Kunne ikke laste projects.json:', error);
    throw error;
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
