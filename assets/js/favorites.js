/**
 * Favoritt-håndtering lagret i localStorage.
 */

const FAVORITES_KEY = 'legoInstructions.favoriteProjects';

function readFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Kunne ikke lese favoritter fra localStorage:', error);
    return [];
  }
}

function writeFavorites(list) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  } catch (error) {
    console.warn('Kunne ikke lagre favoritter til localStorage:', error);
  }
}

export function getFavoriteProjects() {
  return readFavorites();
}

export function isFavoriteProject(path) {
  const favorites = readFavorites();
  return favorites.includes(path);
}

export function toggleFavoriteProject(path) {
  const favorites = new Set(readFavorites());
  if (favorites.has(path)) {
    favorites.delete(path);
  } else {
    favorites.add(path);
  }
  const list = Array.from(favorites);
  writeFavorites(list);
  return list;
}
