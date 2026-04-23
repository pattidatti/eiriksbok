import * as THREE from 'three';
import type { GameEngineRef, MaterialPreset } from '../engine/types';
import { buildRoom } from '../engine/systems/RoomSystem';
import { buildHangingLight, type HangingLightRef } from '../engine/LightBuilder';
import { OceanSystem, FoamSystem } from '../engine/systems/OceanSystem';
import { makeLabelSprite } from '../engine/TextureKit';

function mulberry32(seed: number): () => number {
    return function () {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function setupSkjoldborgScene(engine: GameEngineRef): void {
    const { scene, toonMat, sceneMat, config } = engine;
    const rng = mulberry32(42);

    // ── Sol + hemi (drevet av TimeOfDaySystem) ───────────────────────────────
    const sun = new THREE.DirectionalLight(0xffcc88, 2.0);
    sun.position.set(40, 70, 50);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 220;
    sun.shadow.camera.left = -80;
    sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80;
    sun.shadow.camera.bottom = -80;
    sun.shadow.bias = -0.0005;
    scene.add(sun);
    scene.userData._mainSunLight = sun;

    const hemi = new THREE.HemisphereLight(0xff9944, 0x3a2a14, 0.75);
    hemi.position.set(0, 50, 0);
    scene.add(hemi);
    scene.userData._mainHemiLight = hemi;

    // ── Bakken ───────────────────────────────────────────────────────────────
    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(130, 1, 130),
        new THREE.MeshStandardMaterial({ color: 0x4a6a2a, roughness: 0.95, metalness: 0 }),
    );
    ground.position.set(-5, -0.5, -5);
    ground.receiveShadow = true;
    ground.userData.solid = true;
    scene.add(ground);

    const beach = new THREE.Mesh(
        new THREE.BoxGeometry(14, 0.9, 110),
        new THREE.MeshStandardMaterial({ color: 0xd4b870, roughness: 1, metalness: 0 }),
    );
    beach.position.set(55, -0.55, -5);
    beach.receiveShadow = true;
    beach.userData.solid = true;
    scene.add(beach);

    // ── Stier ────────────────────────────────────────────────────────────────
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x7a5b3a, roughness: 1 });
    const addPath = (points: [number, number][]) => {
        for (let i = 0; i < points.length - 1; i++) {
            const [x1, z1] = points[i];
            const [x2, z2] = points[i + 1];
            const dx = x2 - x1;
            const dz = z2 - z1;
            const len = Math.hypot(dx, dz);
            const seg = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, len), pathMat);
            seg.position.set((x1 + x2) / 2, 0.03, (z1 + z2) / 2);
            seg.rotation.y = Math.atan2(dx, dz);
            seg.receiveShadow = true;
            scene.add(seg);
        }
    };
    addPath([[0, 8], [0, 0], [-12, -10], [-14, -14]]);   // mot helligdom
    addPath([[0, 0], [8, -4], [14, -8]]);                  // mot smia
    addPath([[0, 0], [6, -12], [2, -20]]);                 // mot steinring
    addPath([[2, 2], [20, 4], [40, 5], [52, 5]]);          // mot brygge
    addPath([[14, -8], [20, -6], [22, -4]]);               // mot vaktsone

    // ── Palisade-port ved spawn ───────────────────────────────────────────────
    const palMat = toonMat(0x4a3018);
    for (let i = -3; i <= 3; i++) {
        if (Math.abs(i) < 2) continue; // gap til port
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.8, 0.35), palMat);
        post.position.set(i * 1.1, 1.4, -0.5);
        post.castShadow = true;
        post.userData.solid = true;
        scene.add(post);
    }
    // Portposter
    for (const px of [-2.2, 2.2]) {
        const gatePost = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.0, 0.5), palMat);
        gatePost.position.set(px, 2.0, -0.5);
        gatePost.castShadow = true;
        gatePost.userData.solid = true;
        scene.add(gatePost);
    }
    // Portbjelke
    const portBjelke = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.4, 0.4), palMat);
    portBjelke.position.set(0, 4.2, -0.5);
    portBjelke.castShadow = true;
    scene.add(portBjelke);

    // ── Bål ved landsbyen ────────────────────────────────────────────────────
    const baalPos = new THREE.Vector3(-6, 0, 6);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7e7a74, roughness: 0.98, flatShading: true });
    const baalGroup = new THREE.Group();
    baalGroup.position.copy(baalPos);

    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.32 + rng() * 0.08, 0), stoneMat);
        rock.position.set(Math.cos(a) * 0.9, 0.16, Math.sin(a) * 0.9);
        rock.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
        baalGroup.add(rock);
    }
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.3;
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 0.9, 6), toonMat(0x5a3818));
        log.position.set(Math.cos(a) * 0.2, 0.18, Math.sin(a) * 0.2);
        log.rotation.z = Math.PI / 3;
        log.rotation.y = a;
        baalGroup.add(log);
    }
    const embers = new THREE.Mesh(
        new THREE.CircleGeometry(0.45, 10),
        new THREE.MeshStandardMaterial({ color: 0xff3300, emissive: 0xff2200, emissiveIntensity: 3, roughness: 1 }),
    );
    embers.rotation.x = -Math.PI / 2;
    embers.position.y = 0.05;
    baalGroup.add(embers);

    const flame1 = new THREE.Mesh(
        new THREE.ConeGeometry(0.28, 0.85, 7),
        new THREE.MeshStandardMaterial({ color: 0xff7722, emissive: 0xff4400, emissiveIntensity: 4, roughness: 1 }),
    );
    flame1.position.y = 0.5;
    baalGroup.add(flame1);
    const flame2 = new THREE.Mesh(
        new THREE.ConeGeometry(0.14, 0.5, 6),
        new THREE.MeshStandardMaterial({ color: 0xffcc44, emissive: 0xffaa22, emissiveIntensity: 5, roughness: 1 }),
    );
    flame2.position.y = 0.75;
    baalGroup.add(flame2);
    scene.add(baalGroup);

    const baalLight = new THREE.PointLight(0xff7722, 18, 18);
    baalLight.position.set(baalPos.x, baalPos.y + 1.5, baalPos.z);
    scene.add(baalLight);

    // Kastbare steiner ved balet
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.28, 0), stoneMat);
        stone.position.set(baalPos.x + Math.cos(a) * 2.2, 0.5, baalPos.z + Math.sin(a) * 2.2);
        stone.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
        stone.castShadow = true;
        stone.userData.solid = true;
        stone.userData.dynamic = true;
        stone.userData.pickupable = true;
        stone.userData.mass = 2;
        stone.userData.colliderShape = 'cuboid';
        stone.userData.linearDamping = 1.2;
        stone.userData.angularDamping = 2.4;
        scene.add(stone);
        engine.registerPickup(stone, { throwForce: 13 });
    }

    // ── Steinring ────────────────────────────────────────────────────────────
    const [ssx, ssz] = [2, -20];
    for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const h = 2.0 + rng() * 0.9;
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.85, h, 0.55), stoneMat);
        pillar.position.set(ssx + Math.cos(a) * 3.0, h / 2, ssz + Math.sin(a) * 3.0);
        pillar.rotation.y = a + (rng() - 0.5) * 0.2;
        pillar.rotation.z = (rng() - 0.5) * 0.07;
        pillar.castShadow = true;
        pillar.receiveShadow = true;
        pillar.userData.solid = true;
        scene.add(pillar);
    }
    const centerStone = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 1.1), stoneMat);
    centerStone.position.set(ssx, 0.2, ssz);
    centerStone.castShadow = true;
    centerStone.userData.solid = true;
    scene.add(centerStone);

    // ── Smiestova ────────────────────────────────────────────────────────────
    const smieCx = 16;
    const smieCz = -8;
    const smie = buildRoom(scene, toonMat, {
        id: 'smie',
        center: [smieCx, smieCz],
        size: [8, 7],
        wallHeight: 4,
        floorColor: 0x3a2a1a,
        wallColor: 0x7a6040,
        roofColor: 0x2a1a0a,
        hasRoof: true,
        openings: [{ side: 'W', offset: 0, width: 2.4 }],
    });
    if (smie.roof) smie.roof.visible = false;
    const smieBounds = smie.innerBounds;

    // Saltak på smia
    {
        const cxR = smieCx;
        const czR = smieCz;
        const chW = 8;
        const chD = 7;
        const wallH = 4;
        const peakH = 1.8;
        const overhang = 0.45;
        const halfW = chW / 2 + overhang;
        const slopeLen = Math.sqrt(halfW * halfW + peakH * peakH);
        const tilt = Math.atan2(peakH, halfW);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x2a1a0a, roughness: 0.92, side: THREE.DoubleSide });

        const slopeE = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.12, chD + 2 * overhang), roofMat);
        slopeE.rotation.z = -tilt;
        slopeE.position.set(cxR + Math.cos(tilt) * halfW * 0.5, wallH + peakH / 2, czR);
        slopeE.castShadow = true;
        scene.add(slopeE);

        const slopeW = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.12, chD + 2 * overhang), roofMat);
        slopeW.rotation.z = tilt;
        slopeW.position.set(cxR - Math.cos(tilt) * halfW * 0.5, wallH + peakH / 2, czR);
        slopeW.castShadow = true;
        scene.add(slopeW);

        const ridge = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.16, chD + 2 * overhang),
            new THREE.MeshStandardMaterial({ color: 0x1a0a00, roughness: 0.95 }),
        );
        ridge.position.set(cxR, wallH + peakH + 0.04, czR);
        scene.add(ridge);
    }

    // Esse (forge) - rektangulær steinblokk med glovende topp
    const esseMat = sceneMat(0x6a5040, { preset: 'stone' });
    const esse = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 1.0), esseMat);
    esse.position.set(smieCx + 1.5, 0.45, smieCz - 1.5);
    esse.castShadow = true;
    esse.receiveShadow = true;
    esse.userData.solid = true;
    scene.add(esse);

    const forgeToppMat = new THREE.MeshStandardMaterial({
        color: 0xff2200,
        emissive: 0xff1100,
        emissiveIntensity: 0.3,
        roughness: 1,
    });
    const forgeTopp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.7), forgeToppMat);
    forgeTopp.position.set(smieCx + 1.5, 0.94, smieCz - 1.5);
    scene.add(forgeTopp);

    const forgeLight = new THREE.PointLight(0xff4400, 4, 8);
    forgeLight.position.set(smieCx + 1.5, 1.8, smieCz - 1.5);
    scene.add(forgeLight);

    // Ambolt
    const amboltBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.65, 0.45),
        sceneMat(0x5a5a5a, { preset: 'metal' }),
    );
    amboltBase.position.set(smieCx - 0.5, 0.32, smieCz - 0.5);
    amboltBase.castShadow = true;
    amboltBase.receiveShadow = true;
    scene.add(amboltBase);
    const amboltTopp = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.2, 0.35),
        sceneMat(0x6a6a6a, { preset: 'metal' }),
    );
    amboltTopp.position.set(smieCx - 0.5, 0.75, smieCz - 0.5);
    amboltTopp.castShadow = true;
    scene.add(amboltTopp);

    // Balg (bellow)
    const belgMat = toonMat(0x5a3a20);
    const belgBody = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.9), belgMat);
    belgBody.position.set(smieCx + 1.5, 0.8, smieCz + 1.0);
    belgBody.castShadow = true;
    scene.add(belgBody);
    const belgHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 7), toonMat(0x3a2010));
    belgHandle.rotation.x = Math.PI / 2;
    belgHandle.position.set(smieCx + 1.5, 1.1, smieCz + 0.65);
    scene.add(belgHandle);

    const smieHangRef = buildHangingLight(scene, {
        id: 'smie-light',
        position: [smieCx, 3.5, smieCz],
        color: 0xff8844,
        intensity: 16,
        distance: 12,
        animation: 'flicker',
        angle: 0.55,
        coneHeight: 3.5,
        coneOpacity: 0.18,
        castShadow: true,
    });
    engine.registerAnimatedLight(smieHangRef.light, 'flicker', smieHangRef.light.intensity);

    // ── Helligdom ────────────────────────────────────────────────────────────
    const heilCx = -14;
    const heilCz = -18;
    const helligdom = buildRoom(scene, toonMat, {
        id: 'helligdom',
        center: [heilCx, heilCz],
        size: [8, 7],
        wallHeight: 4.5,
        floorColor: 0x2a1a28,
        wallColor: 0x4a3050,
        roofColor: 0x1a0a20,
        hasRoof: true,
        openings: [{ side: 'E', offset: 0, width: 2.2 }],
    });
    if (helligdom.roof) helligdom.roof.visible = false;
    const heilBounds = helligdom.innerBounds;

    // Saltak på helligdom
    {
        const cxR = heilCx;
        const czR = heilCz;
        const chW = 8;
        const chD = 7;
        const wallH = 4.5;
        const peakH = 2.0;
        const overhang = 0.45;
        const halfW = chW / 2 + overhang;
        const slopeLen = Math.sqrt(halfW * halfW + peakH * peakH);
        const tilt = Math.atan2(peakH, halfW);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a0a20, roughness: 0.94, side: THREE.DoubleSide });

        const slopeE = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.12, chD + 2 * overhang), roofMat);
        slopeE.rotation.z = -tilt;
        slopeE.position.set(cxR + Math.cos(tilt) * halfW * 0.5, wallH + peakH / 2, czR);
        slopeE.castShadow = true;
        scene.add(slopeE);

        const slopeW = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.12, chD + 2 * overhang), roofMat);
        slopeW.rotation.z = tilt;
        slopeW.position.set(cxR - Math.cos(tilt) * halfW * 0.5, wallH + peakH / 2, czR);
        slopeW.castShadow = true;
        scene.add(slopeW);

        const ridge = new THREE.Mesh(
            new THREE.BoxGeometry(0.22, 0.16, chD + 2 * overhang),
            new THREE.MeshStandardMaterial({ color: 0x0a0010, roughness: 0.95 }),
        );
        ridge.position.set(cxR, wallH + peakH + 0.04, czR);
        scene.add(ridge);
    }

    // Alter inne i helligdom
    const altar = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.9, 0.7),
        sceneMat(0xc0b898, { preset: 'stone' }),
    );
    altar.position.set(heilCx - 2.5, 0.45, heilCz);
    altar.castShadow = true;
    altar.receiveShadow = true;
    altar.userData.solid = true;
    scene.add(altar);

    // Alter-glow (pulserende lys)
    const altarGlowMat = new THREE.MeshStandardMaterial({
        color: 0xaa88ff,
        emissive: 0x8844ff,
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.7,
    });
    const altarGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.6), altarGlowMat);
    altarGlow.rotation.x = -Math.PI / 2;
    altarGlow.position.set(heilCx - 2.5, 0.92, heilCz);
    scene.add(altarGlow);

    const altarLight = new THREE.PointLight(0x8844ff, 5, 7);
    altarLight.position.set(heilCx - 2.5, 1.8, heilCz);
    scene.add(altarLight);

    // Lys i helligdom
    const heilLights: HangingLightRef[] = [];
    for (const [lx, lz] of [[heilCx + 1, heilCz - 1.5], [heilCx + 1, heilCz + 1.5]] as [number, number][]) {
        const ref = buildHangingLight(scene, {
            id: `heil-light-${lx}`,
            position: [lx, 4.0, lz],
            color: 0xcc88ff,
            intensity: 10,
            distance: 10,
            animation: 'flicker-soft',
            angle: 0.52,
            coneHeight: 4.0,
            coneOpacity: 0.14,
            castShadow: true,
        });
        heilLights.push(ref);
        engine.registerAnimatedLight(ref.light, 'flicker-soft', ref.light.intensity);
    }

    // ── PBR-galleri ──────────────────────────────────────────────────────────
    const galleryX = -28;
    const galleryZ = 5;
    const galleryBack = new THREE.Mesh(
        new THREE.BoxGeometry(11, 3.4, 0.3),
        sceneMat(0x5a4a32, { preset: 'wood' }),
    );
    galleryBack.position.set(galleryX, 1.7, galleryZ);
    galleryBack.userData.solid = true;
    galleryBack.castShadow = true;
    galleryBack.receiveShadow = true;
    scene.add(galleryBack);

    type PanelDef = { preset: MaterialPreset; color: number; label: string };
    const panels: PanelDef[] = [
        { preset: 'stone', color: 0x9a9088, label: 'Stein' },
        { preset: 'wood', color: 0x9a6a3a, label: 'Tre' },
        { preset: 'cloth', color: 0xc05a4a, label: 'Klut' },
        { preset: 'metal', color: 0x9a9aa0, label: 'Metall' },
        { preset: 'leaf', color: 0x4a8a3a, label: 'Blad' },
        { preset: 'soil', color: 0x6a4828, label: 'Jord' },
    ];
    const panelW = 1.5;
    const totalSpan = panels.length * panelW + (panels.length - 1) * 0.15;
    const panelStartX = galleryX - totalSpan / 2 + panelW / 2;
    panels.forEach((p, i) => {
        const px = panelStartX + i * (panelW + 0.15);
        const panelMat = sceneMat(p.color, {
            preset: p.preset,
            normalMap: engine.getTexture(p.preset, 'normal'),
            roughnessMap: engine.getTexture(p.preset, 'roughness'),
            aoMap: engine.getTexture(p.preset, 'ao'),
            mapRepeat: [2, 2],
        });
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(panelW, 1.5, 16, 16), panelMat);
        panel.position.set(px, 1.9, galleryZ - 0.16);
        panel.receiveShadow = true;
        scene.add(panel);
        const label = makeLabelSprite(p.label);
        label.position.set(px, 0.9, galleryZ - 0.18);
        scene.add(label);
    });
    for (const lx of [-30, -26]) {
        const gl = new THREE.PointLight(0xffe8c0, 8, 6, 2);
        gl.position.set(lx, 3.2, galleryZ + 1.5);
        scene.add(gl);
    }

    // ── Brygge + Hav ─────────────────────────────────────────────────────────
    const dockMat = toonMat(0x7a5a38);
    const dockBaseX = 52;
    const dockEndX = 64;
    const dockLength = dockEndX - dockBaseX;
    const dockDeck = new THREE.Mesh(new THREE.BoxGeometry(dockLength, 0.14, 2.0), dockMat);
    dockDeck.position.set((dockBaseX + dockEndX) / 2, 0.3, 5);
    dockDeck.userData.solid = true;
    dockDeck.castShadow = true;
    scene.add(dockDeck);
    for (let i = 0; i < 5; i++) {
        for (const dz of [-0.95, 0.95]) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 2.2, 7), dockMat);
            post.position.set(dockBaseX + 1 + i * 2.5, -0.2, 5 + dz);
            post.userData.solid = true;
            post.castShadow = true;
            scene.add(post);
        }
    }

    const ocean = new OceanSystem(scene, toonMat, { size: 180, segments: 64, color: 0x1a4a6a, center: [80, 0] });
    ocean.mesh.position.y = -1.1;
    const foam = new FoamSystem(scene, () => ({ x: dockEndX, y: -0.9, z: 5 }), 60);

    // Kyststeiner
    for (let i = 0; i < 20; i++) {
        const z = -48 + i * 5 + (rng() - 0.5);
        if (Math.abs(z - 5) < 3.5) continue;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7 + rng() * 0.7, 0), stoneMat);
        rock.position.set(48 + rng() * 2, -0.1 + rng() * 0.4, z);
        rock.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
        rock.castShadow = true;
        rock.userData.solid = true;
        scene.add(rock);
    }

    // Langskip
    const boatGroup = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(5, 0.7, 1.8), toonMat(0x5a3a20));
    hull.position.y = 0.35;
    hull.castShadow = true;
    boatGroup.add(hull);
    const hullInner = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 1.2), toonMat(0x3a2510));
    hullInner.position.y = 0.5;
    boatGroup.add(hullInner);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 4.2, 6), toonMat(0x4a2a10));
    mast.position.y = 2.4;
    boatGroup.add(mast);
    const sailGeo = new THREE.PlaneGeometry(2.4, 2.4, 6, 6);
    const sailMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        side: THREE.DoubleSide,
        vertexShader: `uniform float uTime; varying vec2 vUv;
            void main() { vUv = uv; vec3 p = position;
                float w = sin(p.y*3.0+uTime*2.2)*0.08+sin(p.x*4.0+uTime*1.6)*0.04;
                p.z += w; gl_Position = projectionMatrix*modelViewMatrix*vec4(p,1.0); }`,
        fragmentShader: `varying vec2 vUv;
            void main() { vec3 b=vec3(0.88,0.20,0.16);
                float s=step(0.5,fract(vUv.x*4.0));
                gl_FragColor=vec4(mix(b,vec3(0.92,0.86,0.72),s*0.7),1.0); }`,
    });
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.set(0, 2.4, 0);
    sail.rotation.y = Math.PI / 2;
    boatGroup.add(sail);
    const boatBaseY = -1.0;
    boatGroup.position.set(72, boatBaseY, 7);
    boatGroup.rotation.y = -0.3;
    scene.add(boatGroup);

    // ── Trær + vegetasjon + fauna ────────────────────────────────────────────
    const buildingBounds = [
        { minX: 12, maxX: 22, minZ: -14, maxZ: -2 },
        { minX: -20, maxX: -8, minZ: -24, maxZ: -12 },
        { minX: -2, maxX: 6, minZ: -24, maxZ: -16 },
        { minX: -6, maxX: 6, minZ: -2, maxZ: 14 },
        { minX: -34, maxX: -22, minZ: 0, maxZ: 10 },
    ];
    const insideAny = (x: number, z: number) =>
        buildingBounds.some((b) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ);

    let placed = 0;
    let attempts = 0;
    while (placed < 420 && attempts < 1680) {
        attempts++;
        const x = -100 + rng() * 200;
        const z = -100 + rng() * 200;
        if (Math.hypot(x, z) < 9) continue;
        if (insideAny(x, z)) continue;
        const r = rng();
        engine.addTree([x, 0, z], r > 0.45 ? 'pine' : r > 0.2 ? 'birch' : 'oak');
        placed++;
    }
    engine.addTree([8, 0, 12], 'birch');
    engine.addTree([-4, 0, 14], 'oak');
    engine.addTree([12, 0, 0], 'birch');
    engine.addTree([-10, 0, 4], 'oak');

    engine.addVegetationPatch({ minX: -10, maxX: 18, minZ: -4, maxZ: 18 }, 1.6, 'grass');
    engine.addVegetationPatch({ minX: -14, maxX: 10, minZ: -18, maxZ: -6 }, 1.2, 'grass');
    engine.addVegetationPatch({ minX: 4, maxX: 18, minZ: 2, maxZ: 16 }, 0.8, 'flowers');
    engine.addVegetationPatch({ minX: -8, maxX: 2, minZ: 12, maxZ: 22 }, 2.2, 'reeds');
    engine.addVegetationPatch({ minX: -35, maxX: -20, minZ: -8, maxZ: 12 }, 1.1, 'heather');
    engine.addVegetationPatch({ minX: 8, maxX: 24, minZ: 14, maxZ: 30 }, 0.7, 'ferns');
    engine.addVegetationPatch({ minX: -8, maxX: 6, minZ: 8, maxZ: 20 }, 1.0, 'wildflowers');

    engine.addBirdFlock([0, 0, 0], { altitude: 24, radius: 20 });
    engine.addBirdFlock([-20, 0, -10], { altitude: 32, radius: 14 });
    engine.addButterfly([8, 0, 10], { radius: 4 });
    engine.addButterfly([2, 0, 15], { color: 0xffaadd });
    engine.addAnimalGroup('sheep', { minX: -4, maxX: 20, minZ: 8, maxZ: 30 });
    engine.addAnimalGroup('cow', { minX: 16, maxX: 46, minZ: -16, maxZ: 8 }, { count: 3 });

    // ── Fjell i bakgrunnen ───────────────────────────────────────────────────
    const mountainMat = new THREE.MeshStandardMaterial({ color: 0x4a5060, roughness: 1, flatShading: true });
    const peaks: [number, number, number][] = [
        [-60, 0, -60], [-40, 0, -65], [-20, 0, -70], [0, 0, -72],
        [20, 0, -68], [-70, 0, -30], [-75, 0, 0], [-70, 0, 30],
    ];
    for (const [px, , pz] of peaks) {
        const h = 14 + rng() * 10;
        const peak = new THREE.Mesh(new THREE.ConeGeometry(8 + rng() * 4, h, 5), mountainMat);
        peak.position.set(px + (rng() - 0.5) * 6, h / 2 - 1, pz + (rng() - 0.5) * 6);
        peak.rotation.y = rng() * Math.PI;
        scene.add(peak);
    }

    // ── Hjelpefunksjon: glovende pickup-ring ─────────────────────────────────
    type RingEntry = { mesh: THREE.Mesh; baseY: number; phase: number };
    const pickupRings: RingEntry[] = [];

    function makePickupRing(x: number, y: number, z: number): RingEntry {
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.42, 0.035, 8, 16),
            new THREE.MeshStandardMaterial({ color: 0xffeb88, emissive: 0xffd866, emissiveIntensity: 2.5 }),
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(x, y + 0.65, z);
        scene.add(ring);
        const entry: RingEntry = { mesh: ring, baseY: ring.position.y, phase: Math.random() * Math.PI * 2 };
        pickupRings.push(entry);
        return entry;
    }

    // ── Offersverd [18, 0.6, -14] ─────────────────────────────────────────────
    const schwertMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.6, 0.08),
        sceneMat(0xb0b8c0, { preset: 'metal' }),
    );
    schwertMesh.position.set(18, 0.9, -14);
    schwertMesh.castShadow = true;
    schwertMesh.userData.solid = true;
    schwertMesh.userData.dynamic = true;
    schwertMesh.userData.pickupable = true;
    schwertMesh.userData.mass = 1.5;
    schwertMesh.userData.colliderShape = 'cuboid';
    schwertMesh.userData.linearDamping = 1.4;
    schwertMesh.userData.angularDamping = 2.4;
    scene.add(schwertMesh);
    const schwertRing = makePickupRing(18, 0.6, -14);
    engine.registerPickup(schwertMesh, {
        toInventory: { itemId: 'schwert', count: 1 },
        onPickup: () => {
            schwertRing.mesh.removeFromParent();
            const idx = pickupRings.indexOf(schwertRing);
            if (idx >= 0) pickupRings.splice(idx, 1);
        },
    });

    // ── Mjod-horn [-6, 0.6, -4] ───────────────────────────────────────────────
    const hornMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.38, 8),
        toonMat(0x6a4020),
    );
    hornMesh.position.set(-6, 0.78, -4);
    hornMesh.castShadow = true;
    hornMesh.userData.solid = true;
    hornMesh.userData.dynamic = true;
    hornMesh.userData.pickupable = true;
    hornMesh.userData.mass = 0.8;
    hornMesh.userData.colliderShape = 'cuboid';
    hornMesh.userData.linearDamping = 1.2;
    hornMesh.userData.angularDamping = 2.4;
    scene.add(hornMesh);
    const hornRing = makePickupRing(-6, 0.6, -4);
    engine.registerPickup(hornMesh, {
        toInventory: { itemId: 'horn', count: 1 },
        onPickup: () => {
            hornRing.mesh.removeFromParent();
            const idx = pickupRings.indexOf(hornRing);
            if (idx >= 0) pickupRings.splice(idx, 1);
        },
    });

    // ── Gullmynt [6, 0.6, -22] ───────────────────────────────────────────────
    const myntMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.04, 12),
        new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xaa8800, emissiveIntensity: 0.8, roughness: 0.3, metalness: 0.9 }),
    );
    myntMesh.position.set(6, 0.62, -22);
    myntMesh.castShadow = true;
    myntMesh.userData.solid = true;
    myntMesh.userData.dynamic = true;
    myntMesh.userData.pickupable = true;
    myntMesh.userData.mass = 0.5;
    myntMesh.userData.colliderShape = 'cuboid';
    myntMesh.userData.linearDamping = 1.5;
    myntMesh.userData.angularDamping = 2.4;
    scene.add(myntMesh);
    const myntRing = makePickupRing(6, 0.6, -22);
    engine.registerPickup(myntMesh, {
        toInventory: { itemId: 'mynt', count: 1 },
        onPickup: () => {
            myntRing.mesh.removeFromParent();
            const idx = pickupRings.indexOf(myntRing);
            if (idx >= 0) pickupRings.splice(idx, 1);
        },
    });

    // ── Gullring [25, 0.6, -2] (bonus i vakt-sonen) ──────────────────────────
    const gullringMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.14, 0.04, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xbb8800, emissiveIntensity: 1.0, roughness: 0.2, metalness: 1.0 }),
    );
    gullringMesh.position.set(25, 0.6, -2);
    gullringMesh.castShadow = true;
    gullringMesh.userData.solid = true;
    gullringMesh.userData.dynamic = true;
    gullringMesh.userData.pickupable = true;
    gullringMesh.userData.mass = 0.3;
    gullringMesh.userData.colliderShape = 'cuboid';
    gullringMesh.userData.linearDamping = 1.8;
    gullringMesh.userData.angularDamping = 2.4;
    scene.add(gullringMesh);
    const ringPickupRing = makePickupRing(25, 0.6, -2);
    engine.registerPickup(gullringMesh, {
        toInventory: { itemId: 'gullring', count: 1 },
        onPickup: () => {
            ringPickupRing.mesh.removeFromParent();
            const idx = pickupRings.indexOf(ringPickupRing);
            if (idx >= 0) pickupRings.splice(idx, 1);
        },
    });

    // ── Interaksjoner: belgpumping ────────────────────────────────────────────
    engine.registerInteract(belgBody, {
        radius: 2.2,
        label: () => {
            if (!engine.getFlag('saml_complete')) return '';
            if (engine.getFlag('forge_hot')) return '';
            return 'Pump belgen (E)';
        },
        onInteract: () => {
            if (!engine.getFlag('saml_complete') || engine.getFlag('forge_hot')) return;
            engine.openActivity({
                id: 'belg',
                label: 'Balgpumping',
                prompt: 'Hold MELLOMROM for å pumpe belgen!',
                variant: 'hold',
                durationMs: 3000,
                onSuccess: () => {
                    engine.setFlag('forge_hot', true);
                    forgeToppMat.emissiveIntensity = 4.0;
                    forgeLight.intensity = 22;
                    engine.setEmotion('helge', 'glad', 2500);
                },
                onFail: () => engine.playMonolog('m_belg_fail'),
            });
        },
    });

    // ── Interaksjoner: ambolt / smieritual ───────────────────────────────────
    engine.registerInteract(amboltTopp, {
        radius: 2.0,
        label: () => {
            if (engine.getFlag('ring_smidd')) return '';
            if (!engine.getFlag('saml_complete')) return 'Trenger offersakene først';
            if (!engine.getFlag('forge_hot')) return 'Smia er kald - pump belgen først';
            return 'Smi ringen (E)';
        },
        onInteract: () => {
            if (!engine.getFlag('saml_complete') || !engine.getFlag('forge_hot') || engine.getFlag('ring_smidd')) return;
            engine.openActivity({
                id: 'smiing',
                label: 'Hamring',
                prompt: 'Trykk MELLOMROM i takt med ambolten!',
                variant: 'rhythm',
                durationMs: 9000,
                windowMs: 180,
                successThreshold: 0.6,
                onSuccess: () => {
                    engine.setFlag('ring_smidd', true);
                    engine.completeObjective('q_smie', 'o_smi');
                    engine.screenFlash();
                    engine.cameraShake(0.3, 0.6);
                    engine.setEmotion('helge', 'triumphant', 3000);
                },
                onFail: () => {
                    engine.playMonolog('m_smi_fail');
                    engine.setEmotion('helge', 'worried', 2000);
                },
            });
        },
    });

    // ── Interaksjoner: alter / station-puzzle ────────────────────────────────
    const puzzleStep = engine.config.puzzle!.steps[0];
    puzzleStep.onCorrect = () => {
        engine.setFlag('offer_levert', true);
        engine.completeObjective('q_alter', 'o_deliver');
        engine.removeItem('schwert', 1);
        engine.removeItem('horn', 1);
        engine.removeItem('mynt', 1);
        engine.screenFlash();
        engine.cameraShake(0.4, 1.0);
        engine.setEmotion('volven', 'triumphant', 5000);
        altarGlowMat.emissiveIntensity = 5.0;
        altarLight.intensity = 22;
        engine.schedule(() => engine.triggerEnd(), 2500);
    };

    engine.registerInteract(altar, {
        radius: 2.5,
        label: () => {
            if (engine.getFlag('offer_levert')) return '';
            if (!engine.getFlag('ring_ready')) return 'Trenger blot-ring';
            const hasAll = engine.hasItem('schwert') && engine.hasItem('horn') && engine.hasItem('mynt');
            return hasAll ? 'Utfør blot-ritualet (E)' : 'Trenger offersakene (I for inventar)';
        },
        onInteract: () => {
            if (engine.getFlag('offer_levert') || !engine.getFlag('ring_ready')) return;
            if (!engine.hasItem('schwert') || !engine.hasItem('horn') || !engine.hasItem('mynt')) return;
            engine.openPuzzle();
        },
    });

    // ── Deteksjon: callbacks settes dynamisk ──────────────────────────────────
    const guards = engine.config.detection?.guards ?? [];
    for (const guard of guards) {
        guard.onFullDetection = () => {
            if (!engine.getFlag('oppdaget')) {
                engine.setFlag('oppdaget', true);
                engine.playMonolog('m_oppdaget');
            }
        };
    }

    // ── Dialog-kobling: vær + tid på døgnet ──────────────────────────────────
    const vaerMeny = config.dialogs['vaer_meny'];
    if (vaerMeny && !Array.isArray(vaerMeny)) {
        vaerMeny.choices[0].action = () => engine.setWeather({ type: 'clear', intensity: 0 });
        vaerMeny.choices[1].action = () => engine.setWeather({ type: 'rain', intensity: 0.6 });
        vaerMeny.choices[2].action = () => engine.setWeather({ type: 'snow', intensity: 0.7 });
        vaerMeny.choices[3].action = () => engine.setWeather({ type: 'fog', intensity: 0.85 });
    }
    const tidMeny = config.dialogs['tid_meny'];
    if (tidMeny && !Array.isArray(tidMeny)) {
        tidMeny.choices[0].action = () => engine.setTimeOfDay(0.24);
        tidMeny.choices[1].action = () => engine.setTimeOfDay(0.5);
        tidMeny.choices[2].action = () => engine.setTimeOfDay(0.75);
        tidMeny.choices[3].action = () => engine.setTimeOfDay(0.03);
    }

    // ── Per-frame oppdatering ─────────────────────────────────────────────────
    engine.registerUpdate((dt: number, elapsed: number) => {
        // Hav
        ocean.update(dt);
        foam.update(dt);

        // Langskip dupper
        const tilt = ocean.getWaveTilt(boatGroup.position.x, boatGroup.position.z);
        boatGroup.rotation.x = tilt.pitch * 0.35;
        boatGroup.rotation.z = -0.3 + tilt.roll * 0.35;
        boatGroup.position.y = boatBaseY + tilt.height * 0.5;

        // Seil
        sailMat.uniforms.uTime.value = elapsed;

        // Balet flammer
        const f1 = Math.sin(elapsed * 5.8) * 0.5 + 0.5;
        const f2 = Math.sin(elapsed * 4.1 + 1) * 0.5 + 0.5;
        flame1.scale.set(0.85 + f1 * 0.3, 0.8 + f1 * 0.35, 0.85 + f1 * 0.3);
        flame2.scale.set(0.7 + f2 * 0.4, 0.6 + f2 * 0.45, 0.7 + f2 * 0.4);
        flame1.position.y = 0.5 + f1 * 0.12;
        flame2.position.y = 0.75 + f2 * 0.13;
        baalLight.intensity = 12 + f1 * 8;

        // Forge-glow pulserer svakt
        const forgeHot = engine.getFlag('forge_hot');
        forgeToppMat.emissiveIntensity = forgeHot
            ? 3.5 + Math.sin(elapsed * 6) * 0.8
            : 0.25 + Math.sin(elapsed * 2.2) * 0.1;
        forgeLight.intensity = forgeHot ? 18 + Math.sin(elapsed * 5) * 4 : 3;

        // Alter-glow pulserer
        const offerLevert = engine.getFlag('offer_levert');
        altarGlowMat.emissiveIntensity = offerLevert
            ? 5.0 + Math.sin(elapsed * 4) * 1.0
            : 0.7 + Math.sin(elapsed * 1.8) * 0.3;
        altarLight.intensity = offerLevert ? 20 + Math.sin(elapsed * 3) * 4 : 4 + Math.sin(elapsed * 1.5) * 1;

        // Pickup-ringer svever
        for (const r of pickupRings) {
            r.mesh.position.y = r.baseY + Math.sin(elapsed * 1.8 + r.phase) * 0.08;
            r.mesh.rotation.z = elapsed * 0.6;
        }

        // Smie-lys oppdateres
        for (const ref of [smieHangRef]) ref.update(dt, elapsed);
        for (const ref of heilLights) ref.update(dt, elapsed);

        // Dollhouse: skjul tak nar spiller er inne
        const pp = engine.getPlayerPosition();
        const insideSmie =
            pp.x >= smieBounds.minX && pp.x <= smieBounds.maxX &&
            pp.z >= smieBounds.minZ && pp.z <= smieBounds.maxZ;
        const insideHeil =
            pp.x >= heilBounds.minX && pp.x <= heilBounds.maxX &&
            pp.z >= heilBounds.minZ && pp.z <= heilBounds.maxZ;

        if (smie.roof) smie.roof.visible = !insideSmie;
        if (helligdom.roof) helligdom.roof.visible = !insideHeil;

        scene.userData._indoors = insideSmie || insideHeil;
    });
}
