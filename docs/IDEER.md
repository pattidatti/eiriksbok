# Strategisk Gjennomgang: Eiriksbok

Som din AI-partner med dyp erfaring innen fullstack-utvikling, interaksjonsdesign og pedagogikk, har jeg analysert nettstedet ditt. Her er 30 ideer for å løfte prosjektet til neste nivå, kategorisert for helhetlig oversikt.

---

## 📚 Innhold (Innhold & Pedagogikk)
1.  **Tverrfaglige Broer**: Modul som viser hvordan én hendelse (f.eks. Svartedauden) påvirket økonomi, litteratur og religion samtidig i en visuell graf.
2.  **Global Begrepsbase**: En "Concept Wiki" hvor alle tagger (som #demokrati) samles på egne sider med lenker til alle artikler der de nevnes.
3.  **Biografi-kort**: Standardiserte "top trumps"-aktige kort for historiske figurer med styrker, svakheter og viktigste bidrag.
4.  **Lokalhistorisk Tilkobling**: Muligheten for lærere/elever å legge inn lokale eksempler som "snakker" med det nasjonale pensumet.
5.  **Månedens Etiske Dilemma**: En interaktiv forside-modul som tar en aktuell nyhetssak og analyserer den gjennom de tre etiske modellene (plikt, dygd, nytte).
6.  **"Hva om?"-scenarier**: Alternative historiske tidslinjer i tekstform som utfordrer eleven til å tenke kritisk rundt årsak/virkning.
7.  **Kilde-utforsker**: En modul som viser originaltekster (f.eks. Grunnloven) med "hover-over" forklaringer på arkaiske ord.
8.  **Visuelle Tankekart**: Dynamiske kart som genereres automatisk basert på artiklers innhold for å vise sammenheng mellom ideer.

## 🕹️ Moduler & Funksjonalitet
9.  **AI Studie-assistent**: En integrert chatbot som kun svarer basert på *ditt* innhold (RAG), slik at svar er kvalitetssikret.
10. **Personlig Dashboard**: Gamification hvor elever ser egen fremgang, fullførte quizer og "opplåste" merker.
11. **Klasse-modus (Battle)**: Utvidet funksjonalitet for "Quiz Battle" så lærere kan kjøre sanntids-konkurranser i klasserommet.
12. **Audio-Guiding**: Mulighet for å lytte til artiklene (TTS med høy kvalitet) for elever som lærer best auditivt eller er på farten.
13. **Dynamisk Vanskelighetsgrad**: En toggle på artikler: "Enkel forklaring" vs. "Dypdykk" (for differensiering i skolen).
14. **PDF/Lærer-guide Generator**: Generer ferdige arbeidsark eller oppsummeringer med ett klikk for print.
15. **Flashcard-system (Spaced Repetition)**: Bruk konseptene som allerede finnes i koden til å lage et Anki-lignende puggesystem.
16. **Interaktive 3D-Rekonstruksjoner**: Flere R3F-modeller av f.eks. et kloster i middelalderen eller en tidlig dampmaskin.

## 🛠️ Kode & Arkitektur (Backend/Front-end)
17. **Component Registry**: Flytt den store `switch`-en i `ArticleContent.tsx` til et separat register for bedre vedlikehold og "lazy loading".
18. **Dynamic Imports**: Implementer dynamisk import på alle tunge interaktive komponenter for å redusere initial bundle size drastivt.
19. **Forbedret Markdown-støtte**: Gå fra enkel regex-splitting til `react-markdown` slik at du kan bruke komplekse formateringer sømløst.
20. **Command Palette (Ctrl+K)**: En global søkebar som lar brukere hoppe mellom emner, spill og quizer lynraskt.
21. **Zustand Persistence**: Lagre elevens fremgang og innstillinger (som Dyslexia mode) i `localStorage` via Zustand middleware.
22. **Animations Presets**: Lag en sentralisert `motion-presets.ts` for å sikre at alle bevegelser føles like over hele siden.
23. **API-drevet Innhold**: Flytt innholdshenting til en dedikert `useContent`-hook med React Query for caching og bedre feilhåndtering.

## 🎨 Design & Brukeropplevelse (UX)
24. **Ekte Dark Mode**: Implementer CSS-variabler for nattmodus (viktig for mange elever som sitter sent).
25. **Leseprogresjons-bar**: En diskret bar øverst som viser hvor langt du har kommet i en lang artikkel.
26. **"T-banekart" Navigasjon**: En visuell oversikt over læreplanen som ser ut som et t-banekart der stasjonene er emner.
27. **Haptiske Mikro-interaksjoner**: Små animasjoner og lyder når man svarer rett på en quiz eller finner et ord i "Sorters"-spillet.
28. **Responsiv Grid-optimalisering**: Fullfør overgangen til en 4-kolonners grid som fungerer perfekt på alt fra mobil til 4K.
29. **Tilpasningsdyktig UI**: La brukeren justere tekststørrelse og linjeavstand selv (utover bare Dyslexia-mode).
30. **Lærer-portal**: En egen innlogging for lærere hvor de kan se aggregert statistikk over hva klassen synes er vanskelig.

---

### Oppsummering
Nettstedet ditt har et fantastisk fundament med moderne teknologi (React 19, Three.js). Ved å fokusere på **differensiering** (ide 13) og **tverrfaglig visualisering** (ide 1) vil du skape et verktøy som virkelig skiller seg ut i dagens skolemarked.
