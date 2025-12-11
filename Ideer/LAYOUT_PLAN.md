# Eiriksbok Layout & Sidebar System Plan

**Status**: Draft
**Date**: 2025-12-11

## 1. Problemstilling
Dagens system for layouts og sidebars er fragmentert. Vi har minst tre ulike måter å vise innhold på:
1.  **Standard Layout** (`LessonPage.tsx` fallback): Bruker `LessonSidebar.tsx`.
2.  **Rich Layout** (`InteractiveArticle.tsx`): Har sin egen interne sidebar-implementasjon med tidslinjer og kart.
3.  **Subject Layouts** (f.eks. `NorskArticleLayout.tsx`): Egne hardkodede sidebars tilpasset faget.

Dette gjør det vanskelig å:
-   Legge til nye funksjoner globalt (f.eks. "Relaterte artikler" på tvers av alle fag).
-   Vedlikeholde designkonsistens.
-   Skalere til nye fag uten å kopiere kode.

## 2. Visjon: "Eiriksbok Design System"
Vi trenger et fleksibelt system hvor innholdet styrer layouten, men rammeverket er felles.

### Layout Typer
Vi definerer følgende standard layouts i `manifest.json`:

| Layout Type | Beskrivelse | Bruksområde |
| :--- | :--- | :--- |
| `standard` | Fokus på tekst og lesbarhet. Sidebar til høyre. | Fagartikler, Norsk grammatikk. |
| `rich` | Immersive. Fullskjerm hero-bilde, integrert multimedia. | Historie, Religion, "Deep dives". |
| `tool` | Full bredde, minimal meny. Fokus på applikasjonen. | Spill, Simulatorer, Kartverktøy. |

### Sidebar Moduler
I stedet for å hardkode innholdet i sidebaren, lager vi gjenbrukbare **Widget-komponenter**:

1.  **Navigasjon**: "I denne leksjonen" (Table of Contents).
2.  **Kontekst**: Tidslinje (Historie), Kart (Geografi/Historie).
3.  **Fordypning**: "Les mer i samme emne" (Auto-generert fra manifest).
4.  **Pedagogikk**: Begrepsliste, "Test deg selv" (Mini-quiz).
5.  **Verktøy**: Hurtiglenker til relevante verktøy (f.eks. "Ordsorterer" for Norsk).

## 3. Implementasjonsplan

### Fase 1: Standardisering av "Relaterte Artikler" (Prio 1)
Brukeren ønsker "Relaterte artikler i sidebar fra samme emne".
*   **Løsning**: Lag en felles hook `useRelatedContent(subjectId, topicId)` som henter relevante leksjoner fra `manifest.json` automatisk.
*   **Implementasjon**: Legg denne inn i både `LessonSidebar` (Standard) og `InteractiveArticle` (Rich).

### Fase 2: Sidebar Config
Vi oppretter en `SidebarConfig` type som kan sendes til layout-komponentene.

```typescript
type SidebarModules = {
  timeline?: boolean; // Henter data fra article.year automagisk
  related?: boolean; // Slår på 'Les mer' visning
  concepts?: boolean; // Viser begreper definert i JSON
  tools?: string[]; // Ider til verktøy som skal vises
}
```

### Fase 3: Refaktorering
1.  Oppdater `LessonPage.tsx` til å velge layout basert på `manifest`-konfigurasjon, ikke hardkodede `if (subject === 'norsk')` sjekker.
2.  Trekk ut sidebar-logikken fra `InteractiveArticle` til en delbar komponent `RichSidebar` som deler DNA med `LessonSidebar`.

## 4. Fag-spesifikke Behov

### Historie / Religion
*   **Primær Layout**: `rich`
*   **Viktige Sidebar-elementer**: Tidslinje, Kart, Begreper.

### Norsk
*   **Primær Layout**: `standard`
*   **Viktige Sidebar-elementer**: Sjanger-trekk, Grammatikk-regler, Relaterte tekster.
*   **Merk**: `NorskArticleLayout` bør fases ut til fordel for `StandardLayout` med riktig konfigurasjon hvis mulig, eller beholdes som en presisjons-variant.

### Samfunnsfag
*   **Primær Layout**: `standard` / `tool`
*   **Viktige Sidebar-elementer**: Diskusjonsspørsmål, Begreper, Simulatorer (Government Explorer).

## 5. Neste Steg (Forslag til TODO)
1.  [ ] Implementer `useRelatedContent` hook.
2.  [ ] Legg til "Relaterte artikler" seksjon i `LessonSidebar`.
3.  [ ] Legg til "Relaterte artikler" seksjon i `InteractiveArticle` (allerede påbegynt, men må generaliseres).
