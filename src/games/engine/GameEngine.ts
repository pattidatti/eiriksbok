import * as THREE from 'three';
import type {
    GameConfig,
    GameUIState,
    GameEngineRef,
    DialogNode,
    AABB2D,
    Emotion,
    PlayerMode,
    MonologUIState,
    LightAnimation,
    SceneMatOpts,
    WeatherState,
    VegetationType,
    TreeType,
    NpcRouteConfig,
    DialogCameraFraming,
    CinematicShot,
    PickupOptions,
    PostProcessingConfig,
    ActivityDef,
    CharacterConfig,
    MonologNode,
    MonologTrigger,
    MovingPlatformOptions,
} from './types';
import { TimedActivitySystem } from './systems/TimedActivitySystem';
import { DetectionSystem } from './systems/DetectionSystem';
import { buildCharacter, buildCollectibleMesh, drawFace, lerpParams, EMOTION_PARAMS, updateCharacterAnim, type BuiltCharacter } from './CharacterBuilder';
import { buildWorkshopRoom, buildWorkshopLighting } from './WorldBuilder';
import { buildHangingLight, type HangingLightRef } from './LightBuilder';
import { DustSystem, SparkSystem } from './ParticleSystem';
import { MonologSystem } from './systems/MonologSystem';
import { PostProcessingSystem, resolveTier, type QualityTier } from './systems/PostProcessingSystem';
import { SkySystem } from './systems/SkySystem';
import { createSkyDome } from './systems/SkyDome';
import { TimeOfDaySystem } from './systems/TimeOfDaySystem';
import { WeatherSystem } from './systems/WeatherSystem';
import { VegetationSystem } from './systems/VegetationSystem';
import { FaunaSystem } from './systems/FaunaSystem';
import { CrowdSystem, type CrowdAreaSpec, type CrowdPathSpec, type AddCrowdOptions } from './systems/CrowdSystem';
import { CameraDirector } from './systems/CameraDirector';
import { AIDirector } from './systems/AIDirector';
import { ShadowSystem } from './systems/ShadowSystem';
import { createSceneMat, createToonLikeMat, disposeMaterialCache, getMaterialCacheSize } from './SceneMat';
import { getProceduralTexture, disposeTextureCache } from './TextureManager';
import { DebugHudSystem, type DebugStats } from './systems/DebugHudSystem';
import { InputManager } from './InputManager';
import { AudioSystem } from './systems/AudioSystem';
import { PhotoModeSystem } from './systems/PhotoModeSystem';
import { QuestSystem } from './systems/QuestSystem';
import { InventorySystem } from './systems/InventorySystem';
import { runValidation } from './systems/ConfigValidator';
import type { PhysicsWorld, CharacterControllerHandle } from './systems/PhysicsWorld';
import { MovingPlatformSystem } from './systems/MovingPlatformSystem';
import type { TerrainSystem } from './systems/TerrainSystem';
import type { InteractableSystem, LauncherSlot } from './systems/InteractableSystem';
import type { ProjectileSystem } from './systems/ProjectileSystem';
import { getGameSettings, subscribeGameSettings } from './settings/gameSettings';
import { disposeSceneDeep } from './utils/sceneDispose';
import { runSequence, type SequenceHandle, type SequenceStep } from './utils/SequenceRunner';
import { AssetLoader } from './AssetLoader';
import { SaveSystem, type SaveHooks, type SerializedNpcPos } from './systems/SaveSystem';

// ─── Emotion system ──────────────────────────────────────────────────────────

interface EmotionMorphState {
    fromEmotion: Emotion;
    toEmotion: Emotion;
    progress: number;
    morphDuration: number;
    defaultEmotion: Emotion;
    resetAfterMs?: number;
}

interface BodyTarget { headRotX: number; lArmRotZ: number; rArmRotZ: number; }

const BODY_TARGETS: Record<Emotion, BodyTarget> = {
    glad:       { headRotX: 0,     lArmRotZ: 0,     rArmRotZ: 0 },
    worried:    { headRotX: 0.18,  lArmRotZ: 0.2,   rArmRotZ: -0.2 },
    surprised:  { headRotX: -0.2,  lArmRotZ: 0.4,   rArmRotZ: -0.4 },
    triumphant: { headRotX: -0.05, lArmRotZ: -1.65, rArmRotZ: 1.65 },
};

function easeInOut(t: number): number {
    return t * t * (3 - 2 * t);
}

// Portrett-glyf for dialogboksen (Portrett lower-third). Prioritet: eksplisitt
// node-portrett → karakterens portrett → characterType-emoji → emotion-ansikt → standard.
const PORTRAIT_BY_TYPE: Record<import('./types').CharacterType, string> = {
    scientist: '🧑‍🔬',
    farmer: '🧑‍🌾',
    noble: '🤴',
    monk: '🧙',
};
const PORTRAIT_BY_EMOTION: Record<Emotion, string> = {
    glad: '😊',
    worried: '😟',
    surprised: '😮',
    triumphant: '😌',
};
function resolvePortrait(
    node: import('./types').DialogNode,
    charConfig?: { characterType?: import('./types').CharacterType; portrait?: string }
): string {
    if (node.portrait) return node.portrait;
    if (charConfig?.portrait) return charConfig.portrait;
    if (charConfig?.characterType) return PORTRAIT_BY_TYPE[charConfig.characterType];
    if (node.emotion) return PORTRAIT_BY_EMOTION[node.emotion];
    return '🙂';
}

// Gjenbruksvektorer for god rays-projeksjon (Fase 2.5) — unngår allokering per frame.
const _sunWorldScratch = new THREE.Vector3();
const _sunNdcScratch = new THREE.Vector3();
const _camForwardScratch = new THREE.Vector3();
const _sunToCamScratch = new THREE.Vector3();
// Fotomodus scratch (Fase 3.3).
const _photoFwdScratch = new THREE.Vector3();
const _photoRightScratch = new THREE.Vector3();
const _photoMoveScratch = new THREE.Vector3();
const _photoUpScratch = new THREE.Vector3(0, 1, 0);

// Scratch-vektorer for hot-loopen (update + updateCamera). Gjenbrukes hver frame
// for å unngå GC-trykk på lavt-spesifiserte Chromebooks - IKKE behold referanser
// til disse på tvers av frames.
const _moveDirScratch = new THREE.Vector3();
const _moveFwdScratch = new THREE.Vector3();
const _moveRightScratch = new THREE.Vector3();
const _followCharPosScratch = new THREE.Vector3();
const _followFwdScratch = new THREE.Vector3();
const _followTargetScratch = new THREE.Vector3();
const _npcToPlayerScratch = new THREE.Vector3();
const _playerWorldScratch = new THREE.Vector3();
const _camPivotScratch = new THREE.Vector3();
const _camIdealScratch = new THREE.Vector3();
const _camForwardTmpScratch = new THREE.Vector3();
const _camRightScratch = new THREE.Vector3();
const _camLookTgtScratch = new THREE.Vector3();
const _camClampScratch = new THREE.Vector3();
const _camEyeScratch = new THREE.Vector3();
const _worldUpScratch = new THREE.Vector3(0, 1, 0);
const _physPosScratch = new THREE.Vector3();
const _physDesiredScratch = new THREE.Vector3();
// Platforming-scratch (carry-raycast + mantle ledge-deteksjon)
const _physCarryScratch = new THREE.Vector3();
const _downScratch = new THREE.Vector3(0, -1, 0);
const _upScratch = new THREE.Vector3(0, 1, 0);
const _ledgeFwdScratch = new THREE.Vector3();
const _ledgeAScratch = new THREE.Vector3();
const _ledgeBScratch = new THREE.Vector3();
const _ledgeCScratch = new THREE.Vector3();

// Godtar både det gamle string-formatet ('auto' | 'low' | 'medium' | 'high') og den nye
// PostProcessingConfig-objektformen, og returnerer alltid et normalisert objekt.
type PostProcessingInput = NonNullable<NonNullable<GameConfig['visual']>['postProcessing']> | undefined;
function extractPostProcessing(input: PostProcessingInput): PostProcessingConfig & { quality: NonNullable<PostProcessingConfig['quality']> } {
    if (!input) return { quality: 'auto' };
    if (typeof input === 'string') return { quality: input };
    return { ...input, quality: input.quality ?? 'auto' };
}

interface EngineOptions {
    container: HTMLDivElement;
    config: GameConfig;
    onUIUpdate: (state: Partial<GameUIState>) => void;
    onStart: () => void;
    onEnd: (text: string) => void;
    onCollect?: (name: string) => void;
    // Bro fra CameraDirector til DOM-overlay
    onFade?: (visible: boolean, durationMs: number) => Promise<void>;
}

// Gjør en pickup-label ("Ta øks (E), hold F for å kaste") om til et kort varsel
// ("Tok øks"). Fjerner tast-hint i parentes og oversetter ledende verb til fortid.
function prettifyPickupLabel(label: string): string {
    let name = label.split('(')[0].trim().replace(/[,.]$/, '');
    name = name.replace(/^ta\s+/i, 'Tok ').replace(/^plukk(\s+opp)?\s+/i, 'Tok ');
    if (!/^tok\s/i.test(name)) name = 'Tok ' + name.toLowerCase();
    return name;
}

export class GameEngine {
    scene: THREE.Scene;
    renderer: THREE.WebGLRenderer;
    camera: THREE.PerspectiveCamera;
    config: GameConfig;

    private options: EngineOptions;
    private clock = new THREE.Clock();
    private time = 0;
    private animFrameId = 0;
    private disposed = false;
    private isEnded = false;

    // Post-processing (tiered: all devices get lightweight pass, high-end gets bloom too)
    private postProcessing: PostProcessingSystem;
    private qualityTier: QualityTier;

    // Debug-HUD (Fase 1.6). Toggle med F3 i GameCanvas.
    private debugHudSystem: DebugHudSystem | null = null;

    // Input-abstraksjon (Fase 3.4). Parallelt med det gamle `keys`-objektet —
    // eksisterende kode bruker fortsatt this.keys, mens nye features (fotomodus etc.)
    // kan lese input via inputManager.wasPressed(action).
    readonly inputManager: InputManager;

    // Audio-system (Fase 3.1). Lazy AudioContext opprettes ved første lyd-kall.
    readonly audio: AudioSystem;
    // Audio-spor som venter på flag/phase-trigger. Drenneres av evaluateAudioTriggers().
    private pendingAudioTracks: import('./types').AudioTrackConfig[] = [];

    // Fotomodus (Fase 3.3). P-tast toggler.
    readonly photoMode: PhotoModeSystem = new PhotoModeSystem();

    // Quest/inventar (Fase 4). Instansieres hvis config.questDefs eller
    // config.items er satt — ellers står de som null og condition-sjekker returnerer false.
    private questSystem: QuestSystem | null = null;
    private inventorySystem: InventorySystem | null = null;

    // Visuelle systemer (Fase 1-3)
    private skySystem: SkySystem | null = null;
    private timeOfDaySystem: TimeOfDaySystem;
    private weatherSystem: WeatherSystem | null = null;
    private vegetationSystem: VegetationSystem | null = null;
    private faunaSystem: FaunaSystem | null = null;
    private crowdSystem: CrowdSystem | null = null;
    private cameraDirector: CameraDirector;
    private aiDirector: AIDirector;
    private shadowSystem: ShadowSystem | null = null;
    private roomEnvPmrem: THREE.PMREMGenerator | null = null;
    private sunLight: THREE.DirectionalLight | null = null;
    private ambientLight: THREE.AmbientLight | null = null;
    private hemiLight: THREE.HemisphereLight | null = null;
    // Low-tier kontaktskygge for spilleren, løftet ut av spillergruppa til scenen og
    // projisert på bakken hver frame (ellers følger den spilleren opp i hopp/heis).
    private playerContactShadow: THREE.Mesh | null = null;

    // State
    private phase = 'intro';
    private gameStarted = false;
    private paused = false;
    private dialogActive = false;
    private puzzleActive = false;
    private currentChoices: (() => void)[] = [];
    private collectedIds = new Set<string>();
    private puzzleSolved = false;

    // Puzzle state
    private puzzleStepIndex = 0;
    private puzzleFeedback = '';

    // Player
    private player!: BuiltCharacter;
    private velocity = new THREE.Vector3();
    private onGround = true;
    private yaw = 0;
    private pitch = 0.3;
    private targetYaw = 0;
    private targetPitch = 0.3;
    private mouseLocked = false;
    private keys: Record<string, boolean> = {};
    private playerRadius = 0.4;
    private playerHalfHeight = 0.8;   // halvparten av full kapsel-høyde

    // Fysikk (Fase 4). Initialiseres asynkront etter WASM-lasting. Null hvis deaktivert.
    private physics: PhysicsWorld | null = null;
    private playerCC: CharacterControllerHandle | null = null;
    private interactables: InteractableSystem | null = null;
    private projectileSystem: ProjectileSystem | null = null;
    private physicsReady: Promise<void> | null = null;
    // Fase 8: prosedyralt terreng. Settes av buildTerrain via attachTerrain (i setupScene,
    // før fysikk er klar). initPhysics registrerer heightfield-collideren etterpå.
    private terrain: TerrainSystem | null = null;
    // Fase 5.1: GLTF-assets pre-lastet før startGame (opt-in via config.assets)
    private assetLoader: AssetLoader | null = null;
    private assetsReady: Promise<void> | null = null;
    // Fase 5.2: save/load. Alltid aktiv — config.id er påkrevd så save-nøkkel er stabil.
    private saveSystem: SaveSystem | null = null;
    private pendingPickups: { mesh: THREE.Mesh; opts?: PickupOptions }[] = [];
    // Bevegelige plattformer (Del B). Settes opp i initPhysics; ventende fra setupScene.
    private movingPlatformSystem: MovingPlatformSystem | null = null;
    private pendingPlatforms: { mesh: THREE.Mesh; opts: MovingPlatformOptions }[] = [];
    private pendingInteracts: { mesh: THREE.Mesh; opts: import('./types').InteractOptions }[] = [];

    // Camera
    private camPos = new THREE.Vector3();
    private camTarget = new THREE.Vector3();
    private camDistZoom = 0; // brukerjustert zoom-offset fra musehjul
    private indoorBlend = 0; // smooth overgang innendors/utendors (0=ute, 1=inne)
    private wasIndoors = false;
    // Kameramodus (C bytter). 'third' = orbit over skulder, 'first' = i øyehøyde.
    // Dialog/cinematics overstyrer uansett modus og faller tilbake etterpå.
    private cameraMode: 'third' | 'first' = 'third';
    private shakeAmount = 0;
    private shakeDuration = 0;
    private shakeTimer = 0;

    // Graphics settings state (endring trigger re-kompilering bare ved skyggetype-skifte)
    private unsubscribeSettings: () => void = () => {};
    private lastShadowEnabled: boolean | null = null;
    private lastShadowType: THREE.ShadowMapType | null = null;

    // Adaptiv oppløsning (kun low-tier): skalerer pixelRatio ned når fps svikter og opp
    // igjen når det er headroom. Multipliseres med brukerens renderScale, overskriver den
    // ikke. Hysterese + dwell + cooldown hindrer synlig "pusting".
    private adaptiveScale = 1;
    private adaptiveCooldown = 0;
    private adaptiveBelowTimer = 0;
    private adaptiveAboveTimer = 0;

    // Emotion state per NPC
    private emotionStates = new Map<string, EmotionMorphState>();
    private bodyTargets = new Map<string, BodyTarget>();
    private triumphAnimStates = new Map<string, { t: number; duration: number }>();

    // NPCs and collectibles
    private characters: Map<string, BuiltCharacter & { config: { id: string; name: string; characterType?: import('./types').CharacterType; portrait?: string } }> = new Map();
    private collectibleMeshes: Map<string, { group: THREE.Group; config: { id: string; name: string } }> = new Map();

    // Particles
    private dustSystem?: DustSystem;
    private sparkSystem?: SparkSystem;

    // Lights (for animation)
    private fireLight?: THREE.PointLight;
    private lampLight?: THREE.PointLight;
    private animatedLights: { light: THREE.Light; animation: LightAnimation; base: number }[] = [];
    private lightUpdates: ((dt: number, elapsed: number) => void)[] = [];

    // Proximity detection
    private nearCharacterId: string | null = null;
    private nearCollectibleId: string | null = null;
    private nearPickup = false;
    private nearInteract = false;

    // Persistent UI state (survives per-frame pushUIState calls)
    private activeDialog: GameUIState['dialog'] = null;
    private activePuzzle: GameUIState['puzzle'] = null;
    private activeActivity: GameUIState['activity'] = null;

    // Groups that need scale-in animation
    private revealGroups: THREE.Group[] = [];

    // Running engine animation callback
    private engineRunning = false;
    private engineRunSpeed = 0;
    private onEngineRunUpdate?: (dt: number) => void;

    // Flagg (spill-interne tilstandsvariabler, brukes av dialog-valg og endText)
    private flags: Map<string, unknown> = new Map();

    // Player mode (free = vanlig WASD, seated = låst til forelder-gruppe, scripted = custom)
    private playerMode: PlayerMode = 'free';
    private seatParent: THREE.Group | null = null;
    private seatOffset: [number, number, number] = [0, 0, 0];

    // Indre monolog
    private monologSystem: MonologSystem | null = null;
    private activeMonolog: MonologUIState | null = null;

    // NPCer hvor spillet styrer marker-synlighet manuelt (motor-standardlogikken skal skippes)
    private manualMarkerIds = new Set<string>();

    // Utestående timeouts satt via engine.schedule - kanselleres ved dispose
    private scheduledTimeouts = new Set<ReturnType<typeof setTimeout>>();
    // Aktive sekvenser startet via engine.playSequence - kanselleres ved dispose
    private activeSequences = new Set<SequenceHandle>();
    // Utestående intervals (f.eks. SaveSystem auto-save) - kanselleres ved dispose
    private scheduledIntervals = new Set<ReturnType<typeof setInterval>>();

    // Intro-state (Fase 5)
    private introActive = false;
    private introTimeout: ReturnType<typeof setTimeout> | null = null;
    private introInputBlocked = false;

    // Cinematic-state (Fase 6)
    private cinematicInputBlocked = false;

    // NPC-guided follow state (Fase 6, PlayerMode='scripted')
    private followCharacterId: string | null = null;
    private followSpeed = 1.5;
    private followOffset = 1.5;

    // Timed Activity System (Fase 6)
    private activitySystem = new TimedActivitySystem();
    private activityActive = false;
    private activitySpaceJustPressed = false;

    // Detection System (Fase 6) — null hvis config.detection ikke er satt
    private detectionSystem: DetectionSystem | null = null;
    private lastDetectionLevel = 0;

    constructor(options: EngineOptions) {
        this.options = options;
        this.config = options.config;

        // Valider config. Fatale feil kastes før motoren er halvveis konstruert,
        // slik at agenter ser den eksakte feilen umiddelbart (ikke en nedstrøms crash).
        const issues = runValidation(this.config);
        const fatal = issues.filter((i) => i.level === 'fatal');
        if (fatal.length > 0) {
            throw new Error(
                `GameConfig validering feilet med ${fatal.length} fatal feil:\n` +
                fatal.map((f) => '  - ' + f.message).join('\n')
            );
        }

        const visual = options.config.visual ?? {};
        const ppConfig = extractPostProcessing(visual.postProcessing);
        const tierSetting = getGameSettings().graphics.qualityTier;
        this.qualityTier = resolveTier(tierSetting !== 'auto' ? tierSetting : (ppConfig.quality ?? 'auto'));

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(options.config.world.backgroundColor ?? 0x6b5544);
        this.scene.fog = new THREE.FogExp2(
            new THREE.Color(options.config.world.backgroundColor ?? 0x6b5544),
            options.config.world.fogDensity ?? 0.008
        );

        const far = options.config.world.preset === 'open' ? 400 : 100;
        const initialSize = this.getContainerSize();
        this.camera = new THREE.PerspectiveCamera(60, initialSize.width / initialSize.height, 0.1, far);

        // preserveDrawingBuffer=true trengs for at canvas.toDataURL() skal returnere
        // det renderede bildet (fotomodus-screenshot, Fase 3.3). Liten ytelseskost.
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true,
        });
        this.renderer.setSize(initialSize.width, initialSize.height, false);
        this.renderer.setPixelRatio(this.qualityTier === 'low' ? 1 : Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = this.qualityTier !== 'low';
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = ppConfig.exposure ?? (this.qualityTier === 'low' ? 1.9 : 1.4);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        options.container.appendChild(this.renderer.domElement);

        // Time-of-day + sky må initialiseres FØR buildScene så registrering av sun/ambient kan skje.
        this.timeOfDaySystem = new TimeOfDaySystem(visual.timeOfDay ?? 0.5);
        if (this.qualityTier === 'low') {
            this.timeOfDaySystem.setQualityBoost(1.5);
        }
        this.cameraDirector = new CameraDirector();
        this.aiDirector = new AIDirector();

        if (options.onFade) {
            this.cameraDirector.setFadeCallback(options.onFade);
        }

        // Fase 3.1: audio-system. AudioContext opprettes ved første lyd-kall.
        // MÅ initialiseres FØR buildScene: setupScene kan kalle playAmbient /
        // startProceduralSound direkte.
        this.audio = new AudioSystem();
        if (options.config.audio?.masterVolume !== undefined) {
            this.audio.setMasterVolume(options.config.audio.masterVolume);
        }
        if (options.config.audio?.tracks) {
            // Del i onStart-spor (spilt ved startGame) og trigger-spor (evalueres fra update).
            for (const t of options.config.audio.tracks) {
                this.pendingAudioTracks.push(t);
            }
        }

        this.buildScene();
        this.initWorkshopIbl();

        // Etter at buildScene har lagt til sun/ambient, knytt dem til TimeOfDay.
        // Builders (SeascapeBuilder, WorldBuilder) kan ha lagt hovedsol-lys i scene.userData._mainSunLight / _mainHemiLight.
        const builderSun = this.scene.userData._mainSunLight as THREE.DirectionalLight | undefined;
        const builderHemi = this.scene.userData._mainHemiLight as THREE.HemisphereLight | undefined;
        if (builderSun) this.sunLight = builderSun;
        if (builderHemi) this.hemiLight = builderHemi;

        if (this.sunLight) this.timeOfDaySystem.registerSun(this.sunLight);
        if (this.ambientLight) this.timeOfDaySystem.registerAmbient(this.ambientLight);
        if (this.hemiLight) this.timeOfDaySystem.registerHemisphere(this.hemiLight);

        // Fase 1.3: TimeOfDay driver fog-farge og -tetthet over dagen — men KUN hvis
        // spillet eksplisitt har satt en fogDensityCurve. Uten curve beholdes scene.fog
        // slik GameEngine og WorldConfig.fogDensity definerte den (bakoverkompatibelt).
        // WeatherSystem overstyrer via setFogActive(false) når rain/snow/fog er aktiv.
        if (visual.fogDensityCurve) {
            this.timeOfDaySystem.attachScene(this.scene, visual.fogDensityCurve, true);
        }

        // Sky-system (kun hvis sky === 'procedural')
        const skyMode = visual.sky ?? (options.config.world.preset === 'open' ? 'procedural' : 'none');
        if (skyMode === 'procedural') {
            this.skySystem = new SkySystem(this.scene, visual.skyOptions);
            this.timeOfDaySystem.setSky(this.skySystem);
            const enableIbl = this.qualityTier === 'high';
            void this.skySystem.init().then(() => {
                // Fase 2.4: IBL — kun high-tier. Bake prosedyral himmel til envMap
                // slik at alle PBR-materialer får reflekser fra riktig sky-farge.
                if (enableIbl) this.skySystem?.enableIbl(this.renderer);
                this.timeOfDaySystem.setTimeOfDay(this.timeOfDaySystem.getTimeOfDay());
            });
        } else {
            // LOW-baseline (Fase 9): erstatt flat solid bakgrunn med en billig
            // gradient-dome. Horisontfargen = fogfargen → fjerne objekter blir
            // silhuetter. Domen er occludert (gratis) i lukkede rom.
            const horizon = this.scene.fog instanceof THREE.FogExp2
                ? this.scene.fog.color
                : new THREE.Color(options.config.world.backgroundColor ?? 0x6b5544);
            const domeRadius = Math.min(far * 0.9, 120);
            this.scene.add(createSkyDome(horizon, domeRadius));
        }

        // Initial weather hvis spesifisert
        if (visual.weather) {
            if (!this.weatherSystem) {
                this.weatherSystem = new WeatherSystem(this.scene, this.qualityTier);
                this.weatherSystem.attachTimeOfDay(this.timeOfDaySystem);
                this.weatherSystem.setChangeListener((from, to) => this.handleWeatherChange(from, to));
            }
            this.weatherSystem.setWeather(visual.weather);
        }

        // Trigg en initial TOD-update slik at lyset stemmer fra første frame
        this.timeOfDaySystem.update();

        // På lav tier: boost alle scene-lys som IKKE styres av TimeOfDaySystem
        // (lagt til manuelt i setupScene uten registerMainSunLight/registerMainHemiLight).
        if (this.qualityTier === 'low') {
            const todManaged = new Set<THREE.Light>(
                [this.sunLight, this.hemiLight, this.ambientLight].filter(Boolean) as THREE.Light[]
            );
            this.scene.traverse((obj) => {
                if (obj instanceof THREE.Light && !todManaged.has(obj)) {
                    obj.intensity *= 1.5;
                }
            });
        }

        // Initial NPC-routes
        if (options.config.npcRoutes) {
            for (const r of options.config.npcRoutes) {
                this.aiDirector.assignRoute(r);
            }
        }
        // Fase 4.3: reaktive NPC-behaviors
        if (options.config.npcBehaviors) {
            for (const b of options.config.npcBehaviors) {
                this.aiDirector.assignBehavior(b);
            }
        }

        // Debug-visualisering for AI-waypoints (etter ruter er assigned)
        if (options.config.debug) {
            this.addDebugWaypoints();
        }

        this.setupInput();
        this.setupResize();

        // Fase 3.4: start InputManager parallelt med det gamle keys-systemet.
        this.inputManager = new InputManager();
        this.inputManager.start();

        // Fase 4.2: inventar — opprett FØR quest slik at quest-conditions kan sjekke items.
        if (options.config.items && options.config.items.length > 0) {
            this.inventorySystem = new InventorySystem(options.config.items, options.config.inventorySize);
        }

        // Fase 4.1: quest-system. Trenger engine-ref for flag/inventar/posisjon-lookup.
        if (options.config.questDefs && options.config.questDefs.length > 0) {
            this.questSystem = new QuestSystem(options.config.questDefs, {
                getFlag: (k) => this.flags.get(k),
                inventoryHas: (id) => this.inventorySystem?.has(id) ?? false,
                getPlayerPosition: () => {
                    const v = new THREE.Vector3();
                    this.player.group.getWorldPosition(v);
                    return v;
                },
                setFlag: (k, v) => {
                    this.flags.set(k, v);
                    if (v) this.evaluateAudioTriggers({ flag: k });
                },
                getCharacterPosition: (id) => {
                    const char = this.characters.get(id);
                    if (!char) return null;
                    const v = new THREE.Vector3();
                    char.group.getWorldPosition(v);
                    return v;
                },
            });
        }

        // Post-processing
        this.postProcessing = new PostProcessingSystem(
            this.renderer,
            this.scene,
            this.camera,
            this.qualityTier,
            visual.colorGrading ?? 'warm',
            ppConfig,
        );
        // Fase 2.5: opt-in volumetrisk lys. Kun high-tier + open-preset har råd.
        if (visual.volumetricLight && this.qualityTier === 'high' && options.config.world.preset === 'open') {
            this.postProcessing.setGodRaysEnabled(true);
        }
        void this.postProcessing.init();

        // Debug-HUD (Fase 1.6) — toggle via GameCanvas F3-lytter
        this.debugHudSystem = new DebugHudSystem(this.renderer, {
            getPhase: () => this.phase,
            getQualityTier: () => this.qualityTier,
            getFlags: () => Object.fromEntries(this.flags),
            getPhysicsBodies: () => this.physics?.getBodyCount() ?? 0,
            getMaterialCount: () => getMaterialCacheSize(),
        });

        // Cascaded shadow maps (Fase 2.3) — opt-in, kun open-preset + high-tier.
        // Eksisterende sunLight dimmes av ShadowSystem for å unngå dobbel belysning;
        // CSM lager 3 egne DirectionalLights som tar over både lys og skygger.
        if (visual.shadows === 'cascaded' && options.config.world.preset === 'open' && this.qualityTier === 'high') {
            this.shadowSystem = new ShadowSystem(this.scene, this.camera, this.qualityTier);
            const sunDir = this.timeOfDaySystem.getSunDirection();
            void this.shadowSystem.init(sunDir, this.sunLight).then(() => {
                this.shadowSystem?.registerSceneMaterials();
            });
        }

        // Globale grafikkinnstillinger: apply initial state og lytt på endringer fra meny
        this.applyGameSettings();
        this.unsubscribeSettings = subscribeGameSettings(() => this.applyGameSettings());

        // Init camera basert på faktisk verdensposisjon (setupScene kan ha satt player som
        // barn av et annet objekt via setPlayerMode('seated'), så config.startPosition alene
        // ville gitt en feil start-posisjon og et synlig kamera-snap første frame)
        this.targetYaw = this.yaw;
        this.targetPitch = this.pitch;
        const world = new THREE.Vector3();
        this.player.group.getWorldPosition(world);
        const initPivotY = world.y + 1.7;
        this.camPos.set(
            world.x - Math.sin(this.yaw) * 4.5,
            initPivotY + Math.sin(this.pitch) * 4.5,
            world.z + Math.cos(this.yaw) * 4.5
        );
        this.camTarget.set(world.x, initPivotY, world.z);

        // Init fysikk asynkront (WASM). physicsReady settes slik at startGame kan awaite.
        if (options.config.physics?.enabled !== false) {
            this.physicsReady = this.initPhysics();
        }

        // Fase 5.1: pre-last GLTF-assets asynkront. startGame venter på assetsReady.
        const assetCfg = options.config.assets;
        if (assetCfg && assetCfg.defs.length > 0) {
            this.assetLoader = new AssetLoader();
            this.assetsReady = this.assetLoader.preload(assetCfg);
        }

        // Fase 5.2: save-system (alltid tilgjengelig siden config.id er påkrevd).
        this.saveSystem = new SaveSystem(options.config.id, this.buildSaveHooks());

    }

    // Fase 5.2: bygger hooks for SaveSystem. Håndterer at systemer som QuestSystem
    // og InventorySystem er opt-in (null) — retur av tomme arrays/defaults sørger
    // for at save/load ikke krasjer for minimale spill.
    private buildSaveHooks(): SaveHooks {
        return {
            getPhase: () => this.phase,
            setPhase: (p) => {
                this.phase = p;
                const quest = this.config.quests.find((q) => q.phase === p);
                if (quest) {
                    this.questObjective = quest.objective;
                    this.pushUIState({ questObjective: this.questObjective });
                }
            },
            getFlags: () => this.flags,
            setFlagsBulk: (entries) => {
                this.flags.clear();
                for (const k in entries) this.flags.set(k, entries[k]);
            },
            serializeInventory: () => this.inventorySystem?.serialize() ?? [],
            restoreInventory: (slots) => this.inventorySystem?.restore(slots),
            serializeQuests: () => this.questSystem?.serialize() ?? { quests: [], npcTalkedTo: [] },
            restoreQuests: (data) => this.questSystem?.restore(data),
            serializeRoutes: () => this.aiDirector.serialize(),
            restoreRoutes: (routes) => this.aiDirector.restore(routes),
            serializeNpcs: () => {
                const out: SerializedNpcPos[] = [];
                for (const [id, ch] of this.characters) {
                    const p = ch.group.position;
                    out.push({ id, pos: [p.x, p.y, p.z], rotY: ch.group.rotation.y });
                }
                return out;
            },
            restoreNpcs: (npcs) => {
                for (const n of npcs) {
                    const ch = this.characters.get(n.id);
                    if (!ch) continue;
                    ch.group.position.set(n.pos[0], n.pos[1], n.pos[2]);
                    ch.group.rotation.y = n.rotY;
                }
            },
            getPlayerPose: () => {
                const world = new THREE.Vector3();
                this.player.group.getWorldPosition(world);
                return { pos: [world.x, world.y, world.z], yaw: this.yaw };
            },
            setPlayerPose: (pos, yaw) => {
                // Bruk samme pattern som teleportPlayer i engineRef.
                if (this.player.group.parent && this.player.group.parent !== this.scene) {
                    this.player.group.parent.remove(this.player.group);
                    this.scene.add(this.player.group);
                }
                this.player.group.position.set(pos[0], pos[1], pos[2]);
                this.yaw = yaw;
                this.targetYaw = yaw;
                if (this.playerCC) {
                    this.playerCC.body.setTranslation(
                        { x: pos[0], y: pos[1] + this.playerHalfHeight, z: pos[2] },
                        true,
                    );
                }
            },
            getTimeOfDay: () => this.timeOfDaySystem.getTimeOfDay(),
            setTimeOfDay: (t) => this.timeOfDaySystem.setTimeOfDay(t),
            getWeather: () => this.weatherSystem?.getWeather() ?? { type: 'clear', intensity: 0 },
            setWeather: (w) => this.weatherSystem?.setWeather(w),
        };
    }

    // Oppretter VegetationSystem ved behov og kobler terreng-sampleren hvis et
    // terreng allerede er attached (Fase 8) - så gress-scatter legger seg på bakken.
    private ensureVegetationSystem(): VegetationSystem {
        if (!this.vegetationSystem) {
            this.vegetationSystem = new VegetationSystem(this.scene, this.qualityTier);
            if (this.terrain) {
                const t = this.terrain;
                this.vegetationSystem.setHeightSampler((x, z) => t.getHeight(x, z));
            }
        }
        return this.vegetationSystem;
    }

    private async initPhysics(): Promise<void> {
        const { PhysicsWorld } = await import('./systems/PhysicsWorld');
        const { InteractableSystem } = await import('./systems/InteractableSystem');
        const { ProjectileSystem } = await import('./systems/ProjectileSystem');
        if (this.disposed) return;
        const gravity = this.config.physics?.gravity ?? -18;
        this.physics = await PhysicsWorld.create(gravity);
        if (this.disposed) {
            this.physics.dispose();
            this.physics = null;
            return;
        }
        // Registrer alle userData.solid-meshes i scenen
        this.physics.addStaticFromScene(this.scene);
        // Fase 8: hvis et terreng ble attached i setupScene, registrer heightfield-collideren
        // nå (fysikken var ikke klar synkront). Mesh-en ligger allerede i scenen.
        if (this.terrain) {
            const { heights, rows, cols } = this.terrain.getHeightsColumnMajor();
            const size = this.terrain.getSize();
            this.physics.addHeightfield(heights, rows, cols, size, size);
        }
        // Lag character controller for spilleren, plassert der player-meshen er
        const playerWorld = new THREE.Vector3();
        this.player.group.getWorldPosition(playerWorld);
        this.playerCC = this.physics.createCharacterController(
            this.playerRadius,
            this.playerHalfHeight,
            playerWorld.y + this.playerHalfHeight,
        );
        // Liten spawn-margin (+0.1) så character-controlleren ikke presser capsule ned
        // i gulvet på første frame (gravity + skin-offset-resolusjon).
        this.playerCC.body.setTranslation(
            { x: playerWorld.x, y: playerWorld.y + this.playerHalfHeight + 0.1, z: playerWorld.z },
            true,
        );
        // Hvis spilleren allerede er seated når fysikken blir klar, skru av body
        if (this.playerMode === 'seated') {
            this.playerCC.body.setEnabled(false);
        }
        this.interactables = new InteractableSystem(this.physics, this.camera, this.scene);
        this.interactables.setPlayerGroup(this.player.group);
        // Pickup-feedback: rens label til et kort navn og vis et varsel + lyd.
        this.interactables.setNotify((label) => this.notify(prettifyPickupLabel(label)));
        // Fase 8: prosjektil-system (lette stein/spyd/pil). Deler scene + fysikk.
        this.projectileSystem = new ProjectileSystem(this.scene, this.physics);
        this.interactables.setProjectileSystem(this.projectileSystem);
        for (const p of this.pendingPickups) this.interactables.registerPickup(p.mesh, p.opts);
        this.pendingPickups.length = 0;
        for (const p of this.pendingInteracts) this.interactables.registerInteract(p.mesh, p.opts);
        this.pendingInteracts.length = 0;
        // Bevegelige plattformer (Del B): opprett kinematiske bodies for alt registrert i setupScene.
        this.movingPlatformSystem = new MovingPlatformSystem(this.physics);
        for (const p of this.pendingPlatforms) {
            const handle = this.physics.createKinematicPlatform(p.mesh);
            if (handle) this.movingPlatformSystem.add(handle, p.opts, this.time);
        }
        this.pendingPlatforms.length = 0;
    }

    // ─── Public interface for setupScene callbacks ──────────────────────────

    toonMat(color: number, opts: Record<string, unknown> = {}): THREE.MeshStandardMaterial {
        // Bakoverkompatibelt wrapper — deler material-cache med createSceneMat.
        return createToonLikeMat(color, opts);
    }

    sceneMat(color: number, opts: SceneMatOpts = {}): THREE.MeshStandardMaterial {
        return createSceneMat(color, opts, this.config.visual?.colorGrading);
    }

    screenFlash(): void {
        this.options.onUIUpdate({ /* trigger flash via UI */ });
        // Signal flash via a temporary state flag
        this.flashPending = true;
    }

    cameraShake(amount: number, duration: number): void {
        this.shakeAmount = amount;
        this.shakeDuration = duration;
        this.shakeTimer = 0;
    }

    animateReveal(group: THREE.Group): void {
        group.visible = true;
        group.scale.set(0.01, 0.01, 0.01);
        this.revealGroups.push(group);
        this.screenFlash();
    }

    startEngineAnimation(): void {
        this.engineRunning = true;
        this.cameraShake(0.4, 1.5);
        this.bloomPulse(0.9, 2.0);
    }

    registerEngineRunUpdate(fn: (dt: number) => void): void {
        this.onEngineRunUpdate = fn;
    }

    updateUI(): void {
        this.pushUIState();
    }

    setEmotion(id: string, emotion: Emotion, resetAfterMs?: number): void {
        const char = this.characters.get(id);
        if (!char || !char.characterType) return;

        const existing = this.emotionStates.get(id);
        const fromEmotion = existing?.toEmotion ?? (char.currentEmotion ?? 'glad');

        this.emotionStates.set(id, {
            fromEmotion,
            toEmotion: emotion,
            progress: 0,
            morphDuration: 0.4,
            defaultEmotion: char.defaultEmotion ?? 'glad',
            resetAfterMs,
        });

        this.bodyTargets.set(id, BODY_TARGETS[emotion]);

        if (emotion === 'triumphant') {
            this.triumphAnimStates.set(id, { t: 0, duration: 1.5 });
        }

        char.currentEmotion = emotion;
    }

    // ─── Private setup ───────────────────────────────────────────────────────

    private flashPending = false;

    // IBL for innendørs-spill (workshop-preset). RoomEnvironment gir gratis
    // ambient-refleksjoner på PBR-materialer uten external assets.
    private initWorkshopIbl(): void {
        if (this.config.world.preset !== 'workshop') return;
        void import('three/addons/environments/RoomEnvironment.js').then(({ RoomEnvironment }) => {
            if (this.disposed) return;
            const pmrem = new THREE.PMREMGenerator(this.renderer);
            pmrem.compileEquirectangularShader();
            this.scene.environment = pmrem.fromScene(new RoomEnvironment()).texture;
            this.roomEnvPmrem = pmrem;
        });
    }

    private buildScene(): void {
        // Global ambient baseline - replaces the implicit brightness floor that MeshToonMaterial's
        // gradient map provided (minimum step 80/255 ≈ 0.31). All presets get this.
        // TimeOfDaySystem overstyrer farge/intensitet hvis aktiv.
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        // Midlertidig shim: gamle spill (ford-factory, demo-world) pusher fortsatt til
        // scene.userData.collisionBoxes. PhysicsWorld ignorerer listen, så kollisjonene
        // blir ikke aktive - men pushen krasjer ikke. TODO: migrér disse spillene til
        // mesh.userData.solid = true og fjern shim-en.
        this.scene.userData.collisionBoxes = [];

        // Build room
        const preset = this.config.world.preset;
        if (preset === 'workshop') {
            buildWorkshopRoom(this.scene, this.toonMat.bind(this), this.config.world.roomSize, this.config.world.wallHeight);
            const lights = buildWorkshopLighting(this.scene);
            this.fireLight = lights.fireLight;
            this.lampLight = lights.lampLight;
            this.sparkSystem = new SparkSystem(this.scene);
        }
        // 'open' preset: ingen rom - spillet bygger alt selv via setupScene

        // Dust particles (kun inne i lukkede rom - ute ser det rart ut og klemmer til romgrenser)
        if (preset !== 'open') {
            this.dustSystem = new DustSystem(this.scene, 250, this.config.world.roomSize ?? 20, this.config.world.wallHeight ?? 6);
        }

        // Build player
        const playerCfg = this.config.player;
        this.player = buildCharacter(
            {
                id: 'player',
                name: 'Spiller',
                showName: false,
                position: playerCfg.startPosition,
                colors: playerCfg.colors,
                extras: (g) => {
                    // Default player hat. Merket povHide så den skjules i førsteperson
                    // (ellers dekker den synet).
                    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.15, 3), this.toonMat(0x1a0f08));
                    hat.position.y = 1.78; hat.rotation.y = Math.PI / 6; hat.userData.povHide = true; g.add(hat);
                    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 3), this.toonMat(0x1a0f08));
                    brim.position.y = 1.7; brim.rotation.y = Math.PI / 6; brim.userData.povHide = true; g.add(brim);
                },
            },
            this.toonMat.bind(this),
            this.renderer,
            this.scene,
            this.qualityTier !== 'low'
        );
        this.player.group.userData.isPlayer = true;

        // Low-tier: CharacterBuilder la en blob-kontaktskygge som BARN av spillergruppa.
        // For en spiller som hopper og rir heiser ville den fulgt med opp ("skyggen blir
        // ikke værende på bakken"). Løft den ut til scenen og projiser den på bakken under
        // spilleren hver frame (se updateContactShadow). NPC-er beholder sin barn-blob.
        const pBlob = this.player.group.children.find(
            (c) => (c.userData as { _blobShadow?: boolean })._blobShadow
        );
        if (pBlob) {
            this.player.group.remove(pBlob);
            pBlob.position.set(0, 0, 0);
            this.scene.add(pBlob);
            this.playerContactShadow = pBlob as THREE.Mesh;
        }

        // Build NPCs
        for (const charCfg of this.config.characters) {
            const built = buildCharacter(charCfg, this.toonMat.bind(this), this.renderer, this.scene, this.qualityTier !== 'low');
            this.characters.set(charCfg.id, { ...built, config: { id: charCfg.id, name: charCfg.name, characterType: charCfg.characterType, portrait: charCfg.portrait } });
        }

        // Initialize body targets for characters with a default emotion
        for (const charCfg of this.config.characters) {
            if (charCfg.characterType && charCfg.defaultEmotion) {
                this.bodyTargets.set(charCfg.id, BODY_TARGETS[charCfg.defaultEmotion]);
            }
        }

        // Build collectibles
        for (const colCfg of this.config.collectibles ?? []) {
            const group = buildCollectibleMesh(colCfg.geometry, colCfg.color, this.toonMat.bind(this));
            group.position.set(...colCfg.position);
            group.userData.collectibleId = colCfg.id;
            this.scene.add(group);
            this.collectibleMeshes.set(colCfg.id, { group, config: { id: colCfg.id, name: colCfg.name } });
        }

        // Initialiser MonologSystem — alltid, slik at declarative.addMonolog kan
        // legge til noder på runtime selv om config ikke har monologs.
        this.monologSystem = new MonologSystem(
            this.config.monologs ?? {},
            this.config.monologTriggers ?? [],
            (state) => {
                this.activeMonolog = state;
                this.pushUIState({ monolog: state });
            }
        );
        // Sørg for at config.dialogs er en mutable record (declarative.addNPC
        // merge-er inn her via registerDialogs).
        if (!this.config.dialogs) {
            (this.config as { dialogs: Record<string, DialogNode | DialogNode[]> }).dialogs = {};
        }

        // Let game provide custom assets and wire puzzle callbacks
        if (this.config.setupScene) {
            const ref: GameEngineRef = this.buildEngineRef();
            this.config.setupScene(ref);
        }

        // Bygg deklarative lys fra GameConfig.lights
        for (const cfg of this.config.lights ?? []) {
            const ref: HangingLightRef = buildHangingLight(this.scene, cfg);
            if (cfg.animation && cfg.animation !== 'steady') {
                this.animatedLights.push({ light: ref.light, animation: cfg.animation, base: ref.light.intensity });
            }
            this.lightUpdates.push(ref.update);
        }

        if (this.config.debug) {
            this.addDebugSolidVisualizations();
        }
    }

    private addDebugSolidVisualizations(): void {
        // Visualiser alle userData.solid-meshes som grønne wireframes (inklusive usynlige).
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ff44, wireframe: true });
        const queue: THREE.Object3D[] = [this.scene];
        const visualized = new Set<THREE.Object3D>();
        while (queue.length) {
            const obj = queue.pop()!;
            if (obj.userData.solid && obj instanceof THREE.Mesh && !visualized.has(obj)) {
                visualized.add(obj);
                const viz = new THREE.Mesh(obj.geometry, mat);
                obj.getWorldPosition(viz.position);
                obj.getWorldQuaternion(viz.quaternion);
                obj.getWorldScale(viz.scale);
                this.scene.add(viz);
            }
            for (const child of obj.children) queue.push(child);
        }
    }

    private addDebugWaypoints(): void {
        const routes = this.aiDirector.getRoutes();
        if (routes.length === 0) return;
        const sphereGeo = new THREE.SphereGeometry(0.18, 8, 6);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xffaa22 });
        const lineMat = new THREE.LineBasicMaterial({ color: 0xffaa22 });
        for (const route of routes) {
            // Sfærer for hvert waypoint
            for (const [x, z] of route.waypoints) {
                const sphere = new THREE.Mesh(sphereGeo, sphereMat);
                sphere.position.set(x, 0.18, z);
                this.scene.add(sphere);
            }
            // Linjer mellom waypoints
            if (route.waypoints.length > 1) {
                const points = route.waypoints.map(([x, z]) => new THREE.Vector3(x, 0.05, z));
                const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(lineGeo, lineMat);
                this.scene.add(line);
            }
        }
    }

    private buildEngineRef(): GameEngineRef {
        return {
            scene: this.scene,
            toonMat: this.toonMat.bind(this),
            config: this.config,
            screenFlash: this.screenFlash.bind(this),
            cameraShake: this.cameraShake.bind(this),
            animateReveal: this.animateReveal.bind(this),
            startEngineAnimation: this.startEngineAnimation.bind(this),
            openPuzzle: this.openPuzzle.bind(this),
            handleStationSubmit: (ids: string[]) => this.handleStationSubmit(ids),
            triggerEnd: this.triggerEnd.bind(this),
            updateUI: this.updateUI.bind(this),
            setEmotion: this.setEmotion.bind(this),
            setFlag: <T>(key: string, value: T) => {
                this.flags.set(key, value);
                if (value) this.evaluateAudioTriggers({ flag: key });
                // Fase 5.2: flag-endringer er narrativt vesentlige — be om debounced save.
                this.saveSystem?.requestSave();
            },
            getFlag: <T>(key: string) => this.flags.get(key) as T | undefined,
            setPlayerMode: (mode, opts) => this.setPlayerMode(mode, opts),
            playMonolog: (id: string) => this.monologSystem?.play(id),
            hasSeenMonolog: (id: string) => this.monologSystem?.hasSeen(id) ?? false,
            setPhase: (phase: string) => {
                this.phase = phase;
                // Slå opp tilsvarende quest i config og oppdater oppdragstekst hvis den finnes
                const quest = this.config.quests.find((q) => q.phase === phase);
                if (quest) {
                    this.questObjective = quest.objective;
                    this.pushUIState({ questObjective: this.questObjective });
                }
                this.evaluateAudioTriggers({ phase });
                // Fase 5.2: fase-skift er et naturlig save-punkt.
                this.saveSystem?.save();
            },
            getPhase: () => this.phase,
            openDialog: (key: string) => this.openDialog(key),
            getPlayerPosition: () => {
                const world = new THREE.Vector3();
                this.player.group.getWorldPosition(world);
                return { x: world.x, y: world.y, z: world.z };
            },
            setCharacterMarkerVisible: (id, visible) => {
                const char = this.characters.get(id);
                if (char?.marker) char.marker.visible = visible;
                // Merk at spillet nå styrer denne markøren - motoren skal ikke overstyre
                this.manualMarkerIds.add(id);
            },
            schedule: (callback, delayMs) => {
                if (this.disposed) return;
                const id = setTimeout(() => {
                    this.scheduledTimeouts.delete(id);
                    if (this.disposed) return;
                    callback();
                }, delayMs);
                this.scheduledTimeouts.add(id);
            },
            playSequence: (steps: SequenceStep[]) => {
                const handle = runSequence(
                    {
                        schedule: (fn, ms) => {
                            const id = setTimeout(() => {
                                this.scheduledTimeouts.delete(id);
                                if (this.disposed) return;
                                fn();
                            }, ms);
                            this.scheduledTimeouts.add(id);
                            return () => {
                                clearTimeout(id);
                                this.scheduledTimeouts.delete(id);
                            };
                        },
                        playMonolog: (id) => this.monologSystem?.play(id),
                        isMonologActive: () => this.monologSystem?.isActive() ?? false,
                        waitForMonologEnd: () =>
                            this.monologSystem?.waitForEnd() ?? Promise.resolve(),
                        playCinematic: (shots) => this.runCinematic(shots),
                        isDisposed: () => this.disposed,
                    },
                    steps,
                );
                this.activeSequences.add(handle);
                void handle.done.finally(() => this.activeSequences.delete(handle));
                return handle;
            },
            teleportPlayer: (x, y, z) => {
                // Hvis spilleren fortsatt er barn av en seat-parent, løft den ut først
                if (this.player.group.parent && this.player.group.parent !== this.scene) {
                    const world = new THREE.Vector3();
                    this.player.group.getWorldPosition(world);
                    this.player.group.parent.remove(this.player.group);
                    this.scene.add(this.player.group);
                    this.player.group.position.copy(world);
                }
                this.player.group.position.set(x, y, z);
                // Hold physics-body synkront slik at ingen kollisjoner fyres fra gammel posisjon
                if (this.playerCC) {
                    this.playerCC.body.setTranslation(
                        { x, y: y + this.playerHalfHeight, z },
                        true,
                    );
                    this.playerCC.body.setEnabled(this.playerMode !== 'seated');
                }
            },
            registerAnimatedLight: (light, animation, baseIntensity) => {
                this.animatedLights.push({ light, animation, base: baseIntensity ?? light.intensity });
            },
            registerUpdate: (fn) => {
                this.lightUpdates.push(fn);
            },
            setBloom: (strength) => {
                this.postProcessing?.setBloom(strength);
            },
            setLut: (name) => {
                this.postProcessing?.setLut(name);
            },
            sceneMat: this.sceneMat.bind(this),
            getTexture: (preset, kind) => {
                if (preset === 'water') return undefined; // ingen prosedyral vann-normal i Fase 2
                return getProceduralTexture(preset, kind);
            },
            setTimeOfDay: (t: number) => this.timeOfDaySystem.setTimeOfDay(t),
            getSunDirection: () => this.timeOfDaySystem.getSunDirection().clone(),
            setWeather: (state: WeatherState) => {
                if (!this.weatherSystem) {
                    this.weatherSystem = new WeatherSystem(this.scene, this.qualityTier);
                    this.weatherSystem.attachTimeOfDay(this.timeOfDaySystem);
                    this.weatherSystem.setChangeListener((from, to) => this.handleWeatherChange(from, to));
                }
                this.weatherSystem.setWeather(state);
            },
            addVegetationPatch: (area: AABB2D, density: number, type: VegetationType = 'grass') => {
                this.ensureVegetationSystem().addPatch(area, density, type);
            },
            addTree: (position: [number, number, number], type: TreeType = 'pine') => {
                this.ensureVegetationSystem().addTree(position, type);
            },
            addBirdFlock: (center, opts) => {
                if (!this.faunaSystem) this.faunaSystem = new FaunaSystem(this.scene, this.qualityTier);
                this.faunaSystem.addBirdFlock(center, opts);
            },
            addButterfly: (center, opts) => {
                if (!this.faunaSystem) this.faunaSystem = new FaunaSystem(this.scene, this.qualityTier);
                this.faunaSystem.addButterfly(center, opts);
            },
            addAnimalGroup: (kind, bounds, opts) => {
                if (!this.faunaSystem) this.faunaSystem = new FaunaSystem(this.scene, this.qualityTier);
                this.faunaSystem.addAnimalGroup(kind, bounds, opts);
            },
            addCrowd: (id: string, spec: CrowdAreaSpec | CrowdPathSpec, opts: AddCrowdOptions) => {
                if (!this.crowdSystem) this.crowdSystem = new CrowdSystem(this.scene, this.qualityTier);
                this.crowdSystem.addCrowd(id, spec, opts);
            },
            setCrowdSpeed: (id: string, speed: number) => this.crowdSystem?.setSpeed(id, speed),
            setCrowdVisible: (id: string, visible: boolean) => this.crowdSystem?.setVisible(id, visible),
            assignRoute: (cfg: NpcRouteConfig) => this.aiDirector.assignRoute(cfg),
            setCameraFraming: (framing: DialogCameraFraming, target?: THREE.Vector3) => {
                this.cameraDirector.setFraming(framing, target);
            },
            playCinematic: (shots: CinematicShot[]) => this.runCinematic(shots),
            fadeToBlack: (durationMs?: number) => this.cameraDirector.fadeToBlack(durationMs),
            fadeFromBlack: (durationMs?: number) => this.cameraDirector.fadeFromBlack(durationMs),
            getQualityTier: () => this.qualityTier,
            // Fase 8: terreng. attachTerrain kalles av buildTerrain i setupScene; selve
            // heightfield-collideren registreres i initPhysics når Rapier er klar.
            attachTerrain: (system: TerrainSystem) => {
                this.terrain = system;
                // Koble terreng-sampler til systemer som flytter ting horisontalt og
                // ellers ville svevet: routede NPC-er og gress-scatter.
                const sampler = (x: number, z: number) => system.getHeight(x, z);
                this.aiDirector.setHeightSampler(sampler);
                this.vegetationSystem?.setHeightSampler(sampler);
            },
            getTerrainHeight: (x: number, z: number) => this.terrain?.getHeight(x, z) ?? 0,
            hasTerrain: () => this.terrain !== null,
            showZoneTitle: (title, opts) => this.showZoneTitle(title, opts),
            notify: (text) => this.notify(text),
            flashHitMarker: () => this.flashHitMarker(),
            spawnProjectile: (opts) => this.projectileSystem?.spawnProjectile({
                ...opts,
                onHit: (hit) => {
                    // Standard treff-feedback: bakke/vegg-bom gir et dempet dunk (mål-treff
                    // har egen, kraftigere lyd via addTarget/fiende-onHit).
                    if (!hit.target) {
                        void this.audio.playOneShot('proc:drum-hit', {
                            position: [hit.point.x, hit.point.y, hit.point.z], volume: 0.2,
                        });
                    }
                    opts.onHit?.(hit);
                },
            }),
            addProjectileTarget: (record) => this.projectileSystem?.registerTarget(record),
            removeProjectileTarget: (id) => this.projectileSystem?.removeTarget(id),
            equipLauncher: (slot: LauncherSlot) => this.interactables?.equipLauncher(slot),
            unequipLauncher: () => this.interactables?.unequipLauncher(),
            getLauncherAmmo: () => this.interactables?.getLauncherAmmo() ?? null,
            skipIntro: () => this.skipIntro(),
            openActivity: (def: ActivityDef | string) => this.openActivity(def),
            closeActivity: () => this.closeActivity(),
            registerPickup: (mesh: THREE.Mesh, opts?: PickupOptions) => {
                // Fase 6: hvis toInventory er satt, wrap onPickup slik at addItem kalles
                // automatisk FØR brukerens onPickup. Slik trenger ikke spillkoden å kjenne
                // til den dobbelte intensjonen (legge i inventar + tilpass-callback).
                let wrappedOpts = opts;
                if (opts?.toInventory) {
                    const userOnPickup = opts.onPickup;
                    const inv = opts.toInventory;
                    wrappedOpts = {
                        ...opts,
                        onPickup: () => {
                            this.inventorySystem?.add(inv.itemId, inv.count ?? 1);
                            userOnPickup?.();
                        },
                    };
                }
                if (this.interactables) {
                    this.interactables.registerPickup(mesh, wrappedOpts);
                } else {
                    this.pendingPickups.push({ mesh, opts: wrappedOpts });
                }
            },
            registerInteract: (mesh, opts) => {
                if (this.interactables) {
                    this.interactables.registerInteract(mesh, opts);
                } else {
                    this.pendingInteracts.push({ mesh, opts });
                }
            },
            unregisterInteract: (mesh) => this.interactables?.unregisterInteract(mesh),
            isHoldingItem: () => this.interactables?.isHolding() ?? false,
            dropHeldItem: () => this.interactables?.drop(),
            throwHeldItem: (force?: number) => this.interactables?.throwHeld(force),
            removeStaticCollider: (mesh: THREE.Mesh) => this.physics?.removeMesh(mesh),
            addMovingPlatform: (mesh: THREE.Mesh, opts: MovingPlatformOptions) => {
                // Hopp over i den statiske importøren; plattformen får en kinematisk body.
                mesh.userData.kinematicPlatform = true;
                if (this.physics && this.movingPlatformSystem) {
                    const handle = this.physics.createKinematicPlatform(mesh);
                    if (handle) this.movingPlatformSystem.add(handle, opts, this.time);
                } else {
                    // Fysikk ikke klar ennå (setupScene) - prosesseres i initPhysics.
                    this.pendingPlatforms.push({ mesh, opts });
                }
            },
            playOneShot: (url, opts) => void this.audio.playOneShot(url, opts),
            playAmbient: (url, opts) => this.audio.playAmbient(url, opts),
            resumeAudio: () => this.audio.resume(),
            startProceduralSound: (name, opts) => this.audio.startProcedural(name, opts),
            addMusicLayer: (layerId, url, initialVolume) => this.audio.addMusicLayer(layerId, url, initialVolume),
            setMusicLayer: (layerId, targetVolume, fadeSec) => this.audio.setMusicLayer(layerId, targetVolume, fadeSec),
            questIsCompleted: (id) => this.questSystem?.isCompleted(id) ?? false,
            questIsActive: (id) => this.questSystem?.isActive(id) ?? false,
            startQuest: (id) => this.questSystem?.startQuest(id) ?? false,
            completeObjective: (qId, oId) => this.questSystem?.completeObjective(qId, oId) ?? false,
            addItem: (id, count) => this.inventorySystem?.add(id, count) ?? false,
            removeItem: (id, count) => this.inventorySystem?.remove(id, count) ?? false,
            hasItem: (id) => this.inventorySystem?.has(id) ?? false,
            itemCount: (id) => this.inventorySystem?.count(id) ?? 0,
            // Fase 5.1: asset-pipeline. Returnerer null hvis asset ikke er konfigurert
            // eller ennå ikke ferdig lastet. Assets er garantert klare etter startGame().
            getAsset: (id) => this.assetLoader?.get(id) ?? null,
            cloneAsset: async (id) => (await this.assetLoader?.clone(id)) ?? null,
            // Fase 5.2: save/load
            save: () => this.saveSystem?.save() ?? false,
            load: () => this.saveSystem?.restore() ?? false,
            hasSave: () => this.saveSystem?.hasSave() ?? false,
            clearSave: () => this.saveSystem?.clear(),
            // Deklarativ API
            addCharacter: (cfg: CharacterConfig) => this.addCharacterRuntime(cfg),
            registerDialogs: (dialogs: Record<string, DialogNode | DialogNode[]>) => {
                Object.assign(this.config.dialogs, dialogs);
            },
            registerMonolog: (node: MonologNode) => this.monologSystem?.addNode(node),
            registerMonologTrigger: (trigger: MonologTrigger) => this.monologSystem?.addTrigger(trigger),
        };
    }

    /**
     * Legg til en NPC på runtime (brukes av declarative.addNPC).
     * Parallell til logikken i buildScene som initialiserer NPC-er fra config.characters,
     * men kalles for NPC-er som defineres deklarativt fra setupScene.
     */
    private addCharacterRuntime(cfg: CharacterConfig): void {
        if (this.characters.has(cfg.id)) {
            console.warn(`[GameEngine] Character '${cfg.id}' finnes allerede. Hopper over.`);
            return;
        }
        const built = buildCharacter(cfg, this.toonMat.bind(this), this.renderer, this.scene, this.qualityTier !== 'low');
        this.characters.set(cfg.id, { ...built, config: { id: cfg.id, name: cfg.name, characterType: cfg.characterType, portrait: cfg.portrait } });
        if (cfg.characterType && cfg.defaultEmotion) {
            this.bodyTargets.set(cfg.id, BODY_TARGETS[cfg.defaultEmotion]);
        }
    }

    private setPlayerMode(mode: PlayerMode, opts?: {
        parent?: THREE.Group;
        offset?: [number, number, number];
        followCharacterId?: string;
        followSpeed?: number;
        followOffset?: number;
    }): void {
        this.playerMode = mode;
        if (mode === 'seated') {
            if (opts?.parent) {
                // Flytt spilleren inn som barn av seat-forelder slik at den arver transform
                const prev = this.player.group.parent;
                if (prev && prev !== opts.parent) prev.remove(this.player.group);
                opts.parent.add(this.player.group);
                this.seatParent = opts.parent;
                this.seatOffset = opts.offset ?? [0, 0, 0];
                this.player.group.position.set(...this.seatOffset);
            }
            this.velocity.set(0, 0, 0);
            // Rapier-body skal ikke kollidere mens spilleren er seated
            this.playerCC?.body.setEnabled(false);
        } else if (mode === 'scripted') {
            this.followCharacterId = opts?.followCharacterId ?? null;
            this.followSpeed = opts?.followSpeed ?? 1.5;
            this.followOffset = opts?.followOffset ?? 1.5;
            this.velocity.set(0, 0, 0);
            // Deaktiver physics-body sa gravity ikke trekker spilleren ned
            this.playerCC?.body.setEnabled(false);
        } else if (mode === 'free') {
            // Hvis spilleren var i seat, flytt den tilbake til scenen på verdens-posisjon
            if (this.seatParent && this.player.group.parent === this.seatParent) {
                const world = new THREE.Vector3();
                this.player.group.getWorldPosition(world);
                this.seatParent.remove(this.player.group);
                this.scene.add(this.player.group);
                this.player.group.position.copy(world);
            }
            this.seatParent = null;
            // Sync physics-body til ny verdens-posisjon før vi skrur den på igjen
            if (this.playerCC) {
                const wp = new THREE.Vector3();
                this.player.group.getWorldPosition(wp);
                this.playerCC.body.setTranslation(
                    { x: wp.x, y: wp.y + this.playerHalfHeight, z: wp.z },
                    true,
                );
                this.playerCC.body.setEnabled(true);
            }
        }
    }

    private setupInput(): void {
        const onKeyDown = (e: KeyboardEvent) => {
            this.keys[e.code] = true;

            // Escape = pause / unpause (browser alltid frigir pointer lock ved Escape)
            // Blokkeres under intro så pause-overlay ikke krasjer med IntroOverlay
            if (e.code === 'Escape' && this.gameStarted && !this.isEnded && !this.dialogActive && !this.puzzleActive && !this.introActive && !this.cinematicInputBlocked && !this.activityActive) {
                this.paused = true;
                this.pushUIState({ paused: true });
                return;
            }

            // Space i aktivitet: sett "just pressed"-flagg for rhythm/hold-varianter
            if (e.code === 'Space' && this.activityActive && !e.repeat) {
                this.activitySpaceJustPressed = true;
                return; // forhindre hopp/monolog-skip under aktivitet
            }

            // Space = hopp over aktiv monolog (forhindrer ogsa hopp i samme frame)
            if (e.code === 'Space' && this.monologSystem?.isActive() && !this.dialogActive) {
                this.monologSystem.skip();
                this.keys['Space'] = false;
            }

            // Dialog / puzzle number keys
            if (e.code.startsWith('Digit')) {
                const num = parseInt(e.code.replace('Digit', ''));
                if (this.puzzleActive) {
                    const step = this.config.puzzle?.steps[this.puzzleStepIndex];
                    if (step && num >= 1 && num <= step.options.length) {
                        e.preventDefault();
                        this.handlePuzzleAnswer(num - 1);
                        return;
                    }
                } else if (this.dialogActive && num >= 1 && num <= this.currentChoices.length) {
                    e.preventDefault();
                    this.currentChoices[num - 1]();
                    return;
                }
            }

            // Interact key (blokkert under intro/cinematics sa brukeren ikke kan trigge dialog)
            if (e.code === 'KeyE' && !this.dialogActive && !this.introInputBlocked && !this.cinematicInputBlocked) {
                this.handleInteract();
            }

            // Kast-tast (F). Fase 8: hvis holdt objekt har charge ELLER en launcher er
            // utrustet, blir F en "hold for å lade"-handling (slipp = kast/skyt). Ellers
            // beholdes dagens umiddelbare kast av holdt objekt.
            if (e.code === 'KeyF' && !this.dialogActive && !this.introInputBlocked && !this.cinematicInputBlocked) {
                if (this.interactables?.canCharge()) {
                    if (!e.repeat) this.interactables.beginCharge();
                } else {
                    this.interactables?.tryHandleThrow();
                }
            }

            // Kameramodus-bytte (C): 1.- ↔ 3.-person. Blokkert i kontekster der det ikke
            // gir mening eller ville slåss med override-kameraet.
            if (e.code === 'KeyC' && !e.repeat) {
                this.toggleCameraMode();
            }
        };
        const onKeyUp = (e: KeyboardEvent) => {
            this.keys[e.code] = false;
            // Fase 8: slipp F = kast/skyt med oppbygget ladning.
            if (e.code === 'KeyF') this.interactables?.releaseCharge();
        };

        const onMouseMove = (e: MouseEvent) => {
            if (!this.mouseLocked) return;
            this.targetYaw += e.movementX * 0.003;
            // Pitch-konvensjon: positiv = kamera høyere + ser ned. Mer rom oppover enn før.
            // Førsteperson får videre, symmetrisk klamp (se rett opp/ned).
            const pitchLo = this.cameraMode === 'first' ? -1.5 : -1.2;
            const pitchHi = this.cameraMode === 'first' ? 1.5 : 1.0;
            this.targetPitch = Math.max(pitchLo, Math.min(pitchHi, this.targetPitch + e.movementY * 0.003));
        };

        const onWheel = (e: WheelEvent) => {
            if (!this.mouseLocked) return;
            e.preventDefault();
            const step = 0.5;
            this.camDistZoom = Math.max(-2.0, Math.min(3.5, this.camDistZoom + Math.sign(e.deltaY) * step));
        };

        const onPointerLockChange = () => {
            this.mouseLocked = document.pointerLockElement === this.renderer.domElement;
            if (this.mouseLocked && this.paused) {
                this.paused = false;
                this.pushUIState({ paused: false });
            }
        };

        this.renderer.domElement.addEventListener('click', () => {
            if (this.gameStarted && !this.dialogActive) {
                this.renderer.domElement.requestPointerLock();
            }
        });

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('mousemove', onMouseMove);
        this.renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
        document.addEventListener('pointerlockchange', onPointerLockChange);

        this._cleanupInput = () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('mousemove', onMouseMove);
            this.renderer.domElement.removeEventListener('wheel', onWheel);
            document.removeEventListener('pointerlockchange', onPointerLockChange);
        };
    }
    private _cleanupInput: () => void = () => {};

    // Leser gjeldende globale grafikkinnstillinger og oppdaterer renderer/camera/postprocess.
    // Trygg å kalle ofte: skygge-materialoppdatering skjer bare ved faktisk skyggetype-endring.
    private applyGameSettings(): void {
        const s = getGameSettings().graphics;

        // FOV
        if (Math.abs(this.camera.fov - s.fov) > 0.01) {
            this.camera.fov = s.fov;
            this.camera.updateProjectionMatrix();
        }

        // Render-skala: base fra kvalitets-tier × brukerens skala × adaptiv skala.
        this.applyRenderScale();

        // Skygger: av/lav/høy. Bare flagg material.needsUpdate når type faktisk endres.
        const wantEnabled = s.shadowQuality !== 'off';
        const wantType =
            s.shadowQuality === 'high' ? THREE.PCFSoftShadowMap : THREE.BasicShadowMap;
        const changed =
            this.lastShadowEnabled !== wantEnabled ||
            (wantEnabled && this.lastShadowType !== wantType);
        if (changed) {
            this.renderer.shadowMap.enabled = wantEnabled;
            if (wantEnabled) this.renderer.shadowMap.type = wantType;
            this.lastShadowEnabled = wantEnabled;
            this.lastShadowType = wantType;
            this.scene.traverse((obj) => {
                const mesh = obj as THREE.Mesh;
                const mat = mesh.material;
                if (!mat) return;
                if (Array.isArray(mat)) {
                    for (const m of mat) m.needsUpdate = true;
                } else {
                    (mat as THREE.Material).needsUpdate = true;
                }
            });
        }

        // Post-processing av/på
        this.postProcessing?.setEnabled(s.postProcessing);
    }

    // Effektiv pixelRatio = tier-base × brukerens renderScale × adaptiv skala (low-tier).
    private effectivePixelRatio(): number {
        const s = getGameSettings().graphics;
        const basePR = this.qualityTier === 'low' ? 1 : Math.min(window.devicePixelRatio, 2);
        return basePR * s.renderScale * this.adaptiveScale;
    }

    private applyRenderScale(): void {
        this.renderer.setPixelRatio(this.effectivePixelRatio());
        const sz = this.getContainerSize();
        this.postProcessing?.resize(sz.width, sz.height);
    }

    // Adaptiv kvalitet (kun low-tier): hold 30+ fps ved å skalere pixelRatio. Drop raskt
    // (1s under 28 fps), løft langsomt (3s over 50 fps), med cooldown mellom steg. Medium/
    // high røres ikke - de har headroom og skal beholde full skarphet.
    private updateAdaptiveQuality(dt: number): void {
        if (this.qualityTier !== 'low' || !this.gameStarted || this.paused) return;
        const fps = this.debugHudSystem?.getAvgFps() ?? 0;
        if (fps <= 0) return; // dt-buffer ikke varmt ennå
        if (this.adaptiveCooldown > 0) this.adaptiveCooldown -= dt;

        const MIN_SCALE = 0.7;
        const STEP = 0.1;
        if (fps < 28) {
            this.adaptiveBelowTimer += dt;
            this.adaptiveAboveTimer = 0;
        } else if (fps > 50) {
            this.adaptiveAboveTimer += dt;
            this.adaptiveBelowTimer = 0;
        } else {
            this.adaptiveBelowTimer = 0;
            this.adaptiveAboveTimer = 0;
        }
        if (this.adaptiveCooldown > 0) return;

        if (this.adaptiveBelowTimer >= 1 && this.adaptiveScale > MIN_SCALE) {
            this.adaptiveScale = Math.max(MIN_SCALE, this.adaptiveScale - STEP);
            this.adaptiveBelowTimer = 0;
            this.adaptiveCooldown = 2;
            this.applyRenderScale();
        } else if (this.adaptiveAboveTimer >= 3 && this.adaptiveScale < 1) {
            this.adaptiveScale = Math.min(1, this.adaptiveScale + STEP);
            this.adaptiveAboveTimer = 0;
            this.adaptiveCooldown = 2;
            this.applyRenderScale();
        }
    }

    private getContainerSize(): { width: number; height: number } {
        const rect = this.options.container.getBoundingClientRect();
        // Fallback til window ved initial layout hvis container ikke har målt seg ennå
        const w = rect.width > 0 ? rect.width : window.innerWidth;
        const h = rect.height > 0 ? rect.height : window.innerHeight;
        return { width: w, height: h };
    }

    private setupResize(): void {
        const applyResize = (width: number, height: number) => {
            if (width < 1 || height < 1) return; // container ikke synlig enda / minimert
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height, false);
            this.postProcessing?.resize(width, height);
            // Gjenopprett brukerens render-skala og FOV etter size-endring
            this.applyGameSettings();
        };
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                applyResize(width, height);
            }
        });
        ro.observe(this.options.container);
        const onVis = () => {
            // Når fanen blir synlig igjen, dropp akkumulert dt så physics ikke hopper
            if (!document.hidden) {
                this.clock.getDelta();
                this.physics?.resetAccumulator();
            }
        };
        document.addEventListener('visibilitychange', onVis);
        this._cleanupResize = () => {
            ro.disconnect();
            document.removeEventListener('visibilitychange', onVis);
        };
    }
    private _cleanupResize: () => void = () => {};

    // ─── Game logic ──────────────────────────────────────────────────────────

    async startGame(): Promise<void> {
        // Idempotent: returner umiddelbart hvis spillet allerede er startet (dobbel-klikk-beskyttelse)
        if (this.gameStarted) return;
        // Lås musen synkront mens vi fortsatt er i bruker-gesture-konteksten (før første await).
        this.renderer.domElement.requestPointerLock();
        // Vent på fysikk-WASM hvis den ennå ikke er ferdig lastet
        if (this.physicsReady) {
            try { await this.physicsReady; } catch { /* fortsett uansett */ }
        }
        // Fase 5.1: assets må være klare før setupScene kan referere dem
        if (this.assetsReady) {
            try { await this.assetsReady; } catch { /* loader rapporterer egne feil */ }
        }
        if (this.disposed) return;
        this.gameStarted = true;
        const firstQuest = this.config.quests[0];
        this.phase = firstQuest?.phase ?? 'intro';

        // Initialiser DetectionSystem hvis config.detection er satt
        if (this.config.detection?.guards.length) {
            this.detectionSystem = new DetectionSystem(this.config.detection.guards);
        }

        // Fase 3.1: spill-start er brukergest — trygt å starte audio-kontekst.
        void this.audio.resume();
        this.evaluateAudioTriggers('onStart');

        // Fase 5.2: start auto-save hvert 30s. Interval-ID registreres i
        // scheduledIntervals så den ryddes deterministisk ved dispose.
        if (this.saveSystem) {
            const intervalId = this.saveSystem.startAutoSave(30000);
            this.scheduledIntervals.add(intervalId);
        }

        const intro = this.config.intro;
        if (intro && intro.type !== 'none') {
            void this.runIntro(intro);
        } else {
            this.pushUIState();
        }
    }

    private async runIntro(intro: NonNullable<GameConfig['intro']>): Promise<void> {
        this.introActive = true;
        this.introInputBlocked = true;
        const fadeMs = intro.fadeMs ?? 700;
        const holdMs = intro.durationMs ?? 2500;
        const skippable = intro.skippable !== false;

        // Fase 8: 'zone'-intro = fade inn + sonetittel-overlay (serif), ikke det
        // fullskjerms intro-kortet. Blokkerer input mens tittelen holdes.
        if (intro.type === 'zone') {
            await this.cameraDirector.fadeToBlack(0);
            if (this.disposed || !this.introActive) return;
            await this.cameraDirector.fadeFromBlack(fadeMs);
            if (this.disposed || !this.introActive) return;
            if (intro.title) {
                this.showZoneTitle(intro.title, { subtitle: intro.subtitle, durationMs: holdMs });
            }
            await new Promise<void>((resolve) => {
                this.introTimeout = setTimeout(() => {
                    this.introTimeout = null;
                    resolve();
                }, holdMs);
            });
            if (this.disposed || !this.introActive) return;
            this.endIntro();
            return;
        }

        // Send intro-state til UI
        this.pushUIState({
            intro: {
                active: true,
                title: intro.type === 'title' ? intro.title : undefined,
                subtitle: intro.type === 'title' ? intro.subtitle : undefined,
                skippable,
            },
        });

        // Hver await-grense sjekker introActive så Skip kan avbryte midt i sekvensen
        // (uten å la "spøkelses"-setTimeout starte etter at endIntro allerede er kjørt).
        await this.cameraDirector.fadeToBlack(0);
        if (this.disposed || !this.introActive) return;

        await this.cameraDirector.fadeFromBlack(fadeMs);
        if (this.disposed || !this.introActive) return;

        // Hold tittelen synlig
        await new Promise<void>((resolve) => {
            this.introTimeout = setTimeout(() => {
                this.introTimeout = null;
                resolve();
            }, holdMs);
        });

        if (this.disposed || !this.introActive) return;
        this.endIntro();
    }

    private endIntro(): void {
        if (!this.introActive) return;
        if (this.introTimeout) {
            clearTimeout(this.introTimeout);
            this.introTimeout = null;
        }
        this.introActive = false;
        this.introInputBlocked = false;
        this.pushUIState({ intro: null });

        // Spill av eventuell opening cinematic etter intro er ferdig. openingCinematicEnd
        // (Fase 8) lar kameraet gli mykt inn i spillerkontroll i stedet for å kutte.
        if (this.config.openingCinematic && this.config.openingCinematic.length > 0) {
            void this.runCinematic(
                this.config.openingCinematic,
                this.config.openingCinematicEnd?.glideToPlayerMs,
            );
        }
    }

    openActivity(defOrId: ActivityDef | string): void {
        let def: ActivityDef | undefined;
        if (typeof defOrId === 'string') {
            def = this.config.activities?.find((a) => a.id === defOrId);
            if (!def) {
                console.warn(`[GameEngine] openActivity: ukjent aktivitet-id "${defOrId}"`);
                return;
            }
        } else {
            def = defOrId;
        }
        this.activitySystem.open(def);
        this.activityActive = true;
        document.exitPointerLock();
        this.pushUIState({ activity: this.activitySystem.getProgress() });
    }

    closeActivity(): void {
        if (!this.activityActive) return;
        this.activitySystem.close();
        this.activityActive = false;
        this.activitySpaceJustPressed = false;
        this.pushUIState({ activity: null });
        if (this.gameStarted && !this.isEnded && !this.paused) {
            this.renderer.domElement.requestPointerLock();
        }
    }

    private finishActivity(result: 'success' | 'fail'): void {
        // Snapshot def forst, closeActivity rydder systemet
        const def = this.activitySystem.getProgress();
        if (!def) return;

        // Finn original ActivityDef for callbacks og reward
        const originalDef = this.config.activities?.find((a) => a.id === def.id);

        this.closeActivity();

        if (result === 'success') {
            if (originalDef?.rewardItemId) {
                this.inventorySystem?.add(originalDef.rewardItemId, originalDef.rewardCount ?? 1);
            }
            originalDef?.onSuccess?.();
        } else {
            originalDef?.onFail?.();
        }
    }

    private async runCinematic(
        shots: CinematicShot[],
        endGlideMs?: number,
    ): Promise<void> {
        if (shots.length === 0 || this.disposed) return;
        this.cinematicInputBlocked = true;
        // Fase 8: glide-mål = orbit-idealet for nåværende yaw/pitch (spilleren står
        // stille gjennom cinematicen, så det er trygt å beregne her).
        const endGlide = endGlideMs
            ? { target: this.computeOrbitIdealTransform(), durationMs: endGlideMs }
            : undefined;
        try {
            await this.cameraDirector.playCinematic(shots, endGlide);
        } finally {
            if (!this.disposed) {
                this.cinematicInputBlocked = false;
            }
        }
    }

    skipIntro(): void {
        if (!this.introActive) return;
        // Hopp over hold-perioden, spilleren får kontroll umiddelbart
        this.endIntro();
    }

    private handleInteract(): void {
        const playerPos = new THREE.Vector3();
        this.player.group.getWorldPosition(playerPos);
        // Pickup/drop vinner hvis InteractableSystem konsumerer tasten
        if (this.interactables?.tryHandleInteract(playerPos)) return;
        if (this.nearCharacterId) {
            this.triggerCharacterInteraction(this.nearCharacterId);
        } else if (this.nearCollectibleId) {
            this.collectItem(this.nearCollectibleId);
        }
    }

    private triggerCharacterInteraction(charId: string): void {
        const char = this.characters.get(charId);
        if (!char) return;

        // Fase 4.1: trigger quest-condition "npcTalkedTo".
        this.questSystem?.markNpcTalkedTo(charId);

        // Per-NPC dialog: bruk "{charId}_greeting" hvis den finnes
        if (this.config.dialogs[`${charId}_greeting`]) {
            this.openDialog(`${charId}_greeting`);
            return;
        }

        // Fallback: standard Watt Lab-flyt basert på fase
        if (this.phase === 'intro') {
            this.openDialog('intro');
        } else if (this.phase === 'collecting') {
            if (this.collectedIds.size === (this.config.collectibles?.length ?? 0)) {
                this.phase = 'puzzle';
                this.openDialog('puzzleIntro');
            } else {
                this.openDialog('progress');
            }
        } else if (this.phase === 'puzzle' && !this.puzzleSolved) {
            this.openDialog('puzzleIntro');
        }
    }

    openDialog(key: string): void {
        const node = this.resolveDialog(key);
        if (!node) return;

        this.dialogActive = true;
        document.exitPointerLock();

        const text = typeof node.text === 'function' ? node.text() : node.text;

        this.currentChoices = node.choices.map((choice) => () => {
            // Kort bekreftelses-lyd ved valg (dekker både muse-klikk og talltastene 1-5).
            void this.audio.playOneShot('proc:dialog-choice', { volume: 0.35 });
            if (choice.next) {
                if (choice.action) choice.action();
                this.openDialog(choice.next);
            } else if (choice.action) {
                choice.action();
                this.closeDialog();
                if (node.onEnd) node.onEnd();
            } else {
                this.closeDialog();
                if (node.onEnd) node.onEnd();
            }
        });

        // CameraDirector: OTS-kamera for dialog. 'wide' overstyrer og deaktiverer framing.
        // Finn karakter med matching id eller name (case-insensitive).
        const speakerKey = node.speaker.toLowerCase();
        let speakerChar = this.characters.get(node.speaker);
        if (!speakerChar) {
            for (const [id, char] of this.characters) {
                if (id.toLowerCase() === speakerKey || char.config?.name?.toLowerCase?.() === speakerKey) {
                    speakerChar = char;
                    break;
                }
            }
        }
        if (node.cameraFraming === 'wide') {
            this.cameraDirector.pop();
        } else if (speakerChar) {
            const npcWorld = new THREE.Vector3();
            speakerChar.group.getWorldPosition(npcWorld);
            // Ikke legg til y-offset her - CameraDirector beregner hode-hoyde internt

            const playerWorld = new THREE.Vector3();
            this.player.group.getWorldPosition(playerWorld);

            // NPC-kamera nar NPC snakker, spiller-kamera nar speaker eksplisitt er 'spiller'/'player'
            const side = (speakerKey === 'spiller' || speakerKey === 'player') ? 'player' : 'npc';
            this.cameraDirector.pushDialogFraming(npcWorld, playerWorld, side, this.camera.fov);
        }

        this.pushUIState({
            dialog: {
                visible: true,
                speaker: node.speaker,
                text,
                choices: node.choices.map((c) => ({
                    text: c.text,
                    icon: c.icon,
                    consequenceHint: c.consequenceHint,
                })),
                emotion: node.emotion,
                portrait: resolvePortrait(node, speakerChar?.config),
            },
        });
    }

    private resolveDialog(key: string): DialogNode | undefined {
        const entry = this.config.dialogs[key];
        if (!entry) return undefined;
        if (!Array.isArray(entry)) return entry;
        // Fase 4.4: variant-array — velg første node hvor condition matcher.
        // Sorter slik at noder UTEN condition (fallback) alltid kommer sist. Dette
        // eliminerer fallgruven der en fallback-node plasseres først og dermed
        // skygger for variants som skulle matchet.
        const sorted = [...entry].sort((a, b) => {
            const aFallback = !a.condition;
            const bFallback = !b.condition;
            if (aFallback === bFallback) return 0;
            return aFallback ? 1 : -1;
        });
        for (const node of sorted) {
            if (this.evaluateDialogCondition(node.condition)) return node;
        }
        return undefined;
    }

    // Alle betingelser kombineres med AND. Undefined/tom condition = matcher alltid.
    private evaluateDialogCondition(cond: import('./types').DialogCondition | undefined): boolean {
        if (!cond) return true;
        if (cond.flagsRequired) {
            for (const f of cond.flagsRequired) {
                if (!this.flags.get(f)) return false;
            }
        }
        if (cond.flagsExcluded) {
            for (const f of cond.flagsExcluded) {
                if (this.flags.get(f)) return false;
            }
        }
        if (cond.questCompleted) {
            for (const q of cond.questCompleted) {
                if (!this.questSystem?.isCompleted(q)) return false;
            }
        }
        if (cond.itemInInventory) {
            for (const i of cond.itemInInventory) {
                if (!this.inventorySystem?.has(i)) return false;
            }
        }
        return true;
    }

    closeDialog(): void {
        this.dialogActive = false;
        this.currentChoices = [];
        this.cameraDirector.pop(); // instant cut

        // Hard cut: snap kamera-state tilbake til gameplay-posisjon umiddelbart
        const pw = new THREE.Vector3();
        this.player.group.getWorldPosition(pw);
        const ind = this.scene.userData._indoors === true;
        const pivotH = ind ? 1.5 : 1.7;
        const baseDist = ind ? 2.8 : 4.5;
        const pivot = pw.clone().add(new THREE.Vector3(0, pivotH, 0));
        this.camPos.set(
            pivot.x - Math.sin(this.yaw) * baseDist,
            pivot.y + 0.5,
            pivot.z + Math.cos(this.yaw) * baseDist,
        );
        this.camTarget.copy(pivot);
        this.camera.fov = this.cameraDirector.getBaseFov();
        this.camera.updateProjectionMatrix();

        this.pushUIState({ dialog: null });
        if (this.gameStarted && !this.isEnded && !this.paused && !this.puzzleActive) {
            this.renderer.domElement.requestPointerLock();
        }
    }

    handleDialogChoice(index: number): void {
        if (index >= 0 && index < this.currentChoices.length) {
            this.currentChoices[index]();
        }
    }

    openPuzzle(): void {
        // requiresItems-sjekk: avvis hvis spilleren mangler nodvendige gjenstander
        const puzzle = this.config.puzzle;
        if (puzzle?.requiresItems) {
            const missing = puzzle.requiresItems.filter((id) => !this.inventorySystem?.has(id));
            if (missing.length > 0) {
                console.warn(`[GameEngine] openPuzzle: mangler items: ${missing.join(', ')}`);
                return;
            }
        }
        this.closeDialog();
        this.dialogActive = true;
        this.puzzleActive = true;
        document.exitPointerLock();
        this.puzzleStepIndex = 0;
        this.puzzleFeedback = '';
        this.renderPuzzleStep();
    }

    handlePuzzleAnswer(optionIndex: number): void {
        const puzzle = this.config.puzzle;
        if (!puzzle) return;
        const step = puzzle.steps[this.puzzleStepIndex];
        if (!step) return;
        const option = step.options[optionIndex];
        if (!option) return;

        this.puzzleFeedback = option.feedback;

        if (option.correct) {
            if (step.onCorrect) step.onCorrect();
            this.puzzleStepIndex++;

            if (this.puzzleStepIndex >= puzzle.steps.length) {
                // Puzzle complete
                this.puzzleSolved = true;
                this.dialogActive = false;
                this.puzzleActive = false;
                this.pushUIState({ puzzle: null });
                if (this.gameStarted && !this.isEnded && !this.paused) {
                    this.renderer.domElement.requestPointerLock();
                }

                // Advance quest
                const nextQuest = this.config.quests.find((q) => q.phase === 'puzzleWon');
                if (nextQuest) this.questObjective = nextQuest.objective;
                this.pushUIState({ questObjective: this.questObjective });

                setTimeout(() => this.openDialog('puzzleWin'), 4000);
            } else {
                this.renderPuzzleStep();
            }
        } else {
            this.renderPuzzleStep();
        }
    }

    private questObjective = '';

    private renderPuzzleStep(): void {
        const puzzle = this.config.puzzle;
        if (!puzzle) return;
        const step = puzzle.steps[this.puzzleStepIndex];
        if (!step) return;

        // Station mode: hent tilgjengelige items fra inventar
        let availableItems: { itemId: string; name: string; count: number }[] | undefined;
        if (puzzle.mode === 'station' && this.inventorySystem) {
            availableItems = this.inventorySystem
                .getSlots()
                .filter((s) => s.count > 0)
                .map((s) => ({
                    itemId: s.itemId,
                    name: this.inventorySystem!.getItemDef(s.itemId)?.name ?? s.itemId,
                    count: s.count,
                }));
        }

        this.pushUIState({
            puzzle: {
                visible: true,
                stepIndex: this.puzzleStepIndex,
                stepLabels: puzzle.steps.map((_, i) => `Steg ${i + 1}`),
                question: step.question,
                hint: step.hint,
                feedback: this.puzzleFeedback,
                options: step.options.map((o) => o.text),
                mode: puzzle.mode,
                stationLabel: puzzle.stationLabel,
                ingredientSlots: step.ingredientSlots,
                slotLabels: step.slotLabels,
                availableItems,
            },
        });
    }

    handleStationSubmit(selectedItemIds: string[]): void {
        const puzzle = this.config.puzzle;
        if (!puzzle || puzzle.mode !== 'station') return;
        const step = puzzle.steps[this.puzzleStepIndex];
        if (!step?.ingredientSlots) return;

        const correct =
            selectedItemIds.length === step.ingredientSlots.length &&
            selectedItemIds.every((id, i) => id === step.ingredientSlots![i]);

        if (correct) {
            // Fjern brukte items fra inventar
            for (const itemId of step.ingredientSlots) {
                this.inventorySystem?.remove(itemId, 1);
            }
            this.puzzleFeedback = step.correctFeedback ?? 'Riktig kombinasjon!';
            step.onCorrect?.();
            this.puzzleStepIndex++;

            if (this.puzzleStepIndex >= puzzle.steps.length) {
                this.puzzleSolved = true;
                this.dialogActive = false;
                this.puzzleActive = false;
                this.pushUIState({ puzzle: null });
                if (this.gameStarted && !this.isEnded && !this.paused) {
                    this.renderer.domElement.requestPointerLock();
                }
                const nextQuest = this.config.quests.find((q) => q.phase === 'puzzleWon');
                if (nextQuest) this.questObjective = nextQuest.objective;
                this.pushUIState({ questObjective: this.questObjective });
                setTimeout(() => this.openDialog('puzzleWin'), 4000);
            } else {
                this.renderPuzzleStep();
            }
        } else {
            this.puzzleFeedback = step.incorrectFeedback ?? 'Feil kombinasjon. Prøv igjen.';
            this.renderPuzzleStep();
        }
    }

    private collectItem(id: string): void {
        const col = this.collectibleMeshes.get(id);
        if (!col) return;

        this.collectedIds.add(id);
        this.scene.remove(col.group);
        this.collectibleMeshes.delete(id);
        this.flashPending = true;
        this.options.onCollect?.(col.config.name);

        const total = this.config.collectibles?.length ?? 0;
        const count = this.collectedIds.size;

        // Find matching objective from quests
        const collectQuest = this.config.quests.find((q) => q.phase === 'collecting');
        if (count === total) {
            const returnQuest = this.config.quests.find((q) => q.phase === 'return');
            this.questObjective = returnQuest?.objective ?? 'Gå tilbake!';
        } else {
            this.questObjective = collectQuest?.objective ?? `Funnet ${count}/${total}. Fortsett!`;
        }

        this.phase = 'collecting';
        this.pushUIState({ questObjective: this.questObjective });
    }

    private checkProximity(): void {
        if (this.dialogActive) {
            for (const [, char] of this.characters) {
                if (char.interactLabel) char.interactLabel.visible = false;
            }
            this.nearCharacterId = null;
            this.nearCollectibleId = null;
            this.pushUIState({ showInteractPrompt: false });
            return;
        }

        const INTERACT_DIST = 2.2;
        let closestDist = INTERACT_DIST;
        let nearChar: string | null = null;
        let nearCol: string | null = null;

        const playerWorld = new THREE.Vector3();
        this.player.group.getWorldPosition(playerWorld);

        // Valgfritt filter satt av spillets setupScene - returner false for å ekskludere en karakter
        const filter = this.scene.userData._proximityFilter as ((id: string) => boolean) | undefined;

        const charWorld = new THREE.Vector3();
        for (const [id, char] of this.characters) {
            if (filter && !filter(id)) continue;
            char.group.getWorldPosition(charWorld);
            const d = playerWorld.distanceTo(charWorld);
            if (d < closestDist) {
                closestDist = d;
                nearChar = id;
                nearCol = null;
            }
        }

        for (const [id, col] of this.collectibleMeshes) {
            col.group.getWorldPosition(charWorld);
            const d = playerWorld.distanceTo(charWorld);
            if (d < closestDist) {
                closestDist = d;
                nearChar = null;
                nearCol = id;
            }
        }

        let nearPickup = false;
        let nearInteract = false;
        if (this.interactables) {
            nearPickup = this.interactables.getNearbyPickup(playerWorld, 2.5) !== null;
            nearInteract = this.interactables.getNearbyInteract(playerWorld) !== null;
        }

        const changed =
            nearChar !== this.nearCharacterId ||
            nearCol !== this.nearCollectibleId ||
            nearPickup !== this.nearPickup ||
            nearInteract !== this.nearInteract;
        if (nearChar !== this.nearCharacterId) {
            for (const [id, char] of this.characters) {
                if (char.interactLabel) char.interactLabel.visible = id === nearChar;
            }
        }
        this.nearCharacterId = nearChar;
        this.nearCollectibleId = nearCol;
        this.nearPickup = nearPickup;
        this.nearInteract = nearInteract;

        if (changed) {
            this.pushUIState({ showInteractPrompt: !!(nearChar || nearCol || nearPickup || nearInteract) });
        }
    }

    triggerEnd(): void {
        this.isEnded = true;
        this.dialogActive = false;
        const raw = this.config.endText;
        const text = typeof raw === 'function' ? raw(this.buildEngineRef()) : raw;
        this.options.onEnd(text);
    }

    private bloomPulse(peak: number, duration: number): void {
        this.postProcessing?.bloomPulse(peak, duration * 1000);
    }

    // ─── Push state to React ─────────────────────────────────────────────────

    private activeIntro: GameUIState['intro'] = null;
    // Fase 8: sonetittel-overlay. Persisteres på samme måte som intro/dialog.
    private activeZoneTitle: GameUIState['zoneTitle'] = null;
    private zoneTitleKey = 0;
    // Fase 8: ladnings-meter + ammo. Pollet per frame, pushes kun ved endring.
    private activeThrowCharge: number | null = null;
    private activeLauncherAmmo: number | null = null;
    // Feedback: handlings-varsel (notify) + hitmarker. Keys bumpes per hendelse.
    private activeNotice: GameUIState['notice'] = null;
    private noticeKey = 0;
    private hitMarkerKey = 0;

    private pushUIState(override: Partial<GameUIState> = {}): void {
        if (this.isEnded) return;
        // Persist dialog/puzzle/intro state across calls so per-frame updates don't reset them
        if ('dialog' in override) this.activeDialog = override.dialog ?? null;
        if ('puzzle' in override) this.activePuzzle = override.puzzle ?? null;
        if ('activity' in override) this.activeActivity = override.activity ?? null;
        if ('intro' in override) this.activeIntro = override.intro ?? null;
        if ('zoneTitle' in override) this.activeZoneTitle = override.zoneTitle ?? null;
        if ('throwCharge' in override) this.activeThrowCharge = override.throwCharge ?? null;
        if ('launcherAmmo' in override) this.activeLauncherAmmo = override.launcherAmmo ?? null;
        if ('notice' in override) this.activeNotice = override.notice ?? null;

        const collectibles = this.config.collectibles ?? [];
        const parts = collectibles.map((c) => ({
            id: c.id,
            name: c.name,
            collected: this.collectedIds.has(c.id),
        }));

        const base: GameUIState = {
            started: this.gameStarted,
            questObjective: this.questObjective || this.config.quests[0]?.objective || '',
            questParts: parts,
            showInteractPrompt: !!(this.nearCharacterId || this.nearCollectibleId || this.nearPickup || this.nearInteract),
            dialog: this.activeDialog,
            puzzle: this.activePuzzle,
            activity: this.activeActivity,
            monolog: this.activeMonolog,
            ended: false,
            endText: '',
            paused: this.paused,
            debug: this.config.debug
                ? { phase: this.phase, flags: Object.fromEntries(this.flags) }
                : undefined,
            intro: this.activeIntro,
            qualityTier: this.qualityTier,
            zoneTitle: this.activeZoneTitle,
            throwCharge: this.activeThrowCharge,
            launcherAmmo: this.activeLauncherAmmo,
            notice: this.activeNotice,
        };

        this.options.onUIUpdate({ ...base, ...override });
    }

    // Fase 8: vis en sonetittel som fader inn og forsvinner av seg selv.
    private showZoneTitle(title: string, opts?: { subtitle?: string; durationMs?: number }): void {
        if (this.disposed) return;
        this.zoneTitleKey++;
        const key = this.zoneTitleKey;
        const durationMs = opts?.durationMs ?? 3200;
        this.pushUIState({ zoneTitle: { title, subtitle: opts?.subtitle, key, durationMs } });
        const id = setTimeout(() => {
            this.scheduledTimeouts.delete(id);
            if (this.disposed) return;
            // Bare rydd hvis ingen nyere tittel har overtatt.
            if (this.zoneTitleKey === key) this.pushUIState({ zoneTitle: null });
        }, durationMs);
        this.scheduledTimeouts.add(id);
    }

    // Kort handlings-varsel (plukket opp / utrustet) + lett pickup-lyd. Auto-ryddes.
    notify(text: string): void {
        if (this.disposed || !text) return;
        void this.audio.playOneShot('proc:blip-pickup', { volume: 0.5 });
        this.noticeKey++;
        const key = this.noticeKey;
        this.pushUIState({ notice: { text, key } });
        const id = setTimeout(() => {
            this.scheduledTimeouts.delete(id);
            if (this.disposed) return;
            if (this.noticeKey === key) this.pushUIState({ notice: null });
        }, 1600);
        this.scheduledTimeouts.add(id);
    }

    // Blink hitmarker på sikteet. Bare en key-bump; HUD-en spiller fade-animasjonen.
    flashHitMarker(): void {
        if (this.disposed) return;
        this.hitMarkerKey++;
        this.pushUIState({ hitMarker: this.hitMarkerKey });
    }

    // ─── Game loop ───────────────────────────────────────────────────────────

    start(): void {
        this.animate();
    }

    private animate(): void {
        if (this.disposed) return;
        this.animFrameId = requestAnimationFrame(() => this.animate());
        // Dropp akkumulert dt ved tab-switch eller breakpoint (kan gi hundrevis av millisekunder)
        let rawDt = this.clock.getDelta();
        if (document.hidden || rawDt > 0.25) {
            rawDt = 0;
            this.physics?.resetAccumulator();
        }
        const dt = Math.min(0.05, rawDt);
        // Fase 3.3: i fotomodus fryser spillet — vi kjører bare fri-kamera-update
        // og skipper update() slik at tid, NPCer, fysikk osv. står stille.
        if (this.photoMode.active) {
            this.updatePhotoModeCamera(dt);
        } else {
            this.update(dt);
        }
        // Debug-HUD leser + resetter renderer.info før render, slik at draw calls
        // akkumuleres gjennom hele post-processing-kjeden.
        this.debugHudSystem?.tick(dt);
        this.updateAdaptiveQuality(dt);
        this.postProcessing.render();
        // Nullstill "just-pressed"-flagg for input-abstraksjonen på slutten av frame.
        this.inputManager.endFrame();
    }

    // Fase 3.3: fri-flyging i fotomodus. Bruker samme WASD+mus-states som ordinært,
    // men flytter kameraet direkte i stedet for spilleren.
    private updatePhotoModeCamera(dt: number): void {
        const speed = this.photoMode.flySpeed * (this.keys['ShiftLeft'] || this.keys['ShiftRight'] ? 2.5 : 1);
        _photoFwdScratch.set(Math.sin(this.yaw), 0, -Math.cos(this.yaw));
        _photoRightScratch.set(Math.cos(this.yaw), 0, Math.sin(this.yaw));
        _photoMoveScratch.set(0, 0, 0);
        if (this.keys['KeyW']) _photoMoveScratch.add(_photoFwdScratch);
        if (this.keys['KeyS']) _photoMoveScratch.sub(_photoFwdScratch);
        if (this.keys['KeyD']) _photoMoveScratch.add(_photoRightScratch);
        if (this.keys['KeyA']) _photoMoveScratch.sub(_photoRightScratch);
        if (this.keys['Space']) _photoMoveScratch.add(_photoUpScratch);
        if (this.keys['ControlLeft'] || this.keys['KeyQ']) _photoMoveScratch.sub(_photoUpScratch);
        if (_photoMoveScratch.lengthSq() > 0) {
            _photoMoveScratch.normalize().multiplyScalar(speed * dt);
            this.camPos.add(_photoMoveScratch);
        }
        // Se-retningen styres av yaw/pitch fra mus; regn ut kamera-target.
        this.camTarget.set(
            this.camPos.x + Math.sin(this.yaw) * Math.cos(this.pitch),
            this.camPos.y + Math.sin(this.pitch),
            this.camPos.z - Math.cos(this.yaw) * Math.cos(this.pitch),
        );
        this.camera.position.copy(this.camPos);
        this.camera.lookAt(this.camTarget);
    }

    // Samler debug-stats for DebugHud-overlayet (F3). Trygg å kalle når som helst.
    getDebugStats(): DebugStats | null {
        return this.debugHudSystem?.collect() ?? null;
    }

    // Fase 4.5: weather → gameplay-koblingen. Settes automatisk som listener på
    // WeatherSystem. Oppdaterer 'wet'-flagg og kaller config.onWeatherChange.
    private handleWeatherChange(from: import('./types').WeatherType, to: import('./types').WeatherType): void {
        const isWet = to === 'rain' || to === 'snow' || to === 'fog';
        const wasWet = from === 'rain' || from === 'snow';
        this.flags.set('wet', isWet);
        if (isWet) this.evaluateAudioTriggers({ flag: 'wet' });
        // Fakler med userData._extinguishInRain slukkes i regn/snø.
        // Vi lagrer _savedIntensity KUN hvis lyset ikke allerede er slukket — ellers
        // ville rain → snow overskrevet den originale verdien med 0.
        if (to === 'rain' || to === 'snow') {
            this.scene.traverse((obj) => {
                if (obj.userData._extinguishInRain && (obj as THREE.Light).intensity !== undefined) {
                    const light = obj as THREE.Light;
                    if (obj.userData._savedIntensity === undefined) {
                        obj.userData._savedIntensity = light.intensity;
                    }
                    light.intensity = 0;
                }
            });
        } else if (wasWet) {
            // Gjenopprett lys når været klarner opp.
            this.scene.traverse((obj) => {
                if (obj.userData._extinguishInRain && typeof obj.userData._savedIntensity === 'number') {
                    (obj as THREE.Light).intensity = obj.userData._savedIntensity;
                    obj.userData._savedIntensity = undefined;
                }
            });
        }
        this.config.onWeatherChange?.(from, to, this.buildEngineRef());
    }

    // Fase 4.1: snapshot av quest-status for QuestLog-overlayet (J).
    getQuestSnapshot(): Array<{
        id: string; title: string; description: string;
        status: 'locked' | 'active' | 'completed';
        objectives: Array<{ id: string; label: string; done: boolean }>;
    }> | null {
        if (!this.questSystem) return null;
        return this.questSystem.getAll().map(({ def, state }) => ({
            id: def.id,
            title: def.title,
            description: def.description,
            status: state.status,
            objectives: def.objectives.map((o) => ({
                id: o.id,
                label: o.label,
                done: state.completedObjectives.has(o.id),
            })),
        }));
    }

    // Fase 4.2: snapshot av inventar for InventoryUI-overlayet (I).
    getInventorySnapshot(): {
        slots: Array<{ itemId: string; count: number; name: string; description: string; icon: string }>;
        maxSlots: number;
    } | null {
        if (!this.inventorySystem) return null;
        const size = this.config.inventorySize ?? 16;
        const slots = this.inventorySystem.getSlots().map((s) => {
            const def = this.inventorySystem!.getItemDef(s.itemId);
            return {
                itemId: s.itemId,
                count: s.count,
                name: def?.name ?? s.itemId,
                description: def?.description ?? '',
                icon: def?.icon ?? '?',
            };
        });
        return { slots, maxSlots: size };
    }

    // Fase 3.3: toggle fotomodus. Mens aktiv er update() no-op slik at scenen
    // fryser; kameraet styres fortsatt via mus og gir fri-flyging.
    togglePhotoMode(): boolean {
        if (this.photoMode.active) {
            this.photoMode.exit(this.camPos, this.camTarget);
            // Gjenopprett kameramodus-synlighet (kroppen kan ha vært skjult i 1.-person).
            this.applyCameraModeVisibility();
        } else {
            // Tving hele spilleren synlig så screenshots ikke blir hodeløse.
            this.setPlayerBodyVisible(true);
            this.photoMode.enter(this.camPos, this.camTarget);
        }
        return this.photoMode.active;
    }

    // Bytt mellom 1.- og 3.-person. Returnerer ny modus. Blokkert i kontekster der
    // override-kameraet (dialog/cinematic/foto) eller en låst spiller eier kameraet.
    toggleCameraMode(): 'third' | 'first' {
        if (
            !this.gameStarted ||
            this.isEnded ||
            this.photoMode.active ||
            this.dialogActive ||
            this.paused ||
            this.introInputBlocked ||
            this.cinematicInputBlocked ||
            this.activityActive ||
            this.playerMode !== 'free'
        ) {
            return this.cameraMode;
        }
        this.cameraMode = this.cameraMode === 'third' ? 'first' : 'third';
        // Hold pitch innenfor den nye modusens klamp så bytte ikke gir et hopp.
        const lo = this.cameraMode === 'first' ? -1.5 : -1.2;
        const hi = this.cameraMode === 'first' ? 1.5 : 1.0;
        this.targetPitch = Math.max(lo, Math.min(hi, this.targetPitch));
        // Tilbake til tredjeperson: nullstill FOV til brukerens innstilling (FP-pathen
        // bumper den +6, og ingen andre i tredjeperson-pathen tilbakestiller den).
        if (this.cameraMode === 'third') {
            const baseFov = getGameSettings().graphics.fov;
            if (Math.abs(this.camera.fov - baseFov) > 0.05) {
                this.camera.fov = baseFov;
                this.camera.updateProjectionMatrix();
            }
        }
        this.applyCameraModeVisibility();
        this.notify(this.cameraMode === 'first' ? 'Førsteperson' : 'Tredjeperson');
        return this.cameraMode;
    }

    // Skjul spillerens egen kropp i førsteperson (unngå at kamera står inni meshen),
    // vis den igjen i tredjeperson. Outlines er barn av delene og følger automatisk med.
    private applyCameraModeVisibility(): void {
        this.setPlayerBodyVisible(this.cameraMode !== 'first');
    }

    private setPlayerBodyVisible(visible: boolean): void {
        if (!this.player) return;
        this.player.head.visible = visible;
        this.player.body.visible = visible;
        this.player.lArm.visible = visible;
        this.player.rArm.visible = visible;
        this.player.lLeg.visible = visible;
        this.player.rLeg.visible = visible;
        // Ekstrautstyr (hatt/brem o.l.) merket povHide skjules også i førsteperson.
        this.player.group.traverse((o) => {
            if (o.userData?.povHide) o.visible = visible;
        });
    }

    setPhotoExposure(exposure: number): void {
        this.photoMode.exposure = exposure;
        this.renderer.toneMappingExposure = exposure;
    }

    setPhotoLut(name: string | null): void {
        this.photoMode.lutName = name;
        this.postProcessing?.setLut(name);
    }

    captureScreenshot(): void {
        // preserveDrawingBuffer=true gir oss siste render-frame direkte fra canvas.
        // animate() kjører ~60 FPS så innholdet er garantert ferskt innen 16ms.
        this.photoMode.download(this.renderer.domElement);
    }

    // Fase 5.2: save/load-API eksponert til React-UI (pause-meny).
    save(): boolean {
        return this.saveSystem?.save() ?? false;
    }
    loadSave(): boolean {
        return this.saveSystem?.restore() ?? false;
    }
    hasSave(): boolean {
        return this.saveSystem?.hasSave() ?? false;
    }
    clearSave(): void {
        this.saveSystem?.clear();
    }

    // Fase 3.1: evaluer audio-triggere. Spor som matcher gjeldende tilstand
    // startes og fjernes fra pendingAudioTracks. Kalles ved startGame, setPhase
    // og setFlag — ikke hver frame.
    private evaluateAudioTriggers(reason: 'onStart' | { flag: string } | { phase: string }): void {
        const remaining: typeof this.pendingAudioTracks = [];
        for (const t of this.pendingAudioTracks) {
            let match = false;
            if (t.trigger === 'onStart' && reason === 'onStart') match = true;
            else if (typeof t.trigger === 'object' && typeof reason === 'object') {
                if ('flag' in t.trigger && 'flag' in reason && t.trigger.flag === reason.flag) match = true;
                if ('phase' in t.trigger && 'phase' in reason && t.trigger.phase === reason.phase) match = true;
            }
            if (match) {
                this.startAudioTrack(t);
            } else {
                remaining.push(t);
            }
        }
        this.pendingAudioTracks = remaining;
    }

    private startAudioTrack(t: import('./types').AudioTrackConfig): void {
        if (t.kind === 'ambient') {
            void this.audio.playAmbient(t.url, { loop: t.loop ?? true, volume: t.volume, fadeIn: 1.0 });
            return;
        }
        // spatial
        let target: THREE.Object3D | [number, number, number] | null = null;
        if (t.attachTo) {
            const char = this.characters.get(t.attachTo);
            if (char) target = char.group;
        }
        if (!target && t.position) target = t.position;
        if (!target) return;
        void this.audio.playSpatial(t.url, {
            position: target,
            loop: t.loop ?? true,
            volume: t.volume,
            maxDistance: t.maxDistance,
        });
    }

    private update(dt: number): void {
        if (!this.gameStarted) return;
        this.time += dt;

        // Bevegelige plattformer flyttes FØR spilleren, så carry-deltaet er kjent når
        // updatePhysicsPlayer leser det (og før den ene physics.step() under).
        this.movingPlatformSystem?.update(this.time);

        // Player movement
        const WALK_SPEED = this.config.physics?.walkSpeed ?? 6;
        const RUN_SPEED = this.config.physics?.runSpeed ?? 11;
        const JUMP = this.config.physics?.jump?.velocity ?? 7;
        const GRAV = this.config.physics?.gravity ?? -18;
        const SPEED = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) ? RUN_SPEED : WALK_SPEED;
        const moveDir = _moveDirScratch.set(0, 0, 0);

        const canMove = !this.dialogActive && !this.introInputBlocked && !this.cinematicInputBlocked && !this.activityActive && this.playerMode === 'free';

        if (canMove) {
            const fwd = _moveFwdScratch.set(Math.sin(this.yaw), 0, -Math.cos(this.yaw));
            const right = _moveRightScratch.set(Math.cos(this.yaw), 0, Math.sin(this.yaw));
            if (this.keys['KeyW']) moveDir.add(fwd);
            if (this.keys['KeyS']) moveDir.sub(fwd);
            if (this.keys['KeyD']) moveDir.add(right);
            if (this.keys['KeyA']) moveDir.sub(right);
            if (moveDir.lengthSq() > 0) moveDir.normalize();
        }

        if (this.playerMode === 'free') {
            if (this.physics && this.playerCC) {
                this.updatePhysicsPlayer(dt, moveDir, SPEED, JUMP, GRAV);
            } else {
                // Fallback for umigrerte spill (physics: { enabled: false }) og for frames
                // før WASM er lastet: gjenskaper den gamle enkle bevegelsen med gravity
                // og y=0-clamp, uten kollisjon.
                this.velocity.x = moveDir.x * SPEED;
                this.velocity.z = moveDir.z * SPEED;
                if (this.keys['Space'] && this.onGround && !this.dialogActive) {
                    this.velocity.y = JUMP;
                    this.onGround = false;
                }
                this.velocity.y += GRAV * dt;
                this.player.group.position.addScaledVector(this.velocity, dt);
                if (this.player.group.position.y <= 0) {
                    this.player.group.position.y = 0;
                    this.velocity.y = 0;
                    this.onGround = true;
                }
                if (this.config.world.preset !== 'open') {
                    const hw = (this.config.world.roomSize ?? 20) / 2 - 0.6;
                    this.player.group.position.x = Math.max(-hw, Math.min(hw, this.player.group.position.x));
                    this.player.group.position.z = Math.max(-hw, Math.min(hw, this.player.group.position.z));
                }
            }
        } else if (this.playerMode === 'seated') {
            // Spiller-posisjon er lokal til seat-parent; hold den fast ved offset
            this.player.group.position.set(...this.seatOffset);
            this.velocity.set(0, 0, 0);
        } else if (this.playerMode === 'scripted') {
            if (this.followCharacterId) {
                const char = this.characters.get(this.followCharacterId);
                if (char) {
                    const charPos = char.group.getWorldPosition(_followCharPosScratch);
                    // Retningsvektor NPC-en ser mot (lokal Z-akse i world-rommet)
                    const charFwd = _followFwdScratch.set(
                        Math.sin(char.group.rotation.y),
                        0,
                        Math.cos(char.group.rotation.y),
                    );
                    // Mal-posisjon: bak NPC-en med followOffset meter
                    const targetPos = _followTargetScratch.copy(charPos)
                        .addScaledVector(charFwd, -this.followOffset);
                    // Behold spillerens Y (viktig over ujevnt terreng)
                    targetPos.y = this.player.group.position.y;
                    const toTarget = targetPos.sub(this.player.group.position);
                    const dist = toTarget.length();
                    if (dist > 0.1) {
                        const step = Math.min(dist, this.followSpeed * dt);
                        toTarget.normalize();
                        this.player.group.position.addScaledVector(toTarget, step);
                        this.player.group.rotation.y = Math.atan2(toTarget.x, toTarget.z);
                    }
                }
            }
            this.velocity.set(0, 0, 0);
        }

        // Advance physics-world én eller flere fixed substeps etter input, før vi leser tilbake transform
        this.physics?.step(dt);
        this.physics?.syncMeshes();
        // Hvis fysikk er aktiv og spilleren er i free-modus, synkroniser mesh fra body
        if (this.physics && this.playerCC && this.playerMode === 'free') {
            const t = this.playerCC.body.translation();
            this.player.group.position.set(t.x, t.y - this.playerHalfHeight, t.z);
            this.updateContactShadow(t.x, t.y - this.playerHalfHeight, t.z);
        }
        this.interactables?.update(dt);
        this.projectileSystem?.update(dt);

        // Fase 8: avbryt lading rent hvis spilleren mister kontroll (dialog/cinematic/
        // pause/ikke-fri modus), ellers ville ladningen hengt.
        if (this.interactables?.isCharging() &&
            (this.dialogActive || this.cinematicInputBlocked || this.paused || this.playerMode !== 'free')) {
            this.interactables.cancelCharge();
        }

        // Fase 8: push ladnings-meter + ammo til HUD kun ved endring.
        if (this.interactables) {
            const charge = this.interactables.getCharge();
            const ammo = this.interactables.getLauncherAmmo();
            if (charge !== this.activeThrowCharge || ammo !== this.activeLauncherAmmo) {
                this.pushUIState({ throwCharge: charge, launcherAmmo: ammo });
            }
        }

        // Rotate player to face movement direction
        if (moveDir.lengthSq() > 0.1) {
            const tgt = Math.atan2(moveDir.x, moveDir.z);
            let diff = tgt - this.player.group.rotation.y;
            while (diff > Math.PI) diff -= 2 * Math.PI;
            while (diff < -Math.PI) diff += 2 * Math.PI;
            this.player.group.rotation.y += diff * Math.min(1, dt * 12);
        }

        // Walk animation
        const { body, lArm, rArm, lLeg, rLeg } = this.player;
        const moving = moveDir.lengthSq() > 0.1 && this.onGround;
        if (moving) {
            body.position.y = 0.9 + Math.abs(Math.sin(this.time * 10) * 0.05);
            lLeg.rotation.x = Math.sin(this.time * 10) * 0.6;
            rLeg.rotation.x = -Math.sin(this.time * 10) * 0.6;
            lArm.rotation.x = -Math.sin(this.time * 10) * 0.4;
            rArm.rotation.x = Math.sin(this.time * 10) * 0.4;
        } else {
            for (const m of [lLeg, rLeg, lArm, rArm]) m.rotation.x *= 0.85;
            body.position.y = 0.9;
        }

        // Hopp/landings-juice (Del A): squash ved landing, ease tilbake mot 1.
        // Jump-strekket settes i updatePhysicsPlayer; her eases gruppe-skalaen tilbake.
        if (this.landSquashTimer > 0) {
            this.landSquashTimer = Math.max(0, this.landSquashTimer - dt);
            const k = this.landSquashTimer / 0.18; // 1 → 0
            this.player.group.scale.set(1 + 0.18 * k, 1 - 0.22 * k, 1 + 0.18 * k);
        } else {
            const sc = this.player.group.scale;
            const k = Math.min(1, dt * 12);
            sc.x += (1 - sc.x) * k;
            sc.y += (1 - sc.y) * k;
            sc.z += (1 - sc.z) * k;
        }

        // NPC animations
        for (const [id, char] of this.characters) {
            const hasRoute = this.aiDirector.hasRoute(id);

            // Sittende eller høytplasserte NPCer (f.eks. mannskap i båt) kan spesifisere
            // en base-Y i userData så sin-bob ikke rykker dem ned til gulvet.
            // NPCer med aktiv rute styres av AIDirector og skal ikke få sin-bob (overstyrer posisjon).
            if (!hasRoute) {
                // Fase 8: på terreng er base-Y bakkehøyden ved NPC-ens x/z (med mindre
                // spillet har satt en eksplisitt bobBase, f.eks. mannskap i en båt).
                const bobBase =
                    (char.group.userData.bobBase as number | undefined) ??
                    (this.terrain
                        ? this.terrain.getHeight(char.group.position.x, char.group.position.z)
                        : 0);
                char.group.position.y = bobBase + Math.sin(this.time * 1.5) * 0.03;

                // Roter mot spiller når i nærheten (kun for stasjonære NPCer)
                const toPlayer = _npcToPlayerScratch.subVectors(
                    this.player.group.position,
                    char.group.position
                );
                char.group.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);
            }

            if (char.marker) {
                char.marker.position.y = 2.2 + Math.sin(this.time * 3) * 0.12;
                (char.marker.material as THREE.MeshBasicMaterial).opacity =
                    0.5 + Math.sin(this.time * 4) * 0.5;

                // Hvis spillet har tatt manuell kontroll over markøren, ikke overstyr
                if (!this.manualMarkerIds.has(id)) {
                    const showMarker = this.phase === 'intro' ||
                        (this.phase === 'collecting' && this.collectedIds.size === (this.config.collectibles?.length ?? 0)) ||
                        this.phase === 'puzzle';
                    char.marker.visible = showMarker;
                }
            }
        }

        // ── Emotion face morph ─────────────────────────────────────────────────
        for (const [id, ms] of this.emotionStates) {
            if (ms.progress < 1) {
                ms.progress = Math.min(1, ms.progress + dt / ms.morphDuration);
                const char = this.characters.get(id);
                if (char?.faceCtx && char.faceTexture && char.characterType) {
                    const t = easeInOut(ms.progress);
                    const p = lerpParams(EMOTION_PARAMS[ms.fromEmotion], EMOTION_PARAMS[ms.toEmotion], t);
                    drawFace(char.faceCtx, p, char.characterType);
                    char.faceTexture.needsUpdate = true;
                }
            }
            if (ms.resetAfterMs !== undefined && ms.progress >= 1) {
                ms.resetAfterMs -= dt * 1000;
                if (ms.resetAfterMs <= 0) {
                    this.setEmotion(id, ms.defaultEmotion);
                    // setEmotion replaced this map entry; no explicit delete needed
                }
            }
        }

        // ── Body pose lerp ─────────────────────────────────────────────────────
        for (const [id, target] of this.bodyTargets) {
            const char = this.characters.get(id);
            if (!char) continue;
            const spd = Math.min(1, dt * 5);
            char.head.rotation.x += (target.headRotX - char.head.rotation.x) * spd;
            char.lArm.rotation.z += (target.lArmRotZ - char.lArm.rotation.z) * spd;
            char.rArm.rotation.z += (target.rArmRotZ - char.rArm.rotation.z) * spd;
        }

        // ── Triumphant arm-V one-shot ──────────────────────────────────────────
        for (const [id, anim] of this.triumphAnimStates) {
            anim.t = Math.min(1, anim.t + dt / anim.duration);
            const char = this.characters.get(id);
            if (char) {
                char.head.position.y = 1.55 + Math.sin(anim.t * Math.PI * 2) * 0.04 * (1 - anim.t);
            }
            if (anim.t >= 1) this.triumphAnimStates.delete(id);
        }

        // Collectible hover animations
        for (const col of this.collectibleMeshes.values()) {
            const base = col.group.userData.baseMesh as THREE.Mesh | undefined;
            const ring = col.group.userData.ring as THREE.Mesh | undefined;
            const pillar = col.group.userData.pillar as THREE.Mesh | undefined;

            if (base) {
                base.position.y = Math.sin(this.time * 2 + col.group.position.x) * 0.15;
                base.rotation.y += dt * 1.5;
            }
            if (ring) {
                ring.rotation.z += dt * 0.5;
                (ring.material as THREE.MeshBasicMaterial).opacity =
                    0.4 + Math.sin(this.time * 3) * 0.3;
            }
            if (pillar) {
                (pillar.material as THREE.MeshBasicMaterial).opacity =
                    0.08 + Math.sin(this.time * 2) * 0.07;
            }
        }

        // Reveal animations
        for (let i = this.revealGroups.length - 1; i >= 0; i--) {
            const g = this.revealGroups[i];
            if (g.scale.x < 1) {
                const ns = Math.min(1, g.scale.x + dt * 2.5);
                const os = ns >= 0.95 ? 1 + Math.sin(((ns - 0.95) / 0.05) * Math.PI) * 0.04 : ns;
                g.scale.setScalar(os);
                if (ns >= 1) {
                    g.scale.setScalar(1);
                    this.revealGroups.splice(i, 1);
                }
            }
        }

        // Engine run animation
        if (this.engineRunning) {
            this.engineRunSpeed = Math.min(1, this.engineRunSpeed + dt * 0.4);
        }
        if (this.onEngineRunUpdate && this.engineRunSpeed > 0) {
            this.onEngineRunUpdate(dt);
        }

        // Particles
        this.dustSystem?.update(dt);
        if (this.sparkSystem) {
            this.sparkSystem.update(dt, -7, -7);
        }

        // Game-specific scene updates (e.g., forge animation, engine animation)
        const forgeUpdate = this.scene.userData._forgeUpdate as ((dt: number) => void) | undefined;
        if (forgeUpdate) forgeUpdate(dt);

        if (this.engineRunning) {
            const engineRunUpdate = this.scene.userData._engineRunUpdate as ((dt: number) => void) | undefined;
            if (engineRunUpdate) engineRunUpdate(dt);
        }

        // Light animation
        if (this.fireLight) {
            this.fireLight.intensity = 1.8 + Math.sin(this.time * 12) * 0.4 + Math.random() * 0.3;
        }
        if (this.lampLight) {
            this.lampLight.intensity = 0.7 + Math.sin(this.time * 15) * 0.08 + Math.random() * 0.05;
        }
        for (const al of this.animatedLights) {
            switch (al.animation) {
                case 'flicker':
                    al.light.intensity = al.base * (0.85 + Math.sin(this.time * 14) * 0.08 + Math.random() * 0.15);
                    break;
                case 'flicker-soft':
                    al.light.intensity = al.base * (0.9 + Math.sin(this.time * 15) * 0.07 + Math.random() * 0.05);
                    break;
                case 'pulse':
                    al.light.intensity = al.base * (0.8 + Math.sin(this.time * 2.5) * 0.2);
                    break;
            }
        }
        for (const fn of this.lightUpdates) fn(dt, this.time);

        // Post-processing tick
        this.postProcessing.update(dt);

        // TimeOfDay (oppdaterer sun/sky/ambient farger ved endringer)
        this.timeOfDaySystem.update();

        // Fase 3.1: oppdater audio-listener til kameraets posisjon + forward-vektor.
        this.camera.getWorldDirection(_camForwardScratch);
        this.audio.update(this.camera.position, _camForwardScratch);

        // Fase 4.1: evaluer quests — sjekker flagg, inventar, posisjon og NPC-samtaler.
        const changedQuests = this.questSystem?.update() ?? [];
        if (changedQuests.length > 0) {
            const active = this.questSystem!.getAll().find((q) => q.state.status === 'active');
            if (active) {
                this.questObjective = active.def.description;
                this.pushUIState({ questObjective: this.questObjective });
            }
        }
        // Fase 4.1 (post-verifisering): synkroniser worldspace-markers mot aktive objectives.
        this.questSystem?.updateMarkers(this.scene);

        // CSM: hold sol-retning synkronisert + oppdater cascade-frustum hver frame
        if (this.shadowSystem?.isActive()) {
            this.shadowSystem.setLightDirection(this.timeOfDaySystem.getSunDirection());
            this.shadowSystem.update();
        }

        // Fase 2.5: projiser sol til skjerm-koordinater for god rays-pass.
        // Solen regnes som synlig kun hvis over horisonten (y>0), foran kameraet
        // (sjekket via kamera-forward-akse), og i kamera-frustum.
        {
            const sunDir = this.timeOfDaySystem.getSunDirection();
            // Plasser "solen" langt borte i sin retning — posisjonert fra kameraet
            // slik at projeksjonen blir konsistent selv når kameraet flytter seg.
            const sunWorld = _sunWorldScratch.copy(sunDir).multiplyScalar(200).add(this.camera.position);
            // Dot-produkt med kamera-forward: > 0 betyr foran kameraet. Trengs fordi
            // Vector3.project() kan gi misvisende NDC for punkter bak kameraet.
            this.camera.getWorldDirection(_camForwardScratch);
            const toSun = _sunToCamScratch.copy(sunWorld).sub(this.camera.position);
            const inFront = toSun.dot(_camForwardScratch) > 0;
            const sunNdc = _sunNdcScratch.copy(sunWorld).project(this.camera);
            const onScreen = sunNdc.x > -1.4 && sunNdc.x < 1.4 && sunNdc.y > -1.4 && sunNdc.y < 1.4;
            const aboveHorizon = sunDir.y > 0.05;
            const isIndoors = this.scene.userData._indoors === true;
            this.postProcessing?.updateGodRays(
                (sunNdc.x + 1) * 0.5,
                (sunNdc.y + 1) * 0.5,
                onScreen && aboveHorizon && inFront && !isIndoors,
            );
        }

        // Vær (regn/snø/tåke)
        if (this.weatherSystem) {
            const playerWorld = this.player.group.getWorldPosition(_playerWorldScratch);
            this.weatherSystem.update(dt, playerWorld.x, playerWorld.z);
        }

        // Vegetasjon (vind-shader-tid)
        this.vegetationSystem?.update(dt, this.camera);
        this.crowdSystem?.update(dt, this.camera);

        // Fauna (fugler, sommerfugler, beitende dyr)
        this.faunaSystem?.update(dt, this.camera);

        // CameraDirector (lerp-state)
        this.cameraDirector.update(dt);

        // AIDirector (NPC waypoint-vandring + reactive behaviors) - blokk når dialog/monolog er aktiv
        const blocked = this.dialogActive || (this.monologSystem?.isActive() ?? false);
        const playerWorldPos = this.player.group.getWorldPosition(_playerWorldScratch);
        this.aiDirector.update(dt, this.characters, blocked, playerWorldPos, (k, v) => {
            this.flags.set(k, v);
            if (v) this.evaluateAudioTriggers({ flag: k });
        });

        // Walk-cycle for NPCer (drevet av AI-flagg satt i userData._isWalking)
        for (const char of this.characters.values()) {
            updateCharacterAnim(char, dt);
        }

        // Handle flash
        if (this.flashPending) {
            this.flashPending = false;
            this.options.onUIUpdate({ showFlash: true });
            setTimeout(() => this.options.onUIUpdate({ showFlash: false }), 200);
        }

        // Proximity
        this.checkProximity();

        // Indre monolog (trigger-volumer og progresjon). Pauses mens en blokkerende
        // bunn-overlay er oppe (dialog/puzzle/aktivitet) — indre tanke og samtale skal
        // ikke vises samtidig, og en aktiv monolog skal fryse i stedet for å rulle/avslutte
        // usett bak boksen. Den gjenopptas der den slapp når overlayen lukkes.
        if (this.monologSystem && !this.dialogActive && !this.puzzleActive && !this.activityActive) {
            const world = this.player.group.getWorldPosition(_playerWorldScratch);
            this.monologSystem.update(dt, { x: world.x, z: world.z }, this.phase);
        }

        // Game-spesifikk per-frame hook (kalles etter alt annet sa spill kan lese/overskrive posisjon)
        const customUpdate = this.scene.userData._customUpdate as ((dt: number, time: number) => void) | undefined;
        if (customUpdate) customUpdate(dt, this.time);

        // Timed Activity System tick
        if (this.activityActive) {
            const spaceHeld = !!this.keys['Space'];
            const result = this.activitySystem.update(dt, this.activitySpaceJustPressed, spaceHeld);
            this.activitySpaceJustPressed = false;

            const prog = this.activitySystem.getProgress();
            if (prog) this.pushUIState({ activity: prog });

            if (result !== 'ongoing') {
                this.finishActivity(result);
            }
        } else {
            this.activitySpaceJustPressed = false;
        }

        // Detection System tick
        if (this.detectionSystem && this.config.detection) {
            this.detectionSystem.update(
                dt,
                this.player.group,
                this.characters,
                this.physics,
                (k, v) => this.flags.set(k, v),
            );
            const level = this.detectionSystem.getLevel();
            const showMeter = this.config.detection.showMeter !== false;
            if (showMeter && Math.abs(level - this.lastDetectionLevel) > 0.005) {
                this.lastDetectionLevel = level;
                this.pushUIState({ detectionLevel: level });
            }
        }

        // Camera
        this.updateCamera(dt);
    }

    // Fase 8: beregn spillerens orbit-ideal-transform (pos/lookAt/fov) for NÅVÆRENDE
    // yaw/pitch UTEN å committe noe. Brukes som glide-mål for openingCinematicEnd, så
    // kameraet lander nøyaktig der orbit-kameraet ville stått - ingen snap når
    // overriden slippes (yaw/pitch er allerede konsistente med målet).
    private computeOrbitIdealTransform(): { cameraPos: THREE.Vector3; lookAt: THREE.Vector3; fov: number } {
        const playerWorld = this.player.group.getWorldPosition(new THREE.Vector3());
        const b = this.indoorBlend;
        const pivotH = THREE.MathUtils.lerp(1.7, 1.5, b);
        const pivot = new THREE.Vector3(playerWorld.x, playerWorld.y + pivotH, playerWorld.z);
        const baseDist = THREE.MathUtils.lerp(4.5, 2.8, b);
        const minDist = THREE.MathUtils.lerp(3.0, 1.8, b);
        const maxDist = THREE.MathUtils.lerp(8.0, 4.0, b);
        const camDist = Math.max(minDist, Math.min(maxDist, baseDist + this.camDistZoom));
        const cp = Math.cos(this.pitch);
        const idealPos = new THREE.Vector3(
            pivot.x - Math.sin(this.yaw) * camDist * cp,
            pivot.y + Math.sin(this.pitch) * camDist,
            pivot.z + Math.cos(this.yaw) * camDist * cp,
        );
        const forward = new THREE.Vector3().subVectors(pivot, idealPos).normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
        const shoulder = right.multiplyScalar(0.6);
        idealPos.add(shoulder);
        const lookTgt = pivot.clone().add(shoulder);
        idealPos.y = Math.max(0.5, idealPos.y);
        const clamped = this.clampCameraAgainstWalls(pivot, idealPos);
        return { cameraPos: clamped.clone(), lookAt: lookTgt, fov: this.camera.fov };
    }

    private updateCamera(dt: number): void {
        // Cinematic override: sett kamera direkte, hopp over orbit-logikken.
        // Nar cinematicen avsluttes lerper camPos/camTarget seg glatt tilbake.
        const cinOverride = this.cameraDirector.getCinematicOverride();
        if (cinOverride) {
            this.camPos.copy(cinOverride.cameraPos);
            this.camTarget.copy(cinOverride.lookAt);
            this.camera.position.copy(this.camPos);
            this.camera.lookAt(this.camTarget);
            if (Math.abs(this.camera.fov - cinOverride.fov) > 0.05) {
                this.camera.fov = cinOverride.fov;
                this.camera.updateProjectionMatrix();
            }
            return;
        }

        // Input-smoothing: lerpe yaw/pitch mot mus-mål. Lav tid-konstant = responsivt men ikke hakkete.
        const inputLerp = Math.min(1, dt * 25);
        this.yaw += (this.targetYaw - this.yaw) * inputLerp;
        this.pitch += (this.targetPitch - this.pitch) * inputLerp;

        // Førsteperson: kamera i øyehøyde, sikt langs yaw/pitch. Hopp over orbit/skulder/
        // wall-clamp. Dialog-framing (OTS) eier kameraet når den er aktiv - da faller vi
        // gjennom til tredjeperson-pathen denne framen (isFraming() er ikke-muterende, så
        // ingen dobbel-advance av OTS-springen). cinematicOverride er allerede håndtert over.
        if (this.cameraMode === 'first' && !this.cameraDirector.isFraming()) {
            const pw = this.player.group.getWorldPosition(_playerWorldScratch);
            const eyeH = 1.65;
            const eye = _camEyeScratch.set(pw.x, pw.y + eyeH, pw.z);
            const cp = Math.cos(this.pitch);
            // Samme forward-konvensjon som orbit: positiv pitch = ser ned (-sin).
            const lookTgt = _camLookTgtScratch.set(
                eye.x + Math.sin(this.yaw) * cp,
                eye.y - Math.sin(this.pitch),
                eye.z - Math.cos(this.yaw) * cp,
            );
            const camLerp = Math.min(1, dt * 10);
            this.camPos.lerp(eye, camLerp);
            this.camTarget.lerp(lookTgt, camLerp);
            this.camera.position.copy(this.camPos);

            // Litt videre FOV i førsteperson for naturlig følelse.
            const fpFov = getGameSettings().graphics.fov + 6;
            if (Math.abs(this.camera.fov - fpFov) > 0.05) {
                this.camera.fov = fpFov;
                this.camera.updateProjectionMatrix();
            }

            if (this.shakeDuration > 0) {
                this.shakeTimer += dt;
                if (this.shakeTimer < this.shakeDuration) {
                    const decay = 1 - this.shakeTimer / this.shakeDuration;
                    this.camera.position.x += (Math.random() - 0.5) * this.shakeAmount * decay;
                    this.camera.position.y += (Math.random() - 0.5) * this.shakeAmount * decay * 0.5;
                } else {
                    this.shakeDuration = 0;
                }
            }

            this.camera.lookAt(this.camTarget);
            return;
        }

        // World-posisjon for spilleren (kan være barn av båt/annen gruppe)
        const playerWorld = this.player.group.getWorldPosition(_playerWorldScratch);

        // Pivot-punkt: fast over spillerens skulder. All orbit og look-at er relativt hit.
        const nowIndoors = this.scene.userData._indoors === true;
        if (nowIndoors && !this.wasIndoors) this.indoorBlend = 1; // snap inn umiddelbart - unnga wall-clamp-kollaps
        else this.indoorBlend += ((nowIndoors ? 1 : 0) - this.indoorBlend) * Math.min(1, dt * 4);
        this.wasIndoors = nowIndoors;
        const b = this.indoorBlend;
        const pivotH = THREE.MathUtils.lerp(1.7, 1.5, b);
        const pivot = _camPivotScratch.set(playerWorld.x, playerWorld.y + pivotH, playerWorld.z);

        // Basis-distanse + brukerzoom, clampet per preset
        const baseDist = THREE.MathUtils.lerp(4.5, 2.8, b);
        const minDist = THREE.MathUtils.lerp(3.0, 1.8, b);
        const maxDist = THREE.MathUtils.lerp(8.0, 4.0, b);
        const camDist = Math.max(minDist, Math.min(maxDist, baseDist + this.camDistZoom));

        // Orbit rundt pivot på sfære (ikke rundt spiller)
        const cp = Math.cos(this.pitch);
        const idealPos = _camIdealScratch.set(
            pivot.x - Math.sin(this.yaw) * camDist * cp,
            pivot.y + Math.sin(this.pitch) * camDist,
            pivot.z + Math.cos(this.yaw) * camDist * cp
        );

        // Skulder-offset i KAMERAETS lokale høyre (perpendikulær til forward og world-up).
        // Look-at får samme offset, så kameraet ikke skjeler - parallell siktelinje.
        const forward = _camForwardTmpScratch.subVectors(pivot, idealPos).normalize();
        const right = _camRightScratch.crossVectors(forward, _worldUpScratch).normalize();
        const shoulder = right.multiplyScalar(0.6);
        idealPos.add(shoulder);
        const lookTgt = _camLookTgtScratch.copy(pivot).add(shoulder);

        // CameraDirector OTS-framing (dialog): blend idealPos og lookTgt mot OTS-transform
        const ots = this.cameraDirector.apply();
        if (ots && ots.weight > 0.001) {
            const w = ots.weight;
            idealPos.lerp(ots.cameraPos, w);
            lookTgt.lerp(ots.lookAt, w);
            if (Math.abs(this.camera.fov - ots.fov) > 0.05) {
                this.camera.fov = ots.fov;
                this.camera.updateProjectionMatrix();
            }
        }

        // Kamera-clamp: raycast fra pivot mot kollisjonsbokser så kamera ikke klipper gjennom vegger
        idealPos.y = Math.max(0.5, idealPos.y);
        const clamped = this.clampCameraAgainstWalls(pivot, idealPos);

        // Samme lerp-rate på pos og target unngår desync
        const camLerp = Math.min(1, dt * 10);
        this.camPos.lerp(clamped, camLerp);
        this.camTarget.lerp(lookTgt, camLerp);
        this.camera.position.copy(this.camPos);

        if (this.shakeDuration > 0) {
            this.shakeTimer += dt;
            if (this.shakeTimer < this.shakeDuration) {
                const decay = 1 - this.shakeTimer / this.shakeDuration;
                this.camera.position.x += (Math.random() - 0.5) * this.shakeAmount * decay;
                this.camera.position.y += (Math.random() - 0.5) * this.shakeAmount * decay * 0.5;
            } else {
                this.shakeDuration = 0;
            }
        }

        this.camera.lookAt(this.camTarget);
    }

    // Strammer ideell kameraposisjon dersom strålen fra spiller til kamera krysser en vegg.
    // Bruker PhysicsWorld.raycastSegmentXZ hvis tilgjengelig; ellers no-op (ingen clamp).
    // Returverdien kan være en delt scratch-vektor - les den umiddelbart, ikke behold referansen.
    private clampCameraAgainstWalls(player: THREE.Vector3, ideal: THREE.Vector3): THREE.Vector3 {
        if (!this.physics) return ideal;
        const MARGIN = 0.3;
        const dx = ideal.x - player.x;
        const dy = ideal.y - player.y;
        const dz = ideal.z - player.z;
        // Bruk 3D-avstand: XZ-only guard maskerer tak-kollisjon når spilleren ser rett ned.
        const dist3D = Math.hypot(dx, dy, dz);
        if (dist3D < 0.01) return ideal;
        const t = this.physics.raycastSegmentXZ(player, ideal);
        if (t >= 1) return ideal;
        const clampFactor = Math.max(0, t - MARGIN / dist3D);
        // Hvis kameraet ville kollapset inn i spilleren (clampFactor naer 0), er et kort
        // vegg-klipp langt mindre forstyrrende enn svart skjerm - returner idealposisjonen.
        if (clampFactor < 0.05) return ideal;
        return _camClampScratch.set(
            player.x + (ideal.x - player.x) * clampFactor,
            player.y + (ideal.y - player.y) * clampFactor,
            player.z + (ideal.z - player.z) * clampFactor,
        );
    }

    // Kalkulerer ønsket bevegelse og kjører character-controlleren. Utfaller i at
    // body.setNextKinematicTranslation settes; etter physics.step() leses ny posisjon.
    private verticalVelocity = 0;
    // ── Hopp-følelse (Del A) ──
    private coyoteTimer = 0;        // nådetid igjen etter å forlate bakken
    private jumpBufferTimer = 0;    // forhåndstrykk igjen
    private jumpHeld = false;       // Space holdt siden hoppet startet (variabel høyde)
    private jumpWasDown = false;    // forrige frames Space-tilstand (edge-detect)
    private landSquashTimer = 0;    // squash-juice igjen etter landing
    // ── Mantle / kantgrep (Del C) ──
    private mantling = false;
    private mantleTimer = 0;
    private readonly mantleDur = 0.35;
    private mantleStart = new THREE.Vector3();
    private mantleApex = new THREE.Vector3();
    private mantleEnd = new THREE.Vector3();
    private mantleCooldown = 0;
    // Snap-to-ground må skrus av mens man klatrer ELLER bæres oppover av en stigende
    // plattform, ellers drar den spilleren ned igjen hver frame (klatrefart/heisfart <<
    // snap-avstand) og klatring/heistur blir ødelagt.
    private snapDisabled = false;
    private updatePhysicsPlayer(
        dt: number,
        moveDir: THREE.Vector3,
        SPEED: number,
        JUMP: number,
        GRAV: number,
    ): void {
        const cc = this.playerCC!;
        const bodyPos = cc.body.translation();

        this.mantleCooldown = Math.max(0, this.mantleCooldown - dt);

        // ── Mantle pågår: scripted opp-så-frem-bue, bypass gravity/input/CC ──
        if (this.mantling) {
            this.mantleTimer += dt;
            const t = Math.min(1, this.mantleTimer / this.mantleDur);
            const p = _physDesiredScratch;
            if (t < 0.5) p.lerpVectors(this.mantleStart, this.mantleApex, t / 0.5);
            else p.lerpVectors(this.mantleApex, this.mantleEnd, (t - 0.5) / 0.5);
            cc.body.setNextKinematicTranslation({ x: p.x, y: p.y, z: p.z });
            if (t >= 1) {
                this.mantling = false;
                this.onGround = true;
                this.verticalVelocity = 0;
                this.mantleCooldown = 0.4;
            }
            return;
        }

        const jumpEnabled = this.config.physics?.playerJump !== false;
        const tune = this.config.physics?.jump;
        const coyoteTime = (tune?.coyoteMs ?? 100) / 1000;
        const bufferTime = (tune?.bufferMs ?? 120) / 1000;
        const fallMult = tune?.fallMultiplier ?? 1.35;
        const pos = _physPosScratch.set(bodyPos.x, bodyPos.y, bodyPos.z);

        // Ladder-klatring: hvis spilleren overlapper en climbable-sensor, overstyr gravity
        const climbing = this.physics!.isOverlappingClimbable(pos, this.playerRadius);

        // ── Carry-deteksjon: står vi på en bevegelig plattform? (gjøres FØR snap-beslutning
        // fordi en stigende plattform også må skru av snap-to-ground). ──
        let carry: THREE.Vector3 | null = null;
        if (this.onGround && this.movingPlatformSystem) {
            const feetY = bodyPos.y - this.playerHalfHeight;
            const rayO = _physCarryScratch.set(bodyPos.x, feetY + 0.15, bodyPos.z);
            const hit = this.physics!.raycast(rayO, _downScratch.set(0, -1, 0), 0.35, cc.body);
            if (hit.hit && hit.bodyHandle !== undefined) {
                carry = this.movingPlatformSystem.getCarryDelta(hit.bodyHandle);
            }
        }
        const liftingUp = !!carry && carry.y > 1e-4;

        // Skru av snap-to-ground mens man klatrer ELLER bæres oppover av en stigende
        // plattform. På vei opp beregnes computeColliderMovement mot plattformens FORRIGE
        // posisjon (kinematisk translasjon trer først i kraft ved step()), så snap ville
        // ellers dra spilleren tilbake til den gamle overflaten - og plattformen stiger
        // forbi beina (legs clip, torso skyves opp). Skru på igjen etterpå.
        const wantSnapOff = climbing || liftingUp;
        if (wantSnapOff && !this.snapDisabled) {
            cc.controller.disableSnapToGround();
            this.snapDisabled = true;
        } else if (!wantSnapOff && this.snapDisabled) {
            cc.controller.enableSnapToGround(0.4);
            this.snapDisabled = false;
        }

        // Edge-detect Space (ett trykk = én handling, ikke per-frame mens holdt)
        const spaceDown = !!this.keys['Space'] && !this.dialogActive;
        const spacePressed = spaceDown && !this.jumpWasDown;
        this.jumpWasDown = spaceDown;

        // ── Mantle-trigger: i lufta og på vei inn mot en gripbar kant ──
        // Auto-grip (default): karakteren griper kanten automatisk når den kommer i kontakt,
        // uten ekstra tastetrykk. Sett physics.mantle.auto:false for manuell Space-i-lufta.
        const autoMantle = this.config.physics?.mantle?.auto !== false;
        if (jumpEnabled && !this.onGround && !climbing && this.mantleCooldown <= 0) {
            const f = _ledgeFwdScratch.set(Math.sin(this.yaw), 0, -Math.cos(this.yaw));
            if (moveDir.dot(f) > 0.3 && (autoMantle || spacePressed)) {
                const ledge = this.detectLedge(bodyPos, f);
                if (ledge) {
                    this.mantling = true;
                    this.mantleTimer = 0;
                    this.mantleStart.set(bodyPos.x, bodyPos.y, bodyPos.z);
                    this.mantleApex.set(bodyPos.x, ledge.topY + this.playerHalfHeight + 0.05, bodyPos.z);
                    this.mantleEnd.set(ledge.x, ledge.topY + this.playerHalfHeight, ledge.z);
                    return;
                }
            }
        }

        // Coyote-time + jump-buffer
        if (this.onGround) this.coyoteTimer = coyoteTime;
        else this.coyoteTimer = Math.max(0, this.coyoteTimer - dt);
        if (spacePressed) this.jumpBufferTimer = bufferTime;
        else this.jumpBufferTimer = Math.max(0, this.jumpBufferTimer - dt);

        // Hopp utløses fra buffer + coyote (ikke direkte av tastetrykket)
        if (this.jumpBufferTimer > 0 && this.coyoteTimer > 0 && jumpEnabled && !climbing) {
            this.verticalVelocity = JUMP;
            this.onGround = false;
            this.jumpHeld = true;
            this.jumpBufferTimer = 0;
            this.coyoteTimer = 0;
            this.player.group.scale.set(0.9, 1.14, 0.9); // strekk-juice
            void this.audio.playOneShot('proc:blip', { volume: 0.22 });
        }

        // Variabel høyde: slipp Space tidlig under oppstigning = kortere hopp
        if (this.jumpHeld && !spaceDown && this.verticalVelocity > 0) {
            this.verticalVelocity *= 0.45;
            this.jumpHeld = false;
        }
        if (this.verticalVelocity <= 0) this.jumpHeld = false;

        // Vertikal integrasjon
        if (climbing) {
            // Vegg-/stigeklatring: W/S styrer vertikalt; Space = lite bakover-hopp av veggen
            if (spacePressed && jumpEnabled) {
                this.verticalVelocity = JUMP * 0.7;
                moveDir.set(Math.sin(this.yaw), 0, -Math.cos(this.yaw)).multiplyScalar(-1);
            } else {
                const climbSpeed = 3;
                const up = this.keys['KeyW'] ? 1 : this.keys['KeyS'] ? -1 : 0;
                this.verticalVelocity = up * climbSpeed;
                // Frys horisontal så spilleren henger på stigen i stedet for å gå forbi den.
                moveDir.set(0, 0, 0);
                // Auto-avstigning: når man klatrer opp og det ikke lenger er klatrbart litt
                // over hodet, dytt framover så man stiger av på plattformen øverst.
                if (up > 0) {
                    const above = _ledgeAScratch.set(bodyPos.x, bodyPos.y + 0.6, bodyPos.z);
                    if (!this.physics!.isOverlappingClimbable(above, this.playerRadius)) {
                        moveDir.set(Math.sin(this.yaw), 0, -Math.cos(this.yaw));
                    }
                }
            }
        } else {
            // Apex-heng + raskere fall = snappy platforming-følelse (full hold = uendret høyde)
            let g = GRAV;
            if (this.verticalVelocity < 0) g = GRAV * fallMult;
            else if (this.verticalVelocity > 0 && this.verticalVelocity < 2) g = GRAV * 0.75;
            this.verticalVelocity += g * dt;
        }

        const desired = _physDesiredScratch.set(
            moveDir.x * SPEED * dt,
            this.verticalVelocity * dt,
            moveDir.z * SPEED * dt,
        );

        // ── Carry: bli båret av en bevegelig plattform man står på (detektert over) ──
        if (carry) {
            desired.x += carry.x;
            desired.z += carry.z;
            if (carry.y > 0) desired.y += carry.y;                 // lift
            else if (carry.y < 0) desired.y = Math.min(desired.y, carry.y); // lim ved nedstigning
        }

        const corr = this.physics!.computeCharacterMovement(cc, desired);
        cc.body.setNextKinematicTranslation({
            x: bodyPos.x + corr.x,
            y: bodyPos.y + corr.y,
            z: bodyPos.z + corr.z,
        });

        const grounded = cc.controller.computedGrounded();
        if (grounded && !this.onGround) {
            // Landing - fallskade + juice
            const impact = -this.verticalVelocity;   // positiv verdi = hardt landing
            const phys = this.config.physics;
            if (phys?.playerFallDamage && impact > (phys.fallDamageThreshold ?? 12)) {
                phys.onPlayerFallDamage?.(impact);
            }
            this.landSquashTimer = 0.18;
            if (impact > 4) {
                // Liten kamera-dip ved hard landing (selger i førsteperson også)
                this.shakeAmount = Math.min(0.14, impact * 0.011);
                this.shakeDuration = 0.16;
                this.shakeTimer = 0;
            }
        }
        this.onGround = grounded;
        if (grounded && this.verticalVelocity < 0) this.verticalVelocity = 0;
    }

    // Søker etter en gripbar kant rett foran spilleren (mantle/kantgrep, Del C).
    // To raycast i yaw-retning: en lav vegg-ray (feet+0.5) må treffe, så en ned-probe like
    // bak veggtoppen finner kant-Y, og en kort opp-sjekk bekrefter takklaring til å stå.
    // Den lave rayen + sjekken hver frame fanger kanten over hele hoppbuen (også når føttene
    // er nær eller litt over kanttoppen), så auto-grip utløses på vei inn over et hull.
    // Returnerer null hvis ingen gyldig kant i gripbart høydebånd [riseMin, riseMax].
    private detectLedge(
        bodyPos: { x: number; y: number; z: number },
        f: THREE.Vector3,
    ): { x: number; z: number; topY: number } | null {
        const phys = this.physics;
        const cc = this.playerCC;
        if (!phys || !cc) return null;
        const tune = this.config.physics?.mantle;
        const reach = tune?.reach ?? 0.8;
        const riseMin = tune?.riseMin ?? 0.6;
        const riseMax = tune?.riseMax ?? 2.2;
        const feetY = bodyPos.y - this.playerHalfHeight;

        // 1. Lav vegg-ray (feet+0.5) - må TREFFE en vegg innen rekkevidde
        const wallO = _ledgeAScratch.set(bodyPos.x, feetY + 0.5, bodyPos.z);
        const wall = phys.raycast(wallO, f, reach, cc.body);
        if (!wall.hit) return null;

        // 2. Ned-probe like bak veggtoppen - finn kant-Y
        const probeO = _ledgeCScratch.set(
            wall.point.x + f.x * 0.3,
            feetY + 2.4,
            wall.point.z + f.z * 0.3,
        );
        const down = phys.raycast(probeO, _downScratch.set(0, -1, 0), 2.0, cc.body);
        if (!down.hit) return null;
        const topY = down.point.y;
        const rise = topY - feetY;
        if (rise < riseMin || rise > riseMax) return null;

        // 3. Takklaring - rommet over kanttoppen må være ledig så kapselen får stå
        const headO = _ledgeBScratch.set(probeO.x, topY + 0.1, probeO.z);
        if (phys.raycast(headO, _upScratch.set(0, 1, 0), this.playerHalfHeight * 2 + 0.2, cc.body).hit) {
            return null;
        }

        // Ikke gripe en bevegelig plattform som kant (unngå rar oppklatring under bevegelse)
        if (down.bodyHandle !== undefined && this.movingPlatformSystem?.getCarryDelta(down.bodyHandle)) {
            return null;
        }
        return { x: probeO.x, z: probeO.z, topY };
    }

    // Holder spillerens low-tier kontaktskygge på bakken under spilleren (i stedet for å
    // følge med opp i hopp/heis). Raycaster ned fra føttene og legger blob-en på første
    // solide flate under. Skjuler den hvis det ikke er noe under innen rekkevidde.
    private updateContactShadow(px: number, feetY: number, pz: number): void {
        const blob = this.playerContactShadow;
        if (!blob || !this.physics) return;
        const origin = _physCarryScratch.set(px, feetY + 0.2, pz);
        const hit = this.physics.raycast(origin, _downScratch.set(0, -1, 0), 60, this.playerCC?.body);
        if (!hit.hit) {
            blob.visible = false;
            return;
        }
        blob.visible = true;
        blob.position.set(px, hit.point.y + 0.02, pz);
    }

    // ─── Cleanup ─────────────────────────────────────────────────────────────

    dispose(): void {
        this.disposed = true;
        this.playerContactShadow = null;
        cancelAnimationFrame(this.animFrameId);
        // Kanseller aktive sekvenser før timeouts ryddes (cancel løser ventende delays)
        for (const handle of this.activeSequences) handle.cancel();
        this.activeSequences.clear();
        // Kanseller alle planlagte timeouts og intervals for å unngå setState på disposed engine
        for (const id of this.scheduledTimeouts) clearTimeout(id);
        this.scheduledTimeouts.clear();
        for (const id of this.scheduledIntervals) clearInterval(id);
        this.scheduledIntervals.clear();
        if (this.introTimeout) {
            clearTimeout(this.introTimeout);
            this.introTimeout = null;
        }
        this._cleanupInput();
        this._cleanupResize();
        this.unsubscribeSettings();
        this.interactables?.dispose();
        this.interactables = null;
        this.projectileSystem?.dispose();
        this.projectileSystem = null;
        this.movingPlatformSystem?.dispose();
        this.movingPlatformSystem = null;
        this.physics?.dispose();
        this.physics = null;
        this.playerCC = null;
        this.terrain?.dispose();
        this.terrain = null;
        this.weatherSystem?.dispose();
        this.vegetationSystem?.dispose();
        this.crowdSystem?.dispose();
        this.crowdSystem = null;
        this.faunaSystem?.dispose();
        this.skySystem?.dispose();
        this.cameraDirector.dispose();
        this.aiDirector.dispose();
        this.postProcessing?.dispose();
        this.debugHudSystem?.dispose();
        this.debugHudSystem = null;
        this.shadowSystem?.dispose();
        this.shadowSystem = null;
        if (this.scene.environment) {
            this.scene.environment.dispose();
            this.scene.environment = null;
        }
        this.roomEnvPmrem?.dispose();
        this.roomEnvPmrem = null;
        this.inputManager.dispose();
        this.audio.dispose();
        this.questSystem?.dispose();
        this.questSystem = null;
        this.inventorySystem?.dispose();
        this.inventorySystem = null;
        this.monologSystem?.dispose();
        this.monologSystem = null;
        this.photoMode.dispose();
        this.assetLoader?.dispose();
        this.assetLoader = null;
        this.saveSystem?.dispose();
        this.saveSystem = null;
        if (document.pointerLockElement === this.renderer.domElement) {
            document.exitPointerLock();
        }
        // Fase 5.4: traverser scenegrafen og dispose alt spill-spesifikk setupScene
        // har lagt til (mesh, materialer, texturer) før caches ryddes og renderer slippes.
        const seen = new WeakSet<object>();
        disposeSceneDeep(this.scene, seen);
        this.scene.clear();
        this.renderer.dispose();
        disposeMaterialCache();
        disposeTextureCache();
        if (this.options.container.contains(this.renderer.domElement)) {
            this.options.container.removeChild(this.renderer.domElement);
        }
    }
}
