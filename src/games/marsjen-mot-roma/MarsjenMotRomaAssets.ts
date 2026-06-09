import * as THREE from 'three';
import type { GameEngineRef, DialogNode, CinematicShot } from '../engine/types';
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
// Sidetorg mot vest (-X) rundt det utbrente trykkeriet.
const BARRIER_Z = -6; // hærens veisperring blokkerer veien her til klimakset

// De tre svar-notatene syntese-puzzlen krever. checkClimax åpner ikke puzzlen før
// alle tre er samlet, så finalen aldri soft-låser.
const REQUIRED_NOTES = ['notat-darlig-bevaepnet', 'notat-fascismens-natur', 'notat-elitens-svik'];

export function setupMarsjenMotRomaScene(engine: GameEngineRef): void {
    const { scene, sceneMat } = engine;

    // ═══════════════════════════════════════════════════════════════════════
    // VÆR + FILL-LYS (overskyet, regnvåt oktoberdag - som den ekte marsjen)
    // Atmosfæren er dynamisk: vær/lys endrer seg per fase (se atmosfære-buen lenger nede).
    // ═══════════════════════════════════════════════════════════════════════
    engine.setWeather({ type: 'rain', intensity: 0.4 });

    // Hemi + sol registrert med TimeOfDaySystem slik at de drives av timeOfDay
    // og får quality-boost på lav tier. Solen kaster skygger på medium/høy.
    // VIKTIG: ikke override sun.intensity i update-loopen — TimeOfDaySystem driver
    // intensiteten inkl. qualityBoost (1.5× på lav tier). Kun fargeovergangen beholdes.
    const hemi = new THREE.HemisphereLight(0xb8b4ac, 0x47443e, 1.4);
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
    // Farger brukt av atmosfære-buen for å varme solen i klimaks.
    const sunBaseColor = new THREE.Color(0xd4cec2);
    const sunWarmColor = new THREE.Color(0xf6e2b8);

    // ═══════════════════════════════════════════════════════════════════════
    // BAKKE + VEI
    // ═══════════════════════════════════════════════════════════════════════
    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(56, 1, 96),
        sceneMat(0x4f4738, { preset: 'soil', roughness: 1.0 }),
    );
    ground.position.set(-4, -0.5, -6); // forskjøvet vest for å romme sidetorget
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

    // Sidegate mot vest (inn til trykkeri-torget) - brutt korridor, lateral dybde
    const alley = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.06, 5),
        sceneMat(0x3c3833, { preset: 'stone', roughness: 0.95 }),
    );
    alley.position.set(-10, 0.03, 5);
    alley.receiveShadow = true;
    scene.add(alley);

    // Blanke vannpytter (regnet ligger i søkk) - rent visuelt
    const puddlePositions: [number, number][] = [
        [-1.5, 18], [2, 9], [-2, 1], [1, -9], [-1, -16], [-10, 4], [-12, 7],
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
        [11, 6, 6, 5, 4.8, 0xb47a52],
        [12, -1, 7, 6, 6.5, 0xa06438],
        [-12, -11, 7, 7, 7, 0x986848],
        [12, -12, 7, 7, 7, 0x9a6240],
        // Sidetorget mot vest (rammer inn trykkeriet)
        [-15, 2, 5, 5, 5, 0x9c6038],
        [-15, 9, 6, 5, 5.5, 0xa86c44],
    ];
    for (let i = 0; i < buildings.length; i++) {
        const [x, z, w, d, h, color] = buildings[i];
        addBuilding(scene, sceneMat, x, z, w, d, h, color);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SVARTSKJORTE-KOLONNER (tusenvis antydet med tette, tåke-graderte rekker)
    // Nære rekker = detaljerte figurer; fjerne rekker forsvinner i tåka i begge ender.
    // ═══════════════════════════════════════════════════════════════════════
    const staticMarcherGroups: THREE.Group[] = [];
    for (let row = 0; row < 11; row++) {
        const z = 19 - row * 2.4;
        staticMarcherGroups.push(addMarcher(scene, sceneMat, -5.4 - (row % 2) * 0.5, z));
        staticMarcherGroups.push(addMarcher(scene, sceneMat, 5.4 + (row % 2) * 0.5, z));
        if (row % 2 === 0) {
            staticMarcherGroups.push(addMarcher(scene, sceneMat, -6.9, z - 0.6));
            staticMarcherGroups.push(addMarcher(scene, sceneMat, 6.9, z - 0.6));
        }
    }
    // Fjerne silhuett-rekker som drukner i tåka mot Roma (-Z) og bakover (+Z) -
    // gir inntrykk av at marsjen ikke har noen ende. Billige (ingen skygge).
    for (let row = 0; row < 6; row++) {
        addSilhouetteRow(scene, sceneMat, -10 - row * 3.5); // mot Roma
        addSilhouetteRow(scene, sceneMat, 24 + row * 3.5); // bakover, uendelige rekker
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
    // På sidetorget mot vest. Linse-mål: «Se nærmere» → notat-volden.
    // ═══════════════════════════════════════════════════════════════════════
    const ruinWall = new THREE.Mesh(
        new THREE.BoxGeometry(6, 4, 5),
        sceneMat(0x1d1813, { preset: 'stone', roughness: 0.95 }),
    );
    ruinWall.position.set(-11, 2, 4);
    ruinWall.castShadow = true;
    ruinWall.receiveShadow = true;
    ruinWall.userData.solid = true;
    scene.add(ruinWall);
    // Innfalt takbjelke
    const beam = new THREE.Mesh(
        new THREE.BoxGeometry(5, 0.3, 0.3),
        sceneMat(0x14110d, { preset: 'wood', roughness: 1 }),
    );
    beam.position.set(-10.4, 3.1, 5.4);
    beam.rotation.z = 0.5;
    beam.castShadow = true;
    scene.add(beam);
    addParticle(engine, { id: 'ruin-smoke', preset: 'smoke', pos: [-11, 4.4, 4], scale: 1.6 });

    // ═══════════════════════════════════════════════════════════════════════
    // VÅPENBOD (linse-mål #2: «Se nærmere på våpnene» → notat-darlig-bevaepnet)
    // Plassert tydelig langs hovedveien så den ikke kan overses (kreves for finalen).
    // ═══════════════════════════════════════════════════════════════════════
    const weaponRack = makeWeaponRack(scene, sceneMat);
    weaponRack.position.set(-3.6, 0, 13);

    // ═══════════════════════════════════════════════════════════════════════
    // VOGN (vista-mål: «Klatre opp» → cinematic over havet av svartskjorter)
    // ═══════════════════════════════════════════════════════════════════════
    const cart = makeCart(scene, sceneMat);
    cart.position.set(6, 0, 19);

    // ═══════════════════════════════════════════════════════════════════════
    // TROMME (valgfri rytme-aktivitet: kjenn korsangens dragning på kroppen)
    // ═══════════════════════════════════════════════════════════════════════
    const drum = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.7, 16),
        sceneMat(0x6e2018, { preset: 'wood', roughness: 0.8 }),
    );
    drum.position.set(3.4, 0.7, 12);
    drum.castShadow = true;
    drum.userData.solid = true;
    scene.add(drum);

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
    let linseSoldierBody: THREE.Mesh | null = null;
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
        if (i === 1) linseSoldierBody = s.children[0] as THREE.Mesh; // linse-mål #5
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

    // Linse-mål #1: en nær marsjerende - «Se nærmere» avslører den våte gutten med kosteskaft
    const linseMarcher = makeFigure(sceneMat, 0x26262a, 0xc89868, 0x16161a);
    linseMarcher.position.set(3.4, 0, 20.5);
    // Liten kosteskaft i hånda (avsløres ved push-in)
    const broom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.7, 6),
        sceneMat(0x7a5a32, { preset: 'wood', roughness: 1 }),
    );
    broom.position.set(0.34, 0.9, 0.05);
    broom.rotation.z = 0.18;
    linseMarcher.add(broom);
    scene.add(linseMarcher);

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
        questMarker: true,
        dialogs: ginoDialogs,
    });

    addNPC(engine, {
        id: 'pietro',
        name: 'Pietro',
        characterType: 'farmer',
        pos: [-10, 0, 7], // flyttet til sidetorget ved trykkeriet
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

    // Liten livspustende vandring på de tidlige NPC-ene (de er fortsatt lette å snakke
    // med - E virker uansett posisjon). Renzi/Conti står i ro (i givakt/på vakt).
    engine.assignRoute({
        characterId: 'carlo',
        waypoints: [[-3, 23], [-2.2, 23.4], [-3, 23]],
        mode: 'pingpong',
        speed: 0.25,
        pauseMs: 2600,
    });
    engine.assignRoute({
        characterId: 'gino',
        waypoints: [[3, 9], [3.6, 9.5], [3, 9]],
        mode: 'pingpong',
        speed: 0.3,
        pauseMs: 2200,
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
    // SANNHETENS LINSE - de fysiske avsløringene (E: «Se nærmere»)
    // Avstandsbildet (løgnen) vs. nærbildet (sannheten). Hver gir et notat.
    // ═══════════════════════════════════════════════════════════════════════
    // #1 Marsjerende (hero-avsløring m/ push-in): hæren er en kledning
    wireLinse(engine, linseMarcher.children[0] as THREE.Mesh, {
        label: 'Se nærmere (E)',
        monolog: 'linse_marsjer',
        note: 'notat-haeren-kledning',
        flag: 'saw_costume',
        radius: 3,
        pushIn: [
            { duration: 1.7, cameraPos: [3.4, 1.5, 22.4], lookAt: [3.4, 1.0, 20.5], fov: 36, transition: 'cut' },
        ],
    });
    // #2 Våpnene (hero-avsløring m/ push-in): militært maktesløs - KREVES for finalen
    wireLinse(engine, weaponRack.children[0] as THREE.Mesh, {
        label: 'Se nærmere på våpnene (E)',
        monolog: 'linse_vaapen',
        note: 'notat-darlig-bevaepnet',
        flag: 'saw_weapons',
        radius: 3,
        pushIn: [
            { duration: 1.7, cameraPos: [-3.6, 1.3, 14.8], lookAt: [-3.6, 0.8, 13], fov: 38, transition: 'cut' },
        ],
        onAfter: () => checkClimax(engine),
    });
    // #4 Trykkeriet: volden er politikken
    wireLinse(engine, ruinWall, {
        label: 'Se nærmere på ruinene (E)',
        monolog: 'trykkeriet',
        note: 'notat-volden',
        flag: 'saw_arson',
        radius: 4,
    });
    // #5 Soldaten ved sperringen: den ekte hæren er lammet
    if (linseSoldierBody) {
        wireLinse(engine, linseSoldierBody, {
            label: 'Se nærmere på soldatene (E)',
            monolog: 'linse_soldat',
            note: 'notat-haeren-lammet',
            flag: 'saw_real_army',
            radius: 3.5,
        });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROPAGANDA-PLAKATER (#3: «Se nærmere» → notat-propaganda)
    // ═══════════════════════════════════════════════════════════════════════
    const plakat1 = makePoster(scene, sceneMat, -7.7, 14, 0x8a1a14);
    wireLinse(engine, plakat1, {
        label: 'Les plakaten (E)',
        monolog: 'plakat_svart',
        note: 'notat-propaganda',
        flag: 'saw_propaganda',
        radius: 3,
    });
    const plakat2 = makePoster(scene, sceneMat, 8.7, 2, 0x1a1a1e);
    wireLinse(engine, plakat2, {
        label: 'Les plakaten (E)',
        monolog: 'plakat_vilje',
        note: 'notat-propaganda', // samme notat - wireLinse legger ikke til duplikat
        radius: 3,
    });

    // ═══════════════════════════════════════════════════════════════════════
    // VISTA (valgfri): klatre opp på vogna og se utover havet av svartskjorter
    // ═══════════════════════════════════════════════════════════════════════
    engine.registerInteract(cart.children[0] as THREE.Mesh, {
        label: 'Klatre opp på vogna (E)',
        radius: 3,
        onInteract: () => {
            engine.unregisterInteract(cart.children[0] as THREE.Mesh);
            void engine.playCinematic([
                { duration: 3.2, cameraPos: [6, 4.2, 21], lookAt: [0, 1.2, 4], fov: 58, transition: 'fade' },
                { duration: 3.0, cameraPos: [6, 4.4, 19], lookAt: [0, 1.2, -10], fov: 54, transition: 'cut' },
            ]);
            engine.schedule(() => engine.playMonolog('vista'), 600);
        },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // TROMME-AKTIVITET (valgfri rytme-beat: kjenn korsangens dragning)
    // ═══════════════════════════════════════════════════════════════════════
    engine.registerInteract(drum, {
        label: 'Slå med på trommen (E)',
        radius: 2.5,
        onInteract: () => {
            engine.openActivity({
                id: 'korsang',
                label: 'Korsangen',
                prompt: 'Trykk MELLOMROM i takt med slagene: «A noi! A noi!»',
                variant: 'rhythm',
                durationMs: 6000,
                windowMs: 720,
                successThreshold: 0.55,
                onSuccess: () => {
                    engine.setFlag('felt_the_pull', true);
                    engine.schedule(() => engine.playMonolog('marsj_rop'), 300);
                },
                onFail: () => engine.playMonolog('marsj_rop'),
            });
        },
    });

    // ═══════════════════════════════════════════════════════════════════════
    // MONOLOGER
    // ═══════════════════════════════════════════════════════════════════════
    for (const node of Object.values(marsjenMotRomaMonologs)) {
        engine.registerMonolog(node);
    }
    // Proximity-teaser ved sperringen (selve notatet gis via linse på soldaten)
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
    // DIALOG-ACTIONS (kobler engine-flagg + notater på dialog-noder)
    // ═══════════════════════════════════════════════════════════════════════
    const dialogs = engine.config.dialogs;

    // VIKTIG: node.onEnd fyrer KUN på noden der spilleren velger et `next:null`-valg
    // (ikke på mellomnoder man navigerer videre fra). Derfor settes gating-flagg via
    // choice.action i det øyeblikket spilleren ENGASJERER temaet - uavhengig av hvor
    // dypt de navigerer eller hvor de avslutter. checkClimax kjøres når samtalen LUKKES
    // (onEnd på alle Renzi/Conti-noder; bare terminal-noden fyrer = riktig timing).

    // Carlo (ikke gating - bare marker + flavor-flagg)
    wireChoiceAction(dialogs, ['carlo_mussolini', 'carlo_why', 'carlo_quiz_sosialist'], () => {
        engine.setFlag('learned_mussolini_background', true);
        engine.setCharacterMarkerVisible('carlo', false);
    });

    // Gino: fascismens kjerne (gir svar-notatet, men er IKKE påkrevd for å åpne finalen -
    // checkClimax fyller inn manglende notater som sikkerhetsnett)
    wireChoiceAction(dialogs, ['gino_creed'], () => {
        engine.setFlag('learned_fascism_traits', true);
        engine.setCharacterMarkerVisible('gino', false);
        grantNote(engine, 'notat-fascismens-natur');
    });
    wireChoiceAction(dialogs, ['gino_violence'], () => {
        engine.setFlag('saw_squadristi_violence', true);
        engine.setCharacterMarkerVisible('gino', false);
    });

    wireChoiceAction(dialogs, ['pietro_state'], () =>
        engine.setFlag('saw_squadristi_violence', true),
    );

    // Renzi: bløffen (gating-flagg). Settes så snart spilleren spør om hæren kan stoppe
    // marsjen ELLER hvorfor de venter - dekker alle grener inkl. quiz.
    wireChoiceAction(dialogs, ['kaptein_bluff', 'kaptein_orders', 'kaptein_quiz_ordre'], () => {
        engine.setFlag('learned_bluff', true);
        engine.setCharacterMarkerVisible('kaptein', false);
        grantNote(engine, 'notat-darlig-bevaepnet'); // Renzis poeng: dårlig bevæpnet
    });

    // Conti: elitens motiv (gating-flagg). Settes ved begge inngangsvalg.
    wireChoiceAction(dialogs, ['conti_motive', 'conti_compare'], () => {
        engine.setFlag('learned_elite_motive', true);
        engine.setCharacterMarkerVisible('conti', false);
        grantNote(engine, 'notat-elitens-svik');
    });
    wireChoiceAction(dialogs, ['conti_compare'], () =>
        engine.setFlag('compared_communism', true),
    );

    // Åpne syntese-finalen når spilleren LUKKER en Renzi/Conti-samtale og begge
    // gating-flagg er satt. onEnd på alle noder → bare terminal-noden fyrer = ved lukking.
    for (const key of [
        'kaptein_greeting', 'kaptein_bluff', 'kaptein_orders', 'kaptein_quiz_ordre', 'kaptein_quiz_riktig',
        'conti_greeting', 'conti_motive', 'conti_compare',
    ]) {
        wireDialogEnd(dialogs, key, () => checkClimax(engine));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SYNTESE-PUZZLE: riktig forsidesak starter kongens-valg-fasen
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
    // ATMOSFÆRE-BUE: vær + lys følger fortellingen (verden forteller historien)
    // ═══════════════════════════════════════════════════════════════════════
    let todCurrent = 0.42; // lokal sannhet for timeOfDay (lerpes mot mål)
    let todTarget = 0.42;
    let atmospherePhase = '';
    function applyAtmosphere(phase: string): void {
        switch (phase) {
            case 'samling':
                engine.setWeather({ type: 'rain', intensity: 0.4 });
                todTarget = 0.42;
                break;
            case 'marsjen':
                engine.setWeather({ type: 'rain', intensity: 0.3 }); // regnet letner
                todTarget = 0.44;
                break;
            case 'bloeffen':
                engine.setWeather({ type: 'clear', intensity: 0 }); // regnet stopper, uhyggelig stille
                todTarget = 0.43;
                break;
            case 'kongens-valg':
                engine.setWeather({ type: 'clear', intensity: 0 });
                todTarget = 0.60; // ettermiddagssol bryter gjennom — TimeOfDaySystem driver intensitet inkl. qualityBoost
                engine.setBloom(0.55);
                break;
            case 'seieren':
                engine.setWeather({ type: 'fog', intensity: 0.3 });
                todTarget = 0.32; // grått igjen, mot demring - hul «seier»
                break;
        }
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

        // Atmosfære-bytte når fasen skifter
        if (phase !== atmospherePhase) {
            atmospherePhase = phase;
            applyAtmosphere(phase);
        }
        // Myk overgang av timeOfDay mot målet (cheap lerp)
        if (Math.abs(todCurrent - todTarget) > 0.001) {
            todCurrent += (todTarget - todCurrent) * Math.min(1, dt * 0.6);
            engine.setTimeOfDay(todCurrent);
        }
        // Solfarge varmes i klimaks — intensiteten drives av TimeOfDaySystem (inkl. qualityBoost)
        if (phase === 'kongens-valg' || phase === 'seieren') {
            sun.color.lerp(sunWarmColor, Math.min(1, dt * 0.8));
        } else {
            sun.color.lerp(sunBaseColor, Math.min(1, dt * 0.5));
        }

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
                void engine.fadeToBlack(800);
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

// Legg et notat i notatboka uten å lage duplikat (notat-items er stackable:false).
function grantNote(engine: GameEngineRef, itemId: string): void {
    if (!engine.hasItem(itemId)) engine.addItem(itemId);
}

interface LinseOpts {
    label: string;
    monolog: string;
    note: string;
    flag?: string;
    radius?: number;
    pushIn?: CinematicShot[];
    onAfter?: () => void;
}

// Sannhetens linse: «Se nærmere» på en mesh. Avslører sannheten (monolog), legger et
// notat i notatboka, setter et flagg, og kan kjøre en kort kamera-push-in for de
// sterke avsløringene. Engangsbruk (unregistrerer interaksjonen).
function wireLinse(engine: GameEngineRef, mesh: THREE.Mesh, opts: LinseOpts): void {
    engine.registerInteract(mesh, {
        label: opts.label,
        radius: opts.radius ?? 3,
        onInteract: () => {
            engine.unregisterInteract(mesh);
            if (opts.flag) engine.setFlag(opts.flag, true);
            grantNote(engine, opts.note);
            if (opts.pushIn) {
                void engine.playCinematic(opts.pushIn);
                engine.schedule(() => engine.playMonolog(opts.monolog), 300);
            } else {
                engine.playMonolog(opts.monolog);
            }
            opts.onAfter?.();
        },
    });
}

// Åpner syntese-puzzlen når spilleren har snakket med offiseren (Renzi → learned_bluff)
// OG industrieieren (Conti → learned_elite_motive). Gating KUN på disse to (de eneste
// obligatoriske NPC-ene), så finalen aldri soft-låser. Som sikkerhetsnett garanteres
// de tre svar-notatene før puzzlen åpner: notater fra valgfrie linse-/Gino-funn man har
// gjort beholdes, og det som mangler fylles inn (journalisten setter sammen bildet av alt
// han har sett). Slik er syntesen alltid løsbar uansett rekkefølge eller utforskning.
function checkClimax(engine: GameEngineRef): void {
    if (engine.getPhase() !== 'bloeffen') return;
    if (engine.getFlag<boolean>('puzzle_started')) return;
    if (!engine.getFlag<boolean>('learned_bluff')) return;
    if (!engine.getFlag<boolean>('learned_elite_motive')) return;

    // Sikkerhetsnett: garanter at de tre svar-notatene finnes (ingen duplikat).
    for (const id of REQUIRED_NOTES) {
        if (!engine.hasItem(id)) engine.addItem(id);
    }
    engine.setFlag('puzzle_started', true);
    engine.schedule(() => engine.openPuzzle(), 800);
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

// Legg en handling på ALLE valg som leder til en av `nextTargets`-nodene. Brukes til å
// sette gating-flagg i det øyeblikket spilleren engasjerer et tema - robust mot at
// node.onEnd kun fyrer på terminal-noder (se forklaring der dette kalles).
function wireChoiceAction(
    dialogs: Record<string, DialogNode | DialogNode[]>,
    nextTargets: string[],
    action: () => void,
): void {
    const targetSet = new Set(nextTargets);
    for (const entry of Object.values(dialogs)) {
        const nodes = Array.isArray(entry) ? entry : [entry];
        for (const node of nodes) {
            for (const choice of node.choices) {
                if (choice.next && targetSet.has(choice.next)) {
                    const existing = choice.action;
                    choice.action = (): void => {
                        existing?.();
                        action();
                    };
                }
            }
        }
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

// Billig silhuett-rekke som drukner i tåka (ingen skygge, mørk). Antyder uendelige
// rekker uten å koste figur-detaljer.
function addSilhouetteRow(
    scene: THREE.Scene,
    sceneMat: GameEngineRef['sceneMat'],
    z: number,
): void {
    const mat = sceneMat(0x1a1a1e, { preset: 'cloth', roughness: 1 });
    for (let i = 0; i < 8; i++) {
        const x = -7 + i * 2;
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.36, 1.5, 6), mat);
        body.position.set(x + (i % 2) * 0.4, 0.75, z);
        scene.add(body);
    }
}

// Våpenbod: lent bunt av staur + et par rustne gevær. Linse-mål for «dårlig bevæpnet».
function makeWeaponRack(scene: THREE.Scene, sceneMat: GameEngineRef['sceneMat']): THREE.Group {
    const g = new THREE.Group();
    const stand = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.9, 0.5),
        sceneMat(0x5a4632, { preset: 'wood', roughness: 0.9 }),
    );
    stand.position.y = 0.45;
    stand.castShadow = true;
    stand.userData.solid = true;
    g.add(stand);
    // Lente staur og rifler
    const stickMat = sceneMat(0x7a5a32, { preset: 'wood', roughness: 1 });
    for (let i = 0; i < 6; i++) {
        const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6), stickMat);
        stick.position.set(-0.5 + i * 0.2, 1.1, 0);
        stick.rotation.z = 0.22 + (i % 2) * 0.05;
        stick.castShadow = true;
        g.add(stick);
    }
    scene.add(g);
    return g;
}

// Enkel vogn med plan og hjul - vista-punkt.
function makeCart(scene: THREE.Scene, sceneMat: GameEngineRef['sceneMat']): THREE.Group {
    const g = new THREE.Group();
    const bed = new THREE.Mesh(
        new THREE.BoxGeometry(2.6, 0.6, 1.6),
        sceneMat(0x6a4e30, { preset: 'wood', roughness: 0.9 }),
    );
    bed.position.y = 1.0;
    bed.castShadow = true;
    bed.userData.solid = true;
    g.add(bed);
    const railMat = sceneMat(0x5a3f26, { preset: 'wood', roughness: 1 });
    for (const sx of [-1.2, 1.2]) {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.5, 1.6), railMat);
        rail.position.set(sx, 1.5, 0);
        g.add(rail);
    }
    const wheelMat = sceneMat(0x3a2a1a, { preset: 'wood', roughness: 1 });
    for (const wx of [-0.9, 0.9]) {
        for (const wz of [0.8, -0.8]) {
            const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.15, 12), wheelMat);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(wx, 0.5, wz);
            g.add(wheel);
        }
    }
    scene.add(g);
    return g;
}

// Propaganda-plakat på en vegg. Returnerer plakat-meshen (linse-mål).
function makePoster(
    scene: THREE.Scene,
    sceneMat: GameEngineRef['sceneMat'],
    x: number,
    z: number,
    color: number,
): THREE.Mesh {
    const poster = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 1.8, 0.06),
        sceneMat(color, { preset: 'stone', roughness: 0.85 }),
    );
    poster.position.set(x, 2.2, z);
    scene.add(poster);
    const tekst = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.2, 0.07),
        sceneMat(0xf4e4c1, { preset: 'cloth', roughness: 1 }),
    );
    tekst.position.set(x, 2.5, z + 0.02);
    scene.add(tekst);
    return poster;
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
