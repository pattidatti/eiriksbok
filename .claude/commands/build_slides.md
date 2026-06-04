---
description: Bygger en komplett, steg-for-steg lysbildepresentasjon (presentation-blokk) for en eksisterende læringssti. Hvert steg får sin egen seksjon (divider + innhold + oppgaveslide), og innholdsslidene synliggjør svaret på alle oppgavene slik at elevenes etterarbeid blir repetisjon. Mellomkrigstiden-stien er referansestandard.
---

# Workflow: Build Slides

**Input:** `[sti-path]` — full path til en `-sti.json`-fil (f.eks. `public/content/historie/vikingtiden/vikingtiden-sti.json`).

**Forutsetning:** Læringsstien finnes og har `learningPathData.steps`. Alle artikler som steg lenker til, finnes på disk.

**Resultat:** `learningPathData.presentation`-blokken i samme fil skrives (eller skrives over hvis bruker bekrefter).

---

## 0. Filosofi (les dette først)

Presentasjonen er ikke en oversikt eller en meny med overskrifter. Den er selve undervisningen.

Tre regler styrer alt under:

1. **Hvert steg får sin egen seksjon.** Ingen steg slås sammen, ingen steg hoppes over. Steg 0 (prolog) er like viktig som de andre.
2. **Hvert steg med oppgaver får sin egen oppgaveslide** som viser stegets faktiske oppgaver verbatim.
3. **Innholdsslidene synliggjør svaret på oppgavene.** Når en lærer har vært gjennom et stegs slides, skal elevene kunne svare på faktaoppgavene. Når de etterpå leser artikkelen og gjør oppgavene på egenhånd, blir det repetisjon.

Resultatet er en lang, komplett emneressurs (typisk 4-6 slides per steg, ofte 40-70 slides totalt) som læreren hopper i over flere økter. Lengde er ikke et problem; manglende dekning er det.

---

## 1. Les Kontekst

* **Referansestandard:** `public/content/historie/mellomkrigstiden/mellomkrigstiden-sti.json` — `learningPathData.presentation` er den ferdige malen for det nye mønsteret (seksjon per steg, full oppgavedekning, divider + innhold + oppgaveslide). Studer den før du begynner. (`romerriket-sti.json` er en eldre, mer komprimert variant - bruk den kun som sekundær referanse på enkelt-slides, ikke på struktur.)
* **Skjema:** `src/types.ts` — `Slide`, `SlideLayout`, `SlidePhase`, `PresentationData`, `SlideRevealItem`.
* **Layouts:** `src/components/presentation/ProjectorView.tsx` — hvilke layouts som faktisk støttes på projektor (`title`, `content`, `comparison`, `interactive`, `quote`, `discussion`, `task-pause`, `summary`).
  * `content`, `discussion` og `summary` deler samme render-gren (punkter + bilde, punkt-for-punkt-avdekking).
  * `comparison` viser KUN de to første `points` som to kolonner, hver som ett fett avsnitt (ingen bilde). Bruk den til to-sidige sammenligninger (f.eks. to teorier/perspektiver), legg hele forklaringen i hvert punkts `text`.
  * `quote` viser `title` som det store sitatet og `summary` som kilde/attribusjon. Ingen bilde, ingen punkter.
* **Avdekking:** `src/components/presentation/presentationNav.ts` — kun `content`/`discussion`/`comparison`(+`summary`) med `points` avdekkes ett punkt av gangen. Utnytt dette: legg svaret på en oppgave som et eget punkt læreren avdekker etter at klassen har tenkt.
* **Komponenter:** `src/components/ComponentRegistry.tsx` — kun komponenter som er registrert her kan brukes i `interactive`-slides.
* **Tidslinje:** Topp-tidslinjen er per-presentasjon: skala og milepæler hentes fra `presentation.config.timeline`. Ingen hardkodet fallback. Mangler `config.timeline`, utledes `start`/`end` fra slidenes år (uten milepæler) - en lavkvalitetsfallback.

---

## 2. Verifiser Forutsetninger og Hent Råmateriale

1. **Sti finnes:** `[sti-path]` er en gyldig fil med `learningPathData.steps`.
2. **Les ALLE steg fullstendig:** for hvert steg, hent ut `id`, `phase`, `title`, `links[]`, `component` (med props), og **`tasks[]` verbatim**. Oppgavetekstene skal gjengis ordrett på oppgaveslidene.
3. **Les artiklene som stegene lenker til.** Dette er kjernen i jobben. For hvert steg: les hver artikkel i `links[]` nøye og hent ut de presise faktaene som svarer på stegets oppgaver (eksakte tall, navn, årstall, definisjoner). Ikke gjett - grunne hvert poeng i artikkelteksten. For lange stier kan du delegere fakta-uthentingen til parallelle agenter (én per steg), men du skriver selve slidene selv for konsistens.
4. **Bilder finnes:** List filer under `public/images/[topicId]/` og lag en liste over tilgjengelige bilder. Marker manglende bilder i sluttrapporten i stedet for å finne på URL-er.
5. **Komponenter eksisterer:** Hvis et steg har `component`, sjekk at navnet er registrert i `ComponentRegistry.tsx`. Kopier props direkte fra steget for ekte symbiose.
6. **Eksisterende presentation:** Hvis `learningPathData.presentation` finnes fra før, **spør brukeren** om den skal overskrives. Aldri overskriv stille.

---

## 3. Struktur per steg (kjernen i mønsteret)

Bygg én seksjon per steg, i samme rekkefølge som stegene. Hver seksjon inneholder, i denne rekkefølgen:

### 3.1 Steg-divider (obligatorisk, `layout: 'title'`)
Åpner steget. Stor tittel ("Steg N: [stegtittel]"), `summary` (én slående linje), `year`/`yearRange`, et stemningsbilde, og `teacherNotes` med en levende åpningsscene/anekdote fra steget. Gir kapittelfølelse i en lang presentasjon.

### 3.2 Innholdsslides (1-4, `layout: 'content'` / `comparison` / `discussion`)
Henter de presise poengene fra stegets artikler.

**Dekningskravet (obligatorisk):**
* Hver **Fakta-** og **Forståelse-oppgave** i steget skal ha svaret sitt synlig som et punkt (eller i en slide-tittel + punkter som forklarer) i stegets innholdsslides.
* **Analyse-, empati-, sammenligning- og refleksjonsoppgaver** skal ha grunnlaget de bygger på presentert (faktaene, perspektivene, dilemmaet) - ikke et fasitsvar, men nok til at eleven kan resonnere.
* Legg gjerne det avgjørende svaret som siste punkt med `type: "key-fact"`, slik at læreren kan avdekke det etter at klassen har gjettet.
* Antall innholdsslides følger antall oppgaver: 2-3 oppgaver → 1-2 slides, 5-6 oppgaver → 3 slides. Maks ~4 punkter per slide.

### 3.3 Interaktiv slide (kun hvis steget har `component`, `layout: 'interactive'`)
Bruk samme komponent som steget, med props kopiert fra steget. Skaper symbiose: "nå viser jeg den samme øvingen dere skal gjøre". `teacherNotes` forklarer hvordan klassen bruker den sammen.

### 3.4 Sitat-slide (valgfritt, `layout: 'quote'`)
Der artikkelen har et slående sitat. `title` = sitatet, `summary` = kilde. **Oversett alltid fremmedspråklige sitat til norsk** (14-årings-prinsippet); behold originalen i `teacherNotes` hvis den er kjent.

### 3.5 Oppgaveslide (obligatorisk, `layout: 'task-pause'`)
Avslutter steget. Viser stegets `tasks[]` verbatim som `points`, med `taskPrompt` ("Les artikkelen X og svar på oppgavene i steg N."), `suggestedMinutes` og `pauseForTask: true`. `teacherNotes` minner om at faktaoppgavene allerede er gjennomgått, så dette blir repetisjon - bruk tiden på refleksjonsoppgavene.

**Steg uten artikkel** (rene quiz-/tidslinje-/øvingssteg) får divider + interaktiv + oppgaveslide, uten faktaslides.

---

## 4. Globale regler

### 4.1 Intro
Start hele presentasjonen med én `layout: 'title'`-slide for hele emnet. `yearRange` dekker hele spennet. **Ingen `linksToStepId`** (den er overordnet).

### 4.2 Faser
Hver slide unntatt intro skal ha `phase` lik stegets akt: `'opptakt'`, `'konfrontasjon'`, eller `'resolusjon'`. (Stegene bruker ofte "Akt 1: Opptakten" osv. - map til det korte fase-ordet.) Hver slide i et steg arver stegets fase.

### 4.3 Tidsforankring
Hver slide skal ha `year` (et punkt) eller `yearRange` (en periode). Historie: faktisk år (negativt for f.Kr). Ikke-historie: bruk `yearLabel` eller hopp over.

### 4.4 Tidslinje-config (obligatorisk hvis slides har år)
`presentation.config.timeline` MÅ settes emnespesifikt:

```json
"config": {
  "theme": "dark",
  "autoGenerateFromContent": false,
  "timeline": {
    "start": <første år, ≤ minste slide-år>,
    "end": <siste år, ≥ største slide-år>,
    "milestones": [
      { "year": <år>, "label": "<emnespesifikk hendelse>", "kind": "major" },
      { "year": <år>, "label": "<...>", "kind": "minor" }
    ]
  }
}
```
3-7 milepæler, alle innenfor `[start, end]`. `major` for strukturelle skifter (krig bryter ut, fred sluttes), `minor` for hendelser. **Aldri kopier timeline fra et annet emne.** Ser du "Augustus" i en WW1-sti, har du kopiert feil - start på nytt.

### 4.5 Bilder
Kun lokale bilder fra `public/images/[topicId]/`. **Aldri Unsplash eller eksterne URL-er.** Sjekk hva som finnes før du velger; gjenbruk er greit. Manglende bilder listes i sluttrapporten.

### 4.6 Språk og stil (obligatorisk)
* **14-åring-bokmål** (CLAUDE.md). Korte setninger, hverdagsord. Forklar fagbegreper når de innføres.
* **Korrekte tegn:** å, ø, æ. Aldri `aa`, `oe`, `ae`.
* **Aldri em-dash (—) eller tankestrek (–).** Bruk bindestrek (-).
* **Aldri bold (`**`) eller markdown-lister** i slidetekst. Slides bruker `points`-arrayet.
* **Oversett fremmedspråklige sitat til norsk.**
* **`teacherNotes` skrives til lærer** - konkret, hjelpsom, med anekdoter og diskusjonsvinklinger.
* **`talkingPoints` er åpne spørsmål** ("Hvorfor ...?", "Hva ville du gjort hvis ...?"), ikke ja/nei.

---

## 5. Slide-maler

**Steg-divider (title):**
```json
{
  "id": "div-[stegnavn]",
  "title": "Steg N: [Stegtittel]",
  "layout": "title",
  "summary": "[Én slående linje]",
  "phase": "[fase]",
  "linksToStepId": "[stegets-id]",
  "yearRange": [start, slutt],
  "image": "/images/[topicId]/[bilde].webp",
  "teacherNotes": "Levende åpningsscene/anekdote fra steget som læreren kan starte med."
}
```

**Innholdsslide (content):**
```json
{
  "id": "[stegnavn]-[tema]",
  "title": "[Aktiv, dramatisk tittel]",
  "layout": "content",
  "summary": "[Kort underoverskrift]",
  "phase": "[fase]",
  "linksToStepId": "[stegets-id]",
  "year": [år],
  "points": [
    { "id": "p1", "text": "[Poeng, max ~12 ord]", "type": "bullet" },
    { "id": "p2", "text": "[...]", "type": "bullet" },
    { "id": "p3", "text": "[Svaret på en oppgave]", "type": "key-fact" }
  ],
  "image": "/images/[topicId]/[bilde].webp",
  "teacherNotes": "Si hvilken oppgave svaret dekker, og foreslå en avdekkings-rytme.",
  "talkingPoints": ["[Åpent spørsmål]"]
}
```

**Sammenligning (comparison) - kun 2 punkter, hvert som ett avsnitt:**
```json
{
  "id": "[stegnavn]-sml",
  "title": "[A mot B]",
  "layout": "comparison",
  "summary": "[Hva sammenlignes]",
  "phase": "[fase]",
  "linksToStepId": "[stegets-id]",
  "yearRange": [start, slutt],
  "points": [
    { "id": "p1", "text": "[Side A: hele forklaringen i ett avsnitt]", "type": "bullet" },
    { "id": "p2", "text": "[Side B: hele forklaringen i ett avsnitt]", "type": "bullet" }
  ],
  "teacherNotes": "Vis venstre kolonne først, så høyre."
}
```

**Sitat (quote):**
```json
{
  "id": "[stegnavn]-quote",
  "title": "[Sitatet, oversatt til norsk]",
  "layout": "quote",
  "summary": "[Kilde/person, årstall]",
  "phase": "[fase]",
  "linksToStepId": "[stegets-id]",
  "year": [år],
  "teacherNotes": "Original og kontekst. Hvilken oppgave/diskusjon sitatet støtter."
}
```

**Interaktiv (interactive):**
```json
{
  "id": "[stegnavn]-[konsept]",
  "title": "[Konsept eller utfordring]",
  "layout": "interactive",
  "phase": "[fase]",
  "linksToStepId": "[stegets-id]",
  "year": [år],
  "component": { "name": "[Fra ComponentRegistry]", "props": { ...kopiert fra steget... } },
  "teacherNotes": "Hvordan klassen bruker komponenten sammen, og hvilket poeng man trekker ut."
}
```

**Oppgaveslide (task-pause):**
```json
{
  "id": "task-[stegnavn]",
  "title": "Les og svar: [Stegtittel]",
  "layout": "task-pause",
  "phase": "[fase]",
  "linksToStepId": "[stegets-id]",
  "year": [år],
  "pauseForTask": true,
  "suggestedMinutes": [10|15|20],
  "taskPrompt": "Les artikkelen [X] og svar på oppgavene i steg N.",
  "points": [ { "id": "tp1", "text": "[Stegets oppgave 1 verbatim]", "type": "bullet" } ],
  "image": "/images/[topicId]/[bilde].webp",
  "teacherNotes": "Faktaoppgavene er gjennomgått - dette blir repetisjon. Bruk tid på refleksjonsoppgavene."
}
```

---

## 6. Bygg Presentasjonen

For lengre stier er det tryggest å bygge `presentation`-blokken med et lite engangs-skript (Python/Node) som leser stegene, kopierer `tasks[]` og komponent-props, og dumper JSON med `ensure_ascii=False` og samme innrykk som fila. Det garanterer gyldig JSON og korrekte norske tegn, og lar deg gjenbruke en `task_points(stegId)`-hjelper. Slett skriptet etterpå.

Wrapper-struktur:
```json
"presentation": {
  "id": "[sti-id]-presentation",
  "title": "[Emnenavn]: Steg for steg",
  "config": { "theme": "dark", "autoGenerateFromContent": false, "timeline": { ... } },
  "slides": [ ... ]
}
```
Behold all eksisterende stistruktur uendret. **Aldri kopier timeline fra et annet emne.**

---

## 7. Valider og verifiser

### 7.1 JSON- og skjemasjekk (kjør programmatisk)
- [ ] **Gyldig JSON**, ingen trailing commas.
- [ ] **Kun gyldige felt** fra `Slide`-interfacet; ingen ukjente nøkler.
- [ ] **Unike `id`-er** på alle slides.
- [ ] **Alle `linksToStepId`** peker på faktiske `step.id` (intro unntatt).
- [ ] **Hvert steg har en divider** (`title` med `linksToStepId`) OG en `task-pause`-slide.
- [ ] **Steg 0 / prolog er med** (ikke hoppet over).
- [ ] **Alle `image`-stier** starter med `/images/[topicId]/` og peker på filer som finnes.
- [ ] **Alle `component.name`** er registrert i `ComponentRegistry.tsx`.
- [ ] **Alle layout-verdier** er gyldige; alle `points[].type` er `bullet`/`summary`/`key-fact`.
- [ ] **`config.timeline`** finnes hvis noen slide har år; `start` ≤ minste år, `end` ≥ største år; 3-7 milepæler innenfor range; emnespesifikke.
- [ ] **Ingen em-dash (—), tankestrek (–), bold (`**`)** noe sted (sjekk også verbatim oppgavetekster og komponent-props du kopierte - rett ved kilden hvis de finnes der).
- [ ] **Ingen "aa"/"oe"/"ae"** der det skal være å/ø/æ; ingen mojibake (Ã¦/Ã¸/Ã¥).
- [ ] **Ingen fremmedspråklig sitat** stått igjen på en quote-slide.

### 7.2 Dekningssjekk (obligatorisk)
For hvert steg: gå gjennom `step.tasks`. For hver Fakta-/Forståelse-oppgave, bekreft at svaret finnes i en av stegets innholdsslides (i et punkt eller i tittel + punkter). For hver refleksjons-/analyseoppgave, bekreft at grunnlaget er presentert. Rapporter eventuelle hull.

### 7.3 Bygg
```bash
npx tsc -b
```
Skal passere uten feil. (`npm run build` kjører i tillegg `scan:content` som regenererer andre filer - hopp over hvis du vil holde commit-scope rent.)

### 7.4 Render-sjekk (anbefalt)
Bekreft at alle brukte layouts har en render-gren i `ProjectorView.tsx` (unngå blanke slides). Start gjerne dev-server og verifiser at `/[subjectId]/[topicId]/present/[sti-id]` laster, og ta et par skjermbilder (divider, innhold, oppgaveslide).

---

## 8. Sluttrapport til Bruker

```
Presentation built: [sti-id]
Slides: [antall] (intro + [N] steg-seksjoner)
Per steg: divider + [innhold] + [interaktiv?] + oppgaveslide
Dekning: [N/N] steg har alle fakta-/forståelsessvar synlige i innholdsslidene
Components used: [liste]
Missing assets: [bilder/komponenter som mangler]
Manual review: [slides som krever ekstra øye]
URL: /[subjectId]/[topicId]/present/[sti-id]
```

**Ikke registrer noe i manifest** — `LearningPath.tsx` plukker opp `presentation`-blokken automatisk og viser "Start lysbilder"-knappen når den finnes.

**Ferdig!**
