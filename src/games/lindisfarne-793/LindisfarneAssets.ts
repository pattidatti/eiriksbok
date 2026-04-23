import * as THREE from 'three';
import type { GameEngineRef, DialogNode } from '../engine/types';
import { buildSeascape } from '../engine/builders/SeascapeBuilder';
import { buildBeach } from '../engine/builders/BeachBuilder';
import { buildCloister, playerInRoom } from '../engine/builders/CloisterBuilder';

// Hele spillet bygges her. Tre faser i én scene.
export function setupLindisfarneScene(engine: GameEngineRef): void {
    const { scene, toonMat } = engine;

    // ───── Fase 1: Hav og båt ─────
    const sea = buildSeascape(scene, toonMat);

    // Plasser mannskap som barn av båten, og lagre sete-Y som bob-base
    const crew = findCrewNPCs(scene);
    if (crew.sigurd) {
        sea.boat.add(crew.sigurd.group);
        crew.sigurd.group.position.set(...sea.crewSeats.chief);
        crew.sigurd.group.userData.bobBase = sea.crewSeats.chief[1];
    }
    if (crew.veteran) {
        sea.boat.add(crew.veteran.group);
        crew.veteran.group.position.set(...sea.crewSeats.veteran);
        crew.veteran.group.userData.bobBase = sea.crewSeats.veteran[1];
    }
    if (crew.ulv) {
        sea.boat.add(crew.ulv.group);
        crew.ulv.group.position.set(...sea.crewSeats.peer);
        crew.ulv.group.userData.bobBase = sea.crewSeats.peer[1];
    }

    // ───── Fase 2: Strand og sti ─────
    const beach = buildBeach(scene, toonMat);
    // Referanse til beach - brukes i fase-overgang
    void beach;

    // ───── Fase 3: Klosteret ─────
    const cloister = buildCloister(scene, toonMat);

    // ───── Plasser Eadfrith i biblioteket ─────
    const eadfrith = findCharacter(scene, 'eadfrith');
    if (eadfrith) {
        // Biblioteket sentrert ved (-8, -22). Eadfrith står bak et bord i midten.
        eadfrith.group.position.set(-8, 0, -22);
        eadfrith.group.rotation.y = Math.PI / 2; // vendt mot øst (mot spilleren)
        // Tonsure: lys ring rundt skallen
        addTonsure(eadfrith.group, toonMat);
        // Munkekappe: brun kappe over kroppen
        addRobe(eadfrith.group, toonMat);
    }

    // ───── Plasser Lindisfarne-evangeliene (bok-objekt i biblioteket) ─────
    const bookStand = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.2, 0.7),
        toonMat(0x4a3020)
    );
    bookStand.position.set(-8.5, 0.6, -21.5);
    bookStand.userData.solid = true;
    scene.add(bookStand);

    const book = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.15, 0.5),
        toonMat(0xa83a28) // rødbrunt omslag
    );
    book.position.set(-8.5, 1.3, -21.5);
    book.rotation.x = -Math.PI / 8; // tippet mot leseren
    scene.add(book);

    const bookPages = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.12, 0.45),
        toonMat(0xe8dcc0) // lysere sider
    );
    bookPages.position.set(-8.5, 1.32, -21.5);
    bookPages.rotation.x = -Math.PI / 8;
    scene.add(bookPages);

    // Gullkantete dekorasjon på boken
    const bookGold = new THREE.Mesh(
        new THREE.TorusGeometry(0.15, 0.02, 4, 16),
        toonMat(0xffdd66)
    );
    bookGold.position.set(-8.5, 1.36, -21.45);
    bookGold.rotation.x = Math.PI / 2 - Math.PI / 8;
    scene.add(bookGold);

    // ───── Kapell-inventar: alter, kors, lys ─────
    const altar = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 1.2, 1),
        toonMat(0x8a7058)
    );
    altar.position.set(0, 0.6, -33.5);
    altar.userData.solid = true;
    scene.add(altar);

    // Stort kors bak alteret
    const altarCrossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 2, 0.15),
        toonMat(0x3a2614)
    );
    altarCrossV.position.set(0, 2.2, -34.3);
    scene.add(altarCrossV);
    const altarCrossH = new THREE.Mesh(
        new THREE.BoxGeometry(1, 0.15, 0.15),
        toonMat(0x3a2614)
    );
    altarCrossH.position.set(0, 2.5, -34.3);
    scene.add(altarCrossH);

    // To sølvbegre på alteret
    for (let i = 0; i < 2; i++) {
        const chalice = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.08, 0.3, 12),
            toonMat(0xd4d4d4)
        );
        chalice.position.set(-0.5 + i, 1.35, -33.5);
        scene.add(chalice);
    }

    // ───── Sovesal-inventar: senger langs østveggen ─────
    // Døra er i vest (x=4). Senger plasseres langs østveggen (x=10.5) så spilleren
    // kan gå inn og rundt dem. Rommet er 8 m dypt (z=-18 til -26).
    const sovesalSengPositions: [number, number][] = [
        [10.5, -19], [10.5, -21], [10.5, -23], [10.5, -25],
    ];
    for (const [sx, sz] of sovesalSengPositions) {
        const bed = new THREE.Mesh(
            new THREE.BoxGeometry(1, 0.3, 2),
            toonMat(0x6a5a42)
        );
        bed.position.set(sx, 0.15, sz);
        bed.userData.solid = true;
        scene.add(bed);

        const pillow = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.1, 0.4),
            toonMat(0xd4c090)
        );
        pillow.position.set(sx, 0.35, sz - 0.7);
        scene.add(pillow);
    }

    // Et par sko ved siden av en seng (personlig detalj)
    const skoA = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.1, 0.3),
        toonMat(0x3a2814)
    );
    skoA.position.set(9.8, 0.05, -21);
    scene.add(skoA);
    const skoB = skoA.clone();
    skoB.position.set(9.6, 0.05, -21);
    scene.add(skoB);

    // ───── Biblioteket: bokhyller langs veggene ─────
    for (let i = 0; i < 3; i++) {
        const shelf = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 2.8, 2.5),
            toonMat(0x4a3020)
        );
        shelf.position.set(-11.3, 1.4, -21 - i * 1.5 + 2);
        shelf.userData.solid = true;
        scene.add(shelf);
    }

    // ───── Ytre ring-klipper rundt hele øya (blokkerer utforskning utover kart) ─────
    for (let ang = 0; ang < Math.PI * 2; ang += Math.PI / 12) {
        const r = 45;
        const x = Math.cos(ang) * r;
        const z = -15 + Math.sin(ang) * r;
        if (z > 3 && Math.abs(x) < 15) continue; // la stranden være åpen mot havet
        const ringRock = new THREE.Mesh(
            new THREE.BoxGeometry(4, 3, 4),
            new THREE.MeshBasicMaterial({ visible: false }),
        );
        ringRock.position.set(x, 1.5, z);
        ringRock.userData.solid = true;
        scene.add(ringRock);
    }

    // ───── Vegetasjon: gress på øya, siv langs vannkanten ─────
    // Klosteret strekker seg fra ca x=-12 (bibliotek-vest) til x=12 (dormitory-øst), z=-34..-18.
    // Hold gresset UTENFOR klosterets footprint og til sidene av stien.
    engine.addVegetationPatch(
        { minX: -30, maxX: -14, minZ: -22, maxZ: -5 },
        0.6,
        'grass',
    );
    engine.addVegetationPatch(
        { minX: 14, maxX: 30, minZ: -22, maxZ: -5 },
        0.6,
        'grass',
    );
    // Gress NORD for klosteret (bak chapel)
    engine.addVegetationPatch(
        { minX: -12, maxX: 12, minZ: -42, maxZ: -36 },
        0.5,
        'grass',
    );
    // Siv langs strand-linja (rundt vannkanten)
    engine.addVegetationPatch(
        { minX: -14, maxX: -5, minZ: -1, maxZ: 4 },
        0.4,
        'reeds',
    );
    engine.addVegetationPatch(
        { minX: 5, maxX: 14, minZ: -1, maxZ: 4 },
        0.4,
        'reeds',
    );
    // Litt blomster i nærheten av klosteret (idyll)
    engine.addVegetationPatch(
        { minX: -12, maxX: -6, minZ: -32, maxZ: -28 },
        0.3,
        'flowers',
    );

    // Et par trær oppe på øya (langs ytterkanten, ikke i veien for spilleren)
    engine.addTree([-22, 0, -28], 'pine');
    engine.addTree([22, 0, -28], 'pine');
    engine.addTree([-26, 0, -10], 'birch');
    engine.addTree([26, 0, -10], 'birch');

    // ───── Koble dialog-actions ─────
    // Dialog-valg trigger fase-overganger og flagg
    // Lindisfarne bruker ikke Fase 4.4 variant-arrays, så vi narrower til DialogNode.
    const asNode = (d: DialogNode | DialogNode[] | undefined): DialogNode | undefined =>
        Array.isArray(d) ? d[0] : d;
    const dialogs = engine.config.dialogs;

    // Mannskap-dialoger markerer "snakket med" når valg-trykkes
    wireMarkAfter(asNode(dialogs.sigurd_greeting), engine, 'talkedChief');
    wireMarkAfter(asNode(dialogs.chief_first), engine, 'talkedChief');
    wireMarkAfter(asNode(dialogs.chief_restless), engine, 'talkedChief');
    wireMarkAfter(asNode(dialogs.chief_guards), engine, 'talkedChief');
    wireMarkAfter(asNode(dialogs.chief_intel), engine, 'talkedChief');

    wireMarkAfter(asNode(dialogs.veteran_warning), engine, 'talkedVeteran');
    wireMarkAfter(asNode(dialogs.ulv_greeting), engine, 'talkedPeer');
    wireMarkAfter(asNode(dialogs.peer_plan), engine, 'talkedPeer');

    // Når Sigurd sier "Gå i land" - trigger landgang
    const chiefLand = asNode(dialogs.chief_land);
    if (chiefLand) {
        chiefLand.choices[0].action = () => {
            beginLanding();
        };
    }

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

    // ───── Proximity-filter: ekskluder NPCer som allerede er snakket med ─────
    // Gjør at neste nærmeste NPC blir tilgjengelig etter at en dialog er fullført.
    scene.userData._proximityFilter = (id: string): boolean => {
        if (id === 'sigurd' && engine.getFlag('talkedChief')) return false;
        if (id === 'veteran' && engine.getFlag('talkedVeteran')) return false;
        if (id === 'ulv' && engine.getFlag('talkedPeer')) return false;
        return true;
    };

    // ───── Fase 1 start: plasser spilleren i båten ─────
    engine.setPlayerMode('seated', { parent: sea.boat, offset: sea.playerSeat });
    engine.setPhase('sailing');

    // Start intro-monolog kort etter spillstart
    engine.schedule(() => engine.playMonolog('intro_boat'), 1500);
    engine.schedule(() => engine.playMonolog('first_sight_of_island'), 14000);

    // Båten stopper her og venter til spilleren har snakket ferdig med alle
    const sailingHoldZ = 18;

    // ───── Kontinuerlig oppdatering ─────
    scene.userData._customUpdate = (dt: number, time: number) => {
        // Båt-vugging når den er på havet
        const phase = engine.getPhase();
        if (phase === 'sailing') {
            // Seil nordover (mot negativ Z) men stopp før stranden
            sea.boat.position.z = Math.max(
                sailingHoldZ,
                sea.boat.position.z - dt * 1.0
            );
            // Bølge-vugg (lav amplitude så det ikke blir sjøsykt)
            const tilt = sea.ocean.getWaveTilt(sea.boat.position.x, sea.boat.position.z);
            sea.boat.rotation.z = tilt.roll * 0.35;
            sea.boat.rotation.x = tilt.pitch * 0.2;
            sea.boat.position.y = tilt.height * 0.5;
            // Hold hovedrotasjon (Y) låst til Math.PI - dragehodet peker mot nord
            sea.boat.rotation.y = Math.PI;

            // Sjekk om alle mannskapsmedlemmer er snakket med
            if (
                engine.getFlag('talkedChief') &&
                engine.getFlag('talkedVeteran') &&
                engine.getFlag('talkedPeer') &&
                !engine.getFlag('readyToLand')
            ) {
                engine.setFlag('readyToLand', true);
                // Trigger høvdings-landgangsdialog
                engine.schedule(() => engine.openDialog('chief_land'), 2500);
            }
        } else {
            // Etter landing - båten ligger parkert ved stranden med baugen inn mot land
            sea.boat.position.set(...sea.boatEnd);
            sea.boat.rotation.set(0, Math.PI, 0);
        }

        // Oppdater hav og skum uansett fase
        sea.ocean.update(dt);
        sea.foam.update(dt);

        // Skjul havet når spilleren er inne i klosteret (ytelse + estetikk)
        const player = engine.getPlayerPosition();
        const inCloister = player.z < -17 && Math.abs(player.x) < 13;
        sea.ocean.setVisible(!inCloister);
        sea.foam.setVisible(!inCloister);

        // Tak-dollhouse: skjul taket i rommet spilleren er inne i
        const { chapel, corridor, library, dormitory } = cloister.rooms;
        if (chapel.roof) chapel.roof.visible = !playerInRoom(player, chapel);
        if (corridor.roof) corridor.roof.visible = !playerInRoom(player, corridor);
        if (library.roof) library.roof.visible = !playerInRoom(player, library);
        if (dormitory.roof) dormitory.roof.visible = !playerInRoom(player, dormitory);

        // Indoors-flag for kamera-clamp
        scene.userData._indoors = inCloister;

        // Fase-overganger basert på spillerposisjon
        if (phase === 'landing' && player.z < -4) {
            engine.setPhase('approach');
        }
        if (phase === 'approach' && player.z < -18) {
            engine.setPhase('cloister');
        }
        if (phase === 'cloister') {
            // Konfrontasjonen skal først utløses når spilleren faktisk har sett boken og
            // observert biblioteket. Krev at begge bibliotek-monologene er vist, og bruk
            // Eadfriths reelle posisjon (-8, -22) med tight radius.
            const seenBookIntro = engine.hasSeenMonolog('library_discovery');
            const seenBook = engine.hasSeenMonolog('library_book');
            if (seenBookIntro && seenBook && !engine.getFlag('confronted')) {
                const toEadfrith = Math.hypot(player.x - (-8), player.z - (-22));
                if (toEadfrith < 1.5) {
                    engine.setFlag('confronted', true);
                    engine.setPhase('confrontation');
                    engine.openDialog('eadfrith_intercept');
                }
            }
        }

        // Animer bøker på lesepulten - en svak pulsering i gullkanten
        bookGold.rotation.z = Math.sin(time * 0.8) * 0.05;

        // NPC-markører: synlig under seilas for dem som ikke er snakket med ennå
        const showCrewMarkers = phase === 'sailing';
        engine.setCharacterMarkerVisible('sigurd', showCrewMarkers && !engine.getFlag('talkedChief'));
        engine.setCharacterMarkerVisible('veteran', showCrewMarkers && !engine.getFlag('talkedVeteran'));
        engine.setCharacterMarkerVisible('ulv', showCrewMarkers && !engine.getFlag('talkedPeer'));
    };

    // ───── Fase-overgang: Landgang ─────
    function beginLanding(): void {
        engine.setPlayerMode('free');
        engine.setPhase('landing');
        // Teleporter spiller til strand-startpunkt (ved vannkanten)
        engine.teleportPlayer(0, 0, 4);
        // Lett tåke ved ankomst - støtter stemningen av "noe ukjent venter"
        engine.setWeather({ type: 'fog', intensity: 0.35 });
    }
}

function wireMarkAfter(dialog: { choices: { action?: () => void }[] } | undefined, engine: GameEngineRef, flag: string): void {
    if (!dialog) return;
    for (const c of dialog.choices) {
        const prev = c.action;
        c.action = () => {
            prev?.();
            engine.setFlag(flag, true);
        };
    }
}

interface CrewRef {
    sigurd: { group: THREE.Group; marker?: THREE.Mesh } | null;
    veteran: { group: THREE.Group; marker?: THREE.Mesh } | null;
    ulv: { group: THREE.Group; marker?: THREE.Mesh } | null;
}

// Finner NPC-gruppene ved å slå opp userData.npcId som motoren setter i buildCharacter.
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

// Legg til tonsure på en munk-hode (hvit/lys hår-ring rundt skallen)
function addTonsure(group: THREE.Group, toonMat: (c: number, o?: Record<string, unknown>) => THREE.MeshStandardMaterial): void {
    // En torus på hodet som representerer hår-kronen
    const tonsure = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.04, 6, 16),
        toonMat(0xe4d4b8)
    );
    tonsure.position.y = 1.68;
    tonsure.rotation.x = Math.PI / 2;
    group.add(tonsure);
}

// Legg til en munkekappe - enkel cylinder i brun farge
function addRobe(group: THREE.Group, toonMat: (c: number, o?: Record<string, unknown>) => THREE.MeshStandardMaterial): void {
    const robe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.5, 1.3, 8),
        toonMat(0x3a2814)
    );
    robe.position.y = 0.65;
    group.add(robe);
}
