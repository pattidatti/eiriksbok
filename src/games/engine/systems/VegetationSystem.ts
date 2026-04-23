import * as THREE from 'three';
import type { AABB2D, VegetationType, TreeType } from '../types';
import type { QualityTier } from './PostProcessingSystem';

// Vind-shader: bare topp-vertices vaier (UV.y bestemmer "hvor langt opp" punktet er).
const grassVertex = `
    uniform float uTime;
    uniform float uWindStrength;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
        vec4 worldPos = modelMatrix * instanceMatrix * vec4(position, 1.0);
        float topMask = max(0.0, uv.y);
        float wave = sin(uTime * 2.2 + worldPos.x * 0.6 + worldPos.z * 0.4) * 0.18
                   + sin(uTime * 3.7 + worldPos.z * 1.1) * 0.06;
        mv.x += wave * topMask * uWindStrength;
        mv.z += wave * topMask * uWindStrength * 0.4;
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * mv;
    }
`;

const grassFragment = `
    uniform vec3 uColorBase;
    uniform vec3 uColorTip;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
        vec3 color = mix(uColorBase, uColorTip, smoothstep(0.0, 1.0, vUv.y));
        // Litt variasjon basert på position (poor mans noise)
        float n = fract(sin(dot(vWorldPos.xz, vec2(12.9898, 78.233))) * 43758.5453);
        color *= 0.85 + n * 0.3;
        gl_FragColor = vec4(color, 1.0);
    }
`;

interface VegetationGroup {
    mesh: THREE.InstancedMesh;
    material: THREE.ShaderMaterial;
    center: THREE.Vector3;
    radius: number;
}

interface TreeEntry {
    lod: THREE.LOD;
}

// Delte vind-uniforms for alle nær-foliage-materialer. update() bumper uTime
// én gang per frame; alle tre-materialer deler referanse så det er gratis.
const windUniforms = {
    uTime: { value: 0 },
    uWindStrength: { value: 0.18 },
};

// Delt per TreeType — sparer GPU state-endringer og sikrer at alle trær av
// samme type ser helt like ut. Eneste overgang er til billboard-spriten langt unna.
const foliageMatCache = new Map<TreeType, THREE.MeshLambertMaterial>();

// Eksporteres så ShadowSystem kan rekjede vind-moden på toppen av CSM-ens
// onBeforeCompile (CSM overskriver materialets onBeforeCompile når det setup-es).
export function applyWindShaderMod(shader: THREE.WebGLProgramParametersWithUniforms): void {
    shader.uniforms.uTime = windUniforms.uTime;
    shader.uniforms.uWindStrength = windUniforms.uWindStrength;
    shader.vertexShader = shader.vertexShader
        .replace(
            '#include <common>',
            `#include <common>\nuniform float uTime;\nuniform float uWindStrength;`,
        )
        .replace(
            '#include <begin_vertex>',
            `#include <begin_vertex>
            float _topMask = max(0.0, position.y);
            vec4 _worldP = modelMatrix * vec4(position, 1.0);
            float _wave = sin(uTime * 1.8 + _worldP.x * 0.4) * 0.12
                        + sin(uTime * 2.6 + _worldP.z * 0.6) * 0.06;
            transformed.x += _wave * _topMask * uWindStrength;
            transformed.z += _wave * _topMask * uWindStrength * 0.4;`,
        );
}

function getFoliageMaterial(type: TreeType): THREE.MeshLambertMaterial {
    const cached = foliageMatCache.get(type);
    if (cached) return cached;
    const profile = TREE_PROFILES[type];

    const mat = new THREE.MeshLambertMaterial({ color: profile.foliageColor });
    mat.onBeforeCompile = applyWindShaderMod;
    // Markér så ShadowSystem vet å rekjede etter CSM.setupMaterial.
    (mat.userData as Record<string, unknown>)._shaderMod = applyWindShaderMod;

    foliageMatCache.set(type, mat);
    return mat;
}

// Delt trunk-material per tre-type (matcher foliage-deling).
const trunkMatCache = new Map<TreeType, THREE.MeshStandardMaterial>();
function getTrunkMaterial(type: TreeType): THREE.MeshStandardMaterial {
    const cached = trunkMatCache.get(type);
    if (cached) return cached;
    const profile = TREE_PROFILES[type];
    const mat = new THREE.MeshStandardMaterial({
        color: profile.trunkColor,
        roughness: 0.95,
        metalness: 0,
    });
    trunkMatCache.set(type, mat);
    return mat;
}

const TYPE_COLORS: Record<VegetationType, { base: number; tip: number; height: number; width: number }> = {
    grass:       { base: 0x3a5a28, tip: 0x7ba858, height: 0.45, width: 0.07 },
    reeds:       { base: 0x3d4a28, tip: 0x9aa860, height: 0.95, width: 0.05 },
    flowers:     { base: 0x3a5a28, tip: 0xd87aa0, height: 0.32, width: 0.09 },
    heather:     { base: 0x7a3a7a, tip: 0xcc66cc, height: 0.28, width: 0.10 },
    wildflowers: { base: 0x3a5a28, tip: 0xe06060, height: 0.38, width: 0.08 },
    ferns:       { base: 0x2a4a1a, tip: 0x5a8a2a, height: 0.60, width: 0.14 },
    bush:        { base: 0x2a4a18, tip: 0x4a7a28, height: 0.50, width: 0.18 },
};

const TREE_PROFILES: Record<TreeType, { trunkColor: number; foliageColor: number; trunkHeight: number; trunkRadius: number; foliageRadius: number; foliageHeight: number }> = {
    pine:  { trunkColor: 0x4a3018, foliageColor: 0x2e5a32, trunkHeight: 1.6, trunkRadius: 0.18, foliageRadius: 1.2, foliageHeight: 3.0 },
    oak:   { trunkColor: 0x5a3818, foliageColor: 0x4a7a32, trunkHeight: 2.0, trunkRadius: 0.22, foliageRadius: 1.6, foliageHeight: 2.0 },
    birch: { trunkColor: 0xc8c0a8, foliageColor: 0x86a858, trunkHeight: 2.2, trunkRadius: 0.14, foliageRadius: 1.2, foliageHeight: 1.8 },
};

// Fase 5.3: billboard-texturer caches per TreeType. Rendres én gang via canvas
// slik at vi ikke trenger en offscreen-WebGL-renderer. Sprites roterer alltid mot
// kamera, så et enkelt silhuett-bilde holder i det fjerne.
const billboardCache = new Map<TreeType, THREE.Texture>();

function getTreeBillboard(type: TreeType): THREE.Texture {
    const cached = billboardCache.get(type);
    if (cached) return cached;

    const profile = TREE_PROFILES[type];
    const W = 128;
    const H = 256;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;

    // Stamme
    const trunkColor = `#${profile.trunkColor.toString(16).padStart(6, '0')}`;
    const trunkWidth = Math.max(4, profile.trunkRadius * 2 * 22);
    ctx.fillStyle = trunkColor;
    ctx.fillRect(W / 2 - trunkWidth / 2, H * 0.55, trunkWidth, H * 0.45);

    // Løvverk
    const foliageColor = `#${profile.foliageColor.toString(16).padStart(6, '0')}`;
    ctx.fillStyle = foliageColor;
    if (type === 'pine') {
        // Trekantet furu-silhuett i tre lag
        ctx.beginPath();
        ctx.moveTo(W / 2, H * 0.02);
        ctx.lineTo(W * 0.15, H * 0.55);
        ctx.lineTo(W * 0.85, H * 0.55);
        ctx.closePath();
        ctx.fill();
    } else {
        // Rund løvkrone
        ctx.beginPath();
        ctx.arc(W / 2, H * 0.3, W * 0.42, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearMipMapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    billboardCache.set(type, tex);
    return tex;
}

interface LodDistances {
    treeFar: number;   // avstand hvor full geometri byttes til billboard
    treeCull: number;  // avstand hvor treet fjernes helt
    grassCull: number;
}

// Kun to LOD-nivåer: full geometri og billboard. Mid-nivået ble droppet fordi
// materialene er identiske - geometri-byttet ga da en synlig silhuett-pop uten
// egentlig perf-gevinst. På high-tier står treet i full detalj helt til det
// uansett er en liten prikk i det fjerne.
function lodDistancesFor(tier: QualityTier): LodDistances {
    if (tier === 'low') return { treeFar: 35, treeCull: 80, grassCull: 25 };
    if (tier === 'medium') return { treeFar: 75, treeCull: 140, grassCull: 45 };
    return { treeFar: 150, treeCull: 250, grassCull: 80 };
}

export class VegetationSystem {
    private scene: THREE.Scene;
    private tier: QualityTier;
    private groups: VegetationGroup[] = [];
    private trees: TreeEntry[] = [];
    private time = 0;
    private dist: LodDistances;
    private _tmpVec = new THREE.Vector3();

    constructor(scene: THREE.Scene, tier: QualityTier) {
        this.scene = scene;
        this.tier = tier;
        this.dist = lodDistancesFor(tier);
    }

    addPatch(area: AABB2D, density: number, type: VegetationType = 'grass'): void {
        const profile = TYPE_COLORS[type];
        const w = area.maxX - area.minX;
        const d = area.maxZ - area.minZ;
        const baseCount = Math.floor(w * d * density);
        const tierFactor = this.tier === 'low' ? 0.45 : this.tier === 'medium' ? 1 : 1.4;
        const count = Math.max(8, Math.floor(baseCount * tierFactor));

        const geo = new THREE.PlaneGeometry(profile.width, profile.height, 1, 2);
        geo.translate(0, profile.height / 2, 0);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uWindStrength: { value: type === 'reeds' ? 0.3 : 0.2 },
                uColorBase: { value: new THREE.Color(profile.base) },
                uColorTip: { value: new THREE.Color(profile.tip) },
            },
            vertexShader: grassVertex,
            fragmentShader: grassFragment,
            side: THREE.DoubleSide,
        });

        const mesh = new THREE.InstancedMesh(geo, material, count);
        mesh.frustumCulled = false;
        mesh.receiveShadow = true;

        const matrix = new THREE.Matrix4();
        const pos = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scale = new THREE.Vector3();
        for (let i = 0; i < count; i++) {
            pos.set(
                area.minX + Math.random() * w,
                0,
                area.minZ + Math.random() * d,
            );
            quat.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
            const s = 0.7 + Math.random() * 0.6;
            scale.set(s, s, s);
            matrix.compose(pos, quat, scale);
            mesh.setMatrixAt(i, matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
        this.scene.add(mesh);
        const center = new THREE.Vector3((area.minX + area.maxX) / 2, 0, (area.minZ + area.maxZ) / 2);
        const radius = 0.5 * Math.hypot(w, d);
        this.groups.push({ mesh, material, center, radius });
    }

    addTree(position: [number, number, number], type: TreeType = 'pine'): void {
        const profile = TREE_PROFILES[type];
        const [px, py, pz] = position;
        const foliageMat = getFoliageMaterial(type);
        const trunkMat = getTrunkMaterial(type);

        // ── Level 0: full detalj med vind ────────────────────────────────
        const near = new THREE.Group();
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(profile.trunkRadius * 0.7, profile.trunkRadius, profile.trunkHeight, 8),
            trunkMat,
        );
        trunk.position.set(0, profile.trunkHeight / 2, 0);
        trunk.castShadow = true;
        near.add(trunk);

        const foliageGeo = type === 'pine'
            ? new THREE.ConeGeometry(profile.foliageRadius, profile.foliageHeight, 10)
            : new THREE.SphereGeometry(profile.foliageRadius, 10, 8);
        const foliage = new THREE.Mesh(foliageGeo, foliageMat);
        foliage.position.set(0, profile.trunkHeight + profile.foliageHeight / 2, 0);
        foliage.castShadow = true;
        near.add(foliage);

        // ── Level 1: billboard-sprite (fjernt) ───────────────────────────
        const billboardTex = getTreeBillboard(type);
        const spriteMat = new THREE.SpriteMaterial({ map: billboardTex, transparent: true, depthWrite: false });
        const sprite = new THREE.Sprite(spriteMat);
        const totalHeight = profile.trunkHeight + profile.foliageHeight;
        const spriteWidth = Math.max(profile.foliageRadius * 2, profile.trunkRadius * 4);
        sprite.scale.set(spriteWidth, totalHeight, 1);
        sprite.position.set(0, totalHeight / 2, 0);

        // ── THREE.LOD orkestrator (to nivåer: geometri og billboard) ─────
        const lod = new THREE.LOD();
        lod.addLevel(near, 0);
        lod.addLevel(sprite, this.dist.treeFar);
        lod.position.set(px, py, pz);
        this.scene.add(lod);

        this.trees.push({ lod });
    }

    // Fase 5.3: update tar nå kamera for distance-culling av trær og gress-patcher.
    // `camera` er valgfri for bakoverkompatibilitet - uten den gjøres ingen culling.
    update(dt: number, camera?: THREE.Camera): void {
        this.time += dt;
        for (const g of this.groups) {
            g.material.uniforms.uTime.value = this.time;
        }
        // Alle tre-nær-foliage-materialer deler én uniforms-referanse, så én skriving er nok.
        windUniforms.uTime.value = this.time;
        if (!camera) return;

        // Oppdater LOD-nivå per tre og cull hvis for langt unna
        const camPos = camera.getWorldPosition(this._tmpVec);
        const cullSq = this.dist.treeCull * this.dist.treeCull;
        for (const t of this.trees) {
            const dx = t.lod.position.x - camPos.x;
            const dz = t.lod.position.z - camPos.z;
            const distSq = dx * dx + dz * dz;
            if (distSq > cullSq) {
                t.lod.visible = false;
            } else {
                t.lod.visible = true;
                t.lod.update(camera);
            }
        }

        // Cull gress-patcher utenfor radius
        const grassCullSq = this.dist.grassCull * this.dist.grassCull;
        for (const g of this.groups) {
            const dx = g.center.x - camPos.x;
            const dz = g.center.z - camPos.z;
            const distSq = dx * dx + dz * dz;
            // Kutt-distanse inkluderer patch-radius så store patcher ikke poppes rundt spilleren
            const threshold = grassCullSq + g.radius * g.radius;
            g.mesh.visible = distSq < threshold;
        }
    }

    dispose(): void {
        for (const g of this.groups) {
            this.scene.remove(g.mesh);
            g.mesh.geometry.dispose();
            g.material.dispose();
        }
        this.groups = [];

        // Materialer fra foliage/trunk-cache er delt mellom trær - dispose én gang via cache.
        const sharedMats = new WeakSet<THREE.Material>();
        for (const m of foliageMatCache.values()) sharedMats.add(m);
        for (const m of trunkMatCache.values()) sharedMats.add(m);

        for (const t of this.trees) {
            this.scene.remove(t.lod);
            t.lod.traverse((obj) => {
                const mesh = obj as THREE.Mesh | THREE.Sprite;
                const geom = (mesh as { geometry?: THREE.BufferGeometry }).geometry;
                if (geom) geom.dispose();
                const matRaw = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
                if (!matRaw) return;
                const list = Array.isArray(matRaw) ? matRaw : [matRaw];
                for (const m of list) {
                    if (!sharedMats.has(m)) m.dispose();
                }
            });
        }
        this.trees = [];

        // Rydd delte cacher - materialene og billboard-texturene disposes én gang.
        for (const m of foliageMatCache.values()) m.dispose();
        foliageMatCache.clear();
        for (const m of trunkMatCache.values()) m.dispose();
        trunkMatCache.clear();
        for (const tex of billboardCache.values()) tex.dispose();
        billboardCache.clear();
    }
}
