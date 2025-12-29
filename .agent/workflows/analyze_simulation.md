---
description: Utfør en dyp teknisk og spilldesignmessig analyse av Simulation-spillet for å gi kontekst for videreutvikling.
---

Dette workflowet guider agenten gjennom en grundig analyse av `simulation`-modulen.

1. **Utforsk mappestrukturen**: List ut alle filer i `src/features/simulation` og undermapper for å få oversikt over komponenter, hooks, og logikk.
2. **Analyser datamodellen**: Les `simulationTypes.ts` og `constants.ts` for å forstå ressurser, roller, bygninger og spillbalanse.
3. **Gjennomgå arkitekturen**:
    - Undersøk `SimulationContext.tsx` for å se hvordan UI-state håndteres.
    - Undersøk `simulationFirebase.ts` og `actions.ts` for å forstå hvordan real-time staten synkroniseres og hvordan handlinger (actions) prosesseres atomært.
4. **Evaluer gameplay-mekanikker**:
    - Se på `performAction` i `actions.ts` for å forstå loopen mellom minispill, utbytte (yield), og progresjon (XP/nivå).
    - Analyser produksjonskjeder i `constants.ts` (`REFINERY_RECIPES`, `CRAFTING_RECIPES`).
5. **Vurder UI/UX**:
    - Se på `SimulationViewport.tsx` og `ui/`-mappen for å vurdere det visuelle språket, glassmorphism-implementasjon og brukervennlighet.
6. **Rapportering**: Opprett en omfattende rapport (som et artifact) som dekker:
    - **Arkitektur**: Hvordan systemet henger sammen.
    - **Gameplay**: Hvordan spillet føles og fungerer for brukeren.
    - **Kode**: Styrker og svakheter i implementasjonen.
    - **Anbefalinger**: Spesifikke forslag til videreutvikling basert på analysen.
