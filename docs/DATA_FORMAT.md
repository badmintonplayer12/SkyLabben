# Data Format

Dette dokumentet beskriver i detalj JSON-formatene som brukes i LEGO Instruksjonsvisning-prosjektet.

## Oversikt

Prosjektet bruker to hovedtyper JSON-filer:
- **`meta.json`**: Metadata for hvert prosjekt/underprosjekt
- **`projects.json`**: Liste over toppnivå-prosjekter

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

#### `id` (påkrevd)
- **Type**: String
- **Beskrivelse**: Unik identifikator for prosjektet/underprosjektet
- **Eksempler**: `"castle-main"`, `"castle-tower"`, `"mitt-prosjekt"`
- **Regler**:
  - Må være unik innenfor samme nivå
  - Anbefales å bruke kebab-case (små bokstaver med bindestrek)
  - Ikke bruk mellomrom eller spesialtegn

#### `name` (påkrevd)
- **Type**: String
- **Beskrivelse**: Visningsnavn som vises i brukergrensesnittet
- **Eksempler**: `"Stor borg"`, `"Tårn"`, `"Mitt Prosjekt"`
- **Regler**:
  - Kan inneholde mellomrom og norske tegn (æ, ø, å)
  - Dette er det navnet brukeren ser

#### `coverImage` (valgfritt)
- **Type**: String
- **Beskrivelse**: Filnavn på cover-bildet som brukes i prosjektgalleriet
- **Eksempler**: `"cover.png"`, `"1_cover.png"`
- **Regler**:
  - Hvis ikke spesifisert eller bildet ikke finnes, brukes det første bildet (laveste nummer) som runtime fallback
  - Må være et filnavn som finnes i samme mappe
  - Anbefales å bruke `"cover.png"` for konsistens
  - **Generering**: `cover.png` genereres automatisk fra siste bilde (høyeste nummer) ved bruk av `update-cover-images.js` scriptet

#### `steps` (påkrevd)
- **Type**: Array of strings
- **Beskrivelse**: Liste over alle steg-bildene i riktig rekkefølge
- **Eksempler**: 
  ```json
  ["1_1x.png", "2_1x.png", "3_1x.png"]
  ```
- **Regler**:
  - Må være en array
  - Kan være tom array `[]` hvis prosjektet ikke har steg-bilder (f.eks. kun underprosjekter)
  - Hvis tom: viewer viser "Ingen steg tilgjengelig" og deaktiverer navigasjonskontroller
  - Filnavnene må matche faktiske filer i mappen
  - Rekkefølgen i arrayet bestemmer visningsrekkefølgen
  - Bildene sorteres automatisk basert på nummeret i filnavnet (se README.md)

#### `children` (påkrevd)
- **Type**: Array of objects
- **Beskrivelse**: Liste over underprosjekter
- **Eksempler**: 
  ```json
  [
    {
      "id": "castle-tower",
      "name": "Tårn",
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
  - Må være en array, selv om den er tom (`[]`)
  - Hvert objekt må ha `id`, `name` og `path`
  - `path` er relativ sti til undermappen (se nedenfor)

#### `audioSteps` (valgfritt)
- **Type**: Array of strings
- **Beskrivelse**: Lydfiler (en per steg) som kan spilles av i viewer for muntlig hjelp
- **Eksempler**:
  ```json
  "audioSteps": ["audio/1.mp3", "audio/2.mp3", "audio/3.mp3"]
  ```
- **Regler**:
  - Lengden bør samsvare med `steps`. Manglende elementer betyr “ingen lyd”.
  - Filene må ligge i samme mappe eller en `audio/`-undermappe slik at URL bygges som `/projects/{path}/{audioSteps[i]}`
  - Filformat bør være `.mp3` eller `.ogg` for bred støtte

#### `children[].id` (påkrevd)
- **Type**: String
- **Beskrivelse**: Unik identifikator for underprosjektet
- **Regler**: Samme regler som toppnivå `id`

#### `children[].name` (påkrevd)
- **Type**: String
- **Beskrivelse**: Visningsnavn for underprosjektet
- **Regler**: Samme regler som toppnivå `name`

#### `children[].path` (påkrevd)
- **Type**: String
- **Beskrivelse**: Relativ sti til undermappen fra hovedprosjektmappen
- **Eksempler**: 
  - Hvis undermappen heter `taarn/` og ligger i `/projects/castle-main/taarn/`, settes `path` til `"taarn"`
  - Hvis undermappen heter `subproject-tower/`, settes `path` til `"subproject-tower"`
- **Regler**:
  - Må være navnet på undermappen (uten trailing slash)
  - Må matche faktisk mappestruktur
  - Relativ fra hovedprosjektmappen, ikke absolutt sti
  - Brukes til å bygge full sti: `/projects/{hovedprosjekt-path}/{path}/meta.json`
  - **Viktig**: Mappenavnet skal være web-vennlig (kebab-case, ingen mellomrom/spesialtegn)

#### `children[].hidden` (valgfritt)
- **Type**: Boolean
- **Beskrivelse**: Hvis `true`, skjules underprosjektet fra visning i children-liste
- **Eksempler**: `true`, `false`
- **Regler**:
  - Hvis ikke spesifisert eller `false`, vises underprosjektet normalt
  - Hvis `true`, skjules det fra children-listen i viewer
  - Skjulte underprosjekter er fortsatt tilgjengelige via direkte URL
  - Brukes for å skjule uferdige eller private underprosjekter

### Eksempler

#### Prosjekt uten underprosjekter

```json
{
  "id": "castle-tower",
  "name": "Tårn",
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
      "name": "Tårn",
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

Et prosjekt kan ha både egne steg-bilder og underprosjekter:

```json
  {
    "id": "house-main",
    "name": "Huset Vårt",
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

`projects.json` ligger i rotmappen og lister alle toppnivå-prosjekter.

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

#### `id` (påkrevd)
- **Type**: String
- **Beskrivelse**: Unik identifikator for prosjektet
- **Regler**: Samme regler som `meta.json` `id`
- **Viktig**: Må matche `id` i prosjektets `meta.json`

#### `name` (påkrevd)
- **Type**: String
- **Beskrivelse**: Visningsnavn for prosjektet
- **Regler**: Samme regler som `meta.json` `name`
- **Viktig**: Må matche `name` i prosjektets `meta.json` (anbefalt, men ikke påkrevd)

#### `path` (påkrevd)
- **Type**: String
- **Beskrivelse**: Relativ sti til prosjektmappen fra `/projects/`
- **Eksempler**: 
  - Hvis prosjektet ligger i `/projects/castle-main/`, settes `path` til `"castle-main"`
  - Hvis prosjektet ligger i `/projects/mitt-prosjekt/`, settes `path` til `"mitt-prosjekt"`
- **Regler**:
  - Må være navnet på prosjektmappen (uten trailing slash)
  - Må matche faktisk mappestruktur
  - Relativ fra `/projects/`, ikke absolutt sti
  - Brukes til å bygge full sti: `/projects/{path}/meta.json`
  - **Viktig**: Mappenavnet skal være web-vennlig (se nedenfor)

#### `hidden` (valgfritt)
- **Type**: Boolean
- **Beskrivelse**: Hvis `true`, skjules prosjektet fra prosjektgalleri
- **Eksempler**: `true`, `false`
- **Regler**:
  - Hvis ikke spesifisert eller `false`, vises prosjektet normalt i galleri
  - Hvis `true`, skjules det fra prosjektgalleri
  - Skjulte prosjekter er fortsatt tilgjengelige via direkte URL
  - Brukes for å skjule uferdige eller private prosjekter

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
    "name": "Huset Vårt",
    "path": "huset-vaart"
  }
]
```

## Sti-bygging

### Hvordan stier bygges

1. **Toppnivå-prosjekt**:
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

### Eksempel på komplett hierarki

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

### Påkrevde felt

Alle følgende felt er påkrevd og må være tilstede:

**meta.json**:
- `id`
- `name`
- `steps` (kan være tom array)
- `children` (kan være tom array)

**projects.json**:
- Hvert objekt må ha `id`, `name`, og `path`

### Valideringsregler

1. **Unike ID-er**: `id` må være unik innenfor samme nivå
2. **Matchende stier**: `path` i `projects.json` og `children` må matche faktiske mapper
3. **Eksisterende filer**: Alle filnavn i `steps` og `coverImage` må referere til faktiske filer
4. **Gyldig JSON**: Alle filer må være gyldig JSON
5. **Array-typer**: `steps` og `children` må være arrays, selv om de er tomme

### Feilhåndtering

Hvis en `meta.json` eller `projects.json` er ugyldig:
- Applikasjonen vil prøve å håndtere feilen gracefully
- Feilmeldinger vises i konsollen
- Manglende prosjekter vil ikke vises i galleriet

## Beste praksis

### Navngiving

- **ID-er**: Bruk kebab-case (`castle-main`, `spiserom`)
- **Navn**: Bruk lesbare navn med mellomrom (`"Stor borg"`, `"Alma sitt Rom"`)
- **Paths**: Bruk samme navn som mappen (må være web-vennlig, se nedenfor)
- **Mappenavn**: Må være web-vennlig (se nedenfor)

### Web-vennlige mappenavn

**Krav til mappenavn** (gjelder både hovedprosjekter og underprosjekter):
- Bruk kebab-case: små bokstaver med bindestrek (`huset-vaart`, `alma-sitt-rom`)
- Ikke bruk mellomrom eller spesialtegn
- Konverter norske tegn: `æ` → `ae`, `ø` → `o`, `å` → `aa`
- Eksempler:
  - `"Huset Vårt"` → mappe: `huset-vaart`
  - `"Alma sitt Rom"` → mappe: `alma-sitt-rom`
  - `"1-Spiserom"` → mappe: `1-spiserom` (tall er OK)

**Hvorfor?**
- URL-er blir rene og lesbare (`#/p/huset-vaart` i stedet for `#/p/Huset%20V%C3%A5rt`)
- Fungerer konsistent på alle servere og nettlesere
- Enklere å håndtere i kode og filstier

**Visningsnavn (`name`-feltet)**:
- Kan fortsatt ha mellomrom og norske tegn (`"Huset Vårt"`, `"Alma sitt Rom"`)
- Dette er det navnet brukeren ser i UI
- Skal være lesbart og forståelig for brukeren

### Organisering

- Hold `meta.json` og `projects.json` synkronisert
- Bruk konsistent navngiving for bilder (`1_1x.png`, `2_1x.png`, etc.)
- Organiser underprosjekter logisk i mapper

### Vedlikehold

- Oppdater `projects.json` når nye prosjekter legges til
- Sørg for at alle `path`-referanser er korrekte
- Test at alle bilder eksisterer etter endringer

## Eksempel på komplett oppsett

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
      "name": "Tårn",
      "path": "tower"
    }
  ]
}
```

### /projects/castle-main/tower/meta.json

```json
{
  "id": "tower",
  "name": "Tårn",
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

