import * as THREE from 'three';

function makeWoodTex(): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const x = c.getContext('2d')!;
    x.fillStyle = '#6b4423'; x.fillRect(0, 0, 512, 512);
    x.strokeStyle = '#2a1810'; x.lineWidth = 2;
    for (let y = 0; y < 512; y += 51) {
        x.beginPath(); x.moveTo(0, y); x.lineTo(512, y); x.stroke();
    }
    for (let i = 0; i < 120; i++) {
        x.strokeStyle = `rgba(0,0,0,${Math.random() * 0.06})`;
        x.beginPath();
        const y = Math.random() * 512;
        x.moveTo(0, y);
        x.bezierCurveTo(150, y + Math.random() * 4 - 2, 350, y + Math.random() * 4 - 2, 512, y);
        x.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
}

function makeStoneTex(): THREE.Texture {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const x = c.getContext('2d')!;
    x.fillStyle = '#9a7d64'; x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 300; i++) {
        x.fillStyle = `rgba(${80 + Math.random() * 40},${60 + Math.random() * 30},${40 + Math.random() * 30},${Math.random() * 0.15})`;
        x.fillRect(Math.random() * 512, Math.random() * 512, 2 + Math.random() * 8, 2 + Math.random() * 8);
    }
    x.strokeStyle = 'rgba(60,40,25,0.3)'; x.lineWidth = 1;
    for (let y = 0; y < 512; y += 85) {
        x.beginPath();
        x.moveTo(0, y + Math.random() * 4);
        x.lineTo(512, y + Math.random() * 4);
        x.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
}

type ToonMatFn = (color: number, opts?: Record<string, unknown>) => THREE.MeshStandardMaterial;

function makeWorkbench(
    x: number, z: number, ry: number,
    parent: THREE.Group,
    toonMat: ToonMatFn
): void {
    const g = new THREE.Group();
    // Solid blokk som dekker hele arbeidsbenken (PhysicsWorld-collider). Usynlig så den
    // ikke tegnes over de eksisterende beine/hyllene.
    const collider = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.1, 1.2),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    collider.position.y = 0.55;
    collider.userData.solid = true;
    g.add(collider);
    const top = new THREE.Mesh(new THREE.BoxGeometry(3, 0.15, 1.2), toonMat(0x8b5a2b));
    top.position.y = 1; top.castShadow = true; top.receiveShadow = true; g.add(top);
    for (const [lx, lz] of [[-1.3, -0.5], [1.3, -0.5], [-1.3, 0.5], [1.3, 0.5]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1, 0.15), toonMat(0x5a3a1a));
        leg.position.set(lx, 0.5, lz); leg.castShadow = true; g.add(leg);
    }
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.8), toonMat(0x5a3a1a));
    shelf.position.y = 0.35; g.add(shelf);
    g.position.set(x, 0, z); g.rotation.y = ry;
    parent.add(g);
}

function makeShelf(
    x: number, y: number, z: number, ry: number,
    parent: THREE.Group,
    toonMat: ToonMatFn
): void {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 0.5), toonMat(0x6b4423)));
    for (let i = 0; i < 5; i++) {
        const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.35 + Math.random() * 0.2, 0.3),
            toonMat(((0x443322 + (Math.random() * 0x444444)) | 0))
        );
        book.position.set(-1 + i * 0.4, 0.22, 0);
        g.add(book);
    }
    g.position.set(x, y, z); g.rotation.y = ry;
    parent.add(g);
}

function makeWindow(
    x: number, z: number, ry: number,
    parent: THREE.Group,
    toonMat: ToonMatFn,
    beamMat: THREE.MeshStandardMaterial
): void {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.5, 3, 0.4), toonMat(0x4a2e1a));
    frame.position.set(x, 3.5, z); frame.rotation.y = ry;
    parent.add(frame);

    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2.5),
        new THREE.MeshBasicMaterial({ color: 0xffedbf, transparent: true, opacity: 0.6 })
    );
    glass.position.copy(frame.position);
    const off = ry === 0 ? [0, 0, 0.21] : [0.21 * Math.sign(-x), 0, 0];
    glass.position.x += off[0]; glass.position.z += off[2];
    glass.rotation.y = ry;
    parent.add(glass);

    for (const geo of [
        new THREE.BoxGeometry(0.1, 2.5, 0.5),
        new THREE.BoxGeometry(2, 0.1, 0.5)
    ]) {
        const bar = new THREE.Mesh(geo, beamMat);
        bar.position.copy(frame.position); bar.rotation.y = ry;
        parent.add(bar);
    }
}

export function buildWorkshopRoom(
    scene: THREE.Scene,
    toonMat: ToonMatFn,
    roomSize = 20,
    wallHeight = 6
): void {
    const woodTex = makeWoodTex();
    const stoneTex = makeStoneTex();

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    woodTex.repeat.set(4, 4);
    const floorMat = toonMat(0x7a5030, { map: woodTex });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), floorMat);
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true;
    roomGroup.add(floor);

    // Usynlig tykk gulvboks gir PhysicsWorld noe solid å stå på.
    const floorCollider = new THREE.Mesh(
        new THREE.BoxGeometry(roomSize, 0.4, roomSize),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    floorCollider.position.y = -0.2;
    floorCollider.userData.solid = true;
    roomGroup.add(floorCollider);

    stoneTex.repeat.set(3, 1);
    const wallMat = toonMat(0xa88a6e, { map: stoneTex });

    const makeWall = (w: number, h: number, d: number, x: number, y: number, z: number, ry = 0) => {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
        m.position.set(x, y, z); m.rotation.y = ry;
        m.castShadow = true; m.receiveShadow = true;
        m.userData.solid = true;
        roomGroup.add(m);
    };
    const hw = roomSize / 2;
    makeWall(roomSize, wallHeight, 0.3, 0, wallHeight / 2, -hw);
    makeWall(roomSize, wallHeight, 0.3, 0, wallHeight / 2, hw);
    makeWall(0.3, wallHeight, roomSize, -hw, wallHeight / 2, 0);
    makeWall(0.3, wallHeight, roomSize, hw, wallHeight / 2, 0);

    const baseMat = toonMat(0x3a2010);
    for (const [w, d, bx, bz] of [
        [roomSize, 0.35, 0, -hw + 0.18],
        [roomSize, 0.35, 0, hw - 0.18],
        [0.35, roomSize, -hw + 0.18, 0],
        [0.35, roomSize, hw - 0.18, 0],
    ] as [number, number, number, number][]) {
        const b = new THREE.Mesh(new THREE.BoxGeometry(w, 0.25, d), baseMat);
        b.position.set(bx, 0.125, bz);
        roomGroup.add(b);
    }

    const beamMat = toonMat(0x3a2515);
    for (let i = -8; i <= 8; i += 4) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(roomSize, 0.4, 0.4), beamMat);
        beam.position.set(0, wallHeight - 0.3, i); beam.castShadow = true;
        roomGroup.add(beam);
    }
    for (let i = -6; i <= 6; i += 6) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, roomSize), beamMat);
        beam.position.set(i, wallHeight - 0.5, 0); beam.castShadow = true;
        roomGroup.add(beam);
    }

    makeWindow(0, -hw + 0.3, 0, roomGroup, toonMat, beamMat);
    makeWindow(-hw + 0.3, -3, Math.PI / 2, roomGroup, toonMat, beamMat);
    makeWindow(-hw + 0.3, 3, Math.PI / 2, roomGroup, toonMat, beamMat);

    makeWorkbench(0, 2, 0, roomGroup, toonMat);
    makeWorkbench(6, -4, Math.PI / 2, roomGroup, toonMat);
    makeWorkbench(-5, -6, 0, roomGroup, toonMat);

    // Oil lamp on main bench
    const lampGroup = new THREE.Group();
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 0.08, 12), toonMat(0xb87333));
    lampBase.position.y = 1.12; lampGroup.add(lampBase);
    const lampGlass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.08, 0.2, 12),
        new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.6 })
    );
    lampGlass.position.y = 1.25; lampGroup.add(lampGlass);
    const lampFlame = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xffcc33 })
    );
    lampFlame.position.y = 1.25; lampGroup.add(lampFlame);
    lampGroup.position.set(0, 0, 2);
    roomGroup.add(lampGroup);

    makeShelf(-hw + 0.1, 4, -5, Math.PI / 2, roomGroup, toonMat);
    makeShelf(-hw + 0.1, 2.5, -5, Math.PI / 2, roomGroup, toonMat);
    makeShelf(-hw + 0.1, 4, 3, Math.PI / 2, roomGroup, toonMat);
    makeShelf(hw - 0.1, 3.5, -2, -Math.PI / 2, roomGroup, toonMat);

    const barrelPositions: [number, number][] = [[8, 7], [8, 5.5], [-8, 7], [7, -8]];
    for (const [bx, bz] of barrelPositions) {
        const barrel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.45, 1.2, 12),
            toonMat(0x6b4423)
        );
        barrel.position.set(bx, 0.6, bz); barrel.castShadow = true;
        barrel.userData.solid = true;
        barrel.userData.colliderShape = 'cylinder';
        for (const by of [0.2, -0.2]) {
            const band = new THREE.Mesh(
                new THREE.TorusGeometry(0.51, 0.04, 8, 24),
                toonMat(0x2a2a2a)
            );
            band.rotation.x = Math.PI / 2; band.position.y = by;
            barrel.add(band);
        }
        roomGroup.add(barrel);
    }
}

export function buildWorkshopLighting(scene: THREE.Scene): {
    fireLight: THREE.PointLight;
    lampLight: THREE.PointLight;
} {
    scene.add(new THREE.HemisphereLight(0xffeedd, 0xaa8866, 1.2));

    const fill2 = new THREE.DirectionalLight(0xffddc0, 0.6);
    fill2.position.set(-8, 10, -5);
    scene.add(fill2);

    const sunLight = new THREE.DirectionalLight(0xffe4b5, 1.4);
    sunLight.position.set(10, 15, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    const s = sunLight.shadow.camera;
    s.left = s.bottom = -15; s.right = s.top = 15; s.near = 1; s.far = 40;
    scene.add(sunLight);
    scene.userData._mainSunLight = sunLight;

    const fireLight = new THREE.PointLight(0xff6622, 2.0, 12, 1.5);
    fireLight.position.set(-7, 2.5, -7);
    fireLight.castShadow = true;
    fireLight.shadow.mapSize.set(512, 512);
    scene.add(fireLight);

    const fillLight = new THREE.PointLight(0x6688bb, 0.5, 25);
    fillLight.position.set(8, 4, 8);
    scene.add(fillLight);

    const lampLight = new THREE.PointLight(0xff9944, 0.8, 6, 2);
    lampLight.position.set(0, 2.2, 2);
    scene.add(lampLight);

    // Window spotlights
    const addWindowLight = (x: number, y: number, z: number, tx: number, ty: number, tz: number) => {
        const spot = new THREE.SpotLight(0xffeebb, 2.5, 20, 0.6, 0.5, 1);
        spot.position.set(x, y, z);
        spot.target.position.set(tx, ty, tz);
        spot.castShadow = true;
        spot.shadow.mapSize.set(512, 512);
        scene.add(spot); scene.add(spot.target);
    };
    addWindowLight(0, 5.5, -9.5, 0, 0, -3);
    addWindowLight(-9.5, 5.5, -3, -3, 0, -3);
    addWindowLight(-9.5, 5.5, 3, -3, 0, 3);

    return { fireLight, lampLight };
}
