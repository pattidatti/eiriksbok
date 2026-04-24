---
description: Design-fase for et nytt 3D-mini-spill. Lager Blueprint med pedagogisk, narrativ, mekanisk og visuell kjerne før bygging starter.
---

# Workflow: Plan Mini-spill

**Input:** Konsept, historisk periode, faglig tema, eller eksisterende artikkel som skal bli et spill (f.eks. "James Watt og dampmaskinen", "Vikingraid på Lindisfarne", "Ford sitt samlebånd").

**Output:** Godkjent Blueprint i `docs/Design documents/minigames/[spill-id]-blueprint.md`. Ingen koding før bruker har godkjent.

> **Forskjell fra `plan_scenario`:** Scenarier er 2D valg-baserte noderflyt. Mini-spill er 3D-scener med builder-API (rom, NPCer, quester, fysikk). Dette dokumentet gjelder mini-spill som bygges på `src/games/engine/`.

---

## 1. Les referanser

*   `CLAUDE.md` § "Språklige krav til innhold" - 14-årings-test for all tekst.
*   `.agent/workflows/BUILD_GAME_GUIDE.md` - Teknisk byggeguide. Les §1 (3-stegs-oppskrift), §3 (builder-katalog) og §16 (fallgruver) før du designer.
*   `docs/Design documents/minigames/README.md` - Konvensjoner for blueprint-format.
*   Referanse-spill, velg ett som matcher ambisjonsnivå:
    *   Enkelt quest-spill: `src/games/watt-lab/` (2-3 faser, 1 rom, 1 NPC, puzzle)
    *   Narrativt flerfase-spill: `src/games/lindisfarne-793/` (6+ faser, monolog-triggers, moral choice)
    *   Utendørs utforskning: `src/games/demo-world/` (åpen verden, vær, vegetasjon)

---

## 2. Definer kjernen (ULTRATHINK)

Fyll ut alle fire kjerner. Hvis en ikke kan besvares klart, ikke start bygging.

### 2.1 Pedagogisk kjerne

Dette er det viktigste. Spillet eksisterer *for* læring - alt annet er i tjeneste av dette.

*   **Fag:** `historie | norsk | krle | samfunnsfag | musikk`
*   **Målgruppe:** Trinn (8.-10. klasse typisk). Hva kan eleven fra før?
*   **Læreplankobling:** 1-2 konkrete kompetansemål fra læreplanen (LK20). Se `docs/laereplaner/` hvis den finnes.
*   **Læringsmål (1-3 stk):** Hva skal eleven *kunne* etter 15 minutter? Formuler konkret, ikke svevende:
    *   Bra: "Eleven kan forklare hvorfor dampmaskinen reduserte gruvearbeidets farlighet."
    *   Dårlig: "Eleven lærer om industriell revolusjon."
*   **Suksesskriterier:** Hvordan ser "eleven har lært dette" ut i spillet? Hvilken dialog, hvilket valg, hvilken quest-oppløsning demonstrerer forståelsen?
*   **Hva kan IKKE læres i dette formatet?** Vær ærlig. Et 3D-spill er dårlig for abstrakte strukturer og kronologisk dybde. Hvis læringsmålet best læres via artikkel eller tidslinje, lag *det* i stedet.

### 2.2 Narrativ kjerne

*   **Setting:** Hvor og når? Vær spesifikk (år, sted, værforhold).
*   **Spillerens rolle:** Hvem er eleven i spillet? Gi en navngitt, historisk plausibel rolle ("Lærling hos James Watt i Soho Works, 1776"), ikke en generisk "du".
*   **Hovedspenning:** Hva driver spilleren framover? Dette trenger *ikke* være eksistensiell dramatikk - en konkret oppgave med uklar løsning er nok ("Watt trenger at maskinen leverer 5 atmosfærers trykk før han møter investoren").
*   **Emosjonell bue:** Én setning - fra X til Y. ("Fra nysgjerrighet til mestring"; "Fra respekt til moralsk tvil".)

### 2.3 Mekanisk kjerne

*   **Spill-type:** Quest-rom (Watt-lab-stil)? Utendørs utforskning (Lindisfarne-stil)? Puzzle (Station-mode)?
*   **Quest-struktur:** 2-4 faser. Per fase: ett tydelig mål, én "aha"-øyeblikk.
    | Fase | Mål | Pedagogisk funksjon |
    | --- | --- | --- |
    | 1 | ... | Introduserer X |
    | 2 | ... | Eleven må anvende X |
    | 3 | ... | Eleven ser konsekvensen |
*   **NPCer:** 1-3 stk. Per NPC: navn, historisk rolle, hva kan de fortelle spilleren som ikke kan læres på andre måter?
*   **Items/pickups:** Hvilke gjenstander driver narrativet eller mekanikken? Maks 5-7.
*   **Valg som driver læring:** Hvilke 1-2 valg gjør eleven som påvirker quest-flyt eller slutt? Et valg er bare meningsfullt hvis konsekvensen synes.
*   **Slutt-tekst(er):** Kort utkast. Variabel slutt basert på hvilke flagg som er satt.

### 2.4 Visuell kjerne

*   **Miljø:** Interiør eller utendørs? Tid på døgnet? (`timeOfDay` i visual-config.)
*   **Stemning:** 2-3 adjektiver. "Varm, trygg, håndverkspreget" eller "kaldt, truende, hellig". Påvirker `colorGrading` og lys.
*   **Fargepalett:** 3-5 hex-farger som går igjen i materialer (gulv, vegger, props).
*   **Periode-autentisitet:** Hvilke 3-5 objekter/detaljer *må* være riktig for perioden? (Rette klær, riktige verktøy, ingen anakronismer.)
*   **Moodboard-referanser:** Kunstverk, foto, film som treffer stemningen. Kan være Wikipedia-lenker eller SNL.

---

## 3. Opprett Blueprint

Opprett filen `docs/Design documents/minigames/[spill-id]-blueprint.md` basert på malen i `docs/Design documents/minigames/README.md`.

Blueprinten skal inneholde seksjonene fra §2.1-§2.4, pluss:

### Teknisk skisse

*   **Rom-dimensjoner:** `size: [bredde, høyde, dybde]` i meter. Standard 8-12m bredde, 4m høyde.
*   **Player startPosition:** Plasser **minst 2m fra sørveggen** (kamera følger bak). Se BUILD_GAME_GUIDE §2.
*   **NPCer med plassering:** `{ id, name, characterType, position: [x, y, z] }`
*   **Nøkkel-items:** `{ id, name, position }`
*   **Dialog-stammer:** Første linje per NPC pluss 1-2 valg-knapper per dialog. Full tekst skrives i build-fasen.
*   **Låste dører / gating:** Hvis spillet har faser som åpnes av flagg, list `flag → konsekvens`.

### Signatur-visuelle elementer

Tabell over alle objekter/effekter som er avgjørende for spillets identitet. Eksempler: flammetårn, boretårn, maskin, altar, portal, ildsted. Uten konkrete tall her ender bygging med "brun klump på en stang" (se oljeplattform-retrospektiv).

| Element | Minimum-høyde | Emissive? | Animert? | Lys-kilde? |
| --- | --- | --- | --- | --- |
| (eks.) Flammetårn | Mast 15m, flamme 5m | Ja — 3 kjegler, emissiveIntensity 2.5-4.5 | Ja — vaiende via registerUpdate | PointLight int ≥100, distance ≥30 |

### Pedagogisk sjekkliste

Før godkjenning, bekreft:

- [ ] Læringsmålene er konkrete og etterprøvbare (ikke svevende "lærer om")
- [ ] En gjennomsnittlig 14-åring forstår all tekst uten oppslag (CLAUDE.md § språk)
- [ ] Valgene i spillet har synlige konsekvenser for læringen
- [ ] Suksesskriteriene kan observeres (i dialog, quest-slutt eller endText)
- [ ] Spillet er ikke et bedre alternativ til en artikkel - det utnytter 3D-formatet

### Visuell sjekkliste

For hvert signatur-visuelt element i spillet (flamme, tårn, maskin, lyskaster, hovedstasjon), spesifiser i Blueprint:

- [ ] **Minimums-dimensjoner**: høyde, bredde, diameter i meter. Store objekter som skal være synlige fra andre ender av scenen bør være ≥10-15m.
- [ ] **Emissive-plan**: Hvilke deler skal gløde? (flamme, display-skjermer, varsellys, lampe-fronter.) `addProp` støtter ikke emissive — disse elementene må bygges med raw THREE i `*Assets.ts`. Se BUILD_GAME_GUIDE §6.1.
- [ ] **Animasjon**: Hvilke objekter skal leve? (vaiende flamme, blinkende varsellys, pulserende display.) Krever `engine.registerUpdate`.
- [ ] **Lys-plan**: Hvis utendørs/skumring — hvilke `HemisphereLight`, `DirectionalLight` og synlige lamper (mast+hus+spot) er planlagt? `outdoor-dusk` og `outdoor-night` alene er for mørke. Se BUILD_GAME_GUIDE §6.1.
- [ ] **Distanse-test**: Beskriv hvordan hovedobjektene skal være synlige fra spilleren sin spawn-posisjon (ikke bare på nært hold).

### Slutt-modell

Velg og begrunn i Blueprint:

- [ ] **Kredittrull** (`triggerEnd` → slutt-skjerm med `endText`): spillet har en klar definitiv slutt.
- [ ] **Loop-spillbart** (ingen `triggerEnd`, feiring som in-game monologer): verden er interessant å utforske etterpå.

Se BUILD_GAME_GUIDE §8b.

### Asset-prompts (valgfritt på dette stadiet)

*   **Thumbnail:** 16:9 cinematisk, 4K, AI-prompt etter `docs/image-style-guide.md`.
*   **Eventuelle spesielle props:** Hvis et objekt ikke dekkes av eksisterende modeller/prefabs.

---

## 4. Intervju (Interaktivt)

Etter at utkast er skrevet, still brukeren disse spørsmålene dersom blueprinten mangler svar:

1.  "Hvilket konkret kompetansemål fra læreplanen dekker dette spillet?"
2.  "Hva skal eleven kunne gjøre *etter* 15 minutter som de ikke kunne før?"
3.  "Hvilken type spill - quest-rom, utforskning, puzzle? Ambisjonsnivå: Watt-lab (~750 linjer) eller Lindisfarne (~900 linjer)?"
4.  "Er det en spesifikk historisk figur eller hendelse som bør være sentralt?"
5.  "Hva er stemningen i én setning? (Eks: 'varm mesterleie', 'kald hellig trussel'.)"

---

## 5. Godkjenning

*   Bruker leser `docs/Design documents/minigames/[spill-id]-blueprint.md`.
*   Exit-betingelse: Bruker sier "Bygg det" eller "Godkjent".
*   **Før du starter bygging:** les `BUILD_GAME_GUIDE.md` §1 (3-stegs-oppskrift), §2 (Pre-Flight Checklist) og §16 (fallgruver).
*   Kjør `ConfigValidator` etter initial build - alle FATAL-issues må løses før playtest.
