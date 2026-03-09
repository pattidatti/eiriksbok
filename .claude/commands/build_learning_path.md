---
description: Bygger en komplett læringssti-JSON fra en godkjent Blueprint. Implementerer alle steg, oppgaver, komponenter og registrerer i manifest.
---

# Workflow: Build Learning Path

**Input:** `[emne-id]` — ID-en til emnet (blueprint skal eksistere).

**Forutsetning:** `/plan_learning_path` er fullført og blueprintfilen finnes.

---

## 1. Les Kontekst

*   File: `docs/Design documents/[emne-id]-laeringssti-blueprint.md` — PRIMÆRKILDEN. Følg denne nøye.
*   File: `.agent/workflows/LEARNING_PATH_GUIDE.md` — JSON-schema og pedagogisk guide.
*   File: `src/types.ts` (linje 260-284) — TypeScript-typer for `LearningPathStep` og `LearningPathData`.
*   File: `public/content/historie/forste-verdenskrig/ww1-sti.json` — Referanseimplementasjon.
*   File: `public/content/manifest.json` — For registrering.

---

## 2. Verifiser Forutsetninger

1.  **Artikler eksisterer:** For hvert steg i blueprinten, sjekk at refererte artikkel-JSONer faktisk finnes i `public/content/`.
2.  **Ingen duplikat-ID:** Søk i `manifest.json` etter `[emne-id]-sti`. Hvis den finnes, stopp og spør bruker.
3.  **Blueprint-status:** Bekreft at blueprinten er godkjent (ikke "Utkast").

Hvis artikler mangler, informer bruker og spør om de skal opprettes først eller om stien skal tilpasses.

---

## 3. Opprett Læringssti-JSON

Opprett `public/content/[subjectId]/[topicId]/[emne-id]-sti.json`.

### 3.1 Ytre Wrapper (Metadata)

```json
{
    "id": "[emne-id]-sti",
    "title": "Læringssti: [Emnetittel]",
    "description": "Kort, selgende beskrivelse (1-2 setninger).",
    "layout": "learning-path",
    "category": "Læringssti",
    "year": "[tidsperiode]",
    "readTime": "[estimert tid]",
    "heroImage": "/images/[topicId]/[emne-id]-sti-hero.webp",
    "learningPathData": { ... }
}
```

### 3.2 Indre `learningPathData`

```json
"learningPathData": {
    "id": "[emne-id]-sti",
    "title": "[Emnetittel]",
    "description": "Lengre beskrivelse som motiverer eleven. 2-3 setninger.",
    "targetTopicId": "[topicId]",
    "targetSubjectId": "[subjectId]",
    "steps": [ ... ]
}
```

### 3.3 Steg-struktur

Hvert steg i `steps`-arrayet:

```json
{
    "id": "step-[nummer]",
    "phase": "[Akt-navn]",
    "title": "[Stegets tittel]",
    "type": "[fakta|refleksjon|utfordring|oppgave|ressurs|oving|gruppe]",
    "content": "Narrativ tekst (minst 150 ord). Skriv i 'Du'-perspektiv. Sett scenen, forklar kontekst, gi hint om hva eleven skal lete etter i artikkelen. Bruk kursiv for viktige begreper.",
    "tasks": [
        "Les artikkelen [Artikkeltittel](/absolutt/sti/til/artikkel)",
        "Fakta-spørsmål som kan besvares direkte fra artikkelen",
        "Forståelsesspørsmål som krever forklaring av mekanismer",
        "Analyse-/refleksjonsspørsmål som krever egen vurdering",
        "Etisk dilemma eller 'hva ville du gjort?'-spørsmål"
    ],
    "links": [
        {
            "title": "Les artikkel: [Tittel]",
            "url": "/absolutt/sti/til/artikkel"
        }
    ]
}
```

**Regler:**
*   Gyldige typer: `fakta`, `refleksjon`, `utfordring`, `oppgave`, `ressurs`, `oving`, `gruppe`. **ALDRI** `interaktiv`.
*   Hvert steg skal ha **5-8 oppgaver** som følger Bloom (Fakta → Forståelse → Refleksjon).
*   Hvis steget krever at eleven leser en artikkel, skal **"Les artikkelen [Tittel](url)"** ALLTID være den **første** oppgaven.
*   Alle stier starter med **absolutt sti** (`/`).
*   `content` skal være minst **150 ord** — guiding, narrativ, engasjerende.

### 3.4 Steg med Interaktive Komponenter

Steg som inneholder en komponent bruker `type: "utfordring"`, `"oppgave"` eller `"fakta"` (ALDRI `"interaktiv"`). Legg til `component`-feltet:

**ScenarioRoleplay:**
```json
"component": {
    "name": "ScenarioRoleplay",
    "props": {
        "title": "Tittel på scenariet",
        "intro": "Kontekst som setter eleven i rollen...",
        "startId": "start",
        "scenarios": [
            {
                "id": "start",
                "text": "Situasjonsbeskrivelse. Hva gjør du?",
                "options": [
                    { "label": "Valg A — handling", "nextId": "a" },
                    { "label": "Valg B — alternativ", "nextId": "b" }
                ]
            },
            {
                "id": "a",
                "text": "Konsekvens av valg A...",
                "options": [
                    { "label": "Videre handling", "nextId": "resultat" }
                ]
            },
            {
                "id": "resultat",
                "text": "Oppsummering og læringspunkt.",
                "options": []
            }
        ]
    }
}
```

**PackTheBag:**
```json
"component": {
    "name": "PackTheBag",
    "props": {
        "capacity": 500,
        "targetValue": 80,
        "items": [
            { "id": "item1", "name": "Gjenstand", "weight": 50, "value": 30, "icon": "emoji" }
        ]
    }
}
```

**BiasLens:**
```json
"component": {
    "name": "BiasLens",
    "props": {
        "title": "Perspektivanalyse",
        "baseContent": "Nøytral kildetekst...",
        "lenses": [
            {
                "id": "perspektiv-a",
                "label": "Kilde A",
                "description": "Bias-beskrivelse",
                "theme": { "color": "#ef4444", "bgColor": "bg-red-50", "borderColor": "border-red-200", "textColor": "text-slate-900" },
                "replacements": [
                    { "original": "Ord", "replacement": "Farget ord", "explanation": "Hvorfor dette er bias" }
                ]
            }
        ]
    }
}
```

**DebateSimulator:**
```json
"component": {
    "name": "DebateSimulator",
    "props": {
        "topic": "Debattpåstand",
        "opponentName": "Motstander",
        "context": "Bakgrunn...",
        "winningScore": 15,
        "arguments": [
            { "id": "a1", "text": "Ditt argument", "strength": 5, "type": "mercy", "response": "Motstanders svar" }
        ]
    }
}
```

**DragDropTimeline:**
```json
"component": {
    "name": "DragDropTimeline",
    "props": {
        "title": "Sett hendelsene i riktig rekkefølge",
        "events": [
            { "id": "e1", "year": 1000, "label": "Hendelse" }
        ]
    }
}
```

**MapCarousel:**
```json
"component": {
    "name": "MapCarousel",
    "props": {
        "title": "Karttittel",
        "items": [
            {
                "image": "/images/[topicId]/kartnavn.webp",
                "caption": "Beskrivelse av kartet",
                "alt": "Alt-tekst"
            }
        ]
    }
}
```

**PerspectivePrism:**
```json
"component": {
    "name": "PerspectivePrism",
    "props": {
        "title": "Flere perspektiver",
        "event": "Hendelsen som analyseres",
        "perspectives": [
            {
                "id": "p1",
                "label": "Perspektiv A",
                "icon": "emoji",
                "text": "Hvordan denne parten opplevde hendelsen..."
            }
        ]
    }
}
```

---

## 4. Valider JSON

Kjør gjennom denne sjekklisten:

- [ ] **Syntaks:** JSON er gyldig (ingen trailing commas, korrekt nesting)
- [ ] **Gyldige typer:** Alle steg bruker kun `fakta|refleksjon|utfordring|oppgave|ressurs|oving|gruppe` — ALDRI `interaktiv`
- [ ] **Absolutte stier:** Alle lenker i `tasks` og `links` starter med `/`
- [ ] **"Les artikkelen" først:** Der artikkelen kreves, er dette den første oppgaven
- [ ] **Ghost-Fact Audit:** Les faktisk innholdet i de refererte artiklene og verifiser at alle fakta-spørsmål kan besvares fra kildematerialet. Fjern eller omformuler spørsmål som refererer til informasjon som ikke finnes i artikkelen.
- [ ] **Content-lengde:** Hvert stegs `content`-felt er minst 150 ord
- [ ] **Oppgaver per steg:** 5-8 oppgaver per steg
- [ ] **Bloom-rekkefølge:** Oppgavene følger Fakta → Forståelse → Refleksjon
- [ ] **Steg 0 finnes:** Prolog med null forkunnskap
- [ ] **Unike ID-er:** Alle `step-[nummer]` er unike innen filen

---

## 5. Registrer i Manifest

Åpne `public/content/manifest.json` og legg til læringsstien under riktig topic sin `tools`-array:

```json
{
    "id": "[emne-id]-sti",
    "title": "Læringssti: [Emnetittel]",
    "description": "[description fra JSON-filen]",
    "link": "/[subjectId]/[topicId]/[emne-id]-sti",
    "icon": "map"
}
```

**VIKTIG:** Legg til under `tools`, IKKE `lessons`. Sjekk at `tools`-arrayet eksisterer — opprett det om nødvendig.

---

## 6. Oppdater Hub-indeks

Kjør:

```bash
node scripts/update-learning-paths.cjs
```

Dette oppdaterer læringsstibiblioteket slik at stien vises i hubben.

---

## 7. Generer Asset-liste

List opp alle bilder som trengs:

**Hero Image:**
```
Fil: /images/[topicId]/[emne-id]-sti-hero.webp
Prompt: A highly realistic 4K cinematic photograph of [scene], [historical period]. [Lighting]. [Camera angle]. 16:9 ratio, WebP.
```

**Komponentbilder (hvis relevant):**
```
Fil: /images/[topicId]/[filnavn].webp
Prompt: [Beskrivelse basert på docs/image-style-guide.md]
```

---

## 8. Oppdater Blueprint-status

Åpne `docs/Design documents/[emne-id]-laeringssti-blueprint.md` og endre:

```
**Status:** Utkast  →  **Status:** Bygget
```

---

## 9. Sluttverifikasjon

Kjør:

```bash
npm run scan:content
```

Sjekkliste:

- [ ] JSON-filen er opprettet i `public/content/[subjectId]/[topicId]/[emne-id]-sti.json`
- [ ] Filen er gyldig JSON (ingen parse-feil)
- [ ] Alle steg har type fra gyldige verdier (ikke `interaktiv`)
- [ ] Alle artikkellenker peker på eksisterende filer
- [ ] Ghost-Fact Audit er gjennomført
- [ ] Manifest er oppdatert med `tools`-oppføring
- [ ] Hub-indeksen er oppdatert (`update-learning-paths.cjs`)
- [ ] `scan:content` kjører uten feil
- [ ] Steg 0 (Prolog) finnes og krever null forkunnskap
- [ ] Minst 2 interaktive komponenter er implementert
- [ ] Alle steg har 5-8 oppgaver med Bloom-progresjon
- [ ] Blueprint-status er satt til "Bygget"

**Ferdig!** Informer bruker:
*   "Læringssti `[emne-id]-sti` er bygget og registrert."
*   URL: `/[subjectId]/[topicId]/[emne-id]-sti`
