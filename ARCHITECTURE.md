# Arkitektur & Teknisk Oversikt 🏗️

Dette dokumentet gir en oversikt over hvordan Gravity Lærebok er bygget opp teknisk.

## 🛠️ Teknologistack

- **Rammeverk**: [React 19](https://react.dev/)
- **Byggverktøy**: [Vite](https://vitejs.dev/)
- **Språk**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **CMS**: [TinaCMS](https://tina.io/) (for innholdsredigering)
- **Ikoner**: [Heroicons](https://heroicons.com/) & [Lucide React](https://lucide.dev/)
- **Animasjoner**: [Framer Motion](https://www.framer.com/motion/)
- **Kart/Visualisering**: [React Simple Maps](https://www.react-simple-maps.io/) & [Chart.js](https://www.chartjs.org/)

## 📂 Prosjektstruktur

```
/
├── public/
│   ├── content/       # Alt innhold (JSON-filer) og bilder
│   │   ├── historie/  # Historiefaget
│   │   ├── norsk/     # Norskfaget
│   │   └── manifest.json # Hovedoversikt over alle fag og emner
│   └── ...
├── src/
│   ├── components/    # Gjenbrukbare React-komponenter
│   │   ├── ui/        # Grunnleggende UI-elementer (knapper, kort)
│   │   └── ...
│   ├── pages/         # Hovedsider (LandingPage, SubjectPage, TopicPage)
│   ├── styles/        # CSS-filer (index.css)
│   ├── App.tsx        # Hovedkomponenten og ruting
│   └── main.tsx       # Inngangspunktet for applikasjonen
├── tina/              # Konfigurasjon for TinaCMS
└── ...
```

## 🔑 Nøkkelkonsepter

### 1. "Dark Immersion" Design
Vi bruker et mørkt tema (`bg-slate-950`) med glassmorphism-effekter for å skape en moderne og oppslukende læringsopplevelse.
- **Farger**: Mørk bakgrunn, lys tekst, aksentfarger (Indigo, Blue, Green) for interaksjon.
- **Komponenter**: Bruk `ImmersiveCard` for innhold.

### 2. Manifest-basert Ruting
Hele strukturen på nettsiden (fag -> emner -> leksjoner) styres av `public/content/manifest.json`.
- Når du legger til et nytt emne i manifestet, vil det automatisk dukke opp i navigasjonen.
- URL-strukturen følger manifestet: `/fag/[fagId]/[emneId]/[leksjonId]`.

### 3. Innhold som Data
Alt innhold (tekst, bilder, quiz) lagres som JSON-filer i `public/content`. Dette gjør det enkelt å redigere innhold uten å endre koden, og muliggjør bruk av CMS.

### 4. Interaktive Moduler
I stedet for bare tekst, bruker vi interaktive React-komponenter for å forklare konsepter. Disse ligger i `src/components` og lastes inn dynamisk basert på innholdet.
