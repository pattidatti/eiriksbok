# Motor-Update: Fullstendig Plan for Oppgradering av GameEngine

**Status**: Fase 1-4 ferdig (2026-04-23). Fase 5-6 gjenstår.
**Opprettet**: 2026-04-22
**Mål**: Løfte motoren fra "funksjonell showroom" til "produksjonsklar mini-spillmotor" som kan bære ekte narrative spill.

---

## Leveranse Fase 1 (2026-04-23)

Alle seks sub-oppgaver er implementert og bygger rent (tsc + eslint + vite build).

| Oppgave | Status | Filer endret |
|---|---|---|
| 1.1 Shared material cache | ✅ | `SceneMat.ts` (cache + `createToonLikeMat`), `GameEngine.ts` (toonMat) |
| 1.2 Bloom + exposure-knotter | ✅ | `types.ts` (PostProcessingConfig, union), `PostProcessingSystem.ts`, `GameEngine.ts` (extractPostProcessing) |
| 1.3 Fog density-kurve | ✅ | `types.ts` (FogDensityCurve), `TimeOfDaySystem.ts` (attachScene + lerp), `WeatherSystem.ts` (setFogActive bridge) |
| 1.4 SMAA for high-tier | ✅ | `PostProcessingSystem.ts` (egen setupHigh med SMAAPass) |
| 1.5 LUT-infra | ✅ | `shaders/LutShader.ts` (identity 32³), `PostProcessingSystem.ts` (maybeAddLutPass + setLut), `types.ts` (GameEngineRef.setLut) |
| 1.6 Debug-HUD (F3) | ✅ | `systems/DebugHudSystem.ts`, `components/DebugHud.tsx`, `GameCanvas.tsx` (F3-toggle), `PhysicsWorld.ts` (getBodyCount) |

**Nye public API-er:**
- `engine.setBloom({ strength, threshold, radius })` — objekt-form støtter nå threshold/radius
- `engine.setLut(name: string | null)` — bytt LUT-preset i runtime
- `engine.getDebugStats()` — les F3-HUD-stats fra React
- `GameConfig.visual.postProcessing` støtter både streng (gammelt) og objekt (nytt)
- `GameConfig.visual.fogDensityCurve` — fog-tetthet per tid-på-dagen

**Bakoverkompatibilitet bevart**: Watt Lab, Lindisfarne og Ford Factory kjører uten config-endringer.

**Demo-world** bruker nå alle nye knotter: bloom.strength 0.4, exposure 1.65, lut 'neutral', og kvinelig fog-kurve (tykkere dawn/dusk).

---

## Leveranse Fase 2 (2026-04-23)

Alle fem sub-oppgaver implementert og bygger rent. Alt er opt-in og high-tier-gated slik at Chromebook-baseline bevares.

| Oppgave | Status | Filer |
|---|---|---|
| 2.1 Normal maps + PBR-texturing | ✅ | `types.ts` (SceneMatOpts utvidet), `SceneMat.ts`, `TextureManager.ts` (prosedyrale normal/roughness/AO), `GameEngine.ts` (getTexture) |
| 2.2 SSAO-pass | ✅ | `types.ts` (ssao-config), `PostProcessingSystem.ts` (maybeAddSsaoPass + setupHigh integration) |
| 2.3 Cascaded Shadow Maps | ✅ | `systems/ShadowSystem.ts` (CSM-wrapper), `GameEngine.ts` (init/dispose/update) |
| 2.4 IBL fra SkySystem | ✅ | `systems/SkySystem.ts` (PMREMGenerator + envMap), `GameEngine.ts` (enableIbl) |
| 2.5 Volumetrisk lys (god rays) | ✅ | `shaders/GodRaysShader.ts`, `PostProcessingSystem.ts` (maybeAddGodRaysPass + updateGodRays), `GameEngine.ts` (sun-NDC projeksjon) |

**Nye public API-er:**
- `engine.getTexture(preset, kind)` — runtime prosedyral normal/roughness/AO
- `GameConfig.visual.shadows: 'standard' | 'cascaded'` — opt-in CSM
- `GameConfig.visual.volumetricLight: boolean` — opt-in god rays
- `PostProcessingConfig.ssao: { enabled, kernelRadius, minDistance, maxDistance }`
- `SceneMatOpts.normalMap/roughnessMap/metalnessMap/aoMap/mapRepeat`

**Gating:**
- SSAO: kun når `ssao.enabled=true`, påvirker alle tiers men tyngst på high
- CSM: kun når `shadows='cascaded'` + `world.preset='open'` + `tier='high'`
- IBL: automatisk når `sky='procedural'` + `tier='high'`
- God rays: kun når `volumetricLight=true` + `world.preset='open'` + `tier='high'`

**Bakoverkompatibilitet**: Watt Lab, Lindisfarne og Ford Factory kjører uten config-endringer. TypeScript + ESLint + Vite build passerer rent.

---

## Leveranse Fase 3 (2026-04-23)

Alle fem sub-oppgaver implementert og bygger rent. Fase 3 gjør motoren *levende* — lyd, fotomodus, og input-abstraksjon.

| Oppgave | Status | Filer |
|---|---|---|
| 3.1 AudioSystem | ✅ | `systems/AudioSystem.ts` (Web Audio API, PannerNode for 3D), `GameEngine.ts` (listener-update per frame, audio-trigger-evaluering på onStart/flag/phase) |
| 3.2 Dynamisk musikk | ✅ | `systems/AudioSystem.ts` (addMusicLayer, setMusicLayer med crossfade), `types.ts` (GameEngineRef) |
| 3.3 Fotomodus (P) | ✅ | `systems/PhotoModeSystem.ts`, `components/PhotoModeUI.tsx` (slider for exposure, LUT-dropdown, screenshot), `GameCanvas.tsx` (P-tast), `GameEngine.ts` (togglePhotoMode, updatePhotoModeCamera) |
| 3.4 InputManager | ✅ | `InputManager.ts` (physical→logical action mapping, localStorage-rebinding), integrert parallelt med eksisterende `this.keys` |
| 3.5 Typed userData | ✅ | `sceneUserData.ts` (markSolid, markClimbable, markPickupable, registerMainSunLight, registerCustomUpdate) |

**Nye public API-er:**
- `engine.audio.playAmbient/playSpatial/playOneShot` via `engine.playAmbient/playOneShot`
- `engine.addMusicLayer(id, url) + setMusicLayer(id, volume, fadeSec)` for dynamisk musikk
- `engine.togglePhotoMode()`, `engine.captureScreenshot()`, `engine.setPhotoExposure/Lut`
- `engine.inputManager.isDown(action) / wasPressed(action)` med rebinding via localStorage
- `markSolid(mesh, opts)`, `markClimbable`, `markPickupable` — typede erstattninger for magic strings
- `GameConfig.audio.tracks: [{ id, url, kind, trigger }]` — deklarativ audio

**Bakoverkompatibilitet**: Alle eksisterende spill kjører uendret. InputManager kjører parallelt med `this.keys` — ingen eksisterende callsites refaktorert.

**P-tast** i alle spill: toggler fotomodus. Fryser tid, aktiverer fri-kamera (WASD + Space/Ctrl for vertikal), og viser UI for exposure og LUT. Screenshot eksporteres som PNG med tidsstempel.

---

## Leveranse Fase 4 (2026-04-23)

Alle fem sub-oppgaver implementert og bygger rent. Fase 4 låser opp gameplay-fundamentet — quests, inventar, reaktive NPCer, kondisjonell dialog og weather → gameplay-kobling.

| Oppgave | Status | Filer |
|---|---|---|
| 4.1 Quest-system | ✅ | `systems/QuestSystem.ts` (locked/active/completed, prerequisites, rewardFlags, markers), `components/QuestLog.tsx` (J-tast) |
| 4.2 Inventar-system | ✅ | `systems/InventorySystem.ts` (slot-grid, stackable, maxStack), `components/InventoryUI.tsx` (I-tast, 4-kol grid, hover-beskrivelse) |
| 4.3 NPC behavior tree | ✅ | `systems/AIDirector.ts` utvidet med `assignBehavior` + reactive behaviors (approach/flee/face/alert) med hysterese |
| 4.4 Kondisjonell dialog | ✅ | `types.ts` (DialogCondition, `dialogs` nå `Record<string, DialogNode \| DialogNode[]>`), `GameEngine.resolveDialog` filtrerer etter condition |
| 4.5 Weather → Gameplay | ✅ | `WeatherSystem.setChangeListener`, `GameEngine.handleWeatherChange` (auto-setter `wet`-flag, slukker lys med `_extinguishInRain`, kaller `onWeatherChange`-callback) |

**Nye public API-er:**
- `GameConfig.questDefs: QuestDef[]` + `engine.questIsCompleted(id) / questIsActive(id)`
- `GameConfig.items: ItemDef[]` + `engine.addItem/removeItem/hasItem/itemCount`
- `GameConfig.dialogs[key]` kan være array-variant med `condition: DialogCondition` per variant
- `GameConfig.npcBehaviors: NpcBehaviorConfig[]` — reaktiv atferd per NPC
- `GameConfig.onWeatherChange(from, to, engine)` — callback ved vær-endring
- **J-tast**: QuestLog overlay
- **I-tast**: Inventory overlay
- `mesh.userData._extinguishInRain = true` + `_savedIntensity`: lys som slukkes automatisk i regn/snø

**Bakoverkompatibilitet**: Eksisterende spill (Watt Lab, Lindisfarne, Ford Factory, Demo-world) måtte få minimale type-narrow-oppdateringer (`!Array.isArray(dialog)` eller `asNode()` helper) fordi `dialogs`-typen nå er union. Alle fire spill kjører uendret ved runtime.

---

---

## Filosofi

Vi deler arbeidet i seks faser. Hver fase er **selvstendig leverbar**, kan mergest isolert, og etterlater motoren i en bedre tilstand enn forrige fase. Demo-world (Lysalvendalen) er vår referansescene — hver fase skal **synlig forbedre** demoen.

**Regler:**
- Ingen fase skal kreve omskriving av eksisterende spill (Watt Lab, Lindisfarne). Bakoverkompatibilitet er ufravikelig.
- Nye features er **opt-in** via GameConfig-flagg der det gir mening.
- Hver fase avsluttes med oppdatert `BUILD_GAME_GUIDE.md` og synlig demo-oppdatering.
- Chromebook-baseline (1366x768, integrert GPU) skal aldri falle under 30 FPS. Tunge effekter gates av quality-tier.

---

## FASE 1: Visuelle Quick Wins + Fundament (S-løft, 1 dag)

**Mål**: 25% visuelt løft på en ettermiddag. Rydde opp tekniske svakheter før vi bygger videre.

### 1.1 Shared material cache
- **Fil**: `src/games/engine/SceneMat.ts`, `GameEngine.ts`
- **Hva**: WeakMap-basert cache slik at `toonMat(color)` og `sceneMat(preset, color)` returnerer samme Material-instans for identiske nøkler.
- **Hvorfor**: Vegetasjon og samleobjekter lager hundrevis av identiske materialer i dag. Reduserer GPU-state-changes og minnebruk.
- **Verifisering**: Debug-HUD viser redusert materialcount.

### 1.2 Bloom + exposure som GameConfig-knotter
- **Fil**: `src/games/engine/systems/PostProcessingSystem.ts`, `types.ts`
- **Hva**: Ekspander `PostProcessingConfig` med `bloomStrength`, `bloomThreshold`, `bloomRadius`, `exposure`. Eksponér på `GameConfig.postProcessing`.
- **Hvorfor**: Demo-world og Lindisfarne trenger ulik bloom-intensitet. Hardkodet i dag.
- **Verifisering**: Demo-world får lavere bloom, Watt Lab høyere (varmt verksted).

### 1.3 Fog density-kurve
- **Fil**: `src/games/engine/systems/WeatherSystem.ts`
- **Hva**: Erstatt flat `THREE.Fog` med `THREE.FogExp2` eller custom shader som tar høyde inn i beregningen. Tåke tykkere ved bakken.
- **Hvorfor**: Gir gratis dybde-cue og mer naturlig atmosfære.

### 1.4 SMAA i stedet for FXAA
- **Fil**: `src/games/engine/systems/PostProcessingSystem.ts`
- **Hva**: Bytt ut default antialiasing med `SMAAPass` fra three/examples. Kun for high-tier GPU.
- **Verifisering**: Mast, banner-kanter, linjer på NPC-ansikter blir skarpere.

### 1.5 Tone mapping + LUT-stub
- **Fil**: `src/games/engine/systems/PostProcessingSystem.ts`
- **Hva**: Gjør tone mapping-exposure konfigurerbar. Implementer en enkel LUT-pass (3D-texture lookup) som tar `lutTexture: string` fra config. Inkluder 3 preset-LUT-er: `neutral`, `warm-dawn`, `cold-dusk`.
- **Verifisering**: Dialog-action kan skifte scene-mood via `lutTexture`.

### 1.6 Debug-HUD (overlay)
- **Fil**: Ny `src/games/engine/systems/DebugHudSystem.ts` + `components/DebugHud.tsx`
- **Hva**: Toggle med F3. Viser FPS, drawcalls, triangles, geometries, textures, materialcount, physics-bodies, aktiv fase, aktive flagg.
- **Hvorfor**: Uten dette er det umulig å måle virkningen av alle senere faser.

**Leveranse Fase 1**: PR med demo-world som viser skarpere kanter, bedre bloom, realistisk tåke ved bakken, og en F3-HUD.

---

## FASE 2: PBR Materialer + Dypere Belysning (M-løft, 3-4 dager)

**Mål**: Overflater som **leser seg** som ekte materialer. Belysning som føles solid.

### 2.1 Normal maps + PBR-texturing i SceneMat
- **Fil**: `src/games/engine/SceneMat.ts`, `types.ts`
- **Hva**: Ekspander `SceneMatOpts` med `normalMap`, `roughnessMap`, `metalnessMap`, `aoMap`. Legg til texture-loader i `GameEngine.init()` som forhåndslaster et lite sett standard-texturer (stein, tre, klut, metall, jord).
- **Bakoverkompatibilitet**: Eksisterende kall uten texture-props fortsetter å fungere.
- **Demo**: Kapellets stein får synlig grov-struktur, trebrygga får åreringer.

### 2.2 SSAO-pass
- **Fil**: `src/games/engine/systems/PostProcessingSystem.ts`
- **Hva**: Legg til `SSAOPass` fra three/examples. Gates av `quality === 'high'`. Tuning: radius 0.5m, bias 0.005, intensity 0.8.
- **Hvorfor**: Hjørner, under-bord, fold i klær blir mørkere → scenen får dybde.
- **Chromebook-fallback**: Skrus helt av på low/medium tier.

### 2.3 Cascaded Shadow Maps (CSM)
- **Fil**: `src/games/engine/GameEngine.ts`
- **Hva**: Erstatt single DirectionalLight-shadow med `CSM` fra three/examples (3 kaskader: nær/medium/fjern).
- **Hvorfor**: Skygger i forgrunnen blir skarpe, fjerne skygger holder seg stabile.
- **Gate**: Kun high-tier.

### 2.4 IBL (Image-Based Lighting) fra SkySystem
- **Fil**: `src/games/engine/systems/SkySystem.ts`
- **Hva**: Render prosedyral himmel til en CubeRenderTarget hvert sekund (ikke hver frame). Sett som `scene.environment`.
- **Hvorfor**: Metaller og vann reflekterer nå faktisk himmelen. Gir "gratis" realisme på alle PBR-materialer.
- **Ytelse**: 32×32 eller 64×64 cubemap er nok.

### 2.5 Volumetrisk lys (god rays)
- **Fil**: Ny `src/games/engine/systems/VolumetricLightSystem.ts`
- **Hva**: Depth-based radial blur fra sol-posisjonen i skjermrommet. Opt-in via `GameConfig.volumetricLight: true`.
- **Hvorfor**: Dramatisk morgen/kveld. Perfekt for demo ved soloppgang.
- **Gate**: Kun high-tier.

**Leveranse Fase 2**: Demo-world før/etter screenshot viser tydelig materialrikdom, solid skyggeverk, og metaller som reflekterer himmelen.

---

## FASE 3: Lyd + Fotomodus + Debug-verktøy (M-løft, 2-3 dager)

**Mål**: Motoren føles *levende*. Lyd er like viktig som grafikk.

### 3.1 3D-audio system (Tone.js-integrasjon)
- **Fil**: Ny `src/games/engine/systems/AudioSystem.ts`
- **Hva**: Wrapper rundt Web Audio API (Tone.js er allerede i prosjektet). Eksponerer:
  - `playAmbient(url, { loop, volume, fadeIn })` — musikk/ambience
  - `playSpatial(url, { position, radius, volume })` — 3D-lyd knyttet til Object3D
  - `playOneShot(url, { position?, volume })` — engangslyd
- **Konfig**: `GameConfig.audio.tracks` — liste med `{ id, url, trigger: 'onSceneStart' | { flag: string } | { phase: string } }`
- **Demo**: Bål knitrer (spatial), bølger bruser fra havet (spatial), ambient vind (global), dialog-lyd (one-shot).
- **Chromebook-hensyn**: Maks 8 samtidige lydkilder. Auto-unloading av lyd utenfor 50m.

### 3.2 Dynamisk musikk-lag
- **Fil**: `src/games/engine/systems/AudioSystem.ts`
- **Hva**: Støtte for "layered music" — basis-spor pluss ekstra lag som lerpes inn når flagg settes. F.eks. dramatisk streng-lag når `flag: combat` aktiveres.
- **Krever**: Tone.js crossfade-noder.

### 3.3 Fotomodus
- **Fil**: Ny `src/games/engine/systems/PhotoModeSystem.ts` + `components/PhotoModeUI.tsx`
- **Hva**: Toggle med P. Fryser tid, slår av UI, aktiverer fri-kamera (WASD+mus). Knapp for screenshot (canvas.toBlob → download). Slider for DOF (depth of field blur), exposure, LUT.
- **Hvorfor**: Lar brukere dele bilder, og er et utmerket verktøy for å vise fram motorens visuelle bredde.

### 3.4 Input-abstraksjon
- **Fil**: Ny `src/games/engine/InputManager.ts`
- **Hva**: Mapper fysiske taster til logiske actions (`MOVE_FWD`, `INTERACT`, `THROW`, `PHOTO_MODE`, `DEBUG_HUD`). Støtter rebinding via localStorage. Gamepad-support som bonus.
- **Refaktor**: `GameEngine` bruker `InputManager.isPressed('INTERACT')` i stedet for direkte `keys['e']`.
- **Bakoverkompatibilitet**: Default-mapping er identisk med dagens.

### 3.5 Scene-userData som typede accessors
- **Fil**: `src/games/engine/types.ts`, `GameEngine.ts`
- **Hva**: Erstatt `mesh.userData.solid = true` med `markSolid(mesh)`. Samme for `climbable`, `_customUpdate`, `collisionShape`. Alle flagg som formelle TypeScript-typer.
- **Hvorfor**: Eliminer magic strings. Bedre refactor-trygghet.

**Leveranse Fase 3**: Demo-world med ambient lyd, spatial bål/bølger, og en P-tast som gir deg fotomodus med DOF og LUT-slider.

---

## FASE 4: Quest-system + Inventar + NPC-intelligens (L-løft, 4-5 dager)

**Mål**: Gameplay-fundament for ekte narrative spill.

### 4.1 Quest/objective-system
- **Fil**: Ny `src/games/engine/systems/QuestSystem.ts`, `types.ts`
- **Datamodell**:
  ```typescript
  type Quest = {
    id: string;
    title: string;
    description: string;
    objectives: Objective[];
    rewards?: { flags?: string[]; items?: string[] };
    prerequisite?: { flags?: string[]; questsCompleted?: string[] };
  };
  type Objective = {
    id: string;
    label: string;
    condition: { flag?: string; itemCollected?: string; npcTalkedTo?: string; position?: {pos, radius}; };
    marker?: { type: 'worldspace' | 'compass'; position?: THREE.Vector3 };
  };
  ```
- **UI**: Ny `components/QuestLog.tsx` (toggle med J). Worldspace-markers som følger NPC-er eller faste punkter.
- **Integrasjon**: Dialog-actions og monolog-actions kan nå `startQuest(id)`, `completeObjective(qId, oId)`.

### 4.2 Inventar-system
- **Fil**: Ny `src/games/engine/systems/InventorySystem.ts`, `components/InventoryUI.tsx`
- **Datamodell**:
  ```typescript
  type Item = {
    id: string;
    name: string;
    description: string;
    icon: string;
    stackable: boolean;
    useAction?: (engine: GameEngine) => void;
  };
  ```
- **UI**: Slot-basert grid (I-tast). Drag-and-drop (enkel). Beskrivelse ved hover.
- **Integrasjon**: Pickup via E legger enten i verden-hånd ELLER i inventar (hvis `pickup: { toInventory: true }` på objektet).
- **Persistens**: Serialiseres for save/load (Fase 5).

### 4.3 NPC Behavior Tree
- **Fil**: Utvid `src/games/engine/systems/AIDirector.ts`
- **Hva**: Erstatt pure waypoints med simple behavior-tree: `idle → patrol → investigate → flee/approach-player`. Parametrisert per NPC i config.
- **Konfig-DSL**:
  ```typescript
  ai: {
    behavior: 'patrol' | 'idle' | 'follow-player' | 'flee-from-player' | 'guard';
    waypoints?: Vec3[];
    playerReaction?: { distance: number; reaction: 'approach' | 'flee' | 'alert' };
  }
  ```
- **Demo**: Vandreren reagerer når du kommer nær — snur seg, vinker.

### 4.4 Kondisjonell dialog
- **Fil**: `src/games/engine/GameEngine.ts` (dialog-traversal)
- **Hva**: Dialog-noder får `condition: { flagsRequired?, flagsExcluded?, questCompleted?, itemInInventory? }`. Ved input velger motoren første node som matcher vilkårene.
- **Demo**: Alvstein har annet innhold før/etter du har besøkt båten.

### 4.5 Weather → Gameplay-kobling
- **Fil**: `src/games/engine/systems/WeatherSystem.ts`
- **Hva**: Vær-endringer kan nå trigge flagg (`onWeatherStart: { weather: 'rain', setFlag: 'wet' }`). Fakler med `extinguishInRain: true` slås av automatisk. LOS-range til NPC-er reduseres i tåke.

**Leveranse Fase 4**: Demo-world med en liten quest ("Finn de 3 runesteinene", marker på hver), inventar-knapp, og en NPC som reagerer på spiller-nærhet.

---

## FASE 5: Asset-pipeline + Save/Load + LOD (L-løft, 3-4 dager)

**Mål**: Motoren takler større scener uten å knekke Chromebook.

### 5.1 GLTF-loader + asset-manifest
- **Fil**: Ny `src/games/engine/AssetLoader.ts`
- **Hva**: Pre-load GLTF-modeller definert i `GameConfig.assets: { id, url }[]`. Cached i WeakMap. Eksponerer `engine.getAsset(id)` som returnerer en kloning.
- **Hvorfor**: Frigjør oss fra å bygge alt prosedyralt med BoxGeometry. Åpner for riktig 3D-modellering.
- **Format**: .glb (binær GLTF). DRACO-komprimering optional.

### 5.2 Save/Load av GameState
- **Fil**: Ny `src/games/engine/systems/SaveSystem.ts`
- **Serialiseres**: fase, alle flagg, inventar, aktive quests + progress, NPC-posisjoner, time-of-day, weather, spiller-posisjon.
- **Lagring**: localStorage per `gameId`. Auto-save hver 30s + ved fase-skift.
- **UI**: Load-knapp i pause-meny. Slett-save-knapp.
- **Begrensning**: Funker kun per nettleser, per device. OK for mini-spill.

### 5.3 LOD-system for vegetation
- **Fil**: `src/games/engine/systems/VegetationSystem.ts`
- **Hva**: `THREE.LOD`-grupper. Nært: full geometri m/ vind-shader. Medium (20-50m): redusert poly-count. Fjernt (50m+): billboard med impostor-texture.
- **Hvorfor**: Demo-world har i dag 200+ full-detaljerte trær som alltid rendres.

### 5.4 Dispose-hygiene
- **Fil**: `src/games/engine/GameEngine.ts`
- **Hva**: `dispose()` traverserer scene.children, kaller `geometry.dispose()`, `material.dispose()`, `texture.dispose()`. Stopper alle intervals og audio-nodes.
- **Verifisering**: DevTools Memory → ingen retained Three.js objects etter `dispose()`.

### 5.5 Resize via ResizeObserver
- **Fil**: `src/games/engine/GameEngine.ts`
- **Hva**: Bytt ut `window.addEventListener('resize', ...)` med `ResizeObserver` på canvas-container. Fikser bug med DPR-endring ved zoom.

**Leveranse Fase 5**: Demo-world med 500 trær (LOD), save/load-knapp i pause-meny, og null memory leaks mellom spill-sessions.

---

## FASE 6: Showroom-polish + Demo-world 2.0 (M-løft, 2-3 dager)

**Mål**: Demo-world blir en **ekte showcase** som selger motoren på ett minutt.

### 6.1 Innendørs/utendørs-kontrast
- **Fil**: `src/games/demo-world/DemoWorldAssets.ts`
- **Hva**: Lag en trapp ned i et kjellerkammer under kapellet. Dollhouse-tak-skjul når du går inn. SpotLight med volumetrisk god-ray gjennom et vindu. Speil på vegg som bruker IBL-cubemap.
- **Hvorfor**: Demonstrerer både SkySystem (ute), SpotLights (inne), volumetrisk lys, IBL-reflekser.

### 6.2 Material-variasjonsvegg
- **Fil**: `src/games/demo-world/DemoWorldAssets.ts`
- **Hva**: En "galleri-vegg" med 6 plater: stein, tre, klut, metall, lær, jord. Hver med normal/roughness/AO-maps. Liten skiltekst foran hver med material-navn.
- **Hvorfor**: Umiddelbart visuelt bevis på PBR-systemet.

### 6.3 Liten quest-kjede i demo-world
- **Fil**: `src/games/demo-world/DemoWorldConfig.ts`
- **Hva**:
  - Quest 1: "Snakk med Alvstein" → flag
  - Quest 2: "Finn 3 runesteiner i dalen" → hver trigger mono-melding
  - Quest 3: "Bring en runestein til kapellet" → inventar-tracking
  - Belønning: Alvstein åpner kjelleren

### 6.4 Spatial audio-pass
- **Fil**: `src/games/demo-world/DemoWorldConfig.ts`
- **Hva**: Bål-knitring, bølge-dur, vind i trær, fuglekvitter (dag) / ugle (natt), kirke-eko inne.

### 6.5 Fotomodus-polish + LUT-presets
- **Hva**: Legg til 5 LUT-presets tilgjengelig i fotomodus: `neutral`, `warm-dawn`, `cold-dusk`, `cinematic-teal-orange`, `black-white`.
- **Verifisering**: Lage 5 screenshots med samme scene, ulik LUT. Bruk som PR-materialet.

### 6.6 Oppdater BUILD_GAME_GUIDE.md
- Dokumenter alle nye GameConfig-felt
- Oppdater kodeeksempler
- Legg til seksjon "Dette burde du bruke i et nytt spill" — best practices

**Leveranse Fase 6**: Demo-world er en kvalitetsvisning av motoren. En utvikler som aldri har sett motoren før, skal kunne forstå hva den kan på 60 sekunder.

---

## Parallellisering og risiko

**Kan gjøres parallelt av flere personer:**
- Fase 1 sub-oppgavene (1.1 til 1.6) er uavhengige
- Fase 2 (PBR) og Fase 3 (Audio) kan kjøre parallelt
- Fase 6 (demo-polish) venter på Fase 4 og 5

**Største risiko:**
- **Fase 2.4 (IBL)**: Cubemap re-rendering kan hakke FPS. Mitigasjon: ikke hver frame, kun ved time-of-day-skift.
- **Fase 4.3 (NPC BT)**: Kan bli for komplekst. Start enklest mulig (2-3 states), utvid senere.
- **Fase 5.1 (GLTF)**: Bundle-size og loading-tid. Bruk lazy-loading + DRACO hvis nødvendig.

## Testing per fase

- **Manuell**: Start demo-world, gå gjennom alle interaksjoner, sjekk FPS-HUD (fra Fase 1.6).
- **Regresjons**: Etter hver fase — start Watt Lab og Lindisfarne. Må fortsatt fungere uten endringer.
- **Performance**: Chromebook-baseline 30 FPS skal holdes. Mål i Debug-HUD før og etter.

## Tidsestimater oppsummert

| Fase | Fokus | Arbeidstid |
|------|-------|------------|
| 1 | Quick wins + fundament | 1 dag |
| 2 | PBR + belysning | 3-4 dager |
| 3 | Lyd + fotomodus + input | 2-3 dager |
| 4 | Quest + inventar + AI | 4-5 dager |
| 5 | Assets + save + LOD | 3-4 dager |
| 6 | Showroom-polish | 2-3 dager |
| **Totalt** | | **~15-20 dager** |

## Neste steg

1. Godkjenn planen (eller juster rekkefølge/omfang)
2. Start Fase 1 — små, trygge endringer som gir umiddelbar effekt
3. Etter hver fase: kort demo-opptak + oppdatert BUILD_GAME_GUIDE.md

---

*Denne planen er et levende dokument. Oppdater etter hver fase med faktisk leveranse, lærdom, og justeringer for neste fase.*
