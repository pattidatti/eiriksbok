import * as THREE from 'three';
import { woodKit, stoneKit, fabricKit } from '../TextureKit';

type ToonMatFn = (color: number, opts?: Record<string, unknown>) => THREE.MeshStandardMaterial;

function invisibleCollider(w: number, h: number, d: number, y = 0): THREE.Mesh {
    const m = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    m.position.y = y;
    m.userData.solid = true;
    return m;
}

// ── Bed ──────────────────────────────────────────────────────────────────────

export function bed(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const { tex: woodTex, normalMap: woodNorm } = woodKit();
    const { tex: fabTex, normalMap: fabNorm } = fabricKit();

    // Treramme
    const frame = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.24, 2.1),
        toonMat(0x6b4218, { map: woodTex, normalMap: woodNorm }),
    );
    frame.position.y = 0.12;
    frame.castShadow = true;
    g.add(frame);

    // Hodegavl
    const headboard = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.55, 0.1),
        toonMat(0x5a3510, { map: woodTex, normalMap: woodNorm }),
    );
    headboard.position.set(0, 0.52, -0.95);
    headboard.castShadow = true;
    g.add(headboard);

    // Madrass
    const mattress = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.18, 1.88),
        toonMat(0xc8a878, { map: fabTex, normalMap: fabNorm }),
    );
    mattress.position.y = 0.33;
    mattress.castShadow = true;
    g.add(mattress);

    // Pute
    const pillow = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.1, 0.36),
        toonMat(0xe8d8b0, { map: fabTex, normalMap: fabNorm }),
    );
    pillow.position.set(0, 0.47, -0.72);
    g.add(pillow);

    g.add(invisibleCollider(1.02, 0.52, 2.12, 0.26));
    return g;
}

// ── Table ────────────────────────────────────────────────────────────────────

export function table(toonMat: ToonMatFn, w = 1.6, d = 0.8): THREE.Group {
    const g = new THREE.Group();
    const { tex, normalMap } = woodKit();
    const legMat = toonMat(0x4a2e10);

    const top = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.08, d),
        toonMat(0x7a5228, { map: tex, normalMap }),
    );
    top.position.y = 0.76;
    top.castShadow = true;
    top.receiveShadow = true;
    g.add(top);

    const lx = w / 2 - 0.08;
    const lz = d / 2 - 0.08;
    for (const [px, pz] of [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.72, 8), legMat);
        leg.position.set(px, 0.36, pz);
        leg.castShadow = true;
        g.add(leg);
    }

    g.add(invisibleCollider(w, 0.8, d, 0.4));
    return g;
}

// ── Chair ────────────────────────────────────────────────────────────────────

export function chair(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const { tex, normalMap } = woodKit();
    const darkWood = toonMat(0x4a2e10);

    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.07, 0.44),
        toonMat(0x7a5228, { map: tex, normalMap }),
    );
    seat.position.y = 0.46;
    seat.castShadow = true;
    g.add(seat);

    const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.44, 0.5, 0.07),
        toonMat(0x6b4218, { map: tex, normalMap }),
    );
    back.position.set(0, 0.71, -0.19);
    back.castShadow = true;
    g.add(back);

    // Horisontale sprosser i ryggen
    for (const ry of [0.55, 0.71]) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.045, 0.045), darkWood);
        spoke.position.set(0, ry, -0.19);
        g.add(spoke);
    }

    for (const [px, pz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.44, 7), darkWood);
        leg.position.set(px, 0.22, pz);
        g.add(leg);
    }

    g.add(invisibleCollider(0.46, 0.96, 0.46, 0.48));
    return g;
}

// ── Pew ──────────────────────────────────────────────────────────────────────

export function pew(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const { tex, normalMap } = woodKit();
    const darkWood = toonMat(0x4a2e10);

    const seat = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.08, 0.46),
        toonMat(0x7a5228, { map: tex, normalMap }),
    );
    seat.position.y = 0.48;
    seat.castShadow = true;
    seat.receiveShadow = true;
    g.add(seat);

    const backrest = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.46, 0.07),
        toonMat(0x6b4218, { map: tex, normalMap }),
    );
    backrest.position.set(0, 0.72, -0.21);
    backrest.castShadow = true;
    g.add(backrest);

    // Sprosser i ryggen
    for (let i = -3; i <= 3; i++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.38, 0.05), darkWood);
        spoke.position.set(i * 0.3, 0.72, -0.21);
        g.add(spoke);
    }

    // Sidepaneler
    for (const x of [-1.06, 1.06]) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.46, 0.46), darkWood);
        panel.position.set(x, 0.23, 0);
        panel.castShadow = true;
        g.add(panel);
    }

    g.add(invisibleCollider(2.22, 0.52, 0.48, 0.26));
    return g;
}

// ── Altar ────────────────────────────────────────────────────────────────────

export function altar(toonMat: ToonMatFn): THREE.Group {
    const g = new THREE.Group();
    const { tex: stoneTex, normalMap: stoneNorm } = stoneKit();
    const { tex: woodTex, normalMap: woodNorm } = woodKit();

    // Hoveddel (stein)
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.2, 1.0),
        toonMat(0x8a7058, { map: stoneTex, normalMap: stoneNorm }),
    );
    body.position.y = 0.6;
    body.castShadow = true;
    body.receiveShadow = true;
    g.add(body);

    // Steintopp (litt større, krager ut)
    const slab = new THREE.Mesh(
        new THREE.BoxGeometry(2.65, 0.1, 1.1),
        toonMat(0x9a8068, { map: stoneTex, normalMap: stoneNorm }),
    );
    slab.position.y = 1.25;
    slab.castShadow = true;
    g.add(slab);

    // Frontpanel (lett relieff - stikker 4cm frem)
    const panel = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.82, 0.05),
        toonMat(0x7a6048, { map: stoneTex, normalMap: stoneNorm }),
    );
    panel.position.set(0, 0.6, -0.525);
    g.add(panel);

    // Kors på fronten
    const crossMat = toonMat(0x3a2614, { map: woodTex, normalMap: woodNorm });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 0.06), crossMat);
    crossV.position.set(0, 0.6, -0.56);
    g.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.1, 0.06), crossMat);
    crossH.position.set(0, 0.68, -0.56);
    g.add(crossH);

    // Sokkel-bord
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(2.55, 0.12, 1.05),
        toonMat(0x6a5040, { map: stoneTex, normalMap: stoneNorm }),
    );
    base.position.y = 0.06;
    g.add(base);

    g.add(invisibleCollider(2.55, 1.32, 1.05, 0.66));
    return g;
}
