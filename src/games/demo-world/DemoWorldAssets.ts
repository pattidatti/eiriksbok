import * as THREE from 'three';
import type { GameEngineRef } from '../engine/types';
import { buildRoom } from '../engine/systems/RoomSystem';
import { buildHangingLight, type HangingLightRef } from '../engine/LightBuilder';
import { OceanSystem, FoamSystem } from '../engine/systems/OceanSystem';

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

    // ── Ground (solid base for physics + grass) ──────────────────────────────
    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(110, 1, 110),
        new THREE.MeshStandardMaterial({ color: 0x3e6b2a, roughness: 0.95, metalness: 0 }),
    );
    ground.position.set(-5, -0.5, -5);
    ground.receiveShadow = true;
    ground.userData.solid = true;
    scene.add(ground);

    // Sandy beach transitioning to ocean east of the land
    const beach = new THREE.Mesh(
        new THREE.BoxGeometry(16, 0.9, 100),
        new THREE.MeshStandardMaterial({ color: 0xd9c88a, roughness: 1, metalness: 0 }),
    );
    beach.position.set(30, -0.55, -5);
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
    addPath([[2, 2], [12, 4], [22, 5]]);

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
        stone.userData.colliderShape = 'sphere';
        scene.add(stone);
        engine.registerPickup(stone, { throwForce: 14 });
    }

    // ── Dock and ocean ───────────────────────────────────────────────────────
    const dockMat = toonMat(0x7a5a38);
    for (let i = 0; i < 12; i++) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.12, 0.42), dockMat);
        plank.position.set(24 + i * 0.5, 0.28, 5);
        plank.userData.solid = true;
        plank.castShadow = true;
        plank.receiveShadow = true;
        scene.add(plank);
    }
    for (let i = 0; i < 4; i++) {
        for (const dz of [-0.9, 0.9]) {
            const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 1.8, 7), dockMat);
            post.position.set(24.5 + i * 1.8, 0, 5 + dz);
            post.userData.solid = true;
            post.castShadow = true;
            scene.add(post);
        }
    }

    const ocean = new OceanSystem(scene, toonMat, {
        size: 280,
        segments: 72,
        color: 0x285a7a,
        center: [90, 0],
    });
    ocean.mesh.position.y = -0.45;

    const foam = new FoamSystem(scene, () => ({ x: 30, y: -0.3, z: 5 }), 60);

    // Coastal rocks hide the land/ocean seam
    for (let i = 0; i < 22; i++) {
        const z = -50 + i * 5 + (rng() - 0.5);
        if (Math.abs(z - 5) < 3.5) continue;
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.8 + rng() * 0.8, 0),
            stoneMat,
        );
        rock.position.set(22 + rng() * 2, -0.1 + rng() * 0.5, z);
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
    const boatBaseY = -0.35;
    boatGroup.position.set(36, boatBaseY, 9);
    boatGroup.rotation.y = -0.4;
    scene.add(boatGroup);

    // ── Trees (engine handles wind shader + foliage) ─────────────────────────
    for (let i = 0; i < 26; i++) {
        const x = -36 + rng() * 22;
        const z = -24 + rng() * 38;
        if (Math.hypot(x, z) < 8) continue;
        const r = rng();
        const type = r > 0.4 ? 'pine' : r > 0.2 ? 'birch' : 'oak';
        engine.addTree([x, 0, z], type);
    }
    // Scattered accent trees
    engine.addTree([7, 0, 13], 'birch');
    engine.addTree([-3, 0, 14], 'birch');
    engine.addTree([12, 0, -2], 'oak');
    engine.addTree([16, 0, 10], 'birch');
    engine.addTree([-4, 0, 5], 'oak');

    // ── Vegetation patches (grass, flowers, reeds) ───────────────────────────
    engine.addVegetationPatch({ minX: -10, maxX: 20, minZ: -6, maxZ: 16 }, 1.8, 'grass');
    engine.addVegetationPatch({ minX: -12, maxX: 12, minZ: -18, maxZ: -5 }, 1.2, 'grass');
    engine.addVegetationPatch({ minX: 3, maxX: 18, minZ: 2, maxZ: 14 }, 0.9, 'flowers');
    engine.addVegetationPatch({ minX: -8, maxX: 2, minZ: 10, maxZ: 20 }, 2.4, 'reeds');
    engine.addVegetationPatch({ minX: -35, maxX: -20, minZ: -10, maxZ: 10 }, 1.0, 'grass');

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

    // ── Dialog actions: wire weather + time-of-day controls ──────────────────
    const weather = config.dialogs.weather_menu;
    if (weather) {
        weather.choices[0].action = () => engine.setWeather({ type: 'clear', intensity: 0 });
        weather.choices[1].action = () => engine.setWeather({ type: 'rain', intensity: 0.5 });
        weather.choices[2].action = () => engine.setWeather({ type: 'rain', intensity: 1 });
        weather.choices[3].action = () => engine.setWeather({ type: 'snow', intensity: 0.7 });
        weather.choices[4].action = () => engine.setWeather({ type: 'fog', intensity: 0.85 });
    }
    const tod = config.dialogs.time_menu;
    if (tod) {
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

        if (chapelRoof) {
            const p = engine.getPlayerPosition();
            const inside =
                p.x >= chapelBounds.minX &&
                p.x <= chapelBounds.maxX &&
                p.z >= chapelBounds.minZ &&
                p.z <= chapelBounds.maxZ;
            chapelRoof.visible = !inside;
        }
    };
}
