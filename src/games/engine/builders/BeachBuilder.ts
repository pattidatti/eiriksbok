import * as THREE from 'three';

type ToonMat = (c: number, o?: Record<string, unknown>) => THREE.MeshStandardMaterial;

export interface BuiltBeach {
    group: THREE.Group;
    landingPoint: [number, number]; // XZ der spilleren teleporteres etter seilas
    pathStart: [number, number];
}

// Strand + øy + sti opp til klosterporten. Klosteret ligger i negativ Z (ligger i nord på kartet).
// Strand-senter er i origo, klosterinngang ved Z = -17.5.
export function buildBeach(
    scene: THREE.Scene,
    toonMat: ToonMat,
): BuiltBeach {
    const group = new THREE.Group();
    scene.add(group);

    // Usynlig solid grunn - gir PhysicsWorld noe å stå på over hele øya.
    // Plasseres rett under synlige gulv-lag.
    const ground = new THREE.Mesh(
        new THREE.BoxGeometry(120, 0.4, 120),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    ground.position.set(0, -0.2, -15);
    ground.userData.solid = true;
    group.add(ground);

    // Hoved-øy: stor flat landmasse
    const islandGeo = new THREE.CircleGeometry(40, 32);
    islandGeo.rotateX(-Math.PI / 2);
    const island = new THREE.Mesh(islandGeo, toonMat(0x8a7a5c));
    island.position.set(0, 0.05, -15);
    island.receiveShadow = true;
    group.add(island);

    // Strand-stripe (lysere sand) ved vannkanten
    const beachGeo = new THREE.PlaneGeometry(30, 8);
    beachGeo.rotateX(-Math.PI / 2);
    const beach = new THREE.Mesh(beachGeo, toonMat(0xd4c090));
    beach.position.set(0, 0.06, 3);
    beach.receiveShadow = true;
    group.add(beach);

    // Sti fra strand opp til klosterport (lys gruset bane)
    const pathGeo = new THREE.PlaneGeometry(2.5, 22);
    pathGeo.rotateX(-Math.PI / 2);
    const path = new THREE.Mesh(pathGeo, toonMat(0xb8a275));
    path.position.set(0, 0.07, -7);
    path.receiveShadow = true;
    group.add(path);

    // Klipper på begge sider av stien (blokkerer spilleren fra å avvike)
    const rockColor = 0x5a5248;
    function placeRock(x: number, z: number, scale: number): void {
        const rock = new THREE.Mesh(
            new THREE.DodecahedronGeometry(scale, 0),
            toonMat(rockColor)
        );
        rock.position.set(x, scale * 0.5, z);
        rock.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.5);
        rock.castShadow = true;
        rock.receiveShadow = true;
        rock.userData.solid = true;
        group.add(rock);
    }

    // Klipper langs venstre side av stien
    placeRock(-3.5, 0, 1.2);
    placeRock(-4.2, -4, 1.5);
    placeRock(-3.8, -8, 1.1);
    placeRock(-4.5, -12, 1.4);
    placeRock(-4.0, -16, 1.0);
    // Klipper langs høyre side
    placeRock(3.5, 0, 1.2);
    placeRock(4.2, -4, 1.5);
    placeRock(3.8, -8, 1.1);
    placeRock(4.5, -12, 1.4);
    placeRock(4.0, -16, 1.0);

    // Større klipper rundt øya (bakgrunn)
    placeRock(-14, -18, 2.5);
    placeRock(14, -18, 2.5);
    placeRock(-16, -8, 2.2);
    placeRock(16, -8, 2.2);

    // Usynlig vegg mot havet - hindrer at spiller vasser ut (langs Z = 6)
    const oceanWall = new THREE.Mesh(
        new THREE.BoxGeometry(30, 3, 1),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    oceanWall.position.set(0, 1.5, 6.5);
    oceanWall.userData.solid = true;
    group.add(oceanWall);

    // Noen få busker/gress-tuer for liv (ikke solide - bare dekor)
    const grassColor = 0x4a6832;
    for (let i = 0; i < 12; i++) {
        const x = (Math.random() - 0.5) * 24;
        const z = -4 + (Math.random() - 0.5) * 12;
        // Hold unna stien
        if (Math.abs(x) < 2.5) continue;
        const bush = new THREE.Mesh(
            new THREE.SphereGeometry(0.4 + Math.random() * 0.3, 8, 6),
            toonMat(grassColor)
        );
        bush.position.set(x, 0.3, z);
        bush.scale.y = 0.6;
        group.add(bush);
    }

    return {
        group,
        landingPoint: [0, 4],
        pathStart: [0, 2],
    };
}
