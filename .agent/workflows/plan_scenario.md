---
description: Design-fase for et nytt Tidsreise-scenario. Lager Blueprint og definerer narrativ, stats og nodeflyt.
---

# Workflow: Plan Scenario

**Input:** Konsept, tema, historisk periode eller faglig kontekst (f.eks. "vikingtid", "første verdenskrig").

---

## 1. Les Referanser

*   File: `docs/SCENARIO_DESIGN_GUIDE.md` — Full teknisk og pedagogisk spec.
*   File: `docs/templates/scenario-blueprint-template.md` — Blueprintmalen.
*   File: `public/content/scenarios/roman-soldier.json` — Referanseimplementasjon (les kun metadata + 2-3 noder).

---

## 2. Definer Kjernen (ULTRATHINK)

Bruk det oppgitte konseptet til å brainstorme:

*   **Rolle:** Hvem er eleven i dette universet? (Konkret og historisk forankret — f.eks. "Vikinghandelsmann på Silkeveien")
*   **Spenningsbue:** Hva er det overordnede dilemmaet eleven må navigere? (Ikke "overlev" — finn en historisk-faglig kjerne)
*   **De 3-5 Stats:** Hva kan eleven miste eller vinne? Velg stats som har reell faglig forankring.
    *   Eks. Vikingtid: `ære`, `gull`, `skip_tilstand`, `rel_kaptein`
    *   Eks. Kald krig: `tillit`, `propaganda`, `øst_vest_spenning`
*   **Hub-noden:** Hva er "hjemmebasen"? (En leir, et marked, en by — brukes som navigasjonspunkt mellom hendelser)
*   **2-3 sentrale Hendelser/Valg:** Hva er de viktigste historisk meningsfulle valgene eleven tar?
*   **Narrative flags:** Hva er de 2–4 viktigste hendelsene eleven kan ta med seg gjennom historien? (Eks. `hjalp_fienden`, `nektet_ordre`, `ofret_seg`). Flags er ikke tall — de er hendelser som påvirker epilog og låser/åpner valg.

---

## 3. Opprett Blueprint

Opprett filen `docs/Design documents/[scenario-id]-scenario-blueprint.md` basert på malen i `docs/templates/scenario-blueprint-template.md`.

Fyll ut med spesifikt og konkret innhold — ikke generiske plassholdere. Blueprinten skal inneholde:

### Metadata
*   `id`, `title`, `role`, `era/year`, alle stats med startverdi og ikon
*   Koblet til manifest: hvilken `subjectId` og `topicId` hører dette under?

### Narrativ Bue
*   Introduksjonsscene (hva ser eleven, hva er umiddelbar kontekst)
*   Hovedkonflikt (pedagogisk forankret i læreplanen)
*   2-3 mulige avslutninger (seier, kompromiss, nederlag) med konkrete stat-terskler

### Nodeflyt (Minst 8 noder)

| Node ID | Type | Beskrivelse | Valg/Utganger | Faglig kobling | Flags/Discovery/Ethics |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `intro` | Narrativ | Ankomstscene | -> `hub_[navn]` | Historisk kontekst | `discoveryEvent` |
| `hub_[navn]` | Hub/Kart | Hjemmebasen | 3-4 lokasjoner | Oversikt/navigasjon | — |
| `[hendelse_1]` | Narrativ | ... | Valg A (`setFlags`), Valg B | ... | `ethicsLens`, `setFlags` |
| `[minigame_1]` | Battle/Dice/Justice | ... | Win -> ..., Loss -> ... | ... | — |
| `victory` | Ending | Seierscene | — | Refleksjon | `epilogue` med flag-entries |
| `defeat` | Ending | Tap-scene | — | Refleksjon | `epilogue` med flag-entries |

### Gjenstander & Crafting (valgfritt)
*   List opp 2-4 items som er narrativt meningsfulle
*   Én crafting-oppskrift hvis relevant

### Asset-prompts
*   Hero Image-prompt (16:9, cinematisk, WebP)
*   3-5 node-bildeprompts med eksakt stil fra `docs/image-style-guide.md`

---

## 4. Intervju (Interaktivt)

Etter at utkast er skrevet, still brukeren disse spørsmålene dersom blueprinten mangler svar:

1.  "Hvilken faglig kompetanse skal eleven sitte igjen med? (Læreplanen)"
2.  "Skal scenariet ha et Minispill (kamp, terning, domsavsigelse)?"
3.  "Er det en spesifikk historisk hendelse eller person som bør være sentralt?"
4.  "Ønsket visuell stil — realistisk foto, illustrasjon, maleri?"

---

## 5. Godkjenning

*   Bruker leser `docs/Design documents/[scenario-id]-scenario-blueprint.md`
*   Exit-betingelse: Bruker sier "Bygg det" eller "Godkjent" -> Trigger `/build_scenario`
