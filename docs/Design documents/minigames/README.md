# Mini-spill Blueprints

Denne mappen inneholder **designgrunnlaget** for alle 3D-mini-spill i Eiriksbok.
Hvert spill *skal* ha en blueprint her før bygging begynner.

> Hvorfor: mini-spill koster 4-20 timer å bygge. Uten blueprint ender vi med
> spill som er teknisk riktige, men pedagogisk uklare. Blueprinten tvinger oss
> til å svare på "hva lærer eleven av dette?" *før* vi skriver TypeScript.

---

## Filnavn-konvensjon

`[spill-id]-blueprint.md` - samme ID som mappen i `src/games/`.

Eksempel: `watt-lab-blueprint.md` tilhører `src/games/watt-lab/`.

---

## Mal

Kopier denne malen når du starter en ny blueprint. Fyll ut alle seksjoner -
et tomt felt betyr at spillet ikke er ferdig designet.

```markdown
# Mini-spill Blueprint: [Tittel]

> **Status:** `Draft | Approved | Built | Shipped`
> **ID:** `[spill-id]`
> **Mappe:** `src/games/[spill-id]/`
> **Estimert omfang:** `Watt-lab-nivå (~750 linjer) | Lindisfarne-nivå (~900) | Stort (~1400)`

---

## 1. Pedagogisk kjerne

- **Fag:** `historie | norsk | krle | samfunnsfag | musikk`
- **Målgruppe:** [trinn og forutsetninger]
- **Læreplankobling:** [1-2 konkrete LK20-kompetansemål]
- **Læringsmål:**
  1. [Eleven kan X]
  2. [Eleven kan forklare hvorfor Y]
  3. [Valgfritt - eleven kan sammenligne Y med Z]
- **Suksesskriterier:** [Hvordan observeres læring i spillet? Hvilke valg/dialoger/quest-sluttverdier viser at målet er nådd?]
- **Hva kan IKKE læres i dette formatet?** [Vær ærlig. Hvis noe best læres via artikkel, ikke lag spill om det.]

---

## 2. Narrativ kjerne

- **Setting:** [År, sted, tid på døgnet, vær]
- **Spillerens rolle:** [Konkret navngitt rolle, historisk plausibel]
- **Hovedspenning:** [Én til to setninger - hva driver spilleren framover?]
- **Emosjonell bue:** [Fra X til Y, én setning]

---

## 3. Mekanisk kjerne

- **Spill-type:** `quest-rom | utendørs-utforskning | puzzle-station | hybrid`
- **Quest-struktur:**

| Fase | Mål | Pedagogisk funksjon |
|---|---|---|
| 1 | [...] | [Introduserer X] |
| 2 | [...] | [Eleven anvender X] |
| 3 | [...] | [Eleven ser konsekvens] |

- **NPCer:**
  - `[npc-id]` - [Navn] ([`scientist|farmer|noble|monk`]) - [rolle og hva de bidrar med]
- **Nøkkel-items:** `[item-id]` - [hva det er] - [hvor plasseres det]
- **Valg som driver læring:** [Hvilke 1-2 valg har synlige konsekvenser? Hvilke flagg settes?]
- **Slutt-tekst(er):** [Kort utkast - variasjon basert på flagg]

---

## 4. Visuell kjerne

- **Miljø:** `interiør | utendørs | hybrid`
- **Tid på døgnet:** `[timeOfDay 0.0-1.0]`
- **Stemning:** [2-3 adjektiver]
- **Fargepalett:** [3-5 hex, som går igjen i materialer]
- **Periode-autentisitet:** [3-5 detaljer som *må* være riktig]
- **Moodboard:** [Lenker til referansebilder]

---

## 5. Teknisk skisse

- **Rom-dimensjoner:** `size: [x, y, z]` (bredde, høyde, dybde)
- **Player startPosition:** `[x, y, z]` (min 2m fra sørveggen)
- **NPC-plassering:**
  - `[npc-id]`: position `[x, y, z]`
- **Item-plassering:**
  - `[item-id]`: position `[x, y, z]`
- **Dialog-stammer:** [Første linje per NPC + 1-2 valg-knapper]
- **Låste dører / gating:**
  - `flag 'X' → åpner dør til område Y`

---

## 6. Pedagogisk sjekkliste

Før godkjenning:

- [ ] Læringsmålene er konkrete og etterprøvbare
- [ ] En 14-åring forstår all tekst uten oppslag
- [ ] Valg har synlige konsekvenser
- [ ] Suksesskriteriene kan observeres
- [ ] 3D-formatet er riktig verktøy (ikke erstatning for artikkel)

---

## 7. Asset-notater

- **Thumbnail:** [AI-prompt etter `docs/image-style-guide.md`]
- **Spesielle modeller/textures:** [Hvis eksisterende prefabs ikke dekker]
```

---

## Godkjennings-flyt

1. **Draft** - Blueprint er skrevet, men ikke gjennomgått.
2. **Approved** - Bruker har lest og sagt "Bygg det". Bygger kan starte.
3. **Built** - Spillet er implementert og passerer `ConfigValidator`.
4. **Shipped** - Spillet er registrert i `MiniGamesPage` og playtest er gjennomført.

Oppdater `Status` i toppen av blueprinten ved statusovergang.

---

## Når du IKKE trenger blueprint

- Triviale endringer i eksisterende spill (justere dialog-tekst, rette typo).
- Eksperimenter/prototyper som IKKE skal shippes (marker tydelig).

Alt annet trenger blueprint - også spill du skal omskrive eller utvide
vesentlig.
