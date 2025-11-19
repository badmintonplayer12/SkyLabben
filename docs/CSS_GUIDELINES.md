# CSS Guidelines

Dette dokumentet beskriver CSS-struktur, styling-retningslinjer og design-prinsipper for LEGO Instruksjonsvisning-prosjektet.

## Retningslinjer for AI-generert CSS

Når AI foreslår ny CSS i dette prosjektet, gjelder:

- Bruk alltid eksisterende design tokens (`var(--color-...)`, `var(--spacing-...)`) i stedet for hardkodede verdier.
- Følg BEM-lignende navngivning: `.block`, `.block__element`, `.block--modifier`.
- Ikke legg til nye farger uten å først definere dem som variabler i `:root`.
- Unngå `!important` med mindre det er eksplisitt avtalt.
- Gjenbruk eksisterende utilities (`.u-flex`, `.u-text-center`, osv.) før du lager nye.
- Nye views skal følge mønsteret fra `.project-grid` og `.viewer`.
- Utilities brukes sparsommelig. Hvis du gjentatte ganger trenger samme layout, vurder egen komponent-/layout-klasse framfor nye utilities.

## Filstruktur

CSS-organisering i `assets/css/main.css`:

```css
/* 1. CSS Variables / Design Tokens */
:root {
  /* Farger */
  /* Typografi */
  /* Spacing */
  /* Breakpoints */
}

/* 2. Reset / Normalize */
/* 3. Base styles */
/* 4. Layout components */
/* 5. View-specific styles */
/* 6. Utilities */
```

## Design Tokens

### CSS Variables

Definer alle design-tokens som CSS-variabler i `:root`:

```css
:root {
  /* Farger */
  --color-primary: #0066cc;
  --color-secondary: #666666;
  --color-background: #ffffff;
  --color-text: #333333;
  --color-border: #e0e0e0;
  --color-error: #cc0000;
  --color-success: #00cc00;
  
  /* Typografi */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-base: 16px;
  --font-size-small: 14px;
  --font-size-large: 18px;
  --font-size-h1: 24px;
  --font-size-h2: 20px;
  --line-height-base: 1.5;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Breakpoints */
  /* Merk: Breakpoint-variabler brukes som dokumentasjon. Media-queries må fortsatt bruke tall direkte siden CSS-variabler ikke støttes i media queries i alle nettlesere. */
  --breakpoint-mobile: 375px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1920px;
  
  /* Layout */
  --max-width-container: 1200px;
  --border-radius: 4px;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

## Navngivingskonvensjon

### BEM-lignende struktur

Bruk BEM-lignende navngivning for komponenter:

```css
/* Block */
.project-grid { }
.project-tile { }

/* Block__Element */
.project-tile__image { }
.project-tile__name { }

/* Block--Modifier */
.project-grid--compact { }
.project-tile--active { }
```

**Viktig**: Hver komponent er sin egen block. `.project-grid` er container, `.project-tile` er en egen block som brukes i grid'en. Elementer tilhører sin nærmeste block (f.eks. `.project-tile__image`, ikke `.project-grid__image`).

### Klassestruktur

- **Komponenter**: `.component-name` (f.eks. `.project-grid`, `.viewer`)
- **Elementer**: `.component-name__element` (f.eks. `.viewer__image`, `.viewer__controls`)
- **Modifikatorer**: `.component-name--modifier` (f.eks. `.button--primary`, `.tile--active`)
- **Utilities**: `.u-utility-name` (f.eks. `.u-hidden`, `.u-text-center`)

## Responsive Design

### Mobile-First Approach

Start med mobil-styling, legg til større skjermer med media queries:

```css
/* Base (mobil) */
.container {
  padding: var(--spacing-md);
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--spacing-lg);
  }
}

/* Desktop */
@media (min-width: 1920px) {
  .container {
    padding: var(--spacing-xl);
    max-width: var(--max-width-container);
    margin: 0 auto;
  }
}
```

### Breakpoints

Bruk definerte breakpoints:

```css
/* Mobil */
@media (min-width: 375px) { }

/* Nettbrett */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1920px) { }
```

## Layout-komponenter

### Prosjektgalleri (project-grid)

```css
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.project-tile {
  aspect-ratio: 1;
  border-radius: var(--border-radius);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.project-tile:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow);
}

.project-tile__image {
  width: 100%;
  height: 80%;
  object-fit: cover;
}

.project-tile__name {
  height: 20%;
  padding: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-small);
  background: var(--color-background);
}
```

### Viewer (instruksjonsvisning)

```css
.viewer {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Merk: På mobil kan 100vh gi litt ekstra scroll pga. browser UI, men dette er akseptabelt for dette prosjektet */
  overflow: hidden;
}

.viewer__header {
  padding: var(--spacing-md);
  background: var(--color-background);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-large);
  font-weight: bold;
}

.viewer__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color-background);
  padding: var(--spacing-md);
}

.viewer__main img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.viewer__loading {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  background: var(--color-background);
  box-shadow: var(--shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounce 1s infinite;
}

.viewer__loading-icon {
  width: 64px;
  height: 64px;
  background-image: url('../img/loading-brick.svg'); /* Placeholder – bytt til faktisk ressurs */
  background-size: contain;
  background-repeat: no-repeat;
  animation: spin 1.8s linear infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 
 * Maksimal bildeflate - viktige prinsipper:
 * 
 * 1. Container (.viewer__main) skal IKKE ha hard width/height
 *    - Bruk flex: 1 for å fylle tilgjengelig plass
 *    - La høyden bestemmes av viewport og flex-layout
 * 
 * 2. Bildet skal bruke object-fit: contain
 *    - Sikrer at hele bildet vises uten å kuttes
 *    - Beholder aspect ratio
 * 
 * 3. max-width/height: 100% på bildet
 *    - Sikrer at bildet ikke overstiger containeren
 *    - Fungerer sammen med object-fit: contain
 * 
 * 4. Zoom-mekanisme:
 *    - Browser zoom (Ctrl/Cmd +, Ctrl/Cmd -) er anbefalt zoom-mekanisme
 *    - Bildet skal være zoombart via standard nettleser-funksjonalitet
 *    - IKKE bruk pointer-events: none på bildet (blokkerer zoom)
 *    - Hvis custom zoom skal implementeres senere:
 *      * Bruk transform: scale() på bildet direkte
 *      * IKKE endre container-størrelse (width/height)
 *      * Behold flex-layout for responsivitet
 */

.viewer__bottom {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-background);
  border-top: 1px solid var(--color-border);
}

.viewer__button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background: var(--color-background);
  cursor: pointer;
  font-size: var(--font-size-base);
}

.viewer__button:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
}

.viewer__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.viewer__progress {
  flex: 1;
  height: 8px;
}

.viewer__step-indicator {
  font-size: var(--font-size-small);
  color: var(--color-secondary);
}
```

## Base Styles

### Reset og Normalize

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  color: var(--color-text);
  background: var(--color-background);
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

button {
  font-family: inherit;
  font-size: inherit;
  border: none;
  background: none;
  cursor: pointer;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
```

## Utilities

### Utility Classes

Utilities brukes sparsommelig. Hvis du gjentatte ganger trenger samme layout, vurder egen komponent-/layout-klasse framfor nye utilities.

```css
/* Display */
.u-hidden {
  display: none !important;
}

.u-flex {
  display: flex !important;
}

.u-grid {
  display: grid !important;
}

/* Text alignment */
.u-text-center {
  text-align: center !important;
}

.u-text-left {
  text-align: left !important;
}

.u-text-right {
  text-align: right !important;
}

/* Spacing */
.u-margin-sm {
  margin: var(--spacing-sm) !important;
}

.u-margin-md {
  margin: var(--spacing-md) !important;
}

.u-padding-sm {
  padding: var(--spacing-sm) !important;
}

.u-padding-md {
  padding: var(--spacing-md) !important;
}
```

## Responsive Patterns

### Grid Layout

```css
/* Mobil: 1 kolonne */
.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-md);
}

/* Tablet: 2 kolonner */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop: 3 kolonner */
@media (min-width: 1920px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

### Flexbox Layout

```css
.flex-container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

@media (min-width: 768px) {
  .flex-container {
    flex-direction: row;
  }
}
```

## Bildestyling

### Primært mønster: Komponent-klasser

I viewer og andre komponenter bruker vi hovedsakelig komponent-klasser:

```css
.viewer__main img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
```

### Valgfrie hjelpeklasser

`.instruction-image` og `.cover-image` er valgfrie hjelpeklasser som kan brukes hvis vi har bilder utenfor viewer/galleri:

```css
.instruction-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}
```

**Regel**: Prefer komponent-klasser (`.viewer__main img`) over globale semantics-klasser når mulig.

## Interaktivitet

### Hover States

```css
.interactive-element {
  transition: transform 0.2s, opacity 0.2s;
}

.interactive-element:hover {
  transform: scale(1.05);
  opacity: 0.9;
}
```

### Focus States

```css
button:focus,
a:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Active States

```css
button:active {
  transform: scale(0.95);
}
```

## Progresjonslinje

### Range Input Styling

```css
input[type="range"] {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: var(--color-border);
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-primary);
  cursor: pointer;
  border: none;
}
```

## Mobile-Specific Styles

### Touch Targets

Sørg for at klikkbare elementer er store nok for touch:

```css
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: var(--spacing-sm);
}
```

### Viewport Meta

Husk å inkludere i HTML:

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Beste Praksis

### 1. Bruk CSS Variables

```css
/* ✅ Bra */
.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
}

/* ❌ Dårlig */
.button {
  background: #0066cc;
  padding: 16px;
}
```

### 2. Mobile-First

```css
/* ✅ Bra - starter med mobil */
.container {
  padding: var(--spacing-sm);
}

@media (min-width: 768px) {
  .container {
    padding: var(--spacing-md);
  }
}

/* ❌ Dårlig - starter med desktop */
.container {
  padding: var(--spacing-lg);
}

@media (max-width: 767px) {
  .container {
    padding: var(--spacing-sm);
  }
}
```

### 3. BEM-lignende Navngivning

```css
/* ✅ Bra - project-tile er egen block, så modifikator går på tile */
.project-tile--active { }

/* ❌ Dårlig - project-tile er ikke element av project-grid */
.project-grid__tile--active { }

/* ❌ Dårlig */
.activeTile { }
.tileActive { }
```

**Merk**: `.project-tile` er en egen block, ikke et element av `.project-grid`. Derfor brukes `.project-tile--active`, ikke `.project-grid__tile--active`.

### 4. Unngå !important

Bruk spesifisitet i stedet:

```css
/* ✅ Bra */
.viewer .button {
  color: red;
}

/* ❌ Dårlig */
.button {
  color: red !important;
}
```

### 5. Organiser CSS Logisk

```css
/* 1. Variables */
:root { }

/* 2. Base */
body { }
img { }

/* 3. Layout */
.container { }
.grid { }

/* 4. Components */
.project-grid { }
.viewer { }

/* 5. Utilities */
.u-hidden { }
```

### 6. Z-index Retningslinjer

Når du bruker z-index, følg denne policyen:

```css
/* 10-19: Faste elementer (header, bottom-bar) */
.viewer__header {
  z-index: 10;
}

.viewer__bottom {
  z-index: 10;
}

/* 20-29: Overlays (loading, dimming) */
.loading-overlay {
  z-index: 20;
}

/* 30-39: Modaler / dialoger */
.modal {
  z-index: 30;
}

/* Unngå å bruke z-index > 40 */
```

### Barnevennlig UI (5–7 år)

- **Ikoner foran tekst**: Anta at brukeren ikke kan lese flytende. Navigasjonsknapper (opp/hjem, neste/forrige, progresjonsindikator) skal bruke tydelige symboler (hus, piler, stjerner) og kan støttes av tall (f.eks. `3/10`) i stedet for tekststrenger som “Steg 3 av 10”.
- **Store trykkflater**: Minimum 44x44px er absolutt minimum; sikte på ~64px (ca. 2 cm) for primærknapper slik at små fingre treffer riktig. Sørg for minst `var(--spacing-md)` mellom interaktive elementer.
- **Plassering**: Neste/forrige-knapper kan up-skaleres og trekkes ut mot venstre/høyre hjørne av `.viewer__bottom` slik at de ikke konkurrerer med progressbar. Opp/hjem-knapp plasseres konsekvent (typisk øverst til venstre) for muskelminne.
- **Farger og feedback**: Bruk klare, høy-kontrast LEGO-inspirerte farger på interaktive elementer. Alle knapper skal ha en aktiv/trykket-state (lys opp, skift farge, animasjon) slik at barn ser at trykket ble registrert.
- **Lyd og animasjoner (valgfritt)**: Hvis UI-et utvides med lyd/animert feedback, reserver plass til et diskret “lyd av/på”-ikon og sørg for at animasjoner er korte (<300ms) for å holde tempoet oppe.
- **Progresjonslinje**: Visuell indikator kan være en tykk bar eller en serie symboler. Dragging er sekundær; primærnavigasjonen er pilene, så progressbaren skal støttes via store tap-targets eller segmenter.
- **Tom-state og belønning**: Når et prosjekt mangler steg, vis en vennlig illustrasjon (f.eks. minifigur) som sier “kommer snart”. Ved fullført prosjekt kan `.viewer__bottom` trigge en konfetti- eller stjerneanimert klasse for å feire ferdigstillelse.
- **Loading-indikator**: Bruk LEGO-inspirert spinner (`.viewer__loading`) med myk animasjon mens bilder lastes. Den skal være barnlig og tydelig (ingen små spinnere).
- **Onboarding-overlay**: Definer `.onboarding-overlay` (fullskjerm, semitransparent) med en maskot/figur som peker på galleri-tiles. Bruk sterke farger og en enkel puls/peke-animasjon.
- **Belønning/badges**: For prosjekt fullført, bruk `.viewer__celebration` som legger til konfetti (CSS animasjon) eller stjerne-illustrasjon, eventuelt kombinert med en liten lyd hvis slått på.

```css
.onboarding-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease;
}

.onboarding-overlay__mascot {
  width: 220px;
  height: 220px;
  background-image: url('../img/mascot.png');
  background-size: contain;
  animation: wiggle 1.2s ease-in-out infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(4deg); }
  75% { transform: rotate(-4deg); }
}
```

## Testing

### Test på ulike skjermstørrelser

1. **Mobil**: 375px (iPhone SE)
2. **Nettbrett**: 768px (iPad)
3. **Desktop**: 1920px (Full HD)

### Test i DevTools

- Bruk Device Mode i Chrome DevTools
- Test både portrait og landscape
- Test touch-interaksjoner

### Sjekkliste

- [ ] Alle elementer er synlige på mobil
- [ ] Tekst er lesbar på alle skjermstørrelser
- [ ] Klikkbare elementer er store nok (min 44x44px)
- [ ] Bilder tilpasses skjermen korrekt
- [ ] Ingen horizontal scrolling
- [ ] Focus states er synlige
- [ ] Hover states fungerer (på desktop)

