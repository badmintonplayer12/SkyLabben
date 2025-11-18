# AI Guide - Start her før implementering

Dette dokumentet gir deg en rask oversikt over hvordan du skal jobbe med dette prosjektet. **Les dette først**, deretter følg lenkene til de detaljerte dokumentene.

## 🎯 Hva er dette prosjektet?

Et statisk nettsted for å vise LEGO-byggeinstruksjoner som PNG-bilder. Bygget med ren HTML, CSS og JavaScript, uten dependencies.

**Hovedfunksjoner**:
- Prosjektgalleri med cover-bilder
- Hierarkisk navigasjon (prosjekter → underprosjekter → steg)
- Stegvis visning med pil-knapper og progresjonslinje
- Automatisk lagring av progresjon i localStorage
- Responsivt design (mobil, nettbrett, PC)

## 📋 Hvor starter jeg?

### 1. **Les [ROADMAP.md](./ROADMAP.md) først**
   - Dette er din implementasjonsplan
   - Følg oppgavene i rekkefølge (1.1 → 1.2 → 1.3 osv.)
   - **Viktig**: Test i nettleser ved alle steg markert med 🌐

### 2. **For kode-implementering, se [IMPLEMENTATION.md](./IMPLEMENTATION.md)**
   - Funksjonssignaturer og eksempler
   - Kode-mønstre og konvensjoner
   - Error handling og best practices

### 3. **For arkitektur og struktur, se [ARCHITECTURE.md](./ARCHITECTURE.md)**
   - Modulansvar og dataflyt
   - Routing og state management
   - Skalerbarhet og refaktoreringsstrategier

### 4. **For CSS og styling, se [CSS_GUIDELINES.md](./CSS_GUIDELINES.md)**
   - Design tokens og BEM-navngiving
   - Responsivt design (mobile-first)
   - Layout-komponenter og utility classes

### 5. **For dataformater, se [DATA_FORMAT.md](./DATA_FORMAT.md)**
   - Struktur på `meta.json` og `projects.json`
   - Validering og best practices
   - Eksempler på korrekt format

## ⚠️ Kritiske regler (les disse!)

### Klassnavn - MÅ være konsistent
- **Bruke BEM-mønster**: `.viewer__header`, `.project-tile__image`
- **IKKE bruke**: `.viewer-header`, `.project-name`
- Se [CSS_GUIDELINES.md](./CSS_GUIDELINES.md) for alle klassnavn

### Modulansvar - Ikke blande
- **main.js**: Koordinerer, gjør IKKE DOM-rendering
- **view-*.js**: Bygger DOM, gjør IKKE datahenting
- **data-loader.js**: Henter data, gjør IKKE rendering
- Se [ARCHITECTURE.md](./ARCHITECTURE.md) for detaljer

### URL-bygging - Bruk alltid getImageUrl()
- **Riktig**: `img.src = getImageUrl(path, imageName)`
- **Feil**: `img.src = \`/projects/${path}/${imageName}\``
- Se [IMPLEMENTATION.md](./IMPLEMENTATION.md) for eksempler

### State management - Funksjoner, ikke objekter
- **Riktig**: `import { getState, updateState } from './state.js'`
- **Feil**: `state.getState()` eller `state.updateState()`
- Se [IMPLEMENTATION.md](./IMPLEMENTATION.md) for detaljer

## 🗺️ Dokumentoversikt

| Fil | Bruk når du trenger... |
|-----|------------------------|
| **[ROADMAP.md](./ROADMAP.md)** | Implementasjonsplan og oppgaver |
| **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** | Kodeeksempler og funksjonssignaturer |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Teknisk arkitektur og modulansvar |
| **[CSS_GUIDELINES.md](./CSS_GUIDELINES.md)** | Styling, design tokens, BEM-navngiving |
| **[DATA_FORMAT.md](./DATA_FORMAT.md)** | JSON-strukturer og dataformater |
| **[README.md](./README.md)** | Brukerinformasjon og prosjektoverview |

## 🚀 Arbeidsflyt

1. **Start med ROADMAP.md**
   - Velg neste oppgave (f.eks. 1.3.1)
   - Les "Mål"-linjen for å forstå hva som skal gjøres

2. **Sjekk IMPLEMENTATION.md**
   - Finn relevant modul (f.eks. router.js)
   - Se på funksjonssignaturer og eksempler
   - Følg kode-mønstrene nøyaktig

3. **Implementer koden**
   - Følg funksjonssignaturene som fasit
   - Bruk klassnavn fra CSS_GUIDELINES.md
   - Test i nettleser hvis oppgaven krever det

4. **Oppdater ROADMAP.md**
   - Marker oppgaven som fullført: `[x]`
   - Gå videre til neste oppgave

## 🔍 Rask referanse

### Hvor finner jeg...?

**Hvordan sortere bilder?**
→ [IMPLEMENTATION.md](./IMPLEMENTATION.md) - `extractStepNumber()` funksjon

**Hvordan bygge URL til bilder?**
→ [IMPLEMENTATION.md](./IMPLEMENTATION.md) - `getImageUrl()` funksjon

**Hvordan beregne forelder-path?**
→ [IMPLEMENTATION.md](./IMPLEMENTATION.md) - `getParentPath()` funksjon

**Hvilke CSS-klasser skal jeg bruke?**
→ [CSS_GUIDELINES.md](./CSS_GUIDELINES.md) - Seksjon "BEM-navngiving"

**Hvordan strukturere meta.json?**
→ [DATA_FORMAT.md](./DATA_FORMAT.md) - Seksjon "meta.json struktur"

**Hvordan håndtere state?**
→ [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Seksjon "state.js"

**Hvordan håndtere routing?**
→ [IMPLEMENTATION.md](./IMPLEMENTATION.md) - Seksjon "router.js"

## ⚡ Viktige påminnelser

- **Ikke finn opp egne varianter** - Følg eksisterende mønstre
- **Test i nettleser** - Alle steg med 🌐 må testes
- **Bruk konsistente klassnavn** - Sjekk CSS_GUIDELINES.md
- **Ikke blande modulansvar** - main.js koordinerer, views renderer
- **Bruk getImageUrl()** - Ikke hardkod URL-er
- **Oppdater ROADMAP.md** - Marker oppgaver som fullført

## 🆘 Hvis du er usikker

1. Sjekk [IMPLEMENTATION.md](./IMPLEMENTATION.md) for kodeeksempler
2. Sjekk [ARCHITECTURE.md](./ARCHITECTURE.md) for modulansvar
3. Sjekk [CSS_GUIDELINES.md](./CSS_GUIDELINES.md) for styling
4. Foreslå 2-3 alternativer i en kommentar, ikke gjett

---

**Start med [ROADMAP.md](./ROADMAP.md) og følg oppgavene i rekkefølge!**

