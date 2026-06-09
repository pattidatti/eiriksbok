import * as THREE from 'three';
import type { GameEngineRef, DialogNode } from '../engine/types';
import { addNPC, addPickup, addProp, addMonolog, addParticle, addAmbientAudio } from '../engine/declarative';
import {
    carloDialogs,
    ginoDialogs,
    pietroDialogs,
    kapteinDialogs,
    contiDialogs,
} from './MarsjenMotRomaDialogs';
import { marsjenMotRomaMonologs } from './MarsjenMotRomaMonologs';

// ─── Layout-konstanter ───────────────────────────────────────────────────────
// Positiv Z = sør (spilleren spawn her). Spilleren marsjerer mot Roma i -Z.
const BARRIER_Z = -6; // hærens veisperring blokkerer veien her til klimakset

export function setupMarsjenMotRomaScene(engine: GameEngineRef): void {
    const { scene, sceneMat } = engine;

    // ═══════════════════════════════════════════════════════════════════════
    // VÆR + FILL-LYS (overskyet, regnvåt oktoberdag - som den ekte marsjen)
    // ═══════════════════════════════════════════════════════════════════════
    engine.setWeather({ type: 'rain', intensity: 0.55 });

    // Mykt fyll-lys så palasset og figurene leses gjennom det grå skydekket.
    // Skyggeløst (preset-sola kaster allerede skygge) - dette løfter bare basen.
    const hemi = new THREE.HemisphereLight(0xb8b4ac, 0x47443e, 1.15);
    scene.add(hemi);
    const fill = new THREE.DirectionalLight(0xd4cec2, 0.85);
    fill.position.set(-25, 35, 12);
    fill.castShadow = false;
    scene.add(fill);

    // ═══════════════════════════════════════════════════════════════════════
    // BAKKE + VEI
    // ═══════════════════════════════════════════════════════════════════════
    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(48, 1, 96),
        sceneMat(0x4f4738, { preset: 'soil', roughness: 1.0 }),
    );
    ground.position.set(0, -0.5, -6);
    ground.receiveShadow = true;
    ground.userData.solid = true;
    scene.add(ground);

    // Brolagt vei (mørk våt stripe) fra leiren i sør til palasset i nord
    const road = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.06, 64),
        sceneMat(0x3a3630, { preset: 'stone', roughness: 0.95 }),
    );
    road.position.set(0, 0.02, 0);
    road.receiveShadow = true;
    scene.add(road);

    // Blanke vannpytter på veien (regnet ligger i søkk) - rent visuelt
    const puddlePositions: [number, number][] = [
        [-1.5, 18], [2, 9], [-2, 1], [1, -9], [-1, -16],
    ];
    for (let i = 0; i < puddlePositions.length; i++) {
        const [px, pz] = puddlePositions[i];
        const puddle = new THREE.Mesh(
            new THREE.CircleGeometry(0.9 + (i % 2) * 0.4, 14),
            sceneMat(0x5a6066, { preset: 'water', metalness: 0.5, roughness: 0.15 }),
        );
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.set(px, 0.06, pz);
        scene.add(puddle);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BYGNINGER LANGS VEIEN (terrakotta/oker - italiensk småby mot Roma)
    // ═══════════════════════════════════════════════════════════════════════
    const buildings: Array<[number, number, number, number, number, number]> = [
        // x, z, bredde, dybde, høyde, veggfarge
        [-11, 16, 6, 5, 4.5, 0xb07248],
        [11, 14, 7, 6, 5.5, 0xa86840],
        [-12, 7, 7, 6, 6, 0x9c6038],
        [11, 6, 6, 5, 4.8, 0xb47a52],
        [12, -1, 7, 6, 6.5, 0xa06438],
        [-12, -11, 7, 7, 7, 0x986848],
        [12, -12, 7, 7, 7, 0x9a6240],
    ];
    for (let i = 0; i < buildings.length; i++) {
        const [x, z, w, d, h, color] = buildings[i];
        addBuilding(scene, sceneMat, x, z, w, d, h, color);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SVARTSKJORTE-KOLONNER (tusenvis antydet med to flankerende rekker)
    // ═══════════════════════════════════════════════════════════════════════
    for (let row = 0; row < 9; row++) {
        const z = 17 - row * 2.4;
        addMarcher(scene, sceneMat, -5.4 - (row % 2) * 0.5, z);
        addMarcher(scene, sceneMat, 5.4 + (row % 2) * 0.5, z);
        if (row % 2 === 0) {
            addMarcher(scene, sceneMat, -6.9, z - 0.6);
            addMarcher(scene, sceneMat, 6.9, z - 0.6);
        }
    }

    // Noen faner over kolonnen (sobert dyp rødt - ikke dyrket)
    addBanner(scene, sceneMat, -6, 15);
    addBanner(scene, sceneMat, 6, 11);
    addBanner(scene, sceneMat, -6.5, 5);

    // ═══════════════════════════════════════════════════════════════════════
    // LEIR-PROPS (oppmøtested i sør, der spilleren starter)
    // ═══════════════════════════════════════════════════════════════════════
    addProp(engine, { id: 'camp-crate-1', model: 'crate', pos: [3, 0, 25] });
    addProp(engine, { id: 'camp-barrel', model: 'barrel', pos: [-5, 0, 24] });
    addProp(engine, { id: 'camp-crate-2', model: 'crate', pos: [4.4, 0, 23.4] });
    addProp(engine, { id: 'camp-crate-3', model: 'crate', pos: [-3.8, 0, 26] });

    // ═══════════════════════════════════════════════════════════════════════
    // UTBRENT TRYKKERI (squadristi-volden vist som ettervirkning, ikke utspilt)
    // ═══════════════════════════════════════════════════════════════════════
    addBuilding(scene, sceneMat, -10, 3, 6, 5, 4, 0x1d1813); // sotsvart ruin
    // Innfalt takbjelke
    const beam = new THREE.Mesh(
        new THREE.BoxGeometry(5, 0.3, 0.3),
        sceneMat(0x14110d, { preset: 'wood', roughness: 1 }),
    );
    beam.position.set(-9.4, 2.1, 4.4);
    beam.rotation.z = 0.5;
    beam.castShadow = true;
    scene.add(beam);
    addParticle(engine, { id: 'ruin-smoke', preset: 'smoke', pos: [-10, 4, 3], scale: 1.6 });

    // ═══════════════════════════════════════════════════════════════════════
    // HÆRENS VEISPERRING (usynlig collider + synlige soldater som kan trekkes unna)
    // ═══════════════════════════════════════════════════════════════════════
    const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(10, 5, 0.5),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    barrier.position.set(0, 2.6, BARRIER_Z);
    barrier.userData.solid = true;
    scene.add(barrier);

    // Soldater + bukk samles i én gruppe så de kan skride til side ved klimaks
    const soldierGroup = new THREE.Group();
    const sawhorse = new THREE.Mesh(
        new THREE.BoxGeometry(7, 0.9, 0.3),
        sceneMat(0x6a5436, { preset: 'wood', roughness: 0.9 }),
    );
    sawhorse.position.set(0, 0.7, BARRIER_Z);
    sawhorse.castShadow = true;
    soldierGroup.add(sawhorse);
    const soldierX = [-2.4, -0.8, 0.8, 2.4];
    for (let i = 0; i < soldierX.length; i++) {
        const s = makeFigure(sceneMat, 0x4a5640, 0xc89868, 0x2c3424); // grågrønn uniform
        s.position.set(soldierX[i], 0, BARRIER_Z - 0.6);
        soldierGroup.add(s);
    }
    scene.add(soldierGroup);

    // ═══════════════════════════════════════════════════════════════════════
    // QUIRINALE-PALASSET (målet marsjen aldri trenger å storme)
    // ═══════════════════════════════════════════════════════════════════════
    const palaceMat = sceneMat(0xcabfa6, { preset: 'stone', roughness: 0.7 });
    const palaceShadow = sceneMat(0x6a5e48, { preset: 'stone', roughness: 0.9 });
    // Hovedfasade
    const facade = new THREE.Mesh(new THREE.BoxGeometry(20, 11, 9), palaceMat);
    facade.position.set(0, 5.5, -22);
    facade.castShadow = true;
    facade.receiveShadow = true;
    facade.userData.solid = true;
    scene.add(facade);
    // Trappeplatå foran
    const palaceSteps = new THREE.Mesh(new THREE.BoxGeometry(18, 0.8, 3), palaceShadow);
    palaceSteps.position.set(0, 0.4, -15.5);
    palaceSteps.castShadow = true;
    palaceSteps.receiveShadow = true;
    palaceSteps.userData.solid = true;
    scene.add(palaceSteps);
    // Søylerekke (portiko)
    for (let i = 0; i < 6; i++) {
        addProp(engine, {
            id: `palace-pillar-${i}`,
            model: 'pillar',
            pos: [-7.5 + i * 3, 0.8, -14],
            solid: true,
        });
    }
    // Gesims/pediment over søylene
    const pediment = new THREE.Mesh(new THREE.BoxGeometry(18, 1.4, 1.6), palaceShadow);
    pediment.position.set(0, 7.2, -14);
    pediment.castShadow = true;
    scene.add(pediment);

    // ═══════════════════════════════════════════════════════════════════════
    // NPC-ER
    // ═══════════════════════════════════════════════════════════════════════
    addNPC(engine, {
        id: 'carlo',
        name: 'Carlo',
        characterType: 'farmer',
        pos: [-3, 0, 23],
        colors: { body: 0x26262a, head: 0xc89868, legs: 0x1c1c20 },
        emotion: 'triumphant',
        questMarker: true,
        dialogs: carloDialogs,
    });

    addNPC(engine, {
        id: 'gino',
        name: 'Gino',
        characterType: 'farmer',
        pos: [3, 0, 9],
        colors: { body: 0x2a2a2e, head: 0xd0a070, legs: 0x1a1a1e },
        emotion: 'triumphant',
        questMarker: false,
        dialogs: ginoDialogs,
    });

    addNPC(engine, {
        id: 'pietro',
        name: 'Pietro',
        characterType: 'farmer',
        pos: [-7, 0, 5],
        colors: { body: 0x4a4038, head: 0xb88a64, legs: 0x2e271f },
        emotion: 'worried',
        questMarker: false,
        dialogs: pietroDialogs,
    });

    addNPC(engine, {
        id: 'kaptein',
        name: 'Kaptein Renzi',
        characterType: 'noble',
        pos: [2.6, 0, -3.6],
        colors: { body: 0x4a5640, head: 0xc89868, legs: 0x2c3424 },
        emotion: 'worried',
        questMarker: true,
        dialogs: kapteinDialogs,
    });

    addNPC(engine, {
        id: 'conti',
        name: 'Signor Conti',
        characterType: 'noble',
        pos: [-3, 0, -3],
        colors: { body: 0x2e2a26, head: 0xcea078, legs: 0x1f1c18 },
        emotion: 'glad',
        questMarker: true,
        dialogs: contiDialogs,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PICKUPS (flavor/dybde - leses i inventar)
    // ═══════════════════════════════════════════════════════════════════════
    addPickup(engine, {
        id: 'pickup-presskort',
        itemId: 'presskort',
        model: 'book',
        pos: [3, 1.0, 25],
        label: 'Ta pressekortet (E)',
        audioOnPickup: 'pickup-paper',
    });
    addPickup(engine, {
        id: 'pickup-program',
        itemId: 'fascist-program',
        model: 'scroll',
        pos: [-5, 1.05, 24],
        label: 'Plukk opp flyveblad (E)',
        audioOnPickup: 'pickup-paper',
    });

    // ═══════════════════════════════════════════════════════════════════════
    // MONOLOGER
    // ═══════════════════════════════════════════════════════════════════════
    for (const node of Object.values(marsjenMotRomaMonologs)) {
        engine.registerMonolog(node);
    }
    addMonolog(engine, {
        id: 'trykkeriet',
        lines: marsjenMotRomaMonologs.trykkeriet.lines,
        once: true,
        trigger: { type: 'proximity', pos: [-7, 0, 5], radius: 4 },
    });
    addMonolog(engine, {
        id: 'haeren',
        lines: marsjenMotRomaMonologs.haeren.lines,
        once: true,
        trigger: { type: 'proximity', pos: [0, 0, -2], radius: 4 },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // AMBIENT
    // ═══════════════════════════════════════════════════════════════════════
    addAmbientAudio(engine, { id: 'rain-wind', audio: 'wind-indoor', volume: 0.3, loop: true });

    // ═══════════════════════════════════════════════════════════════════════
    // DIALOG-ACTIONS (kobler engine-flagg på dialog-noder)
    // ═══════════════════════════════════════════════════════════════════════
    const dialogs = engine.config.dialogs;

    wireDialogEnd(dialogs, 'carlo_greeting', () =>
        engine.setCharacterMarkerVisible('carlo', false),
    );
    wireDialogEnd(dialogs, 'carlo_mussolini', () =>
        engine.setFlag('learned_mussolini_background', true),
    );
    wireDialogEnd(dialogs, 'carlo_why', () =>
        engine.setFlag('learned_mussolini_background', true),
    );

    wireDialogEnd(dialogs, 'gino_creed', () => engine.setFlag('learned_fascism_traits', true));
    wireDialogEnd(dialogs, 'gino_violence', () => engine.setFlag('saw_squadristi_violence', true));

    wireDialogEnd(dialogs, 'pietro_greeting', () =>
        engine.setFlag('saw_squadristi_violence', true),
    );

    wireDialogEnd(dialogs, 'kaptein_greeting', () =>
        engine.setCharacterMarkerVisible('kaptein', false),
    );
    wireDialogEnd(dialogs, 'kaptein_bluff', () => {
        engine.setFlag('learned_bluff', true);
        checkClimax(engine);
    });
    wireDialogEnd(dialogs, 'kaptein_orders', () => {
        engine.setFlag('learned_bluff', true);
        checkClimax(engine);
    });

    wireDialogEnd(dialogs, 'conti_greeting', () =>
        engine.setCharacterMarkerVisible('conti', false),
    );
    wireDialogEnd(dialogs, 'conti_motive', () => {
        engine.setFlag('learned_elite_motive', true);
        checkClimax(engine);
    });
    wireDialogEnd(dialogs, 'conti_compare', () => {
        engine.setFlag('compared_communism', true);
        // Conti-samtalen dekker også elitens motiv hvis eleven gikk rett på sammenligningen
        engine.setFlag('learned_elite_motive', true);
        checkClimax(engine);
    });

    // ═══════════════════════════════════════════════════════════════════════
    // FASEPROGRESJON
    // ═══════════════════════════════════════════════════════════════════════
    let climaxStarted = false;
    let endScheduled = false;
    let soldiersAside = false;
    const soldierTargetX = 11;

    engine.registerUpdate((dt) => {
        const phase = engine.getPhase();
        const p = engine.getPlayerPosition();

        // Marsjen begynner når spilleren forlater leiren
        if (phase === 'samling' && p.z < 16) {
            engine.setPhase('marsjen');
        }
        // Spilleren når veisperringen
        if (phase === 'marsjen' && p.z < -1) {
            engine.setPhase('bloeffen');
        }

        // Klimaks: kongen folder, hæren trekker seg, veien åpnes
        if (phase === 'kongens-valg' && !climaxStarted) {
            climaxStarted = true;
            engine.schedule(() => engine.playMonolog('venter'), 700);
            engine.schedule(() => {
                engine.playMonolog('kongen_taler');
                engine.setFlag('king_caved', true);
                engine.removeStaticCollider(barrier);
                barrier.visible = false;
                soldiersAside = true;
                engine.setPhase('seieren');
            }, 9500);
        }

        // Etter at veien er åpnet: la spilleren gå inn i Roma, så avslutt
        if (phase === 'seieren' && !endScheduled) {
            endScheduled = true;
            engine.schedule(() => engine.playMonolog('seier_refleksjon'), 2000);
            engine.schedule(() => engine.triggerEnd(), 21000);
        }

        // Animér soldatene som skrider til side
        if (soldiersAside && soldierGroup.position.x < soldierTargetX - 0.05) {
            soldierGroup.position.x += (soldierTargetX - soldierGroup.position.x) * Math.min(1, dt * 1.5);
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════════════════
    engine.setPhase('samling');
    engine.schedule(() => engine.playMonolog('ankomst'), 1200);
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function checkClimax(engine: GameEngineRef): void {
    if (
        engine.getPhase() === 'bloeffen' &&
        engine.getFlag<boolean>('learned_bluff') &&
        engine.getFlag<boolean>('learned_elite_motive')
    ) {
        engine.setPhase('kongens-valg');
    }
}

function wireDialogEnd(
    dialogs: Record<string, DialogNode | DialogNode[]>,
    key: string,
    action: () => void,
): void {
    const entry = dialogs[key];
    if (!entry) return;
    const nodes = Array.isArray(entry) ? entry : [entry];
    for (const node of nodes) {
        const existing = node.onEnd;
        node.onEnd = (): void => {
            try {
                existing?.();
            } finally {
                action();
            }
        };
    }
}

function addBuilding(
    scene: THREE.Scene,
    sceneMat: GameEngineRef['sceneMat'],
    x: number,
    z: number,
    w: number,
    d: number,
    h: number,
    wallColor: number,
): void {
    const g = new THREE.Group();
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        sceneMat(wallColor, { preset: 'stone', roughness: 0.92 }),
    );
    wall.position.y = h / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.solid = true;
    g.add(wall);
    const roof = new THREE.Mesh(
        new THREE.BoxGeometry(w + 0.5, 0.5, d + 0.5),
        sceneMat(0x6e3f2c, { preset: 'stone', roughness: 1 }),
    );
    roof.position.y = h + 0.25;
    roof.castShadow = true;
    g.add(roof);
    g.position.set(x, 0, z);
    scene.add(g);
}

// Enkel lavpoly-figur (kropp + hode + hodeplagg). castShadow av for ytelse i mengde.
function makeFigure(
    sceneMat: GameEngineRef['sceneMat'],
    bodyColor: number,
    headColor: number,
    capColor: number,
): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.34, 1.1, 8),
        sceneMat(bodyColor, { preset: 'cloth', roughness: 1 }),
    );
    body.position.y = 0.85;
    g.add(body);
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 10, 10),
        sceneMat(headColor, { preset: 'cloth', roughness: 0.8 }),
    );
    head.position.y = 1.55;
    g.add(head);
    const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 0.13, 8),
        sceneMat(capColor, { preset: 'cloth', roughness: 1 }),
    );
    cap.position.y = 1.74;
    g.add(cap);
    return g;
}

function addMarcher(
    scene: THREE.Scene,
    sceneMat: GameEngineRef['sceneMat'],
    x: number,
    z: number,
): void {
    const g = makeFigure(sceneMat, 0x26262a, 0xc89868, 0x16161a);
    g.position.set(x, 0, z);
    scene.add(g);
}

function addBanner(
    scene: THREE.Scene,
    sceneMat: GameEngineRef['sceneMat'],
    x: number,
    z: number,
): void {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 3.4, 6),
        sceneMat(0x3a2e22, { preset: 'wood', roughness: 1 }),
    );
    pole.position.y = 1.7;
    g.add(pole);
    const cloth = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.1, 0.05),
        sceneMat(0x6e1a16, { preset: 'cloth', roughness: 0.95 }),
    );
    cloth.position.set(0.5, 2.7, 0);
    g.add(cloth);
    g.position.set(x, 0, z);
    scene.add(g);
}
