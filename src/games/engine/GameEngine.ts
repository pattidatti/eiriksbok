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
} from './types';
import { buildCharacter, buildCollectibleMesh, drawFace, lerpParams, EMOTION_PARAMS, updateCharacterAnim, type BuiltCharacter } from './CharacterBuilder';
import { buildWorkshopRoom, buildWorkshopLighting } from './WorldBuilder';
import { buildHangingLight, type HangingLightRef } from './LightBuilder';
import { DustSystem, SparkSystem } from './ParticleSystem';
import { MonologSystem } from './systems/MonologSystem';
import { PostProcessingSystem, resolveTier, type QualityTier } from './systems/PostProcessingSystem';
import { SkySystem } from './systems/SkySystem';
import { TimeOfDaySystem } from './systems/TimeOfDaySystem';
import { WeatherSystem } from './systems/WeatherSystem';
import { VegetationSystem } from './systems/VegetationSystem';
import { CameraDirector } from './systems/CameraDirector';
import { AIDirector } from './systems/AIDirector';
import { ShadowSystem } from './systems/ShadowSystem';
import { createSceneMat, createToonLikeMat, disposeMaterialCache, getMaterialCacheSize } from './SceneMat';
import { getProceduralTexture, disposeTextureCache } from './TextureManager';
import { DebugHudSystem, type DebugStats } from './systems/DebugHudSystem';
import type { PhysicsWorld, CharacterControllerHandle } from './systems/PhysicsWorld';
import type { InteractableSystem } from './systems/InteractableSystem';
import { getGameSettings, subscribeGameSettings } from './settings/gameSettings';

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

// Gjenbruksvektorer for god rays-projeksjon (Fase 2.5) — unngår allokering per frame.
const _sunWorldScratch = new THREE.Vector3();
const _sunNdcScratch = new THREE.Vector3();
const _camForwardScratch = new THREE.Vector3();
const _sunToCamScratch = new THREE.Vector3();

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

    // Visuelle systemer (Fase 1-3)
    private skySystem: SkySystem | null = null;
    private timeOfDaySystem: TimeOfDaySystem;
    private weatherSystem: WeatherSystem | null = null;
    private vegetationSystem: VegetationSystem | null = null;
    private cameraDirector: CameraDirector;
    private aiDirector: AIDirector;
    private shadowSystem: ShadowSystem | null = null;
    private sunLight: THREE.DirectionalLight | null = null;
    private ambientLight: THREE.AmbientLight | null = null;
    private hemiLight: THREE.HemisphereLight | null = null;

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
    private physicsReady: Promise<void> | null = null;
    private pendingPickups: { mesh: THREE.Mesh; opts?: PickupOptions }[] = [];

    // Camera
    private camPos = new THREE.Vector3();
    private camTarget = new THREE.Vector3();
    private camDistZoom = 0; // brukerjustert zoom-offset fra musehjul
    private shakeAmount = 0;
    private shakeDuration = 0;
    private shakeTimer = 0;

    // Graphics settings state (endring trigger re-kompilering bare ved skyggetype-skifte)
    private unsubscribeSettings: () => void = () => {};
    private lastShadowEnabled: boolean | null = null;
    private lastShadowType: THREE.ShadowMapType | null = null;

    // Emotion state per NPC
    private emotionStates = new Map<string, EmotionMorphState>();
    private bodyTargets = new Map<string, BodyTarget>();
    private triumphAnimStates = new Map<string, { t: number; duration: number }>();

    // NPCs and collectibles
    private characters: Map<string, BuiltCharacter & { config: { id: string; name: string } }> = new Map();
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

    // Persistent UI state (survives per-frame pushUIState calls)
    private activeDialog: GameUIState['dialog'] = null;
    private activePuzzle: GameUIState['puzzle'] = null;

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

    // Intro-state (Fase 5)
    private introActive = false;
    private introTimeout: ReturnType<typeof setTimeout> | null = null;
    private introInputBlocked = false;

    constructor(options: EngineOptions) {
        this.options = options;
        this.config = options.config;

        const visual = options.config.visual ?? {};
        const ppConfig = extractPostProcessing(visual.postProcessing);
        this.qualityTier = resolveTier(ppConfig.quality ?? 'auto');

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(options.config.world.backgroundColor ?? 0x6b5544);
        this.scene.fog = new THREE.FogExp2(
            new THREE.Color(options.config.world.backgroundColor ?? 0x6b5544),
            options.config.world.fogDensity ?? 0.008
        );

        const far = options.config.world.preset === 'open' ? 400 : 100;
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, far);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(this.qualityTier === 'low' ? 1 : Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = this.qualityTier !== 'low';
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = ppConfig.exposure ?? 1.8;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        options.container.appendChild(this.renderer.domElement);

        // Time-of-day + sky må initialiseres FØR buildScene så registrering av sun/ambient kan skje.
        this.timeOfDaySystem = new TimeOfDaySystem(visual.timeOfDay ?? 0.5);
        this.cameraDirector = new CameraDirector();
        this.aiDirector = new AIDirector();

        if (options.onFade) {
            this.cameraDirector.setFadeCallback(options.onFade);
        }

        this.buildScene();

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
        if ((visual.sky ?? (options.config.world.preset === 'open' ? 'procedural' : 'none')) === 'procedural') {
            this.skySystem = new SkySystem(this.scene);
            this.timeOfDaySystem.setSky(this.skySystem);
            const enableIbl = this.qualityTier === 'high';
            void this.skySystem.init().then(() => {
                // Fase 2.4: IBL — kun high-tier. Bake prosedyral himmel til envMap
                // slik at alle PBR-materialer får reflekser fra riktig sky-farge.
                if (enableIbl) this.skySystem?.enableIbl(this.renderer);
                this.timeOfDaySystem.setTimeOfDay(this.timeOfDaySystem.getTimeOfDay());
            });
        }

        // Initial weather hvis spesifisert
        if (visual.weather) {
            if (!this.weatherSystem) {
                this.weatherSystem = new WeatherSystem(this.scene, this.qualityTier);
                this.weatherSystem.attachTimeOfDay(this.timeOfDaySystem);
            }
            this.weatherSystem.setWeather(visual.weather);
        }

        // Trigg en initial TOD-update slik at lyset stemmer fra første frame
        this.timeOfDaySystem.update();

        // Initial NPC-routes
        if (options.config.npcRoutes) {
            for (const r of options.config.npcRoutes) {
                this.aiDirector.assignRoute(r);
            }
        }

        // Debug-visualisering for AI-waypoints (etter ruter er assigned)
        if (options.config.debug) {
            this.addDebugWaypoints();
        }

        this.setupInput();
        this.setupResize();

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

    }

    private async initPhysics(): Promise<void> {
        const { PhysicsWorld } = await import('./systems/PhysicsWorld');
        const { InteractableSystem } = await import('./systems/InteractableSystem');
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
        for (const p of this.pendingPickups) this.interactables.registerPickup(p.mesh, p.opts);
        this.pendingPickups.length = 0;
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
                    // Default player hat
                    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.15, 3), this.toonMat(0x1a0f08));
                    hat.position.y = 1.78; hat.rotation.y = Math.PI / 6; g.add(hat);
                    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.05, 3), this.toonMat(0x1a0f08));
                    brim.position.y = 1.7; brim.rotation.y = Math.PI / 6; g.add(brim);
                },
            },
            this.toonMat.bind(this),
            this.renderer,
            this.scene
        );
        this.player.group.userData.isPlayer = true;

        // Build NPCs
        for (const charCfg of this.config.characters) {
            const built = buildCharacter(charCfg, this.toonMat.bind(this), this.renderer, this.scene);
            this.characters.set(charCfg.id, { ...built, config: { id: charCfg.id, name: charCfg.name } });
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

        // Initialiser MonologSystem hvis spillet har monologs
        if (this.config.monologs) {
            this.monologSystem = new MonologSystem(
                this.config.monologs,
                this.config.monologTriggers ?? [],
                (state) => {
                    this.activeMonolog = state;
                    this.pushUIState({ monolog: state });
                }
            );
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
            triggerEnd: this.triggerEnd.bind(this),
            updateUI: this.updateUI.bind(this),
            setEmotion: this.setEmotion.bind(this),
            setFlag: <T>(key: string, value: T) => this.flags.set(key, value),
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
                }
                this.weatherSystem.setWeather(state);
            },
            addVegetationPatch: (area: AABB2D, density: number, type: VegetationType = 'grass') => {
                if (!this.vegetationSystem) {
                    this.vegetationSystem = new VegetationSystem(this.scene, this.qualityTier);
                }
                this.vegetationSystem.addPatch(area, density, type);
            },
            addTree: (position: [number, number, number], type: TreeType = 'pine') => {
                if (!this.vegetationSystem) {
                    this.vegetationSystem = new VegetationSystem(this.scene, this.qualityTier);
                }
                this.vegetationSystem.addTree(position, type);
            },
            assignRoute: (cfg: NpcRouteConfig) => this.aiDirector.assignRoute(cfg),
            setCameraFraming: (framing: DialogCameraFraming, target?: THREE.Vector3) => {
                this.cameraDirector.setFraming(framing, target);
            },
            playCinematic: (shots: CinematicShot[]) => this.cameraDirector.playCinematic(shots),
            fadeToBlack: (durationMs?: number) => this.cameraDirector.fadeToBlack(durationMs),
            fadeFromBlack: (durationMs?: number) => this.cameraDirector.fadeFromBlack(durationMs),
            getQualityTier: () => this.qualityTier,
            skipIntro: () => this.skipIntro(),
            registerPickup: (mesh: THREE.Mesh, opts?: PickupOptions) => {
                if (this.interactables) {
                    this.interactables.registerPickup(mesh, opts);
                } else {
                    this.pendingPickups.push({ mesh, opts });
                }
            },
            isHoldingItem: () => this.interactables?.isHolding() ?? false,
            dropHeldItem: () => this.interactables?.drop(),
            throwHeldItem: (force?: number) => this.interactables?.throwHeld(force),
        };
    }

    private setPlayerMode(mode: PlayerMode, opts?: { parent?: THREE.Group; offset?: [number, number, number] }): void {
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
            if (e.code === 'Escape' && this.gameStarted && !this.isEnded && !this.dialogActive && !this.puzzleActive && !this.introActive) {
                this.paused = true;
                this.pushUIState({ paused: true });
                return;
            }

            // Space = hopp over aktiv monolog (forhindrer også hopp i samme frame)
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

            // Interact key (blokkert under intro så brukeren ikke kan trigge dialog midt i tittel-fade)
            if (e.code === 'KeyE' && !this.dialogActive && !this.introInputBlocked) {
                this.handleInteract();
            }

            // Kast-tast (F) - kun hvis spilleren holder et objekt
            if (e.code === 'KeyF' && !this.dialogActive && !this.introInputBlocked) {
                this.interactables?.tryHandleThrow();
            }
        };
        const onKeyUp = (e: KeyboardEvent) => { this.keys[e.code] = false; };

        const onMouseMove = (e: MouseEvent) => {
            if (!this.mouseLocked) return;
            this.targetYaw += e.movementX * 0.003;
            // Pitch-konvensjon: positiv = kamera høyere + ser ned. Mer rom oppover enn før.
            this.targetPitch = Math.max(-1.2, Math.min(1.0, this.targetPitch + e.movementY * 0.003));
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

        // Render-skala: base fra kvalitets-tier, multiplisert med brukerens skala
        const basePR = this.qualityTier === 'low' ? 1 : Math.min(window.devicePixelRatio, 2);
        this.renderer.setPixelRatio(basePR * s.renderScale);
        this.postProcessing?.resize(window.innerWidth, window.innerHeight);

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

    private setupResize(): void {
        const onResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.postProcessing?.resize(window.innerWidth, window.innerHeight);
            // Gjenopprett brukerens render-skala og FOV etter size-endring
            this.applyGameSettings();
        };
        const onVis = () => {
            // Når fanen blir synlig igjen, dropp akkumulert dt så physics ikke hopper
            if (!document.hidden) {
                this.clock.getDelta();
                this.physics?.resetAccumulator();
            }
        };
        window.addEventListener('resize', onResize);
        document.addEventListener('visibilitychange', onVis);
        this._cleanupResize = () => {
            window.removeEventListener('resize', onResize);
            document.removeEventListener('visibilitychange', onVis);
        };
    }
    private _cleanupResize: () => void = () => {};

    // ─── Game logic ──────────────────────────────────────────────────────────

    async startGame(): Promise<void> {
        // Idempotent: returner umiddelbart hvis spillet allerede er startet (dobbel-klikk-beskyttelse)
        if (this.gameStarted) return;
        // Vent på fysikk-WASM hvis den ennå ikke er ferdig lastet
        if (this.physicsReady) {
            try { await this.physicsReady; } catch { /* fortsett uansett */ }
        }
        if (this.disposed) return;
        this.gameStarted = true;
        const firstQuest = this.config.quests[0];
        this.phase = firstQuest?.phase ?? 'intro';

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
    }

    skipIntro(): void {
        if (!this.introActive) return;
        // Hopp over hold-perioden, spilleren får kontroll umiddelbart
        this.endIntro();
    }

    private handleInteract(): void {
        // Pickup/drop vinner hvis InteractableSystem konsumerer tasten
        if (this.interactables?.tryHandleInteract()) return;
        if (this.nearCharacterId) {
            this.triggerCharacterInteraction(this.nearCharacterId);
        } else if (this.nearCollectibleId) {
            this.collectItem(this.nearCollectibleId);
        }
    }

    private triggerCharacterInteraction(charId: string): void {
        const char = this.characters.get(charId);
        if (!char) return;

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

        // CameraDirector: zoom inn på taler hvis cameraFraming === 'speaker'.
        // Finn karakter med matching id eller name (case-insensitive); ellers fallback til wide.
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
        if (node.cameraFraming === 'speaker' && speakerChar) {
            const world = new THREE.Vector3();
            speakerChar.group.getWorldPosition(world);
            world.y += 1.5;
            this.cameraDirector.pushDialogFraming(world, 'speaker');
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
            },
        });
    }

    private resolveDialog(key: string): DialogNode | undefined {
        return this.config.dialogs[key];
    }

    closeDialog(): void {
        this.dialogActive = false;
        this.currentChoices = [];
        this.cameraDirector.pop();
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

        this.pushUIState({
            puzzle: {
                visible: true,
                stepIndex: this.puzzleStepIndex,
                stepLabels: puzzle.steps.map((_, i) => `Steg ${i + 1}`),
                question: step.question,
                hint: step.hint,
                feedback: this.puzzleFeedback,
                options: step.options.map((o) => o.text),
            },
        });
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

        const changed = nearChar !== this.nearCharacterId || nearCol !== this.nearCollectibleId;
        this.nearCharacterId = nearChar;
        this.nearCollectibleId = nearCol;

        if (changed) {
            this.pushUIState({ showInteractPrompt: !!(nearChar || nearCol) });
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

    private pushUIState(override: Partial<GameUIState> = {}): void {
        if (this.isEnded) return;
        // Persist dialog/puzzle/intro state across calls so per-frame updates don't reset them
        if ('dialog' in override) this.activeDialog = override.dialog ?? null;
        if ('puzzle' in override) this.activePuzzle = override.puzzle ?? null;
        if ('intro' in override) this.activeIntro = override.intro ?? null;

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
            showInteractPrompt: !!(this.nearCharacterId || this.nearCollectibleId),
            dialog: this.activeDialog,
            puzzle: this.activePuzzle,
            monolog: this.activeMonolog,
            ended: false,
            endText: '',
            paused: this.paused,
            debug: this.config.debug
                ? { phase: this.phase, flags: Object.fromEntries(this.flags) }
                : undefined,
            intro: this.activeIntro,
            qualityTier: this.qualityTier,
        };

        this.options.onUIUpdate({ ...base, ...override });
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
        this.update(dt);
        // Debug-HUD leser + resetter renderer.info før render, slik at draw calls
        // akkumuleres gjennom hele post-processing-kjeden.
        this.debugHudSystem?.tick(dt);
        this.postProcessing.render();
    }

    // Samler debug-stats for DebugHud-overlayet (F3). Trygg å kalle når som helst.
    getDebugStats(): DebugStats | null {
        return this.debugHudSystem?.collect() ?? null;
    }

    private update(dt: number): void {
        if (!this.gameStarted) return;
        this.time += dt;

        // Player movement
        const WALK_SPEED = 5, RUN_SPEED = 9, JUMP = 6, GRAV = -18;
        const SPEED = (this.keys['ShiftLeft'] || this.keys['ShiftRight']) ? RUN_SPEED : WALK_SPEED;
        const moveDir = new THREE.Vector3();

        const canMove = !this.dialogActive && !this.introInputBlocked && this.playerMode === 'free';

        if (canMove) {
            const fwd = new THREE.Vector3(Math.sin(this.yaw), 0, -Math.cos(this.yaw));
            const right = new THREE.Vector3(Math.cos(this.yaw), 0, Math.sin(this.yaw));
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
        }

        // Advance physics-world én eller flere fixed substeps etter input, før vi leser tilbake transform
        this.physics?.step(dt);
        this.physics?.syncMeshes();
        // Hvis fysikk er aktiv og spilleren er i free-modus, synkroniser mesh fra body
        if (this.physics && this.playerCC && this.playerMode === 'free') {
            const t = this.playerCC.body.translation();
            this.player.group.position.set(t.x, t.y - this.playerHalfHeight, t.z);
        }
        this.interactables?.update();

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

        // NPC animations
        for (const [id, char] of this.characters) {
            const hasRoute = this.aiDirector.hasRoute(id);

            // Sittende eller høytplasserte NPCer (f.eks. mannskap i båt) kan spesifisere
            // en base-Y i userData så sin-bob ikke rykker dem ned til gulvet.
            // NPCer med aktiv rute styres av AIDirector og skal ikke få sin-bob (overstyrer posisjon).
            if (!hasRoute) {
                const bobBase = (char.group.userData.bobBase as number | undefined) ?? 0;
                char.group.position.y = bobBase + Math.sin(this.time * 1.5) * 0.03;

                // Roter mot spiller når i nærheten (kun for stasjonære NPCer)
                const toPlayer = new THREE.Vector3().subVectors(
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
            this.postProcessing?.updateGodRays(
                (sunNdc.x + 1) * 0.5,
                (sunNdc.y + 1) * 0.5,
                onScreen && aboveHorizon && inFront,
            );
        }

        // Vær (regn/snø/tåke)
        if (this.weatherSystem) {
            const playerWorld = new THREE.Vector3();
            this.player.group.getWorldPosition(playerWorld);
            this.weatherSystem.update(dt, playerWorld.x, playerWorld.z);
        }

        // Vegetasjon (vind-shader-tid)
        this.vegetationSystem?.update(dt);

        // CameraDirector (lerp-state)
        this.cameraDirector.update(dt);

        // AIDirector (NPC waypoint-vandring) - blokk når dialog/monolog er aktiv
        const blocked = this.dialogActive || (this.monologSystem?.isActive() ?? false);
        this.aiDirector.update(dt, this.characters, blocked);

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

        // Indre monolog (trigger-volumer og progresjon)
        if (this.monologSystem) {
            const world = new THREE.Vector3();
            this.player.group.getWorldPosition(world);
            this.monologSystem.update(dt, { x: world.x, z: world.z }, this.phase);
        }

        // Game-spesifikk per-frame hook (kalles etter alt annet så spill kan lese/overskrive posisjon)
        const customUpdate = this.scene.userData._customUpdate as ((dt: number, time: number) => void) | undefined;
        if (customUpdate) customUpdate(dt, this.time);

        // Camera
        this.updateCamera(dt);
    }

    private updateCamera(dt: number): void {
        // Input-smoothing: lerpe yaw/pitch mot mus-mål. Lav tid-konstant = responsivt men ikke hakkete.
        const inputLerp = Math.min(1, dt * 25);
        this.yaw += (this.targetYaw - this.yaw) * inputLerp;
        this.pitch += (this.targetPitch - this.pitch) * inputLerp;

        // World-posisjon for spilleren (kan være barn av båt/annen gruppe)
        const playerWorld = new THREE.Vector3();
        this.player.group.getWorldPosition(playerWorld);

        // Pivot-punkt: fast over spillerens skulder. All orbit og look-at er relativt hit.
        const indoors = this.scene.userData._indoors === true;
        const pivotH = indoors ? 1.5 : 1.7;
        const pivot = new THREE.Vector3(playerWorld.x, playerWorld.y + pivotH, playerWorld.z);

        // Basis-distanse + brukerzoom, clampet per preset
        const baseDist = indoors ? 2.8 : 4.5;
        const minDist = indoors ? 1.8 : 3.0;
        const maxDist = indoors ? 4.0 : 8.0;
        const camDist = Math.max(minDist, Math.min(maxDist, baseDist + this.camDistZoom));

        // Orbit rundt pivot på sfære (ikke rundt spiller)
        const cp = Math.cos(this.pitch);
        const idealPos = new THREE.Vector3(
            pivot.x - Math.sin(this.yaw) * camDist * cp,
            pivot.y + Math.sin(this.pitch) * camDist,
            pivot.z + Math.cos(this.yaw) * camDist * cp
        );

        // Skulder-offset i KAMERAETS lokale høyre (perpendikulær til forward og world-up).
        // Look-at får samme offset, så kameraet ikke skjeler - parallell siktelinje.
        const forward = new THREE.Vector3().subVectors(pivot, idealPos).normalize();
        const worldUp = new THREE.Vector3(0, 1, 0);
        const right = new THREE.Vector3().crossVectors(forward, worldUp).normalize();
        const shoulder = right.multiplyScalar(0.6);
        idealPos.add(shoulder);
        const lookTgt = pivot.clone().add(shoulder);

        // CameraDirector framing-override (ved dialog): blend kamera + look-at nærmere taler
        const framing = this.cameraDirector.apply();
        if (framing && framing.weight > 0.001) {
            const towardSpeaker = new THREE.Vector3().subVectors(framing.target, pivot).multiplyScalar(0.4);
            idealPos.addScaledVector(towardSpeaker, framing.weight);
            lookTgt.lerp(framing.target, framing.weight * 0.7);
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
    private clampCameraAgainstWalls(player: THREE.Vector3, ideal: THREE.Vector3): THREE.Vector3 {
        if (!this.physics) return ideal.clone();
        const MARGIN = 0.3;
        const dx = ideal.x - player.x;
        const dz = ideal.z - player.z;
        const distXZ = Math.hypot(dx, dz);
        if (distXZ < 0.01) return ideal.clone();
        const t = this.physics.raycastSegmentXZ(player, ideal);
        if (t >= 1) return ideal.clone();
        const clampFactor = Math.max(0, t - MARGIN / distXZ);
        return new THREE.Vector3(
            player.x + (ideal.x - player.x) * clampFactor,
            player.y + (ideal.y - player.y) * clampFactor,
            player.z + (ideal.z - player.z) * clampFactor,
        );
    }

    // Kalkulerer ønsket bevegelse og kjører character-controlleren. Utfaller i at
    // body.setNextKinematicTranslation settes; etter physics.step() leses ny posisjon.
    private verticalVelocity = 0;
    private updatePhysicsPlayer(
        dt: number,
        moveDir: THREE.Vector3,
        SPEED: number,
        JUMP: number,
        GRAV: number,
    ): void {
        const cc = this.playerCC!;
        const bodyPos = cc.body.translation();
        const jumpEnabled = this.config.physics?.playerJump !== false;
        const pos = new THREE.Vector3(bodyPos.x, bodyPos.y, bodyPos.z);

        // Ladder-klatring: hvis spilleren overlapper en climbable-sensor, overstyr gravity
        const climbing = this.physics!.isOverlappingClimbable(pos, this.playerRadius);

        // Hopp (kun hvis grounded forrige frame)
        if (this.keys['Space'] && jumpEnabled && this.onGround && !this.dialogActive) {
            this.verticalVelocity = JUMP;
            this.onGround = false;
        }

        if (climbing) {
            // Vertikal bevegelse styrt av W/S; fryse horisontal drift
            this.verticalVelocity = 0;
            const climbSpeed = 3;
            const up = this.keys['KeyW'] ? 1 : this.keys['KeyS'] ? -1 : 0;
            this.verticalVelocity = up * climbSpeed;
        } else {
            this.verticalVelocity += GRAV * dt;
        }

        const desired = new THREE.Vector3(
            moveDir.x * SPEED * dt,
            this.verticalVelocity * dt,
            moveDir.z * SPEED * dt,
        );
        cc.controller.computeColliderMovement(cc.collider, desired);
        const corr = cc.controller.computedMovement();
        cc.body.setNextKinematicTranslation({
            x: bodyPos.x + corr.x,
            y: bodyPos.y + corr.y,
            z: bodyPos.z + corr.z,
        });

        const grounded = cc.controller.computedGrounded();
        if (grounded && !this.onGround) {
            // Landing - sjekk fallskade
            const impact = -this.verticalVelocity;   // positiv verdi = hardt landing
            const phys = this.config.physics;
            if (phys?.playerFallDamage && impact > (phys.fallDamageThreshold ?? 12)) {
                phys.onPlayerFallDamage?.(impact);
            }
        }
        this.onGround = grounded;
        if (grounded && this.verticalVelocity < 0) this.verticalVelocity = 0;
    }

    // ─── Cleanup ─────────────────────────────────────────────────────────────

    dispose(): void {
        this.disposed = true;
        cancelAnimationFrame(this.animFrameId);
        // Kanseller alle planlagte timeouts for å unngå setState på disposed engine
        for (const id of this.scheduledTimeouts) clearTimeout(id);
        this.scheduledTimeouts.clear();
        if (this.introTimeout) {
            clearTimeout(this.introTimeout);
            this.introTimeout = null;
        }
        this._cleanupInput();
        this._cleanupResize();
        this.unsubscribeSettings();
        this.interactables?.dispose();
        this.interactables = null;
        this.physics?.dispose();
        this.physics = null;
        this.playerCC = null;
        this.weatherSystem?.dispose();
        this.vegetationSystem?.dispose();
        this.skySystem?.dispose();
        this.cameraDirector.dispose();
        this.aiDirector.dispose();
        this.postProcessing?.dispose();
        this.debugHudSystem?.dispose();
        this.debugHudSystem = null;
        this.shadowSystem?.dispose();
        this.shadowSystem = null;
        if (document.pointerLockElement === this.renderer.domElement) {
            document.exitPointerLock();
        }
        this.renderer.dispose();
        disposeMaterialCache();
        disposeTextureCache();
        if (this.options.container.contains(this.renderer.domElement)) {
            this.options.container.removeChild(this.renderer.domElement);
        }
    }
}
