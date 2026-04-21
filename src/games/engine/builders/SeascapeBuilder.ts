import * as THREE from 'three';
import { OceanSystem, FoamSystem } from '../systems/OceanSystem';

type ToonMat = (c: number, o?: Record<string, unknown>) => THREE.MeshToonMaterial;

export interface BuiltSeascape {
    ocean: OceanSystem;
    foam: FoamSystem;
    boat: THREE.Group;
    crewSeats: { chief: [number, number, number]; veteran: [number, number, number]; peer: [number, number, number] };
    playerSeat: [number, number, number]; // lokal offset i boat-gruppen
    boatStart: [number, number, number];
    boatEnd: [number, number, number];   // der båten ligger etter landing (ved stranden)
}

// Bygger hav, langskip med mannskap, himmel/sol-lys. Båten seiler fra åpent hav mot Lindisfarne.
// Båten parker til slutt ved stranden (bow pekende mot land).
export function buildSeascape(
    scene: THREE.Scene,
    toonMat: ToonMat
): BuiltSeascape {
    // Hav
    const ocean = new OceanSystem(scene, toonMat, {
        size: 300,
        segments: 64,
        color: 0x2b4a66,
        center: [0, 20], // flytt sjøen litt sørover så den dekker både startposisjon og strandkant
    });

    // Langskip (boat)
    const boat = new THREE.Group();
    scene.add(boat);

    // Skrog - lang avlang form, buet stevn og hekk
    const hullLength = 6;
    const hullWidth = 1.3;
    const hullHeight = 0.5;

    // Skrog-bunn (enkel box)
    const hull = new THREE.Mesh(
        new THREE.BoxGeometry(hullWidth, hullHeight, hullLength),
        toonMat(0x5c3a1e)
    );
    hull.position.y = 0.4;
    hull.castShadow = true;
    hull.receiveShadow = true;
    boat.add(hull);

    // Skrog-sider (planker)
    for (let side = -1; side <= 1; side += 2) {
        const plank = new THREE.Mesh(
            new THREE.BoxGeometry(0.08, 0.5, hullLength - 0.2),
            toonMat(0x6e4828)
        );
        plank.position.set(side * (hullWidth / 2), 0.65, 0);
        boat.add(plank);
    }

    // Stevn (baug) - pekende fremover (positiv Z)
    const prow = new THREE.Mesh(
        new THREE.ConeGeometry(0.5, 1.2, 4),
        toonMat(0x5c3a1e)
    );
    prow.position.set(0, 0.5, hullLength / 2 + 0.4);
    prow.rotation.x = Math.PI / 2;
    prow.rotation.y = Math.PI / 4;
    boat.add(prow);

    // Dragehode på baugen
    const dragonHead = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.7, 6),
        toonMat(0x4a2a14)
    );
    dragonHead.position.set(0, 1.2, hullLength / 2 + 0.7);
    dragonHead.rotation.x = -Math.PI / 3;
    boat.add(dragonHead);

    // Hekk
    const stern = new THREE.Mesh(
        new THREE.ConeGeometry(0.4, 0.9, 4),
        toonMat(0x5c3a1e)
    );
    stern.position.set(0, 0.5, -hullLength / 2 - 0.3);
    stern.rotation.x = -Math.PI / 2;
    stern.rotation.y = Math.PI / 4;
    boat.add(stern);

    // Mast - i midten av båten. Spilleren sitter BAK masten (stern-side) så kamera
    // ikke får masten mellom seg og spilleren.
    const mastZ = 0;
    const mast = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 5, 8),
        toonMat(0x4a3828)
    );
    mast.position.set(0, 3, mastZ);
    mast.castShadow = true;
    boat.add(mast);

    // Seil - enkel rektangulær form med diagonal stripe
    const sail = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 2.8),
        toonMat(0xe8dcc0, { side: THREE.DoubleSide })
    );
    sail.position.set(0, 3.5, mastZ);
    boat.add(sail);

    // Stripe på seilet (rødt)
    const stripe = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 0.5),
        toonMat(0xa83a28, { side: THREE.DoubleSide })
    );
    stripe.position.set(0, 3.5, mastZ + 0.01);
    boat.add(stripe);

    // Tverrstang på masten
    const yard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 3.6, 6),
        toonMat(0x4a3828)
    );
    yard.position.set(0, 4.9, mastZ);
    yard.rotation.z = Math.PI / 2;
    boat.add(yard);

    // Skjold langs sidene (fargede sirkler)
    const shieldColors = [0xa83a28, 0x2e5a8a, 0x8a5a2a, 0x3a7a48, 0xa83a28, 0x2e5a8a];
    for (let i = 0; i < 6; i++) {
        for (let side = -1; side <= 1; side += 2) {
            const shield = new THREE.Mesh(
                new THREE.CircleGeometry(0.28, 12),
                toonMat(shieldColors[i])
            );
            shield.position.set(side * (hullWidth / 2 + 0.06), 0.75, -2.3 + i * 0.9);
            shield.rotation.y = side * Math.PI / 2;
            boat.add(shield);
        }
    }

    // Årer (enkelt - 3 per side, ikke animert)
    for (let i = 0; i < 3; i++) {
        for (let side = -1; side <= 1; side += 2) {
            const oar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.04, 0.04, 2.5, 6),
                toonMat(0x6a4a2a)
            );
            oar.position.set(side * (hullWidth / 2 + 1.1), 0.45, -1.4 + i * 1.4);
            oar.rotation.z = side * Math.PI / 3;
            oar.rotation.x = Math.PI / 10;
            boat.add(oar);
        }
    }

    // Spillerens sete er BAK masten (stern-side) slik at kamera ikke får masten i synsfeltet.
    // Mast er på lokal z=0. Dragonhead/bow er på lokal +Z, stern på lokal -Z.
    // Alle crew-posisjoner er innenfor 2m av spiller så E-interaksjon rekker.
    const crewSeats = {
        chief: [0, 0.8, -2.5] as [number, number, number],    // bakerst ved hekken
        veteran: [-0.5, 0.8, 0] as [number, number, number],  // ved masten til venstre
        peer: [0.5, 0.8, 0.8] as [number, number, number],    // fremme til høyre
    };
    const playerSeat: [number, number, number] = [0, 0.8, -1]; // bak masten

    // Skum-partikler rundt båten (følger båten siden vi passerer en getOrigin-callback)
    const foam = new FoamSystem(
        scene,
        () => ({ x: boat.position.x, y: boat.position.y, z: boat.position.z }),
        60
    );

    // Himmel-bakgrunn (enkel stor sphere med gradient-ish farge)
    scene.background = new THREE.Color(0x7a9ab8);
    scene.fog = new THREE.FogExp2(new THREE.Color(0x9bb3c8), 0.012);

    // Solen (directional light)
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.2);
    sun.position.set(50, 80, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = 200;
    sun.shadow.camera.left = -50;
    sun.shadow.camera.right = 50;
    sun.shadow.camera.top = 50;
    sun.shadow.camera.bottom = -50;
    scene.add(sun);

    // Himmellys (mykner skyggene)
    const hemi = new THREE.HemisphereLight(0xbfd8ee, 0x6a5838, 0.6);
    scene.add(hemi);

    // Plasseringer:
    // Øya (Lindisfarne) ligger mot nord (negativ Z) - strand ved z=+3, kloster ved z=-30.
    // Vikingene kommer fra åpent hav i sør (stor positiv Z) og seiler nordover (mot lavere Z).
    // Båten roteres 180° så dragehodet (lokal +Z) peker mot nord (verdens -Z).
    const boatStart: [number, number, number] = [0, 0, 50];
    const boatEnd: [number, number, number] = [6, 0, 5];

    boat.position.set(...boatStart);
    boat.rotation.y = Math.PI;

    return { ocean, foam, boat, crewSeats, playerSeat, boatStart, boatEnd };
}
