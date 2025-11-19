# Scripts

Dette mappen inneholder hjelpescripts for prosjektet.

## convert-to-web-friendly.js

Automatisk konvertering av prosjektmapper til web-vennlig format.

### Hva scriptet gjør

1. **Scanner alle mapper** i `/projects/`
2. **Lagrer originale navn** (for `name`-feltet i JSON)
3. **Konverterer til web-vennlige navn** (kebab-case)
4. **Genererer/oppdaterer alle `meta.json` filer** automatisk
5. **Oppdaterer `projects.json`**
6. **Omdøper mapper** (kun med `--confirm` flag)

### Bruk

```bash
# 1. Først: Dry run for å se hva som vil skje (anbefalt!)
node scripts/convert-to-web-friendly.js --dry-run

# 2. Generer meta.json filer (trygt, omdøper ikke mapper)
node scripts/convert-to-web-friendly.js

# 3. Omdøp mapper også (krever bekreftelse)
node scripts/convert-to-web-friendly.js --confirm
```

### Flagger

- `--dry-run`: Viser hva som vil skje uten å gjøre endringer
- `--confirm`: Omdøper mapper (uten dette flagget omdøpes ikke mapper)

### Sikkerhet

- Scriptet gjør **aldri** destruktive endringer uten `--confirm`
- Bruk `--dry-run` først for å se hva som vil skje
- Scriptet sjekker om mapper allerede eksisterer før omdøping
- Originale navn lagres i `name`-feltet i JSON

### Eksempel

```bash
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
```

### Krav

- Node.js (ingen eksterne dependencies)
- Mappen `/projects/` må eksistere

## update-cover-images.js

Script for å oppdatere/generere cover-bilder for alle prosjekter.

### Hva scriptet gjør

1. **Scanner alle prosjekter** i `/projects/` (inkludert underprosjekter)
2. **For hvert prosjekt**:
   - Sjekker om `cover.png` eksisterer
   - Hvis ikke, kopierer siste bilde (sortert etter nummer) til `cover.png`
   - Med `--force`: Oppdaterer også eksisterende `cover.png`

### Bruk

```bash
# Oppdater kun manglende cover-bilder (anbefalt)
node scripts/update-cover-images.js

# Oppdater alle cover-bilder (overskriv eksisterende)
node scripts/update-cover-images.js --force

# Vis hva som ville blitt gjort uten å gjøre det
node scripts/update-cover-images.js --dry-run
```

### Flagger

- `--dry-run`: Viser hva som vil skje uten å gjøre endringer
- `--force`: Oppdaterer også eksisterende `cover.png` filer

### Anbefalt workflow

1. **Etter å ha lagt til nye prosjekter**: Kjør `update-cover-images.js` for å generere cover-bilder
2. **Etter import**: Kjør scriptet for å sikre at alle prosjekter har cover-bilder
3. **Runtime fallback**: Koden har fortsatt fallback til første bilde hvis `cover.png` mangler (som backup)

### Eksempel

```bash
$ node scripts/update-cover-images.js

Oppdaterer cover-bilder for alle prosjekter...

=== Oppsummering ===
Oppdatert: 3
Hoppet over: 7
Feil: 0

Oppdatert:
  - huset-vaart: 1_1x.png → cover.png (ny)
  - 1-spiserom: 1_1x.png → cover.png (ny)
  - 2-alma-sitt-rom: 1_1x.png → cover.png (ny)

✅ Cover-bilder oppdatert!
```

### Krav

- Node.js (ingen eksterne dependencies)
- Mappen `/projects/` må eksistere
- Prosjekter må ha minst ett bilde


