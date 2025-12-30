---
description: Analyser Simulation-spillets gameplay, UI og immersion basert på profesjonell spilldesign-teori (MDA, Core Loops, Juice).
---

Dette workflowet fokuserer på de "myke" sidene av spillet: hvordan det føles å spille, psykologien i progresjonen, og styrken i immersjonen.

1.  **MDA-Analyse (Mechanics, Dynamics, Aesthetics)**:
    - **Mechanics**: Analyser de grunnleggende reglene i `constants.ts` og `actions.ts`. Er reglene klare?
    - **Dynamics**: Hvordan oppstår systemiske hendelser når spillere interagerer? (F.eks. inflasjon i markedet, lojalitetstap ved skatt).
    - **Aesthetics**: Hvilke emosjoner vekker spillet? Føles det som et middelaldersk rike? Vurder atmosfæren i `SimulationViewport.tsx`.

2.  **Core Loop Revisjon**:
    - **Micro-loop (5s)**: Evaluer minispillene i `minigames/`. Er de tilfredsstillende ("crunchy")?
    - **Macro-loop (5m)**: Evaluer produksjon og høsting. Er ventetiden (ActiveProcess) balansert mot belønningen?
    - **Meta-loop (Timer/Dager)**: Evaluer rang-oppgradering og bygging av monumenter. Gir det en følelse av varig progresjon?

3.  **"Juice" & Feedback Audit**:
    - Undersøk `ActionResultOverlay.tsx` og animasjonslogikk. 
    - Er det nok visuell feedback på suksess/feil? (Flying items, screenshake, particle effects).
    - Vurder lydbildet i `SimulationAudioContext.tsx` og effekten av "Dempet Musikk" for immersjon.

4.  **UI/UX & Kognitiv Belastning**:
    - Analyser `SimulationContext.tsx` og tab-systemet. Er navigasjonen sømløs eller frustrerende?
    - Vurder det planlagte **Notificationsenteret** fra `SIMULATION_TODO.md`. Hvordan kan dette redusere kognitiv belastning uten å bryte immersjonen?

5.  **Sosial Dynamikk & Feudal-psykologi**:
    - Analyser maktbalansen mellom Konge, Baron og Bonde. Er det nok insentiv for samarbeid? Er det for lett å være tyrann?
    - Vurder "Tinget" og diplomati-meldinger.

6.  **Rapportering (Game Design Critique)**:
    - **The Fun Factor**: Hva er det kjedeligste med spillet akkurat nå?
    - **Friction Points**: Hvor stopper flyten (flow state) opp?
    - **Juice Checklist**: Spesifikke forslag til visuelle/auditive "polske" detaljer.
    - **Feature Prioritering**: Hvilke ideer fra `SIMULATION_TODO.md` vil gi størst økning i "spillerlykke"?
