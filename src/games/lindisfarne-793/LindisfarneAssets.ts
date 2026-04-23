import * as THREE from 'three';
import type { GameEngineRef, DialogNode } from '../engine/types';
import { buildSeascape } from '../engine/builders/SeascapeBuilder';

const HILL_H = 4;   // høyde på platå over havnivå
const WH = 4.0;     // vegghøyde i klosteret
const WT = 0.4;     // veggtykelse

export function setupLindisfarneScene(engine: GameEngineRef): void {
    const { scene, toonMat } = engine;

    // ═══════════════════════════════════════════════════════════════
    // FASE 1 — HAV OG BAT
    // ═══════════════════════════════════════════════════════════════
    const sea = buildSeascape(scene, toonMat);

    // Plasser mannskap som barn av båten. Y senkes 0.75 fra seteposisjon så bena
    // skjules av skrogkanten og de ser ut til å sitte.
    const SIT_Y_OFFSET = 0.75;
    const crew = findCrewNPCs(scene);
    if (crew.sigurd) {
        sea.boat.add(crew.sigurd.group);
        const [cx, cy, cz] = sea.crewSeats.chief;
        crew.sigurd.group.position.set(cx, cy - SIT_Y_OFFSET, cz);
        crew.sigurd.group.userData.bobBase = cy - SIT_Y_OFFSET;
    }
    if (crew.veteran) {
        sea.boat.add(crew.veteran.group);
        const [vx, vy, vz] = sea.crewSeats.veteran;
        crew.veteran.group.position.set(vx, vy - SIT_Y_OFFSET, vz);
        crew.veteran.group.userData.bobBase = vy - SIT_Y_OFFSET;
    }
    if (crew.ulv) {
        sea.boat.add(crew.ulv.group);
        const [px, py, pz] = sea.crewSeats.peer;
        crew.ulv.group.position.set(px, py - SIT_Y_OFFSET, pz);
        crew.ulv.group.userData.bobBase = py - SIT_Y_OFFSET;
    }


    // ═══════════════════════════════════════════════════════════════
    // FASE 2 — TERRENG: OY MED AS
    // ═══════════════════════════════════════════════════════════════
    const sandMat = toonMat(0xd4b87a);
    const rockMat = toonMat(0x7a6a5a);
    const pathMat = toonMat(0xb89a6a);

    // Strand (flat, Y=0)
    const beach = new THREE.Mesh(new THREE.BoxGeometry(30, 1, 15), sandMat);
    beach.position.set(0, -0.5, -0.5);
    beach.userData.solid = true;
    beach.receiveShadow = true;
    scene.add(beach);

    // Ramp (Z: -8 til -20, stiger fra Y=0 til Y=HILL_H)
    // Positiv X-rotasjon: sørenden (+Z) dyppes ned (strandnivå), nordenden (-Z) heves (platånivå)
    const rampHoriz = 12;
    const rampLen = Math.sqrt(rampHoriz * rampHoriz + HILL_H * HILL_H);
    const rampAngle = Math.atan2(HILL_H, rampHoriz);
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(8, 0.8, rampLen), pathMat);
    ramp.rotation.x = rampAngle;
    ramp.position.set(0, HILL_H / 2, -14);
    ramp.userData.solid = true;
    ramp.userData.colliderShape = 'trimesh'; // nødvendig for at Rapier skal bruke trimesh-kollider på skrå flate
    ramp.castShadow = true;
    ramp.receiveShadow = true;
    scene.add(ramp);

    // Ramp-sider (dekorative bergskrenter)
    for (const side of [-1, 1] as const) {
        const slope = new THREE.Mesh(new THREE.BoxGeometry(3, 3, rampLen), rockMat);
        slope.rotation.x = rampAngle;
        slope.position.set(side * 5.5, HILL_H / 2 - 1.5, -14);
        slope.castShadow = true;
        scene.add(slope);
    }

    // Platå (flat topp, Y=HILL_H)
    const plateau = new THREE.Mesh(new THREE.BoxGeometry(44, 2, 28), rockMat);
    plateau.position.set(0, HILL_H - 1, -34);
    plateau.userData.solid = true;
    plateau.receiveShadow = true;
    plateau.castShadow = true;
    scene.add(plateau);

    // Sti-markering (visuell stripe langs midten av bakken og inn mot porten)
    const pathStrip = new THREE.Mesh(new THREE.PlaneGeometry(2, 7), pathMat);
    pathStrip.rotation.x = -Math.PI / 2;
    pathStrip.position.set(0, HILL_H + 0.02, -24.5);
    scene.add(pathStrip);

    // ═══════════════════════════════════════════════════════════════
    // FASE 3 — KLOSTER
    // ═══════════════════════════════════════════════════════════════
    const wallMat = toonMat(0x9a8878);
    const WALL_Y = HILL_H + WH / 2;

    function addWall(w: number, h: number, d: number, x: number, y: number, z: number, solid = true): THREE.Mesh {
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat);
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        if (solid) m.userData.solid = true;
        scene.add(m);
        return m;
    }

    // Ytre sørvegg (z=-22) - to segmenter med 2.4 åpning i midten (porten)
    addWall(10.8, WH, WT, -6.6, WALL_Y, -22);
    addWall(10.8, WH, WT,  6.6, WALL_Y, -22);
    // Ytre nordvegg (z=-41)
    addWall(24, WH, WT, 0, WALL_Y, -41);
    // Ytre vestvegg (x=-12)
    addWall(WT, WH, 19, -12, WALL_Y, -31.5);
    // Ytre østvegg (x=+12)
    addWall(WT, WH, 19,  12, WALL_Y, -31.5);

    // Indre E-V-skilleskjerm (z=-30) - kapellinngangen 2.4 bred i midten
    addWall(10.8, WH, WT, -6.6, WALL_Y, -30);
    addWall(10.8, WH, WT,  6.6, WALL_Y, -30);

    // Indre N-S-vegger (x=±5) - deler kapell fra bibliotek og sovesal
    // Åpning ved z=-35, bredde 2.2 (nord-segment 3.9, sør-segment 4.9)
    addWall(WT, WH, 3.9, -5, WALL_Y, -31.95);
    addWall(WT, WH, 4.9, -5, WALL_Y, -38.55);
    addWall(WT, WH, 3.9,  5, WALL_Y, -31.95);
    addWall(WT, WH, 4.9,  5, WALL_Y, -38.55);

    // Port - kun dekorative pilarer, ingen solid kollisjon
    addWall(0.25, WH, WT, -1.4, WALL_Y, -22, false);
    addWall(0.25, WH, WT,  1.4, WALL_Y, -22, false);
    const portBue = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.3, WT), wallMat);
    portBue.position.set(0, HILL_H + WH - 0.15, -22);
    scene.add(portBue);

    // Kapelltårn (over nordveggen)
    const tower = new THREE.Mesh(new THREE.BoxGeometry(3, 6, 3), wallMat);
    tower.position.set(0, HILL_H + 3, -41);
    tower.userData.solid = true;
    tower.castShadow = true;
    tower.receiveShadow = true;
    scene.add(tower);
    const towerCone = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2, 4), toonMat(0x5a4a3a));
    towerCone.position.set(0, HILL_H + 7, -41);
    towerCone.rotation.y = Math.PI / 4;
    scene.add(towerCone);
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.5, 0.15), toonMat(0x3a2614));
    crossV.position.set(0, HILL_H + 9, -41);
    scene.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.15, 0.15), toonMat(0x3a2614));
    crossH.position.set(0, HILL_H + 9.5, -41);
    scene.add(crossH);

    // Gulv i klosterkomplekset (forplass + alle rom)
    const cloisterFloor = new THREE.Mesh(new THREE.PlaneGeometry(24, 19), toonMat(0x8a7060));
    cloisterFloor.rotation.x = -Math.PI / 2;
    cloisterFloor.position.set(0, HILL_H + 0.01, -31.5);
    cloisterFloor.receiveShadow = true;
    scene.add(cloisterFloor);

    portBue.castShadow = true;

    // Tak (dollhouse - skjules av _customUpdate når spilleren er inne)
    const roofMat = toonMat(0x5a4a3a, { roughness: 0.9 });
    const chapelRoof = new THREE.Mesh(new THREE.PlaneGeometry(10, 11), roofMat);
    chapelRoof.rotation.x = -Math.PI / 2;
    chapelRoof.position.set(0, HILL_H + WH, -35.5);
    scene.add(chapelRoof);
    const libraryRoof = new THREE.Mesh(new THREE.PlaneGeometry(7, 11), roofMat);
    libraryRoof.rotation.x = -Math.PI / 2;
    libraryRoof.position.set(-8.5, HILL_H + WH, -35.5);
    scene.add(libraryRoof);
    const dormRoof = new THREE.Mesh(new THREE.PlaneGeometry(7, 11), roofMat);
    dormRoof.rotation.x = -Math.PI / 2;
    dormRoof.position.set(8.5, HILL_H + WH, -35.5);
    scene.add(dormRoof);

    // ─── Kapell-inventar ───────────────────────────────────────────
    const altar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.2, 1), toonMat(0x8a7058));
    altar.position.set(0, HILL_H + 0.6, -38);
    altar.userData.solid = true;
    scene.add(altar);

    const altarCrossV = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2, 0.15), toonMat(0x3a2614));
    altarCrossV.position.set(0, HILL_H + 2.2, -39.3);
    scene.add(altarCrossV);
    const altarCrossH = new THREE.Mesh(new THREE.BoxGeometry(1, 0.15, 0.15), toonMat(0x3a2614));
    altarCrossH.position.set(0, HILL_H + 2.5, -39.3);
    scene.add(altarCrossH);

    for (let i = 0; i < 2; i++) {
        const chalice = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.08, 0.3, 12), toonMat(0xd4d4d4));
        chalice.position.set(-0.5 + i, HILL_H + 1.35, -38);
        scene.add(chalice);
    }

    // ─── Bibliotek-inventar ────────────────────────────────────────
    const eadfrith = findCharacter(scene, 'eadfrith');
    if (eadfrith) {
        eadfrith.group.position.set(-8, HILL_H, -35);
        eadfrith.group.rotation.y = Math.PI / 2;
        addTonsure(eadfrith.group, toonMat);
        addRobe(eadfrith.group, toonMat);
    }

    // Bokhyller langs vestvegg
    for (let i = 0; i < 3; i++) {
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.8, 2.5), toonMat(0x4a3020));
        shelf.position.set(-11.3, HILL_H + 1.4, -33 - i * 2);
        shelf.userData.solid = true;
        scene.add(shelf);
    }

    // Lindisfarne-evangeliene (bok på stativ)
    const bookStand = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.7), toonMat(0x4a3020));
    bookStand.position.set(-8.5, HILL_H + 0.6, -32);
    bookStand.userData.solid = true;
    scene.add(bookStand);

    const book = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.15, 0.5), toonMat(0xa83a28));
    book.position.set(-8.5, HILL_H + 1.3, -32);
    book.rotation.x = -Math.PI / 8;
    scene.add(book);

    const bookPages = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.12, 0.45), toonMat(0xe8dcc0));
    bookPages.position.set(-8.5, HILL_H + 1.32, -32);
    bookPages.rotation.x = -Math.PI / 8;
    scene.add(bookPages);

    const bookGold = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.02, 4, 16), toonMat(0xffdd66));
    bookGold.position.set(-8.5, HILL_H + 1.36, -31.95);
    bookGold.rotation.x = Math.PI / 2 - Math.PI / 8;
    scene.add(bookGold);

    // ─── Sovesal-inventar ──────────────────────────────────────────
    const bedPositions: [number, number][] = [
        [10.5, -32], [10.5, -34], [10.5, -36], [10.5, -38],
    ];
    for (const [bx, bz] of bedPositions) {
        const bed = new THREE.Mesh(new THREE.BoxGeometry(1, 0.3, 2), toonMat(0x6a5a42));
        bed.position.set(bx, HILL_H + 0.15, bz);
        bed.userData.solid = true;
        scene.add(bed);
        const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.4), toonMat(0xd4c090));
        pillow.position.set(bx, HILL_H + 0.35, bz - 0.7);
        scene.add(pillow);
    }

    // Personlig detalj ved seng
    const skoA = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.3), toonMat(0x3a2814));
    skoA.position.set(9.8, HILL_H + 0.05, -34);
    scene.add(skoA);
    const skoB = skoA.clone();
    skoB.position.set(9.6, HILL_H + 0.05, -34.3);
    scene.add(skoB);

    // ─── Ytre begrensnings-klipper ──────────────────────────────────
    for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 12) {
        const r = 45;
        const x = Math.cos(ang) * r;
        const z = -15 + Math.sin(ang) * r;
        if (z > 3 && Math.abs(x) < 15) continue;
        const blocker = new THREE.Mesh(
            new THREE.BoxGeometry(4, 3, 4),
            new THREE.MeshBasicMaterial({ visible: false }),
        );
        blocker.position.set(x, 1.5, z);
        blocker.userData.solid = true;
        scene.add(blocker);
    }

    // ─── Vegetasjon og trær ──────────────────────────────────────────
    engine.addVegetationPatch({ minX: -30, maxX: -14, minZ: -22, maxZ: -5 }, 0.6, 'grass');
    engine.addVegetationPatch({ minX: 14, maxX: 30, minZ: -22, maxZ: -5 }, 0.6, 'grass');
    engine.addVegetationPatch({ minX: -12, maxX: 12, minZ: -48, maxZ: -42 }, 0.5, 'grass');
    engine.addVegetationPatch({ minX: -14, maxX: -5, minZ: -1, maxZ: 4 }, 0.4, 'reeds');
    engine.addVegetationPatch({ minX: 5, maxX: 14, minZ: -1, maxZ: 4 }, 0.4, 'reeds');
    engine.addVegetationPatch({ minX: -12, maxX: -6, minZ: -22, maxZ: -21 }, 0.3, 'flowers');

    engine.addTree([-22, HILL_H, -30], 'pine');
    engine.addTree([22, HILL_H, -30], 'pine');
    engine.addTree([-26, 0, -10], 'birch');
    engine.addTree([26, 0, -10], 'birch');

    // ═══════════════════════════════════════════════════════════════
    // DIALOG-ACTIONS
    // ═══════════════════════════════════════════════════════════════
    const asNode = (d: DialogNode | DialogNode[] | undefined): DialogNode | undefined =>
        Array.isArray(d) ? d[0] : d;
    const dialogs = engine.config.dialogs;

    // Eadfrith-valg: spar
    const eadSpared = asNode(dialogs.eadfrith_response_spared);
    if (eadSpared) {
        eadSpared.onEnd = () => {
            engine.setFlag('sparedEadfrith', true);
            engine.setPhase('aftermath_spared');
            engine.playMonolog('after_choice_spared');
            engine.schedule(() => {
                engine.playMonolog('epilog_boat_spared');
                engine.schedule(() => engine.triggerEnd(), 16000);
            }, 5000);
        };
    }

    // Eadfrith-valg: drep
    const eadKilled = asNode(dialogs.eadfrith_response_killed);
    if (eadKilled) {
        eadKilled.onEnd = () => {
            engine.setFlag('sparedEadfrith', false);
            engine.setPhase('aftermath_killed');
            engine.cameraShake(0.3, 0.6);
            engine.playMonolog('after_choice_killed');
            engine.schedule(() => {
                engine.playMonolog('epilog_boat_killed');
                engine.schedule(() => engine.triggerEnd(), 16000);
            }, 5000);
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // SPILLSTART
    // ═══════════════════════════════════════════════════════════════
    engine.setPlayerMode('seated', { parent: sea.boat, offset: sea.playerSeat });
    engine.setPhase('sailing');
    engine.schedule(() => engine.playMonolog('intro_boat'), 1500);
    engine.schedule(() => engine.playMonolog('first_sight_of_island'), 14000);

    // ═══════════════════════════════════════════════════════════════
    // KONTINUERLIG OPPDATERING
    // ═══════════════════════════════════════════════════════════════
    scene.userData._customUpdate = (dt: number, time: number) => {
        const phase = engine.getPhase();

        if (phase === 'sailing') {
            sea.boat.position.z = Math.max(18, sea.boat.position.z - dt * 1.0);
            const tilt = sea.ocean.getWaveTilt(sea.boat.position.x, sea.boat.position.z);
            sea.boat.rotation.z = tilt.roll * 0.35;
            sea.boat.rotation.x = tilt.pitch * 0.2;
            sea.boat.position.y = tilt.height * 0.5;
            sea.boat.rotation.y = Math.PI;

            // Automatisk landgang når båten er fremme
            if (sea.boat.position.z <= 18.1 && !engine.getFlag('landingStarted')) {
                engine.setFlag('landingStarted', true);
                engine.schedule(() => beginLanding(), 2500);
            }
        } else {
            sea.boat.position.set(...sea.boatEnd);
            sea.boat.rotation.set(0, Math.PI, 0);
        }

        sea.ocean.update(dt);
        sea.foam.update(dt);

        const p = engine.getPlayerPosition();

        // Skjul havet inne i klosteret (ytelse)
        const nearCloister = p.z < -20 && Math.abs(p.x) < 14;
        sea.ocean.setVisible(!nearCloister);
        sea.foam.setVisible(!nearCloister);

        // Indoors-flag settes tidlig (Z<-19, FØR porten på Z=-22) for å unngå
        // svart-skjerm-klipp der kamera presser seg inn i spillerhode ved portpassering
        scene.userData._indoors = p.z < -19 && Math.abs(p.x) < 14;

        // Dollhouse-tak: skjul romtaket spilleren er inne i
        const inChapel  = p.x > -4.8 && p.x < 4.8 && p.z < -30 && p.z > -41;
        const inLibrary = p.x > -12   && p.x < -4.8 && p.z < -30 && p.z > -41;
        const inDorm    = p.x > 4.8   && p.x < 12   && p.z < -30 && p.z > -41;
        chapelRoof.visible  = !inChapel;
        libraryRoof.visible = !inLibrary;
        dormRoof.visible    = !inDorm;

        // Fase-overganger basert på spillerposisjon
        if (phase === 'landing' && p.z < -7) engine.setPhase('approach');
        if (phase === 'approach' && p.z < -21.5) engine.setPhase('cloister');

        // Konfrontasjonen utloses når spilleren har sett boken og er nær Eadfrith
        if (phase === 'cloister') {
            const seenBookIntro = engine.hasSeenMonolog('library_discovery');
            const seenBook = engine.hasSeenMonolog('library_book');
            if (seenBookIntro && seenBook && !engine.getFlag('confronted')) {
                const dist = Math.hypot(p.x - (-8), p.z - (-35));
                if (dist < 1.5) {
                    engine.setFlag('confronted', true);
                    engine.setPhase('confrontation');
                    engine.openDialog('eadfrith_intercept');
                }
            }
        }

        // Svak gull-pulsering på boken
        bookGold.rotation.z = Math.sin(time * 0.8) * 0.05;
    };

    // ═══════════════════════════════════════════════════════════════
    // FASE-OVERGANG: LANDGANG
    // ═══════════════════════════════════════════════════════════════
    function beginLanding(): void {
        engine.setPlayerMode('free');
        engine.setPhase('landing');
        engine.teleportPlayer(0, 1, 4);
        engine.setWeather({ type: 'fog', intensity: 0.35 });
    }
}

// ─── Hjelpefunksjoner ─────────────────────────────────────────────────────────

interface CrewRef {
    sigurd: { group: THREE.Group } | null;
    veteran: { group: THREE.Group } | null;
    ulv: { group: THREE.Group } | null;
}

function findCrewNPCs(scene: THREE.Scene): CrewRef {
    const result: CrewRef = { sigurd: null, veteran: null, ulv: null };
    for (const child of scene.children) {
        if (!(child instanceof THREE.Group)) continue;
        const id = child.userData.npcId;
        if (id === 'sigurd') result.sigurd = { group: child };
        else if (id === 'veteran') result.veteran = { group: child };
        else if (id === 'ulv') result.ulv = { group: child };
    }
    return result;
}

function findCharacter(scene: THREE.Scene, id: string): { group: THREE.Group } | null {
    for (const child of scene.children) {
        if (!(child instanceof THREE.Group)) continue;
        if (child.userData.npcId === id) return { group: child };
    }
    return null;
}

function addTonsure(group: THREE.Group, toonMat: (c: number, o?: Record<string, unknown>) => THREE.MeshStandardMaterial): void {
    const tonsure = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.04, 6, 16),
        toonMat(0xe4d4b8)
    );
    tonsure.position.y = 1.68;
    tonsure.rotation.x = Math.PI / 2;
    group.add(tonsure);
}

function addRobe(group: THREE.Group, toonMat: (c: number, o?: Record<string, unknown>) => THREE.MeshStandardMaterial): void {
    const robe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 1.3, 8),
        toonMat(0x3a2814)
    );
    robe.position.y = 0.65;
    group.add(robe);
}
