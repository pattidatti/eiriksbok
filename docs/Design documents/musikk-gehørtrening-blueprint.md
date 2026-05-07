# Musikk-verktøy Blueprint: Gehørtrening
> **Status:** `Draft`
> **Type:** Interaktivt øvingsverktøy (standalone tool)

---

## 1. Metadata

- **Komponent-ID:** `EarTrainer`
- **Rute:** `/musikk/oving/gehørtrening`
- **Feature-mappe:** `src/features/music/components/EarTrainer.tsx`
- **Målgruppe:** 8.-10. klasse + VGS
- **Bruksmodi:** Individuell øving og klasseromsdemonstrasjon (projektor)
- **Avhengigheter:** Tone.js, musicTheory.ts

---

## 2. Sjelen ("The Soul")

> *"Gehøret er musikkens morsmål. Teori er grammatikken — men uten å høre er grammatikken tom."*

Gehørtrening er det største hullet i norsk musikk-undervisning. Elevene lærer notasjon og akkordnavn, men trener aldri øret isolert. Dette verktøyet gjør gehørtrening til et konkret, målbart og morsomt daglig ritual - 2-3 minutter per dag, som en språk-app.

**Pedagogisk kjerne:** Eleven hører - eleven gjetter - eleven hører igjen. Repetisjon med umiddelbar tilbakemelding.

---

## 3. Modes (Treningsnivåer)

Verktøyet har tre uavhengige treningsmoduler, tilgjengelige via faner øverst.

### Modus A: Intervall-gjenkjenning

Spiller to noter etter hverandre (melodisk intervall) eller samtidig (harmonisk). Eleven velger riktig intervallnavn.

**Nivåer:**
| Nivå | Intervaller som testes |
|------|----------------------|
| 1 - Ankre | Prima (C-C), Kvint (C-G), Oktav (C-C8) |
| 2 - Store | Store sekunder, store terser, ren kvart |
| 3 - Alle rene | Alle 8 rene intervaller |
| 4 - Halvtoner | Lille sekund, store septim, tritonus |
| 5 - Alle | Alle 13 intervaller, tilfeldig rekkefølge |

**UI-svar-knapper:** 7-13 knapper med norske intervallnavn. Ved valg: grønn puls (riktig) eller rød risting + riktig svar vises (feil).

**Mnemonic-hjelper (skjult/synlig):** "Intervall-huskeliste" med kjente melodier:
- Prima: "Happy Birthday" (første to like toner)
- Liten ters: "Smoke on the Water" (riff)
- Stor ters: "When the Saints Go Marching In"
- Kvart: "Here Comes the Bride"
- Kvint: "Twinkle Twinkle Little Star"
- Oktav: "Somewhere over the Rainbow"

---

### Modus B: Akkord-gjenkjenning

Spiller en akkord. Eleven velger om det er dur, moll, dominant 7, eller moll 7.

**Nivåer:**
| Nivå | Akkordtyper |
|------|-------------|
| 1 | Dur vs. Moll |
| 2 | Dur / Moll / Dominantseptim |
| 3 | Dur / Moll / Dom7 / Moll7 |
| 4 | Alle + Sus4 + Dim |

**Voicing-variasjon:** Akkordene spilles i ulike omvendinger og registre per runde, slik at eleven hører akkordkvaliteten og ikke posisjonen.

---

### Modus C: Rytmisk gehør

Spiller en kort rytmefrase (2-4 takter). Eleven velger riktig taktart: 2/4, 3/4, eller 4/4.

**Nivåer:**
| Nivå | Vanskelighetsgrad |
|------|-------------------|
| 1 | Tydelig 3/4 vs. 4/4 (vals-rytme) |
| 2 | 2/4 inkludert (marsjrytme) |
| 3 | Synkoperte mønstre, komplikerte rytmer |

---

## 4. UI-design og interaksjon

### Layout (Chromebook-baseline 1366x768)

```
┌─────────────────────────────────────────────────────┐
│  [Intervall]  [Akkord]  [Rytme]        Score: 7/10  │
├─────────────────────────────────────────────────────┤
│                                                     │
│         Niveau 2: Store intervaller                 │
│                                                     │
│              ┌───────────────┐                      │
│              │  ▶ Spill av   │  ← Stor, klar knapp │
│              └───────────────┘                      │
│                                                     │
│   [Liten ters]  [Stor ters]  [Ren kvart]           │
│   [Ren kvint]   [Liten sekst] [Stor sekst]         │
│                                                     │
│         Streak: 🔥 5           [Neste nivå →]       │
└─────────────────────────────────────────────────────┘
```

### Tilstandsmaskin (State Machine)

```
IDLE → PLAYING → AWAITING_ANSWER → FEEDBACK (riktig|feil) → IDLE (neste)
```

- **IDLE:** "Spill av"-knapp pulserer subtilt
- **PLAYING:** Knapp deaktivert, lydbølge-animasjon vises
- **AWAITING_ANSWER:** Svar-knappene aktiveres
- **FEEDBACK:** 800ms feedback-animasjon, deretter auto-neste

### Klasseromsintegrasjon

"Lærermodus"-toggle øverst til høyre:
- Skjuler streak/score (fjerner konkurranse-fokus)
- Viser svaret umiddelbart etter avspilling
- Legger til "Vis fasit"-knapp som læreren kan trykke når klassen er klar

---

## 5. Teknisk arkitektur

### Lydgenerering (Tone.js)

```typescript
// Intervall-avspilling
async function playInterval(rootMidi: number, semitones: number, mode: 'melodic' | 'harmonic') {
    const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.3, sustain: 0.4, release: 1.2 },
    }).toDestination();

    if (mode === 'melodic') {
        synth.triggerAttackRelease(midiToFreq(rootMidi), '2n', Tone.now());
        synth.triggerAttackRelease(midiToFreq(rootMidi + semitones), '2n', Tone.now() + 0.7);
    } else {
        synth.triggerAttackRelease([midiToFreq(rootMidi), midiToFreq(rootMidi + semitones)], '2n');
    }
}
```

### State (Zustand eller lokal useState)

```typescript
interface EarTrainerState {
    mode: 'interval' | 'chord' | 'rhythm';
    level: number;
    currentQuestion: Question;
    score: { correct: number; total: number };
    streak: number;
    phase: 'idle' | 'playing' | 'awaiting' | 'feedback';
    lastResult: 'correct' | 'incorrect' | null;
}
```

### Spørsmålsgenerering

```typescript
function generateQuestion(mode, level): Question {
    // Velg tilfeldig rotnode (C4-G4 register for godt lydområde)
    // Velg tilfeldig intervall/akkord fra nivå-definisjonen
    // Returner: { audioParams, correctAnswer, options (shuffled) }
}
```

---

## 6. Integrasjon i appen

### Manifest-oppføring (under musikk/oppslag tools)

```json
{
    "id": "gehørtrening-tool",
    "title": "Gehørtrening",
    "description": "Tren øret til å gjenkjenne intervaller og akkorder",
    "link": "/musikk/oving/gehørtrening",
    "icon": "ear"
}
```

### Rute (src/routes.ts)

```typescript
{ path: 'musikk/oving/gehørtrening', lazy: () => import('./pages/EarTrainerPage') }
```

### Kobling til artikler

- Lenk fra `akkorder-og-harmoni.json` til gehørtrening i slutt-seksjonen
- Lenk fra `takt-og-rytme.json` til rytmisk modus

---

## 7. Fremtidige utvidelser (utenfor scope nå)

- Melodi-diktasjon: Hør en melodi, skriv inn notene
- Relativ pitch-trening: Identifiser skalatrinnet av en enkelt tone
- Statistikk-side: Hvilke intervaller er vanskeligst for deg?

---

## 8. Implementasjonsrekkefølge

1. Tone.js lydgenerering + intervall-avspilling (kjerne)
2. Spørsmålsgenerator for Modus A (intervaller, nivå 1-3)
3. UI: Spill av-knapp + svar-knapper + feedback
4. Score + streak
5. Modus B: Akkorder
6. Modus C: Rytme
7. Lærermodus-toggle
8. Manifest + rute-registrering
