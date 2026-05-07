# ULTRATHINK Report — Gravity Eiriksbok

**Dato:** 2026-05-07
**Branch:** main (clean)
**Omfang:** Teknisk helse, arkitektur, UX/UI, innhold, ytelse — med prioritert handlingsplan.

---

## TL;DR — De fem viktigste funnene

1. **351 MB bilder i `public/images/`** med 374 PNG/JPG mot bare 201 WebP. Dette er den klart største gevinsten å ta — både for førstegangsinntrykk på Chromebook og for byggstørrelse (`dist/` er 533 MB).
2. **51 manglende bilder** i artikler — i stor grad eksterne Unsplash-lenker som regelmessig faller. Disse gir ødelagte hero-bilder i hele `norsk/ordklasser`, `norsk/tekstsjangre` og `norsk/skrivehjelp`.
3. **472 ESLint-feil** (TypeScript er ren). Dominerende mønster: `any`-typer i `types.ts`, `contentLoader.ts`, `presentationUtils.ts` og auto-generert `tina/__generated__/types.ts`.
4. **Bundle-tunge komponenter**: `VirkemiddelverkstedetPage` 467 KB, `CompositionTool` 236 KB, `CaesarIdesConfig` 184 KB. Rapier 2,2 MB og Three.js 1,2 MB lastes separat — det er greit, men store rene applikasjonschunks bør splittes.
5. **Tilgjengelighet er svak**: bare 6 av 27 `<img>`-tagger har `alt`. Skole-publikum krever bedre.

---

## 1. Teknisk helse

### Lint
- **ESLint:** 495 problemer — 472 feil, 23 warnings.
- Vanligste mønstre:
  - `@typescript-eslint/no-explicit-any` dominerer (>80 % av feilene).
  - `tina/__generated__/types.ts` står for ~50 feil — auto-generert; bør ekskluderes fra lint.
  - Noen reelle feil: `react-hooks/purity` i quiz-komponent, `@ts-ignore` i `contentLoader.ts:2` (skal være `@ts-expect-error`), `no-useless-escape` i `clientScanner.ts:58`.

### TypeScript
- `tsc -b --noEmit` returnerer **uten utdata** — ingen typefeil. Bra.

### Build
- **Status:** OK. `vite build` ferdig på 25,5 s.
- **Advarsler:** Vite klager på chunks > 500 KB (rapier, three).
- **Største bundles:**
  | Chunk | Råstørrelse | Gzip |
  |---|---|---|
  | `rapier` | 2 237 KB | 830 KB |
  | `three` | 1 185 KB | 344 KB |
  | `VirkemiddelverkstedetPage` | 473 KB | 129 KB |
  | `index` (entry) | 362 KB | 131 KB |
  | `firebase` | 350 KB | 76 KB |
  | `CompositionTool` | 240 KB | 60 KB |
  | `index` (lessonpage) | 229 KB | 59 KB |

Rapier og Three er forventet stor (lazy-lastet fra mini-spill). Det reelle problemet er at to entry-aktige chunks (`index` 362 KB og 229 KB) er store — undersøk hva som havner der utilsiktet.

---

## 2. Arkitektur

### Manifest- og innholdsintegritet
- **319 leksjoner** fordelt slik:
  | Fag | Topics | Lessons |
  |---|---|---|
  | historie | 16 | 113 |
  | krle | 3 | 92 |
  | norsk | 11 | 52 |
  | samfunnskunnskap | 7 | 50 |
  | musikk | 6 | **12** |
- `npm run scan:content` rapporterer "21 ID collisions", men en re-scan av faktisk `content-index.json` viser 0 reelle kollisjoner — meldingen i scriptet ser ut til å logge alle gjentatte IDs (slik som `artikkel.json` brukt som standardnavn på tvers av topics) som forventet. **Anbefaling:** oppdater `generateContentIndex.js` til å skille ekte kollisjoner fra forventet flernivå-deling, og endre meldingen så den ikke vekker uro.
- **musikk** er underutviklet: 6 topics men bare 12 leksjoner totalt. Enten konsolidér topics, eller utvid innhold.

### Komponentgjenbruk
- `ImmersiveCard` brukes i 10 filer, hovedsakelig under `components/demography/`. Mønsteret er sunt der det brukes, men den er ikke tatt i bruk på tvers av hele lærebokens artikler — vurder om dette skal være standard kort-primitiv eller pensjoneres til fordel for inline Tailwind-mønstre.
- **Gud-komponenter** som vokser ut av kontroll:
  - `src/components/chronos/ChronosUI.tsx` — **1 539 linjer**
  - `src/pages/quiz/QuizHost.tsx` — 804 linjer
  - `src/components/content/interactive/TimelineDirector.tsx` — 665 linjer
  - `src/pages/TextReaderPage.tsx` — 652 linjer
  - `src/pages/quiz/QuizPlayer.tsx` — 600 linjer
  - `src/components/ArticleContent.tsx` — 591 linjer
- Disse bør splittes i logiske underkomponenter for vedlikeholdbarhet.

### Statlig kompleksitet
- 993 `useState`-kall og 251 `useEffect`. Dette i seg selv er ikke alarmerende, men understreker at de største komponentene (over) sannsynligvis har lokal state som burde flyttes til Zustand-store eller delkomponenter.

### TODOs / døde kommentarer
- Bare 1 TODO funnet i kildekoden (`GameEngine.ts:745` — migrasjons-TODO). **Det er rent.**

---

## 3. UX / UI

### Light theme-konsistens
- **45 forekomster** av `dark:`-prefiksede Tailwind-klasser i `src/`. CLAUDE.md slår fast at dark mode er klasse-toggla, men prosjektet markedsfører lys-tema som standard. Sjekk om disse `dark:`-klassene faktisk er ønsket — flere kan være etterlatenskap.
- 27 fixed-pixel widths (`w-[npx]`) — hold øye med Chromebook 1366×768.

### Mobil og Chromebook
- 362 responsive Tailwind-prefikser (`sm:`/`md:`/`lg:`/`xl:`) over 247 komponentfiler — relativt sparsom dekning (ca. 1,5 per komponent). Komponenter som mangler responsive-klasser bør prioriteres for visuell sjekk på 1366×768.

### Tilgjengelighet (a11y)
- **Bare 6 av 27 `<img>`-tagger har `alt`-attributt** — det betyr ~78 % av råe img-tagger er utilgjengelige for skjermleser. Hjelpemiddelpolitikk for skoler krever bedre.
- 38 `aria-label`/`role`/`alt` totalt over 247 komponenter — meget lite for en lærebok som skal være universelt utformet.
- Anbefaling: vedta krav om at alle `<img>` skal bruke `<Image>`-wrapperen (som har `alt` påkrevd), og legg ESLint-regelen `jsx-a11y/alt-text` til config.

### Kontroller å verifisere manuelt
- Tastaturnavigasjon i Quiz Battle, mini-spill og læringsstier
- Fokusring på alle interaktive komponenter
- Kontrast på `text-muted` / glassmorfisme — særlig sårbart i light mode
- Lesbarhet av artikler i 1366×768

---

## 4. Innhold

### Manglende bilder (51 totalt)
- **Hovedmønster:** eksterne `images.unsplash.com` URL-er som ikke lenger svarer (eller URL-format er endret). Berørte områder:
  - Hele `norsk/ordklasser/*` (substantiv, verb, adjektiv, adverb, pronomen, preposisjoner, konjunksjoner)
  - Hele `norsk/tekstsjangre/*` (artikkel, debattinnlegg, dikt, eventyr, kommentar, novelle, roman)
  - Mesteparten av `norsk/skrivehjelp/*`
  - Flere `norsk/litteraturhistorie/*`
  - Enkelte historie-leksjoner (perserriket, romerriket/romerske-guder, klimakrisen-536, eic, demo-artikkel)
- **Lokale stier som er brutt:**
  - `historie/dekolonisering/apartheid-syd-afrika.json` → `apartheid-syd-afrika.webp`
  - `historie/dekolonisering/israel-palestina-muren.json`
  - `historie/dekolonisering/jim-crow-lovene.json`
  - `historie/den-kalde-krigen/korea-dmz.json`
  - `historie/vikingtiden/samfunn-og-rett.json` → `tinget.png`
  - `krle/filosofi/hume.json` → `hume-hero.png`
  - `norsk/analyse/analyse-kommentar.json` → `analyse-kommentar.jpg`
  - `norsk/skrivehjelp/hvordan-lage-kortfilm.json` → `kortfilm-hero.webp`
  - `people/franz-ferdinand.json`, `gavrilo-princip.json`, `genghis-khan.json`
- **395 JSON-filer mangler `image`/`heroImage` helt** — kan være helt OK for hjelpe-tekster, men bør verifiseres mot artikler i `rich`-layout.

### Bilde-format
- **374 PNG/JPG vs 201 WebP** i `public/images/`. Det betyr 65 % uoptimaliserte bilder.
- Mest tunge: hele `public/images/romerriket/` (mange .png > 500 KB).
- `scripts/optimize-images.js` finnes — men er ikke kjørt konsekvent.

### Strukturelle observasjoner
- **Musikk-faget er tynt**: 6 topics for 12 leksjoner gir 2 leksjoner per topic i snitt. Vurder konsolidering.
- **Krle**: 3 topics dekker 92 leksjoner — konsentrert og dypt, men topp-nivå-kategoriseringen kan virke flat.
- **Historie**: 16 topics × 113 leksjoner — godt fordelt.

---

## 5. Ytelse

### Bundle
- Total `dist/` = 533 MB (hovedsakelig kopierte content-bilder).
- Største JS-chunk uten klar grunn: `index` 362 KB. Mistanke: noe som burde være lazy-lastet havner i hovedchunken (kanskje `ComponentRegistry.tsx`s direkte importer).
- `VirkemiddelverkstedetPage` 467 KB er én side. Den er stor pga. mange interaktive komponenter — bør splittes via `React.lazy()` for hver underseksjon.

### Lazy-loading
- Mini-spillene (Three + Rapier) er korrekt lazy. Bra.
- TanStack Query 5 er på plass; sjekk at artikler bruker stale-while-revalidate i stedet for å re-fetche.

### Mulige raske gevinster
1. Konvertér resterende 374 PNG/JPG → WebP via `scripts/optimize-images.js`.
2. Erstatt manglende eksterne Unsplash-URL-er med lokale optimaliserte bilder.
3. Splitt store sider (VirkemiddelverkstedetPage, CompositionTool).
4. Legg til `{ images: { fastify: true } }` eller bruk `vite-plugin-image-optimizer` i build.

---

## 6. Prioritert handlingsplan

### P0 — Mestpåvirkende, lavt arbeid (denne uken)
1. **Erstatt manglende bilder.** Generer/last ned 51 hero-bilder (15 lokale + 36 eksterne) og legg dem under `public/images/`. Oppdater JSON-stier.
2. **Slå av lint-støy fra auto-generert kode.** Legg `tina/__generated__/**` i `.eslintignore`. Det fjerner ~200 av 472 feil.
3. **Fiks `@ts-ignore` → `@ts-expect-error` i `contentLoader.ts:2`.**
4. **Kjør `scripts/optimize-images.js`** på alle png/jpg under `public/images/romerriket/` (og deretter resten). Bør barbere 50–100 MB.

### P1 — Kvalitet (neste 2 uker)
5. **A11y-pass på `<img>`-tagger.** Erstatt med `<Image>` wrapper, legg til alt-tekst, aktivér `jsx-a11y/alt-text` ESLint-regel.
6. **Type-styrking.** Erstatt `any` i `types.ts`, `contentLoader.ts`, `clientScanner.ts`, `presentationUtils.ts` med konkrete typer.
7. **Splitt VirkemiddelverkstedetPage** i lazy-lastede underdeler.
8. **Audit `dark:`-klasser** — fjern dem som er etterlatt fra tidligere dark-mode-eksperiment.

### P2 — Arkitektur (kommende måned)
9. **Refaktor ChronosUI.tsx** (1 539 linjer) — splitt i panel-komponenter med egne stores.
10. **Refaktor QuizHost / QuizPlayer / TextReaderPage / ArticleContent** — alle > 500 linjer.
11. **Fix scan:content-melding** så "21 ID collisions" ikke skremmer fremtidige bidragsytere når kollisjonene egentlig er forventet.
12. **Konsolider musikk-topics** eller utvid innhold — 2 leksjoner per topic er for tynt.

### P3 — Oppleves som "mer polish"
13. Vurdér en Lighthouse-CI-sjekk i CI-pipeline (a11y, performance, SEO).
14. Legg til responsive smoke-tests på 1366×768 i Playwright.
15. Vurder å splitte `index.js` hovedchunk med eksplisitt manualChunks.

---

## 7. Hva som faktisk er bra

For å være rettferdig — disse tingene står sterkt:
- **TypeScript-streng modus** med 0 typefeil.
- Bare **1 TODO** i hele kildekoden — uvanlig disiplinert.
- Manifest-arkitektur (Subjects → Topics → Lessons) er ren og gjør innhold lett å skalere.
- Lazy-lastet routing med eksplisitt `routes.ts` er industristandard.
- Mini-spillmotor (Three + Rapier) korrekt lazy — har ikke spilt noen rolle for første-paint.
- Innholdsdomenet ditt er imponerende: 319 leksjoner i 5 fag, med læringsstier og interaktive komponenter på toppen.

---

*Rapporten er generert automatisk ved kjøring av lint, typecheck, build, content-scan og statisk søk over kodebasen. Den krever menneskelig vurdering før alle tiltak settes i verk — særlig P2-refaktorer.*
