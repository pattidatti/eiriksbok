---
description: Utfør en dyp teknisk og spilldesignmessig analyse av Simulation-spillet for å gi kontekst for videreutvikling.
---

Dette workflowet guider agenten gjennom en grundig arkitektonisk revisjon av `simulation`-modulen for å identifisere flaskehalser, logiske brister og designmessige inkonsistenser. Den skal også se på planlagt arbeid i `SIMULATION_TODO.md`.
1.  **Utforsk mappestrukturen & Planlegging**: 
    - List ut alle filer i `src/features/simulation` for å kartlegge moduler, hooks og logikk-sharding.
    - Les `Ideer/spill/SIMULATION_TODO.md` for å forstå nåværende veikart, prioriterte oppgaver og uløste problemer.
2.  **Analyser datamodellen & Skalerbarhet**: 
    - Les `simulationTypes.ts` og `constants.ts`. 
    - Evaluer om datastrukturen støtter horisontal skalering (f.eks. ved mange samtidige spillere).
3.  **Gjennomgå arkitektur & Sharding-effektivitet**:
    - Undersøk `SimulationContext.tsx`. Vurder om state-håndteringen er for sentralisert eller om den forårsaker unødvendige re-renders.
    - Analyser `simulationFirebase.ts` og `actions.ts`. Vurder effektiviteten av den shardede transaksjonsmodellen (`performSoloAction` vs. `performGlobalAction`). Identifiser potensielle race-conditions i globale handlinger.
4.  **Evaluer gameplay-mekanikker & Balanse-eksploits**:
    - Se på `performAction` i `actions.ts`. Let etter logiske brister i stamina/yield-forholdet som kan utnyttes av spillere.
    - Analyser produksjonskjeder i `constants.ts`. Er progresjonen lineær eller eksponentiell? Er det "dead-ends" i crafting-treet?
5.  **Kritisk UI/UX Revisjon (Intentional Minimalism)**:
    - Se på `SimulationViewport.tsx` og `ui/`-mappen. 
    - Vurder om det visuelle hierarkiet overlever informasjonsmengden. Er glassmorphism-effektene funksjonelle (lesbarhet) eller bare estetiske?
    - Sjekk kognitiv belastning i produksjons-UI.
6.  **Rapportering (Architectural Audit)**: Opprett en omfattende rapport (som et artifact) som dekker:
    - **Arkitektonisk Integritet**: Styrker og svakheter i transaksjonsmodellen.
    - **Spillbalanse-revisjon**: Spesifikke tall eller formler som bør justeres.
    - **Bespoke UI Critique**: Forslag til forenkling uten å miste "premium"-følelsen.
    - **Teknisk Gjeld**: Filer som bør refaktores (f.eks. splitting av `constants.ts`).
    - **Strategiske Anbefalinger**: Veien videre for å gjøre spillet mer robust og engasjerende.