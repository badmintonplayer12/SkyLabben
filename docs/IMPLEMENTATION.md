# Implementasjonsguide

Dette dokumentet beskriver hvordan koden skal implementeres, inkludert funksjonssignaturer, patterns og konvensjoner.

## Hvordan denne guiden skal brukes (for AI)

- Følg funksjonssignaturene og typedefs som fasit; ikke finn opp egne varianter.
- Bruk samme modulansvar som beskrevet (main koordinerer, views bygger DOM, data-loader fetcher).
- Ikke legg til nye globale mønstre (f.eks. nye navngivningskonvensjoner) uten å oppdatere denne filen.
- Når du foreslår endringer på tvers av moduler, sørg for at Implementation.md oppdateres samtidig.
- Bruk klassnavn som matcher [CSS_GUIDELINES.md](./CSS_GUIDELINES.md) - f.eks. `.viewer__header`, ikke `.viewer-header`.
- state.js eksporteres som enkeltfunksjoner, ikke som et state-objekt.

## Generelle prinsipper

### Kode-stil
- Bruk moderne JavaScript (ES6+)
- Bruk `const` og `let`, unngå `var`
- Bruk arrow functions hvor det gir mening
- Bruk template literals for string-interpolasjon
- Hold funksjoner korte og fokuserte (maks 50 linjer per funksjon)

### Modulstruktur
- Hver fil skal være en ES6-modul med `export`
- Bruk named exports, ikke default exports
- Hver modul skal ha et klart ansvar

### Navngiving
- Funksjoner: camelCase (`loadProjectMeta`, `renderViewer`)
- Konstanter: UPPER_SNAKE_CASE (`BASE_URL`, `STORAGE_KEY`)
- Filer: kebab-case (`view-viewer.js`, `data-loader.js`)

## Modul-implementasjoner

### main.js

**Rolle**: Hovedkoordinator som kobler alt sammen. main.js skal **ikke** gjøre egen DOM-rendering - den kaller view-funksjoner fra view-moduler og monterer dem i root-containeren.

**Eksporterte funksjoner**:

```javascript
/**
 * Initialiserer applikasjonen
 * Kalles én gang når siden laster
 */
export function init() {
  // Initialiser router
  // Initialiser state
  // Håndter initial route
}

/**
 * Håndterer ruteendringer
 * @param {Route} route - Route-objekt fra router
 */
export function handleRoute(route) {
  // Basert på route.type:
  // - "root" → last projects.json og render projectGrid
  // - "project" → last meta.json og render viewer
}

```

**Viktig**: main.js skal importere render-funksjoner fra view-modulene, ikke implementere dem selv:

```javascript
import { renderProjectGrid } from './view-project-grid.js';
import { renderViewer } from './view-viewer.js';
```

**Viktig**: main.js eier all state/URL-manipulasjon. Views kaller callbacks som sendes fra main.js, og main.js håndterer alle state-oppdateringer og URL-endringer.

**Eksempel på init()**:

```javascript
import { init as initRouter, parseHash, updateHash, getParentPath } from './router.js';
import { loadProjects } from './data-loader.js';
import { getState, updateState, getLastStepFor } from './state.js';
import { loadProjectMeta } from './data-loader.js';
import { renderProjectGrid } from './view-project-grid.js';
import { renderViewer } from './view-viewer.js';

export function init() {
  // Initialiser router
  initRouter((route) => {
    handleRoute(route);
  });
  
  // Håndter initial route
  const initialRoute = parseHash(window.location.hash);
  handleRoute(initialRoute);
}
```

**Eksempel på handleRoute() - hel flyt**:

```javascript
export async function handleRoute(route) {
  const root = document.getElementById('app');
  root.innerHTML = '';

  if (route.type === 'root') {
    // Last prosjekter og render galleri
    const projects = await loadProjects();
    const grid = renderProjectGrid(projects, (path) => {
      updateHash({ type: 'project', path });
    });
    root.appendChild(grid);
  } else if (route.type === 'project') {
    // Last prosjektmetadata
    const meta = await loadProjectMeta(route.path);
    const lastStep = route.stepIndex ?? getLastStepFor(route.path);
    
    // Oppdater state
    updateState({
      currentPath: route.path,
      currentStepIndex: lastStep,
      currentProjectMeta: meta
    });
    
    // Render viewer med callbacks
    const viewer = renderViewer(getState(), {
      onPrevStep: () => {
        const state = getState();
        const newIndex = Math.max(0, state.currentStepIndex - 1);
        updateState({ currentStepIndex: newIndex });
        updateHash({ type: 'project', path: state.currentPath, stepIndex: newIndex });
      },
      onNextStep: () => {
        const state = getState();
        const maxIndex = (state.currentProjectMeta?.steps.length || 1) - 1;
        const newIndex = Math.min(maxIndex, state.currentStepIndex + 1);
        updateState({ currentStepIndex: newIndex });
        updateHash({ type: 'project', path: state.currentPath, stepIndex: newIndex });
      },
      onStepChange: (stepIndex) => {
        updateState({ currentStepIndex: stepIndex });
        const { currentPath } = getState();
        updateHash({ type: 'project', path: currentPath, stepIndex });
      },
      onGoUp: () => {
        const { currentPath } = getState();
        const parentPath = getParentPath(currentPath);
        if (parentPath) {
          updateHash({ type: 'project', path: parentPath });
        } else {
          updateHash({ type: 'root' });
        }
      }
    });
    root.appendChild(viewer);
  }
}
```

### router.js

**Rolle**: Hash-basert routing og URL-parsing

**Eksporterte funksjoner**:

```javascript
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
  // Kall onRouteChange ved endringer
}

/**
 * Parser hash-fragment til Route-objekt
 * @param {string} hash - Hash-fragment (f.eks. "#/p/project1?step=3")
 * @returns {Route} Route-objekt
 */
export function parseHash(hash) {
  // Parse hash til Route-objekt
  // Returner { type: "root" } eller { type: "project", path: "...", stepIndex: ... }
}

/**
 * Oppdaterer URL-hash basert på Route
 * @param {Route} route - Route-objekt
 */
export function updateHash(route) {
  // Bygg hash-string fra Route
  // Oppdater window.location.hash
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
```

**Eksempel på parseHash()**:

```javascript
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
```

### state.js

**Rolle**: State management og localStorage-integrasjon

**Viktig**: state.js inneholder ett modul-globalt `let appState`-objekt. `updateState()` muterer dette og returnerer den nye staten. Eventuell re-render styres av main.js.
- Modus/overrides for barn/forelder håndteres i egen modul (`visibility.js`); state.js holder kun progresjon og runtime-state for viewer.

**Eksporterte funksjoner**:

```javascript
/**
 * AppState struktur
 * @typedef {Object} AppState
 * @property {string|null} currentPath - Nåværende prosjektpath
 * @property {number} currentStepIndex - Nåværende steg-indeks (0-basert)
 * @property {ProjectMeta|null} currentProjectMeta - Nåværende prosjektmetadata
 */

/**
 * Henter nåværende AppState
 * @returns {AppState} Nåværende state
 */
export function getState() {
  // Returner nåværende AppState
}

/**
 * Oppdaterer AppState
 * @param {Partial<AppState>} updates - Delvis oppdatering av state
 */
export function updateState(updates) {
  // Oppdater state
  // Trigger event eller callback hvis nødvendig
}

/**
 * Henter lagret progresjon fra localStorage
 * @returns {Object<string, number>} Kart med path → steg-indeks
 */
export function loadProgress() {
  // Les fra localStorage
  // Returner objekt eller tomt objekt hvis ikke funnet
}

/**
 * Lagrer progresjon til localStorage
 * @param {Object<string, number>} progressMap - Kart med path → steg-indeks
 */
export function saveProgress(progressMap) {
  // Lagre til localStorage
}

/**
 * Henter siste steg for en path
 * @param {string} path - Prosjektpath
 * @returns {number} Steg-indeks (0 hvis ikke funnet)
 */
export function getLastStepFor(path) {
  // Hent fra localStorage
  // Returner 0 hvis ikke funnet
}

/**
 * Setter steg for en path
 * @param {string} path - Prosjektpath
 * @param {number} stepIndex - Steg-indeks
 */
export function setStepFor(path, stepIndex) {
  // Hent eksisterende progresjon
  // Oppdater for denne path
  // Lagre tilbake til localStorage
}
```

**Eksempel på state.js struktur**:

```javascript
const STORAGE_KEY = 'legoInstructions.progress';

// Modul-global state
let appState = {
  currentPath: null,
  currentStepIndex: 0,
  currentProjectMeta: null
};

export function getState() {
  return { ...appState }; // Returner kopi
}

export function updateState(updates) {
  appState = { ...appState, ...updates };
  return getState();
}

export function loadProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    console.error('Kunne ikke lese progresjon fra localStorage:', e);
    return {};
  }
}
```

### data-loader.js

**Rolle**: Datahenting fra JSON-filer

**Eksporterte funksjoner**:

```javascript
/**
 * ProjectMeta struktur (fra meta.json)
 * @typedef {Object} ProjectMeta
 * @property {string} id
 * @property {string} name
 * @property {string} coverImage
 * @property {string[]} steps
 * @property {Array<{id: string, name: string, path: string}>} children
 * @property {boolean} [approvedByDefault] - default true hvis mangler
 * @property {string} [releaseAt] - ISO UTC, ignorert nå
 */

/**
 * Henter meta.json for et prosjekt/underprosjekt
 * @param {string} path - Prosjektpath (f.eks. "project1" eller "project1/sub-a")
 * @returns {Promise<ProjectMeta>} Prosjektmetadata
 */
export async function loadProjectMeta(path) {
  // Bygg URL: /projects/{path}/meta.json
  // Fetch og parse JSON
  // Returner ProjectMeta
}

/**
 * Henter projects.json
 * @returns {Promise<Array<{id: string, name: string, path: string}>>} Liste over prosjekter
 */
export async function loadProjects() {
  // Fetch /projects.json
  // Parse JSON
  // Returner array
}

/**
 * Bygger URL til et bilde
 * @param {string} path - Prosjektpath
 * @param {string} imageName - Filnavn på bildet
 * @returns {string} Full URL til bildet
 */
export function getImageUrl(path, imageName) {
  // Returner /projects/{path}/{imageName}
}

/**
 * Bygger URL til en lydfil (for steg-hjelp)
 * @param {string} path - Prosjektpath
 * @param {string} audioName - Filnavn på lydfil (kan ligge i /audio/)
 * @returns {string} Full URL til lydfilen
 */
export function getAudioUrl(path, audioName) {
  // Returner /projects/{path}/{audioName}
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
```

**Eksempel på loadProjectMeta()**:

```javascript
const BASE_URL = '/projects/';

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

export function getImageUrl(path, imageName) {
  return `${BASE_URL}${path}/${imageName}`;
}

export function getAudioUrl(path, audioName) {
  return `${BASE_URL}${path}/${audioName}`;
}

export function extractStepNumber(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}
```

### view-project-grid.js

**Rolle**: Prosjektgalleri-view

  - **Onboarding**: Ved første besøk skal viewet kunne tegne et lett gjennomskinnelig overlay (maskot/piler) som peker på første tile med tekstfri “trykk her”-indikasjon. Overlegget forsvinner straks barnet trykker, og en flaggverdi lagres i localStorage slik at overlayet ikke vises hver gang.
  - **Underprosjekter inline**: Hvis et prosjekt har `children` og “barnemodus”-flagget (lagret i state/localStorage) er aktivt, kan viewet vise child-tiles direkte under hovedtile i stedet for å navigere opp/ned. Klikk på child kaller fortsatt `onProjectClick` med full path.
  - **Søk og filtrering**: Viser søkefelt og kategoriknapper (basert på `category`-feltet) samt en egen knapp for å vise kun favoritter.
  - **Favoritter**: Hvert prosjekt har en stjerneknapp som toggler favorittstatus i `favorites.js`/localStorage. Favorittfilteret bruker denne listen.

**Eksporterte funksjoner**:

```javascript
/**
 * Renderer prosjektgalleri
   * @param {Array<{id: string, name: string, path: string, category?: string}>} projects - Liste over prosjekter
 * @param {function(string): void} onProjectClick - Callback når prosjekt klikkes (tar path)
 * @returns {HTMLElement} Container-element med galleri
 * 
 * Viktig: View gjør IKKE direkte state/URL-oppdateringer. Den kaller onProjectClick callback
 * som sendes fra main.js, og main.js håndterer state/URL-oppdateringer.
 */
export function renderProjectGrid(projects, onProjectClick) {
  // Opprett container
  // For hvert prosjekt: opprett tile med cover-bilde og navn
  // Legg til event listeners som kaller onProjectClick callback
  // Returner container
}
```

**Eksempel på renderProjectGrid()**:

```javascript
import { getImageUrl } from './data-loader.js';

export function renderProjectGrid(projects, onProjectClick) {
  const container = document.createElement('div');
  container.className = 'project-grid';
  
  // Filtrer bort skjulte prosjekter
  const visibleProjects = projects.filter(project => !project.hidden);
  
  visibleProjects.forEach(project => {
    const tile = document.createElement('div');
    tile.className = 'project-tile';
    tile.setAttribute('data-path', project.path);
    
    // Cover-bilde
    const img = document.createElement('img');
    img.className = 'project-tile__image';
    img.src = getImageUrl(project.path, 'cover.png');
    img.alt = project.name;
    img.onerror = () => {
      // Fallback til første bilde hvis cover.png ikke finnes
      img.src = getImageUrl(project.path, '1_1x.png');
    };
    
    // Navn
    const name = document.createElement('div');
    name.className = 'project-tile__name';
    name.textContent = project.name;
    
    tile.appendChild(img);
    tile.appendChild(name);
    
    // Event listener
    tile.addEventListener('click', () => {
      onProjectClick(project.path);
    });
    
    container.appendChild(tile);
  });
  
  return container;
}
```

### view-viewer.js

**Rolle**: Instruksjonsviewer-view

- **Lyd/haptikk**:
  - Eksponer et høyttaler-ikon for å skru av/på korte navigasjonslyder (lagres i localStorage).
  - Alle piltaster/knapper kan trigge `callbacks.onFeedback?.('next')`/`('prev')` slik at main.js kan spille lyd eller trigge haptikk på støttede enheter.
  - Hvis prosjektene leverer egne lydhint (f.eks. `meta.audioSteps`), vis en knapp i header/bunn som spiller av hjelpetekst.
- **Loading-indikator**: Mens nytt bilde lastes skal `.viewer__main` vise en LEGO-kloss-/spinner-animajson, og knapper deaktiveres til bildet er klart.
- **Fullføringsbelønning**: Når `currentStepIndex === steps.length - 1` og barnet går videre, vis en gratulasjonsstate (konfetti-animajson + badge) og kall `callbacks.onProjectCompleted?.(state.currentPath)` slik at hovedlogikk kan markere prosjektet som ferdig.
- **Underprosjektfallback**: Dersom et prosjekt mangler `steps` men har `children`, renderer viewer en child-liste med samme ikonografi som galleriet i stedet for en tom melding.
- **Sekundære kontroller via innstillingsmeny**:
  - `viewer__bottom` har en egen knapp (`.viewer__settings`) som åpner en liten meny over verktøylinjen.
  - Menyen inneholder globale handlinger som ikke brukes i hvert steg: skru av/på navigasjonslyd, vis QR-kode, fullskjerm og nullstill progresjonen.
  - `createSettingsMenu()` i `view-viewer.js` kapsler logikken: den returnerer `{ wrapper, hasItems, addItem, cleanup }`. `addItem` tar `icon`, `label`, `onClick` + valgfrie `getIcon/getLabel` for dynamisk tekst, og returnerer et objekt med `refresh()` som kan kalles når tilstanden endres (f.eks. for lyd/fullskjerm).
  - Menyen må kunne lukkes med Escape, etter valg og ved klikk utenfor, og knappen skal være deaktivert dersom ingen elementer ble registrert.
  - Steg-spesifikke lydhint (`audioSteps`) forblir en egen knapp fordi den bare vises når prosjektet har lydfiler for gjeldende steg.
  - Fullskjerm-aksjonen bruker `container.requestFullscreen()` / `document.exitFullscreen()` og oppdaterer ikon/label via `fullscreenchange`.

- **Layoutkrav**:
  - `.viewer__main` skal fylle all ledig høyde (`flex: 1`) og la bildet skaleres med `object-fit: contain` slik at det alltid er maks mulig størrelse uten scroll.
  - Standard-zoom i nettleser skal fungere (ikke deaktiver `pointer-events` eller `user-select` på bildet). Eventuell fremtidig custom zoom skjer via `transform: scale()` direkte på IMG.
  - Navigasjonsfeltet (`.viewer__bottom`) skal ligge helt nederst, bruke fleksibel grid/flex og inneholde store tap-targets for barn (sikte på ~64px høyde for knapper).
  - Neste/forrige er primære kontroller; progressbaren er sekundær og må håndtere både tap og drag, men UI skal ikke kreve presis drag for bruk.
  - Stegindikator bør bruke tallformat (`3/10`) og/eller ikoner i stedet for tekst (“Steg 3 av 10”) slik at målgruppen (5–7 år) forstår den uten å lese.
  - Opp/hjem-knapp representeres som ikon (hus/pil opp) og plasseres konsekvent (typisk øverst til venstre) slik at barna kjenner den igjen.

**Eksporterte funksjoner**:

```javascript
/**
 * Renderer instruksjonsviewer
 * @param {AppState} state - Nåværende applikasjonsstate
 * @param {Object} callbacks - Callback-funksjoner fra main.js
 * @param {function(): void} callbacks.onPrevStep - Kalles når forrige steg klikkes
 * @param {function(): void} callbacks.onNextStep - Kalles når neste steg klikkes
 * @param {function(number): void} callbacks.onStepChange - Kalles når steg endres (tar stepIndex)
 * @param {function(): void} callbacks.onGoUp - Kalles når "Opp"-knapp klikkes
 * @returns {HTMLElement} Container-element med viewer
 * 
 * Viktig: View gjør IKKE direkte state/URL-oppdateringer. Den kaller callbacks som sendes
 * fra main.js, og main.js eier all state/URL-manipulasjon. Hvis steps-array er tomt,
 * vis "Ingen steg tilgjengelig" og deaktiver navigasjonskontroller.
 * Filtrer bort children med hidden: true når children-liste vises.
 */
export function renderViewer(state, callbacks) {
  // Håndter tom steps-array: vis melding og deaktiver kontroller
  // Filtrer bort skjulte children: const visibleChildren = (state.currentProjectMeta?.children || []).filter(c => !c.hidden)
  // Opprett container med header, image container og bottom bar
  // Vis nåværende bilde (hvis steps ikke er tom) eller children-liste (hvis steps er tom)
  // Legg til kontroller (piler, progresjonslinje, opp-knapp)
  // Legg til event listeners som kaller callbacks
  // Returner container
}
```

**Eksempel på renderViewer() struktur**:

```javascript
import { getImageUrl } from './data-loader.js';

export function renderViewer(state, callbacks) {
  const container = document.createElement('div');
  container.className = 'viewer';
  
  // Header (valgfritt)
  const header = document.createElement('div');
  header.className = 'viewer__header';
  header.textContent = state.currentProjectMeta?.name || '';
  
  // Image container
  const imageContainer = document.createElement('div');
  imageContainer.className = 'viewer__main';
  
  // Håndter tom steps-array
  const steps = state.currentProjectMeta?.steps || [];
  if (steps.length === 0) {
    const message = document.createElement('div');
    message.className = 'viewer__empty-message';
    message.textContent = 'Ingen steg tilgjengelig';
    imageContainer.appendChild(message);
  } else {
    // Bilde-rendering: Bildet skal fylle tilgjengelig plass innenfor viewport
    // - Container (.viewer__main) bruker flex: 1 for å fylle resten av høyden
    // - Bottom bar har fast høyde, så hovedbildet får all tilgjengelig plass
    // - Bildet skal være zoombart via standard nettleser-mekanismer (Ctrl/Cmd +, Ctrl/Cmd -)
    // - IKKE bruk pointer-events: none på bildet (blokkerer browser zoom)
    // - Hvis custom zoom skal implementeres senere: bruk transform: scale() på bildet,
    //   ikke endre container-størrelse (behold flex-layout for responsivitet)
    const img = document.createElement('img');
    const currentStep = steps[state.currentStepIndex];
    if (currentStep) {
      img.src = getImageUrl(state.currentPath, currentStep);
      img.alt = `Steg ${state.currentStepIndex + 1}`;
    }
    imageContainer.appendChild(img);
  }
  
  // Bottom bar: Har fast høyde slik at hovedbildet alltid kan bruke resten av høyden
  const bottomBar = document.createElement('div');
  bottomBar.className = 'viewer__bottom';
  
  // Opp-knapp
  const upButton = document.createElement('button');
  upButton.className = 'viewer__button';
  upButton.textContent = 'Opp';
  upButton.addEventListener('click', callbacks.onGoUp);
  
  // Pil-knapper (deaktiver hvis ingen steg)
  const prevButton = document.createElement('button');
  prevButton.className = 'viewer__button';
  prevButton.textContent = '←';
  prevButton.disabled = steps.length === 0 || state.currentStepIndex === 0;
  if (steps.length > 0) {
    prevButton.addEventListener('click', callbacks.onPrevStep);
  }
  
  const nextButton = document.createElement('button');
  nextButton.className = 'viewer__button';
  nextButton.textContent = '→';
  nextButton.disabled = steps.length === 0 || state.currentStepIndex === (steps.length - 1);
  if (steps.length > 0) {
    nextButton.addEventListener('click', callbacks.onNextStep);
  }
  
  // Progresjonslinje (skjul hvis ingen steg)
  const progressBar = document.createElement('input');
  progressBar.className = 'viewer__progress';
  progressBar.type = 'range';
  progressBar.min = 0;
  progressBar.max = Math.max(0, steps.length - 1);
  progressBar.value = state.currentStepIndex;
  progressBar.disabled = steps.length === 0;
  if (steps.length > 0) {
    progressBar.addEventListener('input', (e) => {
      callbacks.onStepChange(parseInt(e.target.value, 10));
    });
  }
  
  // Steg-indikator
  const stepIndicator = document.createElement('div');
  stepIndicator.className = 'viewer__step-indicator';
  stepIndicator.textContent = steps.length === 0 
    ? 'Ingen steg tilgjengelig'
    : `Steg ${state.currentStepIndex + 1} av ${steps.length}`;
  
  bottomBar.appendChild(upButton);
  bottomBar.appendChild(prevButton);
  bottomBar.appendChild(progressBar);
  bottomBar.appendChild(nextButton);
  bottomBar.appendChild(stepIndicator);
  
  container.appendChild(header);
  container.appendChild(imageContainer);
  container.appendChild(bottomBar);
  
  return container;
}
```

## Error handling

### Prinsipper

1. **Graceful degradation**: Applikasjonen skal ikke krasje ved feil
2. **Brukervennlige meldinger**: Vis forståelige feilmeldinger
3. **Logging**: Log feil til konsollen for debugging

### Error handling-patterns

```javascript
// Ved datahenting
try {
  const meta = await loadProjectMeta(path);
  // Bruk meta
} catch (error) {
  console.error('Kunne ikke laste prosjekt:', error);
  // Vis feilmelding til bruker
  showError('Kunne ikke laste prosjekt. Prøv igjen senere.');
}

// Ved bildevisning
img.onerror = () => {
  console.error('Kunne ikke laste bilde:', img.src);
  // Vis fallback eller feilmelding
  img.src = '/assets/placeholder.png';
};

// Ved localStorage
try {
  localStorage.setItem(key, value);
} catch (e) {
  console.warn('Kunne ikke lagre til localStorage:', e);
  // Fortsett uten lagring
}
```

## Event handling

### Pattern for event listeners

```javascript
// Legg til event listener
element.addEventListener('click', handleClick);

// Fjern event listener (hvis nødvendig)
element.removeEventListener('click', handleClick);

// Event delegation (hvis dynamisk innhold)
container.addEventListener('click', (e) => {
  if (e.target.matches('.project-tile')) {
    handleProjectClick(e.target);
  }
});
```

### Callback-pattern

```javascript
import { getState, updateState } from './state.js';
import { updateHash } from './router.js';

// Definer callback-interface
const callbacks = {
  onProjectClick: (path) => {
    updateState({ currentPath: path });
    updateHash({ type: 'project', path });
  },
  onStepChange: (stepIndex) => {
    updateState({ currentStepIndex: stepIndex });
    const { currentPath } = getState();
    updateHash({ 
      type: 'project', 
      path: currentPath,
      stepIndex 
    });
  }
};

// Pass til view
const view = renderViewer(getState(), callbacks);
```

## DOM-manipulering

### Pattern for rendering

```javascript
// Opprett element
const element = document.createElement('div');
element.className = 'my-class';

// Sett attributter
element.setAttribute('data-id', id);
element.id = 'unique-id';

// Legg til innhold
element.textContent = 'Tekst';
element.innerHTML = '<span>HTML</span>'; // Bruk forsiktig

// Legg til child
parent.appendChild(child);

// Erstatt innhold
container.innerHTML = ''; // Tøm
container.appendChild(newContent); // Legg til nytt
```

### Oppdatering av eksisterende views

**Merk**: Følgende er valgfrie patterns som kan brukes ved behov, men er ikke krav i første versjon.

```javascript
import { getImageUrl } from './data-loader.js';

// I stedet for å re-rendere hele view, oppdater kun det som endres
function updateViewerImage(state) {
  const img = document.querySelector('.viewer__main img');
  const step = state.currentProjectMeta.steps[state.currentStepIndex];
  img.src = getImageUrl(state.currentPath, step);
}

function updateProgressBar(state) {
  const progressBar = document.querySelector('.viewer__bottom input[type="range"]');
  progressBar.value = state.currentStepIndex;
  progressBar.max = state.currentProjectMeta.steps.length - 1;
}
```

## Async/await patterns

```javascript
// Håndter async operasjoner
async function loadAndRender(path) {
  try {
    const meta = await loadProjectMeta(path);
    const state = {
      currentPath: path,
      currentStepIndex: 0,
      currentProjectMeta: meta
    };
    renderViewer(state, callbacks);
  } catch (error) {
    console.error('Feil ved lasting:', error);
    showError('Kunne ikke laste prosjekt');
  }
}

// Parallel lasting (valgfri pattern, ikke krav i første versjon)
async function loadMultipleProjects(paths) {
  const promises = paths.map(path => loadProjectMeta(path));
  const results = await Promise.all(promises);
  return results;
}

## Testing under implementering

### Manuell testing-checklist

For hver funksjon du implementerer:

1. **Test i nettleseren** (se ROADMAP.md for detaljer)
2. **Sjekk konsollen** for feil
3. **Test edge cases**:
   - Tomme arrays
   - Manglende filer
   - Ugyldig data
   - localStorage deaktivert
4. **Test på ulike skjermstørrelser**
5. **Test navigasjon** mellom alle views

### Debugging-tips

```javascript
// Logging for debugging
console.log('State:', state);
console.log('Route:', route);

// Breakpoints i DevTools
debugger; // Pause her

// Sjekk localStorage
console.log('Progress:', localStorage.getItem('legoInstructions.progress'));

// Inspiser DOM
console.log('Container:', container);
```

## Beste praksis

1. **Kort og fokuserte funksjoner**: Maks 50 linjer per funksjon
2. **Dokumenter kompleks logikk**: Kommenter hvorfor, ikke hva
3. **Bruk beskrivende navn**: `loadProjectMeta` er bedre enn `load`
4. **Håndter feil gracefully**: Applikasjonen skal ikke krasje
5. **Test inkrementelt**: Test hver del før du går videre
6. **Hold moduler løst koblet**: Moduler skal ikke være for avhengige av hverandre
