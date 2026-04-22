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
import { createSceneMat } from './SceneMat';

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

    // Visuelle systemer (Fase 1-3)
    private skySystem: SkySystem | null = null;
    private timeOfDaySystem: TimeOfDaySystem;
    private weatherSystem: WeatherSystem | null = null;
    private vegetationSystem: VegetationSystem | null = null;
    private cameraDirector: CameraDirector;
    private aiDirector: AIDirector;
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
    private mouseLocked = false;
    private keys: Record<string, boolean> = {};
    private collisionBoxes: AABB2D[] = [];

    // Camera
    private camPos = new THREE.Vector3();
    private camTarget = new THREE.Vector3();
    private shakeAmount = 0;
    private shakeDuration = 0;
    private shakeTimer = 0;

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
        this.qualityTier = resolveTier(visual.postProcessing ?? 'auto');

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
        this.renderer.toneMappingExposure = 1.8;
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

        // Sky-system (kun hvis sky === 'procedural')
        if ((visual.sky ?? (options.config.world.preset === 'open' ? 'procedural' : 'none')) === 'procedural') {
            this.skySystem = new SkySystem(this.scene);
            this.timeOfDaySystem.setSky(this.skySystem);
            void this.skySystem.init().then(() => {
                this.timeOfDaySystem.setTimeOfDay(this.timeOfDaySystem.getTimeOfDay());
            });
        }

        // Initial weather hvis spesifisert
        if (visual.weather) {
            if (!this.weatherSystem) {
                this.weatherSystem = new WeatherSystem(this.scene, this.qualityTier);
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
        );
        void this.postProcessing.init();

        // Init camera basert på faktisk verdensposisjon (setupScene kan ha satt player som
        // barn av et annet objekt via setPlayerMode('seated'), så config.startPosition alene
        // ville gitt en feil start-posisjon og et synlig kamera-snap første frame)
        const world = new THREE.Vector3();
        this.player.group.getWorldPosition(world);
        this.camPos.set(
            world.x - Math.sin(this.yaw) * 4.5,
            world.y + 2.5,
            world.z + Math.cos(this.yaw) * 4.5
        );
        this.camTarget.set(world.x, world.y + 1.2, world.z);
    }

    // ─── Public interface for setupScene callbacks ──────────────────────────

    toonMat(color: number, opts: Record<string, unknown> = {}): THREE.MeshStandardMaterial {
        // Bakoverkompatibilitet: thin wrapper rundt sceneMat. Eksisterende kall fungerer uendret.
        return new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.0, ...opts } as THREE.MeshStandardMaterialParameters);
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

        // Shared collision list - WorldBuilder and setupScene both push to this
        this.scene.userData.collisionBoxes = this.collisionBoxes;

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
            this.addDebugCollisionBoxes();
        }
    }

    private addDebugCollisionBoxes(): void {
        const mat = new THREE.MeshBasicMaterial({ color: 0x00ff44, wireframe: true });
        for (const box of this.collisionBoxes) {
            const w = box.maxX - box.minX;
            const d = box.maxZ - box.minZ;
            const geo = new THREE.BoxGeometry(w, 2, d);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set((box.minX + box.maxX) / 2, 1, (box.minZ + box.maxZ) / 2);
            this.scene.add(mesh);
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
            },
            registerAnimatedLight: (light, animation, baseIntensity) => {
                this.animatedLights.push({ light, animation, base: baseIntensity ?? light.intensity });
            },
            setBloom: (strength: number) => {
                this.postProcessing?.setBloom(strength);
            },
            sceneMat: this.sceneMat.bind(this),
            setTimeOfDay: (t: number) => this.timeOfDaySystem.setTimeOfDay(t),
            getSunDirection: () => this.timeOfDaySystem.getSunDirection().clone(),
            setWeather: (state: WeatherState) => {
                if (!this.weatherSystem) {
                    this.weatherSystem = new WeatherSystem(this.scene, this.qualityTier);
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
        };
        const onKeyUp = (e: KeyboardEvent) => { this.keys[e.code] = false; };

        const onMouseMove = (e: MouseEvent) => {
            if (!this.mouseLocked) return;
            this.yaw += e.movementX * 0.003;
            this.pitch = Math.max(-0.5, Math.min(1.0, this.pitch + e.movementY * 0.003));
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
        document.addEventListener('pointerlockchange', onPointerLockChange);

        this._cleanupInput = () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('pointerlockchange', onPointerLockChange);
        };
    }
    private _cleanupInput: () => void = () => {};

    private setupResize(): void {
        const onResize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.postProcessing?.resize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', onResize);
        this._cleanupResize = () => window.removeEventListener('resize', onResize);
    }
    private _cleanupResize: () => void = () => {};

    // ─── Game logic ──────────────────────────────────────────────────────────

    startGame(): void {
        // Idempotent: returner umiddelbart hvis spillet allerede er startet (dobbel-klikk-beskyttelse)
        if (this.gameStarted) return;
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

    private resolveCollisions(): void {
        const r = 0.4;
        const pos = this.player.group.position;
        for (const box of this.collisionBoxes) {
            const ox = Math.min(pos.x + r, box.maxX) - Math.max(pos.x - r, box.minX);
            const oz = Math.min(pos.z + r, box.maxZ) - Math.max(pos.z - r, box.minZ);
            if (ox > 0 && oz > 0) {
                if (ox < oz) {
                    pos.x += pos.x < (box.minX + box.maxX) / 2 ? -ox : ox;
                } else {
                    pos.z += pos.z < (box.minZ + box.maxZ) / 2 ? -oz : oz;
                }
            }
        }
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
        const dt = Math.min(0.05, this.clock.getDelta());
        this.update(dt);
        this.postProcessing.render();
    }

    private update(dt: number): void {
        if (!this.gameStarted) return;
        this.time += dt;

        // Player movement
        const SPEED = 5, JUMP = 6, GRAV = -18;
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
            this.velocity.x = moveDir.x * SPEED;
            this.velocity.z = moveDir.z * SPEED;
            if (this.keys['Space'] && this.onGround && !this.dialogActive) {
                this.velocity.y = JUMP;
                this.onGround = false;
            }
            this.velocity.y += GRAV * dt;
            this.player.group.position.addScaledVector(this.velocity, dt);
            this.resolveCollisions();

            if (this.player.group.position.y <= 0) {
                this.player.group.position.y = 0;
                this.velocity.y = 0;
                this.onGround = true;
            }

            // Romgrense-clamp kun for lukkede preset (workshop). 'open'-preset lar spillet styre grenser via kollisjonsbokser.
            if (this.config.world.preset !== 'open') {
                const hw = (this.config.world.roomSize ?? 20) / 2 - 0.6;
                this.player.group.position.x = Math.max(-hw, Math.min(hw, this.player.group.position.x));
                this.player.group.position.z = Math.max(-hw, Math.min(hw, this.player.group.position.z));
            }
        } else if (this.playerMode === 'seated') {
            // Spiller-posisjon er lokal til seat-parent; hold den fast ved offset
            this.player.group.position.set(...this.seatOffset);
            this.velocity.set(0, 0, 0);
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
        // World-posisjon for spilleren (kan være barn av båt/annen gruppe)
        const playerWorld = new THREE.Vector3();
        this.player.group.getWorldPosition(playerWorld);

        // Variabel kameradistanse: krymp når spiller er innendørs (gjenkjennes ved tak-dollhouse-flag)
        const indoors = this.scene.userData._indoors === true;
        const camDist = indoors ? 2.8 : 4.5;
        const camH = indoors ? 1.6 : 2.5;

        // Over-the-shoulder: kamera litt til høyre (høyre-vektor = perpendikulær til yaw i XZ)
        const sideOffset = 0.7;
        const rightX = Math.cos(this.yaw) * sideOffset;
        const rightZ = Math.sin(this.yaw) * sideOffset;

        const idealPos = new THREE.Vector3(
            playerWorld.x - Math.sin(this.yaw) * camDist * Math.cos(this.pitch) + rightX,
            playerWorld.y + camH + Math.sin(this.pitch) * camDist,
            playerWorld.z + Math.cos(this.yaw) * camDist * Math.cos(this.pitch) + rightZ
        );
        idealPos.y = Math.max(0.5, idealPos.y);

        // CameraDirector framing-override (ved dialog): blend kamera nærmere taler
        const framing = this.cameraDirector.apply();
        if (framing && framing.weight > 0.001) {
            // Blend ideal-posisjon mot taler: skyv kamera nærmere langs forskjell mellom player og target
            const towardSpeaker = new THREE.Vector3().subVectors(framing.target, playerWorld).multiplyScalar(0.4);
            idealPos.addScaledVector(towardSpeaker, framing.weight);
        }

        // Kamera-clamp: raycast mot kollisjonsbokser så kamera ikke klipper gjennom vegger
        const clamped = this.clampCameraAgainstWalls(playerWorld, idealPos);

        this.camPos.lerp(clamped, Math.min(1, dt * 8));
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

        // Siktemål foran spilleren - krymper med pitch så karakteren forblir i bildet ved høy vinkel
        const lookForward = 6.0 * Math.max(0, Math.cos(this.pitch));
        const lookTgt = new THREE.Vector3(
            playerWorld.x + Math.sin(this.yaw) * lookForward,
            playerWorld.y + 1.2,
            playerWorld.z - Math.cos(this.yaw) * lookForward
        );
        // Hvis CameraDirector er aktiv, blend lookTgt mot speaker
        if (framing && framing.weight > 0.001) {
            lookTgt.lerp(framing.target, framing.weight * 0.7);
        }
        this.camTarget.lerp(lookTgt, Math.min(1, dt * 10));
        this.camera.lookAt(this.camTarget);
    }

    // Strammer ideell kameraposisjon dersom strålen fra spiller til kamera krysser en kollisjonsboks.
    // Bruker AABB2D (XZ-planet) - samme enkle representasjon som spiller-kollisjon.
    private clampCameraAgainstWalls(player: THREE.Vector3, ideal: THREE.Vector3): THREE.Vector3 {
        const MARGIN = 0.3;
        const dx = ideal.x - player.x;
        const dz = ideal.z - player.z;
        const distXZ = Math.hypot(dx, dz);
        if (distXZ < 0.01) return ideal.clone();

        let minT = 1;
        for (const box of this.collisionBoxes) {
            // Stråle fra player mot ideal i XZ. Slab-test mot AABB.
            const t = this.raySegmentVsAABB(player.x, player.z, dx, dz, box);
            if (t !== null && t < minT) minT = t;
        }

        if (minT >= 1) return ideal.clone();

        const clampFactor = Math.max(0, minT - MARGIN / distXZ);
        return new THREE.Vector3(
            player.x + dx * clampFactor,
            player.y + (ideal.y - player.y) * clampFactor + (player.y) * (1 - clampFactor),
            player.z + dz * clampFactor
        );
    }

    // Returnerer t (0..1) langs (px+t*dx, pz+t*dz) hvor strålen krysser AABB, eller null.
    private raySegmentVsAABB(px: number, pz: number, dx: number, dz: number, box: AABB2D): number | null {
        let tmin = 0, tmax = 1;
        if (Math.abs(dx) < 1e-6) {
            if (px < box.minX || px > box.maxX) return null;
        } else {
            let t1 = (box.minX - px) / dx;
            let t2 = (box.maxX - px) / dx;
            if (t1 > t2) [t1, t2] = [t2, t1];
            tmin = Math.max(tmin, t1);
            tmax = Math.min(tmax, t2);
            if (tmin > tmax) return null;
        }
        if (Math.abs(dz) < 1e-6) {
            if (pz < box.minZ || pz > box.maxZ) return null;
        } else {
            let t1 = (box.minZ - pz) / dz;
            let t2 = (box.maxZ - pz) / dz;
            if (t1 > t2) [t1, t2] = [t2, t1];
            tmin = Math.max(tmin, t1);
            tmax = Math.min(tmax, t2);
            if (tmin > tmax) return null;
        }
        return tmin > 0.01 ? tmin : null;
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
        this.weatherSystem?.dispose();
        this.vegetationSystem?.dispose();
        this.skySystem?.dispose();
        this.cameraDirector.dispose();
        this.aiDirector.dispose();
        this.postProcessing?.dispose();
        if (document.pointerLockElement === this.renderer.domElement) {
            document.exitPointerLock();
        }
        this.renderer.dispose();
        if (this.options.container.contains(this.renderer.domElement)) {
            this.options.container.removeChild(this.renderer.domElement);
        }
    }
}
