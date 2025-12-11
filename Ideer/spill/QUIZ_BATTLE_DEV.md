# Quiz Battle - Development & Expansion Plan 🚀 (Revidert)

Dette dokumentet beskriver den oppdaterte visjonen for videreutvikling av **Quiz Battle**, basert på feedback. Fokus er på "Visual Juice", stabilitet, og positive belønningssystemer (Streaks) fremfor straffende mekanikker.

## 1. Kjernekonsept: "Battle" via Streaks 
Vi skaper konkurranseinstinkt gjennom belønning av flyt og mestring.

*   **Streaks (Combo):** Visuelle flammer (🔥) rundt navnet til spillere som svarer riktig flere ganger på rad.
    *   *3 på rad:* Liten flamme.
    *   *5 på rad:* Stor flamme + fargeendring på "kortet" på storskjerm.
    *   *10 på rad:* "ON FIRE!" visuell effekt som alle ser.
    *   *Effekt:* Gir en poeng-multiplier (f.eks. 1.2x, 1.5x) for å belønne konsistens.

## 2. Visuell "Juice" & System Feedback (The Wow Factor)
Spillet må føles levende, men bevare spenningen.

*   **Suspense før Svar:**
    *   Når eleven svarer på sin skjerm, får de *ikke* vite umiddelbart om det var rett eller galt.
    *   Skjermen viser kun: "Svar sendt! Vent på resultatet...".
    *   Først når læreren trykker "Vis svar" (eller tiden er ute), avsløres resultatet på *både* storskjerm og elevskjerm samtidig.
*   **Resultat-eksplosjon:**
    *   Når svaret avsløres:
        *   **Riktig:** Skjermen lyser grønt, konfetti-effekt, positiv lyd.
        *   **Feil:** Skjermen rister litt (shake), rød tone, oppmuntrende tekst ("Neste tar du!").
*   **Dynamisk Bakgrunn:** Bakgrunnen endrer seg subtly gjennom spillet for å bygge intensitet mot slutten.
*   **Lydbilde (Audio):**
    *   Bakgrunnsmusikk (loop) som øker litt i tempo mot slutten av spillet.
    *   Tydelige SFX for: Svar avgitt (klikk), Resultat avslørt (trommevirvel -> cymbal).

## 3. Lobby & Sosiale Elementer
*   **Positiv Lobby-interaksjon (Minigame):**
    *   Mens elevene venter på at spillet starter, kan de bidra til en felles "Ballong" på storskjermen.
    *   Ved å trykke på en knapp ("Pump!"), blåses en stor ballong opp på lærrens skjerm.
    *   Mål: Få ballongen til å fly (eller sprekke til konfetti) før spillet starter.
    *   **Emojies:** Elevene kan sende *kun positive* reaksjoner (tommel opp, hjerte, klem, rakett) som svever oppover storskjermen. Ingen negative fjes.

## 4. Nye Spørsmålstyper
Vi implementerer teknisk støtte for flere typer spørsmål for å variere undervisningen.

*   **Nye Typer:**
    *   *True/False:* Enklere UI med to store knapper (Sant/Usant).
    *   *Rekkefølge (Sorting):* Dra og slipp hendelser i riktig "tidslinje".
    *   *Kategorisering:* Sorter ord i grupper (f.eks. "Adjektiv" vs "Verb").
*   *Merk:* Innholdet må lages, men systemet skal støtte det. Vi lager en plan for generering av innhold senere.

## 5. Teknisk Arkitektur & Robusthet
Sikre at spillet flyter bra og er rettferdig.

*   **Refactoring:**
    *   Skille ut spill-logikk i en `QuizGameEngine` (custom hook) for ryddigere kode.
    *   Bedre feilhåndtering ved nettverksbrudd.
*   **Sikkerhet (Anti-Cheat):**
    *   Viktig: **Ikke send fasit til klienten før resultatet vises.**
    *   I "Svar"-fasen mottar klienten kun svaralternativene.
    *   I "Resultat"-fasen mottar klienten beskjed om hva som var rett.
    *   Dette hindrer tekniske elever i å finne svaret i kildekoden/nettverksloggen.

## Konkret Implementeringsplan

### Fase 1: Refactoring & Suspense (Fundamentet)
1.  **Sikkerhet:** Endre datastrukturen slik at `correctAnswer` ikke sendes til spilleren før `showResult` er true.
2.  **Suspense:** Endre `QuizPlayer` til å ikke vise Riktig/Feil umiddelbart, men vente på server-status.
3.  **Refactoring:** Rydde opp i `QuizHost` og `QuizPlayer` for å bruke en felles logikk-kjerne der det gir mening.

### Fase 2: Visual Juice & Audio
1.  Implementere `framer-motion` animasjoner for overganger.
2.  Legge til lydeffekter (SFX) og bakgrunnsmusikk.
3.  Implementere "Svar sendt" skjerm med ventemusikk/puls.

### Fase 3: Streaks & Lobby Minigame
1.  Implementere Streak-teller i `QuizHost` state.
2.  Visuell representasjon av Streaks (Flammer).
3.  Lage "Ballong-spillet" elller Emoji-flyt i Lobbyen.

### Fase 4: Avanserte Spørsmålstyper
1.  Utvide datamodellen til å støtte `type: 'boolean' | 'sorting' | 'category'`.
2.  Lage nye komponenter i `QuizPlayer` for disse typene (Drag & Drop støtte).

---
> "Quiz Battle Version 2.0: Mer show, mer spenning, mindre stress."
