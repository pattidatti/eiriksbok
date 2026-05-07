# Musikk-verktøy Blueprint: Skaleutforsker
> **Status:** `Draft`
> **Type:** Interaktivt utforskningsverktøy (standalone tool + inline komponent)

---

## 1. Metadata

- **Komponent-ID:** `ScaleExplorer`
- **Rute:** `/musikk/oving/skalaer`
- **Feature-mappe:** `src/features/music/components/ScaleExplorer.tsx`
- **Målgruppe:** 8.-10. klasse og lærere
- **Bruksmodi:** Primært klasseromsdemonstrasjon; også individuell utforskning
- **Avhengigheter:** Tone.js, musicTheory.ts (utvidelse nødvendig), VirtualPiano, FretboardExplorer

---

## 2. Sjelen ("The Soul")

> *"Hvorfor later blues slik? Fordi den mangler to av de syv tonene i dur-skalaen. Det er alt. Den ene innsikten endrer måten du horer musikk på for alltid."*

Skaleutforskeren er det beste visuelle verktøyet en musikklærer kan ha. Med ett klikk viser du klassen nøyaktig hvilke toner en skala bruker - synlig på piano OG gitar samtidig, med umiddelbar lydpavspilling. Det er et "aha-moment"-verktøy.

**Pedagogisk kjerne:** Fra abstrakt teori (intervallstrukturer) til konkret sansning (farger + lyd) i ett blikk. Kobler piano-visuell og gitar-griping i en felles ramme.

---

## 3. Skalabibliotek

Skaleutforskeren dekker 7 skalatyper, gruppert i to kategorier:

### Gruppe 1: Diatoniske skalaer (7-toners)

| Skalanavn | Norsk navn | Intervaller (halvtoner) | Typisk bruk |
|-----------|-----------|-------------------------|-------------|
| `major` | Dur (ionisk) | 0-2-4-5-7-9-11 | Pop, klassisk, folk |
| `natural-minor` | Naturlig moll (eolisk) | 0-2-3-5-7-8-10 | Rock, pop, film |
| `harmonic-minor` | Harmonisk moll | 0-2-3-5-7-8-11 | Klassisk, metal, flamenco |
| `dorian` | Dorisk | 0-2-3-5-7-9-10 | Jazz, blues-rock, folk |

### Gruppe 2: Pentatoniske skalaer (5-toners)

| Skalanavn | Norsk navn | Intervaller | Typisk bruk |
|-----------|-----------|-------------|-------------|
| `major-pentatonic` | Dur pentatonisk | 0-2-4-7-9 | Country, folk, mange sangmelodier |
| `minor-pentatonic` | Moll pentatonisk | 0-3-5-7-10 | Blues, rock, pop-soloer |
| `blues` | Blues-skala | 0-3-5-6-7-10 | Blues, jazz, rock |

---

## 4. UI-design og interaksjon

### Layout (Chromebook-baseline 1366x768)

```
┌─────────────────────────────────────────────────────────────┐
│  SKALEUTFORSKER                                             │
├──────────────────────────┬──────────────────────────────────┤
│  Grunntone:              │  Skalatype:                      │
│  C  D  E  F  G  A  B    │  [Dur] [Moll] [Harm.moll]       │
│  (og halvtoner)          │  [Dorisk] [Dur pent.] [Moll pent.] [Blues] │
├──────────────────────────┴──────────────────────────────────┤
│                                                             │
│  Piano (C4 - C6):                                          │
│  ┌─┬─┬┬─┬─┬─┬─┬┬─┬┬─┬─┬─┬─┬┬─┬─┬┬─┬─┬─┐                 │
│  │ │█││ │ │ │█││ ││ │ │ │ │█││ │ ││ │ │ │  ← svarte tang. │
│  │ └┤│└─┤ └─┤ └┤│└─┘│ └─┤ └┤│└─┤ └┘│ └─┤                 │
│  │C● D  E●  F● G● A  B● C● D  E●  F● G● │  ● = i skalaen │
│  └─────────────────────────────────────┘                   │
│                                                             │
│  Gitar (fretboard, 4 frets):                               │
│  E ──●──────●─────────●──  ← grønne prikker = skalatoner  │
│  B ──────●──────●──────●─                                  │
│  G ───●──────●──────●────                                  │
│  D ──────●──────●──────●─                                  │
│  A ──●──────●──────────●─                                  │
│  E ──●──────●─────────●──                                  │
│      1    2    3    4                                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [▶ Spill opp]  [▶ Spill ned]  BPM: [80]   Bølgeform: [▼]│
│                                                             │
│  Info: C-dur · 7 toner · C D E F G A B                    │
│  Typisk: Pop, klassisk musikk, folkesanger                  │
│  Intervallstruktur: Hel Hel Halv Hel Hel Hel Halv          │
└─────────────────────────────────────────────────────────────┘
```

### Fargelogikk

| Tone | Farge | Begrunnelse |
|------|-------|-------------|
| Grunntone (1) | Dyp oransje/gull | Tonikaen skiller seg ut |
| Kvint (5) | Lys blå | Nest viktigste tone |
| Øvrige skalatoner | Grønn | I skalaen |
| Utenfor skala | Grå/transparent | Ikke i skalaen |

Fargene er konsistente mellom piano og fretboard.

### Interaksjonspunkter

1. **Grunntone-velger:** Klikk bokstav (C, D, E, F, G, A, B) + toggle for kromatiske (C#, Db, etc.)
2. **Skala-velger:** Knapper med norske navn, gruppert i kategorier
3. **Klikk på piano-tangent:** Spiller enkelt tone via Tone.js
4. **Klikk på fretboard-prikk:** Spiller enkelt tone
5. **"Spill opp"-knapp:** Spiller skalaen oppadgående med valgt BPM
6. **"Spill ned"-knapp:** Nedadgående
7. **BPM-slider:** 40-160 BPM for avspilling

---

## 5. Teknisk arkitektur

### Utvidelse av musicTheory.ts

Legg til i eksisterende fil:

```typescript
// Skaladefinisjoner
export const SCALE_TYPES = {
    'major': {
        label: 'Dur (ionisk)',
        intervals: [0, 2, 4, 5, 7, 9, 11],
        description: 'Lys og glad. Brukt i pop, klassisk og folkesanger.',
        genres: ['Pop', 'Klassisk', 'Folk'],
        intervalPattern: ['Hel', 'Hel', 'Halv', 'Hel', 'Hel', 'Hel', 'Halv'],
    },
    'natural-minor': {
        label: 'Naturlig moll',
        intervals: [0, 2, 3, 5, 7, 8, 10],
        description: 'Mork og melankolsk. Grunnlaget for rock og pop-ballader.',
        genres: ['Rock', 'Pop', 'Film'],
        intervalPattern: ['Hel', 'Halv', 'Hel', 'Hel', 'Halv', 'Hel', 'Hel'],
    },
    'harmonic-minor': {
        label: 'Harmonisk moll',
        intervals: [0, 2, 3, 5, 7, 8, 11],
        description: 'Dramatisk og eksotisk. Det okte spranget gir spent folelse.',
        genres: ['Klassisk', 'Metal', 'Flamenco'],
        intervalPattern: ['Hel', 'Halv', 'Hel', 'Hel', 'Halv', '1.5x', 'Halv'],
    },
    'dorian': {
        label: 'Dorisk modus',
        intervals: [0, 2, 3, 5, 7, 9, 10],
        description: 'Moll med et lyst preg. Typisk for jazz og keltisk folkemusikk.',
        genres: ['Jazz', 'Blues-rock', 'Keltisk folk'],
        intervalPattern: ['Hel', 'Halv', 'Hel', 'Hel', 'Hel', 'Halv', 'Hel'],
    },
    'major-pentatonic': {
        label: 'Dur pentatonisk',
        intervals: [0, 2, 4, 7, 9],
        description: '5-toners dur-skala. Lett a improvisere med - ingen "gale" toner.',
        genres: ['Country', 'Folk', 'Pop-melodier'],
        intervalPattern: ['Hel', 'Hel', '1.5x', 'Hel', '1.5x'],
    },
    'minor-pentatonic': {
        label: 'Moll pentatonisk',
        intervals: [0, 3, 5, 7, 10],
        description: '5-toners moll-skala. Grunnlaget for rock og blues-gitarsoloer.',
        genres: ['Rock', 'Blues', 'Pop-soloer'],
        intervalPattern: ['1.5x', 'Hel', 'Hel', '1.5x', 'Hel'],
    },
    'blues': {
        label: 'Blues-skala',
        intervals: [0, 3, 5, 6, 7, 10],
        description: 'Moll pentatonisk + "blue note" (tritonus). Den karakteristiske blues-lyden.',
        genres: ['Blues', 'Jazz', 'Rock'],
        intervalPattern: ['1.5x', 'Hel', 'Halv', 'Halv', '1.5x', 'Hel'],
    },
} as const;

export type ScaleType = keyof typeof SCALE_TYPES;

export function getScaleNotes(root: Note, scaleType: ScaleType): Note[] {
    const rootIndex = NOTES_SHARP.indexOf(root);
    const intervals = SCALE_TYPES[scaleType].intervals;
    return intervals.map(i => NOTES_SHARP[(rootIndex + i) % 12]);
}
```

### Piano-fargelogikk

```typescript
function getPianoKeyStyle(
    noteName: Note,       // 'C', 'D#', etc.
    scaleNotes: Note[],
    rootNote: Note
): 'root' | 'fifth' | 'in-scale' | 'out-of-scale' {
    if (noteName === rootNote) return 'root';
    const fifthIndex = (NOTES_SHARP.indexOf(rootNote) + 7) % 12;
    if (noteName === NOTES_SHARP[fifthIndex]) return 'fifth';
    if (scaleNotes.includes(noteName)) return 'in-scale';
    return 'out-of-scale';
}
```

### Avspilling (Tone.js)

```typescript
async function playScale(
    root: Note,
    scaleType: ScaleType,
    direction: 'up' | 'down',
    bpm: number
) {
    const notes = getScaleNotes(root, scaleType);
    if (direction === 'down') notes.reverse();
    
    // Legg til oktav-info: start på C4, juster per note
    const midiNotes = notesToMidi(root, notes); // Regn ut MIDI-numre

    const synth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.8 },
    }).toDestination();

    const interval = (60 / bpm); // sekunder per slag
    midiNotes.forEach((midi, i) => {
        synth.triggerAttackRelease(
            Tone.Frequency(midi, 'midi').toNote(),
            '4n',
            Tone.now() + i * interval
        );
    });
}
```

### Fretboard-fargelogikk

Gjenbruker `FretboardExplorer.tsx` med ny prop:

```typescript
interface FretboardExplorerProps {
    // Eksisterende props...
    highlightedNotes?: Note[];           // Allerede eksisterende?
    noteColorMap?: Map<Note, NoteStyle>; // NY: støtt fargelogging per note
    showNoteNames?: boolean;             // Vis C, D, E etc. på prikkene
    maxFrets?: number;                   // Begrens antall frets (4-7 for klarhet)
}
```

Dersom FretboardExplorer ikke støtter fargekartet: legg til minimal prop uten å bryte eksisterende bruk.

---

## 6. Inline artikkelkomponent

`ScaleExplorer` skal også kunne brukes som inline komponent i artikkel-JSON:

```json
{
    "type": "component",
    "name": "ScaleExplorer",
    "props": {
        "defaultRoot": "C",
        "defaultScale": "major",
        "compact": true,
        "allowedScales": ["major", "natural-minor", "minor-pentatonic"]
    }
}
```

**Compact-modus:**
- Kun piano (ingen fretboard)
- Ingen BPM-slider, kun "Spill"-knapp
- Infopanel kollapset til én linje
- Bredde: 100% av artikkelen, maks 600px

---

## 7. Pedagogisk informasjonspanel

Under piano/fretboard vises et informasjonspanel som endres med valg:

```
┌─────────────────────────────────────────────────────┐
│  A moll pentatonisk                                 │
│  Toner: A  C  D  E  G                               │
│  Intervallstruktur: 1.5x · Hel · Hel · 1.5x · Hel  │
│                                                     │
│  Typisk brukt i: Rock · Blues · Pop-soloer          │
│                                                     │
│  Visste du? Den moll pentatoniske skalaen er en    │
│  av de mest brukte i pop og rock. Hendrix, BB King │
│  og Eric Clapton bygde karrierene sine på nettopp  │
│  disse fem tonene.                                  │
└─────────────────────────────────────────────────────┘
```

**"Visste du?"-tekster:** Pre-skrevet for alle 7 skalatyper × 12 grunntoner = 84 tekster (eller én per skalatype, 7 totalt). Én fakta-setning som gjor skalaen menneskelig.

---

## 8. Integrasjon i appen

### Manifest-oppføring

```json
{
    "id": "skaleutforsker-tool",
    "title": "Skaleutforsker",
    "description": "Utforsk dur, moll og blues-skalaer pa piano og gitar",
    "link": "/musikk/oving/skalaer",
    "icon": "layers"
}
```

### Kobling til artikler

- Lenk fra `akkorder-og-harmoni.json` ("Skalaer er grunnlaget for akkorder")
- Lenk fra `gitar-intro.json` ("Se hvilke toner du trenger på gitarhalsen")
- Lenk fra `piano-intro.json` ("Utforsk hvilke taster som horer til C-dur")
- Inline i en fremtidig artikkel om moll-skalaer

---

## 9. Klasseromsscenarier

**Scenario 1: Introduksjon til dur og moll**
1. Lærer velger C-dur. Spiller skalaen. "Legg merke til fargen."
2. Bytter til C moll. Spiller. "Hva forandret seg? Se fargene."
3. Klassen identifiserer de tre tonene som endret seg (E, A, B → Eb, Ab, Bb).

**Scenario 2: Forstå blues**
1. Starter med A moll pentatonisk.
2. Bytter til A blues-skala.
3. "Denne ene ekstra tonen (Eb) er 'blue note'. Det er alt som skiller blues fra rock."

**Scenario 3: Gitar-elev finner sin skala**
1. Eleven velger favorittakkord (f.eks. Em).
2. Bytter til E moll pentatonisk.
3. Ser på fretboard: "Alle grønne prikker - bruk dem til å improvisere over Em-akkord."

---

## 10. Tekniske fallgruver

1. **VirtualPiano-gjenbruk:** Sjekk om VirtualPiano støtter ekstern fargestyring per tangent via props. Dersom ikke: legg til prop `keyColorOverrides?: Record<string, string>` uten å bryte eksisterende bruk.
2. **Halvtone-representasjon:** Db og C# er samme tone, men representert ulikt. Internt: bruk alltid `#`-notasjon (NOTES_SHARP). Vis: bruk musikalsk korrekt notasjon basert på skalatype (f.eks. F-dur bruker Bb, ikke A#).
3. **Fretboard-oktav:** Fretboard viser toner i alle oktaver. Fargelogging av note "C" skal treffe alle C-er på brettet. Bruk `note % 12` for oktav-uavhengig matching.
4. **Avspilling-state:** Blokkér nye "Spill"-klikk mens avspilling pågår. Legg til "Stop"-knapp som avbryter Tone.Transport.

---

## 11. Implementasjonsrekkefølge

1. Utvid `musicTheory.ts` med `SCALE_TYPES` og `getScaleNotes()`
2. Grunntone-velger UI + skalatype-knapper
3. Piano fargelogging (bygger på VirtualPiano eller ny wrapper)
4. Informasjonspanel med tekst + intervallstruktur
5. Tone.js avspilling (opp og ned)
6. Fretboard fargelogging (bygger på FretboardExplorer)
7. BPM-kontroll
8. Compact-modus for inline i artikler
9. Manifest + rute-registrering
