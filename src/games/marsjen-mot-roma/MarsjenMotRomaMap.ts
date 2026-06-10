import * as THREE from 'three';
import type { GameEngineRef } from '../engine/types';
import { addAmbientAudio, addParticle, addProp } from '../engine/declarative';
import { registerMainSunLight, registerMainHemiLight } from '../engine/sceneUserData';

// ═══════════════════════════════════════════════════════════════════════════
// KARTET «VEIEN TIL ROMA» - all geometri for marsjen-mot-roma.
//
// Tre soner langs z-aksen (positiv Z = sør, spilleren marsjerer mot -Z):
//   Sone 1 «Leiren»  (z 30 → 14): regnvåt leir med bål, telt og vogner
//   Byporten         (z = 14):    landemerke som rammer inn reisen
//   Sone 2 «Bygata»  (z 14 → -2): trang italiensk gate, sidetorg m/ telegraf
//   Sone 3 «Roma»    (z -2 → -32): monumental piazza, obelisk, Quirinale
//
// Veien er 13 m bred (x -6.5..6.5). Kolonnene marsjerer PÅ veien i to felt
// (x ±2.5, bredde 2.6) - midtfeltet og fortauene er frie for spilleren.
//
// Wiring (NPC-er, linser, sekvenser) bor i MarsjenMotRomaAssets.ts og henter
// alt den trenger herfra via LAYOUT-konstantene og MapRefs-returverdien.
// ═══════════════════════════════════════════════════════════════════════════

export const LAYOUT = {
    // Sonegrenser / fasegater
    GATE_Z: 14, // byporten
    BARRIER_Z: -2, // hærens veisperring (sone 2 → 3)
    PHASE_MARSJEN_Z: 13, // samling → marsjen når spilleren passerer porten
    PHASE_BLOEFFEN_Z: 3, // marsjen → bloeffen når spilleren nærmer seg sperringen
    PHASE_FINALE_Z: -18, // seieren-finalen når spilleren passerer obelisken

    // Telegrafkontoret (hjørnebygg der sidetorget møter hovedgata)
    TELEGRAF_X: -9.8,
    TELEGRAF_Z: 8.6,
    TELEGRAF_MARKER_Y: 6.6, // markøren svever over taket - synlig fra gata

    // Klimaks-posisjoner (palasstrappa + budbringeren)
    KONGE_POS: [-2, 0.85, -23.3] as const,
    MUSSOLINI_POS: [3, 0.85, -23.3] as const,
    MESSENGER_SPAWN: [26, 0, -8] as const,
    MESSENGER_TARGET: [5.2, 0, 0.8] as const,
    KAPTEIN_POS: [2.8, -0.2] as const, // budbringeren vender seg mot kapteinen

    // Kolonnefeltene (på veien)
    COLUMN_X: 2.5,
    COLUMN_Y: 0.06, // føttene på veidekket (veitopp y=0.05)
} as const;

export interface MapRefs {
    sun: THREE.DirectionalLight;
    hemi: THREE.HemisphereLight;
    telegrafCounter: THREE.Mesh;
    telegrafMarker: THREE.Mesh;
    ruinWall: THREE.Mesh;
    weaponRack: THREE.Group;
    cart: THREE.Group;
    drum: THREE.Mesh;
    barrier: THREE.Mesh;
    soldierGroup: THREE.Group;
    linseSoldierBody: THREE.Mesh | null;
    linseMarcher: THREE.Group;
    plakat1: THREE.Mesh;
    plakat2: THREE.Mesh;
    bannerCloths: THREE.Mesh[];
    washCloths: THREE.Mesh[];
    fireLights: THREE.PointLight[];
    fireFlames: THREE.Mesh[];
    kongViktorGroup: THREE.Group;
    mussoliniGroup: THREE.Group;
    messengerHorse: { group: THREE.Group; legs: THREE.Mesh[] };
}

type SceneMat = GameEngineRef['sceneMat'];

export function buildMarsjenMap(engine: GameEngineRef): MapRefs {
    const { scene, sceneMat } = engine;

    // ─── LYS ─────────────────────────────────────────────────────────────────
    // Hemi + sol registrert med TimeOfDaySystem slik at de drives av timeOfDay
    // og får quality-boost på lav tier. Solen kaster skygger på medium/høy.
    const hemi = new THREE.HemisphereLight(0xb8b4ac, 0x47443e, 1.4);
    scene.add(hemi);
    registerMainHemiLight(scene, hemi);

    const sun = new THREE.DirectionalLight(0xd4cec2, 1.0);
    sun.position.set(-25, 35, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = -40; // kartet er ~60 m langt - skyggene skal nå port og palass
    sc.right = sc.top = 40;
    sc.near = 1;
    sc.far = 100;
    scene.add(sun);
    registerMainSunLight(scene, sun);

    // ─── BAKKE + VEI + DEKKER ────────────────────────────────────────────────
    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(64, 1, 220),
        sceneMat(0x4f4738, { preset: 'soil', roughness: 1.0 }),
    );
    ground.position.set(-3, -0.5, -15);
    ground.receiveShadow = true;
    ground.userData.solid = true;
    scene.add(ground);

    // Brolagt vei, 13 m bred - kolonnene marsjerer PÅ den. Strekker seg dypt i
    // tåka i sør (wrap-punkt) og under piazzaen i nord.
    const road = new THREE.Mesh(
        new THREE.BoxGeometry(13, 0.06, 190),
        sceneMat(0x3a3630, { preset: 'stone', roughness: 0.95 }),
    );
    road.position.set(0, 0.02, -15);
    road.receiveShadow = true;
    scene.add(road);

    // Sidetorget (brostein, litt lysere) - åpner seg vestover fra gata
    const square = new THREE.Mesh(
        new THREE.BoxGeometry(11, 0.06, 7.5),
        sceneMat(0x46423c, { preset: 'stone', roughness: 0.95 }),
    );
    square.position.set(-12.5, 0.03, 3);
    square.receiveShadow = true;
    scene.add(square);

    // Piazzaen i Roma (lys stein - kontrasten mot den trange gata er poenget)
    const piazza = new THREE.Mesh(
        new THREE.BoxGeometry(40, 0.08, 30),
        sceneMat(0x6a6258, { preset: 'stone', roughness: 0.85 }),
    );
    piazza.position.set(0, 0.03, -17);
    piazza.receiveShadow = true;
    scene.add(piazza);

    // Blanke vannpytter (regnet ligger i søkk) - kun i sone 1 og 2
    const puddlePositions: [number, number][] = [
        [-1.5, 24], [2, 18], [-3, 15], [5, 9], [-2, 3], [-10, 4], [-14.5, 2.5],
    ];
    for (let i = 0; i < puddlePositions.length; i++) {
        const [px, pz] = puddlePositions[i];
        const puddle = new THREE.Mesh(
            new THREE.CircleGeometry(0.9 + (i % 2) * 0.4, 14),
            sceneMat(0x5a6066, { preset: 'water', metalness: 0.5, roughness: 0.15 }),
        );
        puddle.rotation.x = -Math.PI / 2;
        puddle.position.set(px, 0.075, pz);
        scene.add(puddle);
    }

    // ─── SONE 1: LEIREN (z 30 → 14) ──────────────────────────────────────────
    const fireLights: THREE.PointLight[] = [];
    const fireFlames: THREE.Mesh[] = [];
    const firePositions: [number, number][] = [
        [-7.5, 24],
        [8, 25.5],
        [-6, 19],
    ];
    for (let i = 0; i < firePositions.length; i++) {
        const [fx, fz] = firePositions[i];
        const fire = makeCampfire(scene, sceneMat, fx, fz);
        fireLights.push(fire.light);
        fireFlames.push(fire.flame);
        addParticle(engine, { id: `camp-smoke-${i}`, preset: 'smoke', pos: [fx, 1.3, fz], scale: 0.9 });
        addAmbientAudio(engine, {
            id: `camp-fire-${i}`,
            audio: 'fire-crackle',
            pos: [fx, 0.5, fz],
            radius: 9,
            volume: 0.4,
        });
    }

    const tentSpecs: Array<[number, number, number, number]> = [
        // x, z, rotY, fargevariant
        [-9.5, 26, 0.3, 0],
        [-8.2, 21.5, -0.4, 1],
        [9.5, 23, 2.6, 1],
        [10.2, 27, 2.1, 0],
        [-10.5, 18, 0.7, 2],
    ];
    for (const [tx, tz, rot, variant] of tentSpecs) {
        makeTent(scene, sceneMat, tx, tz, rot, variant);
    }

    addProp(engine, { id: 'camp-crate-1', model: 'crate', pos: [3, 0, 25] });
    addProp(engine, { id: 'camp-barrel', model: 'barrel', pos: [-5, 0, 24] });
    addProp(engine, { id: 'camp-crate-2', model: 'crate', pos: [4.4, 0, 23.4] });
    addProp(engine, { id: 'camp-crate-3', model: 'crate', pos: [-3.8, 0, 26] });

    // Vogn (vista-mål: «Klatre opp» → cinematic over kolonnen og ned gata)
    const cart = makeCart(scene, sceneMat);
    cart.position.set(8, 0, 22);

    // Linse-marsjereren: hero-figur som etternøler i kolonnekanten
    const linseMarcher = makeFigure(sceneMat, 0x26262a, 0xc89868, 0x16161a);
    linseMarcher.position.set(4, 0.06, 21);
    const broom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.7, 6),
        sceneMat(0x7a5a32, { preset: 'wood', roughness: 1 }),
    );
    broom.position.set(0.34, 0.9, 0.05);
    broom.rotation.z = 0.18;
    linseMarcher.add(broom);
    scene.add(linseMarcher);

    // ─── BYPORTEN (z = 14) - landemerket som rammer inn reisen ───────────────
    makeTownGate(scene, sceneMat, fireLights, fireFlames);

    // Våpenboden rett ved porten - kan ikke overses på vei inn i byen
    const weaponRack = makeWeaponRack(scene, sceneMat);
    weaponRack.position.set(-4.9, 0, 16.2);

    // ─── SONE 2: BYGATA (z 14 → -2) ──────────────────────────────────────────
    // Gate-canyon: fasadeliv ved x≈-7 (vest) og x≈+6.5 (øst). Husene varierer i
    // høyde/farge; vinduer, skodder og balkonger instansieres i FacadeBatch
    // (4 draw calls totalt for all fasadedetalj).
    const batch = createFacadeBatch();

    // Vestsiden (nord → sør): W1, telegrafbygg, åpningen til torget, W2
    const w1 = { x: -10, z: 12.5, w: 6, d: 3.5, h: 8.5, wall: 0xb07248 };
    addTownhouse(scene, sceneMat, batch, { ...w1, face: 'east', balcony: true });
    const w2 = { x: -10.5, z: 0, w: 7, d: 4, h: 7, wall: 0x986848 };
    addTownhouse(scene, sceneMat, batch, { ...w2, face: 'east' });

    // Østsiden (nord → sør): fire hus i sammenhengende rekke
    const e1 = { x: 9.5, z: 12, w: 6, d: 4.5, h: 7.5, wall: 0xa86840 };
    addTownhouse(scene, sceneMat, batch, { ...e1, face: 'west' });
    const e2 = { x: 10, z: 7.5, w: 7, d: 4, h: 9.5, wall: 0xc08a5a };
    addTownhouse(scene, sceneMat, batch, { ...e2, face: 'west', balcony: true });
    const e3 = { x: 9.5, z: 3, w: 6, d: 4, h: 6.5, wall: 0xb47a52 };
    addTownhouse(scene, sceneMat, batch, { ...e3, face: 'west' });
    const e4 = { x: 10, z: 0, w: 7, d: 4, h: 8, wall: 0xa06438 };
    addTownhouse(scene, sceneMat, batch, { ...e4, face: 'west', balcony: true });

    // Sidetorgets ramme (vest og nord for torget)
    addTownhouse(scene, sceneMat, batch, {
        x: -16.5, z: 8.5, w: 5, d: 5, h: 6, wall: 0x9c6038, face: 'south',
    });
    addTownhouse(scene, sceneMat, batch, {
        x: -19, z: 2, w: 4, d: 7, h: 5.5, wall: 0xa86c44, face: 'east',
    });

    flushFacadeBatch(scene, sceneMat, batch);

    // Telegrafkontoret: hjørnebygget der torget møter gata. Glødende skilt mot
    // hovedgata + tråder over gata gjør det umulig å overse.
    const telegraf = buildTelegrafBuilding(scene, sceneMat);

    // Gul markør-diamant over telegraftaket - synlig over hustakene i
    // telegrafen-fasen (bobler/roterer i update-loopen i Assets)
    const telegrafMarker = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.45),
        new THREE.MeshBasicMaterial({ color: 0xffd34d, transparent: true, opacity: 0.9 }),
    );
    telegrafMarker.position.set(LAYOUT.TELEGRAF_X, LAYOUT.TELEGRAF_MARKER_Y, LAYOUT.TELEGRAF_Z);
    telegrafMarker.visible = false;
    scene.add(telegrafMarker);

    // Telegrafstolper med tråder som krysser skrått over gata - blikkfang som
    // leder øyet mot kontoret lenge før spilleren er framme
    makeTelegraphWires(scene, sceneMat);

    // Utbrent trykkeri på torget (linse-mål: volden som ettervirkning)
    const ruinWall = new THREE.Mesh(
        new THREE.BoxGeometry(6, 4, 4.5),
        sceneMat(0x1d1813, { preset: 'stone', roughness: 0.95 }),
    );
    ruinWall.position.set(-14.5, 2, 1.5);
    ruinWall.castShadow = true;
    ruinWall.receiveShadow = true;
    ruinWall.userData.solid = true;
    scene.add(ruinWall);
    const beam = new THREE.Mesh(
        new THREE.BoxGeometry(5, 0.3, 0.3),
        sceneMat(0x14110d, { preset: 'wood', roughness: 1 }),
    );
    beam.position.set(-13.9, 3.1, 2.9);
    beam.rotation.z = 0.5;
    beam.castShadow = true;
    scene.add(beam);
    addParticle(engine, { id: 'ruin-smoke', preset: 'smoke', pos: [-14.5, 4.4, 1.5], scale: 1.6 });

    // By-summing på torget
    addAmbientAudio(engine, {
        id: 'square-murmur',
        audio: 'crowd-murmur',
        pos: [-12.5, 2, 3],
        radius: 14,
        volume: 0.25,
    });

    // Klesliner over gata og torget (klutene vaier i update-loopen)
    const washCloths: THREE.Mesh[] = [
        ...makeWashLine(scene, sceneMat, [-7, 6.8, 12], [6.5, 6.2, 11.4]),
        ...makeWashLine(scene, sceneMat, [-7.3, 4.8, 7.4], [6.5, 5.6, 6.8]),
        ...makeWashLine(scene, sceneMat, [-16.5, 4.4, 5.9], [-12.2, 4.0, 6.4]),
    ];

    // Faner i kolonnefeltene (sobert dyp rødt). Klutene vaier i update.
    const bannerCloths: THREE.Mesh[] = [
        addBanner(scene, sceneMat, -3.0, 18),
        addBanner(scene, sceneMat, 3.0, 9),
        addBanner(scene, sceneMat, -3.2, 2),
    ];

    // Tromme på østre fortau (rytme-aktiviteten)
    const drum = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.7, 16),
        sceneMat(0x6e2018, { preset: 'wood', roughness: 0.8 }),
    );
    drum.position.set(5.4, 0.7, 11);
    drum.castShadow = true;
    drum.userData.solid = true;
    scene.add(drum);

    // Propaganda-plakater montert FLATT PÅ fasadene (polygonOffset dreper
    // z-fighting; auto-fit-teksten brytes så den aldri sprenger plakaten)
    const plakat1 = makeWallPoster(scene, {
        pos: [-6.97, 2.4, 12],
        rotY: Math.PI / 2,
        bg: '#7a1410',
        lines: ['ITALIA', 'REISER SEG!'],
        sub: 'Enten med oss, eller mot oss',
    });
    const plakat2 = makeWallPoster(scene, {
        pos: [6.47, 2.4, 3],
        rotY: -Math.PI / 2,
        bg: '#16161a',
        lines: ['VILJENS', 'SEIER'],
        sub: 'Nasjonen over alt',
    });
    // Ren dekorplakat på telegrafbyggets sørgavl (synlig på vei ned gata)
    makeWallPoster(scene, {
        pos: [-9.0, 2.6, 10.44],
        rotY: 0,
        bg: '#3a3a2a',
        lines: ['A NOI!'],
        sub: 'Marsjen mot Roma - oktober 1922',
    });

    // ─── SPERRINGEN (z = -2): usynlig collider + soldater som kan tre til side ─
    const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(14, 5, 0.5),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    barrier.position.set(0, 2.6, LAYOUT.BARRIER_Z);
    barrier.userData.solid = true;
    scene.add(barrier);

    const soldierGroup = new THREE.Group();
    const sawhorse = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.9, 0.3),
        sceneMat(0x6a5436, { preset: 'wood', roughness: 0.9 }),
    );
    sawhorse.position.set(0, 0.7, LAYOUT.BARRIER_Z);
    sawhorse.castShadow = true;
    soldierGroup.add(sawhorse);
    const soldierX = [-2.4, -0.8, 0.8, 2.4];
    let linseSoldierBody: THREE.Mesh | null = null;
    for (let i = 0; i < soldierX.length; i++) {
        const s = makeFigure(sceneMat, 0x4a5640, 0xc89868, 0x2c3424); // grågrønn uniform
        s.position.set(soldierX[i], 0.06, LAYOUT.BARRIER_Z - 0.6);
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

    // ─── SONE 3: ROMA (z -2 → -32) ───────────────────────────────────────────
    // Obelisken: silhuetten er synlig over sperringen allerede fra bygata
    makeObelisk(scene, sceneMat);

    // Fontener flankerer plassen
    for (const fx of [-11, 11]) {
        makeFountain(scene, sceneMat, fx, -9);
        addAmbientAudio(engine, {
            id: `fountain-${fx > 0 ? 'ost' : 'vest'}`,
            audio: 'water-drip',
            pos: [fx, 1, -9],
            radius: 8,
            volume: 0.3,
        });
    }

    // Quirinale-palasset: bred fasade + fløyer + klokketårn = monumental
    // silhuett som leses gjennom porten helt fra spawn
    const palaceMat = sceneMat(0xcabfa6, { preset: 'stone', roughness: 0.7 });
    const palaceShadow = sceneMat(0x6a5e48, { preset: 'stone', roughness: 0.9 });
    const facade = new THREE.Mesh(new THREE.BoxGeometry(26, 13, 9), palaceMat);
    facade.position.set(0, 6.5, -28);
    facade.castShadow = true;
    facade.receiveShadow = true;
    facade.userData.solid = true;
    scene.add(facade);
    for (const wx of [-15, 15]) {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(10, 9, 7), palaceMat);
        wing.position.set(wx, 4.5, -27);
        wing.castShadow = true;
        wing.receiveShadow = true;
        wing.userData.solid = true;
        scene.add(wing);
    }
    const bellTower = new THREE.Mesh(new THREE.BoxGeometry(3, 5, 3), palaceMat);
    bellTower.position.set(-8, 15.5, -28);
    bellTower.castShadow = true;
    scene.add(bellTower);
    const bellRoof = new THREE.Mesh(new THREE.ConeGeometry(2.4, 1.6, 4), palaceShadow);
    bellRoof.position.set(-8, 18.8, -28);
    bellRoof.rotation.y = Math.PI / 4;
    scene.add(bellRoof);

    // Palasstrappa (tre stigende trinn - kongen og Mussolini står på øverste)
    const stepSpecs: Array<[number, number, number]> = [
        // dybde, senter-y, senter-z
        [5.0, 0.15, -23.4],
        [3.6, 0.45, -23.9],
        [2.4, 0.725, -24.3],
    ];
    for (const [depth, sy, sz] of stepSpecs) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(20, sy * 2, depth), palaceShadow);
        step.position.set(0, sy, sz);
        step.castShadow = true;
        step.receiveShadow = true;
        step.userData.solid = true;
        scene.add(step);
    }

    // Søylerekke (portiko) på trappeplatået
    for (let i = 0; i < 8; i++) {
        addProp(engine, {
            id: `palace-pillar-${i}`,
            model: 'pillar',
            pos: [-10.5 + i * 3, 0.85, -22.6],
            solid: true,
        });
    }
    const pediment = new THREE.Mesh(new THREE.BoxGeometry(22, 1.4, 1.6), palaceShadow);
    pediment.position.set(0, 7.6, -22.6);
    pediment.castShadow = true;
    scene.add(pediment);

    // Togstasjonen (Mussolinis ankomst) - vest på piazzaen, halvt i tåka
    makeTrainStation(scene, sceneMat);
    addParticle(engine, { id: 'train-steam', preset: 'steam', pos: [-25.5, 3.5, -14], scale: 1.2 });

    // ─── SKJULTE KLIMAKS-FIGURER ─────────────────────────────────────────────
    const kongViktorGroup = makeFigure(sceneMat, 0x9a8454, 0xcea078, 0x5c4e30); // gyllen uniform
    kongViktorGroup.position.set(100, 5, -19); // off-screen, avsløres ved klimaks
    scene.add(kongViktorGroup);

    const mussoliniGroup = makeFigure(sceneMat, 0x2a2622, 0xcea078, 0x1a1612); // mørk dress
    mussoliniGroup.position.set(100, 0, 5); // off-screen, avsløres ved seieren
    scene.add(mussoliniGroup);

    const messengerHorse = makeHorseAndRider(sceneMat);
    messengerHorse.group.position.set(100, 0, 0); // off-screen inntil aktivert
    scene.add(messengerHorse.group);

    return {
        sun,
        hemi,
        telegrafCounter: telegraf.counter,
        telegrafMarker,
        ruinWall,
        weaponRack,
        cart,
        drum,
        barrier,
        soldierGroup,
        linseSoldierBody,
        linseMarcher,
        plakat1,
        plakat2,
        bannerCloths,
        washCloths,
        fireLights,
        fireFlames,
        kongViktorGroup,
        mussoliniGroup,
        messengerHorse,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// FASADE-BATCH: vinduer, skodder og balkonger samles som transformer mens
// husene bygges, og flushes til 4 InstancedMesh til slutt (4 draw calls for
// all fasadedetalj på hele kartet).
// ═══════════════════════════════════════════════════════════════════════════

interface FacadeBatch {
    windows: THREE.Matrix4[];
    shutters: THREE.Matrix4[];
    plates: THREE.Matrix4[];
    rails: THREE.Matrix4[];
}

function createFacadeBatch(): FacadeBatch {
    return { windows: [], shutters: [], plates: [], rails: [] };
}

const dummy = new THREE.Object3D();

function pushMatrix(list: THREE.Matrix4[], x: number, y: number, z: number, rotY = 0): void {
    dummy.position.set(x, y, z);
    dummy.rotation.set(0, rotY, 0);
    dummy.updateMatrix();
    list.push(dummy.matrix.clone());
}

function flushFacadeBatch(scene: THREE.Scene, sceneMat: SceneMat, batch: FacadeBatch): void {
    const make = (
        geom: THREE.BufferGeometry,
        mat: THREE.Material,
        matrices: THREE.Matrix4[],
        shadows: boolean,
    ): void => {
        if (!matrices.length) return;
        const mesh = new THREE.InstancedMesh(geom, mat, matrices.length);
        for (let i = 0; i < matrices.length; i++) mesh.setMatrixAt(i, matrices[i]);
        mesh.instanceMatrix.needsUpdate = true;
        mesh.castShadow = shadows;
        scene.add(mesh);
    };
    // Vindus-inset (mørk boks, stikker 6 cm ut av fasadelivet)
    make(
        new THREE.BoxGeometry(0.12, 1.05, 0.74),
        sceneMat(0x1a1612, { preset: 'wood', roughness: 0.9 }),
        batch.windows,
        false,
    );
    // Skodder (grønnmalte trepar)
    make(
        new THREE.BoxGeometry(0.05, 1.05, 0.3),
        sceneMat(0x4a5d44, { preset: 'wood', roughness: 0.95 }),
        batch.shutters,
        false,
    );
    // Balkongplater
    make(
        new THREE.BoxGeometry(0.55, 0.09, 1.7),
        sceneMat(0x55483a, { preset: 'stone', roughness: 0.9 }),
        batch.plates,
        true,
    );
    // Balkongrekkverk
    make(
        new THREE.BoxGeometry(0.06, 0.5, 1.7),
        sceneMat(0x3a3026, { preset: 'metal', roughness: 0.7 }),
        batch.rails,
        true,
    );
}

interface TownhouseSpec {
    x: number;
    z: number;
    w: number; // bredde langs x
    d: number; // dybde langs z
    h: number;
    wall: number;
    face: 'east' | 'west' | 'south'; // hvilken side som vender mot gate/torg
    balcony?: boolean; // balkong på midtvinduet i øverste rad
}

// Byhus: solid kropp + saltak + gesims + instansierte vinduer/skodder/balkong.
// Saltakets møne løper langs z (parallelt med gata) - italiensk rekkehus-stil.
function addTownhouse(
    scene: THREE.Scene,
    sceneMat: SceneMat,
    batch: FacadeBatch,
    spec: TownhouseSpec,
): void {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(spec.w, spec.h, spec.d),
        sceneMat(spec.wall, { preset: 'stone', roughness: 0.92 }),
    );
    body.position.y = spec.h / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.solid = true;
    g.add(body);

    // Gesimsbånd rett under taket
    const cornice = new THREE.Mesh(
        new THREE.BoxGeometry(spec.w + 0.4, 0.25, spec.d + 0.4),
        sceneMat(0x8a7458, { preset: 'stone', roughness: 0.9 }),
    );
    cornice.position.y = spec.h - 0.1;
    cornice.castShadow = true;
    g.add(cornice);

    // Saltak: to skrå plater som møtes i mønet
    const roofMat = sceneMat(0x7a4030, { preset: 'stone', roughness: 1 });
    const slope = 0.42;
    const panelW = (spec.w / 2) / Math.cos(slope) + 0.3;
    for (const side of [-1, 1]) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(panelW, 0.14, spec.d + 0.6), roofMat);
        panel.rotation.z = side * slope;
        panel.position.set(-side * spec.w * 0.25, spec.h + spec.w * 0.115, 0);
        panel.castShadow = true;
        g.add(panel);
    }

    g.position.set(spec.x, 0, spec.z);
    scene.add(g);

    // Fasadedetalj på gate-/torgsiden (verdenskoordinater rett i batchen)
    if (spec.face === 'south') return; // torg-rammehus mot sør: kun kropp/tak (ses på avstand)
    const n = spec.face === 'east' ? 1 : -1;
    const fx = spec.x + n * (spec.w / 2);
    const cols = Math.max(2, Math.floor(spec.d / 1.9));
    const rows = Math.max(1, Math.floor((spec.h - 2.4) / 2.1));
    const zSpan = spec.d - 1.5;
    for (let r = 0; r < rows; r++) {
        const wy = 2.1 + r * 2.1;
        for (let c = 0; c < cols; c++) {
            const wz = spec.z - zSpan / 2 + (cols === 1 ? zSpan / 2 : (zSpan / (cols - 1)) * c);
            pushMatrix(batch.windows, fx, wy, wz);
            // Skodder på ~2/3 av vinduene (deterministisk variasjon)
            if ((r + c + Math.abs(Math.round(spec.x))) % 3 !== 0) {
                pushMatrix(batch.shutters, fx + n * 0.04, wy, wz - 0.55);
                pushMatrix(batch.shutters, fx + n * 0.04, wy, wz + 0.55);
            }
            // Balkong på midtvinduet i øverste rad
            if (spec.balcony && r === rows - 1 && c === Math.floor(cols / 2)) {
                pushMatrix(batch.plates, fx + n * 0.3, wy - 0.62, wz);
                pushMatrix(batch.rails, fx + n * 0.56, wy - 0.32, wz);
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// LANDEMERKER
// ═══════════════════════════════════════════════════════════════════════════

// Byporten: to solide tårn + buespenn med krenellering + fakler mot leiren.
// Synlig fra spawn og rammer inn både kolonnen og palass-silhuetten bak.
function makeTownGate(
    scene: THREE.Scene,
    sceneMat: SceneMat,
    fireLights: THREE.PointLight[],
    fireFlames: THREE.Mesh[],
): void {
    const stoneMat = sceneMat(0x9a7a58, { preset: 'stone', roughness: 0.9 });
    const darkStone = sceneMat(0x7a6044, { preset: 'stone', roughness: 0.95 });
    const z = LAYOUT.GATE_Z;
    for (const side of [-1, 1]) {
        const tower = new THREE.Mesh(new THREE.BoxGeometry(2.4, 8, 2.4), stoneMat);
        tower.position.set(side * 6.8, 4, z);
        tower.castShadow = true;
        tower.receiveShadow = true;
        tower.userData.solid = true;
        scene.add(tower);
        // Tårntopp
        const cap = new THREE.Mesh(new THREE.BoxGeometry(2.9, 0.5, 2.9), darkStone);
        cap.position.set(side * 6.8, 8.25, z);
        cap.castShadow = true;
        scene.add(cap);
        // Fakkel på tårnveggen mot sør (leiren) - glør i regnet
        const flame = new THREE.Mesh(
            new THREE.ConeGeometry(0.18, 0.55, 8),
            new THREE.MeshStandardMaterial({
                color: 0xff7a30,
                emissive: 0xff6020,
                emissiveIntensity: 3.5,
                roughness: 0.3,
            }),
        );
        flame.position.set(side * 6.8, 3.4, z + 1.35);
        scene.add(flame);
        const light = new THREE.PointLight(0xff7a30, 60, 18);
        light.position.set(side * 6.8, 3.6, z + 1.6);
        scene.add(light);
        fireLights.push(light);
        fireFlames.push(flame);
    }
    // Buespennet over åpningen (åpning 11.2 m - begge kolonnefelt passerer)
    const span = new THREE.Mesh(new THREE.BoxGeometry(11.5, 1.6, 2.0), stoneMat);
    span.position.set(0, 7.2, z);
    span.castShadow = true;
    scene.add(span);
    // Buevanger som antyder hvelvingen under spennet
    for (const side of [-1, 1]) {
        const haunch = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.2, 1.8), stoneMat);
        haunch.rotation.z = side * 0.55;
        haunch.position.set(side * 4.6, 6.1, z);
        scene.add(haunch);
    }
    // Krenellering (tannkam) oppå spennet
    for (let i = 0; i < 5; i++) {
        const merlon = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.55, 0.7), darkStone);
        merlon.position.set(-4.4 + i * 2.2, 8.27, z);
        scene.add(merlon);
    }
}

// Obelisken midt på piazzaen - vertikalt utropstegn synlig over sperringen
function makeObelisk(scene: THREE.Scene, sceneMat: SceneMat): void {
    const stone = sceneMat(0xb0a890, { preset: 'stone', roughness: 0.75 });
    const darkStone = sceneMat(0x6a5e48, { preset: 'stone', roughness: 0.9 });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 2), darkStone);
    plinth.position.set(0, 0.6, -13);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    plinth.userData.solid = true;
    scene.add(plinth);
    const midPlinth = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.4), stone);
    midPlinth.position.set(0, 1.45, -13);
    midPlinth.castShadow = true;
    scene.add(midPlinth);
    // Kvadratisk avsmalnende skaft (4-segments sylinder rotert 45°)
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.7, 8.6, 4), stone);
    shaft.rotation.y = Math.PI / 4;
    shaft.position.set(0, 6.0, -13);
    shaft.castShadow = true;
    scene.add(shaft);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.0, 4), stone);
    tip.rotation.y = Math.PI / 4;
    tip.position.set(0, 10.8, -13);
    tip.castShadow = true;
    scene.add(tip);
}

function makeFountain(scene: THREE.Scene, sceneMat: SceneMat, x: number, z: number): void {
    const basin = new THREE.Mesh(
        new THREE.CylinderGeometry(1.7, 1.9, 0.6, 14),
        sceneMat(0x8a8070, { preset: 'stone', roughness: 0.85 }),
    );
    basin.position.set(x, 0.3, z);
    basin.castShadow = true;
    basin.receiveShadow = true;
    basin.userData.solid = true;
    scene.add(basin);
    const water = new THREE.Mesh(
        new THREE.CircleGeometry(1.5, 14),
        sceneMat(0x5a6066, { preset: 'water', metalness: 0.5, roughness: 0.15 }),
    );
    water.rotation.x = -Math.PI / 2;
    water.position.set(x, 0.62, z);
    scene.add(water);
    const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.35, 1.2, 10),
        sceneMat(0x8a8070, { preset: 'stone', roughness: 0.85 }),
    );
    column.position.set(x, 1.2, z);
    column.castShadow = true;
    scene.add(column);
    const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.5, 0.18, 12),
        sceneMat(0x8a8070, { preset: 'stone', roughness: 0.85 }),
    );
    bowl.position.set(x, 1.85, z);
    bowl.castShadow = true;
    scene.add(bowl);
}

// Telegrafkontoret: hjørnebygg med glødende TELEGRAFO-skilt mot hovedgata,
// varmt opplyst vindu, og skranke mot torgåpningen. Returnerer skranken
// (interact-mål for levering av forsiden).
function buildTelegrafBuilding(
    scene: THREE.Scene,
    sceneMat: SceneMat,
): { counter: THREE.Mesh } {
    const x = LAYOUT.TELEGRAF_X;
    const z = LAYOUT.TELEGRAF_Z;
    // Bygningskropp: varm oker som skiller seg fra naboene
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(5, 5.5, 3.6),
        sceneMat(0xc4a070, { preset: 'stone', roughness: 0.85 }),
    );
    body.position.set(x, 2.75, z);
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.solid = true;
    scene.add(body);
    // Gesims + flatt tak med kant
    const cornice = new THREE.Mesh(
        new THREE.BoxGeometry(5.4, 0.3, 4.0),
        sceneMat(0x8a7458, { preset: 'stone', roughness: 0.9 }),
    );
    cornice.position.set(x, 5.5, z);
    cornice.castShadow = true;
    scene.add(cornice);

    // Glødende TELEGRAFO-skilt mot hovedgata (øst) - leses fra 20 m i regnet
    const sign = makeTextPlane({
        width: 2.8,
        height: 0.62,
        bg: '#23304a',
        fg: '#ffe9bb',
        lines: ['TELEGRAFO'],
        fontPx: 96,
        emissive: true,
    });
    sign.position.set(x + 2.54, 4.2, z);
    sign.rotation.y = Math.PI / 2;
    scene.add(sign);
    // Mindre skilt over skranken mot torget (nord)
    const signSquare = makeTextPlane({
        width: 1.8,
        height: 0.42,
        bg: '#23304a',
        fg: '#ffe9bb',
        lines: ['TELEGRAFO'],
        fontPx: 96,
        emissive: true,
    });
    signSquare.position.set(x, 3.2, z - 1.84);
    signSquare.rotation.y = Math.PI;
    scene.add(signSquare);

    // Varmt opplyst vindu mot gata (øst) + punktlys - kontoret «lever»
    const glow = new THREE.Mesh(
        new THREE.PlaneGeometry(1.1, 1.3),
        new THREE.MeshStandardMaterial({
            color: 0xffc878,
            emissive: 0xffb050,
            emissiveIntensity: 2.6,
            roughness: 0.4,
        }),
    );
    glow.position.set(x + 2.54, 2.2, z + 0.9);
    glow.rotation.y = Math.PI / 2;
    scene.add(glow);
    const windowLight = new THREE.PointLight(0xffb060, 14, 11);
    windowLight.position.set(x + 3.2, 2.4, z + 0.9);
    scene.add(windowLight);

    // Skranke mot torgåpningen (nord) - selve interact-målet
    const counter = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.22, 0.5),
        sceneMat(0x5a4632, { preset: 'wood', roughness: 0.85 }),
    );
    counter.position.set(x, 1.05, z - 2.05);
    counter.castShadow = true;
    counter.userData.solid = true;
    scene.add(counter);
    // Luke i veggen bak skranken (mørk åpning + telegrafist)
    const hatch = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.6, 0.12),
        sceneMat(0x1a1410, { preset: 'wood', roughness: 0.95 }),
    );
    hatch.position.set(x, 1.7, z - 1.82);
    scene.add(hatch);
    const operator = makeFigure(sceneMat, 0x3a4252, 0xd0a070, 0x23272f);
    operator.position.set(x, 0.3, z - 1.2);
    operator.rotation.y = Math.PI; // vender mot skranken/torget
    operator.scale.setScalar(0.85);
    scene.add(operator);
    return { counter };
}

// Telegrafstolper med tråder som krysser skrått over gata mot kontoret -
// et blikkfang som peker dit lenge før spilleren ser selve skiltet.
function makeTelegraphWires(scene: THREE.Scene, sceneMat: SceneMat): void {
    const poleMat = sceneMat(0x3a2e22, { preset: 'wood', roughness: 1 });
    const polePositions: Array<[number, number]> = [
        [-8.2, 10.9], // ved telegrafbyggets nordøst-hjørne
        [6.9, 5.5], // østsiden av gata
        [-8.0, 1.2], // ved torgåpningens sørkant
    ];
    const tops: THREE.Vector3[] = [];
    for (const [px, pz] of polePositions) {
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 5.4, 6), poleMat);
        pole.position.set(px, 2.7, pz);
        pole.castShadow = true;
        scene.add(pole);
        const crossarm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.8), poleMat);
        crossarm.position.set(px, 5.1, pz);
        scene.add(crossarm);
        tops.push(new THREE.Vector3(px, 5.25, pz));
    }
    // Tråder: bygg→stolpe→stolpe→stolpe i sikksakk over gata
    const buildingTop = new THREE.Vector3(LAYOUT.TELEGRAF_X + 1.8, 5.4, LAYOUT.TELEGRAF_Z + 0.6);
    const pairs: Array<[THREE.Vector3, THREE.Vector3]> = [
        [buildingTop, tops[0]],
        [tops[0], tops[1]],
        [tops[1], tops[2]],
    ];
    const wireMat = new THREE.LineBasicMaterial({ color: 0x1c1a18 });
    for (const [a, b] of pairs) {
        scene.add(makeSaggingLine(a, b, 0.35, wireMat));
    }
}

// Slakk linje (kjedelinje-aktig kurve) mellom to punkter. Brukes til
// telegraftråder og klesliner.
function makeSaggingLine(
    a: THREE.Vector3,
    b: THREE.Vector3,
    sag: number,
    mat: THREE.LineBasicMaterial,
): THREE.Line {
    const points: THREE.Vector3[] = [];
    const SEGMENTS = 10;
    for (let i = 0; i <= SEGMENTS; i++) {
        const t = i / SEGMENTS;
        const p = a.clone().lerp(b, t);
        p.y -= sag * 4 * t * (1 - t); // parabel-sag, maks på midten
        points.push(p);
    }
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), mat);
}

// Klessnor med hengende plagg over gata. Returnerer plagg-meshene (vaier i update).
function makeWashLine(
    scene: THREE.Scene,
    sceneMat: SceneMat,
    from: [number, number, number],
    to: [number, number, number],
): THREE.Mesh[] {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x2e2a26 });
    scene.add(makeSaggingLine(a, b, 0.3, lineMat));
    const clothColors = [0x8a8278, 0x6e7a82, 0x9a8a6a, 0x7a6a6e];
    const cloths: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
        const t = 0.22 + i * 0.18;
        const p = a.clone().lerp(b, t);
        p.y -= 0.3 * 4 * t * (1 - t);
        const cloth = new THREE.Mesh(
            new THREE.PlaneGeometry(0.45, 0.6),
            sceneMat(clothColors[i % clothColors.length], { preset: 'cloth', roughness: 1 }),
        );
        // Heng plagget under snora, vendt på tvers av den
        cloth.position.set(p.x, p.y - 0.32, p.z);
        cloth.rotation.y = Math.atan2(b.x - a.x, b.z - a.z) + Math.PI / 2;
        (cloth.material as THREE.MeshStandardMaterial).side = THREE.DoubleSide;
        cloths.push(cloth);
        scene.add(cloth);
    }
    return cloths;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEKST PÅ PLAKATER OG SKILT (CanvasTexture med auto-fit)
// ═══════════════════════════════════════════════════════════════════════════

// Tekst-plate via CanvasTexture. Hovedlinjene auto-skaleres så de aldri
// sprenger bredden, og sub-teksten ordbrytes over flere linjer ved behov.
function makeTextPlane(opts: {
    width: number;
    height: number;
    bg: string;
    fg: string;
    lines: string[];
    sub?: string;
    fontPx?: number;
    emissive?: boolean;
}): THREE.Mesh {
    const canvas = document.createElement('canvas');
    const W = 512;
    const H = Math.round((W * opts.height) / opts.width);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = opts.bg;
    ctx.fillRect(0, 0, W, H);
    // Slitt ramme
    ctx.strokeStyle = 'rgba(244, 228, 193, 0.55)';
    ctx.lineWidth = 8;
    ctx.strokeRect(14, 14, W - 28, H - 28);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Auto-fit av hovedlinjene: mål bredden og skaler fontPx ned til alt passer
    const maxLineW = W - 64;
    let fontPx = opts.fontPx ?? 84;
    ctx.font = `bold ${fontPx}px Outfit, Inter, sans-serif`;
    let fit = fontPx;
    for (const line of opts.lines) {
        const m = ctx.measureText(line).width;
        if (m > maxLineW) fit = Math.min(fit, (fontPx * maxLineW) / m);
    }
    fontPx = Math.floor(fit);
    ctx.font = `bold ${fontPx}px Outfit, Inter, sans-serif`;

    // Sub-tekst: ordbrytes mot maks bredde FØR layouten beregnes
    const subPx = Math.max(24, Math.round(fontPx * 0.38));
    let subLines: string[] = [];
    if (opts.sub) {
        ctx.font = `italic ${subPx}px Inter, sans-serif`;
        subLines = wrapText(ctx, opts.sub, W - 80);
        ctx.font = `bold ${fontPx}px Outfit, Inter, sans-serif`;
    }
    const subBlockH = subLines.length ? subLines.length * subPx * 1.35 + 14 : 0;

    // Hovedblokken sentreres i plassen over sub-teksten
    ctx.fillStyle = opts.fg;
    const blockH = opts.lines.length * fontPx * 1.15;
    const startY = (H - subBlockH) / 2 - blockH / 2 + fontPx * 0.6;
    opts.lines.forEach((line, i) => {
        ctx.fillText(line, W / 2, startY + i * fontPx * 1.15);
    });
    if (subLines.length) {
        ctx.font = `italic ${subPx}px Inter, sans-serif`;
        ctx.fillStyle = 'rgba(244, 228, 193, 0.85)';
        subLines.forEach((line, i) => {
            ctx.fillText(line, W / 2, H - 24 - subBlockH + subPx * 0.9 + i * subPx * 1.35);
        });
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    const material = opts.emissive
        ? new THREE.MeshStandardMaterial({
              map: tex,
              emissive: new THREE.Color(0xffd9a0),
              emissiveMap: tex,
              emissiveIntensity: 1.6,
              roughness: 0.5,
          })
        : new THREE.MeshLambertMaterial({
              map: tex,
              polygonOffset: true,
              polygonOffsetFactor: -2,
              polygonOffsetUnits: -2,
          });
    return new THREE.Mesh(new THREE.PlaneGeometry(opts.width, opts.height), material);
}

// Ordbasert linjebryting mot målt pikselbredde (canvas-konteksten må ha riktig font satt)
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
        const attempt = current ? `${current} ${word}` : word;
        if (ctx.measureText(attempt).width > maxW && current) {
            lines.push(current);
            current = word;
        } else {
            current = attempt;
        }
    }
    if (current) lines.push(current);
    return lines;
}

// Plakat montert FLATT PÅ en fasade. pos er punktet på fasadelivet, rotY er
// fasadens normalretning. polygonOffset i materialet dreper z-fighting, og
// en liten tilfeldig skjevhet gir slitt sjarm. Returnerer meshen (linse-mål).
function makeWallPoster(
    scene: THREE.Scene,
    opts: {
        pos: [number, number, number];
        rotY: number;
        bg: string;
        lines: string[];
        sub?: string;
        w?: number;
        h?: number;
    },
): THREE.Mesh {
    const face = makeTextPlane({
        width: opts.w ?? 1.4,
        height: opts.h ?? 1.8,
        bg: opts.bg,
        fg: '#f4e4c1',
        lines: opts.lines,
        sub: opts.sub,
        fontPx: 92,
    });
    // 3 cm ut fra veggen langs fasadenormalen
    const nx = Math.sin(opts.rotY);
    const nz = Math.cos(opts.rotY);
    face.position.set(opts.pos[0] + nx * 0.03, opts.pos[1], opts.pos[2] + nz * 0.03);
    face.rotation.y = opts.rotY;
    face.rotation.z = (Math.random() - 0.5) * 0.04; // litt skjevt oppklistret
    scene.add(face);
    return face;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEIR-REKVISITTER
// ═══════════════════════════════════════════════════════════════════════════

// Bål: kryssede kubber + emissiv flamme + varmt punktlys (flammen og lyset
// flakker i update-loopen i Assets)
function makeCampfire(
    scene: THREE.Scene,
    sceneMat: SceneMat,
    x: number,
    z: number,
): { light: THREE.PointLight; flame: THREE.Mesh } {
    const logMat = sceneMat(0x3a2a18, { preset: 'wood', roughness: 1 });
    for (let i = 0; i < 3; i++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.1, 6), logMat);
        log.rotation.z = Math.PI / 2 - 0.25;
        log.rotation.y = (i / 3) * Math.PI;
        log.position.set(x, 0.18, z);
        log.castShadow = true;
        scene.add(log);
    }
    const flame = new THREE.Mesh(
        new THREE.ConeGeometry(0.32, 0.85, 8),
        new THREE.MeshStandardMaterial({
            color: 0xff7a30,
            emissive: 0xff6020,
            emissiveIntensity: 3.5,
            roughness: 0.3,
        }),
    );
    flame.position.set(x, 0.65, z);
    scene.add(flame);
    const light = new THREE.PointLight(0xff7a30, 16, 13);
    light.position.set(x, 1.1, z);
    scene.add(light);
    return { light, flame };
}

// A-telt: to skrå duker som møtes i en mønestang
function makeTent(
    scene: THREE.Scene,
    sceneMat: SceneMat,
    x: number,
    z: number,
    rotY: number,
    variant: number,
): void {
    const colors = [0x57503f, 0x4a4438, 0x5f5544];
    const mat = sceneMat(colors[variant % colors.length], { preset: 'cloth', roughness: 1 });
    const g = new THREE.Group();
    for (const side of [-1, 1]) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.07, 2.3), mat);
        panel.rotation.z = side * 1.02;
        panel.position.set(side * 0.62, 0.78, 0);
        panel.castShadow = true;
        panel.userData.solid = true;
        g.add(panel);
    }
    const ridge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6),
        sceneMat(0x3a2e22, { preset: 'wood', roughness: 1 }),
    );
    ridge.rotation.x = Math.PI / 2;
    ridge.position.set(0, 1.42, 0);
    g.add(ridge);
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    scene.add(g);
}

// ═══════════════════════════════════════════════════════════════════════════
// FIGURER OG GJENBRUKTE REKVISITTER (uendret fra forrige kartversjon)
// ═══════════════════════════════════════════════════════════════════════════

// Enkel lavpoly-figur (kropp + hode + hodeplagg). castShadow av for ytelse.
// Brukes for hero-figurer nær kamera (soldater, kongen, Mussolini, telegrafisten).
// Massene håndteres av CrowdSystem.
function makeFigure(
    sceneMat: SceneMat,
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

// Våpenbod: lent bunt av staur + et par rustne gevær. Linse-mål for «dårlig bevæpnet».
function makeWeaponRack(scene: THREE.Scene, sceneMat: SceneMat): THREE.Group {
    const g = new THREE.Group();
    const stand = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.9, 0.5),
        sceneMat(0x5a4632, { preset: 'wood', roughness: 0.9 }),
    );
    stand.position.y = 0.45;
    stand.castShadow = true;
    stand.userData.solid = true;
    g.add(stand);
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
function makeCart(scene: THREE.Scene, sceneMat: SceneMat): THREE.Group {
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

function makeHorseAndRider(
    sceneMat: SceneMat,
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

// Fane over kolonnen. Returnerer klut-meshen så den kan vaie i update-loopen.
function addBanner(
    scene: THREE.Scene,
    sceneMat: SceneMat,
    x: number,
    z: number,
): THREE.Mesh {
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
    return cloth;
}

// Togstasjonen med lokomotiv - vest på piazzaen, halvt i tåka
function makeTrainStation(scene: THREE.Scene, sceneMat: SceneMat): void {
    const stationGroup = new THREE.Group();
    const platform = new THREE.Mesh(
        new THREE.BoxGeometry(12, 0.5, 4),
        sceneMat(0x5a5450, { preset: 'stone', roughness: 0.9 }),
    );
    platform.position.set(0, 0.25, 0);
    platform.receiveShadow = true;
    stationGroup.add(platform);
    const locoBody = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 2.2, 2.4),
        sceneMat(0x2a2420, { preset: 'metal', roughness: 0.7 }),
    );
    locoBody.position.set(-3, 1.6, 0);
    locoBody.castShadow = true;
    stationGroup.add(locoBody);
    const chimney = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.28, 0.9, 8),
        sceneMat(0x1a1a1a, { preset: 'metal', roughness: 0.8 }),
    );
    chimney.position.set(-4.5, 2.95, 0);
    chimney.castShadow = true;
    stationGroup.add(chimney);
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
    stationGroup.position.set(-21, 0, -14);
    scene.add(stationGroup);
}
