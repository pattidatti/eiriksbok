import * as THREE from 'three';
import { woodKit, stoneKit, fabricKit } from '../TextureKit';

type ToonMatFn = (color: number, opts?: Record<string, unknown>) => THREE.MeshStandardMaterial;

function invisibleCollider(w: number, h: number, d: number): THREE.Mesh {
    const m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    m.userData.solid = true;
    return m;
}

// ── Barrel ───────────────────────────────────────────────────────────────────

export function barrel(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const { tex, normalMap } = woodKit();

    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.45, 1.2, 14),
        toonMat(0x6b4423, { map: tex, normalMap }),
    );
    body.castShadow = true;
    body.userData.solid = true;
    body.userData.colliderShape = 'cylinder';
    g.add(body);

    const top = new THREE.Mesh(
        new THREE.CylinderGeometry(0.48, 0.48, 0.06, 14),
        toonMat(0x5a3818, { map: tex, normalMap }),
    );
    top.position.y = 0.63;
    g.add(top);

    const bandMat = toonMat(0x2a2a2a);
    for (const by of [-0.3, 0.05, 0.38]) {
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 8, 24), bandMat);
        band.rotation.x = Math.PI / 2;
        band.position.y = by;
        g.add(band);
    }
    return g;
}

// ── Crate ────────────────────────────────────────────────────────────────────

export function crate(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const { tex, normalMap } = woodKit();

    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.9, 0.9),
        toonMat(0x7a5a2e, { map: tex, normalMap }),
    );
    box.castShadow = true;
    box.userData.solid = true;
    g.add(box);

    // Plankekanter langs topp-flatens kanter
    const plankMat = toonMat(0x4a3318);
    const edgeDefs: [number, number, number, number, number, number][] = [
        [0.9, 0.05, 0.05, 0, 0.475, -0.425],
        [0.9, 0.05, 0.05, 0, 0.475,  0.425],
        [0.05, 0.05, 0.9, -0.425, 0.475, 0],
        [0.05, 0.05, 0.9,  0.425, 0.475, 0],
    ];
    for (const [w, h, d, x, y, z] of edgeDefs) {
        const p = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), plankMat);
        p.position.set(x, y, z);
        g.add(p);
    }
    return g;
}

// ── Sack ─────────────────────────────────────────────────────────────────────

export function sack(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const { tex, normalMap } = fabricKit();

    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.32, 0.65, 9),
        toonMat(0xb8996a, { map: tex, normalMap }),
    );
    body.castShadow = true;
    g.add(body);

    const top = new THREE.Mesh(
        new THREE.SphereGeometry(0.27, 9, 6),
        toonMat(0xb8996a, { map: tex, normalMap }),
    );
    top.scale.y = 0.65;
    top.position.y = 0.38;
    g.add(top);

    // Strikksnor
    const tie = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.025, 6, 12),
        toonMat(0x6b4423),
    );
    tie.rotation.x = Math.PI / 2;
    tie.position.y = 0.3;
    g.add(tie);

    const col = invisibleCollider(0.56, 0.9, 0.56);
    col.position.y = 0.15;
    g.add(col);
    return g;
}

// ── Chest ────────────────────────────────────────────────────────────────────

export function chest(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const { tex, normalMap } = woodKit();

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.52, 0.65),
        toonMat(0x6b4218, { map: tex, normalMap }),
    );
    base.position.y = 0.26;
    base.castShadow = true;
    g.add(base);

    const lid = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.22, 0.65),
        toonMat(0x7a5228, { map: tex, normalMap }),
    );
    lid.position.y = 0.63;
    lid.castShadow = true;
    g.add(lid);

    // Jernbeslag: hjørner
    const beslagMat = toonMat(0x2a2a2a);
    const cornerPositions: [number, number, number][] = [
        [-0.46, 0.26, -0.28], [0.46, 0.26, -0.28],
        [-0.46, 0.26,  0.28], [0.46, 0.26,  0.28],
    ];
    for (const [x, y, z] of cornerPositions) {
        const beslag = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.52, 0.12), beslagMat);
        beslag.position.set(x, y, z);
        g.add(beslag);
    }

    // Lås
    const lock = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.08), beslagMat);
    lock.position.set(0, 0.52, -0.34);
    g.add(lock);

    const col = invisibleCollider(1.02, 0.76, 0.67);
    col.position.y = 0.38;
    g.add(col);
    return g;
}

// ── Cauldron ─────────────────────────────────────────────────────────────────

export function cauldron(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const ironMat = toonMat(0x2e2e2e);

    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.46, 0.28, 0.56, 16),
        ironMat,
    );
    body.castShadow = true;
    body.userData.solid = true;
    body.userData.colliderShape = 'cylinder';
    g.add(body);

    // Kant/rim
    const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.47, 0.04, 8, 24),
        toonMat(0x222222),
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.28;
    g.add(rim);

    // Indre mørkt hull
    const inner = new THREE.Mesh(
        new THREE.CircleGeometry(0.42, 16),
        new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 1, side: THREE.DoubleSide }),
    );
    inner.rotation.x = -Math.PI / 2;
    inner.position.y = 0.3;
    g.add(inner);

    // Ben
    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 7), ironMat);
        leg.position.set(Math.cos(a) * 0.22, -0.27, Math.sin(a) * 0.22);
        leg.rotation.z = -Math.sign(Math.cos(a)) * 0.18;
        leg.rotation.x = -Math.sign(Math.sin(a)) * 0.18;
        g.add(leg);
    }
    return g;
}

// ── Scroll ───────────────────────────────────────────────────────────────────

export function scroll(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const parchmentMat = toonMat(0xf4e4c1);
    const stickMat = toonMat(0x5a3818);

    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.72, 9), parchmentMat);
    roll.rotation.z = Math.PI / 2;
    roll.castShadow = true;
    roll.userData.solid = true;
    g.add(roll);

    for (const x of [-0.4, 0.4]) {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.055, 9), stickMat);
        cap.rotation.z = Math.PI / 2;
        cap.position.x = x;
        g.add(cap);
    }
    return g;
}

// ── Anvil ────────────────────────────────────────────────────────────────────

export function anvil(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const ironMat = toonMat(0x383838, { roughness: 0.3, metalness: 0.8 });

    // Base (bredt underlag)
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.28, 0.46), toonMat(0x2e2e2e));
    base.position.y = 0.14;
    base.castShadow = true;
    g.add(base);

    // Kropp
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.32, 0.38), ironMat);
    body.position.y = 0.44;
    g.add(body);

    // Flatt arbeidsflate-lag
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.1, 0.38), ironMat);
    top.position.y = 0.65;
    g.add(top);

    // Horn
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.16, 0.42, 8), ironMat);
    horn.rotation.z = Math.PI / 2;
    horn.position.set(0.44, 0.63, 0);
    g.add(horn);

    const col = invisibleCollider(0.72, 0.72, 0.48);
    col.position.y = 0.36;
    g.add(col);
    return g;
}

// ── Well ─────────────────────────────────────────────────────────────────────

export function well(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const { tex: stoneTex, normalMap: stoneNorm } = stoneKit();

    // Mur-ring
    const ring = new THREE.Mesh(
        new THREE.CylinderGeometry(0.68, 0.72, 0.9, 18),
        toonMat(0x9a7d64, { map: stoneTex, normalMap: stoneNorm }),
    );
    ring.position.y = 0.45;
    ring.castShadow = true;
    ring.userData.solid = true;
    ring.userData.colliderShape = 'cylinder';
    g.add(ring);

    // Mørkt innvendig hull
    const hole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.92, 16),
        new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1, side: THREE.DoubleSide }),
    );
    hole.position.y = 0.45;
    g.add(hole);

    // Stolper
    const postMat = toonMat(0x4a3318);
    for (const x of [-0.5, 0.5]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.5, 8), postMat);
        post.position.set(x, 1.65, 0);
        post.castShadow = true;
        g.add(post);
    }

    // Tverrstang
    const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.06, 8), postMat);
    bar.rotation.z = Math.PI / 2;
    bar.position.y = 2.42;
    g.add(bar);

    // Håndtak/sveiv
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.26, 7), toonMat(0x2a2a2a));
    handle.position.set(0.64, 2.3, 0);
    g.add(handle);

    // Tak
    const roofGeo = new THREE.ConeGeometry(0.85, 0.6, 4);
    const roof = new THREE.Mesh(roofGeo, toonMat(0x3a2814));
    roof.position.y = 2.72;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    g.add(roof);

    return g;
}
