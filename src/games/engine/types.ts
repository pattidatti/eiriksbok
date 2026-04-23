import type { Group, Scene, MeshStandardMaterial, Light, Vector3, Mesh, Texture, Object3D } from 'three';
import type { QuestDef } from './systems/QuestSystem';
import type { ItemDef } from './systems/InventorySystem';

export type SubjectId = 'historie' | 'norsk' | 'krle' | 'samfunnsfag' | 'musikk';

// Rektangulær region på XZ-planet. Brukes til ikke-fysiske ting som trigger-volumer
// (MonologTrigger) og vegetasjons-patches. Fysisk kollisjon håndteres av PhysicsWorld
// via mesh.userData.solid - se SolidUserData i systems/PhysicsWorld.ts.
export type AABB2D = { minX: number; maxX: number; minZ: number; maxZ: number };

// Fysikk-konfigurasjon (Fase 4). Aktivert som standard når GameConfig.physics er undefined.
export interface PhysicsConfig {
    enabled?: boolean;              // default true
    gravity?: number;               // default -18
    playerJump?: boolean;           // default true
    playerFallDamage?: boolean;     // default false
    fallDamageThreshold?: number;   // m/s - absolutt verdi av landings-Y-hastighet; default 12
    onPlayerFallDamage?: (velocity: number) => void;
}

// Opsjoner når et objekt registreres som pickupable via engine.registerPickup.
export interface PickupOptions {
    holdOffset?: [number, number, number];  // kamera-lokal posisjon, default (0, -0.25, -1.1)
    throwForce?: number;                    // default 8
    onPickup?: () => void;
    onDrop?: () => void;
    onThrow?: () => void;
    // Fase 6: pickup-direkte-til-inventar. Når satt, holdes objektet IKKE i hånda;
    // i stedet kaller motoren engine.addItem(itemId, count) automatisk og fjerner
    // mesh + fysikk-body umiddelbart. onPickup kalles ETTER addItem (bra for å
    // fjerne ekstra visuelle effekter eller sette flagg). onDrop/onThrow ignoreres.
    toInventory?: { itemId: string; count?: number };
}

export type Emotion = 'glad' | 'worried' | 'surprised' | 'triumphant';
export type CharacterType = 'scientist' | 'farmer' | 'noble' | 'monk';

export interface DialogChoice {
    text: string;
    next: string | null;
    action?: () => void;
    // Valgfri dekorasjon for valg-knapp i UI (Fase 2-utvidelse)
    icon?: string;
    consequenceHint?: string;
}

export type DialogCameraFraming = 'speaker' | 'wide';

// Fase 4.4: betingelser som avgjør hvilken variant av en dialog som vises.
// Alle felter kombineres med AND — alle må stemme for at varianten skal matche.
export interface DialogCondition {
    flagsRequired?: string[];    // flagget må være truthy
    flagsExcluded?: string[];    // flagget må være falsy/uendret
    questCompleted?: string[];   // quest-ID må være completed
    itemInInventory?: string[];  // item-ID må finnes i inventar
}

export interface DialogNode {
    speaker: string;
    text: string | (() => string);
    choices: DialogChoice[];
    onEnd?: () => void;
    // Hvilken kamera-stil skal CameraDirector bruke når dialogen vises (default 'wide').
    cameraFraming?: DialogCameraFraming;
    // Valgfri emotion-tint for ramme rundt dialogboksen (default ingen tint).
    emotion?: Emotion;
    // Fase 4.4: kun brukt når noden er del av en liste i dialogs[key].
    // Første variant hvor condition stemmer blir valgt. En node uten condition
    // fungerer som default/fallback og må komme sist i listen.
    condition?: DialogCondition;
}

// En komponert kamera-tagning brukt av engine.playCinematic. Stub i Fase 2 — utvides senere.
export interface CinematicShot {
    duration: number; // sekunder
    cameraPos: [number, number, number];
    lookAt: [number, number, number];
    fov?: number;
}

export interface PuzzleOption {
    text: string;
    correct: boolean;
    feedback: string;
}

export interface PuzzleStep {
    question: string;
    hint: string;
    options: PuzzleOption[];
    onCorrect?: () => void;
}

export interface CharacterColors {
    body: number;
    head: number;
    legs: number;
}

export interface CharacterConfig {
    id: string;
    name: string;
    position: [number, number, number];
    colors: CharacterColors;
    characterType?: CharacterType;
    defaultEmotion?: Emotion;
    extras?: (group: Group) => void;
    marker?: boolean;
    showName?: boolean;
}

export interface CollectibleConfig {
    id: string;
    name: string;
    position: [number, number, number];
    geometry: 'cylinder' | 'torus' | 'sphere' | 'box';
    color: number;
}

export type LightAnimation = 'steady' | 'flicker' | 'flicker-soft' | 'pulse';

export interface LightConfig {
    id: string;
    position: [number, number, number];
    color?: number;
    intensity?: number;
    distance?: number;
    decay?: number;
    animation?: LightAnimation;
    castShadow?: boolean;
    showBulb?: boolean;
    // SpotLight-vinkel og myk kant (erstatter PointLight)
    angle?: number;
    penumbra?: number;
    // Synlig lyskjegle (stråle) under pæren
    coneHeight?: number;
    coneRadius?: number;
    coneOpacity?: number;
}

export type WorldPreset = 'workshop' | 'longhouse' | 'harbor' | 'open' | 'custom';

export interface WorldConfig {
    preset: WorldPreset;
    roomSize?: number;
    wallHeight?: number;
    backgroundColor?: string;
    fogDensity?: number;
}

// ─── Visual / sky / weather / vegetation (Fase 1-3) ──────────────────────────

export type QualityTierConfig = 'auto' | 'low' | 'medium' | 'high';
export type SkyMode = 'procedural' | 'solid' | 'none';
export type ColorGrading = 'warm' | 'cold' | 'sepia' | 'neutral' | 'dawn' | 'dusk';
export type WeatherType = 'clear' | 'rain' | 'fog' | 'snow';
export type MaterialPreset = 'stone' | 'wood' | 'cloth' | 'metal' | 'leaf' | 'water' | 'soil';
export type VegetationType = 'grass' | 'reeds' | 'flowers' | 'heather' | 'wildflowers' | 'ferns' | 'bush';
export type AnimalKind = 'sheep' | 'cow';
export type TreeType = 'pine' | 'oak' | 'birch';

export interface WeatherState {
    type: WeatherType;
    intensity: number; // 0..1
}

// Fase 1.2: utvidet post-processing-konfig. Kompatibelt med den gamle string-formen
// (postProcessing: 'auto' | 'low' | ... ) via union.
export interface PostProcessingConfig {
    quality?: QualityTierConfig;
    bloom?: {
        strength?: number;   // default 0.35 medium, 0.55 high
        threshold?: number;  // default 0.25
        radius?: number;     // default 0.7
    };
    exposure?: number;       // tone mapping exposure, default 1.8
    lut?: string;            // LUT-preset-navn (Fase 1.5 infra — kun 'neutral' støttet nå)
    // Fase 2.2: Screen-space ambient occlusion. Kun high-tier har full effekt.
    // Default: av. Aktiver med { enabled: true } for standard-tuning.
    ssao?: {
        enabled?: boolean;
        kernelRadius?: number;   // default 0.5
        minDistance?: number;    // default 0.005
        maxDistance?: number;    // default 0.1
    };
}

// Fase 1.3: tetthetskurve for fog over dagen. Alle verdier i FogExp2-density.
// Verdiene brukes når scene.fog er satt og WeatherSystem ikke overstyrer (fog/rain/snow).
export interface FogDensityCurve {
    dawn: number;   // ca. t = 0.25
    day: number;    // ca. t = 0.5
    dusk: number;   // ca. t = 0.75
    night: number;  // ca. t = 0.0 / 1.0
}

// Fase 3.1: deklarativ audio-konfig. Hvert spor lastes lazy og spilles av
// i henhold til trigger. `id` brukes av engine.audio.stop(id) / crossfade.
export interface AudioTrackConfig {
    id: string;
    url: string;
    kind: 'ambient' | 'spatial';
    volume?: number;
    loop?: boolean;
    // Spatial kilder må ha en posisjon (tuple) eller target-id som refererer
    // til en karakter/collectible i GameConfig.
    position?: [number, number, number];
    attachTo?: string; // character id
    maxDistance?: number;
    // Når skal sporet spilles?
    // 'onStart' = spilles ved gameStarted=true
    // { flag: 'X' } = når flagget først blir truthy
    // { phase: 'X' } = når setPhase kalles med matching phase
    trigger: 'onStart' | { flag: string } | { phase: string };
}

export interface VisualConfig {
    postProcessing?: QualityTierConfig | PostProcessingConfig;
    timeOfDay?: number; // 0..1
    weather?: WeatherState;
    colorGrading?: ColorGrading;
    sky?: SkyMode;
    fogDensityCurve?: FogDensityCurve;
    // Fase 2.3: skygge-modus. 'standard' = enkel DirectionalLight.shadow.
    // 'cascaded' = three/addons CSM med tre kaskader (kun high-tier, kun 'open'-preset).
    // Default: 'standard'. Eksisterende spill trenger ingen endring.
    shadows?: 'standard' | 'cascaded';
    // Fase 2.5: volumetrisk lys (god rays). Default: av.
    volumetricLight?: boolean;
}

export interface NpcRouteConfig {
    characterId: string;
    waypoints: [number, number][]; // x,z
    mode: 'loop' | 'pingpong' | 'once';
    speed?: number;
    pauseMs?: number;
}

// Fase 4.3: reaktiv NPC-atferd. Overstyrer midlertidig waypoint-vandring
// når spilleren kommer innenfor `distance`. Etter at spilleren har trukket
// seg > distance * 1.5 unna (hysterese), returnerer NPCen til ruten.
export interface NpcBehaviorConfig {
    characterId: string;
    playerReaction?: {
        distance: number;  // trigger-avstand i meter
        behavior: 'approach' | 'flee' | 'face' | 'alert';
        speedMultiplier?: number;  // default 1.5 for approach, 2.0 for flee
        // Valgfritt flag som settes når reaksjonen trigges første gang.
        setFlag?: string;
    };
}

// Intro-konfigurasjon (Fase 5). 'fade' = enkel fade-inn fra sort.
// 'title' = fade + stor title/subtitle på skjermen før spilleren får kontroll.
// 'none' = ingen intro (spilleren starter umiddelbart).
export interface IntroConfig {
    type: 'fade' | 'title' | 'none';
    title?: string;
    subtitle?: string;
    durationMs?: number;       // hvor lenge holdes tittelen synlig (default 2500)
    fadeMs?: number;           // fade-inn-varighet (default 700)
    skippable?: boolean;       // vis Skip-knapp (default true)
}

export interface PlayerConfig {
    startPosition: [number, number, number];
    colors: CharacterColors;
}

// Player movement modes. 'free' = normal WASD. 'seated' = locked to a parent group (e.g. boat).
// 'scripted' = external code sets position each frame.
export type PlayerMode = 'free' | 'seated' | 'scripted';

export interface MonologNode {
    id: string;
    lines: string[];
    // Auto from line length when omitted (50ms/char, min 2500, max 6000).
    lineDurationMs?: number;
    once?: boolean;
}

export interface MonologTrigger {
    id: string;
    monologId: string;
    area: AABB2D;
    requiresPhase?: string;
}

// Deklarativ definisjon for et rom som RoomSystem bygger. Åpninger er hull i veggene.
export interface RoomOpening {
    side: 'N' | 'S' | 'E' | 'W';
    offset: number;
    width: number;
}

export interface RoomDef {
    id: string;
    center: [number, number];
    size: [number, number];
    wallHeight: number;
    openings?: RoomOpening[];
    floorColor?: number;
    wallColor?: number;
    roofColor?: number;
    hasRoof?: boolean;
}

// Minimal interface exposed to setupScene callbacks
export interface SceneMatOpts {
    preset?: MaterialPreset;
    roughness?: number;
    metalness?: number;
    map?: unknown;
    transparent?: boolean;
    opacity?: number;
    side?: number;
    emissive?: number;
    emissiveIntensity?: number;
    // Fase 2.1: PBR-texturing. Alle valgfrie. Angi enten en preloadet texture-ID
    // (string, slått opp i engine.getTexture) eller en rå THREE.Texture via `unknown`.
    normalMap?: unknown;
    roughnessMap?: unknown;
    metalnessMap?: unknown;
    aoMap?: unknown;
    // Skaler texture-repetisjon (default 1,1). Satt på alle maps som er satt.
    mapRepeat?: [number, number];
}

export interface GameEngineRef {
    scene: Scene;
    toonMat: (color: number, opts?: Record<string, unknown>) => MeshStandardMaterial;
    sceneMat: (color: number, opts?: SceneMatOpts) => MeshStandardMaterial;
    // Fase 2.1: runtime-genererte PBR-textures. Returnerer delt CanvasTexture
    // (cached), så flere materialer som refererer samme (preset,kind) deler minne.
    getTexture: (preset: MaterialPreset, kind: 'normal' | 'roughness' | 'ao') => unknown;
    config: GameConfig;
    screenFlash: () => void;
    cameraShake: (amount: number, duration: number) => void;
    animateReveal: (group: Group) => void;
    startEngineAnimation: () => void;
    openPuzzle: () => void;
    triggerEnd: () => void;
    updateUI: () => void;
    setEmotion: (id: string, emotion: Emotion, resetAfterMs?: number) => void;
    // Nye API-metoder for fler-fase-spill med valg og indre monolog
    setFlag: <T>(key: string, value: T) => void;
    getFlag: <T>(key: string) => T | undefined;
    setPlayerMode: (mode: PlayerMode, opts?: { parent?: Group; offset?: [number, number, number] }) => void;
    playMonolog: (id: string) => void;
    hasSeenMonolog: (id: string) => boolean;
    setPhase: (phase: string) => void;
    getPhase: () => string;
    openDialog: (key: string) => void;
    getPlayerPosition: () => { x: number; y: number; z: number };
    teleportPlayer: (x: number, y: number, z: number) => void;
    setCharacterMarkerVisible: (id: string, visible: boolean) => void;
    // Planlegg et kall som kanselleres automatisk hvis motoren disposes.
    // Bruk denne i stedet for setTimeout direkte i setupScene og dialog-actions.
    schedule: (callback: () => void, delayMs: number) => void;
    // Registrer et SpotLight/PointLight for automatisk animasjon i motorloopen.
    registerAnimatedLight: (light: Light, animation: LightAnimation, baseIntensity?: number) => void;
    // Sett bloom-styrke (kun effekt på high-end). 0 = av, 0.35 = standard, 0.6 = intenst.
    // Kan også motta { strength, threshold, radius } for finere kontroll (Fase 1.2).
    setBloom: (strength: number | { strength?: number; threshold?: number; radius?: number }) => void;
    // Fase 1.5: bytt LUT-preset i runtime (null = av). Krever at GameConfig.visual.postProcessing.lut
    // var satt ved init, ellers er ingen LUT-pass i pipelinen.
    setLut: (name: string | null) => void;
    // ── Fase 1-3 utvidelser ──
    setTimeOfDay: (t: number) => void;
    getSunDirection: () => Vector3;
    setWeather: (state: WeatherState) => void;
    addVegetationPatch: (area: AABB2D, density: number, type?: VegetationType) => void;
    addTree: (position: [number, number, number], type?: TreeType) => void;
    addBirdFlock: (center: [number, number, number], opts?: { count?: number; radius?: number; altitude?: number; altitudeSpread?: number }) => void;
    addButterfly: (center: [number, number, number], opts?: { count?: number; radius?: number; color?: number }) => void;
    addAnimalGroup: (kind: AnimalKind, bounds: AABB2D, opts?: { count?: number }) => void;
    assignRoute: (config: NpcRouteConfig) => void;
    // CameraDirector
    setCameraFraming: (framing: DialogCameraFraming, target?: Vector3) => void;
    playCinematic: (shots: CinematicShot[]) => Promise<void>;
    fadeToBlack: (durationMs?: number) => Promise<void>;
    fadeFromBlack: (durationMs?: number) => Promise<void>;
    // Tier (slik at byggere/setupScene kan velge billig/dyr variant)
    getQualityTier: () => 'low' | 'medium' | 'high';
    // Hopper over intro-fasen (Fase 5). No-op hvis intro ikke er aktiv.
    skipIntro: () => void;
    // ── Fase 4 (fysikk + interaksjon) ──
    // Registrer et objekt som plukkbart. Objektet må ha mesh.userData.solid=true og
    // dynamic=true for å få en Rapier-rigid body. Hvis fysikk er deaktivert, er dette en no-op.
    registerPickup: (mesh: Mesh, opts?: PickupOptions) => void;
    isHoldingItem: () => boolean;
    dropHeldItem: () => void;
    throwHeldItem: (force?: number) => void;
    // Fase 6: fjern en static collider (lagt til via userData.solid=true) i runtime.
    // Brukes for dører/blokker som låses opp av en quest. Påvirker ikke mesh-visningen
    // - kall mesh.removeFromParent() eller anim mesh.position separat for visuell effekt.
    // No-op hvis fysikk er deaktivert eller mesh ikke har en collider.
    removeStaticCollider: (mesh: Mesh) => void;
    // ── Fase 3.1 (audio) ──
    // Spill en engangslyd. Spatial hvis `position` er satt.
    playOneShot: (url: string, opts?: { position?: [number, number, number]; volume?: number }) => void;
    // Spill en ambient loop. Returnerer handle som kan stoppe eller volumjustere.
    playAmbient: (url: string, opts?: { loop?: boolean; volume?: number; fadeIn?: number }) => void;
    // Krever bruker-gesture (klikk) før Web Audio er tillatt; kall etter spill-start.
    resumeAudio: () => Promise<void>;
    // ── Fase 3.2 (dynamisk musikk) ──
    // Legg til et musikk-lag (loop). initialVolume=0 betyr "klar til fade-in".
    addMusicLayer: (layerId: string, url: string, initialVolume?: number) => Promise<void>;
    // Fade et musikk-lag til target-volum over `fadeSec` sekunder.
    setMusicLayer: (layerId: string, targetVolume: number, fadeSec?: number) => void;
    // ── Fase 4.1 (quest) ──
    questIsCompleted: (questId: string) => boolean;
    questIsActive: (questId: string) => boolean;
    // Aktiver en låst quest eksplisitt (ignorerer prerequisites). Returnerer true
    // hvis statusen endret seg — no-op hvis allerede active/completed eller ukjent id.
    startQuest: (questId: string) => boolean;
    // Marker et objective som fullført manuelt. Går gjennom samme pipeline som
    // evaluateCondition — når alle objectives er ferdig, neste update()-tick
    // setter status=completed og deler ut rewardFlags.
    completeObjective: (questId: string, objectiveId: string) => boolean;
    // ── Fase 4.2 (inventar) ──
    addItem: (itemId: string, count?: number) => boolean;
    removeItem: (itemId: string, count?: number) => boolean;
    hasItem: (itemId: string) => boolean;
    itemCount: (itemId: string) => number;
    // ── Fase 5.1 (asset-pipeline) ──
    // Hent en pre-lastet GLTF-scene eller texture. Returnerer rå-referansen;
    // bruk cloneAsset for GLTF-scener som skal plasseres flere steder.
    getAsset: (id: string) => Group | Texture | null;
    // Dyp-kloner en GLTF-scene. Rigger håndteres via SkeletonUtils ved behov.
    // Returnerer Promise fordi SkeletonUtils lastes lazy.
    cloneAsset: (id: string) => Promise<Object3D | null>;
    // ── Fase 5.2 (save/load) ──
    // Eksplisitt lagring. Kalles av pause-menyens Lagre-knapp; auto-save skjer
    // i tillegg hvert 30s og ved setPhase/setFlag (debounced).
    save: () => boolean;
    // Last inn save. Returnerer true hvis save fantes og ble gjenopprettet.
    load: () => boolean;
    hasSave: () => boolean;
    clearSave: () => void;
}

export interface GameConfig {
    id: string;
    title: string;
    subtitle: string;
    subject: SubjectId;
    description: string;
    thumbnail: string;
    world: WorldConfig;
    player: PlayerConfig;
    characters: CharacterConfig[];
    collectibles?: CollectibleConfig[];
    lights?: LightConfig[];
    quests: { phase: string; objective: string }[];
    // Dialogs er indeksert etter key. Fra Fase 4.4 kan verdien være en liste
    // av varianter — første variant hvor DialogCondition stemmer blir valgt.
    dialogs: Record<string, DialogNode | DialogNode[]>;
    puzzle?: { steps: PuzzleStep[] };
    // Indre monolog (ikke-blokkerende tekst). Kan trigges via triggervolumer eller engine.playMonolog.
    monologs?: Record<string, MonologNode>;
    monologTriggers?: MonologTrigger[];
    // Streng, eller en funksjon som kan lese flagg og returnere variabel slutt-tekst.
    endText: string | ((engine: GameEngineRef) => string);
    // Aktiver debug-modus: viser kollisjonsbokser og fase/flagg i HUD.
    debug?: boolean;
    // Called once after engine initializes - add game-specific 3D and wire puzzle callbacks here
    setupScene?: (engine: GameEngineRef) => void;
    // ── Fase 1-3 utvidelser (alle valgfrie, ingen breaking changes) ──
    visual?: VisualConfig;
    npcRoutes?: NpcRouteConfig[];
    // Fase 4.3: reaktiv atferd per NPC (overstyrer waypoint-rute ved nær spiller).
    npcBehaviors?: NpcBehaviorConfig[];
    // ── Fase 4 (fysikk) ──
    physics?: PhysicsConfig;
    // ── Fase 5 (Intro + QoL) ──
    intro?: IntroConfig;
    // ── Fase 3.1 (audio) ──
    audio?: {
        tracks?: AudioTrackConfig[];
        masterVolume?: number; // 0..1, default 1
    };
    // ── Fase 4.1 (quest-system) ──
    // Deklarative quest-definisjoner. Motoren holder status (active/completed)
    // og fullfører objectives basert på flagg, item-pickups, NPC-samtaler.
    questDefs?: QuestDef[];
    // ── Fase 4.2 (inventar) ──
    // Item-definisjoner (navn, ikon, stackable). Selve inventar-innholdet er
    // runtime-state som bygges opp via pickup eller engine.inventory.add().
    items?: ItemDef[];
    inventorySize?: number;  // default 16
    // ── Fase 4.5 (weather → gameplay) ──
    // Kalles når været endrer seg. Kan sette flagg og trigge gameplay-reaksjoner
    // (f.eks. fakler slukner i regn). 'wet'-flagget settes automatisk av motoren
    // ved rain/snow/fog og ryddes ved 'clear'.
    onWeatherChange?: (from: WeatherType, to: WeatherType, engine: GameEngineRef) => void;
    // ── Fase 5.1 (asset-pipeline) ──
    // GLTF/texture-modeller som pre-lastes før startGame(). Trenger DRACO-decoder
    // kopiert til public/draco/ hvis { draco: true } settes.
    assets?: {
        defs: Array<{ id: string; url: string; kind?: 'gltf' | 'texture' }>;
        draco?: boolean;
    };
}

export interface MonologUIState {
    id: string;
    lines: string[];
    currentLine: number;
}

export interface DialogChoiceUI {
    text: string;
    icon?: string;
    consequenceHint?: string;
}

export interface GameUIState {
    started: boolean;
    questObjective: string;
    questParts: { id: string; name: string; collected: boolean }[];
    showInteractPrompt: boolean;
    dialog: {
        visible: boolean;
        speaker: string;
        text: string;
        choices: DialogChoiceUI[];
        emotion?: Emotion;
    } | null;
    puzzle: {
        visible: boolean;
        stepIndex: number;
        stepLabels: string[];
        question: string;
        hint: string;
        feedback: string;
        options: string[];
    } | null;
    monolog: MonologUIState | null;
    ended: boolean;
    endText: string;
    showFlash?: boolean;
    paused?: boolean;
    debug?: { phase: string; flags: Record<string, unknown> };
    // ── Fase 5 ──
    intro?: { active: boolean; title?: string; subtitle?: string; skippable: boolean } | null;
    qualityTier?: 'low' | 'medium' | 'high';
}
