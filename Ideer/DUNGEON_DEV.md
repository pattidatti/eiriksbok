# Utviklingsplan: Fangehull-spillet (Dungeon Game)

## 1. Målsetning
Spillets kjerneidé er **"Kunnskap er Makt"**. Spilleren utforsker et fangehull (dungeon crawler/platformer) og må bekjempe monstre. Vrien er at man ikke bare trykker på en knapp for å slå, men må besvare faglige spørsmål for å utføre angrep eller forsvare seg.

*   **Sjanger**: Educational 2D Side-scrolling Platformer / RPG.
*   **Læringsmål**: Mengdetrening på fagbegreper og fakta under tidspress (gamification).
*   **Målgruppe**: Elever som trenger variajson fra vanlig lesing/quiz.

## 2. Hvordan bør dette kodes? (Teknisk Arkitektur)

Spillet bør deles i to distinkte lag som snakker sammen:

### A. Spillmotoren (Game Loop)
Dette laget håndterer sanntidsgrafikk, fysikk og bevegelse.
*   **Teknologi**: HTML5 Canvas styrt av React (`useRef` + `requestAnimationFrame`).
*   **Ansvar**:
    *   Tegne bakgrunn, helt, fiender og effekter (partikler, skadetall).
    *   Håndtere kollisjoner (helt vs. plattform, helt vs. fiende).
    *   Animasjoner (sprite sheets).
*   **Status**: *Delvis implementert* (har bevegelse og enkel rendering).

### B. Spilllogikken (State Management & Quiz)
Dette laget pauser action-delen og styrer progresjon og læring.
*   **Teknologi**: React State / Context.
*   **Ansvar**:
    *   Holde styr på HP, Mana, XP og Level.
    *   **Combat System**: Når spilleren møter et monster, går spillet over i "Combat Mode".
    *   **Quiz Engine**: Henter spørsmål fra CMS (samme kilde som vanlige quizer).
    *   **Feedback Loop**: Riktig svar -> Helt angriper (Animasjon i motor). Feil svar -> Helt tar skade.

### C. Dataflyt
1.  **Init**: Spillet laster inn spørsmål basert på valgt emne (f.eks. "Norsk: Retorikk").
2.  **Explore**: Spiller løper bortover (Canvas).
3.  **Encounter**: Et monster dukker opp. Input låses. Quiz-overlay vises.
4.  **Action**:
    *   Spiller svarer RIKTIG: UI sender signal til Canvas -> `hero.attack()`. Monster mister HP.
    *   Spiller svarer FEIL: UI sender signal til Canvas -> `monster.attack()`. Helt mister HP.
5.  **Result**: Monster dør -> Loot (XP/Gold) -> Fortsett å løpe.

## 3. Detaljert Roadmap

### Fase 1: Kjernemekanikk (Interaksjon) - *Neste steg*
Det som mangler mest nå er koblingen mellom "løping" og "læring".
1.  **Monster Spawning**: Generer monstre på faste intervaller eller tilfeldig.
2.  **Combat State**: Implementer en tilstandsendring når man treffer et monster.
3.  **Quiz Integration**: Gjenbruk eksisterende quiz-logikk/komponenter til å vise et spørsmål i en "modal" over spillet.

### Fase 2: Progresjon & Motivasjon
1.  **XP & Leveling**: Visuell feedback når man "levelup-er" etter nok riktige svar.
2.  **Power-ups**: "Potions" som flyr i luften (fyller HP/Mana) som belønning for raske svar.
3.  **Boss Battles**: Større monstre ved slutten av en "run" som krever 3-5 riktige svar på rad.

### Fase 3: Polish & Content
1.  **Visuelt**: Bedre sprites, bakgrunnsmusikk, lydeffekter.
2.  **Save System**: Lagre "High Score" og total XP i LocalStorage eller Firebase (hvis tilgjengelig).

## 4. Annet relevant
*   **Responsivitet**: Spillet må fungere på Chromebook/iPad (touch-kontroller er delvis inne, men må testes).
*   **Lærervennlighet**: Vurdere en "Invincible Mode" eller innstillinger for hvor vanskelig spørsmålene skal være vs. hvor vanskelig plattformingen er.
*   **Gjenbruk**: Sørg for at `QuizEngine` er løsrevet fra grafikken, slik at "Dungeon" bare er et "skin" på den samme læringen som skjer i "Chrono Glider" eller standard Quiz.
