# LEGO Instruksjonsvisning

Et enkelt, statisk nettsted for å vise LEGO-byggeinstruksjoner som PNG-bilder med strukturert navigasjon.

## Prosjektoversikt

Dette prosjektet lar deg organisere og vise LEGO-instruksjoner i et hierarkisk system:
- **Prosjekt** → (valgfritt) **Underprosjekter** → **Steg-bilder**

Dette prosjektet lar deg bla i instruksjonssteg som på en ekte LEGO-byggebok — men med dine egne modeller.

Nettsiden er bygget med ren HTML, CSS og JavaScript, og kan hostes hvor som helst som støtter statisk hosting.

## Funksjoner

### Første versjon

- **Prosjektgalleri**: Oversikt over alle tilgjengelige prosjekter med cover-bilder
- **Hierarkisk navigasjon**: Støtte for prosjekter med underprosjekter
- **Stegvis visning**: Naviger mellom instruksjonsbilder med pil-knapper
- **Progresjonslinje**: Vis hvor langt du har kommet, klikk/drag for å hoppe til spesifikt steg
- **Opp-navigasjon**: Knapp for å gå "ett hakk opp" i hierarkiet
- **Posisjonslagring**: Automatisk lagring av hvor du var (prosjekt + steg) i localStorage
- **Responsivt design**: Fungerer på mobil, nettbrett og PC
- **Ingen scroll**: Instruksjonsbildet tilpasses skjermen uten scrolling

### Planlagte funksjoner

- QR-kode-generering for å dele spesifikke steg
- Loading-indikatorer og preloading av bilder
- Caching-strategier for bedre ytelse

## Brukeropplevelse for barn 5–7 år

Prosjektet er primært laget for barn som ennå ikke kan lese flytende. UI-et skal derfor følge disse prinsippene:

- **Ikoner og tall fremfor tekst**: Bruk hus/pil-symboler, store neste/forrige-ikoner og tallformat (`3/10`) i stedet for strenger som “Steg 3 av 10”.
- **Store trykkflater**: Alle primærknapper skal minst være 44x44px – helst rundt 64px (≈2 cm) – med god avstand (`var(--spacing-md)`+) mellom elementene slik at små fingre treffer riktig.
- **Tydelig feedback**: Navigasjonsknapper skal animere/lyses opp ved trykk, og applikasjonen kan spille korte lyder eller vise små animasjoner (f.eks. konfetti ved fullføring) for å gi mestringsfølelse.
- **Hierarki uten tekst**: Opp/hjem-knappen skal være et ikon og ligge på samme sted på alle skjermer. Underprosjekter kan presenteres som egne tiles med klare bilder slik at barna skjønner hva som skjer uten beskrivelse.
- **Enkle interaksjoner**: Pilene er primærnavigasjon. Progresjonslinjen er sekundær (tapping fremfor presis dragging). Swipe-gestures på bildet kan implementeres som ekstra hjelp.
- **Tilgjengelighet**: Alle bilder skal ha `alt`-tekst myntet på foreldre, og fargevalg skal ha god kontrast slik at knappene er tydelige under alle lysforhold.
- **Onboarding**: Første gang appen åpnes, vis en visuell overlay (maskot/piler) som peker på det første prosjektet og forsvinner idet barnet trykker. Lagre i localStorage at onboarding er gjennomført.
- **Underprosjekter inline**: Prosjekter med `children` kan vises i samme skjerm som galleriet (flatt layout) slik at barnet slipper å navigere “opp ett nivå”. Viewer skal kun åpnes når man velger et konkret steg eller child.
- **Lyd og haptikk**: En høyttaler-knapp lar voksne skru av/på korte “klikk”-lyder. På enheter som støtter det kan knappetrykk trigge haptisk feedback. Eventuelle lydinstruksjoner per steg kan legges i `projects/<path>/audio/` og refereres fra `meta.json`.
- **Loading og belønning**: Mens bilder lastes skal en LEGO-inspirert spinner vises, og når siste steg fullføres vises en enkel gratulasjonsanimasjon (konfetti/badge) samt at progresjonen markeres som ferdig.
- **Barnemodus**: UI-et kan styres av en `childMode`-innstilling (lagret i localStorage eller konfigurasjonsfil). Når den er aktiv vil galleri/child-visning følge flat struktur, onboarding-overlegg aktiveres, og tekst erstattes med ikoner.

## Teknisk oversikt

- **Teknologi**: Ren HTML + CSS + JavaScript (ingen build tools eller dependencies)
- **Hosting**: Statisk hosting (designet for GitHub Pages)
- **Routing**: Hash-basert routing (`#/p/project1?step=3`)
- **State management**: localStorage for progresjonslagring
- **Dataformat**: JSON-filer (`meta.json` og `projects.json`)

## Bildstruktur og navngivning

### Bildnavn

Bilder skal navngis med formatet: `[nummer]*.png`

- Nummeret må komme først i filnavnet (dette er formatet som Bricklink Studio 2.0 genererer bildene på)
- Nummeret må stå først fordi filene sorteres automatisk basert på nummeret. Alt etter nummeret ignoreres ved sortering
- Etter nummeret kan det være hva som helst (f.eks. `_1x`, `_2x`, `_cover`, etc.)
- Filen må ende med `.png`

**Eksempler:**
- `1_1x.png`
- `174_1x.png`
- `1_2x.png`
- `1_cover.png`

### Cover-bilde

Hver prosjektmappe kan ha et spesielt `cover.png`-bilde som brukes som cover i prosjektgalleriet.

- Hvis `cover.png` finnes, brukes den som cover-bilde
- Hvis `cover.png` ikke finnes, brukes det første bildet (laveste nummer) som runtime fallback
- **Generering**: `cover.png` genereres automatisk fra siste bilde (høyeste nummer) ved bruk av `scripts/update-cover-images.js`

### Rekkefølge og sortering

Bildene sorteres automatisk basert på nummeret i filnavnet. Sørg for at nummerene er konsistente for riktig rekkefølge.

**Hvordan sortering fungerer:**
- Systemet leser kun nummeret i starten av filnavnet
- Alt etter nummeret (som `_1x`, `_cover`, `_2x`, etc.) ignoreres ved sortering
- Dette betyr at `1_1x.png`, `1_cover.png` og `1_2x.png` alle vil sorteres som nummer 1
- For å sikre riktig rekkefølge, bruk unike numre for hvert steg

## Filstruktur

```
/lego-instruksjoner/
  index.html
  /assets/
    /css/
      main.css
    /js/
      main.js
      router.js
      state.js
      view-project-grid.js
      view-viewer.js
      data-loader.js
  /projects/
    project1/
      meta.json
      cover.png (valgfritt)
      1_1x.png
      2_1x.png
      ...
      subproject-a/
        meta.json
        cover.png (valgfritt)
        1_1x.png
        2_1x.png
        ...
    project2/
      meta.json
      ...
  projects.json
```

## Hurtigstart

### 1. Klon eller last ned prosjektet

```bash
git clone <repository-url>
cd lego-instruksjoner
```

### 2. Legg til prosjekter

Se [Hvordan legge til nye prosjekter](#hvordan-legge-til-nye-prosjekter) nedenfor.

### 3. Test lokalt

Siden dette skal hostes på GitHub Pages, anbefales det å teste via en lokal webserver:

```bash
# Python 3
python -m http.server 8000

# Node.js (med http-server)
npx http-server -p 8000
```

Åpne nettleseren og gå til `http://localhost:8000`

### 4. Deploy til GitHub Pages

1. Push koden til GitHub-repositoryet
2. Gå til Settings → Pages i GitHub-repositoryet
3. Velg branch og mappe (vanligvis `main` og `/root`)
4. Nettsiden vil være tilgjengelig på `https://<username>.github.io/<repository-name>`

## Hvordan legge til nye prosjekter

**Kortversjon:**
1. Lag mappe under `/projects/`
2. Legg inn bilder med riktig navngivning
3. Lag `meta.json`-fil
4. (Valgfritt) Legg til underprosjekter
5. Oppdater `projects.json`

### Steg 1: Opprett prosjektmappe

Opprett en ny mappe under `/projects/` med et web-vennlig navn:

**Viktig**: Mappenavnet skal være web-vennlig:
- Bruk kebab-case: små bokstaver med bindestrek
- Ikke bruk mellomrom eller spesialtegn
- Konverter norske tegn: `æ` → `ae`, `ø` → `o`, `å` → `aa`

**Eksempler**:
- `"Huset Vårt"` → mappe: `huset-vaart`
- `"Alma sitt Rom"` → mappe: `alma-sitt-rom`
- `"Mitt Prosjekt"` → mappe: `mitt-prosjekt`

```
/projects/mitt-prosjekt/
```

**Merk**: Visningsnavnet (som vises i UI) settes i `meta.json` `name`-feltet og kan ha mellomrom og norske tegn.

### Steg 2: Legg til bilder

Legg alle instruksjonsbildene i prosjektmappen med riktig navngivning:

```
/projects/mitt-prosjekt/
  1_1x.png
  2_1x.png
  3_1x.png
  ...
```

### Steg 3: Legg til cover-bilde (valgfritt)

Hvis du vil ha et spesielt cover-bilde, legg det til som `cover.png`:

```
/projects/mitt-prosjekt/
  cover.png
  1_1x.png
  ...
```

### Steg 4: Opprett meta.json

Opprett en `meta.json`-fil i prosjektmappen:

```json
{
  "id": "mitt-prosjekt",
  "name": "Mitt Prosjekt",
  "coverImage": "cover.png",
  "steps": [
    "1_1x.png",
    "2_1x.png",
    "3_1x.png"
  ],
  "children": []
}
```

**Forklaring:**
- `id`: Unik identifikator for prosjektet
- `name`: Visningsnavn
- `coverImage`: Navn på cover-bildet (genereres automatisk fra siste bilde, eller første bilde som runtime fallback hvis ikke spesifisert)
- `steps`: Array med alle steg-bildene i riktig rekkefølge
- `children`: Array med underprosjekter (tom hvis ingen)

### Steg 5: Legg til underprosjekter (valgfritt)

Hvis prosjektet har underprosjekter:

1. Opprett undermappe: `/projects/mitt-prosjekt/underprosjekt-a/`
2. Legg til bilder og `meta.json` i undermappen
3. Oppdater `meta.json` i hovedprosjektet:

```json
{
  "id": "mitt-prosjekt",
  "name": "Mitt Prosjekt",
  "coverImage": "cover.png",
  "steps": [
    "1_1x.png",
    "2_1x.png"
  ],
  "children": [
    {
      "id": "underprosjekt-a",
      "name": "Underprosjekt A",
      "path": "underprosjekt-a"
    }
  ]
}
```

**Forklaring av `path`:**
- `path` er navnet på undermappen (relativ sti)
- Mappenavnet skal være web-vennlig (kebab-case, ingen mellomrom/spesialtegn)
- Hvis undermappen heter `taarn/`, settes `path` til `"taarn"`
- Dette er den relative stien fra hovedprosjektmappen til undermappen
- **Viktig**: Mappenavnet må matche `path`-verdien eksakt

**Eksempel på web-vennlig konvertering**:
- Originalt navn: `"Alma sitt Rom"` → mappe: `alma-sitt-rom`
- I `meta.json`: `"path": "alma-sitt-rom"`, `"name": "Alma sitt Rom"`

### Steg 6: Oppdater projects.json

Legg til det nye prosjektet i `projects.json` i rotmappen:

```json
[
  {
    "id": "mitt-prosjekt",
    "name": "Mitt Prosjekt",
    "path": "mitt-prosjekt"
  },
  {
    "id": "annet-prosjekt",
    "name": "Annet Prosjekt",
    "path": "annet-prosjekt"
  }
]
```

Se [DATA_FORMAT.md](./DATA_FORMAT.md) for detaljert dokumentasjon av JSON-formatene.

## Bruk

### Navigasjon

1. **Prosjektgalleri**: Startside viser alle tilgjengelige prosjekter
2. **Velg prosjekt**: Klikk på et prosjekt for å åpne det
3. **Naviger mellom steg**: Bruk pil-knappene eller progresjonslinjen
4. **Gå tilbake**: Bruk "Opp"-knappen for å gå ett nivå opp i hierarkiet
5. **Gå til prosjektgalleri**: Gå tilbake til rotnivået for å velge et annet prosjekt

### URL-struktur

- Prosjektgalleri: `/#/` eller `/#`
- Prosjekt: `/#/p/project1`
- Prosjekt med steg: `/#/p/project1?step=3`
- Underprosjekt: `/#/p/project1/subproject-a`

URL-en oppdateres automatisk når du navigerer, så du kan bookmarke spesifikke steg.

For tekniske detaljer om routing, state og modulstruktur, se [ARCHITECTURE.md](./ARCHITECTURE.md).

## Støttede plattformer

Nettsiden er designet for moderne nettlesere på:

- **Mobil**: iOS Safari, Chrome Mobile, Samsung Internet
- **Nettbrett**: iPad, Android-tabletter
- **PC**: Chrome, Firefox, Edge, Safari (siste versjoner)

Ingen støtte for eldre nettlesere (IE, etc.).

## Kjente begrensninger

Følgende funksjoner er planlagt for fremtidige versjoner:

- Loading-indikatorer mens bilder lastes
- Preloading av neste bilde for raskere navigasjon
- Caching-strategier for bedre ytelse
- Tastaturnavigasjon (piltaster, escape)
- Touch gestures på mobil (swipe)
- Ingen offline-støtte ennå (kommer med caching-strategien)

## Dokumentasjon

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Teknisk arkitektur og komponentoversikt
- [ROADMAP.md](./ROADMAP.md) - Implementasjonsplan og fremtidige funksjoner
- [DATA_FORMAT.md](./DATA_FORMAT.md) - Detaljert dokumentasjon av JSON-formater

## Skjermbilder

Skjermbilder av grensesnittet vil bli lagt til når UI-en er implementert.

## Lisens

Privat prosjekt – ingen redistribusjon.

