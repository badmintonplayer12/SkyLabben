/**
 * Hash-basert routing og URL-parsing
 * 
 * Håndterer hash-fragmenter for navigasjon uten server-side konfigurasjon.
 */

/**
 * Route-objekt struktur
 * @typedef {Object} Route
 * @property {"root"|"project"} type - Type rute
 * @property {string} [path] - Prosjektpath (kun for "project")
 * @property {number} [stepIndex] - Steg-indeks (kun for "project")
 */

/**
 * Initialiserer router
 * @param {function(Route): void} onRouteChange - Callback når rute endres
 */
export function init(onRouteChange) {
  // Legg til hashchange listener
  window.addEventListener('hashchange', () => {
    const route = parseHash(window.location.hash);
    onRouteChange(route);
  });
  
  // Trigger initial route ved oppstart
  const initialRoute = parseHash(window.location.hash);
  onRouteChange(initialRoute);
}

/**
 * Parser hash-fragment til Route-objekt
 * @param {string} hash - Hash-fragment (f.eks. "#/p/project1?step=3")
 * @returns {Route} Route-objekt
 */
export function parseHash(hash) {
  // Fjern # fra starten
  const path = hash.slice(1);
  
  // Hvis tom eller bare "/", returner root
  if (!path || path === '/') {
    return { type: 'root' };
  }
  
  // Parse "/p/project1/sub-a?step=3"
  const match = path.match(/^\/p\/(.+?)(?:\?step=(\d+))?$/);
  if (!match) {
    return { type: 'root' }; // Fallback til root ved ugyldig hash
  }
  
  return {
    type: 'project',
    path: match[1],
    stepIndex: match[2] ? parseInt(match[2], 10) : undefined
  };
}

/**
 * Oppdaterer URL-hash basert på Route
 * @param {Route} route - Route-objekt
 */
export function updateHash(route) {
  if (route.type === 'root') {
    window.location.hash = '#/';
  } else if (route.type === 'project') {
    let hash = `#/p/${route.path}`;
    if (route.stepIndex !== undefined) {
      hash += `?step=${route.stepIndex}`;
    }
    window.location.hash = hash;
  }
}

/**
 * Beregner forelder-path fra en gitt path
 * @param {string|null} path - Prosjektpath (f.eks. "project1/sub-a")
 * @returns {string|null} Forelder-path eller null hvis ingen forelder
 */
export function getParentPath(path) {
  if (!path) return null;
  const parts = path.split('/');
  parts.pop();
  return parts.join('/') || null;
}
