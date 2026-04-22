# Mini-spill Game Engine — Oppgradering til stilisert semi-realisme + full refaktor

## Kontekst

Mini-spill-motoren i `src/games/engine/` har allerede et solid grunnlag: raw Three.js, MeshStandardMaterial med ACES tone mapping, SpotLights med shader-baserte lyskjegler, partikler, ocean/rom/karakter/lys-byggere, dialog/puzzle/monolog/faser/flagg, pause og debug-HUD. Eksisterende spill: Watt Lab (ett-rom-puzzle) og Lindisfarne 793 (fler-fase utendørs).

Ambisjonen er **10+ historiske mini-spill** det neste året, alle arketyper (fortellende, utforskende, puzzle). Tre smertepunkter driver oppgraderingen:

1. **Statisk verden** — NPCer står stille, vegetasjon vaier ikke, ingen dyr/fugler/vær, lite liv
2. **Manuelle kollisjonsbokser** — AABB2D må regnes for hånd per objekt, lett å glemme, lett å bomme
3. **Rigid kamera + flat dialog-UI** — én kameramodus, ingen cinematic cuts, ingen typewriter/choice-polish

Målstil: **stilisert semi-realisme** — pusset, pedagogisk troverdig, ikke toon og ikke maleri. 30 fps akseptabelt på Chromebook for å gi plass til kvalitet. Full refaktor — alle eksisterende spill migreres. Lyd utsettes til egen runde.

## Leveranser (i prioritert rekkefølge)

### Fase 1 — Visuell oppgradering (først)

**Nye systemer:**
- `engine/systems/PostProcessingSystem.ts` — EffectComposer-pipeline med kvalitetstier (`low` | `medium` | `high`). High: SSAO, DOF, motion blur, godrays, vignette, color grading. Low: bare tone mapping + bloom. Auto-detekterer GPU og plukker tier; overstyrbar.
- `engine/systems/SkySystem.ts` — prosedyral himmel (Sky shader fra three/examples eller egen) med sol-posisjon koblet til TimeOfDay. Volumetriske skyer via billig plane-card-teknikk.
- `engine/systems/TimeOfDaySystem.ts` — eksponerer `timeOfDay: 0-1` som driver sollys-retning/farge, ambient-farge, sky-tint, godray-intensitet.
- `engine/systems/WeatherSystem.ts` — regn, tåke, snø. Partikkel-basert regn + volumetrisk fog override. Per-fase-styrt via `engine.setWeather({type, intensity})`.
- `engine/systems/VegetationSystem.ts` — InstancedMesh for gress/siv/løv, vind-shader (sin-bølge i vertex-shader med tid og vindretning). Instanced trær med wind-sway på løvverk-mesh.

**Materialoppgradering:**
- Skygger: flytt til soft PCF med høy-res shadow map på `high`, medium på middel, ingen på lav.
- Subtile environment-refleksjoner via `PMREMGenerator` på en skyboks, delt per-spill.
- Revidere `toonMat`-hjelperen til å heller være `sceneMat(color, opts)` som tar roughness/metalness-presets for vanlige materialer (stein, tre, stoff, metall).

**GameConfig-utvidelse:**
```ts
visual?: {
    postProcessing?: 'auto' | 'low' | 'medium' | 'high';
    timeOfDay?: number;           // 0-1
    weather?: { type: 'clear'|'rain'|'fog'|'snow'; intensity: number };
    colorGrading?: 'warm'|'cold'|'sepia'|'neutral'|'dawn'|'dusk';
    sky?: 'procedural'|'solid'|'none';
}
```

**Kritiske filer som endres:**
- `src/games/engine/GameEngine.ts` — integrer EffectComposer, fjern direkte `renderer.render`; driv TimeOfDay/Weather i hovedloopen
- `src/games/engine/types.ts` — nye felt i `GameConfig`
- `src/games/engine/WorldBuilder.ts` — bruk SkySystem i stedet for solid background
- `src/games/engine/builders/SeascapeBuilder.ts` — koble til SkySystem og TimeOfDay
- `src/games/engine/LightBuilder.ts` — shadow-kvalitet knyttet til tier

### Fase 2 — Kamera + dialog-polish

**Nye systemer:**
- `engine/systems/CameraDirector.ts` — stakk av kameratilstander. `playCinematic(shots[])` kjører timeline med lerp/ease mellom camera+target-par. `pushDialogFraming(speakerId)` zoomer inn på taler med lett DOF; `pop()` returnerer. Cuts kan trigges fra fase-overganger, dialog-noder, monolog-noder, eller manuelt i `setupScene`.
- Utvidelse av `DialogBox.tsx`:
  - Typewriter (per-tegn reveal, ~30ms/tegn, hopp over med klikk/space)
  - Valg-presentasjon: ikoner per choice, hover-preview av konsekvens (valgfri metadata)
  - Emotion-knyttet farge-tint i ramme
- `engine/components/ChoiceButton.tsx` — ny, presenterer valg med ikon + beskrivelse

**GameConfig-utvidelse:**
```ts
cinematics?: Record<string, CinematicShot[]>;
intro?: { type: 'cut'|'pan'|'fade-title-3d'|'none'; shots?: CinematicShot[] };
```
`DialogNode` får `cameraFraming?: 'speaker'|'wide'|'custom'` og choices får `icon?: string; consequenceHint?: string`.

**Kritiske filer som endres:**
- `src/games/engine/GameEngine.ts` — eksponere `engine.playCinematic`, `engine.setCameraFraming`
- `src/games/engine/components/DialogBox.tsx` — typewriter + ny choice-layout
- `src/games/engine/types.ts` — `CinematicShot`, `DialogChoice` utvidelser

### Fase 3 — Levende verden

**Nye systemer:**
- `engine/systems/AIDirector.ts` — waypoint-vandring for NPCer. `engine.assignRoute(characterId, waypoints[], options)`. Støtter `loop|pingpong|once`, pauser ved dialog/monolog, kan ha "jobbe"-animasjon ved waypoint (sag, reparere, bære).
- `engine/systems/FaunaSystem.ts` — billig ambient-life. Fugle-flokker (boids-light med 10-30 instanced fugler), fisk (vert-shader-synkroniserte), sommerfugler (random bob). Alle som InstancedMesh.
- Utvidelse av `ParticleSystem.ts` — legg til løv/fall-blader, snø, gnistregn.
- `CharacterBuilder.ts` — enkle gang-animasjoner (bob + svingende armer) drevet av fart; idle breathe.

**GameConfig-utvidelse:**
```ts
fauna?: { birds?: {count: number; region: AABB2D}[]; fish?: {...}; butterflies?: {...} };
npcRoutes?: { characterId: string; waypoints: [x,z][]; mode: 'loop'|'pingpong'|'once' }[];
```

**Kritiske filer som endres:**
- `src/games/engine/GameEngine.ts` — driv AI og fauna i hovedloopen
- `src/games/engine/CharacterBuilder.ts` — walk-cycle-animasjon
- `src/games/engine/ParticleSystem.ts` — nye partikkel-typer

### Fase 4 — Fysikk (Rapier)

**Nye systemer:**
- `engine/systems/PhysicsWorld.ts` — wrapper over `@dimforge/rapier3d-compat`. Initialisert lazily (WebAssembly) per spill. Autogenerer colliders fra scenen: alle `Object3D` med `userData.solid = true` blir statiske (triangle mesh eller cuboid basert på userData-hint). Spilleren blir kinematic character controller.
- Utvidelse av `PlayerMode`: hopping (`SPACE`), klatring på markerte ladders, fallskade (valgfri), push på dynamic bodies.
- `engine/systems/VehicleSystem.ts` — båt (flyter på OceanSystem med bølge-responsive transform), hest (arcade-fysikk), vogn (akselerasjon + sving).
- `engine/systems/InteractableSystem.ts` — pickup/drop/throw for dynamic bodies med E-knapp. Kobler til puzzle-callbacks ("dropp sten på vippe").

**Migrasjon:**
- AABB2D-kollisjon fjernes fra `scene.userData.collisionBoxes` — erstattes av `userData.solid`-flagg på eksisterende meshes.
- Watt Lab og Lindisfarne portes: setupScene oppdateres til å merke solid-objekter i stedet for å pushe AABB2D.

**GameConfig-utvidelse:**
```ts
physics?: {
    enabled: boolean;
    gravity?: number;               // default -20
    playerJump?: boolean;
    playerFallDamage?: boolean;
}
```

**Kritiske filer som endres:**
- `src/games/engine/GameEngine.ts` — erstatt AABB-kollisjons-loop med Rapier-step
- `src/games/engine/types.ts` — fjern `AABB2D` fra offentlig API, legg til `PhysicsConfig`
- `src/games/engine/CharacterBuilder.ts` — capsule-collider per karakter
- `src/games/watt-lab/WattLabAssets.ts` — port til `userData.solid`
- `src/games/lindisfarne-793/LindisfarneAssets.ts` — port
- `package.json` — legg til `@dimforge/rapier3d-compat`
- `.agent/workflows/BUILD_GAME_GUIDE.md` — skriv om kollisjons-seksjonen

### Fase 5 — Intro-system + QoL

- `engine/components/IntroRunner.ts` — bruker CameraDirector til å spille `config.intro` før spiller får kontroll. Fade/title/pan per GameConfig-valg.
- `engine/components/GameHUD.tsx` — "skip intro"-knapp, kvalitet-bytter (low/medium/high), debug-flagg som viser physics-colliders og AI-waypoints i debug-modus.

## Arkitektur-prinsipper

- **Alle nye systemer er opt-in via GameConfig**, men sensible defaults er slått PÅ (full refaktor). Hvert system kan skrus AV i config.
- **System-lifecycle**: alle nye systemer følger samme mønster — konstruktør mottar `GameEngineRef`, har `update(dt)`, `dispose()`. GameEngine holder en liste og kaller dem i rekkefølge.
- **Tier-bevissthet**: hvert tungt system leser kvalitetstier og velger billig/dyr variant. Vegetasjon-instanser, partikkel-antall, shadow-res, post-effekter.
- **Determinisme for puzzles**: fysikk-puzzles må ha stabil resultat — bruk fixed timestep (1/60) med accumulator.

## Verifisering

**Per-fase verifisering (kjør etter hver fase):**
1. `npm run dev` og last `/oving/spill/watt-lab` og `/oving/spill/lindisfarne-793`. Sammenlign visuelt mot pre-refaktor-screenshots.
2. Kjør på Chromebook-emulering (DevTools → Throttling: 4x CPU slowdown) og verifiser at `low`-tier holder 30 fps.
3. `npm run build` — verifiser at bundle-split fortsatt holder `three`-chunken adskilt, og at ny Rapier-WASM lazy-lastes.
4. `npm run lint` og `tsc --noEmit` — ingen nye feil.

**Fase-spesifikk:**
- Fase 1: Last hver eksisterende scene, sjekk at sky/tod/weather fungerer via `engine.setTimeOfDay(0.3)` i konsollen. Verifiser SSAO/DOF er synlig på `high`, av på `low`.
- Fase 2: Trigg dialog — kameraet skal zoome på taler, teksten skal typewritte. Kjør `engine.playCinematic([...])` fra et fase-shift.
- Fase 3: Legg til `assignRoute` på en NPC i Lindisfarne — verifiser at den vandrer. Sjekk at 30 fugler + 20 fisk ikke dropper under 45 fps på `medium`.
- Fase 4: Hopp i Watt Lab (ingen sjø — sikkert). Plukk opp et collectible med E, kast det. I Lindisfarne: ror båten med fysikk-følelse, land på strand uten glitches.
- Fase 5: Start Lindisfarne — verifiser cinematic intro spiller og kan hoppes over.

## Relaterte filer (oversikt)

**Endres:**
- `src/games/engine/GameEngine.ts` (hoved-orkestrator)
- `src/games/engine/types.ts` (API-utvidelser)
- `src/games/engine/WorldBuilder.ts`, `LightBuilder.ts`, `CharacterBuilder.ts`, `ParticleSystem.ts`
- `src/games/engine/components/DialogBox.tsx`, `GameCanvas.tsx`, `GameHUD.tsx`
- `src/games/engine/builders/*` (BeachBuilder, CloisterBuilder, SeascapeBuilder)
- `src/games/watt-lab/WattLabAssets.ts`, `src/games/lindisfarne-793/LindisfarneAssets.ts`
- `.agent/workflows/BUILD_GAME_GUIDE.md`
- `package.json`

**Nye filer:**
- `src/games/engine/systems/PostProcessingSystem.ts`
- `src/games/engine/systems/SkySystem.ts`
- `src/games/engine/systems/TimeOfDaySystem.ts`
- `src/games/engine/systems/WeatherSystem.ts`
- `src/games/engine/systems/VegetationSystem.ts`
- `src/games/engine/systems/CameraDirector.ts`
- `src/games/engine/systems/AIDirector.ts`
- `src/games/engine/systems/FaunaSystem.ts`
- `src/games/engine/systems/PhysicsWorld.ts`
- `src/games/engine/systems/VehicleSystem.ts`
- `src/games/engine/systems/InteractableSystem.ts`
- `src/games/engine/components/ChoiceButton.tsx`
- `src/games/engine/components/IntroRunner.ts`

## Ute av scope

- Lyd/musikk/stemmer (egen runde senere)
- Scene-editor med visuell redigering
- Multiplayer
- Savegame/progresjonslagring
- Mobilkontroller (berørings-joystick)
- AI-generert stemmeskuespill
