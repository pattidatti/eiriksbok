# Musikk-verktøy Blueprint: Notelese-trener
> **Status:** `Draft`
> **Type:** Interaktivt øvingsverktøy (standalone tool)

---

## 1. Metadata

- **Komponent-ID:** `NoteReader`
- **Rute:** `/musikk/oving/notelese`
- **Feature-mappe:** `src/features/music/components/NoteReader.tsx`
- **Målgruppe:** 8.-10. klasse (primær); tilgjengelig fra 6. klasse
- **Bruksmodi:** Individuell daglig drill og klasseromsdemonstrasjon
- **Avhengigheter:** Tone.js (valgfri avspilling), SVG (ingen ekstern lib)

---

## 2. Sjelen ("The Soul")

> *"Å lese noter er som å lese tekst - du husker ikke hvert bokstav, du gjenkjenner mønsteret. Det tar tid å bygge opp den musken."*

Notasjons-artikkelen gir teorien, men læring skjer gjennom repetisjon. Notelese-treneren er en daglig 2-minutters drill: en note vises på notesystemet, eleven svarer. Etter 50 rette svar på nivå 1 ser eleven nivå 2. Etter en uke kjenner eleven igjen alle notenavn i violinnøkkelen uten å tenke.

**Pedagogisk kjerne:** Mønstergjenkjenning gjennom spaced repetition. Fluency, ikke forståelse, er målet.

---

## 3. Modes og nivåer

### Modus A: Violinnøkkel (Treble Clef)

Fem linjer, mellomrom, og hjelpelinjer.

**Mnemonic-system (vist som hjelp):**
- Linjer (nedenfra): **E - G - B - D - F** → "En God Bjørn Driver Fisking"
- Mellomrom: **F - A - C - E** → "FACE" (engelsk huskeregel, lett å lære)

**Nivåer:**
| Nivå | Noter som testes | Beskrivelse |
|------|-----------------|-------------|
| 1 | E4, G4, B4, D5, F5 | Kun de 5 linjene |
| 2 | F4, A4, C5, E5 | Kun de 4 mellomrommene |
| 3 | E4 → F5 | Alle noter på systemet (ingen hjelpelinjer) |
| 4 | C4, D4 (under) + G5, A5 (over) | Hjelpelinjer nær systemet |
| 5 | C3 → C6 | Alle noter inkl. fjerne hjelpelinjer |

---

### Modus B: Bassnøkkel (Bass Clef)

**Mnemonic-system:**
- Linjer (nedenfra): **G - B - D - F - A** → "God Bibel Den Finnes Alltid"
- Mellomrom: **A - C - E - G** → "Alle Celler Er Gode"

**Nivåer:** Tilsvarende violinnøkkel, men for bassnøkkelens register (G2 → A4).

---

### Modus C: Blandet

Violinnøkkel og bassnøkkel veksles tilfeldig. Nøkkelen vises tydelig i venstre marg. Brukes for videregående elever.

---

## 4. UI-design og interaksjon

### Layout (Chromebook-baseline 1366x768)

```
┌─────────────────────────────────────────────────────┐
│  [Violinnøkkel]  [Bassnøkkel]  [Blandet]            │
│  Nivå 3: Alle noter                    Score: 12/15 │
├─────────────────────────────────────────────────────┤
│                                                     │
│                    ───────── ←  D5 (riktig svar)   │
│                ──────────────                       │
│          𝄞      ─────────────  ●  ← noten vises   │
│                ──────────────                       │
│                    ─────────                        │
│                                                     │
│        [ C ]  [ D ]  [ E ]  [ F ]  [ G ]           │
│        [ A ]  [ B ]                                 │
│                                                     │
│  Streak: 🔥 4    [Hint]    [Spill av]  (valgfri)   │
│                                                     │
│  ████████████████░░░░ Nivå 3: 14/20 fullfort        │
└─────────────────────────────────────────────────────┘
```

### Svar-mekanikk

**Alternativ 1 - Bokstav-knapper (standard):**
7 knapper: C, D, E, F, G, A, B.

**Alternativ 2 - Pianotangenter (avansert):**
En mini-oktav av VirtualPiano-komponenten. Eleven klikker riktig tangent (mer musikalsk, men krevende for nybegynnere).

Begge alternativene tilgjengelige via toggle. Standard er bokstav-knapper.

**Tilbakemelding:**
- Riktig: Noten lyser grønt, en liten "pling" via Tone.js, ny note inn etter 600ms
- Feil: Noten lyser rødt i 400ms, riktig svar markeres grønt. Eleven ser feilen, deretter ny note.

**Ingen "neste"-knapp** - flyten er automatisk for å holde tempo oppe i drillmodus.

---

## 5. SVG Notasjonssystem

All notasjonsvisualisering bygges som inline SVG - ingen ekstern notasjonsbibliotek.

### Notesystemets geometri

```typescript
const STAFF = {
    lines: 5,
    lineSpacing: 12,        // px mellom linjer
    lineThickness: 1.5,
    staffTop: 60,           // px fra toppen av SVG
    width: 300,
    noteXPosition: 150,     // Senter av SVG
    noteRadius: 9,
    ledgerLineWidth: 30,    // Bredde på hjelpelinje
};

// Regn ut Y-koordinat for en MIDI-note i en gitt nøkkel
function noteToY(midiNote: number, clef: 'treble' | 'bass'): number {
    // Referansepunkt: Violinnøkkel B4 = linje 3 (midterste)
    // Bassnøkkel D3 = linje 3
    const referenceNote = clef === 'treble' ? 71 : 50; // B4 / D3
    const referenceLine = 2; // 0-indeksert, linje 3 = index 2
    const semitoneOffset = midiNote - referenceNote;
    // Konverter halvtoner til skalatrinn (ikke alle halvtoner = ny linje)
    const lineOffset = midiToStaffStep(midiNote, clef) - midiToStaffStep(referenceNote, clef);
    return STAFF.staffTop + (referenceLine * STAFF.lineSpacing) - (lineOffset * STAFF.lineSpacing / 2);
}
```

### Hva som rendres

1. 5 horisontale linjer (alltid)
2. Nøkkelsymbol (𝄞 violinnøkkel, 𝄢 bassnøkkel) - Unicode-tegn i SVG `<text>`
3. Svart fylt sirkel (hele note-hode) på riktig Y-koordinat
4. Hjelpelinje(r) dersom noten er over/under systemet
5. Etter svar: grønn/rød farging av note + eventuelt korrekt markering

---

## 6. Spillogikk og progresjon

### Spørsmålsgenerator

```typescript
function generateQuestion(level: Level, clef: Clef): Question {
    const notePool = LEVEL_NOTE_POOLS[level][clef];
    
    // Vektlegg nylig feilede noter (enkel spaced repetition)
    const weightedNote = selectWeighted(notePool, recentErrors);
    
    return {
        midiNote: weightedNote,
        noteName: midiToNoteName(weightedNote),  // 'C', 'D', etc. (uten oktav)
        displayName: midiToFullName(weightedNote), // 'C5' (til intern bruk)
        clef,
        requiresLedgerLines: isOutsideStaff(weightedNote, clef),
    };
}
```

### Progresjonskrav

- **Nivå fullfort:** 20 konsekutive spørsmål med >= 80% riktige
- **Låse opp neste nivå:** Automatisk etter fullfort
- Ingen straff for å gå tilbake til lavere nivå

### Hint-system

Trykk "Hint"-knapp:
1. Første trykk: Linjene merkes med bokstav (E, G, B, D, F) i grått
2. Andre trykk: Noten blinker og riktig linje/mellomrom merkes
3. Hint-bruk teller ikke mot streak, men telles separat i statistikk

---

## 7. Lydintegrasjon (valgfri)

"Spill av"-knapp ved siden av notasjonen:
```typescript
function playNote(midiNote: number) {
    const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
    const synth = new Tone.Synth({ oscillator: { type: 'sine' } }).toDestination();
    synth.triggerAttackRelease(freq, '1n');
}
```

Hensikt: Kobler visuell notasjon til klingende lyd. Spesielt nyttig for Gehørtrening-synergien.

---

## 8. Integrasjon i appen

### Manifest-oppføring

```json
{
    "id": "notelese-tool",
    "title": "Notelese-trener",
    "description": "Lær å lese noter - daglig drill for violinnøkkel og bassnøkkel",
    "link": "/musikk/oving/notelese",
    "icon": "music-note"
}
```

### Kobling til artikler

- Lenk fra `notasjon.json` som primær øvingslink ("Øv på det du nettopp lærte")
- Lenk fra `piano-intro.json` (noter + piano = naturlig kobling)

---

## 9. Tekniske fallgruver

1. **SVG-koordinater:** Y-akse er invertert (0 øverst). Linjer beregnes nedenfra, men SVG tegner ovenfra. Konverter nøye.
2. **Nøkkelsymbol-tegn:** Violinnøkkel-tegn (𝄞 U+1D11E) er i Supplementary Multilingual Plane - test at font-støtte er OK. Fallback: SVG-path.
3. **Enharmonisk ekvivalens:** C# og Db er samme note. Treneren bruker kun stamtoner (C, D, E, F, G, A, B) - ingen kromatikk på nivå 1-4.
4. **Mobilbruk:** Touch-targets for bokstav-knapper må være minimum 44x44px. På liten skjerm kan 7 knapper bli trangt - vurder 2 rader a 4.

---

## 10. Implementasjonsrekkefølge

1. SVG-staff-renderer med korrekt Y-koordinat-kalkulator
2. Nøkkelsymbol + enkelt note-hode rendering
3. Hjelpelinje-logikk
4. Bokstav-knapper + riktig/feil-tilbakemelding
5. Spørsmålsgenerator (nivå 1-3, violinnøkkel)
6. Streak + nivåprogresjon
7. Hint-system
8. Bassnøkkel (nivå 4+)
9. Blandet modus
10. Tone.js lydavspilling
