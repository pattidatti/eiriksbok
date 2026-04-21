import * as THREE from 'three';
import type {
    GameConfig,
    GameUIState,
    GameEngineRef,
    DialogNode,
    AABB2D,
} from './types';
import { buildCharacter, buildCollectibleMesh, type BuiltCharacter } from './CharacterBuilder';
import { buildWorkshopRoom, buildWorkshopLighting } from './WorldBuilder';
import { DustSystem, SparkSystem } from './ParticleSystem';

interface EngineOptions {
    container: HTMLDivElement;
    config: GameConfig;
    onUIUpdate: (state: Partial<GameUIState>) => void;
    onStart: () => void;
    onEnd: (text: string) => void;
    onCollect?: (name: string) => void;
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

    // Post-processing (optional, high-end only)
    private composer: unknown = null;
    private bloomPass: { strength: number; resolution: THREE.Vector2 } | null = null;
    private bloomTarget = 0.45;

    // State
    private phase = 'intro';
    private gameStarted = false;
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

    // NPCs and collectibles
    private characters: Map<string, BuiltCharacter & { config: { id: string; name: string } }> = new Map();
    private collectibleMeshes: Map<string, { group: THREE.Group; config: { id: string; name: string } }> = new Map();

    // Particles
    private dustSystem!: DustSystem;
    private sparkSystem?: SparkSystem;

    // Lights (for animation)
    private fireLight?: THREE.PointLight;
    private lampLight?: THREE.PointLight;

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

    constructor(options: EngineOptions) {
        this.options = options;
        this.config = options.config;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(options.config.world.backgroundColor ?? 0x6b5544);
        this.scene.fog = new THREE.FogExp2(
            new THREE.Color(options.config.world.backgroundColor ?? 0x6b5544),
            options.config.world.fogDensity ?? 0.008
        );

        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        const isLowEnd = navigator.hardwareConcurrency <= 4 || window.devicePixelRatio < 1.5;
        this.renderer.setPixelRatio(isLowEnd ? 1 : Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.LinearToneMapping;
        this.renderer.toneMappingExposure = 2.2;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        options.container.appendChild(this.renderer.domElement);

        this.buildScene();
        this.setupInput();
        this.setupResize();

        if (!isLowEnd) this.setupPostProcessing();

        // Init camera
        const [px, , pz] = options.config.player.startPosition;
        this.camPos.set(px - Math.sin(this.yaw) * 4.5, 2.5, pz + Math.cos(this.yaw) * 4.5);
        this.camTarget.set(px, 1.2, pz);
    }

    // ─── Public interface for setupScene callbacks ──────────────────────────

    toonMat(color: number, opts: Record<string, unknown> = {}): THREE.MeshToonMaterial {
        return new THREE.MeshToonMaterial({ color, gradientMap: this.gradientMap, ...opts } as THREE.MeshToonMaterialParameters);
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

    // ─── Private setup ───────────────────────────────────────────────────────

    private gradientMap!: THREE.DataTexture;
    private flashPending = false;

    private buildScene(): void {
        // Gradient map for toon shading
        const gradData = new Uint8Array([0, 80, 150, 185, 210, 235, 255]);
        this.gradientMap = new THREE.DataTexture(gradData, gradData.length, 1, THREE.RedFormat);
        this.gradientMap.magFilter = THREE.NearestFilter;
        this.gradientMap.minFilter = THREE.NearestFilter;
        this.gradientMap.needsUpdate = true;

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
        // Other presets can be added here

        // Dust particles
        this.dustSystem = new DustSystem(this.scene, 250, this.config.world.roomSize ?? 20, this.config.world.wallHeight ?? 6);

        // Build player
        const playerCfg = this.config.player;
        this.player = buildCharacter(
            {
                id: '_player',
                name: 'Spiller',
                position: playerCfg.startPosition,
                colors: playerCfg.colors,
                face: 'happy',
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

        // Build NPCs
        for (const charCfg of this.config.characters) {
            const built = buildCharacter(charCfg, this.toonMat.bind(this), this.renderer, this.scene);
            this.characters.set(charCfg.id, { ...built, config: { id: charCfg.id, name: charCfg.name } });
        }

        // Build collectibles
        for (const colCfg of this.config.collectibles ?? []) {
            const group = buildCollectibleMesh(colCfg.geometry, colCfg.color, this.toonMat.bind(this));
            group.position.set(...colCfg.position);
            group.userData.collectibleId = colCfg.id;
            this.scene.add(group);
            this.collectibleMeshes.set(colCfg.id, { group, config: { id: colCfg.id, name: colCfg.name } });
        }

        // Let game provide custom assets and wire puzzle callbacks
        if (this.config.setupScene) {
            const ref: GameEngineRef = {
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
            };
            this.config.setupScene(ref);
        }
    }

    private async setupPostProcessing(): Promise<void> {
        try {
            const [
                { EffectComposer },
                { RenderPass },
                { UnrealBloomPass },
                { ShaderPass },
            ] = await Promise.all([
                import('three/addons/postprocessing/EffectComposer.js'),
                import('three/addons/postprocessing/RenderPass.js'),
                import('three/addons/postprocessing/UnrealBloomPass.js'),
                import('three/addons/postprocessing/ShaderPass.js'),
            ]);

            const composer = new EffectComposer(this.renderer);
            composer.addPass(new RenderPass(this.scene, this.camera));

            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.45, 0.7, 0.78
            );
            composer.addPass(bloomPass);

            const VignetteShader = {
                uniforms: {
                    tDiffuse: { value: null },
                    strength: { value: 0.18 },
                    warmth: { value: 0.08 },
                    time: { value: 0 },
                },
                vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
                fragmentShader: `
                    uniform sampler2D tDiffuse; uniform float strength, warmth, time;
                    varying vec2 vUv;
                    void main(){
                        vec4 c=texture2D(tDiffuse,vUv);
                        c.r=min(1.,c.r*(1.+warmth)); c.b*=(1.-warmth*0.5);
                        vec2 uv=vUv-0.5; float d=dot(uv,uv);
                        c.rgb*=1.-d*strength*2.5;
                        float grain=(fract(sin(dot(vUv*time,vec2(12.9898,78.233)))*43758.5453)-0.5)*0.025;
                        c.rgb+=grain;
                        gl_FragColor=c;
                    }`,
            };
            const vignettePass = new ShaderPass(VignetteShader);
            composer.addPass(vignettePass);

            this.composer = composer;
            this.bloomPass = bloomPass;
        } catch (e) {
            console.warn('Post-processing unavailable:', e);
        }
    }

    private setupInput(): void {
        const onKeyDown = (e: KeyboardEvent) => {
            this.keys[e.code] = true;

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

            // Interact key
            if (e.code === 'KeyE' && !this.dialogActive) {
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
            if (this.composer) {
                (this.composer as { setSize: (w: number, h: number) => void }).setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', onResize);
        this._cleanupResize = () => window.removeEventListener('resize', onResize);
    }
    private _cleanupResize: () => void = () => {};

    // ─── Game logic ──────────────────────────────────────────────────────────

    startGame(): void {
        this.gameStarted = true;
        const firstQuest = this.config.quests[0];
        this.phase = firstQuest?.phase ?? 'intro';
        this.pushUIState();
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

        // Delegate to config dialogs based on game phase
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

        this.pushUIState({
            dialog: {
                visible: true,
                speaker: node.speaker,
                text,
                choices: node.choices.map((c) => c.text),
            },
        });
    }

    private resolveDialog(key: string): DialogNode | undefined {
        return this.config.dialogs[key];
    }

    closeDialog(): void {
        this.dialogActive = false;
        this.currentChoices = [];
        this.pushUIState({ dialog: null });
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

        for (const [id, char] of this.characters) {
            const d = this.player.group.position.distanceTo(char.group.position);
            if (d < closestDist) {
                closestDist = d;
                nearChar = id;
                nearCol = null;
            }
        }

        for (const [id, col] of this.collectibleMeshes) {
            const d = this.player.group.position.distanceTo(col.group.position);
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
        this.dialogActive = false;
        this.options.onEnd(this.config.endText);
    }

    private bloomPulse(peak: number, duration: number): void {
        if (this.bloomPass) {
            this.bloomPass.strength = peak;
            this.bloomTarget = 0.45;
            setTimeout(() => {
                if (this.bloomPass) this.bloomPass.strength = this.bloomTarget;
            }, duration * 1000);
        }
    }

    // ─── Push state to React ─────────────────────────────────────────────────

    private pushUIState(override: Partial<GameUIState> = {}): void {
        // Persist dialog/puzzle state across calls so per-frame updates don't reset them
        if ('dialog' in override) this.activeDialog = override.dialog ?? null;
        if ('puzzle' in override) this.activePuzzle = override.puzzle ?? null;

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
            ended: false,
            endText: '',
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
        if (this.composer) {
            (this.composer as { render: () => void }).render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    private update(dt: number): void {
        if (!this.gameStarted) return;
        this.time += dt;

        // Player movement
        const SPEED = 5, JUMP = 6, GRAV = -18;
        const moveDir = new THREE.Vector3();

        if (!this.dialogActive) {
            const fwd = new THREE.Vector3(Math.sin(this.yaw), 0, -Math.cos(this.yaw));
            const right = new THREE.Vector3(Math.cos(this.yaw), 0, Math.sin(this.yaw));
            if (this.keys['KeyW']) moveDir.add(fwd);
            if (this.keys['KeyS']) moveDir.sub(fwd);
            if (this.keys['KeyD']) moveDir.add(right);
            if (this.keys['KeyA']) moveDir.sub(right);
            if (moveDir.lengthSq() > 0) moveDir.normalize();
        }

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

        const hw = (this.config.world.roomSize ?? 20) / 2 - 0.6;
        this.player.group.position.x = Math.max(-hw, Math.min(hw, this.player.group.position.x));
        this.player.group.position.z = Math.max(-hw, Math.min(hw, this.player.group.position.z));

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
        for (const char of this.characters.values()) {
            char.group.position.y = Math.sin(this.time * 1.5) * 0.03;
            const toPlayer = new THREE.Vector3().subVectors(
                this.player.group.position,
                char.group.position
            );
            char.group.rotation.y = Math.atan2(toPlayer.x, toPlayer.z);

            if (char.marker) {
                char.marker.position.y = 2.2 + Math.sin(this.time * 3) * 0.12;
                (char.marker.material as THREE.MeshBasicMaterial).opacity =
                    0.5 + Math.sin(this.time * 4) * 0.5;

                // Show marker based on phase
                const showMarker = this.phase === 'intro' ||
                    (this.phase === 'collecting' && this.collectedIds.size === (this.config.collectibles?.length ?? 0)) ||
                    this.phase === 'puzzle';
                char.marker.visible = showMarker;
            }
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
        this.dustSystem.update(dt);
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

        // Post-processing
        if (this.bloomPass) {
            this.bloomPass.strength += (this.bloomTarget - this.bloomPass.strength) * dt * 3;
        }

        // Handle flash
        if (this.flashPending) {
            this.flashPending = false;
            this.options.onUIUpdate({ showFlash: true });
            setTimeout(() => this.options.onUIUpdate({ showFlash: false }), 200);
        }

        // Proximity
        this.checkProximity();

        // Camera
        this.updateCamera(dt);
    }

    private updateCamera(dt: number): void {
        const camDist = 4.5, camH = 2.5;
        const idealPos = new THREE.Vector3(
            this.player.group.position.x - Math.sin(this.yaw) * camDist * Math.cos(this.pitch),
            this.player.group.position.y + camH + Math.sin(this.pitch) * camDist,
            this.player.group.position.z + Math.cos(this.yaw) * camDist * Math.cos(this.pitch)
        );
        idealPos.y = Math.max(0.5, idealPos.y);
        this.camPos.lerp(idealPos, Math.min(1, dt * 8));
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

        const lookTgt = this.player.group.position.clone();
        lookTgt.y += 1.2;
        this.camTarget.lerp(lookTgt, Math.min(1, dt * 10));
        this.camera.lookAt(this.camTarget);
    }

    // ─── Cleanup ─────────────────────────────────────────────────────────────

    dispose(): void {
        this.disposed = true;
        cancelAnimationFrame(this.animFrameId);
        this._cleanupInput();
        this._cleanupResize();
        if (document.pointerLockElement === this.renderer.domElement) {
            document.exitPointerLock();
        }
        this.renderer.dispose();
        if (this.options.container.contains(this.renderer.domElement)) {
            this.options.container.removeChild(this.renderer.domElement);
        }
    }
}
