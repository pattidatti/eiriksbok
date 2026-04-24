import * as THREE from 'three';
import type { ModelPresetName, MaterialPresetName } from '../types';
import { createMaterial } from './materials';

// Model-presets: prosedyrale mesh-fabrikker for vanlige spill-objekter.
// Hver fabrikk returnerer en Group med én "primær" mesh som bærer fysikk (userData.solid
// settes av kalleren). Mindre detaljer (håndtak, metallbånd) er child-meshes som ikke
// har separate fysikk-collidere.
//
// Valget: prosedyral (ingen GLTF) holder MVP enkel, deterministisk, og gir
// Chromebook-vennlig polycount. Kan erstattes med GLTF-assets senere uten å endre API.

export interface ModelResult {
    group: THREE.Group;
    primary: THREE.Mesh;
    // Forslag til standard kolliderform. Kalleren kan overstyre.
    suggestedColliderShape?: 'cuboid' | 'cylinder' | 'sphere' | 'trimesh';
    // Omtrentlig bbox-halvstørrelse (for markør-plassering og fysikk-sjekk).
    halfExtents: [number, number, number];
    // Default material-preset for fargetemaer.
    defaultMaterial: MaterialPresetName;
}

type Factory = () => ModelResult;

function box(
    w: number, h: number, d: number,
    mat: MaterialPresetName,
    y = h / 2,
): ModelResult {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), createMaterial(mat));
    mesh.position.y = y;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return {
        group, primary: mesh,
        suggestedColliderShape: 'cuboid',
        halfExtents: [w / 2, h / 2, d / 2],
        defaultMaterial: mat,
    };
}

function cylinder(
    r: number, h: number,
    mat: MaterialPresetName,
    y = h / 2,
): ModelResult {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 16), createMaterial(mat));
    mesh.position.y = y;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return {
        group, primary: mesh,
        suggestedColliderShape: 'cylinder',
        halfExtents: [r, h / 2, r],
        defaultMaterial: mat,
    };
}

function sphere(r: number, mat: MaterialPresetName, y = r): ModelResult {
    const group = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), createMaterial(mat));
    mesh.position.y = y;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
    return {
        group, primary: mesh,
        suggestedColliderShape: 'sphere',
        halfExtents: [r, r, r],
        defaultMaterial: mat,
    };
}

const FACTORIES: Record<ModelPresetName, Factory> = {
    // ─── Grunnformer ─────────────────────────────────────────────────────────
    cube:     () => box(0.5, 0.5, 0.5, 'wood'),
    sphere:   () => sphere(0.3, 'stone'),
    cylinder: () => cylinder(0.3, 0.6, 'stone'),

    // ─── Møbler ──────────────────────────────────────────────────────────────
    bench: () => {
        const mat = createMaterial('wood');
        const group = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.4), mat);
        seat.position.y = 0.45;
        seat.castShadow = true;
        seat.receiveShadow = true;
        group.add(seat);
        for (const lx of [-0.7, 0.7]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.45, 0.35), mat);
            leg.position.set(lx, 0.22, 0);
            leg.castShadow = true;
            group.add(leg);
        }
        return {
            group, primary: seat,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.8, 0.25, 0.2],
            defaultMaterial: 'wood',
        };
    },
    chair: () => {
        const mat = createMaterial('wood');
        const group = new THREE.Group();
        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), mat);
        seat.position.y = 0.5;
        seat.castShadow = true;
        seat.receiveShadow = true;
        group.add(seat);
        const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.05), mat);
        back.position.set(0, 0.9, -0.22);
        back.castShadow = true;
        group.add(back);
        for (const [lx, lz] of [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.5, 0.06), mat);
            leg.position.set(lx, 0.25, lz);
            leg.castShadow = true;
            group.add(leg);
        }
        return {
            group, primary: seat,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.25, 0.5, 0.25],
            defaultMaterial: 'wood',
        };
    },
    table: () => {
        const mat = createMaterial('wood');
        const group = new THREE.Group();
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 0.9), mat);
        top.position.y = 0.82;
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        for (const [lx, lz] of [[-0.6, -0.35], [0.6, -0.35], [-0.6, 0.35], [0.6, 0.35]]) {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), mat);
            leg.position.set(lx, 0.4, lz);
            leg.castShadow = true;
            group.add(leg);
        }
        return {
            group, primary: top,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.7, 0.42, 0.45],
            defaultMaterial: 'wood',
        };
    },
    chest: () => {
        const mat = createMaterial('wood');
        const bandMat = createMaterial('iron');
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.55), mat);
        body.position.y = 0.275;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        for (const by of [0.08, 0.45]) {
            const band = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.05, 0.57), bandMat);
            band.position.y = by;
            group.add(band);
        }
        return {
            group, primary: body,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.45, 0.275, 0.275],
            defaultMaterial: 'wood',
        };
    },
    lectern: () => {
        const mat = createMaterial('wood');
        const group = new THREE.Group();
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.2, 8), mat);
        pillar.position.y = 0.6;
        pillar.castShadow = true;
        group.add(pillar);
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.05, 0.4), mat);
        top.position.y = 1.23;
        top.rotation.x = -0.25;
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        return {
            group, primary: pillar,
            suggestedColliderShape: 'cylinder',
            halfExtents: [0.18, 0.6, 0.18],
            defaultMaterial: 'wood',
        };
    },
    barrel: () => {
        const mat = createMaterial('wood');
        const bandMat = createMaterial('iron');
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.38, 1.0, 16), mat);
        body.position.y = 0.5;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        for (const by of [0.2, 0.8]) {
            const band = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.035, 8, 24), bandMat);
            band.rotation.x = Math.PI / 2;
            band.position.y = by;
            group.add(band);
        }
        return {
            group, primary: body,
            suggestedColliderShape: 'cylinder',
            halfExtents: [0.42, 0.5, 0.42],
            defaultMaterial: 'wood',
        };
    },
    crate: () => box(0.7, 0.7, 0.7, 'wood', 0.35),

    // ─── Belysning ───────────────────────────────────────────────────────────
    candle: () => {
        const group = new THREE.Group();
        const wax = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.05, 0.2, 8),
            createMaterial('parchment')
        );
        wax.position.y = 0.1;
        wax.castShadow = true;
        group.add(wax);
        const flame = new THREE.Mesh(
            new THREE.SphereGeometry(0.035, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xffcc33 })
        );
        flame.position.y = 0.23;
        group.add(flame);
        return {
            group, primary: wax,
            suggestedColliderShape: 'cylinder',
            halfExtents: [0.05, 0.1, 0.05],
            defaultMaterial: 'parchment',
        };
    },
    torch: () => {
        const group = new THREE.Group();
        const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.035, 0.6, 8),
            createMaterial('wood')
        );
        handle.position.y = 0.3;
        handle.castShadow = true;
        group.add(handle);
        const head = new THREE.Mesh(
            new THREE.ConeGeometry(0.1, 0.2, 8),
            new THREE.MeshBasicMaterial({ color: 0xff7722 })
        );
        head.position.y = 0.7;
        group.add(head);
        return {
            group, primary: handle,
            suggestedColliderShape: 'cylinder',
            halfExtents: [0.035, 0.3, 0.035],
            defaultMaterial: 'wood',
        };
    },
    lantern: () => {
        const group = new THREE.Group();
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.26, 0.18),
            createMaterial('iron')
        );
        frame.position.y = 0.13;
        frame.castShadow = true;
        group.add(frame);
        const glass = new THREE.Mesh(
            new THREE.BoxGeometry(0.14, 0.2, 0.14),
            new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.55 })
        );
        glass.position.y = 0.13;
        group.add(glass);
        return {
            group, primary: frame,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.09, 0.13, 0.09],
            defaultMaterial: 'iron',
        };
    },

    // ─── Bøker / gjenstander ─────────────────────────────────────────────────
    book: () => box(0.18, 0.04, 0.12, 'fabric', 0.02),
    scroll: () => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.03, 0.03, 0.22, 8),
            createMaterial('parchment')
        );
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.03;
        body.castShadow = true;
        group.add(body);
        return {
            group, primary: body,
            suggestedColliderShape: 'cylinder',
            halfExtents: [0.11, 0.03, 0.03],
            defaultMaterial: 'parchment',
        };
    },
    cup: () => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.04, 0.12, 12),
            createMaterial('iron')
        );
        body.position.y = 0.06;
        body.castShadow = true;
        group.add(body);
        return {
            group, primary: body,
            suggestedColliderShape: 'cylinder',
            halfExtents: [0.06, 0.06, 0.06],
            defaultMaterial: 'iron',
        };
    },
    amphora: () => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.16, 0.08, 0.5, 12),
            createMaterial('brick')
        );
        body.position.y = 0.25;
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        const neck = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.09, 0.1, 10),
            createMaterial('brick')
        );
        neck.position.y = 0.55;
        group.add(neck);
        return {
            group, primary: body,
            suggestedColliderShape: 'cylinder',
            halfExtents: [0.16, 0.3, 0.16],
            defaultMaterial: 'brick',
        };
    },
    sack: () => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.SphereGeometry(0.22, 12, 12),
            createMaterial('fabric')
        );
        body.position.y = 0.22;
        body.scale.y = 1.4;
        body.castShadow = true;
        group.add(body);
        return {
            group, primary: body,
            suggestedColliderShape: 'sphere',
            halfExtents: [0.22, 0.3, 0.22],
            defaultMaterial: 'fabric',
        };
    },
    rope: () => {
        const group = new THREE.Group();
        const body = new THREE.Mesh(
            new THREE.TorusGeometry(0.18, 0.03, 6, 20),
            createMaterial('fabric')
        );
        body.rotation.x = Math.PI / 2;
        body.position.y = 0.03;
        body.castShadow = true;
        group.add(body);
        return {
            group, primary: body,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.2, 0.06, 0.2],
            defaultMaterial: 'fabric',
        };
    },

    // ─── Verktøy ─────────────────────────────────────────────────────────────
    hammer: () => {
        const group = new THREE.Group();
        const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 0.32, 8),
            createMaterial('wood')
        );
        handle.position.y = 0.16;
        handle.castShadow = true;
        group.add(handle);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.05), createMaterial('iron'));
        head.position.y = 0.33;
        head.castShadow = true;
        group.add(head);
        return {
            group, primary: handle,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.07, 0.17, 0.05],
            defaultMaterial: 'wood',
        };
    },
    anvil: () => {
        const group = new THREE.Group();
        const top = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.3), createMaterial('iron'));
        top.position.y = 0.6;
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        const waist = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.25), createMaterial('iron'));
        waist.position.y = 0.35;
        group.add(waist);
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 0.4), createMaterial('iron'));
        base.position.y = 0.1;
        base.castShadow = true;
        group.add(base);
        return {
            group, primary: top,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.4, 0.35, 0.2],
            defaultMaterial: 'iron',
        };
    },
    quill: () => {
        const group = new THREE.Group();
        const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.008, 0.015, 0.24, 6),
            createMaterial('parchment')
        );
        shaft.position.y = 0.12;
        shaft.rotation.x = 0.3;
        shaft.castShadow = true;
        group.add(shaft);
        return {
            group, primary: shaft,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.03, 0.12, 0.03],
            defaultMaterial: 'parchment',
        };
    },

    // ─── Arkitektur ──────────────────────────────────────────────────────────
    door: () => {
        const group = new THREE.Group();
        const slab = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.12), createMaterial('wood'));
        slab.position.y = 1.0;
        slab.castShadow = true;
        slab.receiveShadow = true;
        group.add(slab);
        const handle = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), createMaterial('iron'));
        handle.position.set(0.45, 1.0, 0.08);
        group.add(handle);
        return {
            group, primary: slab,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.6, 1.0, 0.06],
            defaultMaterial: 'wood',
        };
    },
    'window-bars': () => {
        const group = new THREE.Group();
        const mat = createMaterial('iron');
        for (let i = 0; i < 4; i++) {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2, 6), mat);
            bar.position.set(-0.45 + i * 0.3, 0.6, 0);
            bar.castShadow = true;
            group.add(bar);
        }
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.06), mat);
        top.position.y = 1.2;
        group.add(top);
        const bot = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 0.06), mat);
        bot.position.y = 0;
        group.add(bot);
        return {
            group, primary: top,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.65, 0.6, 0.05],
            defaultMaterial: 'iron',
        };
    },
    pillar: () => cylinder(0.25, 3.0, 'stone'),
    altar: () => {
        const group = new THREE.Group();
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.3, 1.0), createMaterial('marble'));
        base.position.y = 0.15;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 1.2), createMaterial('marble'));
        top.position.y = 0.35;
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        return {
            group, primary: base,
            suggestedColliderShape: 'cuboid',
            halfExtents: [0.8, 0.2, 0.6],
            defaultMaterial: 'marble',
        };
    },
};

export function createModel(preset: ModelPresetName): ModelResult {
    const factory = FACTORIES[preset];
    if (!factory) {
        throw new Error(`[declarative] Ukjent model-preset: '${preset}'. Gyldige: ${Object.keys(FACTORIES).join(', ')}`);
    }
    return factory();
}

export function isValidModelPreset(name: string): name is ModelPresetName {
    return name in FACTORIES;
}
