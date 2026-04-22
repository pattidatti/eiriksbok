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

// Variant for ikke-instansierte mesh-er (trær, busker)
const foliageVertex = `
    uniform float uTime;
    uniform float uWindStrength;
    varying vec2 vUv;
    varying vec3 vWorldPos;
    void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        // Topp-mask basert på lokal y (foliage er normalt sentrert med y=0 i midten)
        float topMask = max(0.0, position.y);
        float wave = sin(uTime * 1.8 + worldPos.x * 0.4) * 0.12
                   + sin(uTime * 2.6 + worldPos.z * 0.6) * 0.06;
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
}

interface TreeGroup {
    mesh: THREE.Mesh;
    material: THREE.ShaderMaterial;
}

const TYPE_COLORS: Record<VegetationType, { base: number; tip: number; height: number; width: number }> = {
    grass: { base: 0x3a5a28, tip: 0x7ba858, height: 0.45, width: 0.07 },
    reeds: { base: 0x3d4a28, tip: 0x9aa860, height: 0.95, width: 0.05 },
    flowers: { base: 0x3a5a28, tip: 0xd87aa0, height: 0.32, width: 0.09 },
};

const TREE_PROFILES: Record<TreeType, { trunkColor: number; foliageColor: number; trunkHeight: number; trunkRadius: number; foliageRadius: number; foliageHeight: number }> = {
    pine:  { trunkColor: 0x4a3018, foliageColor: 0x2e5a32, trunkHeight: 1.6, trunkRadius: 0.18, foliageRadius: 1.2, foliageHeight: 3.0 },
    oak:   { trunkColor: 0x5a3818, foliageColor: 0x4a7a32, trunkHeight: 2.0, trunkRadius: 0.22, foliageRadius: 1.6, foliageHeight: 2.0 },
    birch: { trunkColor: 0xc8c0a8, foliageColor: 0x86a858, trunkHeight: 2.2, trunkRadius: 0.14, foliageRadius: 1.2, foliageHeight: 1.8 },
};

export class VegetationSystem {
    private scene: THREE.Scene;
    private tier: QualityTier;
    private groups: VegetationGroup[] = [];
    private trees: TreeGroup[] = [];
    private time = 0;

    constructor(scene: THREE.Scene, tier: QualityTier) {
        this.scene = scene;
        this.tier = tier;
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
        this.groups.push({ mesh, material });
    }

    addTree(position: [number, number, number], type: TreeType = 'pine'): void {
        const profile = TREE_PROFILES[type];
        const trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(profile.trunkRadius * 0.7, profile.trunkRadius, profile.trunkHeight, 8),
            new THREE.MeshStandardMaterial({ color: profile.trunkColor, roughness: 0.95, metalness: 0 }),
        );
        trunk.position.set(position[0], position[1] + profile.trunkHeight / 2, position[2]);
        trunk.castShadow = true;
        this.scene.add(trunk);

        // Løvverk: vaiende kuleform via shader
        const foliageMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uWindStrength: { value: 0.18 },
                uColorBase: { value: new THREE.Color(profile.foliageColor).multiplyScalar(0.7) },
                uColorTip: { value: new THREE.Color(profile.foliageColor) },
            },
            vertexShader: foliageVertex,
            fragmentShader: grassFragment,
        });
        const foliageGeo = type === 'pine'
            ? new THREE.ConeGeometry(profile.foliageRadius, profile.foliageHeight, 10)
            : new THREE.SphereGeometry(profile.foliageRadius, 10, 8);
        const foliage = new THREE.Mesh(foliageGeo, foliageMaterial);
        foliage.position.set(position[0], position[1] + profile.trunkHeight + profile.foliageHeight / 2, position[2]);
        foliage.castShadow = true;
        this.scene.add(foliage);
        this.trees.push({ mesh: foliage, material: foliageMaterial });
    }

    update(dt: number): void {
        this.time += dt;
        for (const g of this.groups) {
            g.material.uniforms.uTime.value = this.time;
        }
        for (const t of this.trees) {
            t.material.uniforms.uTime.value = this.time;
        }
    }

    dispose(): void {
        for (const g of this.groups) {
            this.scene.remove(g.mesh);
            g.mesh.geometry.dispose();
            g.material.dispose();
        }
        this.groups = [];
        for (const t of this.trees) {
            this.scene.remove(t.mesh);
            t.mesh.geometry.dispose();
            t.material.dispose();
        }
        this.trees = [];
    }
}
