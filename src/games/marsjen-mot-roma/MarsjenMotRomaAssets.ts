import * as THREE from 'three';
import type { GameEngineRef, DialogNode } from '../engine/types';
import { addNPC, addPickup, addProp, addMonolog, addParticle, addAmbientAudio } from '../engine/declarative';
import { registerMainSunLight, registerMainHemiLight } from '../engine/sceneUserData';
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

    // Hemi + sol registrert med TimeOfDaySystem slik at de drives av timeOfDay
    // og får quality-boost på lav tier. Solen kaster skygger på medium/høy.
    const hemi = new THREE.HemisphereLight(0xb8b4ac, 0x47443e, 1.15);
    scene.add(hemi);
    registerMainHemiLight(scene, hemi);

    const sun = new THREE.DirectionalLight(0xd4cec2, 1.0);
    sun.position.set(-25, 35, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = -30;
    sc.right = sc.top = 30;
    sc.near = 1;
    sc.far = 80;
    scene.add(sun);
    registerMainSunLight(scene, sun);

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
    const staticMarcherGroups: THREE.Group[] = [];
    for (let row = 0; row < 9; row++) {
        const z = 17 - row * 2.4;
        staticMarcherGroups.push(addMarcher(scene, sceneMat, -5.4 - (row % 2) * 0.5, z));
        staticMarcherGroups.push(addMarcher(scene, sceneMat, 5.4 + (row % 2) * 0.5, z));
        if (row % 2 === 0) {
            staticMarcherGroups.push(addMarcher(scene, sceneMat, -6.9, z - 0.6));
            staticMarcherGroups.push(addMarcher(scene, sceneMat, 6.9, z - 0.6));
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
        // Gevær: trestokk (kolbe/kropp) + metallpipe
        const rifleStock = new THREE.Mesh(
            new THREE.BoxGeometry(0.05, 1.3, 0.05),
            sceneMat(0x3a2e1e, { preset: 'wood', roughness: 0.9 }),
        );
        rifleStock.position.set(0.42, 0.65, 0.05);
        s.add(rifleStock);
        const riflePipe = new THREE.Mesh(
            new THREE.BoxGeometry(0.035, 0.48, 0.035),
            sceneMat(0x4a4840, { preset: 'metal', roughness: 0.5 }),
        );
        riflePipe.position.set(0.42, 1.54, 0.05);
        s.add(riflePipe);
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
    // TOGSTASJON (Mussolinis ankomst via tog - avdukes i seieren-fasen)
    // ═══════════════════════════════════════════════════════════════════════
    const stationGroup = new THREE.Group();
    // Plattform
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.5, 4),
        sceneMat(0x5a5450, { preset: 'stone', roughness: 0.9 }),
    );
    platform.position.set(0, 0.25, 0);
    platform.receiveShadow = true;
    stationGroup.add(platform);
    // Lokomotiv-kropp
    const locoBody = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 2.2, 2.4),
        sceneMat(0x2a2420, { preset: 'metal', roughness: 0.7 }),
    );
    locoBody.position.set(-3, 1.6, 0);
    locoBody.castShadow = true;
    stationGroup.add(locoBody);
    // Pipe
    const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.28, 0.9, 8),
        sceneMat(0x1a1a1a, { preset: 'metal', roughness: 0.8 }),
    );
    chimney.position.set(-4.5, 2.95, 0);
    chimney.castShadow = true;
    stationGroup.add(chimney);
    // Dekorative hjul (3 par)
    const wheelZOffsets = [1.3, -1.3];
    const wheelXPositions = [-2, -3.5, -5];
    for (const wx of wheelXPositions) {
        for (const wz of wheelZOffsets) {
            const wheel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.5, 0.5, 0.2, 12),
                sceneMat(0x1a1a1a, { preset: 'metal', roughness: 0.6 }),
            );
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(wx, -0.3, wz);
            stationGroup.add(wheel);
        }
    }
    stationGroup.position.set(-18, 0, 5);
    scene.add(stationGroup);
    addParticle(engine, { id: 'train-steam', preset: 'steam', pos: [-22.5, 3.5, 5], scale: 1.2 });

    // ═══════════════════════════════════════════════════════════════════════
    // ANIMERTE MARSJ-FIGURER (beveger seg langs veien i loop)
    // ═══════════════════════════════════════════════════════════════════════
    type MarchNPC = { group: THREE.Group; z: number; speed: number; minZ: number; maxZ: number; dir: number };
    const marchNPCs: MarchNPC[] = [];
    const marchNPCData = [
        { x: -5.6, z: 21, speed: 0.7, minZ: 3, maxZ: 23 },
        { x: 5.8, z: 19, speed: 0.8, minZ: 3, maxZ: 21 },
        { x: -6.0, z: 15, speed: 0.65, minZ: 2, maxZ: 17 },
        { x: 5.2, z: 13, speed: 0.75, minZ: 2, maxZ: 15 },
        { x: -4.6, z: 9, speed: 0.6, minZ: 1, maxZ: 11 },
        { x: 6.2, z: 7, speed: 0.85, minZ: 1, maxZ: 9 },
        { x: -5.0, z: 5, speed: 0.72, minZ: 0, maxZ: 7 },
        { x: 4.8, z: 3, speed: 0.78, minZ: 0, maxZ: 5 },
    ];
    for (const d of marchNPCData) {
        const g = makeFigure(sceneMat, 0x26262a, 0xc89868, 0x16161a);
        g.position.set(d.x, 0, d.z);
        scene.add(g);
        marchNPCs.push({ group: g, z: d.z, speed: d.speed, minZ: d.minZ, maxZ: d.maxZ, dir: -1 });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // KONG VIKTOR og MUSSOLINI (statiske figurer, skjult inntil cinematics)
    // ═══════════════════════════════════════════════════════════════════════
    const kongViktorGroup = makeFigure(sceneMat, 0x9a8454, 0xcea078, 0x5c4e30); // gyllen uniform
    kongViktorGroup.position.set(100, 5, -19); // off-screen, avsløres ved klimaks
    scene.add(kongViktorGroup);

    const mussoliniGroup = makeFigure(sceneMat, 0x2a2622, 0xcea078, 0x1a1612); // mørk dress
    mussoliniGroup.position.set(100, 0, 5); // off-screen, avsløres ved seieren
    scene.add(mussoliniGroup);

    // Budbringer på hest (rir inn under kongens-valg-fasen, synkronisert med kongen_taler-monologen)
    const messengerHorse = makeHorseAndRider(sceneMat);
    messengerHorse.group.position.set(100, 0, 0); // off-screen inntil aktivert
    scene.add(messengerHorse.group);

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
        onPickup: () => engine.schedule(() => engine.playMonolog('lese_flyveblad'), 600),
    });

    // ═══════════════════════════════════════════════════════════════════════
    // PROPAGANDA-PLAKATER (interaktive — E for å undersøke)
    // ═══════════════════════════════════════════════════════════════════════
    // Plakat 1: På veggen av bygning ved leiren (nord for Carlo, sør for marsj-kolonnen)
    const plakat1 = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.8, 0.06),
        sceneMat(0x8a1a14, { preset: 'stone', roughness: 0.85 }),
    );
    plakat1.position.set(-7.7, 2.2, 14);
    plakat1.castShadow = false;
    scene.add(plakat1);
    // Lys tekst-imitasjon
    const plakatTekst1 = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.2, 0.07),
        sceneMat(0xf4e4c1, { preset: 'cloth', roughness: 1 }),
    );
    plakatTekst1.position.set(-7.7, 2.5, 14.04);
    scene.add(plakatTekst1);
    engine.registerInteract(plakat1, {
        label: 'Les plakaten (E)',
        radius: 3,
        onInteract: () => {
            engine.unregisterInteract(plakat1);
            engine.playMonolog('plakat_svart');
        },
    });

    // Plakat 2: Lenger nord langs ruten, på høyre bygning
    const plakat2 = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.8, 0.06),
        sceneMat(0x1a1a1e, { preset: 'stone', roughness: 0.85 }),
    );
    plakat2.position.set(8.7, 2.2, 2);
    plakat2.castShadow = false;
    scene.add(plakat2);
    const plakatTekst2 = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.2, 0.07),
        sceneMat(0xf4e4c1, { preset: 'cloth', roughness: 1 }),
    );
    plakatTekst2.position.set(8.7, 2.6, 2.04);
    scene.add(plakatTekst2);
    engine.registerInteract(plakat2, {
        label: 'Les plakaten (E)',
        radius: 3,
        onInteract: () => {
            engine.unregisterInteract(plakat2);
            engine.playMonolog('plakat_vilje');
        },
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
    addMonolog(engine, {
        id: 'marsj_rop',
        lines: marsjenMotRomaMonologs.marsj_rop.lines,
        once: true,
        trigger: { type: 'proximity', pos: [0, 0, 11], radius: 4 },
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
    // QUIZ: siste steg i puzzle setter kongens-valg-fasen i gang
    // ═══════════════════════════════════════════════════════════════════════
    const puzzleConfig = engine.config.puzzle;
    if (puzzleConfig?.steps?.length) {
        const lastStep = puzzleConfig.steps[puzzleConfig.steps.length - 1];
        const existingOnCorrect = lastStep.onCorrect;
        lastStep.onCorrect = () => {
            existingOnCorrect?.();
            engine.schedule(() => engine.setPhase('kongens-valg'), 1200);
        };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FASEPROGRESJON
    // ═══════════════════════════════════════════════════════════════════════
    let climaxStarted = false;
    let endScheduled = false;
    let soldiersAside = false;
    const soldierTargetX = 11;
    let elapsedTime = 0;
    let messengerRiding = false;
    let messengerArrived = false;
    let messengerTime = 0;
    const MESSENGER_TARGET = new THREE.Vector3(5.5, 0, -2.5);
    const MESSENGER_SPEED = 5.2;

    engine.registerUpdate((dt) => {
        elapsedTime += dt;
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

        // Klimaks: kongen vises, cinema, hæren trekker seg, veien åpnes
        if (phase === 'kongens-valg' && !climaxStarted) {
            climaxStarted = true;
            // 700ms: «Alle venter...»-monolog (synkronisert med kongecinematics)
            engine.schedule(() => engine.playMonolog('venter'), 700);
            // 3000ms: Vis kongen ved palasset
            engine.schedule(() => {
                // Kongen foran palasstrappen (z=-16 er foran fasaden, front er z=-17.5)
                kongViktorGroup.position.set(-2, 0, -16);
                void engine.playCinematic([
                    // Vidvinkel fra høyre: palasset bak kongen
                    { duration: 4, cameraPos: [9, 3.5, -8], lookAt: [-2, 1.1, -16], fov: 50, transition: 'fade' },
                    // Nærbilde: kongen ved palasstrappen
                    { duration: 3.5, cameraPos: [2, 1.8, -11], lookAt: [-2, 1.25, -16], fov: 42, transition: 'cut' },
                    // Tilbake til gateplanet — spenning
                    { duration: 3, cameraPos: [0, 3, -5], lookAt: [0, 1, -14], fov: 55, transition: 'fade' },
                ]);
            }, 3000);
            // 13000ms: Start budbringer-hest (cinematicen slutter ~13.5s, hesten ankommer ~16.6s)
            engine.schedule(() => {
                messengerHorse.group.position.set(22, 0, -12);
                messengerRiding = true;
            }, 13000);
            // 16000ms: Kongens beslutning avsløres (etter cinematicen ~14.5s er ferdig)
            engine.schedule(() => {
                engine.playMonolog('kongen_taler');
                engine.setFlag('king_caved', true);
                engine.removeStaticCollider(barrier);
                barrier.visible = false;
                soldiersAside = true;
                kongViktorGroup.position.set(100, 0, -16); // Skjul kongen før Mussolini ankommer
                engine.setPhase('seieren');
            }, 16000);
        }

        // Seieren: Mussolini ankommer med tog, deretter avsluttende refleksjon
        if (phase === 'seieren' && !endScheduled) {
            endScheduled = true;
            // 8000ms: Skjul budbringer-hesten (ikke lenger relevant)
            engine.schedule(() => {
                messengerHorse.group.position.set(100, 0, 0);
                messengerRiding = false;
            }, 8000);
            // 12000ms: Mussolini-sekvens (etter kongen_taler ~10.5s er ferdig)
            // fadeToBlack → plasser Mussolini → cinematicens transition:'fade' tar over fra svart
            engine.schedule(() => {
                engine.fadeToBlack(800);
                engine.schedule(() => {
                    // Mussolini ved palassportene (z=-16 = foran fasaden, klart fra bygninger)
                    mussoliniGroup.position.set(4, 0, -16);
                    void engine.playCinematic([
                        // Vidvinkel: palasset fra venstre, Mussolini ved trappen
                        { duration: 3.5, cameraPos: [-9, 3.5, -8], lookAt: [2, 1.1, -16], fov: 52, transition: 'fade' },
                        // Nærbilde: Mussolini ved palassportene
                        { duration: 3, cameraPos: [-1, 1.8, -11], lookAt: [4, 1.25, -16], fov: 45, transition: 'cut' },
                    ]);
                    engine.schedule(() => engine.playMonolog('tog_ankomst'), 2000);
                }, 900);
            }, 12000);
            // 24000ms: Avsluttende refleksjon (etter Mussolini-sekvens ~9s er ferdig)
            engine.schedule(() => engine.playMonolog('seier_refleksjon'), 24000);
            engine.schedule(() => engine.triggerEnd(), 37000);
        }

        // Animér soldatene som skrider til side
        if (soldiersAside && soldierGroup.position.x < soldierTargetX - 0.05) {
            soldierGroup.position.x += (soldierTargetX - soldierGroup.position.x) * Math.min(1, dt * 1.5);
        }

        // Subtil pust/svai-animasjon på statiske marsjfigurer
        for (let i = 0; i < staticMarcherGroups.length; i++) {
            const g = staticMarcherGroups[i];
            g.position.y = Math.sin(elapsedTime * 1.2 + i * 0.7) * 0.04;
            g.rotation.z = Math.sin(elapsedTime * 0.8 + i * 1.1) * 0.03;
        }

        // Beveg marsjerende NPC-kolonner frem og tilbake
        for (const m of marchNPCs) {
            m.z += m.dir * m.speed * dt;
            if (m.z < m.minZ) { m.z = m.minZ; m.dir = 1; }
            if (m.z > m.maxZ) { m.z = m.maxZ; m.dir = -1; }
            m.group.position.z = m.z;
            m.group.rotation.y = m.dir > 0 ? Math.PI : 0;
            m.group.position.y = Math.sin(elapsedTime * 1.8 + m.speed * 10) * 0.03;
        }

        // Budbringer på hest rider inn fra høyre side mot kapteinen
        if (messengerRiding && !messengerArrived) {
            messengerTime += dt;
            const pos = messengerHorse.group.position;
            const diff = MESSENGER_TARGET.clone().sub(pos);
            const dist = diff.length();
            if (dist < 0.5) {
                messengerArrived = true;
                pos.x = MESSENGER_TARGET.x;
                pos.z = MESSENGER_TARGET.z;
                // Vend mot kapteinen
                messengerHorse.group.rotation.y = Math.atan2(2.6 - pos.x, -3.6 - pos.z);
                messengerHorse.group.position.y = 0;
            } else {
                const step = Math.min(MESSENGER_SPEED * dt, dist);
                diff.normalize().multiplyScalar(step);
                pos.x += diff.x;
                pos.z += diff.z;
                messengerHorse.group.rotation.y = Math.atan2(diff.x, diff.z);
                // Galopperingsanimasjon: bobling + benvipping
                messengerHorse.group.position.y = Math.sin(messengerTime * 14) * 0.07;
                messengerHorse.group.rotation.z = Math.sin(messengerTime * 14 + Math.PI) * 0.035;
                for (let i = 0; i < messengerHorse.legs.length; i++) {
                    messengerHorse.legs[i].rotation.x = Math.sin(messengerTime * 14 + i * Math.PI) * 0.45;
                }
            }
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
        // Åpne quiz for å aktivere kongens-valg. Siste puzzle-steg setter fasen.
        engine.schedule(() => engine.openPuzzle(), 800);
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
): THREE.Group {
    const g = makeFigure(sceneMat, 0x26262a, 0xc89868, 0x16161a);
    g.position.set(x, 0, z);
    scene.add(g);
    return g;
}

function makeHorseAndRider(
    sceneMat: GameEngineRef['sceneMat'],
): { group: THREE.Group; legs: THREE.Mesh[] } {
    const g = new THREE.Group();
    const brown = sceneMat(0x7a5030, { preset: 'cloth', roughness: 1 });
    const darkBrown = sceneMat(0x4a3018, { preset: 'cloth', roughness: 1 });

    // Hestekropp
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.55, 1.5), brown);
    body.position.set(0, 1.1, 0);
    g.add(body);

    // Bakparti (hestens rygg er høyere bak)
    const rump = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.32, 0.52), brown);
    rump.position.set(0, 1.42, -0.4);
    g.add(rump);

    // Hals
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.52, 0.26), brown);
    neck.position.set(0, 1.54, 0.56);
    neck.rotation.x = -0.35;
    g.add(neck);

    // Hestehode
    const horseHead = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.42), brown);
    horseHead.position.set(0, 1.82, 0.86);
    g.add(horseHead);

    // 4 ben (indices: 0=front-left, 1=front-right, 2=back-left, 3=back-right)
    const legGeom = new THREE.CylinderGeometry(0.08, 0.09, 0.9, 6);
    const legXZ: Array<[number, number]> = [[-0.22, 0.42], [0.22, 0.42], [-0.22, -0.42], [0.22, -0.42]];
    const legs: THREE.Mesh[] = [];
    for (const [lx, lz] of legXZ) {
        const leg = new THREE.Mesh(legGeom, darkBrown);
        leg.position.set(lx, 0.45, lz);
        g.add(leg);
        legs.push(leg);
    }

    // Rytter kropp
    const riderBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.21, 0.65, 8),
        sceneMat(0x2e2a26, { preset: 'cloth', roughness: 1 }),
    );
    riderBody.position.set(0, 1.95, 0);
    g.add(riderBody);

    // Rytter hode
    const riderHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        sceneMat(0xcea078, { preset: 'cloth', roughness: 0.8 }),
    );
    riderHead.position.set(0, 2.46, 0);
    g.add(riderHead);

    // Rytter hatt
    const hat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.17, 0.17, 0.11, 8),
        sceneMat(0x1a1614, { preset: 'cloth', roughness: 1 }),
    );
    hat.position.set(0, 2.62, 0);
    g.add(hat);

    return { group: g, legs };
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
