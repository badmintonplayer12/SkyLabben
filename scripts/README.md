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


