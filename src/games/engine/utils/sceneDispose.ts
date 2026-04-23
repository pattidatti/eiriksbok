import * as THREE from 'three';

// Fase 5.4: traverser scenegrafen og dispose alle geometrier, materialer og
// bundne texture-uniforms. Brukes fra GameEngine.dispose() for å fange ressurser
// som spill-spesifikk setupScene() har lagt til direkte i scenen uten egen dispose.

const TEXTURE_KEYS = [
    'map',
    'normalMap',
    'roughnessMap',
    'metalnessMap',
    'aoMap',
    'emissiveMap',
    'alphaMap',
    'bumpMap',
    'displacementMap',
    'lightMap',
    'envMap',
    'gradientMap',
    'specularMap',
    'matcap',
] as const;

function disposeMaterial(mat: THREE.Material, seen: WeakSet<object>): void {
    if (seen.has(mat)) return;
    seen.add(mat);
    for (const key of TEXTURE_KEYS) {
        const tex = (mat as unknown as Record<string, unknown>)[key];
        if (tex && typeof (tex as { dispose?: () => void }).dispose === 'function' && !seen.has(tex as object)) {
            seen.add(tex as object);
            (tex as THREE.Texture).dispose();
        }
    }
    // ShaderMaterial-uniforms kan inneholde texturer vi også bør rydde opp.
    const uniforms = (mat as unknown as { uniforms?: Record<string, { value: unknown }> }).uniforms;
    if (uniforms) {
        for (const name in uniforms) {
            const val = uniforms[name]?.value;
            if (val && val instanceof THREE.Texture && !seen.has(val)) {
                seen.add(val);
                val.dispose();
            }
        }
    }
    mat.dispose();
}

export function disposeSceneDeep(root: THREE.Object3D, seen: WeakSet<object> = new WeakSet()): void {
    root.traverse((obj) => {
        const mesh = obj as THREE.Mesh | THREE.InstancedMesh | THREE.Sprite | THREE.Points | THREE.Line;
        const geom = (mesh as { geometry?: THREE.BufferGeometry }).geometry;
        if (geom && !seen.has(geom)) {
            seen.add(geom);
            geom.dispose();
        }
        const matRaw = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
        if (!matRaw) return;
        if (Array.isArray(matRaw)) {
            for (const m of matRaw) if (m) disposeMaterial(m, seen);
        } else {
            disposeMaterial(matRaw, seen);
        }
    });
}
