import * as THREE from 'three';
import type { GameEngineRef } from '../engine/types';

// ─── Steam Engine Assembly ────────────────────────────────────────────────────

function buildBoiler(
    toonMat: GameEngineRef['toonMat']
): THREE.Group {
    const g = new THREE.Group();

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.3, 20), toonMat(0xb87333));
    body.position.y = 0.75; body.castShadow = true; g.add(body);

    for (const by of [0.3, 0.75, 1.2]) {
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.72, 0.05, 8, 24), toonMat(0x2a2a2a));
        band.rotation.x = Math.PI / 2; band.position.y = by; g.add(band);
    }

    const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.7, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        toonMat(0xb87333)
    );
    dome.position.y = 1.4; g.add(dome);

    for (let i = 0; i < 8; i++) {
        const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 6), toonMat(0x8a6030));
        const a = (i / 8) * Math.PI * 2;
        rivet.position.set(Math.cos(a) * 0.65, 1.42, Math.sin(a) * 0.65);
        g.add(rivet);
    }

    const firebox = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.3, 0.1),
        new THREE.MeshBasicMaterial({ color: 0xff5520 })
    );
    firebox.position.set(0, 0.25, 0.7); g.add(firebox);
    g.userData.firebox = firebox;

    // Pressure gauge
    const gaugeBack = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.06, 16), toonMat(0xddaa55));
    gaugeBack.rotation.x = Math.PI / 2; gaugeBack.position.set(0.4, 1.2, 0.68); g.add(gaugeBack);
    const gaugeFace = new THREE.Mesh(
        new THREE.CircleGeometry(0.11, 16),
        new THREE.MeshBasicMaterial({ color: 0xf4e4c1 })
    );
    gaugeFace.position.set(0.4, 1.2, 0.72); g.add(gaugeFace);
    const gaugeNeedle = new THREE.Mesh(
        new THREE.BoxGeometry(0.01, 0.09, 0.01),
        new THREE.MeshBasicMaterial({ color: 0xaa0000 })
    );
    gaugeNeedle.position.set(0.4, 1.24, 0.73); g.add(gaugeNeedle);
    g.userData.gaugeNeedle = gaugeNeedle;

    return g;
}

function buildCylinder(toonMat: GameEngineRef['toonMat']): {
    group: THREE.Group;
    pistonRod: THREE.Mesh;
    beamGroup: THREE.Group;
    steamPipe: THREE.Mesh;
} {
    const group = new THREE.Group();

    const cylMain = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 1.3, 20), toonMat(0x8b6f47));
    cylMain.position.y = 0.9; cylMain.castShadow = true; group.add(cylMain);

    for (const [r, y] of [[0.35, 1.6], [0.35, 0.2]] as [number, number][]) {
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.1, 20), toonMat(0x5a3a1a));
        cap.position.y = y; group.add(cap);
    }

    const pistonRod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.2, 12), toonMat(0xddddee));
    pistonRod.position.y = 2.2; group.add(pistonRod);

    const steamPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 12), toonMat(0x886644));
    steamPipe.rotation.z = Math.PI / 2;
    steamPipe.position.set(-0.6, 1.5, 0);

    // Walking beam
    const beamGroup = new THREE.Group();
    beamGroup.position.set(0, 3.3, 0);

    beamGroup.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.18, 0.3), toonMat(0x5a3a1a)));
    for (const ex of [-1.6, 1.6]) {
        const cap = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.35, 0.4), toonMat(0x3a2515));
        cap.position.x = ex; beamGroup.add(cap);
    }
    const connectRod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), toonMat(0xddddee));
    connectRod.position.set(-1.5, -0.35, 0); beamGroup.add(connectRod);

    return { group, pistonRod, beamGroup, steamPipe };
}

function buildCondenser(toonMat: GameEngineRef['toonMat']): {
    group: THREE.Group;
    flywheelGroup: THREE.Group;
    steamPipe: THREE.Mesh;
} {
    const group = new THREE.Group();

    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.1, 16), toonMat(0xc89060));
    body.position.y = 0.65; body.castShadow = true; group.add(body);

    const jacket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 1.0, 16),
        new THREE.MeshStandardMaterial({ color: 0x4477aa, transparent: true, opacity: 0.55, roughness: 0.1, metalness: 0.1 })
    );
    jacket.position.y = 0.65; group.add(jacket);

    for (const by of [0.25, 0.95]) {
        const band = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.04, 8, 24), toonMat(0x2a2a2a));
        band.rotation.x = Math.PI / 2; band.position.y = by; group.add(band);
    }

    const dripPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), toonMat(0x886644));
    dripPipe.position.set(0, 0.05, 0.3); group.add(dripPipe);

    // Flywheel
    const flywheelGroup = new THREE.Group();
    flywheelGroup.position.set(0, 2, 0);

    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.12, 12, 32), toonMat(0x3a3a3a));
    rim.rotation.y = Math.PI / 2; flywheelGroup.add(rim);

    for (let i = 0; i < 6; i++) {
        const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.35, 0.08), toonMat(0x5a5a5a));
        spoke.rotation.z = (i / 6) * Math.PI * 2; flywheelGroup.add(spoke);
    }

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3, 12), toonMat(0x2a2a2a));
    hub.rotation.set(0, 0, Math.PI / 2); flywheelGroup.add(hub);

    const steamPipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.5, 12), toonMat(0x886644));
    steamPipe.rotation.z = Math.PI / 2;
    steamPipe.position.set(-0.75, 1.2, 0);

    return { group, flywheelGroup, steamPipe };
}

function buildForge(toonMat: GameEngineRef['toonMat']): {
    group: THREE.Group;
    fireLayers: THREE.Mesh[];
} {
    const group = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 2), toonMat(0x555555));
    base.position.y = 0.6; base.castShadow = true; group.add(base);

    const stack = new THREE.Mesh(new THREE.BoxGeometry(1.2, 3, 1.2), toonMat(0x666666));
    stack.position.y = 2.7; group.add(stack);

    const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.3, 1, 4), toonMat(0x555555));
    hood.position.y = 1.7; hood.rotation.y = Math.PI / 4; group.add(hood);

    const fireLayers: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
        const f = new THREE.Mesh(
            new THREE.SphereGeometry(0.5 - i * 0.12, 8, 8),
            new THREE.MeshBasicMaterial({ color: [0xff3300, 0xff6622, 0xffaa33][i] })
        );
        f.position.set(0, 1.3 + i * 0.1, 0);
        f.userData.fireLayer = i;
        group.add(f);
        fireLayers.push(f);
    }

    return { group, fireLayers };
}

// ─── Main setup function ─────────────────────────────────────────────────────

export function setupWattLabScene(engine: GameEngineRef): void {
    const { scene, toonMat, config, animateReveal, startEngineAnimation, openPuzzle, triggerEnd, setEmotion } = engine;

    // Engine platform
    const engineGroup = new THREE.Group();
    engineGroup.position.set(0, 0, -5);
    scene.add(engineGroup);

    const platform = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.3, 2.5), toonMat(0x3a2515));
    platform.position.y = 0.15; platform.castShadow = true; platform.receiveShadow = true;
    platform.userData.solid = true;
    engineGroup.add(platform);

    const stone = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.4, 2.3), toonMat(0x6a6a6a));
    stone.position.y = -0.1; engineGroup.add(stone);

    // Build components (all hidden initially)
    const boilerGroup = buildBoiler(toonMat);
    boilerGroup.position.set(-1.6, 0.3, 0);
    boilerGroup.visible = false;
    engineGroup.add(boilerGroup);

    const { group: cylinderGroup, pistonRod, beamGroup, steamPipe: pipe1 } = buildCylinder(toonMat);
    cylinderGroup.position.set(0.2, 0.3, 0);
    cylinderGroup.visible = false;
    engineGroup.add(cylinderGroup);

    const beamPivot = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2, 0.3), toonMat(0x3a2515));
    beamPivot.position.set(0.2, 1.65, 0);
    beamPivot.visible = false;
    engineGroup.add(beamPivot);

    const beamTower = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.6, 4), toonMat(0x3a2515));
    beamTower.position.set(0.2, 2.95, 0);
    beamTower.visible = false;
    engineGroup.add(beamTower);

    beamGroup.position.set(0.2, 3.3, 0);
    beamGroup.visible = false;
    engineGroup.add(beamGroup);

    pipe1.visible = false;
    engineGroup.add(pipe1);

    const { group: condenserGroup, flywheelGroup, steamPipe: pipe2 } = buildCondenser(toonMat);
    condenserGroup.position.set(1.8, 0.3, 0);
    condenserGroup.visible = false;
    engineGroup.add(condenserGroup);

    flywheelGroup.position.set(1.8, 2.3, 0);
    flywheelGroup.visible = false;
    engineGroup.add(flywheelGroup);

    pipe2.visible = false;
    engineGroup.add(pipe2);

    // Forge
    const { group: forgeGroup, fireLayers } = buildForge(toonMat);
    forgeGroup.position.set(-7, 0, -7);
    // Solid-collider for hele smia (usynlig boks dekker base + skorstein)
    const forgeCollider = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 4.2, 2),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    forgeCollider.position.y = 2.1;
    forgeCollider.userData.solid = true;
    forgeGroup.add(forgeCollider);
    scene.add(forgeGroup);

    // Animate forge fire
    let forgeTime = 0;
    const forgeUpdate = (dt: number) => {
        forgeTime += dt;
        fireLayers.forEach((f, i) => {
            f.scale.setScalar(0.85 + Math.sin(forgeTime * (12 + i * 3)) * 0.12 + Math.random() * 0.05);
            f.position.y = 1.3 + i * 0.1 + Math.sin(forgeTime * 8) * 0.05;
        });
    };

    // Engine run animation
    let runTime = 0;
    const engineRunUpdate = (dt: number) => {
        runTime += dt;
        const cyc = runTime * 2.5;
        const py = Math.sin(cyc);

        pistonRod.position.y = 2.2 + py * 0.35;
        beamGroup.rotation.z = py * 0.25;
        flywheelGroup.rotation.x -= dt * 3;

        const needle = boilerGroup.userData.gaugeNeedle as THREE.Mesh | undefined;
        if (needle) needle.rotation.z = -0.8 + Math.sin(runTime * 8) * 0.05;
    };

    // Register update functions on the scene so GameEngine can call them
    scene.userData._forgeUpdate = forgeUpdate;
    scene.userData._engineRunUpdate = engineRunUpdate;

    // Wire dialog action callbacks that need engine methods
    const puzzleIntro = config.dialogs.puzzleIntro;
    if (puzzleIntro && !Array.isArray(puzzleIntro) && puzzleIntro.choices[0]) {
        puzzleIntro.choices[0].action = () => openPuzzle();
    }
    const puzzleWin = config.dialogs.puzzleWin;
    if (puzzleWin && !Array.isArray(puzzleWin) && puzzleWin.choices[0]) {
        puzzleWin.choices[0].action = () => triggerEnd();
    }

    // Wire puzzle callbacks
    if (config.puzzle) {
        config.puzzle.steps[0].onCorrect = () => {
            animateReveal(boilerGroup);
            setEmotion('watt', 'surprised', 1500);
        };
        config.puzzle.steps[1].onCorrect = () => {
            for (const obj of [cylinderGroup, beamPivot, beamTower, beamGroup]) {
                obj.visible = true;
                if (obj !== beamPivot && obj !== beamTower) {
                    animateReveal(obj as THREE.Group);
                }
            }
            pipe1.visible = true;
            setEmotion('watt', 'glad', 1000);
        };
        config.puzzle.steps[2].onCorrect = () => {
            condenserGroup.visible = true;
            flywheelGroup.visible = true;
            pipe2.visible = true;
            animateReveal(condenserGroup);
            animateReveal(flywheelGroup);
            setTimeout(() => startEngineAnimation(), 800);
            setEmotion('watt', 'triumphant', 3000);
        };
    }
}
