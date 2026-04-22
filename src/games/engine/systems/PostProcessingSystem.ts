import * as THREE from 'three';

export type QualityTier = 'low' | 'medium' | 'high';

// Single-pass cinematic shader — safe for all devices (Chromebook included).
const LightweightCinematicShader = {
    uniforms: {
        tDiffuse: { value: null },
        time: { value: 0 },
        warmth: { value: 0.06 },
        vignette: { value: 0.55 },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float warmth;
        uniform float vignette;
        varying vec2 vUv;
        void main(){
            vec2 center = vUv - 0.5;
            float edge = dot(center, center);
            float aberr = 0.0018 * edge;
            float r = texture2D(tDiffuse, vUv + vec2(aberr,  0.0)).r;
            float g = texture2D(tDiffuse, vUv                   ).g;
            float b = texture2D(tDiffuse, vUv - vec2(aberr,  0.0)).b;
            vec4 c = vec4(r, g, b, 1.0);
            c.r = min(1.0, c.r * (1.0 + warmth));
            c.b *= (1.0 - warmth * 0.5);
            c.rgb *= 1.0 - edge * vignette;
            gl_FragColor = c;
        }`,
};

const HighEndCinematicShader = {
    uniforms: {
        tDiffuse: { value: null },
        time: { value: 0 },
        warmth: { value: 0.08 },
        vignette: { value: 0.45 },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float warmth;
        uniform float vignette;
        varying vec2 vUv;
        void main(){
            vec2 center = vUv - 0.5;
            float edge = dot(center, center);
            float aberr = 0.003 * edge;
            float r = texture2D(tDiffuse, vUv + vec2(aberr,  0.0)).r;
            float g = texture2D(tDiffuse, vUv                   ).g;
            float b = texture2D(tDiffuse, vUv - vec2(aberr,  0.0)).b;
            vec4 c = vec4(r, g, b, 1.0);
            c.r = min(1.0, c.r * (1.0 + warmth));
            c.b *= (1.0 - warmth * 0.5);
            c.rgb *= 1.0 - edge * vignette;
            gl_FragColor = c;
        }`,
};

interface BloomPassLike {
    strength: number;
    resolution: THREE.Vector2;
}

interface CinematicPassLike {
    uniforms: {
        time: { value: number };
        warmth: { value: number };
        vignette: { value: number };
    };
}

interface FxaaPassLike {
    uniforms: { resolution: { value: { x: number; y: number } } };
}

interface ComposerLike {
    render: () => void;
    setSize: (w: number, h: number) => void;
    setPixelRatio?: (pr: number) => void;
}

export interface ColorGradingPreset {
    warmth: number;
    vignette: number;
}

const COLOR_GRADING_PRESETS: Record<string, ColorGradingPreset> = {
    neutral: { warmth: 0.0, vignette: 0.4 },
    warm: { warmth: 0.12, vignette: 0.45 },
    cold: { warmth: -0.1, vignette: 0.5 },
    sepia: { warmth: 0.22, vignette: 0.6 },
    dawn: { warmth: 0.18, vignette: 0.4 },
    dusk: { warmth: 0.28, vignette: 0.55 },
};

export type ColorGrading = keyof typeof COLOR_GRADING_PRESETS;

// Auto-detect device tier from hardware hints.
export function detectTier(): QualityTier {
    const cores = navigator.hardwareConcurrency ?? 4;
    const dpr = window.devicePixelRatio ?? 1;
    if (cores <= 4 || dpr < 1.5) return 'low';
    return 'medium';
}

export function resolveTier(requested: 'auto' | QualityTier): QualityTier {
    if (requested === 'auto') return detectTier();
    return requested;
}

export class PostProcessingSystem {
    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private tier: QualityTier;
    private composer: ComposerLike | null = null;
    private bloomPass: BloomPassLike | null = null;
    private bloomTarget = 0.35;
    private cinematicPass: CinematicPassLike | null = null;
    private fxaaPass: FxaaPassLike | null = null;
    private grading: ColorGradingPreset;
    private initialized = false;
    private enabled = true;
    private time = 0;

    constructor(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        tier: QualityTier,
        grading: ColorGrading = 'warm',
    ) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.tier = tier;
        this.grading = COLOR_GRADING_PRESETS[grading] ?? COLOR_GRADING_PRESETS.warm;
    }

    getTier(): QualityTier {
        return this.tier;
    }

    isReady(): boolean {
        return this.initialized;
    }

    async init(): Promise<void> {
        try {
            if (this.tier === 'low') {
                await this.setupLow();
            } else if (this.tier === 'medium') {
                await this.setupMedium();
            } else {
                await this.setupHigh();
            }
            this.initialized = true;
        } catch (e) {
            console.warn('PostProcessing init failed, falling back to direct render:', e);
        }
    }

    private async setupLow(): Promise<void> {
        const [{ EffectComposer }, { RenderPass }, { ShaderPass }, { FXAAShader }] =
            await Promise.all([
                import('three/addons/postprocessing/EffectComposer.js'),
                import('three/addons/postprocessing/RenderPass.js'),
                import('three/addons/postprocessing/ShaderPass.js'),
                import('three/addons/shaders/FXAAShader.js'),
            ]);
        const composer = new EffectComposer(this.renderer);
        composer.addPass(new RenderPass(this.scene, this.camera));
        const cinematic = new ShaderPass(LightweightCinematicShader);
        cinematic.uniforms.warmth.value = this.grading.warmth;
        cinematic.uniforms.vignette.value = this.grading.vignette;
        composer.addPass(cinematic);
        const fxaa = new ShaderPass(FXAAShader);
        const pr = this.renderer.getPixelRatio();
        fxaa.uniforms['resolution'].value.x = 1 / (window.innerWidth * pr);
        fxaa.uniforms['resolution'].value.y = 1 / (window.innerHeight * pr);
        composer.addPass(fxaa);
        this.composer = composer as unknown as ComposerLike;
        this.cinematicPass = cinematic as unknown as CinematicPassLike;
        this.fxaaPass = fxaa as unknown as FxaaPassLike;
    }

    private async setupMedium(): Promise<void> {
        const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { ShaderPass }, { FXAAShader }] =
            await Promise.all([
                import('three/addons/postprocessing/EffectComposer.js'),
                import('three/addons/postprocessing/RenderPass.js'),
                import('three/addons/postprocessing/UnrealBloomPass.js'),
                import('three/addons/postprocessing/ShaderPass.js'),
                import('three/addons/shaders/FXAAShader.js'),
            ]);
        const composer = new EffectComposer(this.renderer);
        composer.addPass(new RenderPass(this.scene, this.camera));
        const bloom = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.35,
            0.7,
            0.25,
        );
        composer.addPass(bloom);
        const cinematic = new ShaderPass(HighEndCinematicShader);
        cinematic.uniforms.warmth.value = this.grading.warmth;
        cinematic.uniforms.vignette.value = this.grading.vignette;
        composer.addPass(cinematic);
        const fxaa = new ShaderPass(FXAAShader);
        const pr = this.renderer.getPixelRatio();
        fxaa.uniforms['resolution'].value.x = 1 / (window.innerWidth * pr);
        fxaa.uniforms['resolution'].value.y = 1 / (window.innerHeight * pr);
        composer.addPass(fxaa);
        this.composer = composer as unknown as ComposerLike;
        this.bloomPass = bloom as unknown as BloomPassLike;
        this.cinematicPass = cinematic as unknown as CinematicPassLike;
        this.fxaaPass = fxaa as unknown as FxaaPassLike;
    }

    private async setupHigh(): Promise<void> {
        // High = Medium + sterkere bloom. SSAO/godrays er reservert for fremtidig utvidelse.
        await this.setupMedium();
        if (this.bloomPass) {
            this.bloomPass.strength = 0.55;
            this.bloomTarget = 0.55;
        }
    }

    update(dt: number): void {
        this.time += dt;
        if (this.cinematicPass) {
            this.cinematicPass.uniforms.time.value = this.time;
        }
        if (this.bloomPass) {
            this.bloomPass.strength += (this.bloomTarget - this.bloomPass.strength) * dt * 3;
        }
    }

    render(): void {
        if (this.enabled && this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    setEnabled(on: boolean): void {
        this.enabled = on;
    }

    resize(width: number, height: number): void {
        if (this.composer) {
            this.composer.setSize(width, height);
        }
        if (this.fxaaPass) {
            const pr = this.renderer.getPixelRatio();
            this.fxaaPass.uniforms.resolution.value.x = 1 / (width * pr);
            this.fxaaPass.uniforms.resolution.value.y = 1 / (height * pr);
        }
        if (this.bloomPass) {
            this.bloomPass.resolution.set(width, height);
        }
    }

    setBloom(strength: number): void {
        this.bloomTarget = strength;
    }

    bloomPulse(peak: number, fallbackMs: number): void {
        if (!this.bloomPass) return;
        this.bloomPass.strength = peak;
        const target = 0.35;
        setTimeout(() => {
            if (this.bloomPass) this.bloomTarget = target;
        }, fallbackMs);
    }

    setColorGrading(grading: ColorGrading): void {
        this.grading = COLOR_GRADING_PRESETS[grading] ?? COLOR_GRADING_PRESETS.warm;
        if (this.cinematicPass) {
            this.cinematicPass.uniforms.warmth.value = this.grading.warmth;
            this.cinematicPass.uniforms.vignette.value = this.grading.vignette;
        }
    }

    dispose(): void {
        this.composer = null;
        this.bloomPass = null;
        this.cinematicPass = null;
        this.fxaaPass = null;
    }
}
