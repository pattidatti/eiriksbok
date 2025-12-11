# Utviklingsplan: Concept Snake

## Konsept
Et læringsspill basert på den klassiske "Snake"-mekanikken. Slangen representerer et spesifikt begrep (f.eks. "Metafor"). Målet er å styre slangen for å "spise" ord eller setninger som *er* eksempler på dette begrepet, samtidig som man unngår ord som er feil (f.eks. sammenligninger) eller andre hindringer.

## Spillmekanikk
- **Kjerne**: Spilleren styrer en slange på et rutenett (2D grid).
- **Mål**: Samle poeng ved å spise riktige "epler" (ord/setninger).
- **Feil**: 
  - Å spise feil ord (gir minuspoeng eller reduserer slangelengde/liv).
  - Å kræsje i vegger eller seg selv (Game Over).
- **Progresjon**: 
  - Slangen vokser når den spiser riktig.
  - Hastigheten øker gradvis.
  - Nivåer med forskjellige temaer (f.eks. Ordklasser, Retoriske virkemidler, Historiske hendelser).

## Teknisk Implementering
- **Rammeverk**: React + TypeScript.
- **Rendering**: HTML5 `<canvas>` for ytelse, eller CSS Grid/Flex for enkel styling av tekst-elementer i "eplene". Siden vi skal vise tekst, kan DOM-basert rendering (divs i et grid) være enklere å style responsivt med Tailwind.
- **State Management**:
  - `snake`: Array av koordinater `[{x, y}]`.
  - `direction`: Nåværende bevegelsesretning.
  - `foodItems`: Array av objekter `{x, y, text, type: 'correct' | 'wrong'}`.
  - `score`, `status` (playing, gameover, paused).
- **Loop**: `useInterval` eller `requestAnimationFrame` hook for spill-loopen.

## Datastruktur (Content)
Vi trenger en struktur for å definere "oppgaver" eller nivåer.

```typescript
type ConceptLevel = {
  id: string;
  topic: string; // F.eks. "Norsk - Retorikk"
  targetConcept: string; // "Metafor" (Dette er slangen)
  correctExamples: string[]; // ["Du er en stjerne", "Tiden flyr", "Et hav av muligheter"]
  wrongExamples: string[];   // ["Rask som en bil", "Du er som en sol", "Kald som is"]
};
```

## Visuelt & UX
- **Stil**: Minimalistisk, men "juicy". Mørk bakgrunn, neon-farger.
- **Layout**: Full widescreen (fullbredde) på nettsiden for å gi spilleren og slangen god plass.
- **Navigasjon**:
  - **Kategorivelger**: Startskjerm hvor spilleren velger tema (f.eks. "Retorikk", "Ordklasser", "Historie").
- **Feedback**:
  - **Spis Riktig**: Partikkel-effekt, "+100" flytende tekst, positiv lydeffekt.
  - **Spis Feil**: Skjermristing (screen shake), rødt blink, "FEIL!" tekst, negativ lydeffekt.
- **Pedagogisk**: Når spillet er over, vis en liste over hva spilleren gjorde feil og riktig, med forklaringer.

## Fremdriftsplan for Implementering

### Fase 1: Kjernemotor & Oppsett
1. [ ] **Grunnstruktur**: Opprette `src/games/concept-snake` og ruteoppsett i `App.tsx`/`routes.ts`.
2. [ ] **Spill-loop & Slange**: Implementere `useSnakeGame` hook (bevegelse, tick-rate, input-håndtering).
3. [ ] **Grid-rendering**: Lage `SnakeBoard` som viser slangen og grid dynamisk (tilpasset widescreen).

### Fase 2: Spillmekanikk
4. [ ] **Mat-system**: Logikk for å generere "ConceptFood" (både riktige og gale eksempler) på ledige plasser.
5. [ ] **Kollisjon & Regler**: 
    - Spis riktig = voks + poeng. 
    - Spis feil = miste liv/poeng.
    - Vegg/Selv = Game Over.

### Fase 3: Innhold & Menyer
6. [ ] **Datastruktur**: Definere `ConceptCategory` interface og opprette `conceptData.ts` med første kategori (f.eks. "Metaforer").
7. [ ] **Hovedmeny**: Implementere startskjerm med **Kategorivalg**.
8. [ ] **Game Over Skjerm**: Visning av score og mulighet for "Spill igjen" eller "Velg ny kategori".

### Fase 4: Polish & "Juice"
9. [ ] **Visuell Feedback**: Animasjoner ved spising (partikler), farge-koding av kategorier.
10. [ ] **Lyd**: Legge til `AudioManager` integrasjon for lydeffekter.

## Idéer til utvidelse (Post-MVP)
- **Power-ups**: "Slow down time" (fryser tiden så man rekker å lese), "Shield" (tåler en feil).
- **Progresjon**: Låse opp nye kategorier ved å klare "Boss-levels".
- **Highscore**: Lagre beste score per kategori lokalt.
