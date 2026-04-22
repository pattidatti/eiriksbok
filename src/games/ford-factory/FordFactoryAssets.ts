import * as THREE from 'three';
import type { GameEngineRef, AABB2D, DialogNode } from '../engine/types';
import { buildRoom } from '../engine/systems/RoomSystem';

// ─── Produksjonstilstand ─────────────────────────────────────────────────────
// Én "bil" på båndet har en Group som beveger seg fra x=-9 til x=+9.
// Deler avdekkes etter hvert som bilen passerer hver stasjon.

interface CarState {
    group: THREE.Group;
    chassis: THREE.Group;
    motor: THREE.Group;
    wheels: THREE.Group;
    body: THREE.Group;
    active: boolean;
    stage: number; // 0 = tomt chassis, 1 = +motor, 2 = +hjul, 3 = +karosseri
}

interface StationPlacement {
    id: 'chassis' | 'motor' | 'wheels' | 'body';
    label: string;
    order: number; // 0=chassis (må være første), 1=motor, 2=hjul, 3=karosseri
    x: number;
    z: number;
    group: THREE.Group;
}

type StationId = 'chassis' | 'motor' | 'wheels' | 'body';
const WORKER_IDS: readonly StationId[] = ['chassis', 'motor', 'wheels', 'body'];

// ─── Hovedoppsett ────────────────────────────────────────────────────────────

export function setupFordFactoryScene(engine: GameEngineRef): void {
    const { scene, toonMat, config, animateReveal, schedule } = engine;
    const collisionBoxes = scene.userData.collisionBoxes as AABB2D[];

    // ───── Bygg fabrikkhallen (åpent industrilokale) ─────
    buildRoom(
        scene,
        toonMat,
        {
            id: 'factory_hall',
            center: [0, 0],
            size: [34, 26],
            wallHeight: 7,
            openings: [{ side: 'S', offset: 0, width: 3.5 }],
            floorColor: 0x5a5148,
            wallColor: 0x6a6458,
            hasRoof: false, // fabrikkhall med takvindu - vi ser stålbjelker
        },
        collisionBoxes
    );

    // ───── Belysning (industriell fabrikk, 1913) ─────
    // Dagslys gjennom takvinduene
    scene.add(new THREE.HemisphereLight(0xfff0d0, 0x55443a, 2.2));

    const skylight = new THREE.DirectionalLight(0xffeedd, 2.0);
    skylight.position.set(4, 18, -6);
    skylight.castShadow = true;
    skylight.shadow.mapSize.set(1024, 1024);
    const sc = skylight.shadow.camera;
    sc.left = sc.bottom = -20; sc.right = sc.top = 20; sc.near = 1; sc.far = 50;
    scene.add(skylight);

    const fillLight = new THREE.DirectionalLight(0xdde8ff, 0.8);
    fillLight.position.set(-8, 6, 10);
    scene.add(fillLight);

    // Tidlige elektriske lamper over samlebåndet
    for (const bx of [-8, -4, 0, 4, 8]) {
        // Kabel fra takbjelke (y=6.8) ned til lampeskjerm (y=5.8)
        const cord = new THREE.Mesh(
            new THREE.CylinderGeometry(0.025, 0.025, 1.0, 6),
            toonMat(0x1a1a1a)
        );
        cord.position.set(bx, 6.3, 0);
        scene.add(cord);

        // Konisk industrilampeskjerm — smal topp, åpen bunn
        const shade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.42, 0.32, 14, 1, false),
            toonMat(0x252218)
        );
        shade.position.set(bx, 5.64, 0);
        scene.add(shade);

        // Liten ring øverst på skjermen
        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.11, 0.025, 6, 14),
            toonMat(0x3a3828)
        );
        ring.position.set(bx, 5.8, 0);
        ring.rotation.x = Math.PI / 2;
        scene.add(ring);

        // Glødende lyspære synlig under skjermen
        const bulbGlow = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xfff0a0 })
        );
        bulbGlow.position.set(bx, 5.48, 0);
        scene.add(bulbGlow);

        // Lys
        const light = new THREE.PointLight(0xffdd88, 5.0, 18, 1.0);
        light.position.set(bx, 5.3, 0);
        scene.add(light);
    }

    // Stålbjelker i taket for fabrikkatmosfære
    for (let i = -14; i <= 14; i += 4) {
        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.4, 26),
            toonMat(0x3a3028)
        );
        beam.position.set(i, 6.8, 0);
        scene.add(beam);
    }
    for (let i = -12; i <= 12; i += 6) {
        const beam = new THREE.Mesh(
            new THREE.BoxGeometry(34, 0.3, 0.3),
            toonMat(0x3a3028)
        );
        beam.position.set(0, 6.5, i);
        scene.add(beam);
    }

    // Store vinduer langs nordveggen (bak båndet)
    for (const wx of [-10, 0, 10]) {
        const win = new THREE.Mesh(
            new THREE.PlaneGeometry(4, 2.5),
            new THREE.MeshBasicMaterial({
                color: 0xffd888,
                transparent: true,
                opacity: 0.5,
            })
        );
        win.position.set(wx, 4.5, -12.85);
        scene.add(win);
    }

    // ───── Samlebåndet ─────
    // Bånd fra x=-9 til x=+9, z=0, høyde 0.7
    const beltLength = 18;
    const beltGroup = new THREE.Group();
    scene.add(beltGroup);

    const beltTop = new THREE.Mesh(
        new THREE.BoxGeometry(beltLength, 0.2, 1.4),
        toonMat(0x1a1a1a)
    );
    beltTop.position.set(0, 0.7, 0);
    beltGroup.add(beltTop);

    // Støttebjelker under båndet
    for (let bx = -8; bx <= 8; bx += 2) {
        const support = new THREE.Mesh(
            new THREE.BoxGeometry(0.2, 0.6, 1.2),
            toonMat(0x3a3028)
        );
        support.position.set(bx, 0.35, 0);
        beltGroup.add(support);
    }

    // Endevalser
    for (const ex of [-9, 9]) {
        const roller = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 1.4, 12),
            toonMat(0x6a5040)
        );
        roller.rotation.x = Math.PI / 2;
        roller.position.set(ex, 0.7, 0);
        beltGroup.add(roller);
    }

    // Kollisjonsbokser for båndet: delt opp i to segmenter med passasje i midten
    // (x=-2.2 til x=+2.2) slik at spilleren kan krysse båndet sentralt.
    collisionBoxes.push({
        minX: -9.5,
        maxX: -2.2,
        minZ: -0.95,
        maxZ: 0.95,
    });
    collisionBoxes.push({
        minX: 2.2,
        maxX: 9.5,
        minZ: -0.95,
        maxZ: 0.95,
    });

    // ───── Stasjonsplasseringer (initialt skjult) ─────
    const stationDefs: Array<Omit<StationPlacement, 'group'> & { build: () => THREE.Group }> = [
        { id: 'chassis', label: 'Chassis', order: 0, x: -7, z: -2.2, build: () => buildChassisStation(toonMat) },
        { id: 'motor', label: 'Motor', order: 1, x: -2, z: -2.2, build: () => buildMotorStation(toonMat) },
        { id: 'wheels', label: 'Hjul', order: 2, x: 2, z: -2.2, build: () => buildWheelsStation(toonMat) },
        { id: 'body', label: 'Karosseri', order: 3, x: 7, z: -2.2, build: () => buildBodyStation(toonMat) },
    ];

    const stations = new Map<string, StationPlacement>();
    for (const s of stationDefs) {
        const g = s.build();
        g.position.set(s.x, 0, s.z);
        g.visible = false;
        scene.add(g);
        stations.set(s.id, { id: s.id, label: s.label, order: s.order, x: s.x, z: s.z, group: g });
    }

    // Gulvmarkører der stasjoner skal - gule sirkler som lyser
    const markerMeshes = new Map<string, THREE.Mesh>();
    for (const s of stationDefs) {
        const marker = new THREE.Mesh(
            new THREE.CylinderGeometry(1.2, 1.2, 0.05, 24),
            new THREE.MeshBasicMaterial({ color: 0xffcc44, transparent: true, opacity: 0.5 })
        );
        marker.position.set(s.x, 0.03, s.z);
        scene.add(marker);
        markerMeshes.set(s.id, marker);
    }

    // ───── Fords skrivebord (ved vestveggen) ─────
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2, 0.9, 1.1), toonMat(0x4a3420));
    desk.position.set(-14, 0.45, 8);
    scene.add(desk);
    collisionBoxes.push({ minX: -15.4, maxX: -12.6, minZ: 7.05, maxZ: 8.95 });
    const papers = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.4), toonMat(0xe8e0d4));
    papers.position.set(-13.7, 0.93, 8);
    scene.add(papers);

    // ───── Model T bilpool ─────
    const cars: CarState[] = [];
    for (let i = 0; i < 5; i++) {
        const car = buildModelT(toonMat);
        car.group.visible = false;
        scene.add(car.group);
        cars.push(car);
    }

    // ───── Arbeider-grupper caches ─────
    // Hentes én gang etter at motoren har bygget NPCene, brukes per frame uten søk.
    const workerGroups = new Map<StationId, THREE.Group>();
    for (const id of WORKER_IDS) {
        const g = findCharacterGroup(scene, `worker_${id}`);
        if (g) {
            g.visible = false; // synkront skjult - ingen blinking ved start
            workerGroups.set(id, g);
        }
    }

    // ───── Station-NPC-grupper (interaktive plasserings-punkter) ─────
    const STATION_NPC_IDS = ['chassis', 'motor', 'wheels', 'body'] as const;
    const stationNPCGroups = new Map<string, THREE.Group>();
    for (const id of STATION_NPC_IDS) {
        const g = findCharacterGroup(scene, `station_${id}`);
        if (g) {
            g.visible = false;
            stationNPCGroups.set(id, g);
        }
    }

    // Dialogs for station-NPCene — motoren kaller automatisk `${id}_greeting` ved E-trykk.
    const stationLabels: Record<string, string> = {
        chassis: 'chassis-stasjonen (rammen)',
        motor: 'motor-stasjonen',
        wheels: 'hjul-stasjonen',
        body: 'karosseri-stasjonen',
    };
    for (const id of STATION_NPC_IDS) {
        const label = stationLabels[id];
        const capturedId = id;
        config.dialogs[`station_${id}_greeting`] = {
            speaker: 'Charles Sorensen',
            text: `Her er plassen for ${label}. Sette den opp?`,
            choices: [
                {
                    text: `Ja, plasser ${label.split(' ')[0]}-stasjonen her.`,
                    next: null,
                    action: () => tryPlaceStation(capturedId),
                },
                { text: 'Ikke ennå.', next: null },
            ],
        };
    }

    // ───── Produksjonstilstand ─────
    const production = {
        running: false,
        carsCompleted: 0,
        spawnCooldown: 0,
        beltSpeed: 0.8,
    };

    const placedStations: StationId[] = [];
    let endTransitionScheduled = false;

    // ───── Dynamisk Sorensen-greeting basert på fase ─────
    function updateSorensenGreeting(): void {
        const phase = engine.getPhase();
        const dialogs = config.dialogs;

        if (phase === 'intro') {
            dialogs.sorensen_greeting = introDialog;
        } else if (phase === 'placing') {
            // Vis uplasserte station-NPCer slik at spilleren kan interagere direkte ved markørene
            for (const id of STATION_NPC_IDS) {
                if (!placedStations.includes(id as StationId)) {
                    const g = stationNPCGroups.get(id);
                    if (g) g.visible = true;
                }
            }
            if (placedStations.length < 4) {
                dialogs.sorensen_greeting = makeStationPickerDialog(placedStations);
            } else {
                dialogs.sorensen_greeting = {
                    speaker: 'Charles Sorensen',
                    text: 'Alle fire stasjoner står. Mennene er klare. Skal vi starte samlebåndet?',
                    choices: [
                        {
                            text: 'Start produksjonen.',
                            next: null,
                            action: () => startProduction(),
                        },
                    ],
                };
            }
        } else if (phase === 'running_1913') {
            dialogs.sorensen_greeting = {
                speaker: 'Charles Sorensen',
                text: 'Det går. Det går virkelig. Gå rundt og se. Snakk med meg igjen når du er klar for 1914.',
                choices: [
                    { text: 'Jeg går en runde.', next: null },
                    { text: 'Ta meg til 1914.', next: null, action: () => goTo1914() },
                ],
            };
        } else if (phase === 'year_1914') {
            dialogs.sorensen_greeting = {
                speaker: 'Charles Sorensen',
                text: 'Mennene orker ikke. Jeg mister tre av fire i året. Noe må endres.',
                choices: [
                    { text: 'Hva foreslår du?', next: 'sorensen_five_dollar' },
                    { text: 'Hvorfor orker de ikke?', next: 'sorensen_why_tired' },
                ],
            };
        } else if (phase === 'ending') {
            dialogs.sorensen_greeting = {
                speaker: 'Charles Sorensen',
                text: 'Vi har endret hvordan ting lages. Ikke bare biler. Alt. La oss se på tallene.',
                choices: [
                    { text: 'Vis meg.', next: null, action: () => engine.triggerEnd() },
                ],
            };
        }
    }

    // Intro-dialogen som starter hele spillet. Kjedes via 'next' til sorensen_problem,
    // som igjen peker til sorensen_idea (begge definert i FordFactoryDialogs.ts).
    const introDialog: DialogNode = {
        speaker: 'Charles Sorensen',
        text: 'Herr Ford. Jeg har tall til deg. En Model T tar tolv timer å bygge. Tolv. Mennene mine står og venter på hverandre hele dagen.',
        choices: [
            { text: 'Vis meg hva som skjer.', next: 'sorensen_problem' },
            { text: 'Hvorfor tolv timer?', next: 'sorensen_problem' },
        ],
    };
    config.dialogs.sorensen_greeting = introDialog;

    // Koble sorensen_idea siste valg til å sette fase 'placing'
    if (config.dialogs.sorensen_idea) {
        config.dialogs.sorensen_idea.choices[0].action = () => {
            engine.setPhase('placing');
            updateSorensenGreeting();
        };
    }

    // Koble five_dollar-valget: sett flag, spill Ford-monolog, gå til ending etter 18s
    if (config.dialogs.sorensen_five_dollar) {
        config.dialogs.sorensen_five_dollar.choices[0].action = () => {
            engine.setFlag('fiveDollarDay', true);
            engine.playMonolog('ford_reflection');
            if (endTransitionScheduled) return; // unngå dobbelt-scheduling
            endTransitionScheduled = true;
            schedule(() => {
                engine.setPhase('ending');
                updateSorensenGreeting();
            }, 18000);
        };
    }

    // ───── Plasserings-logikk ─────
    function tryPlaceStation(id: StationId): void {
        // Chassis må plasseres først
        if (placedStations.length === 0 && id !== 'chassis') {
            // Bruk schedule så motorens egen closeDialog rekker å kjøre først.
            // Uten dette overskriver closeDialog den nyåpnede feilmeldingen.
            schedule(() => engine.openDialog('sorensen_wrong_order'), 80);
            return;
        }
        if (placedStations.includes(id)) return;

        const st = stations.get(id);
        if (!st) return;

        placedStations.push(id);
        st.group.visible = true;
        animateReveal(st.group);

        // Skjul gulvmarkøren - stasjonen er nå plassert
        const marker = markerMeshes.get(id);
        if (marker) marker.visible = false;

        // Skjul station-NPCen — stasjonen er nå plassert
        const stationNPC = stationNPCGroups.get(id);
        if (stationNPC) stationNPC.visible = false;

        // Vis arbeideren for denne stasjonen (én gang)
        const worker = workerGroups.get(id);
        if (worker) worker.visible = true;

        // Kollisjonsboks for bordet
        collisionBoxes.push({
            minX: st.x - 1.2,
            maxX: st.x + 1.2,
            minZ: st.z - 0.8,
            maxZ: st.z + 0.8,
        });

        engine.setEmotion('sorensen', 'glad', 2000);
        updateSorensenGreeting();
    }

    function makeStationPickerDialog(placed: StationId[]): DialogNode {
        const all: Array<{ id: StationId; label: string }> = [
            { id: 'chassis', label: 'Chassis-stasjon (rammen først)' },
            { id: 'motor', label: 'Motor-stasjon' },
            { id: 'wheels', label: 'Hjul-stasjon' },
            { id: 'body', label: 'Karosseri-stasjon (siste)' },
        ];
        const remaining = all.filter((s) => !placed.includes(s.id));

        const introText =
            placed.length === 0
                ? 'La oss sette opp samlebåndet. Hvilken stasjon skal vi plassere først? Husk: rammen må alltid komme først.'
                : `Bra. ${4 - placed.length} stasjoner igjen. Hvilken nå?`;

        return {
            speaker: 'Charles Sorensen',
            text: introText,
            choices: remaining.map((s) => ({
                text: s.label,
                next: null,
                action: () => tryPlaceStation(s.id),
            })),
        };
    }

    function startProduction(): void {
        engine.setPhase('running_1913');
        production.running = true;
        production.spawnCooldown = 0;
        updateSorensenGreeting();
        engine.playMonolog('production_start');
    }

    function goTo1914(): void {
        engine.setPhase('year_1914');
        production.beltSpeed = 1.4;
        updateSorensenGreeting();
        engine.playMonolog('ford_1914');
    }

    // ───── Proximity-filter: worker-NPCer er aldri interaktive,
    //       station-NPCer kun i 'placing'-fasen ─────
    scene.userData._proximityFilter = (id: string): boolean => {
        if (id.startsWith('worker_')) return false;
        if (id.startsWith('station_')) return engine.getPhase() === 'placing';
        return true;
    };

    // ───── Per-frame-oppdatering ─────
    scene.userData._customUpdate = (dt: number, time: number) => {
        // Animer plasserte arbeidere (liten svinge-bevegelse)
        if (production.running) {
            for (const id of placedStations) {
                const worker = workerGroups.get(id);
                if (worker) {
                    worker.rotation.z = Math.sin(time * 4 + id.length) * 0.08;
                }
            }
        }

        if (production.running) {
            updateProduction(dt, cars, placedStations, production, stations);
        }
    };

    // ───── Start intro-monolog kort etter spillstart ─────
    schedule(() => engine.playMonolog('intro_ford'), 1500);
}

// ─── Produksjonsloop ────────────────────────────────────────────────────────

function updateProduction(
    dt: number,
    cars: CarState[],
    placedStations: StationId[],
    production: { running: boolean; carsCompleted: number; spawnCooldown: number; beltSpeed: number },
    stations: Map<string, StationPlacement>
): void {
    production.spawnCooldown -= dt;

    // Spawn ny bil hvis ingen aktiv i startområdet
    const anyInStart = cars.some((c) => c.active && c.group.position.x < -7);
    if (!anyInStart && production.spawnCooldown <= 0) {
        const free = cars.find((c) => !c.active);
        if (free) {
            free.active = true;
            free.stage = 0;
            free.group.position.set(-9, 0.8, 0);
            free.group.visible = true;
            free.chassis.visible = true;
            free.motor.visible = false;
            free.wheels.visible = false;
            free.body.visible = false;
            production.spawnCooldown = 4.5;
        }
    }

    const nextStageMap: StationId[] = ['chassis', 'motor', 'wheels', 'body'];

    for (const car of cars) {
        if (!car.active) continue;
        car.group.position.x += production.beltSpeed * dt;

        const nextId = nextStageMap[car.stage];
        if (nextId && placedStations.includes(nextId)) {
            const st = stations.get(nextId);
            if (st && car.group.position.x >= st.x) {
                const part =
                    nextId === 'motor' ? car.motor :
                    nextId === 'wheels' ? car.wheels :
                    nextId === 'body' ? car.body :
                    car.chassis;
                part.visible = true;
                part.scale.set(0.1, 0.1, 0.1);
                animateScaleIn(part);
                car.stage++;
            }
        }

        if (car.group.position.x > 9.5) {
            car.active = false;
            car.group.visible = false;
            production.carsCompleted++;
        }
    }
}

// Kanselleres automatisk hvis objektet fjernes fra scenen (obj.parent blir null ved engine.dispose).
function animateScaleIn(obj: THREE.Object3D): void {
    const start = performance.now();
    const dur = 400;
    const step = () => {
        if (!obj.parent) return; // scenen er ryddet - avbryt rAF-løkken
        const t = Math.min(1, (performance.now() - start) / dur);
        const ease = t < 0.7 ? t * t * 2.0 : 1 + Math.sin((t - 0.7) * 8) * 0.1 * (1 - t);
        obj.scale.set(ease, ease, ease);
        if (t < 1) requestAnimationFrame(step);
        else obj.scale.set(1, 1, 1);
    };
    requestAnimationFrame(step);
}

// ─── Model T byggedeler ─────────────────────────────────────────────────────

function buildModelT(toonMat: GameEngineRef['toonMat']): CarState {
    const group = new THREE.Group();

    // Chassis (rammen + bunn)
    const chassis = new THREE.Group();
    const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.15, 1), toonMat(0x2a1a0e));
    frame.position.y = 0.1;
    chassis.add(frame);
    for (const fx of [-0.7, 0.7]) {
        const axle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8),
            toonMat(0x1a1a1a)
        );
        axle.rotation.x = Math.PI / 2;
        axle.position.set(fx, 0.05, 0);
        chassis.add(axle);
    }
    group.add(chassis);

    const motor = new THREE.Group();
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.6), toonMat(0x3a3028));
    block.position.set(-0.7, 0.35, 0);
    motor.add(block);
    const stack = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8),
        toonMat(0x1a1a1a)
    );
    stack.position.set(-0.7, 0.7, 0);
    motor.add(stack);
    motor.visible = false;
    group.add(motor);

    const wheels = new THREE.Group();
    for (const [wx, wz] of [
        [-0.7, -0.55], [-0.7, 0.55], [0.7, -0.55], [0.7, 0.55],
    ] as [number, number][]) {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.15, 12),
            toonMat(0x1a1a1a)
        );
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, 0.05, wz);
        wheels.add(wheel);
    }
    wheels.visible = false;
    group.add(wheels);

    const body = new THREE.Group();
    const lowerBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.5, 0.95),
        toonMat(0x1a1a1a)
    );
    lowerBody.position.set(0.1, 0.45, 0);
    body.add(lowerBody);
    const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.55, 0.85),
        toonMat(0x2a1a0e)
    );
    cabin.position.set(0.3, 0.95, 0);
    body.add(cabin);
    const windscreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.6, 0.35),
        new THREE.MeshBasicMaterial({ color: 0x2a3a3a, transparent: true, opacity: 0.8 })
    );
    windscreen.position.set(0.1, 1.0, 0);
    windscreen.rotation.y = Math.PI / 2;
    body.add(windscreen);
    body.visible = false;
    group.add(body);

    return { group, chassis, motor, wheels, body, active: false, stage: 0 };
}

// ─── Stasjons-byggverk ──────────────────────────────────────────────────────

function buildChassisStation(toonMat: GameEngineRef['toonMat']): THREE.Group {
    const g = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1), toonMat(0x5a4030));
    table.position.y = 0.45;
    g.add(table);
    for (let i = 0; i < 3; i++) {
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(1.4, 0.08, 0.7),
            toonMat(0x3a2818)
        );
        frame.position.set(0, 0.95 + i * 0.1, 0);
        g.add(frame);
    }
    addStationSign(g, toonMat, 'CHASSIS');
    return g;
}

function buildMotorStation(toonMat: GameEngineRef['toonMat']): THREE.Group {
    const g = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1), toonMat(0x5a4030));
    table.position.y = 0.45;
    g.add(table);
    const motor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.7), toonMat(0x3a3028));
    motor.position.set(0, 1.15, 0);
    g.add(motor);
    const hoistBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 2),
        toonMat(0x2a2a2a)
    );
    hoistBar.position.set(0, 2.5, 0);
    g.add(hoistBar);
    const chain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 1, 6),
        toonMat(0x2a2a2a)
    );
    chain.position.set(0, 1.9, 0);
    g.add(chain);
    addStationSign(g, toonMat, 'MOTOR');
    return g;
}

function buildWheelsStation(toonMat: GameEngineRef['toonMat']): THREE.Group {
    const g = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1), toonMat(0x5a4030));
    table.position.y = 0.45;
    g.add(table);
    for (let i = 0; i < 4; i++) {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 0.12, 12),
            toonMat(0x1a1a1a)
        );
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(-0.5 + (i % 2) * 1, 1.05 + Math.floor(i / 2) * 0.3, 0);
        g.add(wheel);
    }
    addStationSign(g, toonMat, 'HJUL');
    return g;
}

function buildBodyStation(toonMat: GameEngineRef['toonMat']): THREE.Group {
    const g = new THREE.Group();
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 1), toonMat(0x5a4030));
    table.position.y = 0.45;
    g.add(table);
    const shell = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.8), toonMat(0x1a1a1a));
    shell.position.set(0, 1.15, 0);
    g.add(shell);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.65), toonMat(0x2a1a0e));
    cabin.position.set(0.15, 1.6, 0);
    g.add(cabin);
    addStationSign(g, toonMat, 'KAROSSERI');
    return g;
}

function addStationSign(
    group: THREE.Group,
    toonMat: GameEngineRef['toonMat'],
    label: string
): void {
    const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.8, 6),
        toonMat(0x2a2a2a)
    );
    pole.position.set(0, 1.4, -0.5);
    group.add(pole);
    const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.4, 0.06),
        toonMat(0xe8d8a0)
    );
    signBoard.position.set(0, 2.6, -0.5);
    group.add(signBoard);

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#e8d8a0';
        ctx.fillRect(0, 0, 256, 64);
        ctx.fillStyle = '#2a1a0e';
        ctx.font = 'bold 32px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, 128, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const textMat = new THREE.MeshBasicMaterial({ map: texture });
    const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.35), textMat);
    textMesh.position.set(0, 2.6, -0.47);
    textMesh.rotation.y = Math.PI;
    group.add(textMesh);
}

// ─── NPC-hjelpere ───────────────────────────────────────────────────────────

function findCharacterGroup(scene: THREE.Scene, id: string): THREE.Group | null {
    for (const child of scene.children) {
        if (!(child instanceof THREE.Group)) continue;
        if (child.userData.npcId === id) return child;
    }
    return null;
}
