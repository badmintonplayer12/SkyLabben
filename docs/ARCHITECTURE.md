# Arkitektur

Dette dokumentet beskriver den tekniske arkitekturen til SkyLabben.

## TL;DR - Mental modell

Applikasjonen består grovt av:
- **Router** som tolker URL-en
- **Data-lag** som henter JSON og lagrer progresjon
- **Views** som bygger DOM-en for galleri og viewer
- **main.js** som kobler alt sammen

For brukerinformasjon og hvordan du legger til prosjekter, se [README.md](./README.md). Dette dokumentet fokuserer på den tekniske implementasjonen.

## Arkitekturoversikt

Prosjektet er bygget som en modulær, komponentbasert applikasjon med ren JavaScript. Arkitekturen følger en enkel MVC-lignende struktur hvor:

- **Model/Data**: `data-loader.js` og `state.js` håndterer datalagring og state
- **View**: `view-project-grid.js` og `view-viewer.js` håndterer UI-rendering
- **Controller**: `main.js` og `router.js` koordinerer navigasjon og state-oppdateringer

### Hovedprinsipper

- **Statisk hosting**: Ingen server-side kode, alt kjøres i nettleseren
- **Ingen dependencies**: Ren HTML, CSS og JavaScript uten eksterne biblioteker
- **Modulær struktur**: Hver fil har et klart ansvar
- **Hash-basert routing**: URL-struktur via hash-fragmenter for enkel hosting
- **localStorage**: Klient-side lagring av progresjon
- **Statisk hosting + SW**: Service Worker brukes for caching; ingen ESM i importScripts, bruk relative stier for GitHub Pages

## Komponentoversikt

### main.js
**Rolle**: Hovedkoordinator og applikasjonens entry point

**Ansvar**:
- Initialiserer router og state
- Koordinerer mellom routing, data-loading og view-rendering
- Håndterer applikasjonslivssyklus
- Kaller riktig view basert på rute

**Viktige funksjoner**:
- `init()` - Initialiserer applikasjonen
- `handleRoute(route)` - Håndterer ruteendringer og koordinerer rendering

**Viktig**: main.js gjør **ikke** egen DOM-rendering. Den importerer og kaller `renderProjectGrid()` og `renderViewer()` fra view-modulene.

### router.js
**Rolle**: Hash-basert routing og URL-parsing

**Ansvar**:
- Lytter på `hashchange`-events
- Parser hash-fragmenter til Route-objekter
- Validerer og normaliserer URL-struktur
- Triggerer ruteendringer

**Route-typer**:

> **Merk**: Typedefinisjonene under er skrevet i TypeScript-lignende pseudokode for å beskrive struktur, selv om prosjektet bruker vanlig JavaScript.

```javascript
type Route =
  | { type: "root" }
  | { type: "project"; path: string; stepIndex?: number };
```

**URL-eksempler**:
- `/#/` → `{ type: "root" }`
- `/#/p/project1` → `{ type: "project", path: "project1" }`
- `/#/p/project1?step=3` → `{ type: "project", path: "project1", stepIndex: 3 }`

### state.js
**Rolle**: Tilstandshåndtering (state management) og localStorage-integrasjon

**Ansvar**:
- Holder `AppState` i minne
- Synkroniserer med localStorage
- Håndterer progresjonslagring per prosjektpath
- Gir getters/setters for state

**AppState (minne)**:

> **Merk**: Typedefinisjonene under er skrevet i TypeScript-lignende pseudokode for å beskrive struktur, selv om prosjektet bruker vanlig JavaScript.

`AppState` brukes i minne for å beskrive hva som vises nå:

```javascript
type AppState = {
  currentPath: string | null;      // f.eks. "project1" eller "project1/subproject-a"
  currentStepIndex: number;        // 0-basert indeks
  currentProjectMeta: ProjectMeta | null;
};
```

**Progresjonskart (localStorage)**:

Progresjon lagres separat som et kart i localStorage, med struktur:

```javascript
{
  "project1": 5,
  "project1/subproject-a": 2
}
```

Dette er ikke en del av `AppState`, men et separat objekt som lagrer siste steg per prosjektpath.

**Viktige funksjoner**:
- `loadProgress()` - Henter all lagret progresjon
- `saveProgress(map)` - Lagrer progresjon
- `getLastStepFor(path)` - Henter siste steg for en path
- `setStepFor(path, index)` - Setter steg for en path

### data-loader.js
**Rolle**: Datahenting fra JSON-filer

**Ansvar**:
- Henter `meta.json` for prosjekter/underprosjekter
- Henter `projects.json` for toppnivåliste
- Håndterer async loading
- Gir feilhåndtering for manglende filer

**Viktige funksjoner**:
- `loadProjectMeta(path)` - Henter meta.json for en path
- `loadProjects()` - Henter projects.json
- `getImageUrl(path, imageName)` - Bygger URL til bilder

**Base URL**: `/projects/`

### view-project-grid.js
**Rolle**: Prosjektgalleri-view

**Ansvar**:
- Renderer grid/liste over prosjekter
- Viser cover-bilder og navn
- Håndterer klikk på prosjekter
- Viser progresjonsindikator (hvis implementert)
- Kan presentere underprosjekter inline (flatt galleri) før man navigerer videre, slik at barn slipper å forstå “opp ett nivå”
- Viser synlighetstoggles i parent-modus (label-fri pill) og dimmer kort som er skjult for barn (parent/override)

**DOM-struktur**:
- Container med grid-layout
- Prosjekt-tiles med cover-bilde og navn
- Event listeners for navigasjon

### view-viewer.js
**Rolle**: Instruksjonsviewer-view

**Ansvar**:
- Renderer instruksjonsbilde
- Initierer navigasjons-callbacks (main.js oppdaterer state/URL)
- Viser progresjonslinje
- Håndterer "opp"-knapp for hierarkisk navigasjon
- Håndterer tom steps-array (viser melding og deaktiverer kontroller)
- Sørger for at bildet fyller mest mulig av viewporten uten scroll og at nettleser-zoom fungerer
- Eksponerer ikon- og barnevennlige kontroller (store tap-targets, tydelig feedback)
- Viser vennlig loading-indikator (f.eks. LEGO-kloss-animajson) mens neste bilde lastes
- Feirer ferdigstillelse (konfetti/lyd) og markerer progresjon når siste steg fullføres
- Tilbyr lyd/haptikk-bryter og eventuelt steg-vis lydhint når `audioSteps` er definert
- Viser synlighetstoggles for parent/child i parent-modus (label-fri pill), med parent-trumping (parent hidden → child-toggles disabled/dimmet)

**DOM-struktur**:
- Header (valgfritt)
- Image container (flex, fyller plass)
- Bottom bar med:
  - Tilbake-knapp
  - Venstre/høyre-piler
  - Progresjonslinje
  - Steg-indikator ("Steg X av N")

**CSS-prinsipper**:
- Ingen scroll på image container
- Bildet skal `object-fit: contain` for å tilpasse skjermen
- Responsivt design for mobil/nettbrett/PC

## Dataflyt

### Applikasjonsstart
1. `main.js` initialiserer router og state
2. Router parser initial hash
3. Basert på rute:
   - **Root**: `data-loader.js` henter `projects.json` → `view-project-grid.js` renderer
   - **Project**: `data-loader.js` henter `meta.json` → `state.js` setter state → `view-viewer.js` renderer

### Navigasjon i prosjektgalleri
1. Bruker klikker på prosjekt
2. `view-project-grid.js` vurderer om prosjektet har underprosjekter:
   - I “barnemodus” vises underprosjekter inline med egne tiles (ingen hash-endring før barnet velger et konkret steg)
   - Hvis barnet velger et tile uten flere children, kalles callback som sender path til `main.js`
3. `main.js` oppdaterer `location.hash` via `updateHash()` når det faktisk navigeres
4. Router fanger opp endring
5. `main.js` håndterer ny rute
6. Data lastes og viewer renderes

**Onboarding**: Første gangs oppstart kan trigge en visuell “trykk her”-overlegg i `view-project-grid.js` (maskot/piler) som peker på prosjekttiles. Overlegget skal kunne avbrytes umiddelbart og lagre flagg i localStorage slik at det ikke vises hver gang.

### Navigasjon mellom steg
1. Bruker klikker pil eller progresjonslinje
2. `view-viewer.js` kaller callback (f.eks. `onNextStep()`)
3. `main.js` mottar callback og:
   - Oppdaterer state via `updateState()`
   - Oppdaterer URL-hash via `updateHash()`
   - Lagrer progresjon til localStorage via `setStepFor()`
4. Router fanger opp hash-endring og trigger re-render
5. `view-viewer.js` re-renderer med nytt bilde fra oppdatert state

**Viktig**: Views gjør IKKE direkte state/URL-oppdateringer. De kaller callbacks som sendes fra `main.js`, og `main.js` eier all state/URL-manipulasjon.

### Navigasjon opp i hierarkiet
1. Bruker klikker "Opp"-knapp
2. `view-viewer.js` kaller `onGoUp()` callback
3. `main.js` beregner forelder-path via `getParentPath()` og oppdaterer hash
4. Router håndterer endring
5. Hvis forelder har egne bilder → viser dem, ellers → viser children-liste

## State Management

### AppState vs Progresjonskart

Det er viktig å skille mellom to typer state:

1. **AppState** (i minne): Beskriver hva som vises nå
   - Oppdateres kontinuerlig når bruker navigerer
   - Holdes i minne, ikke lagret permanent
   - Inneholder nåværende path, steg-indeks og prosjektmetadata

2. **Progresjonskart** (localStorage): Lagrer siste steg per prosjektpath
   - Lagres automatisk ved hver stegendring
   - Leses ved applikasjonsstart
   - Brukes for å gjenoppta der brukeren slapp

### State-oppdateringer
`AppState` oppdateres gjennom `state.js` som gir kontrollerte metoder. **Views gjør IKKE direkte state-oppdateringer**. I stedet:
- Views kaller callbacks (f.eks. `onNextStep()`, `onGoUp()`) som sendes fra `main.js`
- `main.js` eier all state/URL-manipulasjon og kaller `updateState()`, `updateHash()`, osv.
- Dette sikrer at all state-logikk er sentralisert i `main.js` og views forblir rene presentasjonskomponenter

### localStorage-synkronisering
Progresjon lagres automatisk ved hver stegendring. Formatet er enkel key-value hvor:
- **Key**: Prosjektpath (f.eks. `"project1/subproject-a"`)
- **Value**: Steg-indeks (nummer)

### State-persistence
Ved applikasjonsstart leses lagret progresjon fra localStorage. Når bruker navigerer til et prosjekt, brukes lagret steg hvis ingen steg er spesifisert i URL.

## Routing-system

### Hash-basert routing
Bruker hash-fragmenter (`#`) for routing siden dette ikke krever server-side konfigurasjon. Hash-endringer trigges ikke server-requests, perfekt for statisk hosting.

### URL-struktur
- **Root**: `/#/` eller `/#`
- **Prosjekt**: `/#/p/<path>`
- **Prosjekt med steg**: `/#/p/<path>?step=<index>`

### Routing-flyt
1. `window.addEventListener("hashchange")` fanger URL-endringer
2. `router.js` parser hash til Route-objekt
3. `main.js` mottar Route og bestemmer hvilket view som skal vises
4. Riktig data lastes og view renderes

**Eksempel på parsing** (illustrasjon, ikke fasit):

```javascript
// Eksempel på parsing av hash "#/p/project1/sub-a?step=3"
const hash = location.hash.slice(1); // "/p/project1/sub-a?step=3"
const [path, query] = hash.split('?');
const stepMatch = query?.match(/step=(\d+)/);
const stepIndex = stepMatch ? parseInt(stepMatch[1]) : undefined;
// Resultat: { type: "project", path: "project1/sub-a", stepIndex: 3 }
```

## Filstruktur

```
/lego-instruksjoner/
  index.html                 # Hoved-HTML-fil
  /assets/
    /css/
      main.css              # Hovedstiler
    /js/
      main.js               # Hovedkoordinator
      router.js             # Routing-logikk
      state.js              # State management
      view-project-grid.js   # Prosjektgalleri-view
      view-viewer.js        # Instruksjonsviewer-view
      data-loader.js        # Datahenting
  /projects/                # Prosjektdata
    project1/
      meta.json
      cover.png
      1_1x.png
      ...
  projects.json             # Toppnivåliste
```

## Designvalg og begrunnelser

### Hash-basert routing
**Hvorfor**: Fungerer perfekt med statisk hosting, krever ingen server-konfigurasjon, og gir bookmarkable URLs.

### localStorage for progresjon
**Hvorfor**: Enkel, klient-side løsning som ikke krever backend. Fungerer offline og gir rask tilgang.

### Modulær struktur
**Hvorfor**: Gjør koden lettere å vedlikeholde, teste og utvide. Hver fil har klart ansvar.

### Ren JavaScript (ingen frameworks)
**Hvorfor**: Minimal overhead, enkel hosting, rask lasting, og full kontroll over implementasjonen.

### Ingen build tools
**Hvorfor**: Enklere setup, raskere utvikling, og direkte debugging i nettleseren.

### Service Worker (SW) og hosting
**Hvorfor**: Raskere/offline opplevelse og kontroll på animasjons-/static-assets. Unngå ESM i SW (importScripts), bruk relative stier (GH Pages subpath), og bump CACHE_VERSION før deploy.

## Skalerbarhet og vedlikehold

### Retningslinjer for filstørrelse

#### Når en fil er for stor
En fil bør vurderes for refaktorering når:
- **Linjetall**: Over 400-500 linjer kode
- **Kompleksitet**: Flere ansvar som ikke naturlig hører sammen
- **Vedlikehold**: Vanskelig å finne spesifikke funksjoner eller logikk
- **Testing**: Vanskelig å teste isolert

#### Tegn på at en fil bør deles opp
- Flere distinkte "seksjoner" i filen med ulike ansvar
- Gjentatt kode som kunne vært ekstrahert
- Flere store funksjoner (>50 linjer) som kunne vært egne moduler
- Vanskelig å forstå filens hovedansvar ved første øyekast

### Refaktoreringsstrategier

#### Dele opp store filer

**Eksempel: Hvis `view-viewer.js` blir for stor**

1. **Identifiser ansvar**:
   - Bildevisning
   - Navigasjonskontroller
   - Progresjonslinje
   - Header/footer

2. **Ekstraher komponenter**:
   ```
   view-viewer.js          # Hovedkoordinator
   view-viewer-image.js    # Bildevisning
   view-viewer-controls.js # Navigasjonskontroller
   view-viewer-progress.js # Progresjonslinje
   ```

3. **Behold hovedfilen som koordinator**:
   - Hovedfilen importerer og koordinerer komponentene
   - Komponentene håndterer sitt spesifikke ansvar

#### Når lage nye moduler

**Opprett ny modul når**:
- Funksjonalitet brukes i flere filer (DRY-prinsipp)
- Funksjonalitet er kompleks nok til å være egen enhet
- Funksjonalitet kan testes isolert
- Det gir klarere kodeorganisering

**Eksempler på nye moduler**:
- `utils.js` - Hjelpefunksjoner (formatering, validering, etc.)
- `image-utils.js` - Bildespesifikk logikk (preloading, caching)
- `navigation-utils.js` - Navigasjonshjelpefunksjoner

#### Når lage nye view-filer

**Opprett ny view når**:
- Ny type visning trengs (f.eks. `view-detail.js` for detaljvisning)
- Eksisterende view blir for kompleks
- View har klart distinkt ansvar fra andre views

### Modulorganisering

#### View-filer
Alle view-filer skal følge samme mønster:
- Eksporterer en hovedfunksjon som tar state/data som parameter
- Returnerer eller oppdaterer DOM-elementer
- Håndterer event listeners internt
- Kan ta imot callbacks for navigasjon/actions

**Eksempel struktur**:
```javascript
// view-example.js
import { getImageUrl } from './data-loader.js';

export function renderExample(data, onAction) {
  const container = document.createElement('div');
  container.className = 'example';
  // ... rendering logic
  // ... event listeners
  return container;
}
```

#### Utility-moduler
Utility-moduler skal:
- Være pure functions hvor mulig
- Ha klare, beskrivende funksjonsnavn
- Være testbare isolert
- Ikke ha sideeffekter (unntatt nødvendig)
- Felles UI-helpers (f.eks. dialog, feiring, synlighetstoggle) bør brukes på tvers av views for å unngå duplisering.

### Code Review Checklist

Før du committer store endringer, vurder:

- [ ] Er filen under 500 linjer?
- [ ] Har hver funksjon et klart ansvar?
- [ ] Er koden testbar?
- [ ] Er det gjentatt kode som kunne ekstraherts?
- [ ] Er navngiving konsistent og beskrivende?
- [ ] Er kommentarer tilstrekkelige for kompleks logikk?
- [ ] Følger koden eksisterende mønstre i prosjektet?

### Vedlikeholdsrutiner

#### Månedlig review
- Gå gjennom største filene i prosjektet
- Identifiser potensielle refaktoreringsmuligheter
- Dokumenter kompleksitet som vokser

#### Ved nye features
- Vurder om ny funksjonalitet passer i eksisterende filer
- Vurder om ny funksjonalitet krever ny modul
- Dokumenter nye patterns hvis de etableres

#### Ved refaktorering
- Oppdater denne dokumentasjonen hvis strukturen endres
- Sørg for at alle views/utilities følger samme mønstre
- Test grundig etter refaktorering

### Eksempel: Refaktorering av stor fil

**Før** (view-viewer.js - 600 linjer):
```javascript
// Alt i én fil: bildevisning, kontroller, progresjon, header, footer
export function renderViewer(state) {
  // 200 linjer bildevisning
  // 150 linjer kontroller
  // 100 linjer progresjon
  // 100 linjer header/footer
  // 50 linjer event handlers
}
```

**Etter** (modulær struktur):
```javascript
// view-viewer.js (150 linjer) - Koordinator
import { renderImageViewer } from './view-viewer-image.js';
import { renderControls } from './view-viewer-controls.js';
import { renderProgress } from './view-viewer-progress.js';

export function renderViewer(state, callbacks) {
  const container = document.createElement('div');
  container.className = 'viewer';
  container.appendChild(renderImageViewer(state));
  container.appendChild(renderControls(state, callbacks));
  container.appendChild(renderProgress(state, callbacks));
  return container;
}

// view-viewer-image.js (100 linjer)
export function renderImageViewer(state) { /* ... */ }

// view-viewer-controls.js (80 linjer)
export function renderControls(state, callbacks) { /* ... */ }

// view-viewer-progress.js (70 linjer)
export function renderProgress(state, callbacks) { /* ... */ }
```

## Testing og debugging

### Debugging-tips
- Bruk browser DevTools for å inspisere state
- Sjekk localStorage i Application-tab
- Bruk Network-tab for å se datahenting
- Sett breakpoints i router for å følge navigasjon

### Testing-strategi
Siden dette er et statisk prosjekt uten build tools:
- Manuell testing i nettleseren
- Test på ulike skjermstørrelser
- Test localStorage-funksjonalitet
- Test navigasjon mellom alle views

## Fremtidige arkitekturforbedringer

### Potensielle utvidelser
- Service Worker for offline-støtte
- Image caching-strategi
- Lazy loading av bilder
- Virtual scrolling for store prosjektlister
- TypeScript for type-sikkerhet (hvis kompleksitet vokser)

### Når vurdere større endringer
- Hvis prosjektet vokser betydelig (>10 prosjekter, >1000 bilder)
- Hvis ytelse blir et problem
- Hvis vedlikehold blir vanskelig
- Hvis flere utviklere skal jobbe på prosjektet

