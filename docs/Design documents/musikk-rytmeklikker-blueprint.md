# Musikk-verktøy Blueprint: Rytme-klikker
> **Status:** `Draft`
> **Type:** Interaktivt øvingsverktøy (standalone tool)

---

## 1. Metadata

- **Komponent-ID:** `RhythmTapper`
- **Rute:** `/musikk/oving/rytme`
- **Feature-mappe:** `src/features/music/components/RhythmTapper.tsx`
- **Målgruppe:** 8.-10. klasse (primær), kan brukes nedover til 6. klasse
- **Bruksmodi:** Individuell øving og klasseromsdemonstrasjon
- **Avhengigheter:** Tone.js (metronom + click-lyd), BeatBuilder (inspirasjon/gjenbruk)

---

## 2. Sjelen ("The Soul")

> *"Rytme er musikkens hjerte. Du kan ikke lese deg til det - du må kjenne det."*

Det finnes ingen digital erstatning for å spille med en dirigent i rommet, men dette verktøyet er det nest beste. Eleven ser en rytmefrase, hører metronomet, og klikker i takt. Nøyaktigheten vises visuelt og numerisk. Resultatet er konkret og ubestridelig - du var 80ms for tidlig.

**Pedagogisk kjerne:** Motorisk innlæring gjennom kinestetisk feedback. Eleven lærer å *internalisere* pulsen, ikke bare se den.

---

## 3. Modes (Treningsnivåer)

### Modus A: Se og tapp (Guided Mode)

Viser en notert rytmefrase. Metronomet spilles. Eleven klikker/tapper i takt med notene.

**Frasen vises som:**
- Moderne notasjon (SVG): noter på en enkelt linje (slagverk-notasjon)
- Alternativt: grafisk "bokser" representasjon (mer tilgjengelig uten notekunnskaper)

**Nivåer:**

| Nivå | Rytmiske verdier | Taktart |
|------|-----------------|---------|
| 1 | Kun halvnoter (slag på 1 og 3) | 4/4 |
| 2 | Fjerdedeler (ett slag per slag) | 4/4 |
| 3 | Kombinasjon halvnoter + fjerdedeler | 4/4 |
| 4 | Åttendedeler (to slag per slag) | 4/4 |
| 5 | Synkoper (slag mellom slagene) | 4/4 |
| 6 | Trioler | 4/4 |
| 7 | 3/4-takt (vals) | 3/4 |
| 8 | 6/8-takt | 6/8 |

---

### Modus B: Hør og tapp (Blind Mode)

Metronomet og en pre-generert rytmefrase spilles. Eleven tapper rytmen uten å se notasjonen. Etter tapingen sammenlignes tappingen med den faktiske rytmefrasen.

Brukes til å teste at eleven har internalisert rytmen fra Modus A.

---

### Modus C: Fri tapping (Metronome Mode)

Bare et metronom. Eleven tapper fritt. Nøyaktighetsvisning per slag. Kan brukes til:
- Oppvarming
- Teste BPM-følelse
- Fingre-teknikk-øving

BPM-velger: 40 / 60 / 80 / 100 / 120 / 140 (preset-knapper + slider).
Subdivisionsmodus: Metronomet markerer bare slag 1, eller alle underdelinger.

---

## 4. UI-design og interaksjon

### Layout (Chromebook-baseline 1366x768)

```
┌─────────────────────────────────────────────────────┐
│  [Se og tapp]  [Hør og tapp]  [Fritt]   BPM: 80   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Nivå 3: Halvnoter + fjerdedeler         4/4        │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  𝅗𝅥   ♩   ♩   𝅗𝅥   ♩   ♩   ♩   ♩           │   │
│  │  1 . 2 . 3 . 4 . 1 . 2 . 3 . 4 .          │   │
│  └──────────────────────────────────────────────┘   │
│                                                     │
│  Metronom: ●  ○  ○  ○   ← animert "ticker"         │
│                                                     │
│         ┌──────────────────────────┐               │
│         │    TRYKK HER / MELLOMROM │               │
│         └──────────────────────────┘               │
│                                                     │
│  Presisjon:  ████████░░  82%   Streak: 🔥 3        │
│                                                     │
│  [▶ Start]  [BPM -]  80  [BPM +]  [Ny frase]      │
└─────────────────────────────────────────────────────┘
```

### Tapping-mekanikk

**Inndatametoder (parallelle):**
1. Tastatur: `Mellomrom` (primær)
2. Museklikk/touch: Stor tap-knapp
3. Mobil: Touch-area (hele nedre halvdel av skjermen)

**Hit-vindu:** Akseptabel nøyaktighet etter vanskelighetsgrad:
- Lett: ±120ms → "Perfekt"
- Middels: ±80ms
- Vanskelig: ±50ms

**Visuell feedback per slag:**
- Grønn glød: Perfekt (innen ±50ms)
- Gul: Nær (±50-120ms)
- Rød: Feil (>120ms fra target)
- Svart: Miss (ingen tapping ved forventet slag)

### Visualisering av nøyaktighet

Under tapp-knappen: En tidslinje som viser hvert slag:

```
Forventet: |---|---|---|---|
Faktisk:   |--o|-o-|---|--o|   ← sirkel = din tapping
                                 farge = nøyaktighet
```

---

## 5. Teknisk arkitektur

### Metronom-kjerne (Tone.js)

```typescript
// Bruk Tone.Transport for nøyaktig timing
const metronome = {
    start(bpm: number, onBeat: (beatIndex: number) => void) {
        Tone.Transport.bpm.value = bpm;
        Tone.Transport.scheduleRepeat((time) => {
            // Spill click-lyd
            clickSynth.triggerAttackRelease('C5', '16n', time);
            Tone.Draw.schedule(() => onBeat(currentBeat), time);
        }, '4n');
        Tone.Transport.start();
    }
};
```

**Viktig:** All timing gjennom `Tone.Transport` for sample-nøyaktighet. Aldri `setTimeout`.

### Rytmefrase-format

```typescript
interface RhythmPattern {
    id: string;
    name: string;
    level: number;
    timeSignature: [number, number];  // [4, 4]
    bars: number;
    beats: Beat[];  // Definert i Tone.js-notation: '4n', '8n', '2n', etc.
}

interface Beat {
    position: string;  // Tone.js: "0:0:0", "0:1:0", etc.
    duration: string;  // '4n', '8n', '2n'
    display: NoteType; // Hva som vises i notasjonen
}
```

### Pre-definerte mønstre (hardkodet bibliotek)

```typescript
const RHYTHM_PATTERNS: RhythmPattern[] = [
    {
        id: 'halvnoter-1', name: 'Halvnoter', level: 1,
        beats: [
            { position: '0:0:0', duration: '2n', display: 'half' },
            { position: '0:2:0', duration: '2n', display: 'half' },
            { position: '1:0:0', duration: '2n', display: 'half' },
            { position: '1:2:0', duration: '2n', display: 'half' },
        ]
    },
    // ...osv
];
```

### Nøyaktighetsberegning

```typescript
function calculateAccuracy(
    expectedTimes: number[],   // Tone.Transport-tider i sekunder
    actualTimes: number[]      // performance.now() konvertert
): AccuracyResult {
    // For hvert forventet slag: finn nærmeste faktiske tapping
    // Beregn avvik i millisekunder
    // Return: { hitRate, avgDeviation, perBeatResults }
}
```

---

## 6. Notasjonsvisualisering

### Enkel grafisk modus (standard)

Blokker med bredde proporsjonal til notelengde. Fargekoding per nøyaktighetsresultat etter tapping.

```
[  HALVNOTE  ] [FJERD.][FJERD.] [  HALVNOTE  ]
 ████████████   ██████  ██████   ████████████
```

### SVG-notasjonsmodus (avansert, aktiveres av læreren)

Rendrer faktiske noter på en slagverks-notasjons-linje via SVG. Viser:
- Notelengder (hel, halvnote, fjerdedel, åttendedel)
- Taktstreker
- Taktartsignatur
- Pauser

Teknisk: Én-linje SVG, ikke full partitur-rendering. Unngå ABCjs eller Vexflow (for tung dependency).

---

## 7. Integrasjon i appen

### Manifest-oppføring

```json
{
    "id": "rytmeklikker-tool",
    "title": "Rytme-klikker",
    "description": "Tren rytmesansen - trykk i takt og se nøyaktigheten din",
    "link": "/musikk/oving/rytme",
    "icon": "music"
}
```

### Kobling til artikler

- Lenk fra `takt-og-rytme.json` som primær øvingslink
- Lenk fra `trommer-intro.json` (rytmisk grunnlag)

---

## 8. Klasseromsintegrasjon

**Lærermodus:**
- BPM-velger flyttes til toppen (stor og synlig for projektor)
- "Klasse-modus": Alle klikker via egne enheter, men ingen individuell score vises
- Metronom-visualisering skaleres til full skjerm (stor pulserende sirkel)

**Klasseromsscenario:**
1. Lærer viser rytmefrase på projektor
2. Klassen øver stille (tapper på pult) mens de ser visualiseringen
3. Lærer klikker "Se presisjon" - klassen se egne resultater
4. Diskusjon: Hvem var for tidlig? For sent? Hva er vanskelig?

---

## 9. Implementasjonsrekkefølge

1. Tone.Transport metronom med click-lyd og visuell puls
2. Keyboard/touch tap-handler med nøyaktig timing (performance.now)
3. Fjerdedels-mønster i 4/4 (nivå 2) som første test
4. Nøyaktighetsberegning + per-slag-visualisering
5. 8 pre-definerte mønstre (dekker nivå 1-5)
6. Grafisk notasjonsvisning (blokker)
7. BPM-kontroll + modus-faner
8. SVG-notasjonsmodus (siste)
