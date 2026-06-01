---
description: Lag et rikt, direkte-interaktivt 3D-mikrospill som kjører inline i en artikkel eller læringssti. Bruk dette når spillet skal bo MIDT i innholdet (ikke fullskjerm), bygd på interaksjons-toolkitet i src/components/microgames/kit/.
---

# Skill: Build Micro-Game

Bruk denne skillet når du skal lage et **mikrospill** - et lett, selvstendig 3D-spill som kjører
**inline** i en artikkel eller et læringsstisteg. Et mikrospill er en kort, romlig "aha"-opplevelse
på 1-3 minutter der eleven **interagerer direkte med en 3D-verden**: klikker objekter, drar dem på
plass, justerer en spak, og ser verdenen forvandle seg.

---

## Mikrospill vs. den tunge 3D-motoren - velg riktig spor

| | Mikrospill (dette sporet) | Full 3D-motor (`src/games/engine/`) |
|---|---|---|
| **Bor** | Inline i artikkel/sti | Egen rute `/oving/spill/:id` |
| **Stack** | React + R3F (`@react-three/fiber` + `drei`) + toolkit | Rå Three.js + Rapier3D WASM |
| **Vekt** | Lett, lazy-lastet, Chromebook-vennlig | Tung (~1 MB WASM), fullskjerm, pointer-lock |
| **Lengde** | 1-3 min | 10-20 min |
| **Guide** | Denne fila | `.agent/workflows/BUILD_GAME_GUIDE.md` |

Skal spillet ligge midt i en artikkel? → mikrospill. Skal det være en egen verden å gå rundt i? →
full motor. **Embed aldri den tunge motoren i en artikkel.**

---

## Kjernefilosofi: rik, direkte interaksjon - ikke bare knapper

Et mikrospill er en **levende 3D-verden eleven manipulerer**, ikke et bilde med tre knapper ved
siden av. De tidligste mikrospillene var alle samme tynne form ("trykk tre knapper etter
hverandre"). Det er ÉN gyldig byggekloss, men ikke målet. Sikt høyere:

- **La eleven ta i verdenen.** Klikk objekter direkte, dra ting på plass, juster en spak og se
  konsekvensen i sanntid. Toolkitet (`src/components/microgames/kit/`) gjør dette trivielt og
  Chromebook-trygt - bruk det.
- **Bygg en verden, ikke en modell.** Lag-på-lag prosedyrale mesher: terreng, hus, figurer,
  kjøretøy, vann, røyk. Lavpoly og billig - men en scene, ikke ett objekt. `kit/scene-parts`
  har ferdige deler (`Building`, `Figure`, `Tree`, `WaterPlane`, `Smoke`, `GroundPlane`).
- **La eleven endre tilstanden, og animer konsekvensen.** Den sterkeste mekanikken: et grep → en
  synlig forvandling → en aha. Driv scenen av enkel tilstand (`useStage` eller en slider-verdi) og
  la hvert delobjekt dempe (`damp`) mykt mot mål utledet av tilstanden.
- **Sikt mot lyspæra i selve interaksjonen.** Mekanikken ER pedagogikken. I flaggskipet
  `VikingShip3D` bygger eleven skipet selv - klinker bordganger, reiser masten, og morfer skroget
  mellom langskip og knarr - og kjenner dermed på kroppen hvorfor klinkbygging + kjøl gjorde det
  samme håndverket til både krigsskip og handelsskip.

### Knapper og 3D-klikk utelukker ikke hverandre

Direkte 3D-interaksjon er nå førsteklasses og **oppmuntres**. Men kombiner gjerne: en
`SceneSlider`/`ChoiceRow` under vinduet sammen med klikkbare objekter og drag i scenen. Bruk det som
passer læringsmålet. Den gamle regelen "unngå 3D-klikk, bruk bare knapper" gjelder ikke lenger -
toolkitet løser trackpad-problemet (se under).

---

## Interaksjons-toolkitet (`src/components/microgames/kit/`)

Importer alt fra `./kit`. Dette er den autoritative verktøykassa - bygg nye spill på den.

### Oppsett & layout
- **`MicroGameScaffold`** - standardoppsettet: lys ramme + 3D-vindu i FULL bredde + kontroller UNDER
  vinduet (aldri oppå scenen). Gir den polerte layouten gratis.
  ```tsx
  <MicroGameScaffold
      title="Bygg vikingskipet" subtitle="..." estimatedSeconds={160} onRetry={reset}
      scene={<MyScene stage={stage} />}
      canvas={{ idle: stage === 0, camera: { position: [9,7,11], fov: 40 }, background: '#bfe0f2' }}
      overlays={<><SceneBanner message={banner} /><SceneBadge>{era}</SceneBadge></>}
  >
      <ChoiceRow items={...} onSelect={...} />   {/* kontroller under vinduet */}
  </MicroGameScaffold>
  ```
- **`MicroCanvas`** - standardisert R3F-Canvas (lys, skygger, fog, OrbitControls-preset). Håndhever
  delt visuell look (ingen LUT). Bruk via scaffold, eller direkte hvis du trenger egen layout.

### Direkte 3D-interaksjon (kjernen i "rik interaksjon")
- **`Interactive`** - gjør ethvert 3D-objekt klikkbart med innebygd juice (pekefinger, scale-spring,
  valgfri forstørret klikkflate `hitArea` for trygg trackpad-treffing). Render-prop gir deg
  tilstanden så du kan farge mesh-ene:
  ```tsx
  <Interactive onSelect={pick} state={chosen ? 'correct' : 'idle'} hitArea={[1.5,1.5,1.5]}>
      {(s) => <mesh><boxGeometry/><meshStandardMaterial color={s==='hover'?'#fbbf24':'#888'} /></mesh>}
  </Interactive>
  ```
- **`Hotspot`** - flytende, kamera-vendt klikkmarkør i 3D-rom. Stor tap-target + pulse + valgfri
  etikett. Bruk for "klikk her"-punkter uten at eleven må treffe en liten mesh presist.
  ```tsx
  <Hotspot position={[0,1.3,0]} onSelect={addPlank} label="Klink bordgangen" />
  ```
- **`Draggable`** - dra et objekt langs bakkeplanet (generøs trackpad-toleranse, valgfri
  `snap`/`bounds`, skrur av kamerarotasjon under draget). Gi draggable-objekter en **romslig usynlig
  gripeflate** (et `meshBasicMaterial transparent opacity={0}`-barn) så de er lette å ta tak i.
  ```tsx
  <Draggable position={[-5,0,4]} bounds={{minX:-7,maxX:4}} snap={1} onDrop={(p)=>place(p)}>
      <mesh><boxGeometry args={[1.4,1.2,8]} /><meshBasicMaterial transparent opacity={0} /></mesh>
      <KeelLog />
  </Draggable>
  ```

### Input-widgets under vinduet
- **`ChoiceRow`** - vannrett rad med valgkort (done/active/locked). **`StepTracker`** - "Steg X av N".
- **`SceneSlider`** - kontinuerlig spak som styrer scene-tilstand i sanntid (vannstand, år, bredde).
  Helt annen interaksjon enn diskrete knapper - bruk den for "morf og se".
- **`ToolPalette`** - velg verktøy, klikk så i 3D for å bruke det (plassere, rive).

### Output-overlegg (oppå scenen, `overlays`-slot)
- **`SceneBanner`** (transient toppmelding), **`SceneBadge`** (hjørne-etikett), **`DragHint`**
  (idle-hint), **`SceneFact`** (faktakort under), **`WinScreen`** (trofé + reset/gå-videre).

### Hjelpere
- **`damp(cur, target, dt, speed)`** / **`dampV3`** - myk demping mot mål i `useFrame`. Fundamentet
  for animasjon uten fysikk.
- **`useStage(total)`** - liten fler-stegs tilstandsmaskin (`stage`, `advance`, `reset`, `atEnd`).

---

## Design Law (arves fra interaktive komponenter)

- **Lys stil alltid.** `MicroGameScaffold`/`MicroGameFrame` gir amber/lys ramme. Ingen mørk base.
- **Én pedagogisk kjerne.** Definer lyspære-øyeblikket før du koder. Én ting eleven skal forstå.
- **Fem-sekunders-regelen.** Eleven vet hva de skal gjøre innen 5 sek. Ingen velkomstmodal. Bruk
  `DragHint` og en `SceneBanner` til å lose dem i gang.
- **Juicy feedback.** Umiddelbar respons på hvert grep (`Interactive`/`Hotspot` gir det gratis),
  myke `damp`-overganger, spring-finale (`WinScreen`), reset alltid tilgjengelig (`onRetry`).
- **Rik, men lesbar interaksjon.** Sikt mot flere måter å ta i verdenen på (klikk + dra + spak +
  fler-stegs), men hold hver enkelt åpenbar. Mekanikken skal være læringsmålet, ikke pynt.
- **Norsk for en 14-åring.** Korte setninger. Riktige tegn (å, ø, æ). Ingen em-dash/tankestrek.
- **Unik mekanikk.** Ikke kopier et eksisterende spills mekanikk; bygg en ny, tilpasset læringsmålet.
- **Chromebook-først (~1366×768).** Toolkitet løser trackpad-utfordringen: `Hotspot` gir store mål,
  `Interactive`/`Draggable` har generøse klikk-/gripeflater og hover-cursor. Du kan derfor trygt
  bruke direkte 3D-interaksjon - men gi alltid store nok mål, og vurder en knapp/slider under vinduet
  som alternativ vei der det passer.

---

## Slik bygger du ett

1. **Opprett spillet:** `src/components/microgames/<Navn>.tsx`.
   - Default-eksporter en komponent som tar `MicroGameProps` (`{ onComplete, onRetry?, ... }` fra
     `./types`).
   - Bygg scenen på toolkitet: `MicroGameScaffold` + `scene`-tre med `Interactive`/`Hotspot`/
     `Draggable` og `kit/scene-parts`, kontroller under vinduet.
   - Kall `onComplete({ score, completed: true, artifact? })` når spillet er vunnet.
   - Lyd via `useStepSounds()` (`play('correct' | 'advance' | 'complete' | 'drop' | 'pick' | ...)`).

2. **Registrer i registeret** (EKSAKT - dette er det som hindrer "fant ikke spillet"-feil):
   I `src/components/microgames/registry.ts`:
   - Legg til `const <Navn> = lazy(() => import('./<Navn>'));` øverst.
   - Legg en entry i `MICRO_GAMES` med en **kebab-case `id`** (f.eks. `'vikingskip-3d'`), `title`,
     `description`, `estimatedSeconds`, `loader: () => import('./<Navn>')`, og
     `Component: <Navn> as never`. `id`-en er det `gameId` du bruker i innholdet.

3. **Bruk i innhold** - to veier, samme registry, samme `id`:
   - **I en artikkel** (via `ComponentRegistry` → `MicroGameBlock`):
     ```json
     { "type": "component", "name": "MicroGame", "props": { "gameId": "<id>" } }
     ```
   - **I et læringssti-steg** (via `MicroGameStep`):
     ```json
     { "type": "microgame", "microGameId": "<id>", "microGameProps": { } }
     ```

Ingen endring i `ComponentRegistry.tsx` trengs per spill - broen `MicroGame` slår opp `gameId` i
registeret. Du registrerer kun i `registry.ts`.

---

## Sjekkliste før du er ferdig

- [ ] Bygd på `kit/` (`MicroGameScaffold` + minst én direkte 3D-interaksjon: `Interactive`/`Hotspot`/`Draggable`)
- [ ] Lys ramme, 3D-vindu i full bredde, kontroller under vinduet (ikke oppå scenen)
- [ ] Lyspære-øyeblikket er tydelig og oppnådd; mekanikken ER pedagogikken
- [ ] Rik interaksjon - ikke bare en knapperad. Eleven tar i verdenen.
- [ ] Chromebook-trygt: store nok klikk-/gripeflater (`hitArea`, romslig usynlig gripeboks på draggables)
- [ ] Juicy: umiddelbar respons, myke `damp`-overganger, spring-finale (`WinScreen`), reset (`onRetry`)
- [ ] `onComplete` kalles ved seier
- [ ] Lazy-registrert i `MICRO_GAMES` med kebab-case `id` = `gameId` i innholdet
- [ ] Norsk for 14-åring, riktige tegn, ingen em-dash
- [ ] Testet inline i en ekte artikkel på ~1366×768 (hele flyten gjennomspilt)
- [ ] `npx tsc -b` + `npm run lint` rent

**Referanse-standard:**
- `src/components/microgames/VikingShip3D.tsx` - **flaggskipet**. Viser hele bredden av toolkitet:
  `Draggable` (dra kjølen på plass), `Hotspot` (klink bordgangene, reis masten), `SceneSlider` (morf
  langskip ↔ knarr), fler-stegs forvandling, sjøsetting + `WinScreen`. Bruk denne som mal for et
  rikt, direkte-interaktivt byggespill.
- `src/components/microgames/Hamskiftet3D.tsx` - **stage-drevet scenespill**: en levende bygd som
  forvandles gjennom tre reformer (knapp-input via `ChoiceRow`-mønsteret, 3D som skuespill). God mal
  når kjernen er "valg → forvandling".
- `TheodosianWalls3D.tsx` / `Colosseum3D.tsx` - enklere "inspiser objektet"-form, fortsatt gyldig for
  små romlige aha-er (eldre kode, ikke bygd på `kit/` enda).
