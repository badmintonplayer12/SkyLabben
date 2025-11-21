# Data Format

Dette dokumentet beskriver i detalj JSON-formatene som brukes i SkyLabben.

## Oversikt

Prosjektet bruker to hovedtyper JSON-filer:
- **`meta.json`**: Metadata for hvert prosjekt/underprosjekt
- **`projects.json`**: Liste over toppnivÃ¥-prosjekter

## meta.json

`meta.json`-filer beskriver metadata for et prosjekt eller underprosjekt. Hver prosjektmappe skal ha en `meta.json`-fil.

### Struktur

```json
{
  "id": "string",
  "name": "string",
  "coverImage": "string",
  "steps": ["string"],
  "children": [
    {
      "id": "string",
      "name": "string",
      "path": "string"
    }
  ]
}
```

### Felter

#### `id` (pÃ¥krevd)
- **Type**: String
- **Beskrivelse**: Unik identifikator for prosjektet/underprosjektet
- **Eksempler**: `"castle-main"`, `"castle-tower"`, `"mitt-prosjekt"`
- **Regler**:
  - MÃ¥ vÃ¦re unik innenfor samme nivÃ¥
  - Anbefales Ã¥ bruke kebab-case (smÃ¥ bokstaver med bindestrek)
  - Ikke bruk mellomrom eller spesialtegn

#### `name` (pÃ¥krevd)
- **Type**: String
- **Beskrivelse**: Visningsnavn som vises i brukergrensesnittet
- **Eksempler**: `"Stor borg"`, `"TÃ¥rn"`, `"Mitt Prosjekt"`
- **Regler**:
  - Kan inneholde mellomrom og norske tegn (Ã¦, Ã¸, Ã¥)
  - Dette er det navnet brukeren ser

#### `coverImage` (valgfritt)
- **Type**: String
- **Beskrivelse**: Filnavn pÃ¥ cover-bildet som brukes i prosjektgalleriet
- **Eksempler**: `"cover.png"`, `"1_cover.png"`
- **Regler**:
  - Hvis ikke spesifisert eller bildet ikke finnes, brukes det fÃ¸rste bildet (laveste nummer) som runtime fallback
  - MÃ¥ vÃ¦re et filnavn som finnes i samme mappe
  - Anbefales Ã¥ bruke `"cover.png"` for konsistens
  - **Generering**: `cover.png` genereres automatisk fra siste bilde (hÃ¸yeste nummer) ved bruk av `update-cover-images.js` scriptet

#### `category` (valgfritt)
- **Type**: String
- **Beskrivelse**: Kategori/etikett for filtrering i prosjektgalleriet
- **Eksempler**: "Star Wars", "Hjemmeprosjekt", "Demo"
- **Regler**:
  - Valgfri tekst som vises under prosjektnavnet
  - Bruk konsistente navn for Ã¥ gruppere prosjekter
#### `steps` (pÃ¥krevd)
- **Type**: Array of strings
- **Beskrivelse**: Liste over alle steg-bildene i riktig rekkefÃ¸lge
- **Eksempler**: 
  ```json
  ["1_1x.png", "2_1x.png", "3_1x.png"]
  ```
- **Regler**:
  - MÃ¥ vÃ¦re en array
  - Kan vÃ¦re tom array `[]` hvis prosjektet ikke har steg-bilder (f.eks. kun underprosjekter)
  - Hvis tom: viewer viser "Ingen steg tilgjengelig" og deaktiverer navigasjonskontroller
  - Filnavnene mÃ¥ matche faktiske filer i mappen
  - RekkefÃ¸lgen i arrayet bestemmer visningsrekkefÃ¸lgen
  - Bildene sorteres automatisk basert pÃ¥ nummeret i filnavnet (se README.md)

#### `children` (pÃ¥krevd)
- **Type**: Array of objects
- **Beskrivelse**: Liste over underprosjekter
- **Eksempler**: 
  ```json
  [
    {
      "id": "castle-tower",
      "name": "TÃ¥rn",
      "path": "subproject-tower"
    },
    {
      "id": "castle-gate",
      "name": "Port",
      "path": "subproject-gate"
    }
  ]
  ```
- **Regler**:
  - MÃ¥ vÃ¦re en array, selv om den er tom (`[]`)
  - Hvert objekt mÃ¥ ha `id`, `name` og `path`
  - `path` er relativ sti til undermappen (se nedenfor)

#### `audioSteps` (valgfritt)
- **Type**: Array of strings
- **Beskrivelse**: Lydfiler (en per steg) som kan spilles av i viewer for muntlig hjelp
- **Eksempler**:
  ```json
  "audioSteps": ["audio/1.mp3", "audio/2.mp3", "audio/3.mp3"]
  ```
- **Regler**:
  - Lengden bÃ¸r samsvare med `steps`. Manglende elementer betyr â€œingen lydâ€.
  - Filene mÃ¥ ligge i samme mappe eller en `audio/`-undermappe slik at URL bygges som `/projects/{path}/{audioSteps[i]}`
  - Filformat bÃ¸r vÃ¦re `.mp3` eller `.ogg` for bred stÃ¸tte

#### `children[].id` (pÃ¥krevd)
- **Type**: String
- **Beskrivelse**: Unik identifikator for underprosjektet
- **Regler**: Samme regler som toppnivÃ¥ `id`

#### `children[].name` (pÃ¥krevd)
- **Type**: String
- **Beskrivelse**: Visningsnavn for underprosjektet
- **Regler**: Samme regler som toppnivÃ¥ `name`

#### `children[].path` (pÃ¥krevd)
- **Type**: String
- **Beskrivelse**: Relativ sti til undermappen fra hovedprosjektmappen
- **Eksempler**: 
  - Hvis undermappen heter `taarn/` og ligger i `/projects/castle-main/taarn/`, settes `path` til `"taarn"`
  - Hvis undermappen heter `subproject-tower/`, settes `path` til `"subproject-tower"`
- **Regler**:
  - MÃ¥ vÃ¦re navnet pÃ¥ undermappen (uten trailing slash)
  - MÃ¥ matche faktisk mappestruktur
  - Relativ fra hovedprosjektmappen, ikke absolutt sti
  - Brukes til Ã¥ bygge full sti: `/projects/{hovedprosjekt-path}/{path}/meta.json`
  - **Viktig**: Mappenavnet skal vÃ¦re web-vennlig (kebab-case, ingen mellomrom/spesialtegn)

#### `children[].hidden` (valgfritt)
- **Type**: Boolean
- **Beskrivelse**: Hvis `true`, skjules underprosjektet fra visning i children-liste
- **Eksempler**: `true`, `false`
- **Regler**:
  - Hvis ikke spesifisert eller `false`, vises underprosjektet normalt
  - Hvis `true`, skjules det fra children-listen i viewer
  - Skjulte underprosjekter er fortsatt tilgjengelige via direkte URL
  - Brukes for Ã¥ skjule uferdige eller private underprosjekter

#### `approvedByDefault` (valgfritt, default `true`)
- **Type**: Boolean
- **Beskrivelse**: Standard synlighet i barnemodus ved publikasjon.
- **Regler**:
  - `true` eller utelatt: vises for barn (med mindre override lokalt skjuler det).
  - `false`: skjules for barn som standard (vises i foreldremodus, kan åpnes via direkte URL).
  - Overrider kan settes per enhet via `visibilityOverrides` (localStorage).

#### `releaseAt` (valgfritt, ikke i bruk ennå)
- **Type**: String (ISO 8601 UTC), f.eks. `"2025-12-24T18:00:00Z"`
- **Beskrivelse**: Fremtidig tidsstyring. Feltet kan finnes i data, men koden ignorerer det foreløpig (forberedt for senere).

### Eksempler

#### Prosjekt uten underprosjekter

```json
{
  "id": "castle-tower",
  "name": "TÃ¥rn",
  "coverImage": "cover.png",
  "steps": [
    "1_1x.png",
    "2_1x.png",
    "3_1x.png"
  ],
  "children": []
}
```

#### Prosjekt med underprosjekter

```json
{
  "id": "castle-main",
  "name": "Stor borg",
  "coverImage": "cover.png",
  "steps": [
    "step-001.png",
    "step-002.png",
    "step-003.png"
  ],
  "children": [
    {
      "id": "castle-tower",
      "name": "TÃ¥rn",
      "path": "subproject-tower"
    },
    {
      "id": "castle-gate",
      "name": "Port",
      "path": "subproject-gate",
      "hidden": true
    }
  ]
}
```

#### Prosjekt med egne bilder og underprosjekter

Et prosjekt kan ha bÃ¥de egne steg-bilder og underprosjekter:

```json
  {
    "id": "house-main",
    "name": "Huset VÃ¥rt",
    "coverImage": "cover.png",
    "steps": [
      "174_1x.png",
      "175_1x.png",
      "176_1x.png",
      "177_1x.png",
      "178_1x.png",
      "179_1x.png"
    ],
    "children": [
      {
        "id": "spiserom",
        "name": "1-Spiserom",
        "path": "1-spiserom"
      },
      {
        "id": "alma-rom",
        "name": "2-Alma sitt Rom",
        "path": "2-alma-sitt-rom"
      }
    ]
  }
```

## projects.json

`projects.json` ligger i rotmappen og lister alle toppnivÃ¥-prosjekter.

### Struktur

```json
[
  {
    "id": "string",
    "name": "string",
    "path": "string"
  }
]
```

### Felter

#### `id` (pÃ¥krevd)
- **Type**: String
- **Beskrivelse**: Unik identifikator for prosjektet
- **Regler**: Samme regler som `meta.json` `id`
- **Viktig**: MÃ¥ matche `id` i prosjektets `meta.json`

#### `name` (pÃ¥krevd)
- **Type**: String
- **Beskrivelse**: Visningsnavn for prosjektet
- **Regler**: Samme regler som `meta.json` `name`
- **Viktig**: MÃ¥ matche `name` i prosjektets `meta.json` (anbefalt, men ikke pÃ¥krevd)

#### `path` (pÃ¥krevd)
- **Type**: String
- **Beskrivelse**: Relativ sti til prosjektmappen fra `/projects/`
- **Eksempler**: 
  - Hvis prosjektet ligger i `/projects/castle-main/`, settes `path` til `"castle-main"`
  - Hvis prosjektet ligger i `/projects/mitt-prosjekt/`, settes `path` til `"mitt-prosjekt"`
- **Regler**:
  - MÃ¥ vÃ¦re navnet pÃ¥ prosjektmappen (uten trailing slash)
  - MÃ¥ matche faktisk mappestruktur
  - Relativ fra `/projects/`, ikke absolutt sti
  - Brukes til Ã¥ bygge full sti: `/projects/{path}/meta.json`
  - **Viktig**: Mappenavnet skal vÃ¦re web-vennlig (se nedenfor)

#### `hidden` (valgfritt)
- **Type**: Boolean
- **Beskrivelse**: Hvis `true`, skjules prosjektet fra prosjektgalleri
- **Eksempler**: `true`, `false`
- **Regler**:
  - Hvis ikke spesifisert eller `false`, vises prosjektet normalt i galleri
  - Hvis `true`, skjules det fra prosjektgalleri
  - Skjulte prosjekter er fortsatt tilgjengelige via direkte URL
  - Brukes for Ã¥ skjule uferdige eller private prosjekter
#### `category` (valgfritt)
- **Type**: String
- **Beskrivelse**: Kategori/etikett brukt til filtrering og visning i galleriet
- **Eksempler**: "Star Wars", "Hjemmeprosjekt", "Demo"
- **Regler**:
  - Samme verdi som i prosjektets `meta.json` (hvis satt)
  - Valgfritt – hvis utelatt grupperes prosjektet under "Uten kategori"

### Eksempel

```json
[
  {
    "id": "project1",
    "name": "Stor borg",
    "path": "project1"
  },
  {
    "id": "project2",
    "name": "Uferdig prosjekt",
    "path": "project2",
    "hidden": true
  },
  {
    "id": "project3",
    "name": "Romskip",
    "path": "project3"
  },
  {
    "id": "house-main",
    "name": "Huset VÃ¥rt",
    "path": "huset-vaart"
  }
]
```

## Sti-bygging

### Hvordan stier bygges

1. **ToppnivÃ¥-prosjekt**:
   - Fra `projects.json`: `path = "castle-main"`
   - Full sti: `/projects/castle-main/meta.json`

2. **Underprosjekt**:
   - Fra `projects.json`: `path = "castle-main"`
   - Fra `meta.json` children: `path = "subproject-tower"`
   - Full sti: `/projects/castle-main/subproject-tower/meta.json`

3. **Bilde-URL**:
   - Prosjekt: `/projects/castle-main/`
   - Bilde: `1_1x.png`
   - Full URL: `/projects/castle-main/1_1x.png`

### Eksempel pÃ¥ komplett hierarki

```
/projects/
  castle-main/
    meta.json          # id: "castle-main", children: [{id: "tower", path: "tower"}]
    cover.png
    1_1x.png
    2_1x.png
    tower/
      meta.json        # id: "tower", children: []
      cover.png
      1_1x.png
      2_1x.png

projects.json:
[
  {id: "castle-main", name: "Stor borg", path: "castle-main"}
]
```

## Validering

### PÃ¥krevde felt

Alle fÃ¸lgende felt er pÃ¥krevd og mÃ¥ vÃ¦re tilstede:

**meta.json**:
- `id`
- `name`
- `steps` (kan vÃ¦re tom array)
- `children` (kan vÃ¦re tom array)

**projects.json**:
- Hvert objekt mÃ¥ ha `id`, `name`, og `path`

### Valideringsregler

1. **Unike ID-er**: `id` mÃ¥ vÃ¦re unik innenfor samme nivÃ¥
2. **Matchende stier**: `path` i `projects.json` og `children` mÃ¥ matche faktiske mapper
3. **Eksisterende filer**: Alle filnavn i `steps` og `coverImage` mÃ¥ referere til faktiske filer
4. **Gyldig JSON**: Alle filer mÃ¥ vÃ¦re gyldig JSON
5. **Array-typer**: `steps` og `children` mÃ¥ vÃ¦re arrays, selv om de er tomme

### FeilhÃ¥ndtering

Hvis en `meta.json` eller `projects.json` er ugyldig:
- Applikasjonen vil prÃ¸ve Ã¥ hÃ¥ndtere feilen gracefully
- Feilmeldinger vises i konsollen
- Manglende prosjekter vil ikke vises i galleriet

## Beste praksis

### Navngiving

- **ID-er**: Bruk kebab-case (`castle-main`, `spiserom`)
- **Navn**: Bruk lesbare navn med mellomrom (`"Stor borg"`, `"Alma sitt Rom"`)
- **Paths**: Bruk samme navn som mappen (mÃ¥ vÃ¦re web-vennlig, se nedenfor)
- **Mappenavn**: MÃ¥ vÃ¦re web-vennlig (se nedenfor)

### Web-vennlige mappenavn

**Krav til mappenavn** (gjelder bÃ¥de hovedprosjekter og underprosjekter):
- Bruk kebab-case: smÃ¥ bokstaver med bindestrek (`huset-vaart`, `alma-sitt-rom`)
- Ikke bruk mellomrom eller spesialtegn
- Konverter norske tegn: `Ã¦` â†’ `ae`, `Ã¸` â†’ `o`, `Ã¥` â†’ `aa`
- Eksempler:
  - `"Huset VÃ¥rt"` â†’ mappe: `huset-vaart`
  - `"Alma sitt Rom"` â†’ mappe: `alma-sitt-rom`
  - `"1-Spiserom"` â†’ mappe: `1-spiserom` (tall er OK)

**Hvorfor?**
- URL-er blir rene og lesbare (`#/p/huset-vaart` i stedet for `#/p/Huset%20V%C3%A5rt`)
- Fungerer konsistent pÃ¥ alle servere og nettlesere
- Enklere Ã¥ hÃ¥ndtere i kode og filstier

**Visningsnavn (`name`-feltet)**:
- Kan fortsatt ha mellomrom og norske tegn (`"Huset VÃ¥rt"`, `"Alma sitt Rom"`)
- Dette er det navnet brukeren ser i UI
- Skal vÃ¦re lesbart og forstÃ¥elig for brukeren

### Organisering

- Hold `meta.json` og `projects.json` synkronisert
- Bruk konsistent navngiving for bilder (`1_1x.png`, `2_1x.png`, etc.)
- Organiser underprosjekter logisk i mapper

### Vedlikehold

- Oppdater `projects.json` nÃ¥r nye prosjekter legges til
- SÃ¸rg for at alle `path`-referanser er korrekte
- Test at alle bilder eksisterer etter endringer

## Eksempel pÃ¥ komplett oppsett

### Filstruktur

```
/projects/
  castle-main/
    meta.json
    cover.png
    1_1x.png
    2_1x.png
    tower/
      meta.json
      cover.png
      1_1x.png
      2_1x.png
  spaceship/
    meta.json
    cover.png
    1_1x.png
    2_1x.png
    3_1x.png

projects.json
```

### projects.json

```json
[
  {
    "id": "castle-main",
    "name": "Stor borg",
    "path": "castle-main"
  },
  {
    "id": "spaceship",
    "name": "Romskip",
    "path": "spaceship"
  }
]
```

### /projects/castle-main/meta.json

```json
{
  "id": "castle-main",
  "name": "Stor borg",
  "coverImage": "cover.png",
  "steps": [
    "1_1x.png",
    "2_1x.png"
  ],
  "children": [
    {
      "id": "tower",
      "name": "TÃ¥rn",
      "path": "tower"
    }
  ]
}
```

### /projects/castle-main/tower/meta.json

```json
{
  "id": "tower",
  "name": "TÃ¥rn",
  "coverImage": "cover.png",
  "steps": [
    "1_1x.png",
    "2_1x.png"
  ],
  "children": []
}
```

### /projects/spaceship/meta.json

```json
{
  "id": "spaceship",
  "name": "Romskip",
  "coverImage": "cover.png",
  "steps": [
    "1_1x.png",
    "2_1x.png",
    "3_1x.png"
  ],
  "children": []
}
```

