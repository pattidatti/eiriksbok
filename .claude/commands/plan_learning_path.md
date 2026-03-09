---
description: Design-fase for en ny læringssti. Scanner eksisterende artikler, planlegger 3-akters narrativ bue, og oppretter Blueprint.
---

# Workflow: Plan Learning Path

**Input:** Emne/topic (f.eks. "vikingtiden", "romerriket", "den kalde krigen").

---

## 1. Les Referanser

*   File: `.agent/workflows/LEARNING_PATH_GUIDE.md` — Komplett guide med JSON-schema, pedagogikk og komponentbibliotek.
*   File: `public/content/manifest.json` — App-skjelettet. Finn emnet og dets artikler.
*   File: `src/types.ts` (linje 260-284) — TypeScript-typer for `LearningPathStep` og `LearningPathData`.
*   File: `public/content/historie/forste-verdenskrig/ww1-sti.json` — Referanseimplementasjon (les struktur og tone).
*   File: `docs/image-style-guide.md` — Bildegenereringsstandarder.

---

## 2. Kartlegg Eksisterende Innhold

1.  Finn emnet i `manifest.json` — identifiser `subjectId` og `topicId`.
2.  List opp alle artikler (`lessons`) under dette topicet.
3.  For hver artikkel, les JSON-filen og noter:
    *   Tittel, årstall, kategori
    *   Lengde (antall content-blokker)
    *   Nøkkeltemaer og hendelser
4.  Lag en tabell:

| # | Artikkel-ID | Tittel | Årstall | Eksisterer? | Egnet for steg |
|---|---|---|---|---|---|
| 1 | ... | ... | ... | Ja/Nei | ... |

5.  Identifiser hull: Mangler det artikler for å dekke den narrative buen? Noter disse som "må opprettes" eller "kan hoppes over".

---

## 3. Design den Narrative Buen (ULTRATHINK)

Bruk all informasjon fra steg 2 til å designe den komplette læringsreisen.

### 3.1 Overordnet Design

*   **Perspektiv/Tone:** Definer "Du"-stemmen. Hvem er eleven i denne reisen? (F.eks. "Du er en ung bonde som ser riket vokse" eller "Du er journalist som dekker krisen"). Stemmen skal utvikle seg gjennom aktene.
*   **Emosjonell bue:** Beskriv den emosjonelle reisen (nysgjerrighet → spenning → empati → refleksjon).
*   **Rød tråd:** Hva er det gjennomgående spørsmålet som binder alle steg sammen? (F.eks. "Hvorfor faller sivilisasjoner?" eller "Hva gjør en leder god?")

### 3.2 Tre-akters Modell

**Steg 0 — Prolog (OBLIGATORISK)**
*   Null forkunnskap. Setter scenen.
*   Kobles til en oversiktsartikkel.
*   Type: `fakta`

**Akt 1: Opptakten** (3-5 steg)
*   Etablerer kontekst, personer, og de tidlige spenningene.
*   Fokus på Bloom-nivå 1-2 (fakta og forståelse).

**Akt 2: Konfrontasjonen** (4-8 steg)
*   Kjernekonflikten. Her skjer det dramatiske.
*   Interaktive komponenter plasseres her (minst 1).
*   Bloom-nivå 2-3 (forståelse og analyse).

**Akt 3: Resolusjonen** (2-4 steg)
*   Etterspill, konsekvenser, refleksjon.
*   Bloom-nivå 3 (analyse og etikk).
*   Siste steg bør ha en samlende refleksjonsoppgave.

### 3.3 Steg-for-steg Skisse

For hvert steg, definer:

| # | Steg-ID | Fase | Tittel | Type | Artikkelkobling | Komponent? | Bloom-nivå |
|---|---|---|---|---|---|---|---|
| 0 | step-0 | Prolog | ... | fakta | /path/to/article | — | 1 |
| 1 | step-1 | Akt 1 | ... | fakta | ... | — | 1-2 |
| ... | ... | ... | ... | ... | ... | ... | ... |

> **VIKTIG:** Step-typen `interaktiv` finnes IKKE i TypeScript-typen. Steg med komponenter bruker `fakta`, `utfordring` eller `oppgave` som type.

---

## 4. Velg Interaktive Komponenter (minst 2)

Velg minst to komponenter fra dette biblioteket. Beskriv kort hvordan de skal brukes i kontekst:

| Komponent | Bruksområde | Typisk steg-type |
|---|---|---|
| `ScenarioRoleplay` | Dilemmaer, historisk empati, valg-basert læring | `utfordring` |
| `PackTheBag` | Ressursstyring, forberedelser, økonomi | `oppgave` |
| `BiasLens` | Perspektiv, kildekritikk, propaganda | `fakta` eller `utfordring` |
| `DebateSimulator` | Argumentasjon, politikk, rettssaker | `utfordring` |
| `DragDropTimeline` | Hendelsesrekkefølge, kronologi | `oving` |
| `MapCarousel` | Historiske kart, geografi, grenseendringer | `fakta` |
| `PerspectivePrism` | Samme hendelse sett fra ulike synsvinkler | `refleksjon` |

For hver valgt komponent, skriv:
*   Hvilken hendelse/kontekst den kobles til
*   Hvilke props som trengs (konseptnivå, ikke fullstendig JSON)
*   Hvorfor denne komponenten styrker læringen akkurat her

---

## 5. Opprett Blueprint

Opprett filen `docs/Design documents/[emne-id]-laeringssti-blueprint.md` med følgende struktur:

```markdown
# Blueprint: Læringssti — [Emnetittel]

**Status:** Utkast
**Fag:** [subjectId]
**Emne:** [topicId]
**Sti-ID:** [emne-id]-sti
**Målgruppe:** Ungdomsskole/VGS
**Estimert tid:** X timer

## Rød Tråd
[Det gjennomgående spørsmålet/perspektivet]

## Artikkelgrunnlag
[Tabell fra steg 2]

## Narrativ Bue
### Perspektiv og Tone
[Fra steg 3.1]

### Emosjonell Bue
[Fra steg 3.1]

## Steg-for-steg Plan
[Tabell fra steg 3.3 med utfyllende beskrivelser for hvert steg]

## Interaktive Komponenter
[Beskrivelser fra steg 4]

## Hero Image
**Prompt:** A highly realistic 4K cinematic photograph of [scene], [period]. [Lighting]. [Composition]. 16:9 ratio.

## Mangler / Åpne Spørsmål
[Artikler som må opprettes, uavklarte pedagogiske valg]
```

---

## 6. Intervju (Interaktivt)

Etter at utkastet er skrevet, still brukeren disse spørsmålene dersom blueprinten mangler svar:

1.  "Mangler det artikler for noen steg? Skal vi opprette placeholdere, eller tilpasse stien?"
2.  "Er det spesifikke læreplanmål (kompetansemål) som skal dekkes?"
3.  "Ønsker du et bestemt perspektiv — observatør, deltaker, leder?"
4.  "Hva skal den siste refleksjonsoppgaven handle om? (Koble fortid til nåtid)"

---

## 7. Kvalitetssjekk

Verifiser før godkjenning:

- [ ] **Steg 0 finnes** — Prolog med null forkunnskap
- [ ] **Alle lenker er absolutte** — Starter med `/`
- [ ] **Bloom følges** — Fakta → Forståelse → Refleksjon i hvert steg
- [ ] **10-20 steg totalt** — Ikke for kort, ikke for lang
- [ ] **Ingen duplikat-ID** — Søk i `manifest.json` etter `[emne-id]-sti`
- [ ] **Minst 2 interaktive komponenter** planlagt
- [ ] **Ingen `interaktiv`-type** — Alle steg bruker gyldige typer: `fakta|refleksjon|utfordring|oppgave|ressurs|oving|gruppe`
- [ ] **Hvert steg har 5-8 oppgaver** planlagt
- [ ] **"Les artikkelen" er første oppgave** der artikkelen kreves

---

## 8. Godkjenning

*   Bruker leser `docs/Design documents/[emne-id]-laeringssti-blueprint.md`
*   Exit-betingelse: Bruker sier "Bygg det" eller "Godkjent" → Trigger `/build_learning_path`
