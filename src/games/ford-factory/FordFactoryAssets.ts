import * as THREE from 'three';
import type { GameEngineRef, AABB2D, DialogNode } from '../engine/types';
import { buildRoom } from '../engine/systems/RoomSystem';
import { DustSystem } from '../engine/ParticleSystem';

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
    const { scene, toonMat, config, animateReveal, schedule, registerAnimatedLight } = engine;
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
    );

    // ───── Belysning (industriell fabrikk, 1913) ─────
    // Dempet dagslys — fabrikken er mørk og stemningsfull
    scene.add(new THREE.HemisphereLight(0xfff0d0, 0x55443a, 1.3));

    const skylight = new THREE.DirectionalLight(0xffeedd, 1.2);
    skylight.position.set(4, 18, -6);
    skylight.castShadow = true;
    skylight.shadow.mapSize.set(1024, 1024);
    const sc = skylight.shadow.camera;
    sc.left = sc.bottom = -20; sc.right = sc.top = 20; sc.near = 1; sc.far = 50;
    scene.add(skylight);

    const fillLight = new THREE.DirectionalLight(0xdde8ff, 0.8);
    fillLight.position.set(-8, 6, 10);
    scene.add(fillLight);

    // Tidlige elektriske lamper over samlebåndet (5 stk langs båndet)
    // Kjegle-shader: V=1 ved spiss (nær kilden), V=0 ved bred ende → stråle fader ut
    const lampConeVert = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    const lampConeFrag = `
        varying vec2 vUv;
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
            float fade = vUv.y * vUv.y;
            gl_FragColor = vec4(uColor, uOpacity * fade);
        }
    `;
    const mkConeMat = (color: number, opacity: number) =>
        new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: new THREE.Color(color) },
                uOpacity: { value: opacity },
            },
            vertexShader: lampConeVert,
            fragmentShader: lampConeFrag,
            transparent: true,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

    const lampDustUpdates: Array<(dt: number, elapsed: number) => void> = [];

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

        // Emissiv pære (oppgradert fra MeshBasicMaterial)
        const bulbY = 5.48;
        const lampColor = 0xffdd88;

        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 8, 8),
            new THREE.MeshStandardMaterial({
                color: lampColor,
                emissive: lampColor,
                emissiveIntensity: 6.0,
                roughness: 0.1,
                metalness: 0.05,
            })
        );
        bulb.position.set(bx, bulbY, 0);
        scene.add(bulb);

        // Glød-halo rundt pæren
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(0.28, 10, 8),
            new THREE.MeshBasicMaterial({
                color: lampColor,
                transparent: true,
                opacity: 0.2,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
            })
        );
        glow.position.set(bx, bulbY, 0);
        scene.add(glow);

        // SpotLight pekende rett ned — erstatter PointLight
        const angle = 0.44;
        const spot = new THREE.SpotLight(lampColor, 5.0, 16, angle, 0.3, 1.5);
        spot.position.set(bx, bulbY, 0);
        spot.target.position.set(bx, -5, 0);
        scene.add(spot);
        scene.add(spot.target);
        registerAnimatedLight(spot, 'flicker-soft', 5.0);

        // Gradient lyskjegle: indre + ytre sylinder med shader
        // CylinderGeometry UV: V=1 topp (spiss/nær kilden), V=0 bunn (bred/fjern)
        const coneH = 4.8; // rekker nesten ned til gulvet (y ≈ 0.68)
        const coneR = Math.tan(angle) * coneH;

        const innerCone = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, coneR, coneH, 24, 1, true),
            mkConeMat(lampColor, 0.18)
        );
        innerCone.position.set(bx, bulbY - coneH / 2, 0);
        scene.add(innerCone);

        const outerCone = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, coneR * 1.9, coneH * 0.8, 24, 1, true),
            mkConeMat(lampColor, 0.054)
        );
        outerCone.position.set(bx, bulbY - (coneH * 0.8) / 2, 0);
        scene.add(outerCone);

        // Støvpartikler i lysstrålen (20 per lampe)
        const N = 20;
        const posArr = new Float32Array(N * 3);
        const phases = new Float32Array(N);
        const relRadii = new Float32Array(N);
        const thetas = new Float32Array(N);
        const speeds = new Float32Array(N);

        for (let i = 0; i < N; i++) {
            phases[i] = Math.random();
            relRadii[i] = Math.sqrt(Math.random()) * 0.8;
            thetas[i] = Math.random() * Math.PI * 2;
            speeds[i] = 0.04 + Math.random() * 0.04;
            const t = phases[i];
            const r = relRadii[i] * Math.tan(angle) * coneH * t;
            posArr[i * 3] = bx + Math.cos(thetas[i]) * r;
            posArr[i * 3 + 1] = bulbY - coneH * t;
            posArr[i * 3 + 2] = Math.sin(thetas[i]) * r;
        }

        const dustGeo = new THREE.BufferGeometry();
        const posAttr = new THREE.BufferAttribute(posArr, 3);
        dustGeo.setAttribute('position', posAttr);
        const dust = new THREE.Points(
            dustGeo,
            new THREE.PointsMaterial({
                color: lampColor,
                size: 0.022,
                transparent: true,
                opacity: 0.55,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                sizeAttenuation: true,
            })
        );
        scene.add(dust);

        // for...of med const gir ny binding per iterasjon — lukningene er korrekte
        lampDustUpdates.push((dt: number, elapsed: number): void => {
            for (let i = 0; i < N; i++) {
                phases[i] -= speeds[i] * dt;
                if (phases[i] < 0) phases[i] += 1;
                const t = phases[i];
                const r = relRadii[i] * Math.tan(angle) * coneH * t;
                const theta = thetas[i] + elapsed * 0.06;
                posAttr.setXYZ(
                    i,
                    bx + Math.cos(theta) * r,
                    bulbY - coneH * t,
                    Math.sin(theta) * r
                );
            }
            posAttr.needsUpdate = true;
        });
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

    // Ekstra lamper i sørområdet (ved inngang/kontor) — samme mønster som båndet
    for (const lx of [-10, 0, 10]) {
        const cord2 = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 6), toonMat(0x1a1a1a));
        cord2.position.set(lx, 6.3, 8);
        scene.add(cord2);
        const shade2 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.42, 0.32, 14, 1, false),
            toonMat(0x252218)
        );
        shade2.position.set(lx, 5.64, 8);
        scene.add(shade2);
        const lampColor2 = 0xffdd88;
        const bulb2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.07, 8, 8),
            new THREE.MeshStandardMaterial({ color: lampColor2, emissive: lampColor2, emissiveIntensity: 5.0, roughness: 0.1 })
        );
        bulb2.position.set(lx, 5.48, 8);
        scene.add(bulb2);
        const glow2 = new THREE.Mesh(
            new THREE.SphereGeometry(0.26, 10, 8),
            new THREE.MeshBasicMaterial({ color: lampColor2, transparent: true, opacity: 0.18, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        glow2.position.set(lx, 5.48, 8);
        scene.add(glow2);
        const spot2 = new THREE.SpotLight(lampColor2, 4.0, 14, 0.44, 0.3, 1.5);
        spot2.position.set(lx, 5.48, 8);
        spot2.target.position.set(lx, -5, 8);
        scene.add(spot2);
        scene.add(spot2.target);
        registerAnimatedLight(spot2, 'flicker-soft', 4.0);
    }

    // ───── Rør langs veggene ─────
    const pipeMat = toonMat(0x2a2828);
    const valveMat = toonMat(0x3a3535);

    // Østveggen (x≈15.8): to horisontale løp N-S
    for (const py of [2.2, 4.2]) {
        const ep = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 24, 8), pipeMat);
        ep.rotation.x = Math.PI / 2;
        ep.position.set(15.8, py, 0);
        scene.add(ep);
    }
    for (const vz of [-9, -3, 3, 9]) {
        const vp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.2, 8), pipeMat);
        vp.position.set(15.8, 3.1, vz);
        scene.add(vp);
    }
    for (const vz of [-6, 0, 6]) {
        const vw = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.028, 6, 12), valveMat);
        vw.rotation.z = Math.PI / 2;
        vw.position.set(15.7, 2.2, vz);
        scene.add(vw);
    }

    // Vestvegg (x≈-15.8): ett horisontalt løp
    const wp = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 24, 8), pipeMat);
    wp.rotation.x = Math.PI / 2;
    wp.position.set(-15.8, 2.5, 0);
    scene.add(wp);
    const stubW = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 2.5, 8), pipeMat);
    stubW.rotation.z = Math.PI / 2;
    stubW.position.set(-14.55, 2.5, 8);
    scene.add(stubW);

    // ───── Lagring: oljefat (østside) ─────
    const drumMat = toonMat(0x252020);
    const drumRingMat = toonMat(0x3a3535);
    for (const [dx, dz] of [[13.5, 5], [14.5, 5.8], [13.8, 7.2], [14.6, 3.2]] as [number, number][]) {
        const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.44, 1.1, 12), drumMat);
        drum.position.set(dx, 0.55, dz);
        drum.castShadow = true;
        scene.add(drum);
        for (const ry of [0.2, 0.85]) {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.04, 6, 14), drumRingMat);
            ring.rotation.x = Math.PI / 2;
            ring.position.set(dx, ry, dz);
            scene.add(ring);
        }
        collisionBoxes.push({ minX: dx - 0.55, maxX: dx + 0.55, minZ: dz - 0.55, maxZ: dz + 0.55 });
    }

    // ───── Lagring: kasser (vestside) ─────
    const boxMat = toonMat(0x4a3820);
    const boxEdgeMat = toonMat(0x2a1e10);
    for (const [cx, cz] of [[-14, 5.5], [-13.2, 7], [-14.5, 7.8]] as [number, number][]) {
        const box = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), boxMat);
        box.position.set(cx, 0.45, cz);
        box.castShadow = true;
        scene.add(box);
        for (const [ex, ey, ez, ew, eh, ed] of [
            [0, 0.475, 0, 0.9, 0.06, 0.06],
            [0, 0.475, 0, 0.06, 0.06, 0.9],
        ] as [number, number, number, number, number, number][]) {
            const edge = new THREE.Mesh(new THREE.BoxGeometry(ew, eh, ed), boxEdgeMat);
            edge.position.set(cx + ex, 0.45 + ey - 0.45, cz + ez);
            scene.add(edge);
        }
        collisionBoxes.push({ minX: cx - 0.55, maxX: cx + 0.55, minZ: cz - 0.55, maxZ: cz + 0.55 });
    }

    // ───── Fabrikktåke: DustSystem (AdditiveBlending, size 0.06 — naturlig fabrikkatmosfære) ─────
    const factoryDust = new DustSystem(scene, 350, 34, 7);

    // ───── Tak (stålplate) ─────
    const roofGeo = new THREE.PlaneGeometry(34, 26);
    roofGeo.rotateX(Math.PI / 2);
    const roofMesh = new THREE.Mesh(roofGeo, toonMat(0x252020));
    roofMesh.position.y = 7;
    scene.add(roofMesh);

    // ───── Dobbeltdør sørinngang ─────
    const doorH = 7 - 0.6; // 6.4 — fra gulv til tak minus ramme
    const doorPanelMat = toonMat(0x3a2e22);
    for (const dx of [-0.875, 0.875]) {
        const panel = new THREE.Mesh(new THREE.BoxGeometry(1.75, doorH, 0.12), doorPanelMat);
        panel.position.set(dx, doorH / 2, 13);
        scene.add(panel);
        const railMat = toonMat(0x2a1e14);
        for (const ry of [1.4, 3.2, 4.8]) {
            const rail = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.09, 0.14), railMat);
            rail.position.set(dx, ry, 13);
            scene.add(rail);
        }
    }
    collisionBoxes.push({ minX: -1.85, maxX: 1.85, minZ: 12.7, maxZ: 13.4 });

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
    const sorensenIdea = config.dialogs.sorensen_idea;
    if (sorensenIdea && !Array.isArray(sorensenIdea)) {
        sorensenIdea.choices[0].action = () => {
            engine.setPhase('placing');
            updateSorensenGreeting();
        };
    }

    // Koble five_dollar-valget: sett flag, spill Ford-monolog, gå til ending etter 18s
    const sorensenFive = config.dialogs.sorensen_five_dollar;
    if (sorensenFive && !Array.isArray(sorensenFive)) {
        sorensenFive.choices[0].action = () => {
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
        burstSparks(scene, st.x, st.z);
        flashLight(scene, st.x, st.z);

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
            updateProduction(scene, dt, cars, placedStations, production, stations);
        }

        // Animer støvpartikler i taklampene
        for (const fn of lampDustUpdates) fn(dt, time);

        // Animer fabrikktåkepartikler
        factoryDust.update(dt);
    };

    // ───── Start intro-monolog kort etter spillstart ─────
    schedule(() => engine.playMonolog('intro_ford'), 1500);
}

// ─── Produksjonsloop ────────────────────────────────────────────────────────

function updateProduction(
    scene: THREE.Scene,
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
                burstSparks(scene, st.x, 0);
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

// ─── Effektfunksjoner ───────────────────────────────────────────────────────

function burstSparks(scene: THREE.Scene, x: number, z: number): void {
    const N = 35;
    const posArr = new Float32Array(N * 3);
    const velArr = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI * 0.5 + 0.1;
        const speed = 1.5 + Math.random() * 2.5;
        posArr[i * 3] = x;
        posArr[i * 3 + 1] = 1.0;
        posArr[i * 3 + 2] = z;
        velArr[i * 3] = Math.cos(theta) * Math.sin(phi) * speed;
        velArr[i * 3 + 1] = Math.cos(phi) * speed;
        velArr[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * speed;
    }
    const geo = new THREE.BufferGeometry();
    const posAttr = new THREE.BufferAttribute(posArr, 3);
    geo.setAttribute('position', posAttr);
    const mat = new THREE.PointsMaterial({
        color: 0xffaa22,
        size: 0.06,
        transparent: true,
        opacity: 1.0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    const start = performance.now();
    const dur = 900;
    const step = () => {
        if (!points.parent) return;
        const elapsed = (performance.now() - start) / 1000;
        const t = elapsed / (dur / 1000);
        if (t >= 1) {
            scene.remove(points);
            geo.dispose();
            mat.dispose();
            return;
        }
        for (let i = 0; i < N; i++) {
            posArr[i * 3] = x + velArr[i * 3] * elapsed;
            posArr[i * 3 + 1] = 1.0 + velArr[i * 3 + 1] * elapsed - 4.9 * elapsed * elapsed;
            posArr[i * 3 + 2] = z + velArr[i * 3 + 2] * elapsed;
        }
        posAttr.needsUpdate = true;
        mat.opacity = 1.0 - t * t;
        requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function flashLight(scene: THREE.Scene, x: number, z: number): void {
    const light = new THREE.PointLight(0xffaa44, 8.0, 5);
    light.position.set(x, 1.5, z);
    scene.add(light);
    const start = performance.now();
    const step = () => {
        if (!light.parent) return;
        const t = (performance.now() - start) / 500;
        if (t >= 1) {
            scene.remove(light);
            return;
        }
        light.intensity = 8.0 * (1 - t * t);
        requestAnimationFrame(step);
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
