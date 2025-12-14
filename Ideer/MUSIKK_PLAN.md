# Utviklingsplan: Musikkfaget

## Visjon
Musikkfaget i Eiriksbok skal være **interaktivt** og **visuelt**. I stedet for lange tekster om hvordan man tar et C-dur grep, skal elevene kunne se det, høre det, og manipulere det på en virtuell modell. Vi flytter fokuset fra "lese om musikk" til "utforske musikk".

---

## 1. Struktur (Faglig Inndeling)
Vi deler faget inn i fire naturlige hovedemner som bygger på hverandre.

### Emne 1: Det Grunnleggende (Musikkteori)
*Her lærer vi språket.*
*   **Takt og Rytme**: Hva er puls? Hva er en takt? Taktarter (4/4, 3/4, 6/8).
*   **Akkorder og Harmoni**: Hva er en akkord? Dur vs. Moll. Treklanger.
*   **Notasjon**: Hvordan lese "kartet" (tabulatur for gitar/bass, notesystem for piano/trommer).

### Emne 2: Instrumentene (Verktøykassen)
*Her lærer vi verktøyene.*
*   **Gitar**: Oppbygging, strenger, grep, strumming-mønstre.
*   **Piano**: Tangentene, akkorder vs. melodi, koordinasjon.
*   **Bass**: "Grunnmuren", samspill med trommer, grunntoner.
*   **Trommer**: Rytmeboks, koordinasjon, "backbeat".

### Emne 3: Komposisjon (Låtskriving)
*Her setter vi det sammen.*
*   **Låtens Anatomi**: Intro, Vers, Refreng, Bro, Outro.
*   **Dynamikk**: Oppbygging, klimaks, "break".
*   **Arrangement**: Hvilke instrumenter gjør hva når?

### Emne 4: Vurdering og Fremføring
*Hvordan blir jeg bedømt?*
*   **Vurderingskriterier**: Teknikk, samspill, kreativitet, formidling.
*   **Øvingstips**: Hvordan øve effektivt?

---

## 2. Interaktive Modeller (Applikasjoner)

For å støtte læringen foreslår vi å utvikle følgende "micro-tools":

### 🎸 "Fretboard Explorer" (Gitar & Bass)
*   **Funksjon**: Et interaktivt gripebrett.
*   **Features**:
    *   Velg en akkord (f.eks. C Major) -> Se hvor fingrene skal stå.
    *   "X-ray mode": Se hvilke toner som spilles i akkorden (C-E-G).
    *   Strumming-knapp: Hør hvordan det skal låte.

### 🎹 "Virtual Piano"
*   **Funksjon**: Et virtuelt keyboard.
*   **Features**:
    *   Viser akkorder fargelagt på tangentene.
    *   Skalamodus: Velg "C Major Scale" -> Se alle lovlige tangenter lyse opp.

### 🥁 "Beat Builder" (Trommer & Rytme)
*   **Funksjon**: En enkel step-sequencer (som en trommemaskin).
*   **Features**:
    *   Rutenett for 1 takt (16 ruter for 16-delsnoter).
    *   Legg inn stortromme, skarp og hi-hat.
    *   "Play"-knapp for å høre rytmen og se taktinndelingen visuelt.

### 🧩 "Song Structure Builder"
*   **Funksjon**: Dra-og-slipp blokker for å planlegge en låt.
*   **Features**:
    *   Palette med blokker: "Vers" (blå), "Refreng" (rød), "Bro" (gul).
    *   Sett lengde på blokker (f.eks. 8 takter).
    *   Viser total lengde og struktur visuelt.

### 🎧 "Songwriter Studio" (The "App")
*   **Funksjon**: Det samlende verktøyet hvor alt settes sammen.
*   **Se Roadmap**: [Songwriter Studio 2.0 Roadmap](./SONGWRITER_ROADMAP.md) for detaljert utviklingsløp.
*   Inkluderer:
    *   Tidslinje
    *   Kordebibliotek
    *   Orkester-visualisering

---

## 3. Ting du kanskje burde tenke på (Manglende brikker?)

Her er noen elementer som ofte glemmes, men som er viktige for en helhetlig forståelse:

1.  **Gehørtrening (Ear Training)**:
    *   *Hvorfor?* Musikere lytter mer enn de leser.
    *   *Forslag*: En enkel "Quiz" der du hører en lyd og skal gjette om det er Dur (glad) eller Moll (trist).

2.  **Lydlære (Teknologi)**:
    *   *Hvorfor?* Dagens musikk er digital.
    *   *Forslag*: En introduksjon til hva en DAW (Digital Audio Workstation) er. Hva er frekvenser?

3.  **Sjangerforståelse**:
    *   Hva skiller Rock fra Pop? Jazz fra Blues? (Kanskje som en tidslinje/Timeline-komponent som vi allerede har?)

---

## 4. Presentasjonsstrategi ("Best måte")

For å presentere dette best mulig, bør vi unngå "vegg-av-tekst".

**Forslag til Layout:**
*   **Topp**: En interaktiv modell (f.eks. Pianoet) alltid synlig eller lett tilgjengelig.
*   **Side**: En "Cheat Sheet" sidebar (som vi nettopp lagde i fase 3!) som viser nøkkelgrep eller begreper.
*   **Innhold**: Korte tekster som instruerer eleven til å *gjøre* noe i modellen. "Prøv å trykk på C, E og G samtidig. Hører du at det låter glad?"

**Neste steg:**
1.  Opprette `manifest`-strukturen for Musikk.
2.  Designe og kode grunnkomponentene (`Fretboard`, `Piano`, `BeatGrid`).
