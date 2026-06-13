import * as THREE from 'three';
import type { GameEngineRef } from '../../types';
import type { BuildRoomConfig, BuildOutdoorConfig, RoomWall, RoomDoorSpec } from '../types';
import { createMaterial, applyLightingPreset } from '../presets';
import { markPhysics } from './_util';

type WallAxis = { along: 'x' | 'z'; sign: number };

/**
 * LOW-baseline (Fase 9): bak en enkel ambient-okklusjon inn i vertex-fargene så rom
 * får dybde uten shadow maps. Billig (bakt én gang, null runtime-kost) og virker på
 * alle tier — komplementært til ekte skygger. Materialet må ha `vertexColors = true`.
 */

/** Mørkne en vegg-mesh nær gulvet (basert på VERDENS-y, så høye headers ikke mørknes). */
function bakeWallAO(mesh: THREE.Mesh, fadeHeight = 1.3, strength = 0.4): void {
    const pos = mesh.geometry.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
        const worldY = mesh.position.y + pos.getY(i);
        const t = Math.min(1, Math.max(0, worldY) / fadeHeight); // 0 ved gulv, 1 over fadeHeight
        const shade = 1 - strength * (1 - t);
        colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = shade;
    }
    mesh.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

/** Mørkne et gulv-plan mot kantene (der det møter veggene). */
function bakeFloorAO(geom: THREE.BufferGeometry, halfW: number, halfD: number, strength = 0.28): void {
    const pos = geom.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
        // PlaneGeometry ligger i XY før rotasjon: x→verdens-x, y→verdens-z.
        const ex = Math.abs(pos.getX(i)) / halfW;
        const ey = Math.abs(pos.getY(i)) / halfD;
        const edge = Math.pow(Math.max(ex, ey), 3); // kun nær kanten
        const shade = 1 - strength * edge;
        colors[i * 3] = colors[i * 3 + 1] = colors[i * 3 + 2] = shade;
    }
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
}

const WALL_AXES: Record<RoomWall, WallAxis> = {
    north: { along: 'x', sign: -1 }, // Z = -halfDepth
    south: { along: 'x', sign: +1 }, // Z = +halfDepth
    west:  { along: 'z', sign: -1 }, // X = -halfWidth
    east:  { along: 'z', sign: +1 }, // X = +halfWidth
};

/**
 * Bygg et vegg-segment med valgfrie åpninger (dører/vinduer). Returnerer alle segmenter
 * som trengs for å "hulle ut" åpningene.
 */
function buildWallWithOpenings(
    wall: RoomWall,
    length: number,
    height: number,
    thickness: number,
    openings: { offset: number; width: number; height: number; isWindow: boolean }[],
    material: THREE.Material,
    group: THREE.Group
): THREE.Mesh[] {
    // Sorter åpninger etter offset
    const sorted = [...openings].sort((a, b) => a.offset - b.offset);

    // Bygg vegg-segmenter mellom åpninger
    const segments: { start: number; end: number }[] = [];
    let cursor = -length / 2;
    for (const o of sorted) {
        const oStart = o.offset - o.width / 2;
        const oEnd = o.offset + o.width / 2;
        if (oStart > cursor) segments.push({ start: cursor, end: oStart });
        cursor = Math.max(cursor, oEnd);
    }
    if (cursor < length / 2) segments.push({ start: cursor, end: length / 2 });

    const meshes: THREE.Mesh[] = [];
    const axis = WALL_AXES[wall];

    for (const seg of segments) {
        const segLen = seg.end - seg.start;
        if (segLen < 0.02) continue;
        const segCenter = (seg.start + seg.end) / 2;

        const mesh = new THREE.Mesh(
            axis.along === 'x'
                ? new THREE.BoxGeometry(segLen, height, thickness)
                : new THREE.BoxGeometry(thickness, height, segLen),
            material,
        );
        if (axis.along === 'x') {
            mesh.position.set(segCenter, height / 2, 0);
        } else {
            mesh.position.set(0, height / 2, segCenter);
        }
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        bakeWallAO(mesh);
        markPhysics(mesh, { solid: true, colliderShape: 'cuboid' });
        group.add(mesh);
        meshes.push(mesh);
    }

    // Bygg "over-åpning"-segmenter (dør-header / vindu-brystning)
    for (const o of sorted) {
        if (o.isWindow) {
            // Vindu: brystning under + header over
            const sillHeight = 1.0;
            const headerHeight = height - (sillHeight + o.height);
            if (sillHeight > 0.02) {
                const sill = new THREE.Mesh(
                    axis.along === 'x'
                        ? new THREE.BoxGeometry(o.width, sillHeight, thickness)
                        : new THREE.BoxGeometry(thickness, sillHeight, o.width),
                    material,
                );
                if (axis.along === 'x') sill.position.set(o.offset, sillHeight / 2, 0);
                else sill.position.set(0, sillHeight / 2, o.offset);
                sill.castShadow = true;
                sill.receiveShadow = true;
                bakeWallAO(sill);
                markPhysics(sill, { solid: true });
                group.add(sill);
                meshes.push(sill);
            }
            if (headerHeight > 0.02) {
                const header = new THREE.Mesh(
                    axis.along === 'x'
                        ? new THREE.BoxGeometry(o.width, headerHeight, thickness)
                        : new THREE.BoxGeometry(thickness, headerHeight, o.width),
                    material,
                );
                const hy = sillHeight + o.height + headerHeight / 2;
                if (axis.along === 'x') header.position.set(o.offset, hy, 0);
                else header.position.set(0, hy, o.offset);
                header.castShadow = true;
                bakeWallAO(header);
                markPhysics(header, { solid: true });
                group.add(header);
                meshes.push(header);
            }
        } else {
            // Dør: kun header
            const headerHeight = height - o.height;
            if (headerHeight > 0.02) {
                const header = new THREE.Mesh(
                    axis.along === 'x'
                        ? new THREE.BoxGeometry(o.width, headerHeight, thickness)
                        : new THREE.BoxGeometry(thickness, headerHeight, o.width),
                    material,
                );
                const hy = o.height + headerHeight / 2;
                if (axis.along === 'x') header.position.set(o.offset, hy, 0);
                else header.position.set(0, hy, o.offset);
                header.castShadow = true;
                bakeWallAO(header);
                markPhysics(header, { solid: true });
                group.add(header);
                meshes.push(header);
            }
        }
    }

    return meshes;
}

/**
 * Posisjoner en vegg-gruppe langs riktig side av rommet basert på RoomWall.
 */
function positionWallGroup(
    wallGroup: THREE.Group,
    wall: RoomWall,
    width: number,
    depth: number
): void {
    const axis = WALL_AXES[wall];
    if (axis.along === 'x') {
        wallGroup.position.set(0, 0, axis.sign * depth / 2);
    } else {
        wallGroup.position.set(axis.sign * width / 2, 0, 0);
    }
}

/**
 * Bygg et helt rom: gulv, fire vegger, tak, lys. Valgfrie dører og vinduer.
 * Setter userData.solid på alle kollisjons-meshes automatisk.
 */
export function buildRoom(
    engine: GameEngineRef,
    config: BuildRoomConfig
): { group: THREE.Group; lockedDoors: Map<string, THREE.Mesh[]> } {
    const [width, height, depth] = config.size;
    const center = config.center ?? [0, 0];
    const thickness = 0.3;

    const roomGroup = new THREE.Group();
    roomGroup.position.set(center[0], 0, center[1]);
    roomGroup.userData.declarativeId = config.id;

    const floorMat = createMaterial(config.floor ?? 'wood');
    const wallMat = createMaterial(config.walls ?? 'plaster');

    // LOW-baseline: klon presetene og slå på vertex-farger så vi kan bake AO inn
    // uten å forurense det delte material-cachen (createMaterial returnerer delt).
    const floorAOMat = floorMat.clone();
    floorAOMat.vertexColors = true;
    const wallAOMat = wallMat.clone();
    wallAOMat.vertexColors = true;

    // ─── Gulv ────────────────────────────────────────────────────────────────
    const floorMesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.4, depth),
        floorMat,
    );
    floorMesh.position.y = -0.2;
    floorMesh.receiveShadow = true;
    markPhysics(floorMesh, { solid: true, colliderShape: 'cuboid' });
    roomGroup.add(floorMesh);

    // Synlig gulv-plane (subdividert) for å få riktig material + kant-AO på toppen
    const floorGeom = new THREE.PlaneGeometry(width, depth, 8, 8);
    bakeFloorAO(floorGeom, width / 2, depth / 2);
    const floorVisible = new THREE.Mesh(floorGeom, floorAOMat);
    floorVisible.rotation.x = -Math.PI / 2;
    floorVisible.position.y = 0.01;
    floorVisible.receiveShadow = true;
    roomGroup.add(floorVisible);

    // ─── Tak ────────────────────────────────────────────────────────────────
    if (config.ceiling !== 'none') {
        const ceilingMat = createMaterial(config.ceiling ?? 'wood');
        const ceiling = new THREE.Mesh(
            new THREE.BoxGeometry(width, thickness, depth),
            ceilingMat,
        );
        ceiling.position.y = height + thickness / 2;
        ceiling.receiveShadow = true;
        // Taket må være solid så clampCameraAgainstWalls-raycasten stopper
        // tredjepersons-kameraet før det svinger gjennom taket ved ned-vinkling.
        markPhysics(ceiling, { solid: true, colliderShape: 'cuboid' });
        roomGroup.add(ceiling);
    }

    // ─── Vegger med åpninger ─────────────────────────────────────────────────
    const doors = config.doors ?? [];
    const windows = config.windows ?? [];
    const lockedDoors = new Map<string, THREE.Mesh[]>();

    for (const wall of ['north', 'south', 'east', 'west'] as RoomWall[]) {
        const wallGroup = new THREE.Group();
        positionWallGroup(wallGroup, wall, width, depth);

        const axis = WALL_AXES[wall];
        const wallLen = axis.along === 'x' ? width : depth;

        const wallDoors = doors.filter((d) => d.wall === wall);
        const wallWindows = windows.filter((w) => w.wall === wall);

        const openings = [
            ...wallDoors.map((d) => ({
                offset: d.offset ?? 0,
                width: d.width ?? 1.4,
                height: d.height ?? (height - 0.6),
                isWindow: false,
                _src: d as RoomDoorSpec,
            })),
            ...wallWindows.map((w) => ({
                offset: w.offset ?? 0,
                width: w.width ?? 1.4,
                height: w.height ?? 1.4,
                isWindow: true,
            })),
        ];

        buildWallWithOpenings(wall, wallLen, height, thickness, openings, wallAOMat, wallGroup);

        // For dører med openFlag: lag en "slab" som blokkerer åpningen når flagget er falsy
        for (const door of wallDoors) {
            if (!door.openFlag) continue;
            const slabWidth = door.width ?? 1.4;
            const slabHeight = door.height ?? (height - 0.6);
            const slab = new THREE.Mesh(
                axis.along === 'x'
                    ? new THREE.BoxGeometry(slabWidth * 0.95, slabHeight, thickness * 0.7)
                    : new THREE.BoxGeometry(thickness * 0.7, slabHeight, slabWidth * 0.95),
                createMaterial('wood'),
            );
            if (axis.along === 'x') slab.position.set(door.offset ?? 0, slabHeight / 2, 0);
            else slab.position.set(0, slabHeight / 2, door.offset ?? 0);
            slab.castShadow = true;
            slab.receiveShadow = true;
            markPhysics(slab, { solid: true, colliderShape: 'cuboid' });
            wallGroup.add(slab);
            const key = door.openFlag;
            if (!lockedDoors.has(key)) lockedDoors.set(key, []);
            lockedDoors.get(key)!.push(slab);
        }

        roomGroup.add(wallGroup);
    }

    engine.scene.add(roomGroup);

    // ─── Lys ────────────────────────────────────────────────────────────────
    applyLightingPreset(engine.scene, config.lights ?? 'warm-interior');

    // ─── Flag-drevne dører: lyttere som åpner/lukker ─────────────────────────
    // Bruk ALLTID registerUpdate, ikke sjekk getFlag umiddelbart. Grunnen:
    // buildRoom kjøres synkront i setupScene, men fysikken er ikke klar ennå.
    // Hvis vi kalte removeStaticCollider nå, ville det være en no-op (physics er null).
    // Polling per frame venter implisitt på at fysikken blir tilgjengelig.
    for (const [flag, slabs] of lockedDoors) {
        let processed = false;
        engine.registerUpdate(() => {
            if (processed) return;
            if (engine.getFlag(flag)) {
                processed = true;
                for (const s of slabs) {
                    engine.removeStaticCollider(s);
                    s.visible = false;
                }
            }
        });
    }

    return { group: roomGroup, lockedDoors };
}

/**
 * Bygg en utendørs-scene med bakke, evt grense-vegger, og lys.
 */
export function buildOutdoor(
    engine: GameEngineRef,
    config: BuildOutdoorConfig
): { group: THREE.Group } {
    const radius = config.radius ?? 40;
    const group = new THREE.Group();
    group.userData.declarativeId = config.id;

    const groundMat = createMaterial(config.ground ?? 'grass');
    const ground = new THREE.Mesh(new THREE.CircleGeometry(radius, 32), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    group.add(ground);

    // Fysikk-collider (usynlig tykk boks)
    const groundCollider = new THREE.Mesh(
        new THREE.BoxGeometry(radius * 2, 0.4, radius * 2),
        new THREE.MeshBasicMaterial({ visible: false }),
    );
    groundCollider.position.y = -0.2;
    markPhysics(groundCollider, { solid: true, colliderShape: 'cuboid' });
    group.add(groundCollider);

    // Grense-vegger (usynlige)
    if (config.boundary !== false) {
        const wallH = 4;
        const segs = 8;
        for (let i = 0; i < segs; i++) {
            const angle = (i / segs) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            const segLen = (2 * Math.PI * radius) / segs;
            const blocker = new THREE.Mesh(
                new THREE.BoxGeometry(segLen, wallH, 1),
                new THREE.MeshBasicMaterial({ visible: false }),
            );
            blocker.position.set(x, wallH / 2, z);
            blocker.rotation.y = angle + Math.PI / 2;
            markPhysics(blocker, { solid: true });
            group.add(blocker);
        }
    }

    engine.scene.add(group);

    applyLightingPreset(engine.scene, config.lights ?? 'outdoor-day');

    return { group };
}
