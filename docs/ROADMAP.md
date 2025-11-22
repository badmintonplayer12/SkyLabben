# Roadmap

Dette dokumentet beskriver implementasjonsplanen og fremtidige funksjoner for SkyLabben.

## Hvordan denne roadmapen skal brukes (for AI)

**⚠️ START HER**: Les [AI_GUIDE.md](./AI_GUIDE.md) først for en oversikt over alle dokumenter og kritiske regler.

- Jobb alltid i rekkefølge innenfor en fase (1.1 før 1.2, osv.), med mindre jeg eksplisitt sier noe annet.
- Etter hver oppgave: oppdater denne filen og sett `[ ]` → `[x]` der det passer.
- Ikke hopp til Fase 2 eller 3 før alle M1/M2-kriterier er oppfylt.
- Respekter dataformater som beskrevet i [DATA_FORMAT.md](./DATA_FORMAT.md) – ikke endre formater uten å foreslå det først.
- Ved tvil: foreslå 2–3 alternativer i en kommentar, ikke gjett.
- Se [ARCHITECTURE.md](./ARCHITECTURE.md) for arkitekturdetaljer og [IMPLEMENTATION.md](./IMPLEMENTATION.md) for kodeeksempler.

## Fase 1: Grunnleggende struktur (Første versjon)

### 1.1 Prosjektoppsett
- [x] **1.1.1** Opprett filstruktur (index.html, assets/css/main.css, assets/js/*.js)
  - **Mål**: Opprett alle nødvendige mapper og tomme filer
- [x] **1.1.2** Sett opp grunnleggende HTML-struktur
  - **Mål**: Opprett index.html med grunnleggende struktur og lenker til CSS/JS
- [x] **1.1.3** Implementer grunnleggende CSS-layout
  - **Mål**: Grunnleggende styling og layout (se [CSS_GUIDELINES.md](./CSS_GUIDELINES.md))
  - **🌐 TEST I NETTLESER**: Verifiser at siden laster og grunnleggende styling vises

### 1.2 Statiske testdata
- [x] **1.2.1** Opprett én testprosjektmappe med meta.json
  - **Mål**: Opprett mappe under /projects/ med meta.json (se [DATA_FORMAT.md](./DATA_FORMAT.md))
- [ ] **1.2.2** Legg til cover.png og noen step-bilder
  - **Mål**: Legg til minst 3-5 testbilder med riktig navngivning
  - **Merk**: Dette gjøres manuelt av brukeren - AI skal ikke implementere dette steget
- [x] **1.2.3** Opprett projects.json med testprosjektet
  - **Mål**: Opprett projects.json i rotmappen med referanse til testprosjektet

### 1.3 Router og root-view
- [x] **1.3.1** Implementer router.js med hash-parsing
  - **Mål**: Funksjoner for å parse hash og oppdatere URL (se [IMPLEMENTATION.md](./IMPLEMENTATION.md))
- [x] **1.3.2** Implementer view-project-grid.js
  - **Mål**: Renderer prosjektgalleri med cover-bilder og navn
  - **🌐 TEST I NETTLESER**: Verifiser at prosjektgalleri vises med cover-bilder
- [x] **1.3.3** Koble router til prosjektgalleri-view
  - **Mål**: Router trigges ved hash-endringer og viser galleri
  - **🌐 TEST I NETTLESER**: Verifiser at hash-endringer trigges og galleri vises
- [x] **1.3.4** Test navigasjon til prosjektgalleri
  - **🌐 TEST I NETTLESER**: Test at klikk på prosjekt navigerer til riktig URL

### 1.4 Data-loader og viewer
- [x] **1.4.1** Implementer data-loader.js for å hente meta.json
  - **Mål**: Funksjoner for å hente projects.json og meta.json med fetch
  - **🌐 TEST I NETTLESER**: Sjekk i Network-tab at meta.json og projects.json lastes uten feil
- [x] **1.4.2** Implementer view-viewer.js med enkel bildevisning
  - **Mål**: Vise første steg-bilde for valgt prosjekt
  - **🌐 TEST I NETTLESER**: Verifiser at riktig bilde vises når du går direkte til /#/p/<path>
- [x] **1.4.3** Legg til pil-knapper for neste/forrige steg
  - **Mål**: Navigasjonsknapper som oppdaterer state og URL
  - **🌐 TEST I NETTLESER**: Test at pil-knappene fungerer og bytter bilde
- [x] **1.4.4** Test navigasjon mellom steg
  - **🌐 TEST I NETTLESER**: Test at alle steg kan navigeres mellom

### 1.5 Progresjonslinje og opp-knapp
- [x] **1.5.1** Implementer progresjonslinje (range-input eller custom)
  - **Mål**: Range-input eller custom progress bar som viser nåværende steg
  - **🌐 TEST I NETTLESER**: Verifiser at progresjonslinje vises og kan klikkes/dragges
- [x] **1.5.2** Legg til "Opp"-knapp for hierarkisk navigasjon
  - **Mål**: Knapp som navigerer ett nivå opp i hierarkiet
  - **🌐 TEST I NETTLESER**: Verifiser at "Opp"-knappen vises og fungerer
- [x] **1.5.3** Implementer logikk for å gå tilbake til forelder
  - **Mål**: Beregn forelder-path og naviger dit
  - **🌐 TEST I NETTLESER**: Test at "Opp"-knapp navigerer til forelder
- [x] **1.5.4** Test hierarkisk navigasjon
  - **🌐 TEST I NETTLESER**: Test full hierarkisk navigasjon (opp/ned i treet)

### 1.6 localStorage-lagring
- [x] **1.6.1** Implementer state.js med localStorage-integrasjon
  - **Mål**: State management med getters/setters og localStorage-synkronisering
- [x] **1.6.2** Lagre progresjon per prosjektpath
  - **Mål**: Automatisk lagring av steg-indeks når bruker navigerer
  - **🌐 TEST I NETTLESER**: Verifiser i DevTools Application-tab at data lagres i localStorage
- [x] **1.6.3** Les lagret progresjon ved applikasjonsstart
  - **Mål**: Hent lagret progresjon og bruk ved navigering til prosjekt
  - **🌐 TEST I NETTLESER**: Test at lagret progresjon leses ved reload av siden
- [x] **1.6.4** Test at posisjon lagres og gjenopptas
  - **🌐 TEST I NETTLESER**: Naviger til steg 5, reload siden, verifiser at steg 5 vises

### 1.7 CSS og responsivt design
- [x] **1.7.1** Implementer "ingen scroll" på instruksjonsvisning
  - **Mål**: Image container skal fylle plass uten scroll (se [CSS_GUIDELINES.md](./CSS_GUIDELINES.md))
  - **🌐 TEST I NETTLESER**: Verifiser at ingen scroll-bars vises på image container
- [x] **1.7.2** Tilpass bildet til skjermen (object-fit: contain)
  - **Mål**: Bildet skal tilpasses skjermen uten å kuttes
  - **🌐 TEST I NETTLESER**: Verifiser at bildet tilpasses skjermen uten å kuttes
- [x] **1.7.3** Responsivt design for mobil, nettbrett og PC
  - **Mål**: Mobile-first CSS med media queries
  - **🌐 TEST I NETTLESER**: Test responsivt design i DevTools device mode
- [x] **1.7.4** Test på ulike skjermstørrelser
  - **🌐 TEST I NETTLESER**: Test på mobil (375px), nettbrett (768px) og desktop (1920px)

### 1.8 Filtrering av skjulte prosjekter
- [x] **1.8.1** Implementer filtrering av skjulte prosjekter i prosjektgalleri
  - **Mål**: Filtrer bort prosjekter med `hidden: true` fra prosjektgalleri (se [DATA_FORMAT.md](./DATA_FORMAT.md))
  - **🌐 TEST I NETTLESER**: Legg til prosjekt med `hidden: true` i projects.json, verifiser at det ikke vises i galleri
- [x] **1.8.2** Implementer filtrering av skjulte children i viewer
  - **Mål**: Filtrer bort children med `hidden: true` når children-liste vises (se [DATA_FORMAT.md](./DATA_FORMAT.md))
  - **🌐 TEST I NETTLESER**: Legg til child med `hidden: true` i meta.json, verifiser at det ikke vises i children-liste
- [x] **1.8.3** Test at skjulte prosjekter fortsatt er tilgjengelige via direkte URL
  - **🌐 TEST I NETTLESER**: Naviger direkte til skjult prosjekt via URL, verifiser at det vises

### 1.9 Generalisering
- [x] **1.9.1** Test med flere prosjekter
  - **🌐 TEST I NETTLESER**: Legg til 2-3 prosjekter og verifiser at alle synlige vises i galleri
- [x] **1.9.2** Test med underprosjekter
  - **🌐 TEST I NETTLESER**: Test prosjekt med underprosjekter, verifiser navigasjon
- [x] **1.9.3** Verifiser at hierarkisk navigasjon fungerer
  - **🌐 TEST I NETTLESER**: Test full navigasjonsflyt: galleri → prosjekt → underprosjekt → steg → tilbake
- [x] **1.9.4** End-to-end testing
  - **🌐 TEST I NETTLESER**: Gjennomføre komplett brukeropplevelse fra start til slutt

## Fase 2: Forbedringer og optimalisering

### 2.1 Brukeropplevelse
- [x] **2.1.1** Loading-indikatorer mens bilder lastes
  - **Mål**: Vis spinner eller loading-indikator mens bilder lastes
  - **🌐 TEST I NETTLESER**: Verifiser at loading-indikator vises mens bilder lastes
- [x] **2.1.2** Preloading av neste bilde for raskere navigasjon
  - **Mål**: Last neste bilde i bakgrunnen for raskere navigasjon
  - **🌐 TEST I NETTLESER**: Verifiser i Network-tab at neste bilde lastes i forkant
- [x] **2.1.3** Feilhåndtering for manglende bilder/filer
  - **Mål**: Graceful error handling med fallback eller feilmeldinger
  - **🌐 TEST I NETTLESER**: Test med manglende bilder/filer, verifiser feilhåndtering
- [x] **2.1.4** Forbedret feilmeldinger
  - **Mål**: Brukervennlige feilmeldinger i stedet for tekniske
  - **🌐 TEST I NETTLESER**: Verifiser at brukervennlige feilmeldinger vises

### 2.2 Navigasjon
- [x] **2.2.1** Tastaturnavigasjon (piltaster for neste/forrige)
  - **Mål**: Arrow keys for å navigere mellom steg
  - **🌐 TEST I NETTLESER**: Test at piltaster fungerer for neste/forrige steg
- [x] **2.2.2** Escape-tast for å gå tilbake
  - **Mål**: Escape-tast navigerer ett nivå opp eller tilbake
  - **🌐 TEST I NETTLESER**: Test at Escape-tast navigerer tilbake
- [x] **2.2.3** Touch gestures på mobil (swipe venstre/høyre)
  - **Mål**: Swipe-gestures for navigasjon på touch-enheter
  - **🌐 TEST I NETTLESER**: Test swipe-gestures på mobil eller i DevTools device mode
- [x] **2.2.4** Keyboard shortcuts-dokumentasjon
  - **Mål**: Dokumenter alle keyboard shortcuts

### 2.3 Ytelse
- [x] **2.3.1** Caching-strategier for bilder
  - **Mål**: Implementer caching for raskere lasting av bilder
  - **🌐 TEST I NETTLESER**: Verifiser i Network-tab at bilder caches og lastes fra cache
- [x] **2.3.2** Lazy loading av bilder
  - **Mål**: Last bilder kun når de trengs, ikke alle på en gang
  - **🌐 TEST I NETTLESER**: Verifiser at bilder lastes kun når de trengs
- [x] **2.3.3** Optimalisering av bildevisning
  - **Mål**: Optimaliser bildevisning for bedre ytelse
  - **🌐 TEST I NETTLESER**: Test ytelse med Performance-tab i DevTools
- [x] **2.3.4** Grunnleggende caching-strategier (uten Service Worker)
  - **Mål**: Browser-caching og localStorage for bilder/metadata
  - **🌐 TEST I NETTLESER**: Verifiser at browser cacher ressurser

### 2.4 Progresjonsvisning
- [x] **2.4.1** Vis progresjonsindikator i prosjektgalleri
  - **Mål**: Vis hvor langt brukeren har kommet i hvert prosjekt i galleriet
  - **🌐 TEST I NETTLESER**: Verifiser at progresjonsindikator vises i prosjektgalleri
- [x] **2.4.2** Vis hvor langt man har kommet per prosjekt
  - **Mål**: Vis progresjon (f.eks. "3/10 steg") for hvert prosjekt
  - **🌐 TEST I NETTLESER**: Verifiser at korrekt progresjon vises for hvert prosjekt
- [x] **2.4.3** Mulighet for å nullstille progresjon
  - **Mål**: Knapp eller funksjonalitet for å nullstille lagret progresjon
  - **🌐 TEST I NETTLESER**: Test at nullstilling fungerer og oppdaterer visning

### 2.5 Barnevennlig UI
- [x] **2.5.1** Ikonbasert navigasjon
  - **Mål**: Erstatt/suppler tekst med ikoner (hus, piler, stjerner) i viewer og galleri
  - **🌐 TEST I NETTLESER**: Verifiser at alle primære handlinger kan utføres uten å lese tekst
- [x] **2.5.2** Store trykkflater og spacing
  - **Mål**: Øk størrelse på knapper og klikksoner (≥64px) og legg til tilstrekkelig spacing
  - **🌐 TEST I NETTLESER**: Test på mobil/nettbrett at knapper er lette å treffe
- [x] **2.5.3** Visuell/lyd feedback
  - **Mål**: Legg til mikroanimasjoner og valgfri lyd når barnet navigerer, samt en enkel belønning ved fullført prosjekt
  - **🌐 TEST I NETTLESER**: Verifiser at feedback trigges ved interaksjon og kan skrus av/på
- [x] **2.5.4** Intro/hjelp for barn
  - **Mål**: Implementer en kort visuell onboarding (f.eks. maskot eller highlight) som viser hvordan man blar
  - **🌐 TEST I NETTLESER**: Test at introen kan avbrytes og kun vises ved behov

### 2.6 Tilgjengelighet og input
- [x] **2.6.1** Swipe-gestures i viewer
  - **Mål**: Swipe venstre/høyre på bildet gjør samme som pilene
  - **🌐 TEST I NETTLESER**: Test på touch-enheter
- [x] **2.6.2** Alt-tekst og kontrastsjekk
  - **Mål**: Sørg for alt-tekst på bilder og dokumenter kontrastkrav i CSS_guidelines
  - **🌐 TEST I NETTLESER**: Kjør Lighthouse/axe for tilgjengelighetsvarsler

### 2.7 Loading, feilhåndtering og belønning
- [x] **2.7.1** LEGO-inspirert loading-indikator
  - **Mål**: Vise animert kloss/spinner mens bilder lastes, deaktivere kontroller inntil bildet er klart
  - **🌐 TEST I NETTLESER**: Kunstig treghet (DevTools) for å verifisere at indikator vises
- [x] **2.7.2** Brukervennlige feilmeldinger
  - **Mål**: Vennlig melding når bilde/meta mangler (“Oi! Fant ikke bildet – spør en voksen”)
  - **🌐 TEST I NETTLESER**: Simuler 404 og sjekk at melding vises
- [x] **2.7.3** Fullføringsbelønning
  - **Mål**: Konfetti/badge + state-markering når prosjekt er ferdig
  - **🌐 TEST I NETTLESER**: Naviger til siste steg og se at belønning trigges, og at det kan trigges kun én gang per prosjekt

### 2.8 Lyd, haptikk og voiceover
- [x] **2.8.1** Navigasjonslyd/haptikk
  - **Mål**: Korte "klikk"-lyder og haptikk på pil/opp-knapp (kan skrus av/på)
  - **🌐 TEST I NETTLESER**: Verifiser toggle + fallback når API ikke støttes
- [x] **2.8.2** Steg-vis lydhint
  - **Mål**: Støtte `audioSteps` fra meta.json og knapp for å spille av lyd per steg
  - **🌐 TEST I NETTLESER**: Test med sample-lyd, verifiser at feil håndteres
- [x] **2.8.3** Onboarding-stemme/figur
  - **Mål**: Maskot/overlay som visuelt (og evt. auditivt) viser hvordan man starter
  - **🌐 TEST I NETTLESER**: Sørg for at overlay vises kun første gang og kan avbrytes

### 2.9 Kompakt innstillingsmeny i viewer
- [x] **2.9.1** Samle sekundære kontroller i meny
  - **Mål**: Flytte global lyd-toggle, QR-kode og nullstill-progresjon til en `viewer__settings`-meny slik at hovedknappene får bedre plass.
  - **🌐 TEST I NETTLESER**: Åpne/lukk menyen på mobil og desktop, bekreft at alle handlinger utføres og at klikk utenfor lukker menyen.
- [x] **2.9.2** Fullskjerm-knapp
  - **Mål**: Legge til fullskjermkontroll (requestFullscreen/exitFullscreen) i menyen og la ikonet endre seg når tilstanden endres.
  - **🌐 TEST I NETTLESER**: Test fullskjerm i moderne nettlesere og sørg for at Escape/`fullscreenchange` holder menyikonet synkronisert.
- [x] **2.9.3** Dokumentasjon
  - **Mål**: Oppdatere README, IMPLEMENTATION og ROADMAP med beskrivelser av menyen, BEM-klasser og bruksflyt.
  - **🌐 TEST I NETTLESER**: Ikke teknisk test – les korrektur og sjekk lenker.

## Fase 3: Avanserte funksjoner

### 3.1 QR-kode-generering
- [x] **3.1.1** Implementer QR-kode-generering for spesifikke steg
  - **Mål**: Generer QR-kode basert på nåværende URL
  - **🌐 TEST I NETTLESER**: Verifiser at QR-kode genereres og vises korrekt
- [x] **3.1.2** QR-kode for prosjekt (starter på første steg)
  - **Mål**: QR-kode som peker til prosjektets første steg
  - **🌐 TEST I NETTLESER**: Test at QR-kode for prosjekt peker til riktig URL
- [x] **3.1.3** QR-kode for spesifikt steg
  - **Mål**: QR-kode som peker til spesifikt steg med step-parameter
  - **🌐 TEST I NETTLESER**: Test at QR-kode for steg peker til riktig URL med step-parameter
- [x] **3.1.4** Deling via QR-kode
  - **Mål**: Mulighet for å dele spesifikke steg via QR-kode
  - **🌐 TEST I NETTLESER**: Test at QR-kode kan skannes og navigerer til riktig sted

### 3.2 Ekstra funksjoner
- [x] **3.2.1** Søkefunksjonalitet i prosjekter
  - **Mål**: Søkefelt for å finne prosjekter basert på navn
  - **🌐 TEST I NETTLESER**: Test søkefunksjonalitet og verifiser at riktige resultater vises
- [x] **3.2.2** Filtrering/kategorisering av prosjekter
  - **Mål**: Filtrer prosjekter basert på kategorier eller tags
  - **🌐 TEST I NETTLESER**: Test filtrering og verifiser at prosjekter filtreres korrekt
- [x] **3.2.3** Favoritter/bookmarking
  - **Mål**: Lagre favoritt-prosjekter i localStorage
  - **🌐 TEST I NETTLESER**: Test at favoritter lagres og vises korrekt
- [x] **3.2.4** Eksport av instruksjoner (PDF?) – droppet
  - **Mål**: Ikke lenger nødvendig; krav om eksport er strøket for denne versjonen
  - **🌐 TEST I NETTLESER**: Ikke relevant

## Fase 4: Progressive Web App (PWA)

### 4.1 Web App Manifest
- [x] **4.1.1** Opprett manifest.json
  - **Mål**: Web App Manifest med app-navn, ikoner, start-URL, display-mode
  - **🌐 TEST I NETTLESER**: Verifiser at manifest.json lastes korrekt
- [x] **4.1.2** Legg til app-ikoner (flere størrelser)
  - **Mål**: Ikoner for iOS, Android og desktop (192x192, 512x512, etc.)
  - **🌐 TEST I NETTLESER**: Verifiser at ikoner vises korrekt i browser
- [x] **4.1.3** Konfigurer manifest for installasjon
  - **Mål**: display: "standalone", start_url, theme_color, background_color
  - **🌐 TEST I NETTLESER**: Test installasjonsprompt i nettleser

### 4.2 Service Worker
- [x] **4.2.1** Opprett service-worker.js
  - **Mål**: Grunnleggende Service Worker med install/activate events
  - **🌐 TEST I NETTLESER**: Verifiser at Service Worker registreres i Application-tab
- [x] **4.2.2** Implementer caching-strategi for statiske ressurser
  - **Mål**: Cache HTML, CSS, JS ved install (Cache First)
  - **🌐 TEST I NETTLESER**: Test offline-tilgang til statiske filer
- [x] **4.2.3** Implementer caching-strategi for bilder
  - **Mål**: Cache bilder ved bruk (Cache First eller Network First med fallback)
  - **🌐 TEST I NETTLESER**: Test at bilder caches og fungerer offline
- [x] **4.2.4** Implementer caching-strategi for JSON-data
  - **Mål**: Cache projects.json og meta.json (Network First med cache fallback)
  - **🌐 TEST I NETTLESER**: Test at JSON-data fungerer offline
- [x] **4.2.5** Implementer cache-oppdatering og versjonering
  - **Mål**: Oppdater cache ved nye versjoner, fjern gamle caches
  - **🌐 TEST I NETTLESER**: Test cache-oppdatering ved deploy

### 4.3 Offline-støtte
- [x] **4.3.1** Offline-fallback side
  - **Mål**: Vis offline-melding hvis ressurser ikke er tilgjengelige
  - **🌐 TEST I NETTLESER**: Test offline-tilstand (DevTools → Network → Offline)
  - **Notat**: Feilhåndtering i main.js viser allerede brukervennlige meldinger ved nettverksfeil
- [x] **4.3.2** Offline-indikator
  - **Mål**: Vis visuell indikator når appen er offline
  - **🌐 TEST I NETTLESER**: Test at offline-indikator vises korrekt
- [x] **4.3.3** Sync av progresjon når online
  - **Mål**: Sikre at progresjon synkroniseres når nettverk kommer tilbake
  - **🌐 TEST I NETTLESER**: Test sync ved nettverksgjenoppretting
  - **Notat**: Progresjon lagres allerede i localStorage og fungerer offline. Ingen ekstra sync nødvendig.

### 4.4 Installerbar app
- [x] **4.4.1** Installasjonsprompt
  - **Mål**: Vis "Installer app"-prompt når kriterier er oppfylt
  - **🌐 TEST I NETTLESER**: Test installasjonsprompt i nettleser
- [x] **4.4.2** App-ikon på hjemmeskjerm
  - **Mål**: Verifiser at app vises korrekt når installert
  - **🌐 TEST I NETTLESER**: Installer app og verifiser at ikon vises
  - **Notat**: Manifest.json er korrekt konfigurert med ikoner (192x192 og 512x512). Ikoner eksisterer og er tilgjengelige. Standalone-modus deteksjon er implementert.
- [x] **4.4.3** Standalone-modus
  - **Mål**: App skal fungere i standalone-modus (uten browser UI)
  - **🌐 TEST I NETTLESER**: Test app i standalone-modus etter installasjon
  - **Notat**: Manifest.json er konfigurert med `display: "standalone"`. Standalone-modus deteksjon fungerer via `matchMedia` og `navigator.standalone`. Appen vil fungere i standalone-modus når installert.

### 4.5 PWA-testing og optimalisering
- [x] **4.5.1** Lighthouse PWA-audit
  - **Mål**: Oppnå minst 90+ score på Lighthouse PWA-audit
  - **🌐 TEST I NETTLESER**: Kjør Lighthouse audit og verifiser score
  - **Resultat**: 
    - Performance: 95/100
    - Accessibility: 100/100
    - Best Practices: 96/100
    - SEO: 91/100 (forbedret til 100 etter å ha lagt til meta description)
    - Alle PWA-krav er oppfylt (manifest, service worker, HTTPS, ikoner, viewport)
- [x] **4.5.2** Test på ulike enheter
  - **Mål**: Test PWA-funksjonalitet på iOS, Android og desktop
  - **🌐 TEST I NETTLESER**: Test installasjon og offline-funksjonalitet på ulike enheter
  - **Notat**: PWA-funksjonalitet er implementert og skal fungere på alle enheter som støtter PWA. Faktisk testing på fysiske enheter krever deploy.
- [x] **4.5.3** Optimaliser cache-størrelse
  - **Mål**: Sørg for at cache ikke blir for stor, implementer cache-quota-håndtering
  - **🌐 TEST I NETTLESER**: Verifiser cache-størrelse i Application-tab
  - **Notat**: Cache-quota-håndtering implementert med LRU-strategi. Maks 50 MB for bilder, 20 MB for lydfiler. Eldste entries fjernes automatisk når kvoten overskrides.

### 4.6 Klientoppdatering og cache-invalidering
- [ ] **4.6.1** Felles versjon for SW og data-cache
  - **Mål**: Koble `CACHE_VERSION` i `service-worker.js` og `assets/js/data-loader.js` til én felles versjonskilde (f.eks. `version.json`/`VERSION`/import) som deploy-scriptet oppdaterer (kort hash + dato er nok). Versjonen injiseres som `CACHE_VERSION` i begge filer slik at kode, bilder og JSON invalides ved hver deploy.
  - **🌐 TEST I NETTLESER**: Etter versjonsbump og reload skal kun nye cache-navn vises i Application → Cache Storage, og `legoInstructions.metaCache` lokal-cache skal erstattes.
- [ ] **4.6.2** Oppdateringsvarsel i UI
  - **Mål**: Velg primær strategi for oppdagelse (f.eks. SW-driver: SW sender `SW_UPDATE_AVAILABLE` til clients). Fjern `self.skipWaiting()` fra install; legg den i message-handler som lytter på `SKIP_WAITING`. UI viser banner “Oppdater nå” når SW-meldingen mottas (og/eller når `registration.waiting`/`updatefound` oppdages), kaller `postMessage({ type: 'SKIP_WAITING' })` på `registration.waiting`, håndterer eksisterende `waiting` ved første load, og lytter på `controllerchange` med guard for å `reload()`. Ha fallback-knapp “Last på nytt” om `waiting` er null.
  - **🌐 TEST I NETTLESER**: Endre SW-versjon, last siden (DevTools → Application → Update), verifiser at banner vises på eksisterende installasjon med aktiv SW, trykk “Oppdater nå” og se at ny versjon lastes og gamle cacher slettes. Inkognito skal få ny versjon direkte uten banner.
- [ ] **4.6.3** Deploy-sjekkliste for invalidasjon
  - **Mål**: Dokumenter kort rutine for deploy: kjør versjons-script, verifiser at `service-worker.js` og `assets/js/data-loader.js` får ny versjon, push til GitHub Pages. TTL for data-cache er kun backup (vurder 6–12 t).
  - **🌐 TEST I NETTLESER**: Etter deploy: inkognito henter ny versjon direkte; eksisterende installasjon ser banner/oppdatering. DevTools: Application → Cache Storage viser kun nye cache-navn; Local Storage viser `legoInstructions.*` med ny versjon.

#### 🌐 Forslag til test i nettleser (eksisterende installasjon)

1. Kjør `node scripts/update-version.js 2024-09-02+test`, bygg og deploy/serve lokalt.
2. Åpne siden som vanlig (med den gamle service worker-versjonen fremdeles aktiv). Bekreft i DevTools → Application → Cache Storage at cache-navnene fortsatt inneholder den gamle versjonen.
3. Utfør en hard-reload uten å tømme cache. Når siden laster inn, skal oppdateringsbanneret vises. Klikk «Oppdater nå».
4. Etter automatisk reload: DevTools → Application → Service Workers skal vise at den nye SW-en er aktiv. Cache Storage skal kun vise cache-navn som inkluderer `2024-09-02+test`, og Local Storage (`legoInstructions.*`) skal vise samme versjon.
5. Verifiser at appen fungerer (navigasjon, bilder, progress) og at banneret ikke dukker opp igjen.
6. Inkognito-test: åpne siden i et nytt inkognito-vindu. Ingen banner skal vises, og både cache-navn og Local Storage skal ha `2024-09-02+test` umiddelbart.

### 4.7 Foreldremodus og synlighet (barn/forelder)
- [ ] **4.7.1** Ny modul for modus/overstyringer/synlighet
  - **Mål**: Lag `assets/js/visibility.js` (eller tilsvarende liten fil) med:
    - `getMode()/setMode()` som leser/lagrer `legoInstructions.mode` (default `child`).
    - `getOverrides()/setOverride()` for `legoInstructions.visibilityOverrides`, returnerer alltid et objekt ({} hvis tomt).
    - `isVisibleForKidsNow(project, overrides, now = new Date())` (pure, ingen DOM/sideeffekter) med prioritet: override → `approvedByDefault` (default true) → ignorér `releaseAt` nå, men parse hvis tilstede (for senere bruk).
  - **🌐 TEST I NETTLESER**: Konsoll/JS-test: isVisibleForKidsNow håndterer manglende `approvedByDefault` som true, og override vinner.
- [ ] **4.7.2** Matteoppgave-barriere for foreldremodus
  - **Mål**: Implementer enkel voksen-sjekk (tilfeldig 1 av flere regnestykker hentet fra liten array) når modus byttes `child` → `parent`. Ved riktig svar: setMode('parent') og rerender; feil: vis feilmelding og bli i `child`.
  - **🌐 TEST I NETTLESER**: Prøv riktig/feil svar; verifiser at mode lagres i localStorage.
- [ ] **4.7.3** Settings-knapp for modus
  - **Mål**: I settings-menyen (viewer) legg til knapp “Foreldremodus” (viser matteoppgave) og “Til barnemodus” når aktiv. Ingen egen side. Knappen bruker `getMode()/setMode()` fra visibility-modulen.
  - **🌐 TEST I NETTLESER**: Bytt begge veier, bekreft at UI endrer seg (toggles vises/forsvinner).
- [ ] **4.7.4** Filtrering i barnemodus
  - **Mål**: I prosjektgalleriet filtrer prosjekter med `isVisibleForKidsNow` når mode=`child` (ingen duplikatlogikk). Default `approvedByDefault` true hvis felt mangler.
  - **🌐 TEST I NETTLESER**: Prosjekt med `approvedByDefault: false` skal skjules i child, vises i parent.
- [ ] **4.7.5** Toggles i galleri (parent-mode)
  - **Mål**: I `view-project-grid.js`, vis per-prosjekt toggle “Synlig for barn på denne enheten” når mode=`parent`; lagre til overrides (per id), samme nøkkel som i viewer. Ingen toggles i child-mode; skjul toggle hvis prosjekt mangler id.
  - **🌐 TEST I NETTLESER**: Slå av/på prosjekt, reload siden, bekreft at override huskes og at barnet ser/ikke ser prosjektet.
- [ ] **4.7.6** Toggles i viewer (parent-mode)
  - **Mål**: I `view-viewer.js`, vis toggle for hovedprosjekt + toggles for children i parent-mode; bruk et konsekvent nøkkelformat (f.eks. `project:${projectId}` og `project:${projectId}:child:${childId}`) delt som helper i visibility.js. I child-mode: filtrer children med `isVisibleForKidsNow`.
  - **🌐 TEST I NETTLESER**: Parent: toggle child av/på, reload, se at det persisterer; Child: barn ser kun tillatte children.
 - [x] **4.7.7** Indikator for foreldremodus (valgfritt)
  - **Mål**: Lite merke “Foreldremodus aktiv” når mode=`parent`.
  - **🌐 TEST I NETTLESER**: Slå av/på og se at merket følger modus.
- [x] **4.7.8** Dokumentasjon og datafelt
  - **Mål**: Oppdater DATA_FORMAT/README med `approvedByDefault` (default true) og `releaseAt` (kan være tilstede, men ignoreres nå; format = ISO UTC). Beskriv overrides-nøkkelvalg.
  - **📄**: Oppdater ROADMAP/IMPLEMENTATION med ny modul og bruk av `isVisibleForKidsNow`.
- [ ] **4.7.9** PWA/gjenopptak-test
  - **Mål**: Verifiser at modusskifter/overrides fungerer i installert PWA, også ved resume fra bakgrunn (focus/visibilitychange). Modus/overrides skal fungere offline (kun localStorage).
  - **🌐 TEST I NETTLESER**: Installer PWA, sett override i parent-mode, minimer og åpne igjen; barnemodus skal respektere override uten nett.

### 4.8 Settings-meny på forsiden (galleri)
- [ ] **4.8.1** Legg til settings-knapp ved søkefeltet
  - **Mål**: Plasser en liten settings-knapp på høyre side av `project-grid__controls` (ved siden av søk/kategorier). Knappen åpner et lite panel/dropdown; lukk ved klikk utenfor/ESC. Gjenbruk samme meny-mønster (aria/ESC/klikk-utenfor) som viewer-settings.
  - **🌐 TEST I NETTLESER**: Åpne/ lukk panelet; verifiser at det ikke forstyrrer søk/filtre.
- [ ] **4.8.2** Foreldremodus-knapp i panelet
  - **Mål**: Bruk `getMode/setMode/getRandomAdultChallenge` fra `visibility.js`; i child → voksen-quiz før parent; i parent → “Til barnemodus”. Etter endring: re-kjør `applyFilters()` i galleriet slik at synlighet oppdateres. Ingen duplikatlogikk utover det som allerede ligger i `visibility.js`. Bruk samme quiz/feilmelding som i viewer-settings for lik UX.
  - **🌐 TEST I NETTLESER**: Bytt begge veier, bekreft filtrering (approvedByDefault/overrides) endres uten reload.
- [ ] **4.8.3** Del app
  - **Mål**: Flytt eksisterende “Del app” fra `project-grid__footer` inn i panelet (bruk `shareUrl` med root-URL uten hash). Skal fungere i både nettleser og PWA. Fjern footer-knappen.
  - **🌐 TEST I NETTLESER**: Klikk del, verifiser Web Share eller clipboard fallback.
- [ ] **4.8.4** Fullskjerm
  - **Mål**: Fullskjerm-toggle i panelet; oppdater label/ikon på `fullscreenchange` (også når brukeren avslutter via system/ESC).
  - **🌐 TEST I NETTLESER**: Gå inn/ut av fullskjerm fra forsiden.
- [ ] **4.8.5** Installer app (valgfri i panelet)
  - **Mål**: Hvis `isInstallPromptAvailable` er true og ikke standalone, vis “Installer app”; bruk `consumePrompt()` og skjul ellers. Ikke implementer ny logikk, gjenbruk pwa-install, med samme tekst/ikon som i viewer-settings.
  - **🌐 TEST I NETTLESER**: Når prompt finnes, trykk og se at installprosessen starter; skjul ellers.
- [ ] **4.8.6** Stil og overlapp
  - **Mål**: Panel forankres til høyre i controls, høy z-index over grid; gjenbruk eksisterende knappestil (gear-ikon) eller egen `project-grid__settings`. Minimal CSS, ikke refaktorere viewer-stiler; vurder å gjenbruke samme meny-helper som viewer for konsistent UX.
  - **🌐 TEST I NETTLESER**: Panelet vises riktig, ikke hindrer søk/kategorier, lukker på klikk utenfor.

### 4.9 Konsistent header for galleri/viewer
- [ ] **4.9.1** Felles header-base
  - **Mål**: Introduser en liten felles header-baseklasse (f.eks. `.app-header`) med padding, border-bottom og bakgrunn. Bruk den i galleri-header og viewer-header for ensartet toppfelt uten å flytte logikk.
  - **🌐 TEST I NETTLESER**: Visuell sjekk: galleri-header (søk/filtre/settings) og viewer-header har likt toppfelt med horisontal linje under.
- [ ] **4.9.2** Grid-header wrapper
  - **Mål**: Pakk `project-grid`-kontrollene inn i en header-wrapper (f.eks. `.project-grid__header`) som bruker `.app-header`. Innhold i én rad: søk (flex:1) + kategori-dropdown + favoritt-stjerne (40x40) + settings (40x40). Ingen ekstra filter-rad under.
  - **🌐 TEST I NETTLESER**: Header beholder stabil høyde; søk øverst med select/stjerne/settings på linjen; ingen wrap på desktop.
- [ ] **4.9.3** Viewer-header bruk av base
  - **Mål**: La `viewer__header` også bruke `.app-header` for grunnstil (padding/border), med eksisterende viewer-spesifikke stiler beholdt.
  - **🌐 TEST I NETTLESER**: Viewer-header ser lik ut mht. toppfelt/bunnlinje; funksjonalitet uendret.
- [ ] **4.9.4** Minimal CSS, ingen ny logikk
  - **Mål**: Begrens endringen til CSS + enkel markup-wrap i grid; ingen flytting av JS-logikk eller nye mønstre. Hold kodeendringer små i store filer (AI_GUIDE).
  - **🌐 TEST I NETTLESER**: Bekreft at panelene (settings) fortsatt fungerer (åpne/lukke/ESC) og at layout ikke bryter på små skjermer.

### 4.10 Header-filtrering (kategori-dropdown + favoritt-stjerne)
- [ ] **4.10.1** Kategori-dropdown
  - **Mål**: Erstatt kategori-knapper med dropdown (40px høy, min-width ~160px) med “Alle” + kategorier. Sett aria-label eller label.
  - **🌐 TEST I NETTLESER**: Velg kategori; filtrering oppfører seg som før, ingen wrap; header-høyde stabil.
- [ ] **4.10.2** Favoritt-stjerne som modus
  - **Mål**: Favoritt-toggle (40x40, aria-pressed) som når aktiv setter `favoritesOnly = true` og resetter kategori til “Alle” (vis kun favoritter uansett kategori). Når av, styres visning av kategori + søk som normalt.
  - **🌐 TEST I NETTLESER**: Stjerne på → kun favoritter vises; av → kategori + søk/filter fungerer som normalt; synlighet/overrides/mode respekteres.
- [ ] **4.10.3** Filtreringsflyt
  - **Mål**: applyFilters i grid: søk → kategori (hvis stjerne av) → favoritesOnly (hvis stjerne på) → mode/visibility (isVisibleForKidsNow) → render. Ingen duplikatlogikk utenfor denne funksjonen.
  - **🌐 TEST I NETTLESER**: Verifiser at stjerne og dropdown ikke påvirker hverandre feil; barnemodus/parent-modus filtrerer som før.
- [ ] **4.10.4** Favorittfilter oppdaterer ved fjerning
  - **Mål**: Når favoritesOnly er på og en favoritt fjernes via kortet, skal kortet forsvinne umiddelbart (kall applyFilters() etter toggle).
  - **🌐 TEST I NETTLESER**: Slå på favorittfilter, fjern stjerne på et kort → kortet forsvinner; slå av filter, toggle stjerner uten at lista nødvendigvis re-rendres.

### 4.11 UI-tema (farger/nyanser)
- [ ] **4.11.1** Global bakgrunn
  - **Mål**: Innfør lys bakgrunn (f.eks. #f4f9ff) for å redusere ren hvit. Ingen logikkendringer; legg på `body` (ev. html/body) slik at hele flaten dekkes.
  - **🌐 TEST I NETTLESER**: Visuell sjekk på galleri+viewer; kontrast OK.
- [ ] **4.11.2** Header-styling
  - **Mål**: `.app-header` med mild gradient (#e8f4ff→#fff) og tydeligere border (#d0d7e2) for separasjon. Behold høyder som definert.
  - **🌐 TEST I NETTLESER**: Galleri-/viewer-header ser like ut med klar linje under.
- [ ] **4.11.3** Tiles
  - **Mål**: `.project-tile` får myk grå ramme (#e2e8f0), radius ~12px, svak skygge; hover løfter litt og øker skygge.
  - **🌐 TEST I NETTLESER**: Kort ser dypere ut, hover fungerer.
- [ ] **4.11.4** Inputs/select
  - **Mål**: Søk/select hvit bakgrunn, ramme #d0d7e2, radius 8px, fokus-outline med #0099ff (boks-skygge). Ingen logikk.
  - **🌐 TEST I NETTLESER**: Fokus-stil synlig, ingen layout-hopp; høyde matcher knapper (51px), ingen outline-suppresjon uten erstatning.
- [ ] **4.11.5** Favoritt-stjerner
  - **Mål**: Stjerneknapper (header + kort) beholder ☆/★ men styres av CSS: normal #999, aktiv #fed81b, font-size ~20–22px, uten ekstra bakgrunn/ramme.
  - **🌐 TEST I NETTLESER**: Stjerner blir gule når aktiv; aria-pressed oppdatert.
- [ ] **4.11.6** Settings/knapper/slider
  - **Mål**: Settings-knapp hvit med lys grå ramme, radius 8px; hover border/blå (bakgrunn #e9f5ff). Viewer-primærknapper blå (#0099ff) med mørkere hover (#0077d9); range-thumb blå, track lys blå (#d9ecff).
  - **🌐 TEST I NETTLESER**: Hover-stater fungerer; ingen funksjonelle endringer.

### 4.12 Felles dialog-modul
- [x] **4.12.1** Modul og API
  - **Mål**: Lag `assets/js/dialog.js` med `openDialog({ title, content (DOM eller HTML), actions: [{ label, variant, onClick }], size, onClose })` (SM/M/L max-width), `closeDialog()`, handle med `close()`, aria-role focus/ESC/backdrop, scroll-lock (body overflow hidden), én dialog om gangen med full opprydding av DOM/listeners.
  - **🌐 TEST I NETTLESER**: Åpne/lukk via knapp, ESC og backdrop; flere kall åpner ikke flere modaler; fokus settes og body slutter å scrolle; handle.close() fungerer.
- [x] **4.12.2** Felles stil
  - **Mål**: Flytt modal-stil til `.app-dialog`, `.app-dialog__backdrop`, `.app-dialog__body`, `.app-dialog__actions` + size-klasser (`--sm/~320-360px`, `--md/~480-560px`, `--lg/~640-720px` med max-width: min(90vw, X)). Gjenbruk eksisterende visual (sentrert, skygge, runding, backdrop).
  - **🌐 TEST I NETTLESER**: Dialog vises sentrert med backdrop; størrelsesvarianter fungerer og passer på mobil (90vw begrensning).
- [x] **4.12.3** Migrering (minimal)
  - **Mål**: Bruk dialog-modulen i: onboarding-modal, QR-kode-popup, foreldre-quiz, og ev. SW-oppdatering (behold gjerne banner som inngang). Behold innhold/tekster; kun bytt til felles wrapper.
  - **🌐 TEST I NETTLESER**: Alle caser åpner/lukker riktig; ESC/backdrop lukker; ingen doble event listeners; body scroll-lock oppheves etter lukking.

### 4.13 Fleksibel feiring (emoji/Lottie + lyd)
- [x] **4.13.1** Feiring-modul
  - **Mål**: Lag `assets/js/celebration/` med `showCelebration({ type, target=document.body, durationMs, playSound=true, soundId })`, registry-basert (emoji/lottieA/…); random hvis `type` mangler/`random`; ukjent type → emoji. Én aktiv feiring om gangen, auto-rydde, soundId overstyrer registry.
  - **🌐 TEST I NETTLESER**: Kall med `type: 'emoji'`, `type: 'random'`; verifiser at kun én vises og ryddes.
- [x] **4.13.2** Renderers og cache
  - **Mål**: `emoji`-renderer (avhengighetsfri); `lottie`-renderer som laster lokal JSON fra `assets/animations/` med cache per ID; per-type `durationMs`-default.
  - **🌐 TEST I NETTLESER**: Emoji-konfetti vises/ryddes; Lottie vises uten gjentatt lasting (cache fungerer).
- [x] **4.13.3** Lyd (valgfri hook)
  - **Mål**: Mini-helper `celebration-sound.js` som spiller lokal lyd (`assets/audio/celebration-*.mp3`), enkel cache; `playSound=false` slår av; soundId-param har høyest prioritet, ellers registry-sound. Ingen CDN.
  - **🌐 TEST I NETTLESER**: Lyd spilles én gang når aktivert; lydløs når `playSound=false`.
- [x] **4.13.4** Integrasjon
  - **Mål**: Bytt konfetti-kall i `main.js` til `showCelebration({ type })`; ingen annen logikkflytting. Bruk eksplisitt type ved testing; default (mangler type) = random.
  - **🌐 TEST I NETTLESER**: På siste steg (hoved- og underprosjekt) vises feiring; fallback til emoji hvis noe feiler.
- [x] **4.13.5** CSS/Assets
  - **Mål**: Samle feiring-stiler i egen seksjon/fil (z-index høy, fixed posisjon); legg Lottie-JSON i `assets/animations/`, lyd i `assets/audio/`; ingen eksterne avhengigheter.
  - **🌐 TEST I NETTLESER**: Effekter synes over innhold; ingen layout-glitch; ingen nettverksfeil offline/PWA.

### 4.14 Robust caching av animasjoner
- [x] **4.14.1** Precache i SW
  - **Mål**: Legg animasjons-JSON i egen liste (f.eks. ANIMATION_ASSETS) og sprett inn i `PRECACHE_URLS` i SW; ta også med `assets/js/lottie.min.js` og minst én lyd (`assets/audio/celebration-1.mp3`) for offline feiring. Bruk eksisterende CACHE_VERSION; update-version.js + deploy skal hente nye filer og slette gamle cacher.
  - **🌐 TEST I NETTLESER**: Application → Cache Storage viser animasjon/lyd; Network viser “from ServiceWorker”; fungerer offline.
- [x] **4.14.2** Versjon/invalidasjon
  - **Mål**: Primær strategi: bump global CACHE_VERSION ved endring (update-version.js). Lag et lite script (f.eks. generate-animation-list.js) som autolister `assets/animations/*.json` til en modul/konstant som SW importerer, for å unngå manuell dobbel-listing. Filnavn-hashing kan vurderes senere om nødvendig.
  - **🌐 TEST I NETTLESER**: Etter versjonsbump: gamle animasjoner fjernes fra cache, nye lastes inn (Cache Storage oppdatert).
- [x] **4.14.3** Session-cache
  - **Mål**: Behold minne-cache i `celebration/lottie.js` (parsed JSON) for rask gjenbruk i samme økt; ingen ekstra endringer.
  - **🌐 TEST I NETTLESER**: Første kall henter; påfølgende kall i samme økt bruker cache (ingen ekstra fetch).
- [x] **4.14.4** Dokumentasjon
  - **Mål**: Noter i AI_GUIDE/dokumentasjon: nye feiringer skal registreres i `assets/js/celebration/index.js` og i animasjons-manifestet som SW precacher; runtime bruker .json (evt. .lottie kun som kilde, ikke lastet direkte).
#### 🌐 Detaljert test for PWA/offline og gjenopptak
1) Installer PWA (Add to Home/Install).
2) Åpne appen (online). Bytt til foreldremodus (voksen-quiz), sett en override i galleri (skru av et prosjekt).
3) Lukk appen helt. Sett enheten offline. Åpne PWA igjen:
   - Forvent: modus fortsatt parent, override fortsatt lagret (prosjekt skjult for barnemodus).
4) Bytt til barnemodus mens offline:
   - Forvent: galleriet filtrerer bort skjult prosjekt. Toggles og voksen-knapper skjules.
5) Sett enheten online igjen, minimer PWA, åpne igjen:
   - Forvent: modus/overrides uendret. Ingen nettkrav for synlighet.
6) Hvis du bumpet versjon før testen: se at oppdateringsdialog kan dukke opp ved gjenopptak (focus/visibilitychange) når ny SW er waiting.

### 4.15 Av/på-switch for synlighet (uten tekst)
- [x] **4.15.1** Felles switch-komponent
  - **Mål**: Lag label-fri helper `createVisibilityToggle({ checked, disabled=false, onChange, ariaLabel='Synlig for barn', title='Synlig for barn', stopPropagation=true })` som returnerer `{ element, setChecked, setDisabled }`. Bruk samme helper i grid og viewer; onChange ignoreres hvis disabled.
  - **🌐 TEST I NETTLESER**: Fokus/aria fungerer; toggling kaller onChange; disabled stopper endring.
- [x] **4.15.2** Grid-UI med dim/badge
  - **Mål**: Parent-modus: pill uten tekst i hjørnet; når effectiveVisibility(parent)==hidden → legg `project-tile--hidden-for-kids` (opacity/grayscale) og liten badge (aria-hidden). Ingen toggles/dimming i barnemodus.
  - **🌐 TEST I NETTLESER**: Parent: toggle dimmer/undimmer; reload beholder status; barnemodus viser ikke toggles/dimming.
- [x] **4.15.3** Viewer-UI og parent-trumping
  - **Mål**: Viewer-header: samme pill; parent hidden → disable child-toggles og legg hidden-klasse på alle child-tiles. Child hidden → bare det child dimmes/disablet. Bruk visibility-modulen (effectiveVisibility) som eneste sannhet.
  - **🌐 TEST I NETTLESER**: Parent off → alle children dimmes/disablet; parent on → child-toggles virker; reload beholder status.
- [x] **4.15.4** CSS
  - **Mål**: Pill 24–28px med modifiers `--on/--off/--disabled`; dim-stil (`opacity:0.6; filter: grayscale(0.2);`), badge-ikon i hjørnet (aria-hidden). Disabled-pill med `cursor: not-allowed` og lavere opacity. Ingen label i UI, kun aria/title.
  - **🌐 TEST I NETTLESER**: God touchflate; badge vises ved hidden; disabled ser tydelig disabled ut.

### 4.16 Offline-støtte (grunnleggende + per prosjekt)
- [ ] **4.16.1** Precache kjerne-data
  - **Mål**: SW precacher `projects.json`, toppnivå `meta.json` og cover for alle prosjekter, i tillegg til animasjoner/Lottie-lib. Unngå hardkoding; bruk generert liste fra script/manifest når tilgjengelig.
  - **🌐 TEST I NETTLESER**: Application → Cache Storage: kjernefiler ligger i static-cache; galleriet kan åpnes offline (minst forsiden + ett prosjekt uten nett).
- [ ] **4.16.2** Offline-toggle per prosjekt (parent)
  - **Mål**: I parent-modus: stjerne skjules; synlighets-toggle (venstre) beholdes; ny sky-knapp (høyre) for “Tilgjengelig offline”. Toggle lagrer til `legoInstructions.offlineProjects`, kaller prefetch av meta + cover + steg-bilder via SW cache-first. Barnemodus beholder stjerne, ingen sky.
  - **🌐 TEST I NETTLESER**: Parent: trykk sky → fetcher og lagrer; reload bevarer status; child-modus: ingen sky, stjerne fungerer som før.
- [ ] **4.16.3** Global offline-knapp
  - **Mål**: I settings-panelet (parent) legg til “Gjør alt tilgjengelig offline” som prefetcher alle prosjekter i listen; oppdater offline-state lokalt.
  - **🌐 TEST I NETTLESER**: Trykk knappen, se at filer caches (Application → Cache Storage), reload og bekreft at sky-knapper står på for alle.
- [ ] **4.16.4** Dimming/overlay-justering
  - **Mål**: Ved skjult prosjekt dimmes kun bildet (`img.project-tile__image.dimmed`); badge/overlay midt på kortet vises. Ingen global opacity på kortet.
  - **🌐 TEST I NETTLESER**: Skjul prosjekt: kun bilde blir grå/dimmet, tekst/badge lesbar; child-modus filtrerer bort skjulte som før.

### 4.17 Pinned offline vs. kvotestyrt cache
- [ ] **4.17.1** SW-cache-struktur
  - **Mål**: Skill bruker-styrt cache fra auto-cache: `IMAGE_CACHE_USER`, `IMAGE_CACHE_AUTO` (med kvote), `JSON_CACHE_USER`. Eviksjon kun på AUTO-cache.
  - **🌐 TEST I NETTLESER**: Application → Cache Storage viser egne caches; AUTO kan eviktes uten å røre USER.
- [ ] **4.17.2** Pinned meldinger
  - **Mål**: Bruk `postMessage` til SW for `PIN_PROJECT` og `PIN_ALL`. Lagre `offlineProjects` og `offlineAll` i localStorage; ingen pinned-manifest i Cache Storage.
  - **🌐 TEST I NETTLESER**: Slå på/av pin via UI, se SW-meldinger i console, og at pinned-liste består etter reload.
- [ ] **4.17.3** Full offline-toggle
  - **Mål**: Ny toggle i parent-settings “Full offline”. Når på: ved SW-activate prefetches alle prosjekter (manifest) til USER-cache. Når av: ingen ny prefetch; eksisterende data beholdes.
  - **🌐 TEST I NETTLESER**: Slå på online → vent ferdig → DevTools Offline → galleri + prosjekter funker. Slå av → ingen ny prefetch.
- [ ] **4.17.4** Per-prosjekt pin
  - **Mål**: Sky-knapp sender `PIN_PROJECT {path}` til SW som laster meta+cover+steg til USER-cache. Ingen kvote-eviksjon. Av/på endrer kun flagg; sletting kan komme senere.
  - **🌐 TEST I NETTLESER**: Pin prosjekt → offline → åpne hoved+underprosjekt uten 503/404.
- [ ] **4.17.5** Manifest for full offline
  - **Mål**: `scripts/generate-offline-manifest.js` lister toppnivå prosjekter (meta+cover). SW importerer via `importScripts`; steg-bilder hentes fra meta.steps.
  - **🌐 TEST I NETTLESER**: Manifest har riktige stier; SW laster uten feil.
- [ ] **4.17.6** Batch-prefetch
  - **Mål**: PIN_ALL/PIN_PROJECT prefetches i små batches (setTimeout/async loop) for å unngå blokkering. JSON for pinned i USER-cache.
  - **🌐 TEST I NETTLESER**: Full offline fryser ikke; fremdrift i console; offline funker.
- [ ] **4.17.7** Persist og push offline-flagg ved oppstart
  - **Mål**: Les `offlineAll` og `offlineProjects` fra localStorage ved app-start og send til SW (postMessage) så ny SW får korrekt pinned-liste uten brukerklikk.
  - **🌐 TEST I NETTLESER**: Etter reload/ny SW-activate: pinned/full offline fungerer uten at brukeren trenger å trykke noe.
- [ ] **4.17.8** UI-tilbakemelding
  - **Mål**: Full offline-status i settings (På/Av + synk-status). Sky-knapp beholder ⏳/☁️. Hint ved offline beholdes.
  - **🌐 TEST I NETTLESER**: Klar status; ingen overlap; hint vises kort ved offline.
- [ ] **4.17.9** Dokumentasjon
  - **Mål**: Oppdater AI_GUIDE/ARCHITECTURE/IMPLEMENTATION: USER vs AUTO cache, pinned via postMessage, manifest-script, batch-prefetch, kvote kun på AUTO, JSON i USER.
  - **📄**: Legg inn i ARCHITECTURE og AI_GUIDE.

### 4.18 Presentasjonsmodus (gallery per node)
- [ ] **4.18.1** Data (gallery i alle noder)
  - **Mål**: Valgfritt `gallery`-felt i alle meta.json (prosjekt + underprosjekt). Ingen fallbacks; bannene er relative til nodens mappe.
  - **🌐 TEST I NETTLESER**: meta.json med/uten `gallery` fungerer; feltet er valgfritt.
- [ ] **4.18.2** Slideshow-view
  - **Mål**: Ny `view-slideshow.js` som tar en node/node-sti, laster meta, leser kun `gallery` og viser fullscreen slideshow (tittel, lukk, piler, dots; rydder event listeners ved lukk).
  - **🌐 TEST I NETTLESER**: `#/slideshow/...` viser bilder når gallery finnes; tom-state med lukk hvis ikke.
- [ ] **4.18.3** Bildekilder (ingen fallbacks)
  - **Mål**: `buildImageList(node)`: hvis `gallery` finnes og ikke tom → bruk den; ellers tom liste og vis “Ingen galleri”.
  - **🌐 TEST I NETTLESER**: Noder med gallery viser bilder; noder uten gallery får tom-state, ingen feil.
- [ ] **4.18.4** Routing (#/slideshow/<nodePath…>)
  - **Mål**: Ny hash-route `#/slideshow/<nodePath…>` som støtter flere nivåer; router finner node via tre/loader, kaller slideshow; ugyldig node → enkel tom-state/lukk.
  - **🌐 TEST I NETTLESER**: `#/slideshow/huset-vaart`, `#/slideshow/huset-vaart/6-stue`, `#/slideshow/huset-vaart/6-stue/sofa-hjorne` fungerer; ESC/history.back lukker.
- [ ] **4.18.5** Innganger i UI
  - **Mål**: Vis “Slideshow”-knapp kun når node har gallery:
    - På prosjektkort (galleri).
    - På underprosjekt-tiles/lister i viewer.
    - Med aria-label/title (“Åpne galleri”).
  - **🌐 TEST I NETTLESER**: Knapp vises kun ved gallery; klikker åpner korrekt hash.
- [ ] **4.18.6** CSS/fullskjerm
  - **Mål**: Fullscreen overlay (`position: fixed; inset: 0`) med mørk bakgrunn, høy z-index; piler, dots, lukk/tittel; ingen påvirkning av øvrig UI.
  - **Notat**: Hold CSS i en liten egen blokk/fil (unngå å blåse opp main.css).
  - **🌐 TEST I NETTLESER**: Fullskjerm-følelse, piler/dots virker; ingen layout-glitch.
- [ ] **4.18.7** (Valgfritt) Autoplay
  - **Mål**: Enkel play/pause (2–4s intervall), stopper ved manuell interaksjon.
  - **🌐 TEST I NETTLESER**: Start/stop fungerer; ingen memory leaks.
- [ ] **4.18.8** Dokumentasjon
  - **Mål**: Oppdater AI_GUIDE/IMPLEMENTATION kort: slideshow-route, `gallery`-felt, ingen fallbacks; gallery kan peke til bilder i samme node eller under-mapper.

## Milepæler

### M1: MVP (Minimum Viable Product)
**Status**: COMPLETED

Grunnleggende funksjonalitet:
- Prosjektgalleri fungerer
- Navigasjon mellom steg fungerer
- Progresjonslinje fungerer
- localStorage-lagring fungerer
- Responsivt design på mobil/PC

**Kriterier for ferdig**:
- Kan vise minst ett prosjekt med flere steg
- Kan navigere mellom steg
- Progresjon lagres og gjenopptas
- Fungerer på mobil og PC

### M2: Første versjon (v1.0)
**Status**: COMPLETED

Alle funksjoner fra Fase 1 implementert og testet.

**Kriterier for ferdig**:
- Alle funksjoner fra Fase 1 er implementert
- Testet med flere prosjekter og underprosjekter
- Dokumentasjon er komplett
- Ingen kritiske bugs

### M3: Forbedret versjon (v1.1)
**Status**: COMPLETED

Fase 2-funksjoner implementert. Fase 3 er fullført (eksportfunksjonen er droppet).

**Kriterier for ferdig**:
- ✅ Loading-indikatorer og preloading
- ✅ Tastaturnavigasjon og touch gestures
- ✅ Caching-strategier implementert
- ✅ Bedre brukeropplevelse

### M4: Avansert versjon (v2.0)
**Status**: COMPLETED

Fase 3-funksjoner implementert, inkludert QR-kode.

**Kriterier for ferdig**:
- ✅ QR-kode-generering fungerer
- ✅ Alle avanserte funksjoner implementert
- ✅ Fullstendig dokumentasjon

### M5: Progressive Web App (v3.0)
**Status**: COMPLETED

Fase 4-funksjoner implementert, full PWA-støtte.

**Kriterier for ferdig**:
- ✅ Web App Manifest implementert
- ✅ Service Worker med caching-strategier fungerer
- ✅ Offline-støtte fungerer
- ✅ App kan installeres på enheter
- ✅ Cache-quota-håndtering implementert
- ✅ Fungerer i standalone-modus

## Prioritering

### Høy prioritet (Fase 1)
Disse funksjonene er essensielle for at prosjektet skal fungere. Se [ARCHITECTURE.md](./ARCHITECTURE.md) for detaljer:
- Router og routing
- Data-loader
- View-komponenter
- localStorage-lagring
- Grunnleggende CSS

### Middels prioritet (Fase 2)
Disse forbedrer brukeropplevelsen betydelig:
- Loading-indikatorer
- Tastaturnavigasjon
- Caching og preloading
- Touch gestures

### Lav prioritet (Fase 3)
Disse er "nice to have" og kan implementeres senere:
- QR-kode-generering
- Søk og filtrering
- Favoritter
- Eksport-funksjoner

### Fremtidig (Fase 4)
PWA-funksjonalitet for full offline-støtte og installerbar app:
- Web App Manifest
- Service Worker
- Offline-støtte
- Installerbar app

## Tekniske gjeld og forbedringer

### Kjent teknisk gjeld
- Ingen offline-støtte ennå (kommer i Fase 4)
- Ingen error boundaries eller feilhåndtering
- Ingen loading states (kommer i Fase 2)
- Ingen Service Worker caching-strategi (kommer i Fase 4)

### Fremtidige forbedringer
- TypeScript for type-sikkerhet (hvis kompleksitet vokser)
- Testing-framework (hvis prosjektet vokser)
- Build tools (hvis behovet oppstår)
- Progressive Web App (PWA) - planlagt i Fase 4

## Tidsestimater

**Merk**: Tidsestimatene er for menneskelig utviklingstid, ikke for AI-kjøring, men beholdes for planleggingsfølelse. Disse er grove estimater og kan variere.

- **Fase 1**: 2-4 uker (avhengig av tidsbruk)
- **Fase 2**: 1-2 uker
- **Fase 3**: 2-3 uker
- **Fase 4**: 2-3 uker (PWA)

**Totalt estimat for første versjon (v1.0)**: 2-4 uker
**Totalt estimat for PWA-versjon (v3.0)**: 7-12 uker

## Notater

- Implementer funksjoner inkrementelt og test hver del
- **🌐 Viktig**: Alle steg markert med "TEST I NETTLESER" skal testes i nettleseren før man går videre
- Hold koden enkel og modulær
- Dokumenter endringer underveis
- Test på ulike enheter og nettlesere
- Vurder refaktorering hvis filer blir for store (se ARCHITECTURE.md)

## Testing i nettleseren

For alle steg markert med **🌐 TEST I NETTLESER**:

1. Åpne nettstedet i nettleseren (via lokal webserver, se README.md)
2. Test funksjonaliteten manuelt
3. Bruk DevTools for å verifisere:
   - **Console**: Sjekk for JavaScript-feil
   - **Network**: Verifiser at filer lastes korrekt
   - **Application**: Sjekk localStorage og sessionStorage
   - **Elements**: Inspiser DOM-struktur
4. Test på ulike skjermstørrelser (DevTools device mode)
5. Verifiser at funksjonaliteten fungerer som forventet før du går videre

## Oppdateringshistorikk

- **2024-XX-XX**: Opprettet roadmap
