import * as THREE from 'three';
import type { AABB2D, RoomDef, RoomOpening } from '../types';

export interface BuiltRoom {
    def: RoomDef;
    group: THREE.Group;
    roof: THREE.Mesh | null;
    floor: THREE.Mesh;
    walls: THREE.Mesh[];       // alle vegg-segmenter (med userData.solid=true)
    innerBounds: AABB2D;       // innsiden av rommet (brukes til å detektere om spiller er inne)
}

type ToonMat = (c: number, o?: Record<string, unknown>) => THREE.MeshStandardMaterial;

// Bygger et rom med segmenterte vegger slik at åpninger blir hull. Vegg-meshes og gulv
// markeres med userData.solid=true så PhysicsWorld kan autogenerere colliders.
export function buildRoom(
    scene: THREE.Scene,
    toonMat: ToonMat,
    def: RoomDef,
): BuiltRoom {
    const [cx, cz] = def.center;
    const [w, d] = def.size;
    const halfW = w / 2;
    const halfD = d / 2;
    const wallThick = 0.4;
    const wallH = def.wallHeight;
    const floorColor = def.floorColor ?? 0x6b5544;
    const wallColor = def.wallColor ?? 0x8a7a5c;
    const roofColor = def.roofColor ?? 0x4a3828;

    const group = new THREE.Group();
    group.position.set(cx, 0, cz);
    scene.add(group);

    // Gulv - tynn solid boks så fysikken har noe å stå på.
    const floor = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.1, d),
        toonMat(floorColor),
    );
    floor.receiveShadow = true;
    floor.position.y = -0.05;
    floor.userData.solid = true;
    group.add(floor);

    // Tak (valgfritt - dollhouse-logikk setter dette usynlig)
    let roof: THREE.Mesh | null = null;
    if (def.hasRoof !== false) {
        const roofGeo = new THREE.PlaneGeometry(w, d);
        roofGeo.rotateX(Math.PI / 2);
        roof = new THREE.Mesh(roofGeo, toonMat(roofColor));
        roof.position.y = wallH;
        group.add(roof);
    }

    const openings = def.openings ?? [];
    const walls: THREE.Mesh[] = [];

    // Bygg vegg per side med åpninger kuttet ut
    for (const side of ['N', 'S', 'E', 'W'] as const) {
        const sideOpenings = openings.filter((o) => o.side === side);
        const isNS = side === 'N' || side === 'S';
        const wallLen = isNS ? w : d;
        const halfLen = wallLen / 2;
        const perp = isNS ? halfD : halfW;
        const sign = side === 'N' || side === 'W' ? -1 : 1;

        // Sortert liste av åpninger etter offset langs veggen
        const sorted = [...sideOpenings].sort((a, b) => a.offset - b.offset);

        // Segmenter å bygge: fra -halfLen til neste åpnings start, deretter fra åpnings slutt osv.
        const segments: { start: number; end: number }[] = [];
        let cursor = -halfLen;
        for (const op of sorted) {
            const opStart = op.offset - op.width / 2;
            const opEnd = op.offset + op.width / 2;
            if (opStart > cursor) segments.push({ start: cursor, end: opStart });
            cursor = Math.max(cursor, opEnd);
        }
        if (cursor < halfLen) segments.push({ start: cursor, end: halfLen });

        for (const seg of segments) {
            const segLen = seg.end - seg.start;
            if (segLen <= 0.05) continue;
            const segCenter = (seg.start + seg.end) / 2;

            let geoW: number, geoD: number;
            let localX: number, localZ: number;
            if (isNS) {
                geoW = segLen;
                geoD = wallThick;
                localX = segCenter;
                localZ = sign * perp;
            } else {
                geoW = wallThick;
                geoD = segLen;
                localX = sign * perp;
                localZ = segCenter;
            }

            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(geoW, wallH, geoD),
                toonMat(wallColor)
            );
            mesh.position.set(localX, wallH / 2, localZ);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.solid = true;
            group.add(mesh);
            walls.push(mesh);
        }

        // Overligger over åpninger (kosmetisk, ingen kollisjon siden vi går under)
        for (const op of sorted) {
            const lintelLen = op.width;
            let geoW: number, geoD: number, localX: number, localZ: number;
            if (isNS) {
                geoW = lintelLen;
                geoD = wallThick;
                localX = op.offset;
                localZ = sign * perp;
            } else {
                geoW = wallThick;
                geoD = lintelLen;
                localX = sign * perp;
                localZ = op.offset;
            }
            const lintelH = 0.6;
            const lintel = new THREE.Mesh(
                new THREE.BoxGeometry(geoW, lintelH, geoD),
                toonMat(wallColor)
            );
            lintel.position.set(localX, wallH - lintelH / 2, localZ);
            group.add(lintel);
        }
    }

    const innerBounds: AABB2D = {
        minX: cx - halfW,
        maxX: cx + halfW,
        minZ: cz - halfD,
        maxZ: cz + halfD,
    };

    return { def, group, roof, floor, walls, innerBounds };
}

// Hjelpefunksjon: er et punkt innenfor AABB2D?
export function isInside(p: { x: number; z: number }, box: AABB2D): boolean {
    return p.x >= box.minX && p.x <= box.maxX && p.z >= box.minZ && p.z <= box.maxZ;
}

export type Opening = RoomOpening;
