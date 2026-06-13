import type { Group, Scene, MeshStandardMaterial, Light, Vector3, Mesh, Texture, Object3D } from 'three';
import type { QuestDef } from './systems/QuestSystem';
import type { ItemDef } from './systems/InventorySystem';
import type { SequenceStep, SequenceHandle } from './utils/SequenceRunner';
import type { LiveSoundName, LiveSoundOptions, LiveSoundHandle } from './systems/ProceduralAudio';
import type { CrowdAreaSpec, CrowdPathSpec, AddCrowdOptions } from './systems/CrowdSystem';
import type { AudioHandle } from './systems/AudioSystem';
import type { SkyOptions } from './systems/SkySystem';
import type { TerrainSystem } from './systems/TerrainSystem';
import type { ProjectileSpawnOptions, ProjectileTargetRecord } from './systems/ProjectileSystem';
import type { LauncherSlot } from './systems/InteractableSystem';

export type { AudioHandle } from './systems/AudioSystem';
export type { SkyOptions } from './systems/SkySystem';

export type { SequenceStep, SequenceHandle } from './utils/SequenceRunner';
export type { LiveSoundName, LiveSoundOptions, LiveSoundHandle } from './systems/ProceduralAudio';
export type { CrowdMode, CrowdPalette, CrowdAreaSpec, CrowdPathSpec, AddCrowdOptions } from './systems/CrowdSystem';

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

// Opsjoner for generelle interaksjonspunkter (alter, dor, hendel etc.) registrert via
// engine.registerInteract. Spilleren ser en floating label og trykker E for å interagere.
export interface InteractOptions {
    // Tekst over objektet. Kan være en funksjon for dynamisk innhold (kalles per frame).
    // Tom streng = skjul label. Default: 'Trykk E'
    label?: string | (() => string);
    // Radius for E-key-registrering og label-synlighet. Default 2.5
    radius?: number;
    // Kalles når spilleren trykker E innen radius. Gjør ingenting av seg selv —
    // kall engine.unregisterInteract(mesh) inni her når interaksjonen er ferdig.
    onInteract: () => void;
    // Høyprioritets-interakt: E vinner over hold-slipp og nærhets-pickup. Brukes for
    // våpenstativ så et våpen kan utrustes selv om spilleren holder et annet. Default false.
    priority?: boolean;
}

// Opsjoner når et objekt registreres som pickupable via engine.registerPickup.
export interface PickupOptions {
    holdOffset?: [number, number, number];  // kamera-lokal posisjon, default (0, -0.25, -1.1)
    throwForce?: number;                    // default 8
    label?: string;                         // floating in-world tekst over objektet, f.eks. 'Plukk opp (E)'
    onPickup?: () => void;
    onDrop?: () => void;
    onThrow?: () => void;
    // Fase 6: pickup-direkte-til-inventar. Når satt, holdes objektet IKKE i hånda;
    // i stedet kaller motoren engine.addItem(itemId, count) automatisk og fjerner
    // mesh + fysikk-body umiddelbart. onPickup kalles ETTER addItem (bra for å
    // fjerne ekstra visuelle effekter eller sette flagg). onDrop/onThrow ignoreres.
    toInventory?: { itemId: string; count?: number };
    // Fase 8: lad-og-kast. Når satt blir F en "hold for å lade"-handling: hold F for å
    // bygge opp kast-kraft (med bue-preview), slipp for å kaste med lerp(throwForce,
    // maxForce, ladning). Uten feltet beholdes dagens umiddelbare F-kast.
    charge?: {
        maxForce?: number;      // kraft ved full ladning. Default 16.
        chargeTimeMs?: number;  // tid til full ladning i ms. Default 900.
        preview?: boolean;      // vis ballistisk bue-preview. Default true.
    };
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

// En komponert kamera-tagning brukt av engine.playCinematic.
export interface CinematicShot {
    duration: number; // sekunder
    cameraPos: [number, number, number];
    lookAt: [number, number, number];
    fov?: number;
    // 'cut' = kameraet teleporterer umiddelbart (standard).
    // 'fade' = fade til sort, bytt posisjon, fade inn igjen.
    // 'glide' = lerp (easeInOut) fra forrige shot til dette (Fase 8).
    transition?: 'cut' | 'fade' | 'glide';
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
    // Station mode: korrekt rekkefylge av item-IDer spilleren skal plassere i slots.
    ingredientSlots?: string[];
    // Valgfrie visningsnavn per slot (brukes i station-mode UI). Ellers vises index.
    slotLabels?: string[];
    correctFeedback?: string;
    incorrectFeedback?: string;
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
    // Fase 8: per-spill himmel-tuning (turbidity/rayleigh/mie) for f.eks.
    // solnedgangs-look. Kombineres med timeOfDay (0.7+ = kveld).
    skyOptions?: SkyOptions;
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
    // Kalles én gang når NPC-en fullforer en 'once'-rute.
    onComplete?: () => void;
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
    // 'zone' (Fase 8): som 'title', men rendret som sonetittel-overlay (serif, stor
    // tracking) i stedet for det fullskjerms intro-kortet.
    type: 'fade' | 'title' | 'none' | 'zone';
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
    setPlayerMode: (mode: PlayerMode, opts?: {
        // 'seated': forelder-gruppe spilleren arver transform fra
        parent?: Group;
        offset?: [number, number, number];
        // 'scripted': NPC spilleren skal folge (followCharacterId = character id)
        followCharacterId?: string;
        // Gangfart i m/s (default 1.5)
        followSpeed?: number;
        // Avstand bak NPC-en i meter (default 1.5)
        followOffset?: number;
    }) => void;
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
    // Kjør en deklarativ tidslinje (cinematics/monologer/state). Foretrekk denne
    // fremfor nestede schedule()-kjeder. Se utils/SequenceRunner.ts for semantikk
    // (spesielt skip(): `do`-steg kjøres alltid, presentasjonssteg droppes).
    playSequence: (steps: SequenceStep[]) => SequenceHandle;
    // Registrer et SpotLight/PointLight for automatisk animasjon i motorloopen.
    registerAnimatedLight: (light: Light, animation: LightAnimation, baseIntensity?: number) => void;
    // Registrer en per-frame callback for prefab-animasjoner (flamme-geometri, partikler, lys-sync).
    registerUpdate: (fn: (dt: number, elapsed: number) => void) => void;
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
    // Instansiert folkemengde (hundrevis av figurer i én draw call). 'march'-modus
    // flyter langs en sti med conveyor-wrap; setCrowdSpeed(id, 0) stopper kolonnen.
    addCrowd: (id: string, spec: CrowdAreaSpec | CrowdPathSpec, opts: AddCrowdOptions) => void;
    setCrowdSpeed: (id: string, speed: number) => void;
    setCrowdVisible: (id: string, visible: boolean) => void;
    assignRoute: (config: NpcRouteConfig) => void;
    // CameraDirector
    setCameraFraming: (framing: DialogCameraFraming, target?: Vector3) => void;
    playCinematic: (shots: CinematicShot[]) => Promise<void>;
    fadeToBlack: (durationMs?: number) => Promise<void>;
    fadeFromBlack: (durationMs?: number) => Promise<void>;
    // Tier (slik at byggere/setupScene kan velge billig/dyr variant)
    getQualityTier: () => 'low' | 'medium' | 'high';
    // ── Fase 8 (prosedyralt terreng) ──
    // Kalles av buildTerrain for å koble terrenget til motoren (height-queries +
    // heightfield-collider). Spillkode trenger normalt ikke kalle denne direkte.
    attachTerrain: (system: TerrainSystem) => void;
    // Terrenghøyde ved (x, z) i meter. 0 hvis ingen terreng. Brukes av 'terrain'-
    // sentinelen i deklarative pos-felt og av samplere for NPC/vegetasjon.
    getTerrainHeight: (x: number, z: number) => number;
    hasTerrain: () => boolean;
    // Fase 8: vis en stor sonetittel (sted/kapittel) med CSS-fade. Brukes av
    // addZoneTitle-kit-en og kan kalles direkte ved fase-skifter.
    showZoneTitle: (title: string, opts?: { subtitle?: string; durationMs?: number }) => void;
    // Kort handlings-varsel i HUD (plukket opp, utrustet o.l.) + en lett pickup-lyd.
    notify: (text: string) => void;
    // Blink en hitmarker på sikteet (kalles av mål/fiender ved treff for tydelig feedback).
    flashHitMarker: () => void;
    // Fase 8: skyt et lett prosjektil (analytisk bane + raycast, ikke Rapier-body).
    spawnProjectile: (opts: ProjectileSpawnOptions) => void;
    // Registrer/fjern et prosjektil-mål (blink). Brukes av addTarget-builderen.
    addProjectileTarget: (record: ProjectileTargetRecord) => void;
    removeProjectileTarget: (id: string) => void;
    // Utrust/fjern en launcher (spyd/bue/slynge). Hold F = lad, slipp = skyt.
    equipLauncher: (slot: LauncherSlot) => void;
    unequipLauncher: () => void;
    getLauncherAmmo: () => number | null;
    // Station puzzle: kall med de valgte item-IDene i rekkefylgen spilleren plasserte dem.
    handleStationSubmit: (selectedItemIds: string[]) => void;
    // Hopper over intro-fasen (Fase 5). No-op hvis intro ikke er aktiv.
    skipIntro: () => void;
    // ── Timed Activity System ──
    // Apner en aktivitets-overlay. def kan vare en pre-registrert id (string)
    // eller en inline ActivityDef. Blokkerer 3D-input til aktiviteten er ferdig.
    openActivity: (def: ActivityDef | string) => void;
    // Lukker aktiviteten uten suksess/fail-callbacks (f.eks. spilleren avbryter).
    closeActivity: () => void;
    // ── Fase 4 (fysikk + interaksjon) ──
    // Registrer et objekt som plukkbart. Objektet må ha mesh.userData.solid=true og
    // dynamic=true for å få en Rapier-rigid body. Hvis fysikk er deaktivert, er dette en no-op.
    // Fase 6+: registrer et statisk interaksjonspunkt (alter, hendel, dor, etc.).
    // Spilleren ser en floating label og trykker E for å utlose onInteract-callbacken.
    // Kall unregisterInteract(mesh) nar interaksjonen er brukt opp.
    registerInteract: (mesh: Mesh, opts: InteractOptions) => void;
    unregisterInteract: (mesh: Mesh) => void;
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
    // Spill en ambient loop. Returnerer handle som kan stoppe eller volumjustere
    // (null hvis avspillingen feilet).
    playAmbient: (
        url: string,
        opts?: { loop?: boolean; volume?: number; fadeIn?: number },
    ) => Promise<AudioHandle | null>;
    // Krever bruker-gesture (klikk) før Web Audio er tillatt; kall etter spill-start.
    resumeAudio: () => Promise<void>;
    // Start en sanntidsstyrt prosedural lyd ('march-footsteps' | 'crowd-murmur-live').
    // Returnerer handle med setParam('bpm'|'intensity') for å følge spill-state.
    startProceduralSound: (
        name: LiveSoundName,
        opts?: LiveSoundOptions,
    ) => LiveSoundHandle | null;
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
    // ── Deklarativ API (Fase 7: builders) ──
    // Dynamisk NPC-tillegg fra setupScene. Brukes av declarative.addNPC.
    addCharacter: (cfg: CharacterConfig) => void;
    // Merge nye dialog-noder inn i config.dialogs. Brukes av declarative.addNPC for å
    // registrere per-NPC-dialoger uten at konsumenten må sette dem i config.dialogs manuelt.
    registerDialogs: (dialogs: Record<string, DialogNode | DialogNode[]>) => void;
    // Legg til en monolog-node + valgfri trigger på runtime.
    registerMonolog: (node: MonologNode) => void;
    registerMonologTrigger: (trigger: MonologTrigger) => void;
}

export interface GameConfig {
    id: string;
    title: string;
    subtitle: string;
    subject: SubjectId;
    description: string;
    thumbnail: string;
    // Pedagogisk metadata. Vises på TitleScreen før spilleren starter og brukes
    // til å etterprøve at spillet leverer det blueprinten lovet.
    // Skal matche blueprinten i docs/Design documents/minigames/[id]-blueprint.md.
    learningGoals?: string[];     // 1-3 konkrete læringsmål ("Eleven kan forklare hvorfor X")
    curriculumTags?: string[];    // LK20-kompetansemål-koder eller fagbegreper
    world: WorldConfig;
    player: PlayerConfig;
    characters: CharacterConfig[];
    collectibles?: CollectibleConfig[];
    lights?: LightConfig[];
    quests: { phase: string; objective: string }[];
    // Dialogs er indeksert etter key. Fra Fase 4.4 kan verdien være en liste
    // av varianter — første variant hvor DialogCondition stemmer blir valgt.
    dialogs: Record<string, DialogNode | DialogNode[]>;
    puzzle?: {
        steps: PuzzleStep[];
        // 'mcq' = flervalg-sporsmal (standard, bakoverkompatibelt).
        // 'station' = spilleren plasserer gjenstander fra inventar i riktig rekkefylge.
        mode?: 'mcq' | 'station';
        // Tittel vist overst i station-overlay (default "Kombiner gjenstander").
        stationLabel?: string;
        // Krev at disse item-IDene finnes i inventar for at openPuzzle skal fungere.
        requiresItems?: string[];
    };
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
    // Cinematic-sekvens som spilles automatisk etter intro (for "innled-shot" i spillet).
    openingCinematic?: CinematicShot[];
    // Fase 8: etter siste openingCinematic-shot glir kameraet mykt (easeInOut) inn i
    // spillerens orbit-kamera over `glideToPlayerMs` ms, i stedet for å kutte. SKIP
    // kutter rent. Krever openingCinematic.
    openingCinematicEnd?: { glideToPlayerMs: number };
    // Pre-registrerte aktivitets-definisjoner. Kan ogsa opprettes inline i openActivity.
    activities?: ActivityDef[];
    // Stealth-deteksjonssystem. Bak if(config.detection) — null kostnad nar ubrukt.
    detection?: {
        guards: DetectionGuardConfig[];
        // Vis deteksjonsmaler i HUD (standard: true)
        showMeter?: boolean;
    };
}

// ─── Detection System ────────────────────────────────────────────────────────

export interface DetectionGuardConfig {
    characterId: string;
    // Halvvinkel av synsskjeglet i grader (standard 50 -> 100 grader totalt)
    visionAngleDeg?: number;
    // Maks synlighetsavstand i meter (standard 8)
    visionDistance?: number;
    // Stigning per sekund nar spilleren er i kjegle (0..1, standard 0.25)
    detectionRate?: number;
    // Fall per sekund nar spilleren er ute av kjegle (0..1, standard 0.15)
    decayRate?: number;
    // Kalles én gang nar deteksjonsniva nar 1.0
    onFullDetection?: () => void;
    // Flagg-navn som settes automatisk ved full deteksjon
    detectedFlag?: string;
}

// ─── Timed Activity System ────────────────────────────────────────────────────

export interface ActivityDef {
    id: string;
    label: string;
    prompt: string;
    // 'rhythm' = trykk MELLOMROM i takt med beat-indikator
    // 'hold'   = hold MELLOMROM mens feltet fylles
    // 'sustained' = aktiviteten fyller seg automatisk over tid
    variant: 'rhythm' | 'hold' | 'sustained';
    durationMs: number;
    // Rhythm: beat-intervall i ms (default 800). Hold: ignorert.
    windowMs?: number;
    // Andel riktige slag/hold krevd for suksess (0..1, default 0.7). Ignoreres for sustained.
    successThreshold?: number;
    onSuccess?: () => void;
    onFail?: () => void;
    // Legg automatisk til dette item-et ved suksess
    rewardItemId?: string;
    rewardCount?: number;
}

export interface ActivityUIState {
    id: string;
    label: string;
    prompt: string;
    variant: ActivityDef['variant'];
    progress: number;   // 0..1 samlet framdrift
    beatActive: boolean; // rhythm: beat-indikatoren lyser
    holdFill: number;   // hold: 0..1 hvor full hold-baren er
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
        // Station mode-felter
        mode?: 'mcq' | 'station';
        stationLabel?: string;
        ingredientSlots?: string[];   // item-IDer spilleren skal plassere (i orden)
        slotLabels?: string[];        // visningsnavn per slot
        availableItems?: { itemId: string; name: string; count: number }[];
    } | null;
    monolog: MonologUIState | null;
    activity: ActivityUIState | null;
    ended: boolean;
    endText: string;
    showFlash?: boolean;
    paused?: boolean;
    // 0..1 deteksjonsniva fra DetectionSystem (vises i HUD nar > 0)
    detectionLevel?: number;
    debug?: { phase: string; flags: Record<string, unknown> };
    // ── Fase 5 ──
    intro?: { active: boolean; title?: string; subtitle?: string; skippable: boolean } | null;
    qualityTier?: 'low' | 'medium' | 'high';
    // ── Fase 8 ──
    // Sonetittel (sted/kapittel). null = ingen synlig. `key` bumpes hver gang en ny
    // tittel vises så overlayet kan restarte fade-animasjonen selv ved samme tekst.
    zoneTitle?: { title: string; subtitle?: string; key: number; durationMs: number } | null;
    // Ladnings-nivå 0..1 mens spilleren holder F (lad-og-kast). null = lader ikke.
    throwCharge?: number | null;
    // Gjenværende ammunisjon for utrustet launcher (spyd/bue/slynge). null = ingen.
    launcherAmmo?: number | null;
    // Kort handlings-varsel (plukket opp / utrustet). `key` bumpes så overlayet
    // kan restarte fade-animasjonen selv ved samme tekst. null = ingen synlig.
    notice?: { text: string; key: number } | null;
    // Bumpes hver gang spilleren treffer et mål - trigger en hitmarker-blink på sikteet.
    hitMarker?: number | null;
}
