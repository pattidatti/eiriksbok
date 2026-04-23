import * as THREE from 'three';
import type { GameEngineRef, MaterialPreset } from '../engine/types';
import { buildRoom } from '../engine/systems/RoomSystem';
import { buildHangingLight, type HangingLightRef } from '../engine/LightBuilder';
import { OceanSystem, FoamSystem } from '../engine/systems/OceanSystem';

function makeLabelSprite(text: string, color = '#f5e9c8'): THREE.Sprite {
    const cvs = document.createElement('canvas');
    cvs.width = 256;
    cvs.height = 64;
    const ctx = cvs.getContext('2d')!;
    ctx.fillStyle = 'rgba(20, 14, 8, 0.85)';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 252, 60);
    ctx.fillStyle = color;
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 34);
    const tex = new THREE.CanvasTexture(cvs);
    tex.anisotropy = 4;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.4, 0.36, 1);
    return sprite;
}

function mulberry32(seed: number): () => number {
    return function () {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function setupDemoWorldScene(engine: GameEngineRef): void {
    const { scene, toonMat, sceneMat, config } = engine;
    const rng = mulberry32(13);

    // ── Sol + himmel-lys (drevet av TimeOfDaySystem) ─────────────────────────
    const sun = new THREE.DirectionalLight(0xfff5e0, 2.4);
    sun.position.set(60, 90, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 200;
    sun.shadow.camera.left = -70;
    sun.shadow.camera.right = 70;
    sun.shadow.camera.top = 70;
    sun.shadow.camera.bottom = -70;
    sun.shadow.bias = -0.0005;
    scene.add(sun);
    scene.userData._mainSunLight = sun;

    const hemi = new THREE.HemisphereLight(0x9ec6e8, 0x3d5a2d, 0.9);
    hemi.position.set(0, 50, 0);
    scene.add(hemi);
    scene.userData._mainHemiLight = hemi;

    // ── Ground (solid base for physics + grass) ──────────────────────────────
    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(110, 1, 110),
        new THREE.MeshStandardMaterial({ color: 0x3e6b2a, roughness: 0.95, metalness: 0 }),
    );
    ground.position.set(-5, -0.5, -5);
    ground.receiveShadow = true;
    ground.userData.solid = true;
    scene.add(ground);

    // Sandy beach transitioning to ocean east of the land (sitter på landkanten x≈50)
    const beach = new THREE.Mesh(
        new THREE.BoxGeometry(14, 0.9, 100),
        new THREE.MeshStandardMaterial({ color: 0xd9c88a, roughness: 1, metalness: 0 }),
    );
    beach.position.set(55, -0.55, -5);
    beach.receiveShadow = true;
    beach.userData.solid = true;
    scene.add(beach);

    // ── Dirt paths linking the landmarks ─────────────────────────────────────
    const pathMat = new THREE.MeshStandardMaterial({ color: 0x7a5b3a, roughness: 1 });
    const addPath = (points: [number, number][]) => {
        for (let i = 0; i < points.length - 1; i++) {
            const [x1, z1] = points[i];
            const [x2, z2] = points[i + 1];
            const dx = x2 - x1;
            const dz = z2 - z1;
            const len = Math.hypot(dx, dz);
            const path = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.06, len), pathMat);
            path.position.set((x1 + x2) / 2, 0.03, (z1 + z2) / 2);
            path.rotation.y = Math.atan2(dx, dz);
            path.receiveShadow = true;
            scene.add(path);
        }
    };
    addPath([[0, 8], [0, 0], [-10, -8], [-18, -14]]);
    addPath([[0, 0], [6, -4], [10, -9]]);
    addPath([[2, 2], [20, 4], [40, 5], [52, 5]]);

    // ── Chapel (room system + hanging spotlights) ────────────────────────────
    const chapel = buildRoom(scene, toonMat, {
        id: 'kapell',
        center: [-18, -18],
        size: [10, 9],
        wallHeight: 5,
        floorColor: 0x6a5038,
        wallColor: 0xa08a68,
        roofColor: 0x3a2818,
        hasRoof: true,
        openings: [{ side: 'S', offset: 0, width: 2.2 }],
    });
    // RoomSystem lager taket med normalen pekende nedover (synlig kun fra innsiden).
    // Skjul det flate standardtaket og bygg et skikkelig saltak med gavler oppå.
    if (chapel.roof) chapel.roof.visible = false;
    {
        const cxR = -18;
        const czR = -18;
        const chW = 10;
        const chD = 9;
        const wallH = 5;
        const peakH = 2.2;
        const overhang = 0.5;
        const halfW = chW / 2 + overhang;
        const halfD = chD / 2 + overhang;
        const slopeLen = Math.sqrt(halfW * halfW + peakH * peakH);
        const tilt = Math.atan2(peakH, halfW);

        const roofMat = new THREE.MeshStandardMaterial({
            color: 0x3a2818,
            roughness: 0.92,
            metalness: 0,
            side: THREE.DoubleSide,
        });

        const slopeE = new THREE.Mesh(
            new THREE.BoxGeometry(slopeLen, 0.12, chD + 2 * overhang),
            roofMat,
        );
        slopeE.rotation.z = -tilt;
        slopeE.position.set(cxR + Math.cos(tilt) * halfW * 0.5, wallH + peakH / 2, czR);
        slopeE.castShadow = true;
        slopeE.receiveShadow = true;
        scene.add(slopeE);

        const slopeW = new THREE.Mesh(
            new THREE.BoxGeometry(slopeLen, 0.12, chD + 2 * overhang),
            roofMat,
        );
        slopeW.rotation.z = tilt;
        slopeW.position.set(cxR - Math.cos(tilt) * halfW * 0.5, wallH + peakH / 2, czR);
        slopeW.castShadow = true;
        slopeW.receiveShadow = true;
        scene.add(slopeW);

        // Gavler (triangelformede endegaver)
        const gableMat = new THREE.MeshStandardMaterial({
            color: 0x8e7852,
            roughness: 0.95,
            side: THREE.DoubleSide,
        });
        const gableShape = new THREE.Shape();
        gableShape.moveTo(-halfW, 0);
        gableShape.lineTo(halfW, 0);
        gableShape.lineTo(0, peakH);
        gableShape.lineTo(-halfW, 0);
        const gableGeo = new THREE.ShapeGeometry(gableShape);

        const gableN = new THREE.Mesh(gableGeo, gableMat);
        gableN.position.set(cxR, wallH, czR - halfD);
        gableN.rotation.y = Math.PI;
        scene.add(gableN);

        const gableS = new THREE.Mesh(gableGeo, gableMat);
        gableS.position.set(cxR, wallH, czR + halfD);
        scene.add(gableS);

        // Mønekam
        const ridge = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.18, chD + 2 * overhang),
            new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.95 }),
        );
        ridge.position.set(cxR, wallH + peakH + 0.05, czR);
        ridge.castShadow = true;
        scene.add(ridge);
    }

    const hangingLightRefs: HangingLightRef[] = [];
    const lightDefs: { x: number; z: number; color: number; intensity: number }[] = [
        { x: -18, z: -18, color: 0xfff0c8, intensity: 22 },
        { x: -22, z: -16, color: 0xffb060, intensity: 12 },
        { x: -14, z: -16, color: 0xffb060, intensity: 12 },
        { x: -22, z: -20, color: 0xff8844, intensity: 12 },
        { x: -14, z: -20, color: 0xff8844, intensity: 12 },
    ];
    for (const def of lightDefs) {
        const ref = buildHangingLight(scene, {
            id: `chapel-light-${def.x}-${def.z}`,
            position: [def.x, 4.4, def.z],
            color: def.color,
            intensity: def.intensity,
            distance: 14,
            animation: 'flicker-soft',
            angle: 0.6,
            coneHeight: 4.4,
            coneOpacity: 0.16,
        });
        hangingLightRefs.push(ref);
        engine.registerAnimatedLight(ref.light, 'flicker-soft', ref.light.intensity);
    }

    // Altar with candle inside the chapel
    const altar = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.9, 0.8),
        sceneMat(0xd8d0b8, { preset: 'stone' }),
    );
    altar.position.set(-18, 0.45, -21.2);
    altar.castShadow = true;
    altar.receiveShadow = true;
    altar.userData.solid = true;
    scene.add(altar);

    const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.3, 8),
        new THREE.MeshStandardMaterial({ color: 0xf0e0b0, roughness: 0.6 }),
    );
    candle.position.set(-18, 1.05, -21.2);
    scene.add(candle);

    const candleFlame = new THREE.Mesh(
        new THREE.SphereGeometry(0.07, 6, 4),
        new THREE.MeshStandardMaterial({
            color: 0xffcc66,
            emissive: 0xffaa00,
            emissiveIntensity: 5,
            roughness: 1,
        }),
    );
    candleFlame.position.set(-18, 1.27, -21.2);
    scene.add(candleFlame);

    const candleLight = new THREE.PointLight(0xffaa44, 3.5, 4);
    candleLight.position.set(-18, 1.3, -21.2);
    scene.add(candleLight);
    engine.registerAnimatedLight(candleLight, 'flicker', 3.5);

    // ── Stone circle ─────────────────────────────────────────────────────────
    const stoneMat = new THREE.MeshStandardMaterial({
        color: 0x7e7a74,
        roughness: 0.98,
        metalness: 0,
        flatShading: true,
    });
    const [sx, sz] = [-8, -19];
    for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        const h = 2.2 + rng() * 1.0;
        const stone = new THREE.Mesh(new THREE.BoxGeometry(0.9, h, 0.6), stoneMat);
        stone.position.set(sx + Math.cos(a) * 3.2, h / 2, sz + Math.sin(a) * 3.2);
        stone.rotation.y = a + (rng() - 0.5) * 0.2;
        stone.rotation.z = (rng() - 0.5) * 0.08;
        stone.castShadow = true;
        stone.receiveShadow = true;
        stone.userData.solid = true;
        scene.add(stone);
    }
    // Center altar stone
    const centerStone = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.5, 1.2),
        stoneMat,
    );
    centerStone.position.set(sx, 0.25, sz);
    centerStone.castShadow = true;
    centerStone.userData.solid = true;
    scene.add(centerStone);

    // ── Bonfire ──────────────────────────────────────────────────────────────
    const firePos = new THREE.Vector3(10, 0, -10);
    const fireGroup = new THREE.Group();
    fireGroup.position.copy(firePos);

    for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const r = 1.0 + (rng() - 0.5) * 0.1;
        const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.38 + rng() * 0.1, 0), stoneMat);
        rock.position.set(Math.cos(a) * r, 0.18, Math.sin(a) * r);
        rock.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
        rock.castShadow = true;
        fireGroup.add(rock);
    }
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.3;
        const log = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.14, 1.1, 7),
            toonMat(0x5a3818),
        );
        log.position.set(Math.cos(a) * 0.25, 0.2, Math.sin(a) * 0.25);
        log.rotation.z = Math.PI / 3;
        log.rotation.y = a;
        log.castShadow = true;
        fireGroup.add(log);
    }
    const embers = new THREE.Mesh(
        new THREE.CircleGeometry(0.55, 12),
        new THREE.MeshStandardMaterial({
            color: 0xff3300,
            emissive: 0xff2200,
            emissiveIntensity: 3,
            roughness: 1,
        }),
    );
    embers.rotation.x = -Math.PI / 2;
    embers.position.y = 0.05;
    fireGroup.add(embers);

    const flame1 = new THREE.Mesh(
        new THREE.ConeGeometry(0.32, 1.0, 7),
        new THREE.MeshStandardMaterial({
            color: 0xff7722,
            emissive: 0xff4400,
            emissiveIntensity: 4,
            roughness: 1,
        }),
    );
    flame1.position.y = 0.55;
    fireGroup.add(flame1);

    const flame2 = new THREE.Mesh(
        new THREE.ConeGeometry(0.16, 0.6, 6),
        new THREE.MeshStandardMaterial({
            color: 0xffcc44,
            emissive: 0xffaa22,
            emissiveIntensity: 5,
            roughness: 1,
        }),
    );
    flame2.position.y = 0.85;
    fireGroup.add(flame2);

    scene.add(fireGroup);

    const fireLight = new THREE.PointLight(0xff7722, 20, 20);
    fireLight.position.set(firePos.x, firePos.y + 1.8, firePos.z);
    scene.add(fireLight);

    // ── Pickupable stones near the bonfire ───────────────────────────────────
    for (let i = 0; i < 5; i++) {
        const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.3, 0), stoneMat);
        const a = (i / 5) * Math.PI * 2;
        stone.position.set(firePos.x + Math.cos(a) * 2.6, 0.5, firePos.z + Math.sin(a) * 2.6);
        stone.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
        stone.castShadow = true;
        stone.userData.solid = true;
        stone.userData.dynamic = true;
        stone.userData.pickupable = true;
        stone.userData.mass = 2;
        stone.userData.colliderShape = 'cuboid';
        stone.userData.friction = 0.9;
        stone.userData.linearDamping = 1.2;
        stone.userData.angularDamping = 2.4;
        scene.add(stone);
        engine.registerPickup(stone, { throwForce: 14 });
    }

    // ── Dock and ocean ───────────────────────────────────────────────────────
    const dockMat = toonMat(0x7a5a38);
    // Brygge starter på stranden (x≈52) og strekker seg østover i havet
    const dockBaseX = 52;
    const dockEndX = 64;
    const dockLength = dockEndX - dockBaseX;
    const dockDeck = new THREE.Mesh(
        new THREE.BoxGeometry(dockLength, 0.14, 2.0),
        dockMat,
    );
    dockDeck.position.set((dockBaseX + dockEndX) / 2, 0.3, 5);
    dockDeck.userData.solid = true;
    dockDeck.castShadow = true;
    dockDeck.receiveShadow = true;
    scene.add(dockDeck);
    // Enkle tverrplanker for å gi bryggen struktur (visuelt, ikke solide)
    for (let i = 0; i < 14; i++) {
        const strip = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.02, 2.0),
            toonMat(0x5a4020),
        );
        strip.position.set(dockBaseX + 0.5 + i * (dockLength / 14), 0.38, 5);
        scene.add(strip);
    }
    for (let i = 0; i < 5; i++) {
        for (const dz of [-0.95, 0.95]) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 2.2, 7), dockMat);
            post.position.set(dockBaseX + 1 + i * 2.5, -0.2, 5 + dz);
            post.userData.solid = true;
            post.castShadow = true;
            scene.add(post);
        }
    }

    const ocean = new OceanSystem(scene, toonMat, {
        size: 180,
        segments: 64,
        color: 0x285a7a,
        center: [80, 0],
    });
    ocean.mesh.position.y = -1.1;

    const foam = new FoamSystem(scene, () => ({ x: dockEndX, y: -0.9, z: 5 }), 60);

    // Coastal rocks along the shoreline at x≈50 (landkant)
    for (let i = 0; i < 22; i++) {
        const z = -50 + i * 5 + (rng() - 0.5);
        if (Math.abs(z - 5) < 3.5) continue; // gi plass til bryggen
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.8 + rng() * 0.8, 0),
            stoneMat,
        );
        rock.position.set(48 + rng() * 2, -0.1 + rng() * 0.5, z);
        rock.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
        rock.castShadow = true;
        rock.userData.solid = true;
        scene.add(rock);
    }

    // Sailboat anchored beyond the dock
    const boatGroup = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.BoxGeometry(4, 0.7, 1.5), toonMat(0x5a3a20));
    hull.position.y = 0.35;
    hull.castShadow = true;
    boatGroup.add(hull);
    const hullInner = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.4, 1.0),
        toonMat(0x3a2510),
    );
    hullInner.position.y = 0.5;
    boatGroup.add(hullInner);
    const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.09, 3.8, 6),
        toonMat(0x4a2a10),
    );
    mast.position.y = 2.2;
    boatGroup.add(mast);
    const sailGeo = new THREE.PlaneGeometry(2.2, 2.2, 6, 6);
    const sailMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        side: THREE.DoubleSide,
        vertexShader: `
            uniform float uTime;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 p = position;
                float wave = sin(p.y * 3.0 + uTime * 2.2) * 0.08 + sin(p.x * 4.0 + uTime * 1.6) * 0.04;
                p.z += wave;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            void main() {
                vec3 base = vec3(0.92, 0.86, 0.72);
                float stripe = step(0.5, fract(vUv.x * 3.0));
                vec3 col = mix(base, vec3(0.78, 0.32, 0.22), stripe * 0.25);
                gl_FragColor = vec4(col, 1.0);
            }
        `,
    });
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.set(0, 2.2, 0);
    sail.rotation.y = Math.PI / 2;
    boatGroup.add(sail);
    const boatBaseY = -1.0;
    boatGroup.position.set(70, boatBaseY, 9);
    boatGroup.rotation.y = -0.4;
    scene.add(boatGroup);

    // ── Trees (engine handles wind shader + foliage) ─────────────────────────
    const buildingBounds = [
        { minX: -25, maxX: -11, minZ: -24, maxZ: -12 }, // kapell + buffer
        { minX: -2, maxX: 4, minZ: -11, maxZ: -5 }, // hemmelig kammer (Fase 6.1)
        { minX: -12, maxX: -4, minZ: -23, maxZ: -15 }, // steinring
        { minX: -7, maxX: -1, minZ: 1, maxZ: 7 }, // flaggstang
        { minX: -34, maxX: -22, minZ: 1, maxZ: 8 }, // PBR-galleri-vegg
    ];
    const insideAnyBuilding = (x: number, z: number) =>
        buildingBounds.some((b) => x >= b.minX && x <= b.maxX && z >= b.minZ && z <= b.maxZ);

    // Fase 5.3-demo: mange trær spredd utover for å vise LOD-systemet i aksjon.
    // Nære trær rendres med vind-shader, 25m+ bytter til simpler geometri,
    // 60m+ blir billboard-sprites. Chromebook-baseline (low-tier) culler
    // tidligere og aggressivt.
    let placed = 0;
    let attempts = 0;
    const TREE_TARGET = 500;
    const MAX_ATTEMPTS = TREE_TARGET * 4;
    while (placed < TREE_TARGET && attempts < MAX_ATTEMPTS) {
        attempts++;
        // Utvid området langt utover det opprinnelige så LOD-grensene passeres synlig.
        const x = -110 + rng() * 220;
        const z = -110 + rng() * 220;
        if (Math.hypot(x, z) < 8) continue;                    // hold spawn-området åpent
        if (x > -40 && x < 20 && z > -25 && z < 20 && insideAnyBuilding(x, z)) continue;
        const r = rng();
        const type = r > 0.4 ? 'pine' : r > 0.2 ? 'birch' : 'oak';
        engine.addTree([x, 0, z], type);
        placed++;
    }
    // Scattered accent trees (manuelt plasserte, unna bygninger og flaggstang)
    engine.addTree([7, 0, 13], 'birch');
    engine.addTree([-3, 0, 14], 'birch');
    engine.addTree([12, 0, -2], 'oak');
    engine.addTree([16, 0, 10], 'birch');
    engine.addTree([-11, 0, 6], 'oak');

    // ── Vegetation patches (grass, flowers, reeds) ───────────────────────────
    engine.addVegetationPatch({ minX: -10, maxX: 20, minZ: -6, maxZ: 16 }, 1.8, 'grass');
    engine.addVegetationPatch({ minX: -12, maxX: 12, minZ: -18, maxZ: -5 }, 1.2, 'grass');
    engine.addVegetationPatch({ minX: 3, maxX: 18, minZ: 2, maxZ: 14 }, 0.9, 'flowers');
    engine.addVegetationPatch({ minX: -8, maxX: 2, minZ: 10, maxZ: 20 }, 2.4, 'reeds');
    engine.addVegetationPatch({ minX: -35, maxX: -20, minZ: -10, maxZ: 10 }, 1.0, 'grass');
    engine.addVegetationPatch({ minX: -40, maxX: -22, minZ: -12, maxZ: 8 }, 1.4, 'heather');
    engine.addVegetationPatch({ minX: 8, maxX: 22, minZ: 12, maxZ: 28 }, 0.7, 'ferns');
    engine.addVegetationPatch({ minX: -8, maxX: 6, minZ: 6, maxZ: 18 }, 1.0, 'wildflowers');

    // ── Fauna ────────────────────────────────────────────────────────────────
    engine.addBirdFlock([0, 0, 0], { altitude: 22, radius: 18 });
    engine.addBirdFlock([-25, 0, -10], { altitude: 30, radius: 12 });
    engine.addButterfly([10, 0, 8], { radius: 5 });
    engine.addButterfly([3, 0, 14], { color: 0xffaadd });
    engine.addAnimalGroup('sheep', { minX: -5, maxX: 22, minZ: 5, maxZ: 28 });
    engine.addAnimalGroup('cow', { minX: 15, maxX: 45, minZ: -18, maxZ: 10 }, { count: 3 });

    // ── Bench + flagpole at spawn ────────────────────────────────────────────
    const bench = new THREE.Group();
    const seat = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.12, 0.5), toonMat(0x6a4828));
    seat.position.y = 0.5;
    seat.castShadow = true;
    seat.userData.solid = true;
    bench.add(seat);
    for (const lx of [-0.9, 0.9]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, 0.5), toonMat(0x6a4828));
        leg.position.set(lx, 0.25, 0);
        bench.add(leg);
    }
    bench.position.set(4, 0, 5);
    bench.rotation.y = -0.5;
    scene.add(bench);

    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 6, 8),
        toonMat(0x4a3820),
    );
    pole.position.set(-4, 3, 4);
    pole.userData.solid = true;
    pole.castShadow = true;
    scene.add(pole);

    const bannerGeo = new THREE.PlaneGeometry(1.6, 1.0, 14, 6);
    const bannerMat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        side: THREE.DoubleSide,
        vertexShader: `
            uniform float uTime;
            varying vec2 vUv;
            void main() {
                vUv = uv;
                vec3 p = position;
                float anchor = smoothstep(0.0, 0.9, (p.x + 0.8) / 1.6);
                float wave = sin(p.x * 4.0 + uTime * 3.0) * 0.12
                           + sin(p.y * 5.0 + uTime * 2.2) * 0.04;
                p.z += wave * anchor;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            void main() {
                vec3 top = vec3(0.88, 0.22, 0.18);
                vec3 bot = vec3(0.95, 0.62, 0.25);
                vec3 c = mix(bot, top, vUv.y);
                float stripe = step(0.5, fract(vUv.x * 4.0));
                c = mix(c, c * 0.78, stripe * 0.35);
                gl_FragColor = vec4(c, 1.0);
            }
        `,
    });
    const banner = new THREE.Mesh(bannerGeo, bannerMat);
    banner.position.set(-3.2, 4.8, 4);
    scene.add(banner);

    // ── Mountains in the distance (skybox-like parallax) ─────────────────────
    const mountainMat = new THREE.MeshStandardMaterial({
        color: 0x5a6a7a,
        roughness: 1,
        metalness: 0,
        flatShading: true,
    });
    const peaks: [number, number, number][] = [
        [-60, 0, -60], [-40, 0, -65], [-20, 0, -70], [0, 0, -72], [20, 0, -68], [-70, 0, -30],
        [-75, 0, 0], [-70, 0, 30],
    ];
    for (const [px, , pz] of peaks) {
        const h = 14 + rng() * 10;
        const peak = new THREE.Mesh(new THREE.ConeGeometry(8 + rng() * 4, h, 5), mountainMat);
        peak.position.set(px + (rng() - 0.5) * 6, h / 2 - 1, pz + (rng() - 0.5) * 6);
        peak.rotation.y = rng() * Math.PI;
        peak.castShadow = false;
        scene.add(peak);
    }

    // ────────────────────────────────────────────────────────────────────────
    // ── Fase 6.1: Hemmelig kammer ved siden av kapellet ──────────────────────
    // ────────────────────────────────────────────────────────────────────────
    // Et lite stenkammer på bakkenivå, attached til kapellets østre side. Speil
    // bruker IBL fra SkySystem; en spotlight gjennom takvinduet gir shader-
    // basert volumetrisk-kjegle. Døren mot vest er solid og låses opp ved at
    // spilleren plasserer 3 runesteiner på alteret (cellar_unlocked-flagget).

    // Plassering: åpen plass nord-øst for steinringen, vest for bålet.
    // Klar av stone-ring (sentrum -8,-19 radius 3.2), chapel (sentrum -18,-18),
    // bål (10,-10) og spawn-området.
    const chamberCx = 1;
    const chamberCz = -8;
    const chamberW = 5;
    const chamberD = 4;
    const chamberWallH = 3.2;

    const chamber = buildRoom(scene, toonMat, {
        id: 'kammer',
        center: [chamberCx, chamberCz],
        size: [chamberW, chamberD],
        wallHeight: chamberWallH,
        floorColor: 0x4a3a28,
        wallColor: 0x6a5840,
        roofColor: 0x2a1a10,
        hasRoof: true,
        openings: [{ side: 'W', offset: 0, width: 1.6 }],
    });
    const chamberBounds = chamber.innerBounds;
    const chamberRoofInner = chamber.roof; // standard tak (synlig kun innenfra) - dollhouse-toggle

    // Saltak utenpå (synlig fra utsiden) - skjuler standard-taket fra utsiden.
    if (chamberRoofInner) chamberRoofInner.visible = true; // beholdes; dollhouse skjuler det
    const chamberRoofMat = new THREE.MeshStandardMaterial({
        color: 0x2a1a10,
        roughness: 0.95,
        metalness: 0,
        side: THREE.DoubleSide,
    });
    const chamberRoofOver = 0.4;
    const chamberRoofGeo = new THREE.BoxGeometry(
        chamberW + 2 * chamberRoofOver,
        0.18,
        chamberD + 2 * chamberRoofOver,
    );
    const chamberOuterRoof = new THREE.Mesh(chamberRoofGeo, chamberRoofMat);
    chamberOuterRoof.position.set(chamberCx, chamberWallH + 0.09, chamberCz);
    chamberOuterRoof.castShadow = true;
    chamberOuterRoof.receiveShadow = true;
    scene.add(chamberOuterRoof);

    // Vindu i taket (lysbrønn). Bare visuelt - ingen fysisk åpning.
    const chamberWindowMat = new THREE.MeshStandardMaterial({
        color: 0xfff4cc,
        emissive: 0xfff0a0,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.55,
    });
    const chamberWindow = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 0.8),
        chamberWindowMat,
    );
    chamberWindow.rotation.x = Math.PI / 2;
    chamberWindow.position.set(chamberCx + 1.0, chamberWallH + 0.2, chamberCz);
    scene.add(chamberWindow);

    // Spotlight gjennom vinduet med shader-kjegle (visuell volumetrisk effekt)
    const chamberSpot = buildHangingLight(scene, {
        id: 'chamber-spot',
        position: [chamberCx + 1.0, chamberWallH - 0.05, chamberCz],
        color: 0xfff0c0,
        intensity: 18,
        distance: 5.5,
        angle: 0.45,
        penumbra: 0.6,
        coneHeight: 2.8,
        coneOpacity: 0.22,
        animation: 'steady',
    });
    engine.registerAnimatedLight(chamberSpot.light, 'steady', chamberSpot.light.intensity);

    // Speil på kammerets østvegg - bruker IBL fra SkySystem (Fase 2.4) gratis.
    const mirrorMat = new THREE.MeshStandardMaterial({
        color: 0xeaeaf2,
        metalness: 1.0,
        roughness: 0.05,
        envMapIntensity: 1.6,
    });
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.9), mirrorMat);
    mirror.position.set(chamberBounds.maxX - 0.05, 1.6, chamberCz);
    mirror.rotation.y = -Math.PI / 2;
    scene.add(mirror);

    // Speilramme
    const frameMat = sceneMat(0x5a3a18, { preset: 'wood' });
    const mirrorFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 2.15, 1.7),
        frameMat,
    );
    mirrorFrame.position.set(chamberBounds.maxX, 1.6, chamberCz);
    scene.add(mirrorFrame);

    // Skattekiste midt i rommet (visuelt mål for utforskning)
    const chest = new THREE.Group();
    const chestBase = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.5, 0.7),
        sceneMat(0x6a3a18, { preset: 'wood' }),
    );
    chestBase.position.y = 0.25;
    chestBase.castShadow = true;
    chestBase.receiveShadow = true;
    chest.add(chestBase);
    const chestLid = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.18, 0.7),
        sceneMat(0x4a2a10, { preset: 'wood' }),
    );
    chestLid.position.y = 0.6;
    chest.add(chestLid);
    const chestGlow = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.05, 0.55),
        new THREE.MeshStandardMaterial({
            color: 0xffd070,
            emissive: 0xffaa30,
            emissiveIntensity: 4.0,
        }),
    );
    chestGlow.position.y = 0.7;
    chest.add(chestGlow);
    chest.position.set(chamberCx - 1.5, 0, chamberCz);
    scene.add(chest);

    // Kammerdør - blokkerer vest-åpningen til quest fullføres. Solid + visuell.
    const doorMat = sceneMat(0x3a2818, { preset: 'wood' });
    const chamberDoor = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 2.2, 1.6),
        doorMat,
    );
    chamberDoor.position.set(chamberBounds.minX, 1.1, chamberCz);
    chamberDoor.userData.solid = true;
    chamberDoor.castShadow = true;
    chamberDoor.receiveShadow = true;
    scene.add(chamberDoor);

    // Dørhåndtak (visuelt) - lite barn av døren
    const handleMat = sceneMat(0xaa8844, { preset: 'metal' });
    const handle = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), handleMat);
    handle.position.set(-0.12, 0.0, 0.55);
    chamberDoor.add(handle);

    // ────────────────────────────────────────────────────────────────────────
    // ── Fase 6.2: PBR-galleri (material-variasjonsvegg) ──────────────────────
    // ────────────────────────────────────────────────────────────────────────
    // Seks paneler med ulike preset-materialer + normal/roughness/AO-maps fra
    // engine.getTexture. Demonstrerer PBR-pipelinen (Fase 2.1) i én blikk.

    const galleryX = -28;
    const galleryZ = 5;
    // Bakvegg
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
    const panelH = 1.5;
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
        const panel = new THREE.Mesh(
            new THREE.PlaneGeometry(panelW, panelH),
            panelMat,
        );
        panel.position.set(px, 1.9, galleryZ - 0.16);
        panel.castShadow = false;
        panel.receiveShadow = true;
        scene.add(panel);

        const label = makeLabelSprite(p.label);
        label.position.set(px, 0.9, galleryZ - 0.18);
        scene.add(label);
    });

    // ────────────────────────────────────────────────────────────────────────
    // ── Fase 6.3: Tre runesteiner (quest-collectibles) ──────────────────────
    // ────────────────────────────────────────────────────────────────────────

    type RuneSpec = { pos: [number, number, number]; flag: string };
    const runeSpecs: RuneSpec[] = [
        { pos: [-7.5, 0.6, -19.5], flag: 'rune_circle_picked' }, // i steinringen
        { pos: [10, 0.6, -8], flag: 'rune_fire_picked' },         // ved bålet
        { pos: [-30, 0.6, 0], flag: 'rune_forest_picked' },       // i skogen
    ];
    const runeMat = new THREE.MeshStandardMaterial({
        color: 0x8a7a5a,
        emissive: 0x4a3a18,
        emissiveIntensity: 0.6,
        roughness: 0.45,
        metalness: 0.15,
    });
    const runeRings: { mesh: THREE.Mesh; baseY: number; phase: number }[] = [];
    for (const spec of runeSpecs) {
        const rune = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.6, 0.2), runeMat);
        rune.position.set(...spec.pos);
        rune.castShadow = true;
        rune.userData.solid = true;
        rune.userData.dynamic = true;
        rune.userData.pickupable = true;
        rune.userData.mass = 1;
        rune.userData.colliderShape = 'cuboid';
        rune.userData.linearDamping = 1.5;
        rune.userData.angularDamping = 2.4;
        scene.add(rune);

        // Liten gul ring over runesteinen så den er lett å se
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.5, 0.04, 8, 16),
            new THREE.MeshStandardMaterial({
                color: 0xffeb88,
                emissive: 0xffd866,
                emissiveIntensity: 2.5,
            }),
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(spec.pos[0], spec.pos[1] + 0.7, spec.pos[2]);
        scene.add(ring);
        const ringEntry = { mesh: ring, baseY: ring.position.y, phase: Math.random() * Math.PI * 2 };
        runeRings.push(ringEntry);

        const localFlag = spec.flag;
        engine.registerPickup(rune, {
            toInventory: { itemId: 'runestone', count: 1 },
            onPickup: () => {
                engine.setFlag(localFlag, true);
                ring.removeFromParent();
                const idx = runeRings.indexOf(ringEntry);
                if (idx >= 0) runeRings.splice(idx, 1);
            },
        });
    }

    // ────────────────────────────────────────────────────────────────────────
    // ── Fase 6.3: Alter-trigger (auto-deliver når 3 runesteiner i inventar) ─
    // ────────────────────────────────────────────────────────────────────────

    const alterPos = altar.position.clone();
    let cellarDoorOpenAnim = 0; // 0 = lukket, 1 = helt åpen

    // ── Dialog actions: wire weather + time-of-day controls ──────────────────
    const weather = config.dialogs.weather_menu;
    if (weather && !Array.isArray(weather)) {
        weather.choices[0].action = () => engine.setWeather({ type: 'clear', intensity: 0 });
        weather.choices[1].action = () => engine.setWeather({ type: 'rain', intensity: 0.5 });
        weather.choices[2].action = () => engine.setWeather({ type: 'rain', intensity: 1 });
        weather.choices[3].action = () => engine.setWeather({ type: 'snow', intensity: 0.7 });
        weather.choices[4].action = () => engine.setWeather({ type: 'fog', intensity: 0.85 });
    }
    const tod = config.dialogs.time_menu;
    if (tod && !Array.isArray(tod)) {
        tod.choices[0].action = () => engine.setTimeOfDay(0.24);
        tod.choices[1].action = () => engine.setTimeOfDay(0.5);
        tod.choices[2].action = () => engine.setTimeOfDay(0.62);
        tod.choices[3].action = () => engine.setTimeOfDay(0.78);
        tod.choices[4].action = () => engine.setTimeOfDay(0.03);
    }

    // ── Hide chapel roof when player is inside (dollhouse) ───────────────────
    const chapelBounds = chapel.innerBounds;
    const chapelRoof = chapel.roof;

    // Bloom boost makes chapel interior glow beautifully
    engine.setBloom(0.55);

    // ── Per-frame updates ────────────────────────────────────────────────────
    scene.userData._customUpdate = (dt: number, elapsed: number) => {
        ocean.update(dt);
        foam.update(dt);

        bannerMat.uniforms.uTime.value = elapsed;
        sailMat.uniforms.uTime.value = elapsed;

        const tilt = ocean.getWaveTilt(boatGroup.position.x, boatGroup.position.z);
        boatGroup.rotation.x = tilt.pitch * 0.4;
        boatGroup.rotation.z = -0.4 + tilt.roll * 0.4;
        boatGroup.position.y = boatBaseY + tilt.height * 0.5;

        const f1 = Math.sin(elapsed * 6.1) * 0.5 + 0.5;
        const f2 = Math.sin(elapsed * 4.3 + 1) * 0.5 + 0.5;
        flame1.scale.set(0.85 + f1 * 0.3, 0.8 + f1 * 0.35, 0.85 + f1 * 0.3);
        flame2.scale.set(0.7 + f2 * 0.4, 0.6 + f2 * 0.45, 0.7 + f2 * 0.4);
        flame1.position.y = 0.55 + f1 * 0.14;
        flame2.position.y = 0.85 + f2 * 0.15;
        fireLight.intensity = 14 + f1 * 10;

        candleFlame.scale.setScalar(0.85 + Math.sin(elapsed * 12) * 0.2);

        for (const ref of hangingLightRefs) ref.update(dt, elapsed);

        const playerPos = engine.getPlayerPosition();
        if (chapelRoof) {
            const insideChapel =
                playerPos.x >= chapelBounds.minX &&
                playerPos.x <= chapelBounds.maxX &&
                playerPos.z >= chapelBounds.minZ &&
                playerPos.z <= chapelBounds.maxZ;
            chapelRoof.visible = !insideChapel;
        }

        // Dollhouse for kammeret (skjul både inner-tak og ytter-tak når spilleren er inne)
        const insideChamber =
            playerPos.x >= chamberBounds.minX &&
            playerPos.x <= chamberBounds.maxX &&
            playerPos.z >= chamberBounds.minZ &&
            playerPos.z <= chamberBounds.maxZ;
        if (chamberRoofInner) chamberRoofInner.visible = !insideChamber;
        chamberOuterRoof.visible = !insideChamber;

        // Alter-trigger: auto-deliver når spilleren er nær alteret med 3 steiner
        if (
            !engine.getFlag('runes_delivered') &&
            engine.itemCount('runestone') >= 3
        ) {
            const dx = playerPos.x - alterPos.x;
            const dz = playerPos.z - alterPos.z;
            if (Math.hypot(dx, dz) < 2.0) {
                engine.removeItem('runestone', 3);
                engine.setFlag('runes_delivered', true);
                engine.completeObjective('q_deliver', 'o_alter');
                engine.playMonolog('m_alter_delivered');
            }
        }

        // Kammerdør: roter åpen + fjern collider når cellar_unlocked er truthy
        if (engine.getFlag('cellar_unlocked') && cellarDoorOpenAnim < 1) {
            if (cellarDoorOpenAnim === 0) {
                // Første frame etter unlock: fjern fysisk collider
                engine.removeStaticCollider(chamberDoor);
            }
            cellarDoorOpenAnim = Math.min(1, cellarDoorOpenAnim + dt * 0.6);
            // Glid døren nedover i bakken (enkel "lukket → åpen"-anim)
            chamberDoor.position.y = 1.1 - cellarDoorOpenAnim * 2.4;
            if (cellarDoorOpenAnim >= 1) {
                chamberDoor.visible = false;
            }
        }

        // Animer rune-ringene (de som ennå ikke er plukket)
        for (const r of runeRings) {
            r.mesh.position.y = r.baseY + Math.sin(elapsed * 1.8 + r.phase) * 0.08;
            r.mesh.rotation.z = elapsed * 0.6;
        }
    };
}
