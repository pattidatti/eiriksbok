import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import type { AABB2D } from '../types';
import type { QualityTier } from './PostProcessingSystem';

// CrowdSystem: instansierte folkemengder - hundrevis til ~2000 lavpoly-mennesker
// i ÉN draw call per crowd. All gang-animasjon skjer i vertex-shaderen (uTime +
// per-instans fase), så CPU-kostnaden per frame er kun uniform-skriving.
//
// To moduser:
//   'static' - stående mengde i et AABB-område (idle-svai, ingen forflytning)
//   'march'  - kolonnen flyter langs en polylinje med conveyor-wrap: instanser
//              som passerer enden teleporteres til starten via mod() i shaderen.
//              Med scene-tåke ser kolonnen dermed UENDELIG ut i begge retninger.
//
// Materialet er MeshLambertMaterial + onBeforeCompile (samme mønster som
// tre-løvverket i VegetationSystem) slik at tåke, lys og instanceColor følger
// med gratis fra three sine shader-chunks. castShadow er ALLTID av: three sitt
// depth-material kjører ikke vår displacement, så skygger ville blitt stående
// på spawn-posisjonene mens kolonnen marsjerer.

export type CrowdMode = 'static' | 'march';

export interface CrowdPalette {
    shirts: number[];   // per-instans skjortefarge (instanceColor)
    skin?: number;      // felles hudfarge (uniform)
    caps?: number;      // felles luefarge (uniform)
    pants?: number;     // felles buksefarge (uniform)
}

export interface CrowdAreaSpec {
    area: AABB2D;
    y?: number; // bakkenivå, default 0
}

export interface CrowdPathSpec {
    path: Array<[number, number, number]>; // polylinje, splittes i rette segmenter
    width: number;                          // kolonnebredde i meter
}

export interface AddCrowdOptions {
    count: number;        // ønsket antall FØR tier-skalering
    mode: CrowdMode;
    speed?: number;       // m/s, kun march (default 1.2)
    palette?: CrowdPalette;
    scaleJitter?: number; // default 0.12
    spacing?: number;     // avstand mellom rekker i kolonne, default 0.9
}

const DEFAULT_PALETTE: CrowdPalette = {
    shirts: [0x6a5d4c, 0x57514a, 0x745d49, 0x4e4a44],
    skin: 0xc89868,
    caps: 0x3a342c,
    pants: 0x2e2a24,
};

interface CrowdUniforms {
    uTime: { value: number };
    uStepRate: { value: number };
    uMoving: { value: number };
    uBobAmp: { value: number };
    uLimbAmp: { value: number };
    uScroll: { value: number };
    uPathLength: { value: number };
    uSkinColor: { value: THREE.Color };
    uCapColor: { value: THREE.Color };
    uPantsColor: { value: THREE.Color };
}

interface CrowdSegment {
    mesh: THREE.InstancedMesh;
    geometry: THREE.BufferGeometry;
    material: THREE.MeshLambertMaterial;
    uniforms: CrowdUniforms;
    center: THREE.Vector3;
    radius: number;
    pathLength: number;
    scroll: number;
}

interface CrowdEntry {
    id: string;
    mode: CrowdMode;
    speed: number;
    moving: number; // 0..1, lerpes mot mål for myk stopp/start
    visible: boolean;
    segments: CrowdSegment[];
}

// ─── Delt humanoid-geometri ──────────────────────────────────────────────────
// aLimb: 0 = kropp/hode/lue, 1 = v.ben, 2 = h.ben, 3 = v.arm, 4 = h.arm
// aPart: 0 = skjorte (instanceColor), 1 = hud, 2 = lue, 3 = bukse

function tagPart(geo: THREE.BufferGeometry, limb: number, part: number): THREE.BufferGeometry {
    const n = geo.attributes.position.count;
    const limbArr = new Float32Array(n).fill(limb);
    const partArr = new Float32Array(n).fill(part);
    geo.setAttribute('aLimb', new THREE.BufferAttribute(limbArr, 1));
    geo.setAttribute('aPart', new THREE.BufferAttribute(partArr, 1));
    return geo;
}

let baseGeometryCache: THREE.BufferGeometry | null = null;

function getBaseHumanoidGeometry(): THREE.BufferGeometry {
    if (baseGeometryCache) return baseGeometryCache;
    const parts: THREE.BufferGeometry[] = [];
    // Torso (skjorte)
    const torso = new THREE.CylinderGeometry(0.24, 0.3, 0.8, 6);
    torso.translate(0, 1.13, 0);
    parts.push(tagPart(torso, 0, 0));
    // Hode (hud)
    const head = new THREE.SphereGeometry(0.18, 7, 6);
    head.translate(0, 1.66, 0);
    parts.push(tagPart(head, 0, 1));
    // Lue
    const cap = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 6);
    cap.translate(0, 1.83, 0);
    parts.push(tagPart(cap, 0, 2));
    // Ben (bukse)
    for (const [x, limb] of [[-0.1, 1], [0.1, 2]] as Array<[number, number]>) {
        const leg = new THREE.BoxGeometry(0.13, 0.75, 0.13);
        leg.translate(x, 0.375, 0);
        parts.push(tagPart(leg, limb, 3));
    }
    // Armer (skjorte)
    for (const [x, limb] of [[-0.34, 3], [0.34, 4]] as Array<[number, number]>) {
        const arm = new THREE.BoxGeometry(0.09, 0.55, 0.09);
        arm.translate(x, 1.2, 0);
        parts.push(tagPart(arm, limb, 0));
    }
    const merged = mergeGeometries(parts, false);
    for (const p of parts) p.dispose();
    if (!merged) throw new Error('[CrowdSystem] mergeGeometries feilet');
    baseGeometryCache = merged;
    return merged;
}

// ─── Shader-mod ──────────────────────────────────────────────────────────────
// Returnerer en per-crowd mod (lukker over crowd-ens uniforms). Lagres også på
// material.userData._shaderMod slik at ShadowSystem rekjeder den etter
// CSM.setupMaterial på høy tier.

function makeCrowdShaderMod(
    uniforms: CrowdUniforms,
): (shader: THREE.WebGLProgramParametersWithUniforms) => void {
    return (shader) => {
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = shader.vertexShader
            .replace(
                '#include <common>',
                `#include <common>
                uniform float uTime;
                uniform float uStepRate;
                uniform float uMoving;
                uniform float uBobAmp;
                uniform float uLimbAmp;
                uniform float uScroll;
                uniform float uPathLength;
                attribute float aLimb;
                attribute float aPart;
                attribute float aPhase;
                attribute float aPathT;
                attribute float aScale;
                varying float vCrowdPart;
                varying float vCrowdTone;`,
            )
            .replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>
                vCrowdPart = aPart;
                vCrowdTone = 0.85 + fract(aPhase * 7.13) * 0.3;
                float _cPh = uTime * uStepRate + aPhase * 6.2831;
                float _cSwing = sin(_cPh) * uLimbAmp * uMoving;
                float _isLLeg = step(0.5, aLimb) * (1.0 - step(1.5, aLimb));
                float _isRLeg = step(1.5, aLimb) * (1.0 - step(2.5, aLimb));
                float _isLArm = step(2.5, aLimb) * (1.0 - step(3.5, aLimb));
                float _isRArm = step(3.5, aLimb);
                float _legF = clamp((0.75 - position.y) / 0.75, 0.0, 1.0);
                float _armF = clamp((1.35 - position.y) / 0.6, 0.0, 1.0);
                transformed.z += _cSwing * _legF * (_isLLeg - _isRLeg);
                transformed.z += _cSwing * 0.55 * _armF * (_isRArm - _isLArm);
                transformed.y += abs(sin(_cPh)) * uBobAmp * uMoving + sin(_cPh * 0.43) * 0.012;
                transformed.x += sin(_cPh * 0.5) * 0.02 * clamp(position.y, 0.0, 1.0);
                // Conveyor: flytt instansen langs kolonneaksen (objekt-+Z) med wrap.
                // Deles på aScale fordi instanceMatrix skalerer displacementen.
                float _cDelta = mod(aPathT + uScroll, uPathLength) - aPathT;
                transformed.z += _cDelta / max(aScale, 0.001);`,
            );
        shader.fragmentShader = shader.fragmentShader
            .replace(
                '#include <common>',
                `#include <common>
                uniform vec3 uSkinColor;
                uniform vec3 uCapColor;
                uniform vec3 uPantsColor;
                varying float vCrowdPart;
                varying float vCrowdTone;`,
            )
            .replace(
                '#include <color_fragment>',
                `#include <color_fragment>
                vec3 _crowdCol = diffuseColor.rgb;
                if (vCrowdPart > 2.5) _crowdCol = uPantsColor;
                else if (vCrowdPart > 1.5) _crowdCol = uCapColor;
                else if (vCrowdPart > 0.5) _crowdCol = uSkinColor;
                diffuseColor.rgb = _crowdCol * vCrowdTone;`,
            );
    };
}

// ─── Tier-skalering ──────────────────────────────────────────────────────────

function tierParams(tier: QualityTier): { factor: number; cap: number; limbAmp: number; cullDist: number } {
    if (tier === 'low') return { factor: 0.35, cap: 600, limbAmp: 0, cullDist: 60 };
    if (tier === 'medium') return { factor: 0.7, cap: 1400, limbAmp: 0.16, cullDist: 110 };
    return { factor: 1.0, cap: 2200, limbAmp: 0.16, cullDist: 180 };
}

// ─── System ──────────────────────────────────────────────────────────────────

export class CrowdSystem {
    private scene: THREE.Scene;
    private tier: QualityTier;
    private crowds = new Map<string, CrowdEntry>();
    private time = 0;
    private _tmpVec = new THREE.Vector3();

    constructor(scene: THREE.Scene, tier: QualityTier) {
        this.scene = scene;
        this.tier = tier;
    }

    addCrowd(id: string, spec: CrowdAreaSpec | CrowdPathSpec, opts: AddCrowdOptions): void {
        if (this.crowds.has(id)) {
            console.warn(`[CrowdSystem] Crowd '${id}' finnes allerede - ignorerer.`);
            return;
        }
        const { factor, cap } = tierParams(this.tier);
        const count = Math.max(4, Math.min(cap, Math.floor(opts.count * factor)));
        const entry: CrowdEntry = {
            id,
            mode: opts.mode,
            speed: opts.mode === 'march' ? (opts.speed ?? 1.2) : 0,
            moving: opts.mode === 'march' ? 1 : 0,
            visible: true,
            segments: [],
        };

        if ('path' in spec) {
            // Splitt polylinjen i rette segmenter; fordel antallet etter lengde
            const pts = spec.path.map((p) => new THREE.Vector3(...p));
            if (pts.length < 2) throw new Error(`[CrowdSystem] Crowd '${id}': path trenger minst 2 punkter.`);
            const lengths: number[] = [];
            let total = 0;
            for (let i = 0; i < pts.length - 1; i++) {
                const len = pts[i].distanceTo(pts[i + 1]);
                lengths.push(len);
                total += len;
            }
            for (let i = 0; i < pts.length - 1; i++) {
                const segCount = Math.max(2, Math.round((count * lengths[i]) / total));
                entry.segments.push(
                    this.buildMarchSegment(pts[i], pts[i + 1], spec.width, segCount, opts),
                );
            }
        } else {
            entry.segments.push(this.buildStaticArea(spec, count, opts));
        }

        for (const seg of entry.segments) this.scene.add(seg.mesh);
        this.crowds.set(id, entry);
    }

    /** Endre kolonnens fart. 0 stopper marsjen (gang-animasjonen stopper mykt). */
    setSpeed(id: string, speed: number): void {
        const entry = this.crowds.get(id);
        if (entry) entry.speed = Math.max(0, speed);
    }

    setVisible(id: string, visible: boolean): void {
        const entry = this.crowds.get(id);
        if (!entry) return;
        entry.visible = visible;
        for (const seg of entry.segments) seg.mesh.visible = visible;
    }

    update(dt: number, camera?: THREE.Camera): void {
        this.time += dt;
        const { cullDist } = tierParams(this.tier);
        const camPos = camera ? camera.getWorldPosition(this._tmpVec) : null;

        for (const entry of this.crowds.values()) {
            // Myk start/stopp av gang-animasjonen
            const movingTarget = entry.speed > 0.05 ? 1 : 0;
            entry.moving += (movingTarget - entry.moving) * Math.min(1, dt * 2.5);
            // Skrittfrekvens følger farten (1.2 m/s ≈ marsj-takt)
            const stepRate = 6.0 * Math.max(0.3, entry.speed) / 1.2;

            for (const seg of entry.segments) {
                // CPU-side wrap av scroll (mediump-presisjon på Chromebook-GPU-er
                // jitterer hvis mod() får store tall)
                seg.scroll = (seg.scroll + entry.speed * dt) % seg.pathLength;
                seg.uniforms.uTime.value = this.time;
                seg.uniforms.uScroll.value = seg.scroll;
                seg.uniforms.uMoving.value = entry.moving;
                seg.uniforms.uStepRate.value = stepRate;
                if (camPos && entry.visible) {
                    const dx = seg.center.x - camPos.x;
                    const dz = seg.center.z - camPos.z;
                    const limit = cullDist + seg.radius;
                    seg.mesh.visible = dx * dx + dz * dz < limit * limit;
                }
            }
        }
    }

    dispose(): void {
        for (const entry of this.crowds.values()) {
            for (const seg of entry.segments) {
                this.scene.remove(seg.mesh);
                // InstancedMesh.dispose() frigjør instanceMatrix/instanceColor-GPU-buffere
                // (sceneDispose gjør IKKE dette).
                seg.mesh.dispose();
                seg.geometry.dispose();
                seg.material.dispose();
            }
        }
        this.crowds.clear();
        baseGeometryCache?.dispose();
        baseGeometryCache = null;
    }

    // ─── Bygging ─────────────────────────────────────────────────────────────

    private buildSegmentCore(count: number, opts: AddCrowdOptions): {
        mesh: THREE.InstancedMesh;
        geometry: THREE.BufferGeometry;
        material: THREE.MeshLambertMaterial;
        uniforms: CrowdUniforms;
        phases: Float32Array;
        pathTs: Float32Array;
        scales: Float32Array;
    } {
        const palette = opts.palette ?? DEFAULT_PALETTE;
        const { limbAmp } = tierParams(this.tier);
        const uniforms: CrowdUniforms = {
            uTime: { value: 0 },
            uStepRate: { value: 5 },
            uMoving: { value: 0 },
            uBobAmp: { value: 0.05 },
            uLimbAmp: { value: limbAmp },
            uScroll: { value: 0 },
            uPathLength: { value: 1 },
            uSkinColor: { value: new THREE.Color(palette.skin ?? DEFAULT_PALETTE.skin!) },
            uCapColor: { value: new THREE.Color(palette.caps ?? DEFAULT_PALETTE.caps!) },
            uPantsColor: { value: new THREE.Color(palette.pants ?? DEFAULT_PALETTE.pants!) },
        };

        // Geometrien klones per segment fordi instans-attributtene (aPhase osv.)
        // bor på geometrien og varierer mellom segmenter.
        const geometry = getBaseHumanoidGeometry().clone();
        const phases = new Float32Array(count);
        const pathTs = new Float32Array(count);
        const scales = new Float32Array(count);
        geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));
        geometry.setAttribute('aPathT', new THREE.InstancedBufferAttribute(pathTs, 1));
        geometry.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1));

        const material = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const mod = makeCrowdShaderMod(uniforms);
        material.onBeforeCompile = mod;
        material.customProgramCacheKey = () => 'crowd-walk';
        (material.userData as Record<string, unknown>)._shaderMod = mod;

        const mesh = new THREE.InstancedMesh(geometry, material, count);
        mesh.frustumCulled = false; // shader-displacement gjør bounding-sfæren ugyldig
        mesh.castShadow = false;    // depth-pass kjenner ikke displacementen
        mesh.receiveShadow = false;

        const shirtColor = new THREE.Color();
        for (let i = 0; i < count; i++) {
            shirtColor.setHex(palette.shirts[i % palette.shirts.length]);
            // Liten lysstyrkevariasjon i tillegg til vCrowdTone
            mesh.setColorAt(i, shirtColor);
        }
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

        return { mesh, geometry, material, uniforms, phases, pathTs, scales };
    }

    private buildMarchSegment(
        from: THREE.Vector3,
        to: THREE.Vector3,
        width: number,
        count: number,
        opts: AddCrowdOptions,
    ): CrowdSegment {
        const core = this.buildSegmentCore(count, opts);
        const dir = to.clone().sub(from);
        const pathLength = dir.length();
        dir.normalize();
        // Instansrotasjonen MÅ peke eksakt langs dir: conveyor-displacementen skjer
        // i objekt-+Z, og yaw-jitter ville gitt lateral drift over lange avstander.
        const yaw = Math.atan2(dir.x, dir.z);
        const lateral = new THREE.Vector3(dir.z, 0, -dir.x); // perpendikulær i XZ
        core.uniforms.uPathLength.value = pathLength;

        const spacing = opts.spacing ?? 0.9;
        const jitter = opts.scaleJitter ?? 0.12;
        const perRank = Math.max(1, Math.floor(width / 0.8));
        const matrix = new THREE.Matrix4();
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const scl = new THREE.Vector3();

        for (let i = 0; i < count; i++) {
            const rank = Math.floor(i / perRank);
            const col = i % perRank;
            // t fordeles over hele lengden med wrap; jitter unngår synlige "vegger"
            const t = (rank * spacing + Math.random() * 0.3) % pathLength;
            const lat = (col - (perRank - 1) / 2) * 0.8 + (Math.random() - 0.5) * 0.3;
            pos.copy(from).addScaledVector(dir, t).addScaledVector(lateral, lat);
            const s = 1 - jitter / 2 + Math.random() * jitter;
            scl.set(s, s, s);
            matrix.compose(pos, quat, scl);
            core.mesh.setMatrixAt(i, matrix);
            core.phases[i] = Math.random();
            core.pathTs[i] = t;
            core.scales[i] = s;
        }
        core.mesh.instanceMatrix.needsUpdate = true;

        const center = from.clone().add(to).multiplyScalar(0.5);
        return {
            mesh: core.mesh,
            geometry: core.geometry,
            material: core.material,
            uniforms: core.uniforms,
            center,
            radius: pathLength / 2 + width,
            pathLength,
            scroll: 0,
        };
    }

    private buildStaticArea(spec: CrowdAreaSpec, count: number, opts: AddCrowdOptions): CrowdSegment {
        const core = this.buildSegmentCore(count, opts);
        const { area } = spec;
        const y = spec.y ?? 0;
        const w = area.maxX - area.minX;
        const d = area.maxZ - area.minZ;
        const jitter = opts.scaleJitter ?? 0.12;
        const matrix = new THREE.Matrix4();
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const up = new THREE.Vector3(0, 1, 0);
        const scl = new THREE.Vector3();

        for (let i = 0; i < count; i++) {
            pos.set(area.minX + Math.random() * w, y, area.minZ + Math.random() * d);
            quat.setFromAxisAngle(up, Math.random() * Math.PI * 2);
            const s = 1 - jitter / 2 + Math.random() * jitter;
            scl.set(s, s, s);
            matrix.compose(pos, quat, scl);
            core.mesh.setMatrixAt(i, matrix);
            core.phases[i] = Math.random();
            core.pathTs[i] = 0; // ingen conveyor i static-modus
            core.scales[i] = s;
        }
        core.mesh.instanceMatrix.needsUpdate = true;

        const center = new THREE.Vector3((area.minX + area.maxX) / 2, y, (area.minZ + area.maxZ) / 2);
        return {
            mesh: core.mesh,
            geometry: core.geometry,
            material: core.material,
            uniforms: core.uniforms,
            center,
            radius: 0.5 * Math.hypot(w, d),
            pathLength: 1,
            scroll: 0,
        };
    }
}
