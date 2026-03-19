# Plan: Revers-Virkemiddelverksted ("Bruk"-modus)

## Konsept
Utvide eksisterende Virkemiddelverkstedet med en andre modus: **"Bruk virkemidler"** ved siden av eksisterende **"Analyser virkemidler"**. Elevene bytter mellom modusene via faner øverst i verkstedet. Bruk-modusen har 3 nivåer per virkemiddel (proof of concept), alle åpne fra start. Poeng spores separat. Mestring krever begge moduser fullført.

## Arkitektur-beslutninger

### Gjenbruk av eksisterende øvelsestyper
Vi trenger **ingen nye React-komponenter** for øvelsene. Alle 9 eksisterende typer kan gjenbrukes med "anvend"-fokusert innhold:

| Øvelsesformat (Bruk) | Eksisterende type | Eksempel |
|---|---|---|
| **Sett inn** (velg riktig virkemiddel i kontekst) | `identify` / `explain` | "Hvilken metafor passer best i denne setningen?" |
| **Omskriving** (skriv med virkemiddel) | `write` | "Skriv om setningen med personifisering" |
| **Velg beste** (hvilken bruker virkemiddelet best) | `explain` | "Hvilken av disse bruker kontrast mest effektivt?" |
| **Fiks/forbedre** (rett en dårlig bruk) | `find-error` | "Denne ironien treffer ikke. Velg fiksen." |
| **Match kontekst** (koble virkemiddel til situasjon) | `match` | "Koble riktig virkemiddel til riktig kontekst" |
| **Fyll inn** (komplett setningen med virkemiddel) | `fill-blank` | "Havet var ___ den kvelden." (rasende) |

### 3 Nivåer for Bruk-modus
| Nivå | Tittel | Beskrivelse | Oppgavetyper |
|---|---|---|---|
| 1 | Lærling | Enkle innsettings- og valgoppgaver | identify, fill-blank, explain |
| 2 | Svenn | Omskriving og kontekstkobling | write, match, explain |
| 3 | Mester | Fiks, forbedre og avansert bruk | find-error, write, match |

### Tilpasning for vanskelige virkemidler
Frampek, tilbakeblikk, in medias res, tema og budskap er strukturelle/analytiske. For disse tilpasses oppgavene:
- **Frampek**: "Hvilken setning legger best inn et frampek her?" (velg blant alternativer)
- **Tilbakeblikk**: "Skriv en setning som starter et tilbakeblikk fra denne scenen"
- **In medias res**: "Hvilken åpning bruker in medias res best?" (velg mellom åpninger)
- **Tema/Budskap**: "Skriv en kort tekst som får fram temaet ensomhet" / "Hvilken avslutning gir budskapet 'vennskap krever mot'?"

## Implementeringsplan

### Steg 1: Typer og nivåer
**Filer:** `types.ts`, `levels.ts`

- Legg til `WorkshopMode = 'analyser' | 'bruk'` type
- Legg til `ApplyLevel = 1 | 2 | 3` type
- Oppdater `ViewState` til å inkludere `mode`
- Legg til `APPLY_LEVEL_INFO` med 3 nivåer (Lærling, Svenn, Mester)

### Steg 2: Zustand store
**Fil:** `useVirkemiddelStore.ts`

- Legg til `applyProgress: Record<string, DeviceProgress>` (separat fra `progress`)
- Legg til `applyTotalPoints: number` (separat fra `totalPoints`)
- Legg til `getApplyDeviceProgress(deviceId)` getter
- Legg til `completeApplyExercise(deviceId, exerciseId, points)`
- Legg til `isDeviceFullyMastered(deviceId)` — sjekker begge moduser
- Legg til `resetAll()` nullstiller begge

### Steg 3: Øvelsesdata — 15 filer med "Bruk"-oppgaver
**Filer:** `exercises/apply/[device-id].ts` (15 filer) + `exercises/apply/index.ts`

Hver fil inneholder 3 nivåer × ~3 oppgaver = ~9 oppgaver per virkemiddel.
Totalt ~135 oppgaver for alle 15 virkemidler.

Oppgavene bruker eksisterende `Exercise`-interface og `ExerciseData`-typer — ingen nye typer trengs. ID-format: `apply-metafor-1-1` (prefix `apply-` for å skille fra analyseoppgaver).

### Steg 4: Side og fane-UI
**Fil:** `VirkemiddelverkstedetPage.tsx`

- Legg til `mode` state: `'analyser' | 'bruk'`
- Render fane-bytter øverst (under header, over grid):
  ```
  [ 🔍 Analyser virkemidler ]  [ ✏️ Bruk virkemidler ]
  ```
- Pass `mode` ned til alle child-komponenter
- ViewState inkluderer mode slik at navigasjon husker hvilken fane man er i

### Steg 5: DeviceGrid oppdatering
**Fil:** `DeviceGrid.tsx`

- Motta `mode` som prop
- Vis riktig poengsum basert på modus (Analyser: X / Bruk: Y)
- Hent progress fra riktig store-getter basert på modus
- Endre undertekst basert på modus ("Tren på å kjenne igjen..." vs "Tren på å bruke...")

### Steg 6: DeviceCard oppdatering
**Fil:** `DeviceCard.tsx`

- Motta `mode` som prop
- Beregn progress fra riktig øvelsessett (analyser vs bruk)
- Mastery-badge vises kun når BEGGE moduser er fullført
- Vis separat progresjonsring basert på aktiv modus

### Steg 7: TheoryCard tilpasning
**Fil:** `TheoryCard.tsx`

- I "Bruk"-modus: Vis "Slik bruker du det" istedenfor "Slik kjenner du det igjen"
- Legg til `howToUse` felt i `DeviceTheory` interface (eller gjenbruk existing teori med annen CTA-tekst)
- CTA: "Start skriveøvelsene" istedenfor "Start øvelsene"

### Steg 8: LevelSelector tilpasning
**Fil:** `LevelSelector.tsx`

- Motta `mode` som prop
- I "Bruk"-modus: Vis 3 nivåer (APPLY_LEVEL_INFO) istedenfor 10
- Alle nivåer er ulåst fra start (ingen lock-logikk)
- Ellers samme visuelle stil

### Steg 9: ExerciseRunner tilpasning
**Fil:** `ExerciseRunner.tsx`

- Motta `mode` som prop
- Hent øvelser fra apply-index når mode er 'bruk'
- Bruk `completeApplyExercise` fra store når mode er 'bruk'
- Ellers identisk logikk

### Steg 10: CompletionScreen og MasteryScreen
**Filer:** `CompletionScreen.tsx`, `MasteryScreen.tsx`

- CompletionScreen: Ingen sekvensielt nivålåsing i bruk-modus (alle nivåer alltid åpne)
- MasteryScreen: Sjekk `isDeviceFullyMastered()` — vises kun når BEGGE moduser er fullført
- Per-modus completion: Vis en "modus-fullført"-skjerm når alle 3 bruk-nivåer er done, men ikke full mastery

### Steg 11: Exercises index oppdatering
**Fil:** `exercises/index.ts`

- Eksporter nye hjelpefunksjoner for apply-exercises:
  - `getApplyExercisesForDevice(deviceId, level)`
  - `getApplyExerciseCountForDevice(deviceId)`
  - `hasApplyExercises(deviceId)`

## Fil-oversikt

### Nye filer (17):
```
src/data/virkemiddelverkstedet/exercises/apply/index.ts
src/data/virkemiddelverkstedet/exercises/apply/metafor.ts
src/data/virkemiddelverkstedet/exercises/apply/sammenligning.ts
src/data/virkemiddelverkstedet/exercises/apply/symbol.ts
src/data/virkemiddelverkstedet/exercises/apply/personifisering.ts
src/data/virkemiddelverkstedet/exercises/apply/besjeling.ts
src/data/virkemiddelverkstedet/exercises/apply/frampek.ts
src/data/virkemiddelverkstedet/exercises/apply/tilbakeblikk.ts
src/data/virkemiddelverkstedet/exercises/apply/in-medias-res.ts
src/data/virkemiddelverkstedet/exercises/apply/ironi.ts
src/data/virkemiddelverkstedet/exercises/apply/kontrast.ts
src/data/virkemiddelverkstedet/exercises/apply/gjentakelse.ts
src/data/virkemiddelverkstedet/exercises/apply/alliterasjon.ts
src/data/virkemiddelverkstedet/exercises/apply/tema.ts
src/data/virkemiddelverkstedet/exercises/apply/budskap.ts
src/data/virkemiddelverkstedet/exercises/apply/types.ts  (kun hvis nødvendig)
```

### Modifiserte filer (11):
```
src/data/virkemiddelverkstedet/types.ts
src/data/virkemiddelverkstedet/levels.ts
src/data/virkemiddelverkstedet/devices.ts (legg til howToUse i teori)
src/data/virkemiddelverkstedet/exercises/index.ts
src/stores/useVirkemiddelStore.ts
src/pages/VirkemiddelverkstedetPage.tsx
src/components/virkemiddelverkstedet/DeviceGrid.tsx
src/components/virkemiddelverkstedet/DeviceCard.tsx
src/components/virkemiddelverkstedet/TheoryCard.tsx
src/components/virkemiddelverkstedet/LevelSelector.tsx
src/components/virkemiddelverkstedet/ExerciseRunner.tsx
src/components/virkemiddelverkstedet/CompletionScreen.tsx
src/components/virkemiddelverkstedet/MasteryScreen.tsx
```

## Rekkefølge
1. Types + levels (grunnlaget)
2. Store (state management)
3. Exercise data (alle 15 apply-filer + index)
4. Page + tabs (UI entry point)
5. DeviceGrid + DeviceCard (mode-aware grid)
6. TheoryCard (tilpasset teori for bruk-modus)
7. LevelSelector (3 åpne nivåer)
8. ExerciseRunner (mode-aware exercise dispatch)
9. CompletionScreen + MasteryScreen (dual-mode mastery)
10. Test og finjuster
