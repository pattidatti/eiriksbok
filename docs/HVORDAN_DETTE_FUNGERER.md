# Hvordan denne nettsiden fungerer (Forklart enkelt)

Hei! 👋 Hvis du husker hvordan man lager en nettside med `index.html` og "Hello World", så er dette neste steg. Det kan virke overveldende med mange filer, men det er egentlig ganske logisk når man knekker koden.

Her er en enkel forklaring på hvordan alt henger sammen.

---

## 🧱 LEGO-prinsippet (React)

Tenk på "gammeldags" HTML som å bygge et hus med leire. Du må forme hver eneste vegg, dør og vindu for hånd, hver gang. Hvis du vil ha 10 like vinduer, må du lage 10 like klumper med leire.

Denne nettsiden er bygget med **React**. Det er som å bygge med **LEGO**.
1. Vi lager en "LEGO-kloss" én gang (f.eks. en knapp, eller en tidslinje).
2. Så kan vi bruke den klossen så mange ganger vi vil, hvor som helst!

Dette gjør at vi slipper å skrive samme kode om og om igjen.

---

## 🏠 Huset vårt (Mappestrukturen)

Prosjektet er delt inn i to hovedrom:

### 1. `src` (Verkstedet) 🛠️
Her ligger alle **LEGO-klossene** og **byggetegningene**.
- Det er her vi skriver koden som bestemmer *hvordan* ting ser ut og oppfører seg.
- F.eks: "En tidslinje skal ha en strek til venstre og tekst til høyre."
- **Viktig fil:** `src/pages/LessonPage.tsx` er som "Sjefsbyggeren". Den bestemmer hvilke klosser som skal brukes på hvilken side.

### 2. `public` (Lageret/Spiskammeret) 📦
Her ligger alt **innholdet** (tekst og bilder).
- Her er det *ingen* programmering, bare ren tekst og data.
- Vi bruker filer som slutter på `.json`. Tenk på dem som **oppskrifter** eller **skjemaer**.
- F.eks: `perserriket.json` inneholder bare teksten om Perserriket, ikke noe om hvordan det skal se ut.

---

## 🔗 Hvordan henger det sammen?

Når du går inn på siden "Perserriket", skjer dette:

1. **Menyen (`manifest.json`):**
   Appen sjekker en hovedliste (`public/content/manifest.json`) for å se om "Perserriket" finnes. Det er som innholdsfortegnelsen i en bok.

2. **Sjefsbyggeren (`LessonPage.tsx`):**
   Sjefsbyggeren ser at du vil lese om Perserriket. Han løper til lageret (`public`) og henter filen `perserriket.json`.

3. **Byggingen:**
   Sjefsbyggeren leser "oppskriften" i `perserriket.json`.
   - Står det "Vis en tidslinje"? -> Han henter Tidslinje-LEGO-klossen.
   - Står det "Vis et bilde"? -> Han henter Bilde-LEGO-klossen.
   - Står det "Vis tekst"? -> Han henter Tekst-LEGO-klossen.

4. **Resultatet:**
   Han setter sammen alle klossene på skjermen din, og vips – du har en ferdig nettside! ✨

---

## 📝 Hvordan legger jeg til noe nytt?

Hvis du vil lage en ny artikkel, trenger du ikke røre koden i `src` (Verkstedet)! Du trenger bare å gjøre to ting i `public` (Lageret):

1. **Lag en ny fil:**
   Kopier en eksisterende fil (f.eks. `perserriket.json`), gi den et nytt navn, og bytt ut teksten.

2. **Oppdater menyen:**
   Legg til den nye filen i listen i `manifest.json` så appen vet at den finnes.

Det er det! Sjefsbyggeren tar seg av resten.

---

## 🚀 Hvordan starte alt sammen?

I "gamle dager" dobbeltklikket du bare på `index.html`. Nå må vi starte en liten "robot" som setter sammen LEGO-klossene for oss.

Åpne terminalen (det svarte vinduet) og skriv:
```bash
npm run dev
```
Dette betyr "Node Package Manager, kjør utviklings-modusen". Da starter nettsiden, og du kan se den i nettleseren din.

---
---

# Teknisk Oversikt (For voksne/utviklere)

Her er en mer formell gjennomgang av teknologistacken og arkitekturen for deg som ønsker å forstå "motoren" under panseret.

## 🛠️ Teknologistack

- **Rammeverk:** [React](https://react.dev/) (v18)
  - Et komponentbasert bibliotek for å bygge brukergrensesnitt. Vi bruker funksjonelle komponenter og Hooks (`useState`, `useEffect`).
- **Språk:** [TypeScript](https://www.typescriptlang.org/)
  - En "superset" av JavaScript som legger til statiske typer. Dette hjelper oss å unngå feil (f.eks. å sende tekst til en funksjon som forventer tall) og gir bedre autofullføring i editoren.
- **Byggeverktøy:** [Vite](https://vitejs.dev/)
  - En moderne, lynrask "bundler" som erstatter eldre verktøy som Webpack. Den sørger for at endringer i koden vises nesten umiddelbart i nettleseren (Hot Module Replacement).
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
  - Et "utility-first" CSS-rammeverk. I stedet for å skrive egne `.css`-filer, bruker vi forhåndsdefinerte klasser direkte i HTML-en (f.eks. `className="p-4 bg-blue-500"`).
- **Routing:** [React Router](https://reactrouter.com/)
  - Håndterer navigasjon mellom "sider" uten at nettleseren trenger å laste siden på nytt (SPA - Single Page Application).

## 🏗️ Arkitektur: Data-drevet SPA

Denne applikasjonen er en **Single Page Application (SPA)** som fungerer som et "Headless CMS" der filsystemet er databasen.

### 1. Separasjon av Data og Presentasjon
Vi har et strengt skille mellom innhold og kode:
- **Presentasjon (`src/`):** React-komponentene definerer *hvordan* ting skal se ut. De er "dumme" i den forstand at de ikke vet *hva* de viser før de får data.
- **Data (`public/content/`):** Alt innhold ligger som statiske JSON-filer. Dette gjør det enkelt å redigere innhold uten å røre koden, og det gjør appen veldig rask siden den ikke trenger en database-server.

### 2. Dataflyt
1. **Initialisering:** Når appen starter, lastes `manifest.json`. Dette fungerer som en global indeks over alle fag, emner og leksjoner.
2. **Routing:** Når brukeren navigerer til `/fag/emne/leksjon`, fanger `LessonPage.tsx` opp URL-parametrene.
3. **Fetching:** `LessonPage` bruker en asynkron funksjon (`fetchLesson`) til å hente riktig JSON-fil fra `public/content/...`.
4. **Rendering:** JSON-dataene inneholder en liste med "blokker" (tekst, bilder, komponenter). `ArticleContent.tsx` itererer over disse blokkene og velger riktig React-komponent for hver blokk (Factory Pattern).

### 3. Komponentstruktur
- **`App.tsx`:** Hovedinngangen. Setter opp routing og global layout.
- **`Layout.tsx`:** Definerer rammeverket rundt innholdet (header, sidebar).
- **`LessonPage.tsx`:** "Page Controller". Henter data og håndterer loading/error states.
- **`InteractiveArticle.tsx`:** En presentasjonskomponent som viser selve artikkelen med hero-bilde, tidslinje i sidebar, osv.
- **`TimelineComponent.tsx`:** En gjenbrukbar komponent som kan vises i "full bredde" eller "compact" (sidebar) modus basert på props.

## 🔄 Hvorfor denne arkitekturen?
- **Ytelse:** Statiske filer lastes ekstremt raskt.
- **Sikkerhet:** Ingen database eller server-side kode som kan hackes.
- **Vedlikehold:** Innholdsprodusenter kan skrive JSON (eller bruke en fremtidig editor) uten å kunne ødelegge applikasjonskoden.

## 🧭 Navigasjon og Søk

Vi har lagt til nye måter å finne frem på:

### Brødsmuler (Breadcrumbs)
Øverst på siden ser du nå en sti (f.eks. `Hjem > Historie > Andre Verdenskrig`). Dette hjelper deg å vite hvor du er, og lar deg enkelt hoppe tilbake et nivå.

### Søk (Cmd+K / Ctrl+K)
Du kan nå søke etter fag, emner og leksjoner!
- Trykk på søkeikonet i menyen.
- Eller bruk hurtigtasten `Cmd+K` (Mac) eller `Ctrl+K` (Windows).
- Søket finner både titler og innhold.

## 🎨 Designsystem (Tailwind)

## 📖 Ordbok (Glossary)
Vi har nå en innebygd ordbok!
- Vanskelige ord (som "Imperialisme") blir automatisk understreket med en stiplet linje.
- Når du holder musen over (eller trykker på mobil), vises en enkel forklaring.
- Ordene hentes fra `src/data/glossary.ts`. Du kan enkelt legge til nye ord der.
