# CLAUDE.md — Gravity Eiriksbok

This file provides guidance for AI assistants working on this codebase.

---

## Project Overview

**Gravity Eiriksbok** is a Norwegian digital textbook (lærebok) for middle/high school students, deployed at https://bok.haaland.de/. It covers *Historie* (History), *Norsk* (Norwegian Language), *KRLE* (Religion & Ethics), *Samfunnsfag* (Social Studies), and *Musikk* (Music) through immersive, interactive lessons.

The core philosophy: content is *architected* before it is *built*. A Blueprint defines a topic's soul, narrative arc, and visual identity before any JSON or code is written.

---

## Språklige krav til innhold

Alt innhold i Eiriksbok skal være forståelig for en gjennomsnittlig 14-åring.

- Bruk enkle, direkte setninger. Velg det korteste ordet som gir riktig mening.
- Unngå faglige og akademiske uttrykk når et hverdagslig ord dekker det samme.
- Hvis et fremmedord eller fagbegrep må brukes, forklar det når det introduseres.
- Skriv aktivt ("Harald samlet Norge") fremfor passivt ("Norge ble samlet av Harald").
- Bruk alltid korrekte norske tegn: **å, ø, æ** - aldri aa, oe, ae som erstatning.
- Test deg selv: Ville en 14-åring forstått dette uten hjelp? Hvis ikke - skriv om.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 5 |
| Language | TypeScript 5.9 |
| Styling | Tailwind CSS v4 (utility-first, no dark mode by default) |
| Animations | Framer Motion 12 |
| State | Zustand 5 |
| Routing | React Router v6 (browser router, lazy-loaded pages) |
| Data fetching | TanStack React Query 5 |
| Backend/Realtime | Firebase 12 (Firestore, Realtime DB — for Quiz Battle & feedback) |
| CMS | TinaCMS 2 (visual editing at `/admin`) |
| 3D (artikler) | React Three Fiber + Drei |
| 3D (mini-spill) | Raw Three.js (imperativ, ingen R3F) |
| Fysikk (mini-spill) | Rapier3D (`@dimforge/rapier3d-compat`, WASM, lazy-lastet) |
| Charts | Chart.js + react-chartjs-2 |
| Maps | d3-geo + topojson-client |
| Drag-and-drop | @dnd-kit |
| Audio | Tone.js |
| Search | Fuse.js |
| PWA | vite-plugin-pwa (autoUpdate, selfDestroying SW) |

---

## Repository Structure

```
/
├── public/
│   ├── content/               # All article JSON files (the "database")
│   │   ├── manifest.json      # App skeleton: Subjects → Topics → Lessons
│   │   ├── global-timeline.json  # Single source of truth for all timeline events
│   │   ├── historie/          # History subject folder
│   │   ├── norsk/             # Norwegian subject folder
│   │   ├── krle/              # KRLE subject folder
│   │   └── samfunnsfag/       # Social Studies subject folder
│   ├── data/
│   │   ├── concepts.json      # Auto-generated flashcard concept database
│   │   ├── glossary.json      # Auto-generated glossary
│   │   ├── religion/          # Per-religion JSON data (7-dimension model)
│   │   └── philosophy/        # Per-philosopher JSON data
│   └── images/                # Static images organized by topic
├── src/
│   ├── App.tsx                # Root component: router setup, context providers
│   ├── routes.ts              # Centralized lazy-load route factories
│   ├── pages/                 # Top-level page components
│   ├── components/
│   │   ├── ComponentRegistry.tsx  # Maps component names to React components (used by JSON content)
│   │   ├── content/interactive/   # 60+ interactive learning components
│   │   ├── games/             # Mini-game components
│   │   ├── ui/                # Generic UI primitives
│   │   └── ...                # Layout, navigation, modals
│   ├── features/music/        # Music subject feature module
│   ├── games/
│   │   ├── engine/            # Gjenbrukbart 3D-spillmotor-rammeverk (raw Three.js + Rapier3D)
│   │   │   ├── types.ts       # GameConfig, DialogNode, MonologNode, PhysicsConfig, PlayerMode, osv.
│   │   │   ├── GameEngine.ts  # Hoved-orkestrator: scene, renderer, loop, input, fysikk, flagg
│   │   │   ├── WorldBuilder.ts    # Bygger 'workshop'-preset (ett lukket rom)
│   │   │   ├── CharacterBuilder.ts # Toon-shaded karakterer, 4 typer (scientist/farmer/noble/monk)
│   │   │   ├── ParticleSystem.ts  # Støv, gnister, damp
│   │   │   ├── LightBuilder.ts    # Hengende SpotLights + shader-baserte lyskjegler
│   │   │   ├── SceneMat.ts        # Material-presets (stein, tre, metall, osv.)
│   │   │   ├── systems/       # Gjenbrukbare subsystemer
│   │   │   │   ├── PhysicsWorld.ts        # Rapier3D: character controller, raycast, step (Fase 4)
│   │   │   │   ├── InteractableSystem.ts  # Pickup/drop/kast via E og F (Fase 4)
│   │   │   │   ├── PostProcessingSystem.ts # EffectComposer: bloom, tone mapping, color grading
│   │   │   │   ├── SkySystem.ts           # Prosedyral himmel koblet til TimeOfDay
│   │   │   │   ├── TimeOfDaySystem.ts     # 0-1 lerp driver sol/ambient/sky-farge
│   │   │   │   ├── WeatherSystem.ts       # Regn, snø, tåke (partikler + fog override)
│   │   │   │   ├── VegetationSystem.ts    # InstancedMesh-gress/siv/trær med vind-shader
│   │   │   │   ├── CameraDirector.ts      # Dialog-framing, fade, cinematics
│   │   │   │   ├── AIDirector.ts          # Waypoint-vandring for NPCer
│   │   │   │   ├── MonologSystem.ts       # Indre stemme - ikke-blokkerende tekst + triggere
│   │   │   │   ├── OceanSystem.ts         # Animert hav + skum-partikler
│   │   │   │   └── RoomSystem.ts          # Deklarativ rom-bygging (vegger markert solid)
│   │   │   ├── builders/      # Spill-spesifikke scene-byggere (gjenbrukbare)
│   │   │   │   ├── CloisterBuilder.ts # Kloster (kapell, korridor, bibliotek, sovesal)
│   │   │   │   ├── BeachBuilder.ts    # Strand, sti, klipper
│   │   │   │   └── SeascapeBuilder.ts # Hav + himmel + langskip
│   │   │   └── components/    # React-wrappere: GameCanvas, DialogBox, MonologBox, PuzzleUI, osv.
│   │   ├── watt-lab/          # James Watt-spill (ett-rom med samleobjekter + puzzle)
│   │   │   ├── WattLabConfig.ts   # Komplett GameConfig: verden, karakterer, dialog, puzzle
│   │   │   └── WattLabAssets.ts   # Spill-spesifikke 3D-objekter (markert userData.solid)
│   │   ├── lindisfarne-793/   # Vikingraid (fler-fase utendørs: båt, strand, kloster)
│   │   │   ├── LindisfarneConfig.ts   # GameConfig med 'open'-preset og variabel endText
│   │   │   ├── LindisfarneAssets.ts   # setupScene: syr sammen hav, båt, strand, kloster
│   │   │   ├── LindisfarneDialogs.ts  # NPC-dialoger (Sigurd, veteran, Ulv, Eadfrith)
│   │   │   └── LindisfarneMonologs.ts # Indre monolog-noder + triggervolumer
│   │   ├── chrono-glider/     # Chrono Glider (eksisterende, R3F-basert)
│   │   ├── concept-snake/     # Konseptslange (eksisterende)
│   │   ├── word-sorter/       # Ordsortering (eksisterende)
│   │   └── GameRegistry.ts    # Eldre spill-registry (ikke brukt av engine-systemet)
│   ├── hooks/                 # Custom React hooks
│   ├── context/               # React context providers (GlossaryContext, LayoutContext)
│   ├── stores/                # Zustand stores
│   ├── data/                  # TypeScript data files (glossary.ts, textLibraryData.ts, etc.)
│   ├── types/                 # Shared TypeScript types
│   └── utils/                 # Utility functions
├── scripts/                   # Node.js build/maintenance scripts
├── docs/                      # Documentation and design blueprints
│   ├── Design documents/      # Topic blueprints ([topic]-blueprint.md)
│   └── THE_ARCHITECTS_HANDBOOK.md
├── .agent/workflows/          # AI agent workflow definitions
│   └── LEARNING_PATH_GUIDE.md # Guide for creating learning paths
├── tina/                      # TinaCMS configuration
└── Ideer/                     # Planning/ideas documents (Norwegian)
```

---

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server at localhost:5173 (auto-runs scan:content first)
npm run build        # Production build (scan:content + tsc + vite build + copy-404.js)
npm run lint         # ESLint check
npm run preview      # Preview production build
npm run tina-dev     # Start with TinaCMS visual editor (go to /admin)
npm run scan:content # Regenerate content-index.json + sync manifest dates
npm run scan:concepts # Scan articles for potential new flashcard concepts
```

> After `git pull`, always run `npm install` if `package.json` changed.

---

## URL Structure / Routing

The app uses a manifest-driven routing system:

```
/                               Landing page
/sok                            Search
/:subjectId                     Subject page (e.g. /historie)
/:subjectId/:topicId            Topic page (e.g. /historie/vikingtiden)
/:subjectId/:topicId/:lessonId  Lesson page (e.g. /historie/vikingtiden/rikssamlingen)
/:subjectId/:topicId/:subTopicId/:lessonId  Nested lesson

/norsk/bibliotek                Text library
/norsk/bibliotek/:textId        Text reader
/tidslinje                      Global timeline
/laeringsstier                  Learning paths hub
/oving                          Practice hub
/oving/flashcards               Flashcards
/oving/quiz                     Quiz
/oving/chrono                   Chrono card game
/oving/dungeon                  Dungeon quiz game
/oving/detektiv/:caseId         Detective case
/oving/etikk                    Ethics experiment
/oving/tidsreise/:scenarioId    Time travel game
/oving/spill                    Mini-spill galleri (historiske 3D-spill)
/oving/spill/:gameId            Enkelt mini-spill (f.eks. /oving/spill/watt-lab)
/quiz-battle                    Multiplayer quiz lobby
/krle/sammenlign                Religion comparison
/krle/filosofi/odyssey          Philosophy odyssey
/admin                          Admin dashboard (guarded)
```

---

## Content Architecture (JSON-Driven)

### manifest.json

The skeleton of the entire app. **Always update this when adding new content.**

```json
{
  "subjects": [
    {
      "id": "historie",
      "title": "Historie",
      "topics": [
        {
          "id": "vikingtiden",
          "title": "Vikingtiden",
          "tools": [
            {
              "id": "vikingtiden-sti",
              "title": "Læringssti: Vikingtiden",
              "description": "...",
              "link": "/historie/vikingtiden/vikingtiden-sti",
              "icon": "map"
            }
          ],
          "lessons": [
            {
              "id": "rikssamlingen",
              "title": "Rikssamlingen",
              "description": "...",
              "image": "/images/...",
              "tags": ["norge", "kongemakt"],
              "createdDate": "2024-01-01T00:00:00Z"
            }
          ]
        }
      ]
    }
  ]
}
```

- Learning paths go under `tools`, **not** `lessons`
- Tags must be consistent across articles and the global timeline

### Article JSON Files

Location: `public/content/[subjectId]/[topicId]/[lessonId].json`

```json
{
  "id": "rikssamlingen",
  "title": "Rikssamlingen",
  "layout": "rich",
  "year": "872",
  "category": "Norge",
  "readTime": "8 min lesning",
  "heroImage": "/images/vikingtiden/rikssamlingen-hero.webp",
  "details": ["Nøkkelpunkt 1", "Nøkkelpunkt 2"],
  "externalUrl": "https://snl.no/rikssamlingen",
  "content": [
    { "type": "text", "content": "Første avsnitt..." },
    { "type": "header", "text": "Seksjonstittel" },
    { "type": "text", "content": "Tekst under seksjon..." },
    { "type": "list", "items": ["Punkt 1", "Punkt 2"] },
    { "type": "component", "name": "ScenarioRoleplay", "props": { ... } }
  ],
  "timeline": []
}
```

**Critical rules for article content:**
- `content` array must be **flat** — no nested `section` blocks. Use `header` blocks for sections.
- **Never use bold text** (`**word**`) inside `text` blocks. The concepts system handles term highlighting.
- **Never use markdown lists** (`- item`) inside `text` blocks. Use `{ "type": "list", "items": [...] }`.
- `"layout": "rich"` activates the immersive sidebar with timeline, maps, and TOC.
- `timeline` array should always be `[]` — all events go in `global-timeline.json`.
- `TimelineComponent` inside articles must always have `compact: true` in props.

### Article Layouts

| Layout | Trigger | Sidebar |
|---|---|---|
| Standard | Default | `LessonSidebar` (concepts, quotes, links) |
| Rich | `"layout": "rich"` | Interactive: timeline, maps, TOC |
| Norsk Rich | `"layout": "rich"` + `subject: "norsk"` | Genre info + related links |
| Text Reader | Route `/norsk/bibliotek/:textId` | None (focus mode) |
| Learning Path | `"layout": "learning-path"` | Path steps navigator |

### Global Timeline

File: `public/content/global-timeline.json`

```json
{
  "id": "event-id",
  "title": "Tittel",
  "description": "Beskrivelse",
  "startDate": 872,
  "endDate": 872,
  "displayDate": "872",
  "type": "event",
  "subjectId": "historie",
  "topicId": "vikingtiden",
  "link": "/historie/vikingtiden/rikssamlingen",
  "tags": ["norge", "kongemakt"]
}
```

Edit this file directly. Never store events in individual article JSON files.

---

## Component System (ComponentRegistry)

Interactive components in articles are referenced by string name in JSON and resolved at runtime via `src/components/ComponentRegistry.tsx`.

**To add a new interactive component:**
1. Create the component in `src/components/content/interactive/`
2. Add a lazy import and entry to `componentRegistry` in `ComponentRegistry.tsx`
3. Reference in JSON: `{ "type": "component", "name": "MyComponent", "props": { ... } }`

### Available Interactive Components (selection)

| Name | Purpose |
|---|---|
| `ScenarioRoleplay` | Branching choice scenarios |
| `PackTheBag` | Resource management puzzles |
| `DebateSimulator` | Argumentation practice |
| `DragDropTimeline` | Event ordering |
| `BiasLens` | Perspective/source criticism |
| `MapCarousel` | Historical map lightbox |
| `Quiz` | Inline quizzes |
| `TimelineComponent` | Compact inline timeline |
| `FactBox` | Info callout box |
| `QuoteBlock` | Styled quote |
| `Gallery` | Image gallery |
| `GlossaryTooltip` | Concept tooltip |

Full list in `src/components/ComponentRegistry.tsx`.

---

## Learning Paths

Learning paths are JSON files stored alongside articles: `public/content/[subject]/[topic]/[topic]-sti.json`.

They use a **3-act narrative structure**:
- **Akt 1: Opptakten** (Setup)
- **Akt 2: Konfrontasjonen** (Conflict / deep content)
- **Akt 3: Resolusjonen** (Resolution / reflection)

Every path must begin with **Steg 0 (Prolog)** — a zero-prerequisite introduction.

Tasks within each step follow **Bloom's Taxonomy**:
1. Recall (Fakta — find it in the text)
2. Understanding (Forståelse — explain mechanisms)
3. Analysis/Ethics (Refleksjon — evaluate dilemmas)

If a step requires reading an article, the first task **must** be:
```
"Les artikkelen [Tittel](/absolute/path/to/article)"
```

See `.agent/workflows/LEARNING_PATH_GUIDE.md` for the full JSON schema.

---

## Content Authoring Workflow

### Adding a New Lesson

1. **Create content file**: `public/content/[subject]/[topic]/[lesson-id].json`
2. **Update manifest**: Add entry under the correct topic in `manifest.json`
3. **Scan concepts**: `npm run scan:concepts` — review suggestions for new terms to add to TinaCMS
4. **Add timeline events**: Append any new events to `global-timeline.json`
5. **Verify**: Start dev server, check article loads, concepts appear, timeline events show

### Adding a New Topic (Architect Workflow)

1. **Create Blueprint**: `docs/Design documents/[topic]-blueprint.md` — define narrative arc, beats, image prompts
2. **Plan**: Use `/plan_topic` workflow (see `.agent/workflows/plan_topic.md`)
3. **Build**: Use `/build_topic` workflow after Blueprint is approved
4. **Register**: Add topic to `manifest.json`

### Adding a New Concept (Flashcard Term)

- Use TinaCMS admin at `http://localhost:5173/admin`, collection "Fagbegreper"
- Or add directly to `public/content/concepts/[term].json`

---

## Mini-spill-system

Historiske 3D-mini-spill bor under `/oving/spill` og bruker et eget gjenbrukbart rammeverk i `src/games/engine/`. Hvert spill defineres som et TypeScript-objekt (`GameConfig`) - motoren håndterer Three.js, Rapier3D-fysikk, input, dialog, puzzle, indre monolog, værsystem, sky/time-of-day, kamera-direktør og flagg. Ingen progresjonlagring.

**To arketyper støttes:**
- **Ett-rom-spill** (`world.preset: 'workshop'`) - lukket interiør med samleobjekter og puzzle. Se Watt Lab.
- **Fler-fase-spill** (`world.preset: 'open'`) - utendørs / flere scener i én sammenhengende verden. Bruker `systems/` og `builders/` for hav, rom, indre monolog, og spiller-modi (seated/free). Se Lindisfarne 793.

**Legge til et nytt spill:**
1. Opprett `src/games/[id]/[Id]Config.ts` (GameConfig) og `[Id]Assets.ts` (setupScene-callback)
2. Legg til i `HISTORICAL_GAMES` i `src/pages/MiniGamesPage.tsx`
3. Legg til i `GAME_REGISTRY` i `src/pages/GamePage.tsx`

Se **`.agent/workflows/BUILD_GAME_GUIDE.md`** for komplett guide med skjema, `userData.solid`-kollisjon (Rapier), dialog/puzzle/monolog-system, fase-overganger med `engine.setPhase`/`setFlag`, variabel slutt via `endText`-funksjon, pickup/kast via E og F, og eksempler fra både Watt Lab og Lindisfarne.

> **Før du tester et nytt `preset: 'open'`-spill - gå gjennom sjekklisten i BUILD_GAME_GUIDE.md §16.7.** Den dekker sol/hemi-registrering, tak-synlighet, hav-overlapp, demping på dynamiske objekter og andre fallgruver som lett oppstår.

---

## Code Conventions

### TypeScript

- Strict mode enabled (`tsconfig.app.json`)
- All components use **named exports**
- Props typed with inline interfaces (no `React.FC<>` wrapper)

### Prettier (auto-enforced)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 4,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Styling

- Tailwind CSS v4 utility classes only
- Design system: **Modern Glassmorphism** — light `bg-slate-50` base, glass card effects
- Custom theme tokens: `bg-main`, `bg-card`, `text-main`, `text-muted`, `neon-accent` (CSS variables)
- Game-specific colors in `game.*` namespace (e.g. `game-gold`, `game-stone`)
- Fonts: `Inter` (sans), `Outfit` (display)
- `darkMode: 'class'` — dark mode is class-toggled, not system-automatic
- **Chromebook-first**: De fleste brukere har Chromebook med lav skjermoppløsning (typisk 1366x768). Design for denne skjermstørrelsen som baseline - ikke full-HD. Unngå layout som kun ser bra ut på store skjermer.

### React Patterns

- All pages are **lazy-loaded** via `React.lazy()` + `Suspense`
- Route factories centralized in `src/routes.ts`
- Wrap admin pages with `<AdminGuard>`
- Use `<ErrorBoundary>` for fault isolation
- `usePresence()` runs at app root for Firebase presence tracking

---

## Image Guidelines

- Format: **WebP** (use `scripts/optimize-images.js` for conversion)
- Aspect ratio: **16:9** for all hero and inline images
- Resolution: max 2560px wide for maps, 1600px for standard images
- File size targets: maps < 500KB (target ~300KB), standard < 100KB, quality 75–80%
- Use `<Image priority={true} />` for above-the-fold images (sets `fetchpriority="high"`)
- Use `<MapCarousel>` for historical maps (built-in lightbox, no cropping)
- Store images under `public/images/[topic]/`

**AI image generation prompt template:**
```
A highly realistic 4K cinematic photograph of [scene], [time period].
[Lighting description]. [Composition/camera angle]. 16:9 ratio.
```

---

## Firebase / Backend

- Config in `src/lib/firebase.ts`
- Used for: Quiz Battle (Realtime DB), user feedback (`FeedbackWidget`), presence tracking
- Database rules in `database.rules.json` and `firebase-rules.json`
- Feedback data is **not** publicly readable. To export:
  ```bash
  node scripts/fetch_feedback.cjs YOUR_DATABASE_SECRET
  ```

---

## Build & Performance

- Bundle splitting configured in `vite.config.ts`:
  - `vendor` chunk: react, react-dom, react-router-dom, framer-motion
  - `ui` chunk: lucide-react, @heroicons/react
  - `three` chunk: three.js + fiber/drei
- PWA: auto-update service worker, `selfDestroying: true` to prevent caching issues
- Bundle analysis: `npm run build` generates `stats.html` (rollup-plugin-visualizer)
- Content index regenerated automatically on `npm run dev` and `npm run build`

---

## Scripts Reference

| Script | Purpose |
|---|---|
| `scripts/generateContentIndex.js` | Builds `content-index.json` for fast search |
| `scripts/sync-manifest-dates.js` | Syncs `createdDate` in manifest |
| `scripts/generate-timeline.js` | Validates/rebuilds `global-timeline.json` |
| `scripts/scan-concepts.js` | Scans articles for potential new concept terms |
| `scripts/optimize-images.js` | Converts images to WebP |
| `scripts/copy-404.js` | Copies `index.html` to `404.html` for SPA routing on static hosts |
| `scripts/fetch_feedback.cjs` | Exports Firebase feedback data |
| `scripts/update-learning-paths.cjs` | Updates learning path hub registry |
| `scripts/content-manager.cjs` | Content management utilities |

---

## Key Files

| File | Role |
|---|---|
| `public/content/manifest.json` | App skeleton — subjects, topics, lessons, tools |
| `public/content/global-timeline.json` | All historical timeline events |
| `public/data/concepts.json` | Auto-generated concept/flashcard database |
| `src/components/ComponentRegistry.tsx` | Maps component names to React components |
| `src/App.tsx` | Router setup, context providers |
| `src/routes.ts` | Lazy-load route factories |
| `src/lib/firebase.ts` | Firebase configuration |
| `src/games/engine/types.ts` | Alle typer for mini-spill-systemet (GameConfig, PhysicsConfig, PickupOptions, osv.) |
| `src/games/engine/GameEngine.ts` | Three.js spillmotor — scene, input, loop, Rapier-fysikk, system-orkestrering |
| `src/games/engine/systems/PhysicsWorld.ts` | Rapier3D-wrapper: character controller, raycast, fixed timestep |
| `src/games/engine/systems/InteractableSystem.ts` | Pickup/drop (E) og kast (F) for dynamiske objekter |
| `src/pages/MiniGamesPage.tsx` | Galleriside — legg til nye spill i HISTORICAL_GAMES her |
| `src/pages/GamePage.tsx` | Enkeltspill-side — legg til spill-ID i GAME_REGISTRY her |
| `docs/THE_ARCHITECTS_HANDBOOK.md` | Workflow philosophy |
| `docs/CONTENT_SYSTEM.md` | Comprehensive content system reference |
| `.agent/workflows/LEARNING_PATH_GUIDE.md` | Learning path JSON schema and guide |
| `.agent/workflows/BUILD_GAME_GUIDE.md` | Guide for å lage nye 3D-mini-spill |
| `docs/image-style-guide.md` | Image generation and optimization standards |

---

## Common Pitfalls

1. **Duplicate manifest IDs ("ghost data")**: Before adding a topic/lesson, search `manifest.json` for the `id` to ensure it does not already exist. Duplicates cause stale data.
2. **Norwegian character encoding**: Always save files as UTF-8. Broken characters (`Ã¦`, `Ã¸`, `Ã¥`) must be fixed immediately.
3. **Nested section blocks**: The content renderer does not support nested `section` blocks — use `header` blocks for section separation.
4. **Bold in article text**: Never use `**bold**` in article body text. Use the concepts system.
5. **Markdown lists in text blocks**: Use `{ "type": "list" }` blocks instead.
6. **Timeline in article JSON**: Always keep `"timeline": []` in article files. All events go in `global-timeline.json`.
7. **Learning paths in `lessons`**: Learning paths (`-sti.json`) must be registered under `tools`, not `lessons` in the manifest.
8. **Relative links in tasks**: Always use absolute paths starting with `/` in learning path task links.
9. **Mini-spill kollisjon (Rapier, Fase 4+)**: Nye 3D-objekter som skal være solide må merkes med `mesh.userData.solid = true`. `PhysicsWorld` traverserer scenen og lager colliders automatisk etter init. Valgfri `colliderShape: 'cylinder' | 'capsule' | 'sphere' | 'trimesh'` overstyrer default (cuboid fra boundingBox). Gulv må også ha `solid=true` - det finnes ingen auto-ground. AABB2D og `scene.userData.collisionBoxes` er fjernet fra kollisjons-API-et.
10. **Mini-spill `preset: 'open'` uten sol**: Motoren lager kun `AmbientLight` automatisk for open-preset. Uten `scene.userData._mainSunLight` (DirectionalLight) og `_mainHemiLight` (HemisphereLight) registrert i `setupScene` blir scenen nesten svart selv om SkySystem ser riktig ut. Se `BUILD_GAME_GUIDE.md` §16.1.
11. **Mini-spill tak fra `buildRoom` er usynlig utenfra**: `RoomSystem.buildRoom` bygger tak med normalen pekende nedover (dollhouse-design). For frittstående bygg som sees utenfra, skjul standardtaket (`room.roof.visible = false`) og bygg et saltak manuelt. Se `BUILD_GAME_GUIDE.md` §16.2.
12. **Mini-spill prosedyrale plasseringer**: `engine.addTree`/`addVegetationPatch`/random-løkker må eksplisitt ekskludere bygge-bounds, ellers lander objekter inne i vegger. Samle `AABB2D[]` og sjekk i plasseringsløkken. Se `BUILD_GAME_GUIDE.md` §16.3.
13. **Mini-spill hav klipper gjennom land**: `OceanSystem`-bølger har amplitude ~0.7m. Hvis havplanet overlapper solide land-bokser og `mesh.position.y > land_top - 0.7`, stiger bølgetopper gjennom bakken. Løsning: krymp plane (`size`, `center`) unna land OG senk `mesh.position.y` nok. Husk å oppdatere `FoamSystem`-origin-y og båt-base-y. Se `BUILD_GAME_GUIDE.md` §16.4.
14. **Mini-spill dynamiske objekter ruller evig**: Rapier har default `linearDamping = 0` og `angularDamping = 0`. Sett `userData.linearDamping` og `userData.angularDamping` på dynamiske objekter, og bruk `colliderShape: 'cuboid'` (ikke `'sphere'`) for pickups - sfæriske colliders ruller evig i Rapier. Se `BUILD_GAME_GUIDE.md` §16.5.

---

## Documentation Index

- `docs/THE_ARCHITECTS_HANDBOOK.md` — Philosophy and workflow manifesto
- `docs/CONTENT_SYSTEM.md` — Full content system reference (layouts, feature systems, troubleshooting)
- `docs/CONTENT_STYLE_GUIDE.md` — Writing style rules
- `docs/TECHNICAL_ARCHITECTURE.md` — Architecture overview
- `docs/DEVELOPER_SETUP.md` — Machine setup guide
- `docs/image-style-guide.md` — Image generation and WebP optimization
- `docs/DETEKTIV_GUIDE.md` — Detective case system
- `docs/KRLE_PEDAGOGICAL_GUIDE.md` — KRLE content guidelines
- `docs/Design documents/` — Per-topic blueprints
- `.agent/workflows/LEARNING_PATH_GUIDE.md` — Learning path JSON schema and guide
- `.agent/workflows/BUILD_GAME_GUIDE.md` — Guide for å lage nye historiske 3D-mini-spill
- `Ideer/` — Ideas and planning documents (Norwegian)
- `Ideer/` — Ideas and planning documents (Norwegian)
