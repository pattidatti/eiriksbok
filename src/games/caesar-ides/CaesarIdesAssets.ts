import * as THREE from 'three';
import type { GameEngineRef, DialogNode } from '../engine/types';
import { addNPC, addPickup, addProp, addMonolog, addAmbientAudio } from '../engine/declarative';
import {
    spurinnaDialogs,
    cassiusDialogs,
    brutusDialogs,
    caesarDialogs,
} from './CaesarIdesDialogs';
import { caesarIdesMonologs } from './CaesarIdesMonologs';

// ─── Layout-konstanter ───────────────────────────────────────────────────────
// Positiv Z = sør (mot spilleren). Spilleren spawn på +Z og beveger seg mot senatet i -Z.
const SENATE_CENTER_Z = -26;  // senatshallen sentrum
const SENATE_HALF_W = 9;    // halv bredde (x)
const SENATE_HALF_D = 7;    // halv dybde (z)
const SENATE_ENTRANCE_Z = SENATE_CENTER_Z + SENATE_HALF_D; // z = -19 (nord-vegg)
const SENATE_BACK_Z = SENATE_CENTER_Z - SENATE_HALF_D;     // z = -33 (sør-vegg, Pompey-statue)
const WALL_H = 8;
const DOOR_W = 6;
const ENTRY_THRESHOLD_Z = SENATE_ENTRANCE_Z + 2; // z = -17, der player utløser "assassination"

export function setupCaesarIdesScene(engine: GameEngineRef): void {
    const { scene, sceneMat } = engine;

    // ═══════════════════════════════════════════════════════════════════════
    // BAKKE (gate + plaza foran senat)
    // ═══════════════════════════════════════════════════════════════════════
    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(60, 1, 80),
        sceneMat(0xd6c8a8, { preset: 'stone', roughness: 0.95 }),
    );
    ground.position.set(0, -0.5, -10);
    ground.receiveShadow = true;
    ground.userData.solid = true;
    scene.add(ground);

    // Brolegging foran senatet (mørkere stripe fra gate til trapp)
    const road = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.05, 30),
        sceneMat(0xa89880, { preset: 'stone', roughness: 1.0 }),
    );
    road.position.set(0, 0.02, 0);
    road.receiveShadow = true;
    scene.add(road);

    // ═══════════════════════════════════════════════════════════════════════
    // GATE-PROPS (romersk gate-stemning)
    // ═══════════════════════════════════════════════════════════════════════
    // Fontene i midten av gaten (dekor-referanse)
    const fountain = new THREE.Group();
    const basin = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.4, 0.8, 16),
        sceneMat(0xece2c8, { preset: 'stone' }),
    );
    basin.position.y = 0.4;
    basin.castShadow = true;
    basin.receiveShadow = true;
    basin.userData.solid = true;
    fountain.add(basin);
    const waterDisk = new THREE.Mesh(
        new THREE.CylinderGeometry(1.0, 1.0, 0.05, 16),
        sceneMat(0x6a8a9a, { preset: 'water', metalness: 0.2, roughness: 0.3 }),
    );
    waterDisk.position.y = 0.78;
    fountain.add(waterDisk);
    const spout = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8),
        sceneMat(0xa08a6a, { preset: 'stone' }),
    );
    spout.position.y = 1.1;
    fountain.add(spout);
    fountain.position.set(-7, 0, 5);
    scene.add(fountain);

    // Dekorative søyler langs gata (fire stk, ikke solide, bare visuelle)
    const pillarPositions: [number, number][] = [
        [-10, 0],
        [10, 0],
        [-10, -10],
        [10, -10],
    ];
    for (let i = 0; i < pillarPositions.length; i++) {
        const [px, pz] = pillarPositions[i];
        addProp(engine, {
            id: `street-pillar-${i}`,
            model: 'pillar',
            pos: [px, 0, pz],
            solid: true,
        });
    }

    // Sypress-trær for middelhavsstemning
    if (typeof engine.addTree === 'function') {
        engine.addTree([-14, 0, 8], 'pine');
        engine.addTree([14, 0, 8], 'pine');
        engine.addTree([-14, 0, -2], 'pine');
        engine.addTree([14, 0, -2], 'pine');
    }

    // Trappe-platå foran senatet (bredt stentrinn, Z = -16 til -18)
    const stairs = new THREE.Mesh(
        new THREE.BoxGeometry(14, 0.6, 3),
        sceneMat(0xe8dcc0, { preset: 'stone' }),
    );
    stairs.position.set(0, 0.3, -17);
    stairs.castShadow = true;
    stairs.receiveShadow = true;
    stairs.userData.solid = true;
    scene.add(stairs);

    // ═══════════════════════════════════════════════════════════════════════
    // SENATSHALL (Pompey-teateret, rektangulært rom med nord-åpning)
    // ═══════════════════════════════════════════════════════════════════════
    const marbleMat = sceneMat(0xece2c8, { preset: 'stone', roughness: 0.7 });
    const shadowMat = sceneMat(0xb8aa88, { preset: 'stone', roughness: 0.9 });

    // Gulv (senater-plan, hevet 0.6m over gatenivå)
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(SENATE_HALF_W * 2, 0.6, SENATE_HALF_D * 2),
        marbleMat,
    );
    floor.position.set(0, 0.3, SENATE_CENTER_Z);
    floor.receiveShadow = true;
    floor.userData.solid = true;
    scene.add(floor);

    // Sør-vegg (bakre vegg, bak Pompey-statuen)
    const southWall = new THREE.Mesh(
        new THREE.BoxGeometry(SENATE_HALF_W * 2 + 0.4, WALL_H, 0.4),
        marbleMat,
    );
    southWall.position.set(0, WALL_H / 2 + 0.6, SENATE_BACK_Z - 0.2);
    southWall.castShadow = true;
    southWall.receiveShadow = true;
    southWall.userData.solid = true;
    scene.add(southWall);

    // Øst-vegg
    const eastWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, WALL_H, SENATE_HALF_D * 2),
        marbleMat,
    );
    eastWall.position.set(SENATE_HALF_W + 0.2, WALL_H / 2 + 0.6, SENATE_CENTER_Z);
    eastWall.castShadow = true;
    eastWall.receiveShadow = true;
    eastWall.userData.solid = true;
    scene.add(eastWall);

    // Vest-vegg
    const westWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, WALL_H, SENATE_HALF_D * 2),
        marbleMat,
    );
    westWall.position.set(-SENATE_HALF_W - 0.2, WALL_H / 2 + 0.6, SENATE_CENTER_Z);
    westWall.castShadow = true;
    westWall.receiveShadow = true;
    westWall.userData.solid = true;
    scene.add(westWall);

    // Nord-vegg i to deler med åpning (DOOR_W bred) i midten
    const northWallWidth = (SENATE_HALF_W * 2 - DOOR_W) / 2;
    for (const side of [-1, 1] as const) {
        const wallX = side * (DOOR_W / 2 + northWallWidth / 2);
        const wall = new THREE.Mesh(
            new THREE.BoxGeometry(northWallWidth, WALL_H, 0.4),
            marbleMat,
        );
        wall.position.set(wallX, WALL_H / 2 + 0.6, SENATE_ENTRANCE_Z + 0.2);
        wall.castShadow = true;
        wall.receiveShadow = true;
        wall.userData.solid = true;
        scene.add(wall);
    }

    // Bjelke over inngangen (gir arkitektonisk innramming)
    const lintel = new THREE.Mesh(
        new THREE.BoxGeometry(DOOR_W + 1.4, 1.2, 0.4),
        marbleMat,
    );
    lintel.position.set(0, WALL_H + 0.2, SENATE_ENTRANCE_Z + 0.2);
    lintel.castShadow = true;
    scene.add(lintel);

    // Tak (flatt, marmor-kassett-imitasjon)
    const ceiling = new THREE.Mesh(
        new THREE.BoxGeometry(SENATE_HALF_W * 2 + 0.4, 0.3, SENATE_HALF_D * 2 + 0.4),
        shadowMat,
    );
    ceiling.position.set(0, WALL_H + 0.7, SENATE_CENTER_Z);
    scene.add(ceiling);

    // Søyler ved inngangen (to frittstående, flankerer åpningen)
    for (const side of [-1, 1] as const) {
        addProp(engine, {
            id: `entrance-pillar-${side > 0 ? 'east' : 'west'}`,
            model: 'pillar',
            pos: [side * (DOOR_W / 2 + 0.4), 0.6, SENATE_ENTRANCE_Z - 0.5],
            solid: true,
        });
    }

    // ─── Pompey-statuen (Cæsar faller her) ──────────────────────────────────
    const statue = new THREE.Group();
    // Sokkel
    const pedestal = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.2, 1.4),
        sceneMat(0xd8ccae, { preset: 'stone' }),
    );
    pedestal.position.y = 0.6;
    pedestal.castShadow = true;
    pedestal.receiveShadow = true;
    pedestal.userData.solid = true;
    statue.add(pedestal);
    // Torso
    const torso = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.45, 1.3, 12),
        sceneMat(0xf0e8d4, { preset: 'stone', roughness: 0.5 }),
    );
    torso.position.y = 1.95;
    torso.castShadow = true;
    statue.add(torso);
    // Hode
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 12),
        sceneMat(0xf0e8d4, { preset: 'stone', roughness: 0.5 }),
    );
    head.position.y = 2.78;
    head.castShadow = true;
    statue.add(head);
    // Høyre arm (løftet i talestilling)
    const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8),
        sceneMat(0xf0e8d4, { preset: 'stone', roughness: 0.5 }),
    );
    arm.position.set(0.32, 2.3, 0.1);
    arm.rotation.z = -0.6;
    statue.add(arm);
    // Toga-drapering (dekorativt slør)
    const drape = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.1, 10, 1, true),
        sceneMat(0xe8dfc8, { preset: 'cloth', roughness: 0.8 }),
    );
    drape.position.y = 1.75;
    statue.add(drape);
    statue.position.set(0, 0.6, SENATE_BACK_Z + 1.3);
    statue.rotation.y = Math.PI; // vend ansikt mot senator-benkene
    scene.add(statue);

    // Rim-lys på statuen (fra taket)
    const statueLight = new THREE.PointLight(0xfff0d4, 14, 10, 1.5);
    statueLight.position.set(0, WALL_H - 0.5, SENATE_BACK_Z + 1.5);
    scene.add(statueLight);

    // ─── Senatorbenker i halvsirkel rundt senterflisen ─────────────────────
    // Tre rader, økende radius. Benkene vender mot senterscenen (sør).
    const benchRadii = [3.2, 5.0, 6.6];
    const benchArc = Math.PI * 0.8; // ~144 grader, åpen mot sør
    for (let row = 0; row < benchRadii.length; row++) {
        const r = benchRadii[row];
        const count = 5 + row * 2; // 5, 7, 9
        for (let i = 0; i < count; i++) {
            const t = count === 1 ? 0.5 : i / (count - 1);
            const angle = Math.PI - benchArc / 2 + benchArc * t; // spenner rundt sør-senter
            const bx = Math.sin(angle) * r;
            const bz = SENATE_CENTER_Z + Math.cos(angle) * r * 0.7 + 2.0; // flat-oval halvsirkel
            addProp(engine, {
                id: `bench-${row}-${i}`,
                model: 'bench',
                pos: [bx, 0.6, bz],
                rot: [0, angle + Math.PI, 0], // vender mot sør/Pompey
                solid: true,
            });
        }
    }

    // Lys i senatshallen (taklys, dempet ettermiddagsstemning)
    const senateLight = new THREE.PointLight(0xfff4d8, 26, 24, 1.4);
    senateLight.position.set(0, WALL_H - 0.2, SENATE_CENTER_Z + 2);
    scene.add(senateLight);

    // Sollys gjennom åpningen (retningslys fra nord)
    const sunShaft = new THREE.DirectionalLight(0xfff0cc, 0.7);
    sunShaft.position.set(0, 12, SENATE_ENTRANCE_Z + 6);
    sunShaft.target.position.set(0, 0, SENATE_CENTER_Z);
    scene.add(sunShaft);
    scene.add(sunShaft.target);

    // ═══════════════════════════════════════════════════════════════════════
    // USYNLIG BARRIERE foran senatinngangen (fjernes når Cæsar ankommer)
    // Sikrer at spilleren snakker med konspiratørene før hun/han går inn.
    // ═══════════════════════════════════════════════════════════════════════
    const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(DOOR_W, WALL_H, 0.4),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    barrier.position.set(0, WALL_H / 2 + 0.6, SENATE_ENTRANCE_Z + 0.2);
    barrier.userData.solid = true;
    scene.add(barrier);

    // ═══════════════════════════════════════════════════════════════════════
    // NPC-ER
    // ═══════════════════════════════════════════════════════════════════════
    // 1. Spurinna - augur, står nær spawn
    addNPC(engine, {
        id: 'spurinna',
        name: 'Spurinna',
        characterType: 'monk',
        pos: [-5, 0, 4],
        colors: { body: 0xe8dfc8, head: 0xc8a078, legs: 0xd4c8a8 }, // hvit augur-kappe
        emotion: 'worried',
        questMarker: true,
        dialogs: spurinnaDialogs,
    });

    // 2. Cassius - venter ved trappen
    addNPC(engine, {
        id: 'cassius',
        name: 'Gaius Cassius',
        characterType: 'noble',
        pos: [-3, 0, -10],
        colors: { body: 0xf0e8d4, head: 0xd8b898, legs: 0xe8dcc0 }, // senator-toga
        emotion: 'triumphant',
        questMarker: true,
        dialogs: cassiusDialogs,
    });

    // 3. Brutus - ved Cassius, mer tilbakeholden
    addNPC(engine, {
        id: 'brutus',
        name: 'Marcus Brutus',
        characterType: 'noble',
        pos: [3, 0, -10],
        colors: { body: 0xede4cc, head: 0xd0b088, legs: 0xe0d4b8 },
        emotion: 'worried',
        questMarker: true,
        dialogs: brutusDialogs,
    });

    // 4. Cæsar - starter utenfor synsvidde, flyttes inn i fase 3
    addNPC(engine, {
        id: 'caesar',
        name: 'Gaius Julius Cæsar',
        characterType: 'noble',
        pos: [-22, 0, 14], // skjult bak vest-sypressene
        colors: { body: 0x8b2b1c, head: 0xd8b898, legs: 0x5a1a10 }, // purpur triumfator-toga
        emotion: 'triumphant',
        questMarker: false,
        talkable: false, // låst til fase 3
        dialogs: caesarDialogs,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PICKUPS
    // ═══════════════════════════════════════════════════════════════════════
    // Artemidoros-brev ligger på et podium nær senatstrappen
    addPickup(engine, {
        id: 'pickup-letter',
        itemId: 'artemidoros-brev',
        model: 'scroll',
        pos: [5, 0.7, -5],
        label: 'Plukk opp brev (E)',
        audioOnPickup: 'pickup-paper',
    });

    // Lite bord under brevet
    addProp(engine, {
        id: 'letter-table',
        model: 'table',
        pos: [5, 0, -5],
        solid: true,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // MONOLOGER
    // ═══════════════════════════════════════════════════════════════════════
    // Registrer alle monologer sentralt (engine slår dem opp via id ved playMonolog)
    for (const node of Object.values(caesarIdesMonologs)) {
        engine.registerMonolog(node);
    }

    // Proximity-trigger ved fontenen - Calpurnia-minne
    addMonolog(engine, {
        id: 'calpurnia_window',
        lines: caesarIdesMonologs.calpurnia_window.lines,
        once: true,
        trigger: { type: 'proximity', pos: [-7, 0, 5], radius: 2.5 },
    });

    // Proximity-trigger ved senatstrappen - senate_approach
    addMonolog(engine, {
        id: 'senate_approach',
        lines: caesarIdesMonologs.senate_approach.lines,
        once: true,
        trigger: { type: 'proximity', pos: [0, 0, -14], radius: 3 },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // AMBIENT AUDIO
    // ═══════════════════════════════════════════════════════════════════════
    addAmbientAudio(engine, {
        id: 'street-wind',
        audio: 'wind-indoor',
        volume: 0.25,
        loop: true,
    });

    addAmbientAudio(engine, {
        id: 'fountain',
        audio: 'water-drip',
        volume: 0.5,
        loop: true,
        pos: [-7, 1, 5],
        radius: 8,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // DIALOG-ACTIONS (kobler engine-tilstand på dialog-valg)
    // ═══════════════════════════════════════════════════════════════════════
    const dialogs = engine.config.dialogs;

    wireDialogEnd(dialogs, 'spurinna_warning', () => {
        engine.setFlag('met_spurinna', true);
    });
    wireDialogEnd(dialogs, 'spurinna_dismissed', () => {
        engine.setFlag('met_spurinna', true);
    });

    wireDialogEnd(dialogs, 'cassius_dictator_motive', () => {
        engine.setFlag('learned_dictator_motive', true);
        checkAdvanceToArrival(engine);
    });
    wireDialogEnd(dialogs, 'cassius_tyrant_love', () => {
        engine.setFlag('learned_dictator_motive', true);
        checkAdvanceToArrival(engine);
    });
    wireDialogEnd(dialogs, 'cassius_confirm', () => {
        engine.setFlag('learned_dictator_motive', true);
        checkAdvanceToArrival(engine);
    });

    wireDialogEnd(dialogs, 'brutus_republic_motive', () => {
        engine.setFlag('learned_republic_motive', true);
        checkAdvanceToArrival(engine);
    });
    wireDialogEnd(dialogs, 'brutus_principle', () => {
        engine.setFlag('learned_republic_motive', true);
        checkAdvanceToArrival(engine);
    });
    wireDialogEnd(dialogs, 'brutus_duty', () => {
        engine.setFlag('learned_republic_motive', true);
        checkAdvanceToArrival(engine);
    });

    wireDialogEnd(dialogs, 'caesar_dismiss_warning', () => {
        engine.setFlag('caesar_greeted', true);
    });
    wireDialogEnd(dialogs, 'caesar_letter_taken', () => {
        engine.setFlag('caesar_greeted', true);
        engine.setFlag('gave_letter_to_caesar', true);
        engine.removeItem('artemidoros-brev', 1);
    });
    // Også marker Cæsar som hilst hvis spilleren bare lukker intro-dialogen uten
    // å gå videre. Unngår at samme intro-tekst vises ved neste E-trykk.
    wireDialogEnd(dialogs, 'caesar_greeting', () => {
        engine.setFlag('caesar_greeted', true);
    });

    // Når Cassius først møtes, gå til fase 'meeting_conspirators'
    wireDialogEnd(dialogs, 'cassius_dictator_motive', () => {
        if (engine.getPhase() === 'street_arrival') {
            engine.setPhase('meeting_conspirators');
        }
    });
    wireDialogEnd(dialogs, 'cassius_defence_response', () => {
        if (engine.getPhase() === 'street_arrival') {
            engine.setPhase('meeting_conspirators');
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // FASE-PROGRESJON via registerUpdate
    // ═══════════════════════════════════════════════════════════════════════
    let assassinationScheduled = false;
    let aftermathScheduled = false;
    let endScheduled = false;
    let caesarMoving = false;

    engine.registerUpdate(() => {
        const phase = engine.getPhase();
        const p = engine.getPlayerPosition();

        // Fase 3: Cæsar ankommer - flyttes fra utsiden til gate-inngangen
        if (phase === 'caesar_arrives' && !caesarMoving) {
            caesarMoving = true;
            moveCaesarToEntrance(scene, engine);
            // Fjern inngangsbarrieren slik at spilleren kan gå inn
            engine.removeStaticCollider(barrier);
            barrier.visible = false;
        }

        // Fase 4 trigger: spilleren krysser inn i senatshallen
        if (
            phase === 'caesar_arrives' &&
            !assassinationScheduled &&
            p.z < ENTRY_THRESHOLD_Z
        ) {
            assassinationScheduled = true;
            engine.setPhase('assassination');
            teleportCaesarToDeath(scene, engine);
            engine.schedule(() => engine.playMonolog('assassination_witness'), 800);
            engine.cameraShake(0.4, 1.2);

            // Etter vitne-monologen (~16s), gå til aftermath
            engine.schedule(() => {
                if (engine.getPhase() === 'assassination') {
                    engine.setPhase('aftermath');
                }
            }, 18000);
        }

        // Fase 5: aftermath - spill aftermath-monolog + letter-refleksjon, deretter end
        if (phase === 'aftermath' && !aftermathScheduled) {
            aftermathScheduled = true;
            const gaveLetter = engine.getFlag<boolean>('gave_letter_to_caesar');
            const reflectId = gaveLetter ? 'letter_given_reflection' : 'letter_kept_reflection';
            engine.schedule(() => engine.playMonolog(reflectId), 600);
            engine.schedule(() => engine.playMonolog('aftermath_thought'), 8000);
        }

        // Til slutt: avslutt spillet etter aftermath-monologen har spilt ferdig
        if (phase === 'aftermath' && !endScheduled && aftermathScheduled) {
            endScheduled = true;
            engine.schedule(() => engine.triggerEnd(), 22000);
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // INITIAL FASE + ANKOMST-MONOLOG
    // ═══════════════════════════════════════════════════════════════════════
    engine.setPhase('street_arrival');
    engine.schedule(() => engine.playMonolog('arrival_thought'), 1200);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function checkAdvanceToArrival(engine: GameEngineRef): void {
    const dictator = engine.getFlag<boolean>('learned_dictator_motive');
    const republic = engine.getFlag<boolean>('learned_republic_motive');
    if (dictator && republic && engine.getPhase() !== 'caesar_arrives') {
        engine.setPhase('caesar_arrives');
    }
}

function findNpcGroup(scene: THREE.Scene, id: string): THREE.Group | null {
    for (const child of scene.children) {
        if (child instanceof THREE.Group && child.userData.npcId === id) {
            return child;
        }
    }
    return null;
}

function moveCaesarToEntrance(scene: THREE.Scene, engine: GameEngineRef): void {
    const caesar = findNpcGroup(scene, 'caesar');
    if (!caesar) return;
    // Flytt Cæsar gradvis til trappa foran senatet over ca. 6 sekunder
    const start = caesar.position.clone();
    const end = new THREE.Vector3(0, 0, -14);
    const durationMs = 6000;
    const startTime = performance.now();
    let done = false;
    engine.registerUpdate(() => {
        if (done) return;
        const t = Math.min(1, (performance.now() - startTime) / durationMs);
        caesar.position.lerpVectors(start, end, t);
        if (t >= 1) done = true;
    });
}

function teleportCaesarToDeath(scene: THREE.Scene, engine: GameEngineRef): void {
    const caesar = findNpcGroup(scene, 'caesar');
    if (!caesar) return;
    caesar.position.set(0, 0, SENATE_BACK_Z + 2.8); // ved Pompey-statuens fot
    caesar.rotation.y = 0;

    // Flytt også Brutus og Cassius inn i hallen for dramatisk effekt
    const brutus = findNpcGroup(scene, 'brutus');
    if (brutus) brutus.position.set(0.8, 0, SENATE_BACK_Z + 4.0);
    const cassius = findNpcGroup(scene, 'cassius');
    if (cassius) cassius.position.set(-0.8, 0, SENATE_BACK_Z + 4.0);

    // Emosjoner: Cæsar surprised, Brutus triumphant (men indre tyngsel)
    engine.setEmotion('caesar', 'surprised');
    engine.setEmotion('brutus', 'triumphant');
    engine.setEmotion('cassius', 'triumphant');
}
