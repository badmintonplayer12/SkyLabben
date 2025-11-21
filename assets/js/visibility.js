const MODE_KEY = 'legoInstructions.mode';
const OVERRIDES_KEY = 'legoInstructions.visibilityOverrides';

/**
 * Henter modus (child|parent) fra localStorage, default child
 * @returns {'child'|'parent'}
 */
export function getMode() {
  try {
    const stored = localStorage.getItem(MODE_KEY);
    return stored === 'parent' ? 'parent' : 'child';
  } catch (e) {
    return 'child';
  }
}

/**
 * Setter modus i localStorage
 * @param {'child'|'parent'} mode
 */
export function setMode(mode) {
  try {
    localStorage.setItem(MODE_KEY, mode === 'parent' ? 'parent' : 'child');
  } catch (e) {
    console.warn('Kunne ikke lagre modus:', e);
  }
}

/**
 * Henter overrides for synlighet fra localStorage
 * @returns {Record<string, 'visible'|'hidden'>}
 */
export function getOverrides() {
  try {
    const stored = localStorage.getItem(OVERRIDES_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
    return {};
  } catch (e) {
    console.warn('Kunne ikke lese overrides:', e);
    return {};
  }
}

/**
 * Setter eller fjerner override for en gitt nøkkel
 * @param {string|null} key
 * @param {'visible'|'hidden'|null} value
 * @returns {Record<string, 'visible'|'hidden'>} Oppdatert overrides
 */
export function setOverride(key, value) {
  if (!key) {
    return getOverrides();
  }
  const overrides = getOverrides();
  if (value === null || value === undefined) {
    delete overrides[key];
  } else {
    overrides[key] = value === 'hidden' ? 'hidden' : 'visible';
  }
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  } catch (e) {
    console.warn('Kunne ikke lagre overrides:', e);
  }
  return overrides;
}

/**
 * Lager override-nøkkel for prosjekt/child
 * @param {Object} params
 * @param {string} params.projectId
 * @param {string} [params.childId]
 * @returns {string|null}
 */
export function getOverrideKey({ projectId, childId }) {
  if (!projectId) return null;
  return childId
    ? `project:${projectId}:child:${childId}`
    : `project:${projectId}`;
}

/**
 * Pure synlighetsfunksjon for barnemodus
 * Prioritet: override → approvedByDefault (default true) → ignorér releaseAt (forberedt)
 * @param {Object} project - Prosjekt/child-objekt (minimum id, approvedByDefault?, releaseAt?)
 * @param {Record<string, 'visible'|'hidden'>} overrides
 * @param {Date} [now] - Ikke brukt ennå (forberedt for releaseAt)
 * @returns {boolean}
 */
export function isVisibleForKidsNow(project, overrides = {}, now = new Date()) {
  const key = getOverrideKey({ projectId: project?.id, childId: project?.childId });
  const overrideValue = key ? overrides[key] : undefined;
  if (overrideValue === 'visible') return true;
  if (overrideValue === 'hidden') return false;

  // For fremtidig bruk: releaseAt kan parsers, men brukes ikke nå
  // const releaseAt = project?.releaseAt ? new Date(project.releaseAt) : null;
  // if (releaseAt && releaseAt instanceof Date && !isNaN(releaseAt)) { ... }

  const approved = project?.approvedByDefault;
  return approved === false ? false : true;
}

/**
 * Velger et enkelt matte-spørsmål for voksen-sjekk
 * @returns {{question: string, answer: number}}
 */
export function getRandomAdultChallenge() {
  const challenges = [
    { question: 'Bare for voksne. Hva er 8 + 5?', answer: 13 },
    { question: 'Bare for voksne. Hva er 14 - 7?', answer: 7 },
    { question: 'Bare for voksne. Hva er 6 + 9?', answer: 15 },
    { question: 'Bare for voksne. Hva er 12 - 4?', answer: 8 }
  ];
  return challenges[Math.floor(Math.random() * challenges.length)];
}
