import * as THREE from 'three';
import type { AABB2D, RoomDef } from '../types';
import { buildRoom, isInside, type BuiltRoom } from '../systems/RoomSystem';

type ToonMat = (c: number, o?: Record<string, unknown>) => THREE.MeshToonMaterial;

export interface BuiltCloister {
    rooms: Record<'chapel' | 'corridor' | 'library' | 'dormitory', BuiltRoom>;
    outerBounds: AABB2D;
    group: THREE.Group;
}

// Layout (XZ): Negativ Z = nord (innover øya), positiv Z = sør (mot havet).
//   Kapell: (0, -30)    - lengst nord, 10x10
//   Korridor: (0, -22)  - binder rommene, 3x6
//   Bibliotek: (-8, -22) - vest for korridor, 8x8
//   Sovesal: (8, -22)   - øst for korridor, 8x8
//
// Porten (fra stranden) ligger sør for korridoren - spiller kommer inn fra sør.
export function buildCloister(
    scene: THREE.Scene,
    toonMat: ToonMat,
    collisionBoxes: AABB2D[]
): BuiltCloister {
    const group = new THREE.Group();
    scene.add(group);

    const chapelDef: RoomDef = {
        id: 'chapel',
        center: [0, -30],
        size: [10, 10],
        wallHeight: 4.5,
        openings: [{ side: 'S', offset: 0, width: 2.4 }], // åpning sør mot korridor
        floorColor: 0x5a4838,
        wallColor: 0x9a8968,
        roofColor: 0x3e2e1e,
    };

    const corridorDef: RoomDef = {
        id: 'corridor',
        center: [0, -22],
        size: [3, 6],
        wallHeight: 3.5,
        openings: [
            { side: 'N', offset: 0, width: 2.4 }, // nord mot kapell
            { side: 'S', offset: 0, width: 2.4 }, // sør mot port
            { side: 'W', offset: 0, width: 2.4 }, // vest mot bibliotek
            { side: 'E', offset: 0, width: 2.4 }, // øst mot sovesal
        ],
        floorColor: 0x5a4838,
        wallColor: 0x9a8968,
        roofColor: 0x3e2e1e,
    };

    const libraryDef: RoomDef = {
        id: 'library',
        center: [-8, -22],
        size: [8, 8],
        wallHeight: 3.5,
        openings: [{ side: 'E', offset: 0, width: 2.4 }], // øst mot korridor
        floorColor: 0x6a5a42,
        wallColor: 0xa39577,
        roofColor: 0x3e2e1e,
    };

    const dormitoryDef: RoomDef = {
        id: 'dormitory',
        center: [8, -22],
        size: [8, 8],
        wallHeight: 3.5,
        openings: [{ side: 'W', offset: 0, width: 2.4 }], // vest mot korridor
        floorColor: 0x6a5a42,
        wallColor: 0xa39577,
        roofColor: 0x3e2e1e,
    };

    const chapel = buildRoom(scene, toonMat, chapelDef, collisionBoxes);
    const corridor = buildRoom(scene, toonMat, corridorDef, collisionBoxes);
    const library = buildRoom(scene, toonMat, libraryDef, collisionBoxes);
    const dormitory = buildRoom(scene, toonMat, dormitoryDef, collisionBoxes);

    // Kirketårn - synlig fra stranden (plasseres over kapellet)
    const towerBase = new THREE.Mesh(
        new THREE.BoxGeometry(3, 8, 3),
        toonMat(0x9a8968)
    );
    towerBase.position.set(0, 4, -30);
    towerBase.castShadow = true;
    group.add(towerBase);

    const towerRoof = new THREE.Mesh(
        new THREE.ConeGeometry(2.3, 3, 4),
        toonMat(0x3e2e1e)
    );
    towerRoof.position.set(0, 9.5, -30);
    towerRoof.rotation.y = Math.PI / 4;
    towerRoof.castShadow = true;
    group.add(towerRoof);

    // Enkel kors på tårnet
    const crossV = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.2, 0.1),
        toonMat(0x2a1a0c)
    );
    crossV.position.set(0, 11.6, -30);
    group.add(crossV);
    const crossH = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.1, 0.1),
        toonMat(0x2a1a0c)
    );
    crossH.position.set(0, 11.7, -30);
    group.add(crossH);

    // Porten (nord for korridor, der spiller kommer inn)
    const gatePostL = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 3.5, 0.4),
        toonMat(0x5c4228)
    );
    gatePostL.position.set(-1.4, 1.75, -18);
    group.add(gatePostL);
    const gatePostR = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 3.5, 0.4),
        toonMat(0x5c4228)
    );
    gatePostR.position.set(1.4, 1.75, -18);
    group.add(gatePostR);
    const gateArch = new THREE.Mesh(
        new THREE.BoxGeometry(3.2, 0.4, 0.4),
        toonMat(0x5c4228)
    );
    gateArch.position.set(0, 3.7, -18);
    group.add(gateArch);

    const outerBounds: AABB2D = {
        minX: -12.5,
        maxX: 12.5,
        minZ: -35.5,
        maxZ: -17.5,
    };

    return {
        rooms: { chapel, corridor, library, dormitory },
        outerBounds,
        group,
    };
}

export function isInsideCloister(p: { x: number; z: number }, cloister: BuiltCloister): boolean {
    return isInside(p, cloister.outerBounds);
}

export function playerInRoom(p: { x: number; z: number }, room: BuiltRoom): boolean {
    return isInside(p, room.innerBounds);
}
