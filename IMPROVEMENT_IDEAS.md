# 20 Forslag til Forbedringer for Eiriksbok

Her er 20 konkrete forslag til forbedringer basert på en gjennomgang av koden, strukturert etter kategori.

## Kodekvalitet og Type-sikkerhet

1.  **Strengere Typer i `types.ts`**:
    *   Erstatt `any` i `mapData?: any` og `props?: Record<string, any>` med spesifikke interfaces eller `unknown` med type guards. Dette forhindrer runtime-feil.
2.  **Sentrert Ruting-konfigurasjon**:
    *   Opprett en `routes.ts` eller `paths.ts` helper-fil. I dag genereres stier manuelt (f.eks. i `LandingPage.tsx`: `` `/${lesson.subjectId}/${lesson.topicId}...` ``). Dette gjør det lett å gjøre feil hvis URL-strukturen endres.
3.  **Custom Hooks for Data**:
    *   Flytt logikken for å hente og flat-mappe `manifest.json` fra `LandingPage.tsx` til en egen hook, f.eks. `useManifestData()`. Dette gjør komponenten renere og logikken gjenbrukbar.
4.  **Prettier og Linting**:
    *   Legg til en `.prettierrc` fil og kjør `prettier` på hele prosjektet for å sikre konsistent formatering (f.eks. single vs double quotes, trailing commas).

## Ytelse og Optimalisering

5.  **Bildeoptimalisering**:
    *   Implementer en `<Image />` komponent som bruker `loading="lazy"` og håndterer "blur-up" placeholders. Mange bilder lastes fra Unsplash; disse kan optimaliseres med URL-parametere for størrelse.
6.  **React Query / SWR**:
    *   Bruk et bibliotek som TanStack Query for datahenting (`fetchManifest`). Dette gir caching, auto-refetching, og bedre håndtering av loading/error states ut av boksen.
7.  **Code Splitting**:
    *   Bruk `React.lazy` og `Suspense` for å laste tunge sider (som `TopicPage` eller `LessonPage`) kun når brukeren navigerer til dem. Dette reduserer initiell lastetid.
8.  **Virtualisering av lister**:
    *   Hvis lister med leksjoner eller bibliotektekster blir lange, vurder `react-window` for å kun rendre elementene som er synlige i skjermbildet.

## Brukeropplevelse (UX) og Design

9.  **Avansert Søk**:
    *   Oppgrader `SearchOverlay` med fuzzy search (f.eks. `fuse.js`) for å håndtere skrivefeil. Legg til filtrering på fag og type (artikkel, video, oppgave).
10. **Dark Mode**:
    *   Utvid Tailwind-konfigurasjonen til å støtte `dark:` klasser fullt ut, og legg til en toggle i `Layout` for å la brukeren velge tema.
11. **Brødsmulesti (Breadcrumbs)**:
    *   Sørg for at `Breadcrumbs`-komponenten håndterer alle nivåer korrekt, inkludert dype nøstinger i `subTopics`, for enklere navigering tilbake.
12. **Bedre Loading Skeletons**:
    *   I stedet for "Laster fag...", lag en "Skeleton"-komponent som viser grå bokser der innholdet vil komme. Dette oppleves raskere for brukeren.
13. **404 Side**:
    *   Lag en dedikert "Fant ikke siden"-komponent med en hyggelig melding og lenke tilbake til forsiden, i stedet for standard ruting-feil.

## Funksjonalitet

14. **Bokmerker / Favoritter**:
    *   Utvid `useUserHistory` til å også støtte "Favoritter". La brukere stjernemarkere artikler de vil finne tilbake til.
15. **Progress Tracking**:
    *   Vis en visuell indikator (f.eks. en grønn hake eller progress bar) på `LessonCard` for artikler brukeren har lest ferdig.
16. **PWA (Progressive Web App)**:
    *   Legg til `vite-plugin-pwa` for å gjøre nettsiden installerbar som en app og støtte offline-lesing. Perfekt for skolebruk.

## DevOps og Testing

17. **Testing med Vitest**:
    *   Sett opp `vitest` og `react-testing-library`. Skriv enkle tester for kritiske komponenter som `LessonCard` og `manifest` parsing-logikken.
18. **CI/CD Pipeline**:
    *   Lag en GitHub Action workflow som kjører `npm run lint` og `npm run build` ved hver push for å fange opp feil tidlig.
19. **Automatisert Link-sjekk**:
    *   Lag et script som går gjennom `manifest.json` og sjekker at alle interne lenker peker til eksisterende ID-er, og at eksterne bilder laster.

## Innhold

20. **Deling av Manifestet**:
    *   `manifest.json` er over 400 linjer. Vurder å splitte den opp i flere filer (f.eks. `norsk.json`, `historie.json`) og merge dem ved build-time eller runtime for bedre oversikt.
