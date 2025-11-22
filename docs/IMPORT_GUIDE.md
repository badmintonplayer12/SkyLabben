# Import Guide - Konvertering av prosjekter til web-vennlig format

Denne guiden hjelper deg med å konvertere eksisterende prosjekter med mellomrom og spesialtegn til web-vennlig format.

**Anbefalt**: Bruk automatiske scripts for trygg konvertering:
- `scripts/convert-to-web-friendly.js` - Konverterer mapper til web-vennlig format
- `scripts/update-cover-images.js` - Genererer/oppdaterer cover-bilder
- `scripts/update-version.js` - Bumper versjon for service worker og data-cache (bruk etter innholdsoppdatering for å tvinge klientoppdatering)

## Skjule nye prosjekter for barn (inntil forelder skrur på)

Standard er at prosjekter vises for barn. Hvis et nytt prosjekt skal være skjult i barnemodus til forelder aktiverer det:
- I `projects.json`: sett `approvedByDefault: false` på prosjektet.
- I prosjektets `meta.json`: sett `approvedByDefault: false` på child-objektet i `children`-arrayen.

**Eksempel - skjule et child (underprosjekt) for barn:**

I `projects/huset-vaart/meta.json`:
```json
{
  "id": "huset-vaart",
  "name": "Huset Vårt",
  "children": [
    {
      "id": "13-hjemmehjelperen",
      "name": "13-Hjemmehjelperen",
      "path": "13-hjemmehjelperen",
      "approvedByDefault": false
    }
  ]
}
```

**Eksempel - skjule et toppnivå-prosjekt for barn:**

I `projects.json`:
```json
[
  {
    "id": "mitt-prosjekt",
    "name": "Mitt Prosjekt",
    "path": "mitt-prosjekt",
    "approvedByDefault": false
  }
]
```

I `projects/mitt-prosjekt/meta.json`:
```json
{
  "id": "mitt-prosjekt",
  "name": "Mitt Prosjekt",
  "approvedByDefault": false
}
```

**Hva dette betyr:**
- `approvedByDefault: false`: Prosjektet/child-en skjules for barn som standard (vises ikke i barnemodus).
- Prosjektet vises fortsatt i foreldremodus.
- Prosjektet kan fortsatt åpnes via direkte URL også i barnemodus.
- Forelder kan slå prosjektet på via toggle i foreldremodus (lagres lokalt i `legoInstructions.visibilityOverrides`).

Se seksjoner "Automatisk konvertering med Node.js-script" og "Cover-bilder" nedenfor.

## Hvorfor web-vennlige mapper?

Mapper med mellomrom og spesialtegn (f.eks. `"Huset Vårt"`) kan gi problemer:
- URL-er blir mindre lesbare (`#/p/Huset%20V%C3%A5rt`)
- Potensielle problemer på ulike servere
- Inkonsistente filstier

**Løsning**: Bruk web-vennlige mappenavn og sett visningsnavnet i `meta.json` `name`-feltet.

## Konverteringsregler

### Mappenavn → Web-vennlig format

1. **Konverter til små bokstaver**
   - `"Huset Vårt"` → `"huset vårt"`

2. **Erstatt mellomrom med bindestrek**
   - `"huset vårt"` → `"huset-vaart"`

3. **Konverter norske tegn**
   - `æ` → `ae`
   - `ø` → `o`
   - `å` → `aa`
   - `"huset vårt"` → `"huset-vaart"`

4. **Fjern eller erstatt andre spesialtegn**
   - Behold kun bokstaver, tall og bindestreker
   - Eksempel: `"1-Spiserom"` → `"1-spiserom"` (tall er OK)

### Formatering av visningsnavn (name-feltet)

Når prosjekter eller underprosjekter starter med et tall etterfulgt av bindestrek (f.eks. `1-kjokken`, `7-kjokken`), skal visningsnavnet (`name`-feltet) ha mellomrom før og etter bindestreken som kommer etter tallet.

**Regel:**
- Hvis mappenavnet starter med tall etterfulgt av bindestrek: legg til mellomrom før og etter bindestreken i visningsnavnet
- Eksempel: `"7-kjokken"` → `"name": "7 - Kjøkken"` (med mellomrom og stor forbokstav)

**Eksempler:**
- Mappe: `1-spiserom` → `"name": "1 - Spiserom"`
- Mappe: `7-kjokken` → `"name": "7 - Kjøkken"`
- Mappe: `10-simon-sitt-rom` → `"name": "10 - Simon sitt rom"`

**Hvor dette skal settes:**
- I `meta.json`-filen for prosjektet/underprosjektet: `"name": "7 - Kjøkken"`
- I `children`-arrayen i parent `meta.json`: `"name": "7 - Kjøkken"`

### Eksempler

| Originalt navn | Web-vennlig mappe | `id` i JSON | `name` i JSON | `path` i JSON |
|----------------|-------------------|-------------|---------------|---------------|
| `Huset Vårt` | `huset-vaart` | `huset-vaart` | `"Huset Vårt"` | `huset-vaart` |
| `Alma sitt Rom` | `alma-sitt-rom` | `alma-sitt-rom` | `"Alma sitt Rom"` | `alma-sitt-rom` |
| `1-Spiserom` | `1-spiserom` | `1-spiserom` | `"1 - Spiserom"` | `1-spiserom` |
| `7-Kjøkken` | `7-kjokken` | `7-kjokken` | `"7 - Kjøkken"` | `7-kjokken` |
| `10-Simon sitt rom` | `10-simon-sitt-rom` | `10-simon-sitt-rom` | `"10 - Simon sitt rom"` | `10-simon-sitt-rom` |

## Steg-for-steg konvertering

### Steg 1: Identifiser prosjektet

Finn prosjektet som skal konverteres:
```
/projects/Huset Vårt/
```

### Steg 2: Konverter mappenavn

1. Bestem web-vennlig navn:
   - `"Huset Vårt"` → `"huset-vaart"`

2. Omdøp mappen:
   ```
   /projects/Huset Vårt/  →  /projects/huset-vaart/
   ```

### Steg 3: Oppdater meta.json

Opprett eller oppdater `meta.json` i prosjektmappen:

```json
{
  "id": "huset-vaart",
  "name": "Huset Vårt",
  "coverImage": "cover.png",
  "steps": [],
  "children": []
    }
   ```

3. **Oppdater meta.json for hvert underprosjekt**:

**Viktig**:
- `id`: Web-vennlig identifikator (samme som mappenavn)
- `name`: Originalt visningsnavn (kan ha mellomrom og norske tegn)
- `path` i children: Web-vennlig mappenavn (hvis underprosjekter)

### Steg 4: Konverter underprosjekter

Hvis prosjektet har underprosjekter:

1. **Omdøp undermapper**:
   ```
   /projects/huset-vaart/1-Spiserom/  →  /projects/huset-vaart/1-spiserom/
   /projects/huset-vaart/2-Alma sitt Rom/  →  /projects/huset-vaart/2-alma-sitt-rom/
   ```

2. **Oppdater meta.json for hovedprosjekt**:
   ```json
   {
     "id": "huset-vaart",
     "name": "Huset Vårt",
     "coverImage": "cover.png",
     "steps": [],
     "children": [
       {
         "id": "1-spiserom",
         "name": "1-Spiserom",
         "path": "1-spiserom"
       },
       {
         "id": "2-alma-sitt-rom",
         "name": "2-Alma sitt Rom",
         "path": "2-alma-sitt-rom"
       }
    ]
  }
  ```

   **Tips**: Nummeret før første bindestrek (`1-`, `2-`, `10-` …) bestemmer rekkefølgen barna vises i. `convert-to-web-friendly.js` sorterer automatisk barna numerisk, så behold prefiksene hvis du vil styre rekkefølgen.

3. **Oppdater meta.json for hvert underprosjekt**:
   ```json
   {
     "id": "1-spiserom",
     "name": "1-Spiserom",
     "coverImage": "cover.png",
     "steps": ["1_1x.png", "2_1x.png", ...],
     "children": []
   }
   ```

### Steg 5: Oppdater projects.json

Legg til prosjektet i `projects.json`:

```json
[
  {
    "id": "huset-vaart",
    "name": "Huset Vårt",
    "path": "huset-vaart"
  }
]
```

**Viktig**: `path` må matche det nye mappenavnet.

## Automatisk konvertering med Node.js-script

Det finnes et Node.js-script som automatiserer hele konverteringsprosessen:

### Bruk av scriptet

**Plassering**: `scripts/convert-to-web-friendly.js`

**Bruk**:

```bash
# 1. Først: Dry run for å se hva som vil skje (anbefalt!)
node scripts/convert-to-web-friendly.js --dry-run

# 2. Generer meta.json filer (uten å omdøpe mapper)
node scripts/convert-to-web-friendly.js

# 3. Omdøp mapper også (krever bekreftelse)
node scripts/convert-to-web-friendly.js --confirm
```

**Hva scriptet gjør**:

1. ✅ Scanner alle mapper i `/projects/`
2. ✅ Lagrer originale navn (for `name`-feltet i JSON)
3. ✅ Konverterer til web-vennlige navn
4. ✅ Genererer/oppdaterer alle `meta.json` filer automatisk
5. ✅ Oppdaterer `projects.json`
6. ✅ Omdøper mapper (kun med `--confirm` flag)

**Sikkerhet**:
- Scriptet gjør **aldri** destruktive endringer uten `--confirm`
- Bruk `--dry-run` først for å se hva som vil skje
- Scriptet sjekker om mapper allerede eksisterer før omdøping

### Eksempel på bruk

```bash
# 1. Se hva som vil skje
$ node scripts/convert-to-web-friendly.js --dry-run

🔍 Scanner prosjektmapper...
📦 Fant 2 prosjekt(er):
📁 Huset Vårt
   → Omdøpes til: huset-vaart
   Bilder: 0
   Underprosjekter: 9
      - 1-Spiserom
        → Omdøpes til: 1-spiserom
        Bilder: 18
      ...

🔍 DRY RUN - Ingen endringer gjort

# 2. Generer JSON-filer (trygt, omdøper ikke mapper)
$ node scripts/convert-to-web-friendly.js

💾 Skriver meta.json filer...
   ✓ projects/huset-vaart/meta.json
   ✓ projects/huset-vaart/1-spiserom/meta.json
   ...

💾 Skriver projects.json...
   ✓ projects.json

⚠️  Omdøping av mapper krever bekreftelse.
   Kjør scriptet med --confirm for å omdøpe mapper.

# 3. Omdøp mapper (kun hvis du er sikker)
$ node scripts/convert-to-web-friendly.js --confirm
```

## Automatisk konvertering (for AI - manuell metode)

Hvis du ikke kan bruke scriptet, følg denne prosessen:

### Input
- Originalt prosjektnavn: `"Huset Vårt"`
- Mappe: `/projects/Huset Vårt/`

### Prosess

1. **Konverter navn til web-vennlig format**:
   ```javascript
   function toWebFriendly(name) {
     return name
       .toLowerCase()
       .replace(/æ/g, 'ae')
       .replace(/ø/g, 'o')
       .replace(/å/g, 'aa')
       .replace(/\s+/g, '-')
       .replace(/[^a-z0-9-]/g, '');
   }
   
   // Eksempel:
   toWebFriendly("Huset Vårt") // → "huset-vaart"
   ```

2. **Omdøp mappe** (hvis nødvendig):
   - Fra: `/projects/Huset Vårt/`
   - Til: `/projects/huset-vaart/`

3. **Generer meta.json**:
   ```json
   {
     "id": "huset-vaart",
     "name": "Huset Vårt",
     "coverImage": "cover.png",
     "steps": [],
     "children": []
   }
   ```

4. **Oppdater projects.json**:
   ```json
   {
     "id": "huset-vaart",
     "name": "Huset Vårt",
     "path": "huset-vaart"
   }
   ```

### Konvertering av underprosjekter

For hvert underprosjekt:

1. Konverter undermappenavn
2. Oppdater `path` i parent `meta.json` children-array
3. Oppdater `id` og `name` i child `meta.json`

## Eksempel: Full konvertering

### Før konvertering

```
/projects/Huset Vårt/
  meta.json (mangler eller har feil format)
  1-Spiserom/
    1_1x.png
    2_1x.png
    ...
  2-Alma sitt Rom/
    19_1x.png
    20_1x.png
    ...
```

### Etter konvertering

```
/projects/huset-vaart/
  meta.json
  cover.png (genereres automatisk av `update-cover-images.js` hvis mangler)
  1-spiserom/
    meta.json
    1_1x.png
    2_1x.png
    ...
  2-alma-sitt-rom/
    meta.json
    19_1x.png
    20_1x.png
    ...
```

### /projects/huset-vaart/meta.json

```json
{
  "id": "huset-vaart",
  "name": "Huset Vårt",
  "coverImage": "cover.png",
  "steps": [],
  "children": [
    {
      "id": "1-spiserom",
      "name": "1-Spiserom",
      "path": "1-spiserom"
    },
    {
      "id": "2-alma-sitt-rom",
      "name": "2-Alma sitt Rom",
      "path": "2-alma-sitt-rom"
    }
  ]
}
```

### /projects/huset-vaart/1-spiserom/meta.json

```json
{
  "id": "1-spiserom",
  "name": "1-Spiserom",
  "coverImage": "cover.png",
  "steps": [
    "1_1x.png",
    "2_1x.png",
    "3_1x.png",
    ...
  ],
  "children": []
}
```

### projects.json

```json
[
  {
    "id": "huset-vaart",
    "name": "Huset Vårt",
    "path": "huset-vaart"
  }
]
```

## Cover-bilder

### Automatisk generering av cover-bilder

Etter å ha konvertert prosjekter, anbefales det å kjøre `update-cover-images.js` for å sikre at alle prosjekter har `cover.png`:

```bash
# Oppdater manglende cover-bilder
node scripts/update-cover-images.js

# Eller med dry-run for å se hva som vil skje
node scripts/update-cover-images.js --dry-run
```

**Hva scriptet gjør:**
- Finner siste bilde i hvert prosjekt (sortert etter nummer)
- Kopierer det til `cover.png` **kun hvis `cover.png` mangler**
- **Overskriver IKKE eksisterende `cover.png` filer** (bruk `--force` for å overskrive)
- Fungerer rekursivt på alle prosjekter og underprosjekter

**Runtime fallback:**
- Hvis `cover.png` mangler, vil koden automatisk falle tilbake til første bilde (`1_1x.png`)
- Dette fungerer som backup, men det er bedre å ha faktiske `cover.png` filer for raskere lasting

**Anbefalt workflow:**
1. Konverter prosjekter med `convert-to-web-friendly.js`
2. Oppdater cover-bilder med `update-cover-images.js`
3. Verifiser at alt fungerer

## Verifisering

Etter konvertering, verifiser:

1. ✅ Alle mapper har web-vennlige navn (kebab-case)
2. ✅ Alle `meta.json` har korrekt `id`, `name` og `path`
3. ✅ `path` i `projects.json` matcher mappenavn
4. ✅ `path` i children-array matcher undermappenavn
5. ✅ Alle bilder er på plass i riktige mapper
6. ✅ Alle prosjekter har `cover.png` (kjør `update-cover-images.js` hvis mangler)
7. ✅ Test i nettleser: URL skal være ren (`#/p/huset-vaart`)

## Troubleshooting

### Problem: Mappe har mellomrom/spesialtegn

**Løsning**: Omdøp mappen til web-vennlig format og oppdater alle JSON-filer.

### Problem: `path` matcher ikke mappenavn

**Løsning**: Sjekk at `path` i JSON er identisk med mappenavnet (case-sensitive).

### Problem: Underprosjekter vises ikke

**Løsning**: Sjekk at `path` i children-array matcher faktisk undermappenavn.

## Beste praksis

- **Alltid bruk web-vennlige mappenavn** når du oppretter nye prosjekter
- **Behold originalt navn i `name`-feltet** for visning i UI
- **Test URL-er** etter konvertering for å sikre at de er rene
- **Dokumenter konverteringer** hvis du har mange prosjekter å konvertere
