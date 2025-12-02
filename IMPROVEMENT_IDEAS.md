# 20 Forslag til Forbedringer for Eiriksbok

Her er 20 konkrete forslag til forbedringer basert på en gjennomgang av koden, strukturert etter kategori.

## Kodekvalitet og Type-sikkerhet

1.  **Strengere Typer i `types.ts`** (Implementert):
    *   Erstattet `any` med spesifikke interfaces i `types.ts`. Dette forhindrer runtime-feil.
2.  **Sentrert Ruting-konfigurasjon** (Implementert):
    *   Opprettet `src/utils/routes.ts` helper-fil. Alle URL-er genereres nå sentralt, noe som gjør det tryggere å endre URL-struktur.
3.  **Custom Hooks for Data** (Implementert):
    *   Flyttet logikk til `useManifestData()`. `LandingPage.tsx` er nå mye renere og logikken er gjenbrukbar.
4.  **Prettier og Linting** (Implementert):
    *   La til `.prettierrc` fil for å sikre konsistent formatering.

## Ytelse og Optimalisering

5.  **Bildeoptimalisering** (Implementert):
    *   Implementert en `<Image />` komponent som bruker `loading="lazy"` og håndterer "blur-up" placeholders.
6.  **React Query / SWR** (Verifisert Implementert):
    *   Prosjektet bruker allerede TanStack Query via `useManifest` hooken. Dette sikrer god caching og datahenting.
7.  **Code Splitting** (Implementert):
    *   Bruk `React.lazy` og `Suspense` for å laste tunge sider (som `TopicPage` eller `LessonPage`) kun når brukeren navigerer til dem. Dette reduserer initiell lastetid.
8.  **Virtualisering av lister**:
    *   Hvis lister med leksjoner eller bibliotektekster blir lange, vurder `react-window` for å kun rendre elementene som er synlige i skjermbildet.
9.  **Prefetching av ruter** (Implementert):
    *   Implementert `PrefetchLink` som laster koden for neste side i bakgrunnen når brukeren holder musen over lenken.
10. **Bundle Analysis** (Implementert):
    *   Kjørte build med analyse. `stats.html` er generert i roten for å inspisere pakkestørrelser.
11. **Optimalisering av fonter** (Verifisert):
    *   Sørg for at webfonter bruker `font-display: swap` for å vise tekst umiddelbart (allerede på plass i index.html).
12. **Memoization** (Implementert):
    *   Brukt `React.memo` på `LessonCard` for å hindre unødvendige re-renders.

## Brukeropplevelse (UX) og Design
 
13. **Avansert Søk**:
    *   Oppgrader `SearchOverlay` med fuzzy search (f.eks. `fuse.js`) for å håndtere skrivefeil. Legg til filtrering på fag og type (artikkel, video, oppgave).
14. **Dark Mode**:
    *   Utvid Tailwind-konfigurasjonen til å støtte `dark:` klasser fullt ut, og legg til en toggle i `Layout` for å la brukeren velge tema.
15. **Brødsmulesti (Breadcrumbs)**:
    *   Sørg for at `Breadcrumbs`-komponenten håndterer alle nivåer korrekt, inkludert dype nøstinger i `subTopics`, for enklere navigering tilbake.
16. **Bedre Loading Skeletons** (Implementert):
    *   Implementert `Skeleton` og `PageSkeleton` komponenter som viser grå bokser mens innholdet laster.
17. **404 Side** (Implementert):
    *   Laget en dedikert "Fant ikke siden"-komponent med en hyggelig melding og lenke tilbake til forsiden.
 
## Funksjonalitet
 
18. **Bokmerker / Favoritter**:
    *   Utvid `useUserHistory` til å også støtte "Favoritter". La brukere stjernemarkere artikler de vil finne tilbake til.
19. **Progress Tracking**:
    *   Vis en visuell indikator (f.eks. en grønn hake eller progress bar) på `LessonCard` for artikler brukeren har lest ferdig.
20. **PWA (Progressive Web App)**:
    *   Legg til `vite-plugin-pwa` for å gjøre nettsiden installerbar som en app og støtte offline-lesing. Perfekt for skolebruk.
 
## DevOps og Testing
 
21. **Testing med Vitest**:
    *   Sett opp `vitest` og `react-testing-library`. Skriv enkle tester for kritiske komponenter som `LessonCard` og `manifest` parsing-logikken.
22. **CI/CD Pipeline**:
    *   Lag en GitHub Action workflow som kjører `npm run lint` og `npm run build` ved hver push for å fange opp feil tidlig.
23. **Automatisert Link-sjekk**:
    *   Lag et script som går gjennom `manifest.json` og sjekker at alle interne lenker peker til eksisterende ID-er, og at eksterne bilder laster.
 
## Innhold
 
24. **Deling av Manifestet**:
    *   `manifest.json` er over 400 linjer. Vurder å splitte den opp i flere filer (f.eks. `norsk.json`, `historie.json`) og merge dem ved build-time eller runtime for bedre oversikt.

## 🚀 Pro Tips for "Snappiness" (Avansert)

25. **Optimistisk UI (Optimistic UI)** (Implementert, men rullet tilbake):
    *   Ble implementert for "Lest"-markering, men fjernet etter ønske om renere UI. Teknologien er klar hvis behovet oppstår igjen.
26. **CSS `content-visibility: auto`** (Implementert):
    *   Lagt til `.content-auto` klasse i `index.css` for ytelsesoptimalisering av store seksjoner.
27. **Ressurs-hinting (`rel="preconnect"`)** (Implementert):
    *   Lagt til `preconnect` for Unsplash i `index.html` for raskere bildelasting.
28. **Interaksjon til neste paint (INP) optimalisering** (Implementert):
    *   Opprettet `src/utils/scheduler.ts` med `scheduler.yield()` og `scheduler.postTask()` for å splitte opp tunge oppgaver.

