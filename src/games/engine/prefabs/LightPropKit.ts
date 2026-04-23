import * as THREE from 'three';
import type { GameEngineRef } from '../types';

// Felles hjelpefunksjon for emissive flamme-materiale
function flameMat(color: number, emissive: number, emissiveIntensity: number): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({ color, emissive, emissiveIntensity, roughness: 1, metalness: 0 });
}

// ── Campfire ─────────────────────────────────────────────────────────────────

export function campfire(engine: GameEngineRef): { group: THREE.Group } {
    const { scene, toonMat } = engine;
    const g = new THREE.Group();
    scene.add(g);

    const stoneMat = toonMat(0x6a6060);

    // Steinring
    for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const r = 1.0 + (Math.random() - 0.5) * 0.08;
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.1, 0),
            stoneMat,
        );
        rock.position.set(Math.cos(a) * r, 0.15, Math.sin(a) * r);
        rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        rock.castShadow = true;
        g.add(rock);
    }

    // Vedstokker
    const logMat = toonMat(0x4a2e12);
    for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.13, 1.05, 7), logMat);
        log.position.set(Math.cos(a) * 0.22, 0.18, Math.sin(a) * 0.22);
        log.rotation.z = Math.PI / 3;
        log.rotation.y = a;
        log.castShadow = true;
        g.add(log);
    }

    // Glor
    const embers = new THREE.Mesh(
        new THREE.CircleGeometry(0.5, 12),
        new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff1100, emissiveIntensity: 4, roughness: 1 }),
    );
    embers.rotation.x = -Math.PI / 2;
    embers.position.y = 0.03;
    g.add(embers);

    // Flammer
    const flame1 = new THREE.Mesh(new THREE.ConeGeometry(0.3, 1.0, 7), flameMat(0xff7722, 0xff4400, 4));
    flame1.position.y = 0.55;
    g.add(flame1);

    const flame2 = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.62, 6), flameMat(0xffcc44, 0xffaa22, 5));
    flame2.position.y = 0.86;
    g.add(flame2);

    // Lys
    const light = new THREE.PointLight(0xff7722, 20, 22, 1.5);
    light.position.set(g.position.x, g.position.y + 1.8, g.position.z);
    light.castShadow = true;
    light.shadow.mapSize.set(512, 512);
    scene.add(light);

    // Synkroniser flamme + lys i same callback
    engine.registerUpdate((_dt, elapsed) => {
        const f1 = Math.sin(elapsed * 6.1) * 0.5 + 0.5;
        const f2 = Math.sin(elapsed * 4.3 + 1.2) * 0.5 + 0.5;
        flame1.scale.set(0.85 + f1 * 0.28, 0.82 + f1 * 0.32, 0.85 + f1 * 0.28);
        flame2.scale.set(0.72 + f2 * 0.38, 0.64 + f2 * 0.42, 0.72 + f2 * 0.38);
        flame1.position.y = 0.55 + f1 * 0.12;
        flame2.position.y = 0.86 + f2 * 0.14;
        light.intensity = 14 + f1 * 10;
        // Flytt lyset til world-posisjonen av gruppen
        g.getWorldPosition(light.position);
        light.position.y += 1.8;
    });

    return { group: g };
}

// ── Wall Torch ───────────────────────────────────────────────────────────────

export function wallTorch(engine: GameEngineRef): { group: THREE.Group } {
    const { scene, toonMat } = engine;
    const g = new THREE.Group();
    scene.add(g);

    const ironMat = toonMat(0x2e2e2e);

    // Brakett (montert mot vegg)
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.28), ironMat);
    bracket.position.z = -0.1;
    g.add(bracket);

    // Arm
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.28), ironMat);
    arm.position.z = 0.08;
    g.add(arm);

    // Kopp
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.1, 10), ironMat);
    cup.position.set(0, -0.04, 0.24);
    g.add(cup);

    // Fakkel-skaft
    const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.04, 0.28, 8),
        toonMat(0x4a3010),
    );
    shaft.position.set(0, 0.2, 0.24);
    g.add(shaft);

    // Flamme
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.24, 7), flameMat(0xff8844, 0xff5522, 4));
    flame.position.set(0, 0.48, 0.24);
    g.add(flame);

    const innerFlame = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.14, 6), flameMat(0xffee44, 0xffcc22, 5));
    innerFlame.position.set(0, 0.52, 0.24);
    g.add(innerFlame);

    const light = new THREE.PointLight(0xff8844, 8, 7, 1.8);
    scene.add(light);

    engine.registerUpdate((_dt, elapsed) => {
        const f = Math.sin(elapsed * 8.3) * 0.5 + 0.5;
        flame.scale.set(0.8 + f * 0.3, 0.78 + f * 0.35, 0.8 + f * 0.3);
        innerFlame.scale.setScalar(0.7 + f * 0.45);
        light.intensity = 6 + f * 5;
        g.getWorldPosition(light.position);
        light.position.y += 0.5;
        light.position.z += 0.3;
    });

    return { group: g };
}

// ── Brazier ──────────────────────────────────────────────────────────────────

export function brazier(engine: GameEngineRef): { group: THREE.Group } {
    const { scene, toonMat } = engine;
    const g = new THREE.Group();
    scene.add(g);

    const ironMat = toonMat(0x2e2e2e);

    // Ben
    for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1.1, 7), ironMat);
        leg.position.set(Math.cos(a) * 0.28, 0.35, Math.sin(a) * 0.28);
        leg.rotation.z = Math.cos(a) * 0.16;
        leg.rotation.x = Math.sin(a) * 0.16;
        leg.castShadow = true;
        g.add(leg);
    }

    // Kum
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.22, 0.28, 14), ironMat);
    bowl.position.y = 0.95;
    bowl.castShadow = true;
    g.add(bowl);

    // Glor
    const embers = new THREE.Mesh(
        new THREE.CircleGeometry(0.28, 12),
        new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff1100, emissiveIntensity: 4, roughness: 1 }),
    );
    embers.rotation.x = -Math.PI / 2;
    embers.position.y = 1.1;
    g.add(embers);

    // Flammer
    const flame1 = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.65, 7), flameMat(0xff6622, 0xff3300, 4));
    flame1.position.y = 1.45;
    g.add(flame1);

    const flame2 = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.38, 6), flameMat(0xffcc44, 0xffaa22, 5));
    flame2.position.y = 1.62;
    g.add(flame2);

    const light = new THREE.PointLight(0xff6622, 12, 9, 1.8);
    light.castShadow = true;
    light.shadow.mapSize.set(512, 512);
    scene.add(light);

    engine.registerUpdate((_dt, elapsed) => {
        const f1 = Math.sin(elapsed * 5.8) * 0.5 + 0.5;
        const f2 = Math.sin(elapsed * 7.2 + 0.8) * 0.5 + 0.5;
        flame1.scale.set(0.82 + f1 * 0.3, 0.78 + f1 * 0.36, 0.82 + f1 * 0.3);
        flame2.scale.set(0.68 + f2 * 0.42, 0.62 + f2 * 0.48, 0.68 + f2 * 0.42);
        light.intensity = 9 + f1 * 7;
        g.getWorldPosition(light.position);
        light.position.y += 1.6;
    });

    return { group: g };
}

// ── Candle ───────────────────────────────────────────────────────────────────

export function candle(engine: GameEngineRef): { group: THREE.Group } {
    const { scene, toonMat } = engine;
    const g = new THREE.Group();
    scene.add(g);

    // Vokslys
    const wax = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.042, 0.22, 8),
        toonMat(0xf0e8d0),
    );
    wax.position.y = 0.11;
    wax.castShadow = true;
    g.add(wax);

    // Smeltet topp (litt smalere ring)
    const melt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.044, 0.044, 0.022, 8),
        toonMat(0xe8ddc4),
    );
    melt.position.y = 0.23;
    g.add(melt);

    // Flamme
    const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 6, 6),
        new THREE.MeshStandardMaterial({ color: 0xffee88, emissive: 0xffcc44, emissiveIntensity: 5, roughness: 1 }),
    );
    flame.scale.set(1, 1.6, 1);
    flame.position.y = 0.3;
    g.add(flame);

    const light = new THREE.PointLight(0xffaa44, 3.5, 4.5, 2);
    scene.add(light);

    engine.registerAnimatedLight(light, 'flicker-soft', 3.5);

    engine.registerUpdate((_dt, elapsed) => {
        flame.scale.set(
            0.85 + Math.sin(elapsed * 11) * 0.18,
            1.4 + Math.sin(elapsed * 9.3) * 0.3,
            0.85 + Math.sin(elapsed * 11) * 0.18,
        );
        g.getWorldPosition(light.position);
        light.position.y += 0.32;
    });

    return { group: g };
}
