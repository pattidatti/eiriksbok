---
description: Bygger en kurert lysbildepresentasjon (presentation-blokk) for en eksisterende læringssti. Slides knyttes til steg, fases i 3-aktsbue, og bruker interaktive komponenter og lokale bilder. Romerriket-stien er referansestandard.
---

# Workflow: Build Slides

**Input:** `[sti-path]` — full path til en `-sti.json`-fil (f.eks. `public/content/historie/vikingtiden/vikingtiden-sti.json`).

**Forutsetning:** Læringsstien finnes og har `learningPathData.steps`. Alle artikler som steg lenker til, finnes på disk.

**Resultat:** `learningPathData.presentation`-blokken i samme fil skrives (eller skrives over hvis bruker bekrefter).

---

## 1. Les Kontekst

* **Referansestandard:** `public/content/historie/romerriket/romerriket-sti.json` — `learningPathData.presentation` er den ferdige malen. Studer slide-strukturen før du begynner.
* **Skjema:** `src/types.ts` — `Slide`, `SlideLayout`, `SlidePhase`, `PresentationData`.
* **Layouts:** `src/components/presentation/ProjectorView.tsx` — hvilke layouts som faktisk støttes på projektor (`title`, `content`, `comparison`, `interactive`, `quote`, `discussion`, `task-pause`, `summary`).
* **Komponenter:** `src/components/ComponentRegistry.tsx` — kun komponenter som er registrert her kan brukes i `interactive`-slides.
* **Tidslinje:** `src/components/presentation/SlideEraTimeline.tsx` + `resolveTimelineConfig.ts`. Topp-tidslinjen er nå **per-presentasjon**: skala og milepæler hentes fra `presentation.config.timeline`. Det finnes **ingen hardkodet fallback** til noe spesifikt emne. Hvis `config.timeline` mangler, utleder appen `start`/`end` fra slidenes år (uten milepæler).

---

## 2. Verifiser Forutsetninger

1. **Sti finnes:** `[sti-path]` er en gyldig fil med `learningPathData.steps`.
2. **Artikler finnes:** For hvert steg med `links[]`, sjekk at hver intern URL peker på en eksisterende JSON-fil i `public/content/`.
3. **Bilder finnes:** List filer under `public/images/[topicId]/` og lag en liste over tilgjengelige hero- og scenebilder.
4. **Komponenter eksisterer:** Hvis steg har `component`-felt, sjekk at navnet er registrert i `ComponentRegistry.tsx`.
5. **Eksisterende presentation:** Hvis `learningPathData.presentation` finnes fra før, **spør brukeren** om den skal overskrives. Aldri overskriv stille.

---

## 3. Designprinsipper for Slidene

### 3.1 Symbiose med stien (obligatorisk)

* Hver innholdsslide skal ha `linksToStepId` som peker til et faktisk stegs `id`. Intro- og outro-slides kan stå uten.
* Hver slide unntatt intro/outro skal ha `phase`: `'opptakt'`, `'konfrontasjon'`, eller `'resolusjon'`.
* Plasser slides i samme rekkefølge som stegene de hører til.
* Inkluder minst én `task-pause`-slide per akt — typisk etter en interaktiv slide eller før en stor refleksjonsoppgave.

### 3.2 Tidsforankring (obligatorisk)

* Hver slide skal ha enten `year` (et enkelt punkt) eller `yearRange` (en periode).
* For historie-stier: bruk faktisk historisk år. Negative tall for f.Kr (`-509`), positive for e.Kr (`313`).
* For ikke-historie-stier (norsk, KRLE, samfunnskunnskap): bruk `yearLabel` som tekst i stedet hvis årstall ikke er relevant — eller hopp over feltet.

### 3.3 Tidslinje-config (obligatorisk hvis slides har år)

Topp-tidslinje-stripen i ProjectorView og Controller leser **alltid** sin skala og milepæler fra `presentation.config.timeline`. Det er **ingen hardkodet fallback til noen epoke**. Hvis du glemmer denne, vil tidslinjen auto-utledes fra slidenes år (ingen milepæler), som er en lavkvalitetsfallback.

**For å unngå at en sti viser et annet emnes tidslinje, MÅ presentation.config.timeline alltid settes når slides har år:**

```json
"config": {
  "theme": "dark",
  "autoGenerateFromContent": false,
  "timeline": {
    "start": <første år, f.eks. -753 eller 1900>,
    "end": <siste år, f.eks. 476 eller 1939>,
    "milestones": [
      { "year": <år>, "label": "<kort beskrivelse>", "kind": "major" },
      { "year": <år>, "label": "<...>", "kind": "minor" }
    ]
  }
}
```

**Regler:**
* `start` skal være mindre enn eller lik det laveste slide-året i stien.
* `end` skal være større enn eller lik det høyeste slide-året.
* 3-7 milepæler er passe. Bruk `major` for politiske/strukturelle skifter (riket grunnlegges, krig bryter ut, fred sluttes), `minor` for hendelser (slag, viktig dokument).
* Milepælene må være **emnespesifikke** og må *ikke* være kopiert fra et annet emne. Sjekk doblets at årene gir mening for *denne* stien.
* For ikke-historiske stier uten konkrete år: dropp `timeline` helt og dropp `year`/`yearRange` på slidene. Da skjules tidslinje-stripen.

### 3.4 Bilder

* Bruk kun lokale bilder fra `public/images/[topicId]/`. **Aldri Unsplash eller eksterne URL-er.**
* Sjekk hvilke bilder som finnes før du velger. Hvis du trenger et bilde som ikke finnes, marker det i sluttrapporten som "manglende bilde" i stedet for å lage en URL som ikke fungerer.

### 3.5 Interaktive komponenter

* Bruk komponenter som allerede er brukt i selve stiens steg når det er mulig — det skaper symbiose ("nå viser jeg den samme PackTheBag som dere skal gjøre").
* Generelle komponenter som ofte passer: `MapCarousel`, `DragDropTimeline`, `Quiz`, `FactBox`, `Gallery`, `BiasLens`.
* Roma-spesifikke: `RomanExpansionMap`, `RomanPantheonExplorer`, `PackTheBag`.
* Andre emner kan ha sine egne — sjekk `ComponentRegistry.tsx`.
* **Test at komponenten faktisk fungerer i full-screen.** Hvis komponenten er optimalisert for smal artikkel-spalte (`prose`-bredde), vil den ofte se forlatt ut i en projektør. Marker problemet i sluttrapporten.

### 3.6 Språk og stil (obligatorisk)

* **14-åring-norsk** (CLAUDE.md). Korte setninger, hverdagsord. Forklar fagbegreper når de innføres.
* **Bokmål, korrekte tegn:** å, ø, æ. Aldri `aa`, `oe`, `ae`.
* **Aldri em-dash (—) eller tankestrek (–) i tekst.** Bruk bindestrek (-) i stedet.
* **Aldri bold (`**`) i slidetekst.** Konsepter fremheves via talkingPoints, ikke fet skrift.
* **Ingen markdown-lister i `text`-blokker.** Slides bruker `points`-arrayet.
* **`teacherNotes` skrives til lærer**, ikke til elev. Tonen er hjelpsom, konkret, og foreslår konkrete diskusjons-vinklinger.
* **`talkingPoints` er åpne spørsmål**, ikke ja/nei. Eks: "Hvorfor ...?", "Hva ville du gjort hvis ...?"

---

## 4. Strukturere Presentasjonen

### 4.1 Slide-antall som tommelfingerregel

| Stiens lengde | Foreslått antall slides |
|---|---|
| 4-6 steg | 8-10 slides |
| 7-9 steg | 11-14 slides |
| 10+ steg | 15-18 slides |

Ikke gå over 18 slides. Slå sammen lignende steg til én slide hvis nødvendig (f.eks. to fakta-steg om samme emne).

### 4.2 Standardflyt (3-akts)

1. **Intro** — `layout: 'title'`, `yearRange` som dekker hele stiens spenn. Ingen `linksToStepId`.
2. **Opptakt** (akt 1) — 2-4 slides som setter scenen. Knyttes til de første stegene.
3. **Pause for første lese-/oppgaverunde** — `layout: 'task-pause'` etter første store leseoppgave.
4. **Konfrontasjon** (akt 2) — 4-7 slides som er hoveddelen. Minst én `layout: 'interactive'` her hvis stien har en passende komponent.
5. **Andre pause** — `layout: 'task-pause'` for midtveis-refleksjon eller en interaktiv øving elevene gjør i stien.
6. **Resolusjon** (akt 3) — 2-3 slides som lander stoffet, inkludert en `layout: 'summary'`.
7. **Avsluttende pause / fordypning** — `layout: 'task-pause'` for den avsluttende store oppgaven i stien.

### 4.3 Slide-mal (per type)

**Intro (title):**
```json
{
  "id": "pres-intro",
  "title": "[STIENS NAVN I VERSALER]",
  "layout": "title",
  "summary": "[Undertekst i én linje, gjerne kjent sitat eller paradoks]",
  "phase": "opptakt",
  "yearRange": [start, slutt],
  "image": "/images/[topicId]/[hero-bilde].webp",
  "teacherNotes": "Velkommen-paragraf. Foreslå en åpningsdiskusjon med klassen ('Hva tenker dere på når jeg sier ...?')."
}
```

**Innholdsslide (content):**
```json
{
  "id": "pres-[stegnavn]",
  "title": "[Slidetittel, gjerne aktiv/dramatisk]",
  "layout": "content",
  "summary": "[Kort underoverskrift]",
  "phase": "[opptakt|konfrontasjon|resolusjon]",
  "linksToStepId": "[stegets-id]",
  "year": [år] eller "yearRange": [start, slutt],
  "points": [
    { "id": "p1", "text": "[Kort poeng, max 60 tegn]", "type": "bullet" },
    { "id": "p2", "text": "[...]", "type": "bullet" },
    { "id": "p3", "text": "[...]", "type": "bullet" }
  ],
  "image": "/images/[topicId]/[bilde].webp",
  "teacherNotes": "2-3 setninger forklaring til læreren. Inkluder gjerne en konkret fortelling eller anekdote som læreren kan dele.",
  "talkingPoints": [
    "[Åpent diskusjonsspørsmål]",
    "[Hva-ville-du-gjort-spørsmål]"
  ]
}
```

**Interaktiv slide (interactive):**
```json
{
  "id": "pres-[konsept]",
  "title": "[Konsept eller utfordring]",
  "layout": "interactive",
  "phase": "[fase]",
  "linksToStepId": "[stegets-id]",
  "year": [år] eller "yearRange": [start, slutt],
  "component": {
    "name": "[KomponentNavn fra ComponentRegistry]",
    "props": { ... }
  },
  "teacherNotes": "Forklar hvordan klassen skal bruke komponenten sammen. Hvor styres den fra? Hvilken læringspoeng skal man trekke ut?"
}
```

**Pause (task-pause):**
```json
{
  "id": "pres-pause-[konsept]",
  "title": "[Kort handling: 'Les og svar', 'Spill gjennom', 'Diskuter']",
  "layout": "task-pause",
  "phase": "[fase]",
  "linksToStepId": "[stegets-id]",
  "year": eller "yearRange": [...],
  "pauseForTask": true,
  "suggestedMinutes": [10|15|20],
  "taskPrompt": "[En klar instruksjon: 'Les artikkelen X og svar på oppgavene i steg Y.']",
  "points": [
    { "id": "tp1", "text": "[Konkret deloppgave]", "type": "bullet" },
    { "id": "tp2", "text": "[...]", "type": "bullet" }
  ],
  "image": "/images/[topicId]/[bilde].webp",
  "teacherNotes": "Praktisk veiledning til læreren. Hvordan organiseres tiden? Hva ser læreren etter mens elevene jobber?"
}
```

**Oppsummering (summary):**
```json
{
  "id": "pres-legacy",
  "title": "[Avsluttende spørsmål eller refleksjon]",
  "layout": "summary",
  "summary": "[Tema for oppsummeringen]",
  "phase": "resolusjon",
  "linksToStepId": "[siste innholdssteg]",
  "yearRange": [...],
  "points": [
    { "id": "s1", "text": "[Hovedpoeng 1]", "type": "summary" },
    { "id": "s2", "text": "[...]", "type": "summary" },
    { "id": "s3", "text": "[...]", "type": "summary" }
  ],
  "image": "/images/[topicId]/[bilde].webp",
  "teacherNotes": "Avslutningstone. Knytt stoffet til elevenes hverdag. Takk for følget."
}
```

---

## 5. Bygg Presentasjonen

1. **Skriv presentation-blokken** under `learningPathData.presentation` i sti-filen. Behold all eksisterende stistruktur uendret.
2. **Wrapper-struktur:**
   ```json
   "presentation": {
     "id": "[sti-id]-pres",
     "title": "[Stiens tittel, kort og slående]",
     "config": {
       "theme": "dark",
       "autoGenerateFromContent": false,
       "timeline": {
         "start": <første år for STIENS emne>,
         "end": <siste år for STIENS emne>,
         "milestones": [
           { "year": <år>, "label": "<emnespesifikk hendelse>", "kind": "major" }
         ]
       }
     },
     "slides": [ ... ]
   }
   ```
   **Aldri kopier timeline-blokken fra et annet emne.** Bygg den fra bunnen basert på stiens egne årstall.
3. **Komprimert formatering for slides:** Bruk ett-linjes objekter for `points`-elementer (slik Romerriket gjør), full struktur for selve slide-objektene.

---

## 6. Valider JSON

Sjekkliste:

- [ ] **Gyldig JSON:** ingen trailing commas, korrekt nesting.
- [ ] **Alle `linksToStepId` peker på faktiske `step.id`-verdier** i samme sti.
- [ ] **Alle `image`-stier starter med `/images/[topicId]/`** og peker på filer som faktisk finnes.
- [ ] **Alle `component.name` er registrert i `ComponentRegistry.tsx`.**
- [ ] **Hver fase representert minst én gang:** `opptakt`, `konfrontasjon`, `resolusjon`.
- [ ] **Minst 2 task-pause-slides** (helst 3 — en per akt).
- [ ] **Alle år er konsistente** med årstallene som er nevnt i stegtekstene.
- [ ] **`config.timeline` finnes hvis noen slide har år.** `start` ≤ minste slide-år. `end` ≥ største slide-år. 3-7 milepæler, alle innenfor `[start, end]`.
- [ ] **Tidslinjens milepæler hører til STIENS emne**, ikke et annet emne. Hvis du ser milepæler som "Augustus" eller "Republikken" i en WW1-sti, har du kopiert fra Romerriket — start på nytt.
- [ ] **Ingen em-dash (—), tankestrek (–), eller bold (`**`)** i `title`, `summary`, `teacherNotes`, `talkingPoints`, eller `points[].text`.
- [ ] **Ingen "aa", "oe", "ae"** der det skal være "å", "ø", "æ".
- [ ] **`teacherNotes` er skrevet til lærer**, ikke som elevtekst.
- [ ] **`talkingPoints` er åpne spørsmål**, ikke ja/nei.
- [ ] **Intro-slide har ingen `linksToStepId`** (den er overordnet).

---

## 7. Verifiser

Kjør:

```bash
npx tsc -b
npm run build
```

Begge skal passere uten feil. Hvis `tsc` klager på `learningPathData.presentation`, dobbeltsjekk at felt-navn matcher `Slide`-interfacet i `src/types.ts`.

Start dev-server hvis ikke allerede oppe, og verifiser at `http://localhost:5175/[subjectId]/[topicId]/present/[sti-id]` returnerer 200:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:5175/[subjectId]/[topicId]/present/[sti-id]"
```

---

## 8. Sluttrapport til Bruker

Lever en kort rapport:

```
Presentation built: [sti-id]
Slides: [antall] (intro + [N] innhold + [M] pause + outro)
Phases: [hvor mange slides per fase]
Components used: [liste]
Linked steps: [N/totalt] steg har minst én slide knyttet til seg
Missing assets: [bilder som er referert men ikke finnes, eller komponenter som ikke kunne brukes]
Manual review recommended for: [hvilke slides som krever ekstra øye, f.eks. interaktive komponenter som kan se rart ut i full-screen]
URL: /[subjectId]/[topicId]/present/[sti-id]
```

**Ikke registrer noe i manifest** — `LearningPath.tsx` plukker opp `presentation`-blokken automatisk og viser "Start lysbilder"-knappen når den finnes.

**Ferdig!**
