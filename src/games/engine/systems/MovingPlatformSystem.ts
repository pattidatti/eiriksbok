import * as THREE from 'three';
import type { PhysicsWorld, KinematicPlatformHandle } from './PhysicsWorld';
import type { MovingPlatformOptions } from '../types';

// Driver bevegelige plattformer (heiser/lifter). Posisjonen er TIDS-basert
// (deterministisk for save/load): den utledes av motorens elapsed-klokke, ikke av
// akkumulert per-frame-integrasjon. Hver frame settes plattformens kinematiske body +
// visuelle mesh til samme posisjon, og frameDelta (denne framens forflytning) lagres
// så GameEngine kan la spilleren bli båret (carry).
//
// VIKTIG: update() MÅ kalles inne i GameEngine.update() FØR updatePhysicsPlayer (så
// frameDelta er kjent før carry leses) og FØR physics.step(). Ikke via registerUpdate -
// den fyrer etter step() og ville vært én frame for sen.

interface PlatformDesc {
    handle: KinematicPlatformHandle;
    from: THREE.Vector3;
    to: THREE.Vector3;
    period: number;
    easing: 'linear' | 'sine';
    phase: number;
    prevPos: THREE.Vector3;
    frameDelta: THREE.Vector3;
    firstFrame: boolean;
}

export class MovingPlatformSystem {
    private physics: PhysicsWorld;
    private platforms: PlatformDesc[] = [];
    private _tmp = new THREE.Vector3();

    constructor(physics: PhysicsWorld) {
        this.physics = physics;
    }

    add(handle: KinematicPlatformHandle, opts: MovingPlatformOptions, time: number): void {
        const desc: PlatformDesc = {
            handle,
            from: new THREE.Vector3(...opts.from),
            to: new THREE.Vector3(...opts.to),
            period: Math.max(0.1, opts.period),
            easing: opts.easing ?? 'sine',
            phase: opts.phase ?? 0,
            prevPos: new THREE.Vector3(),
            frameDelta: new THREE.Vector3(),
            firstFrame: true,
        };
        this.posAt(desc, time, desc.prevPos); // initialiser prevPos til startposisjon
        this.platforms.push(desc);
    }

    update(time: number): void {
        for (const p of this.platforms) {
            const target = this.posAt(p, time, this._tmp);
            this.physics.setPlatformTranslation(p.handle, target.x, target.y, target.z);
            p.handle.mesh.position.set(target.x, target.y, target.z);
            if (p.firstFrame) {
                p.frameDelta.set(0, 0, 0);
                p.firstFrame = false;
            } else {
                p.frameDelta.subVectors(target, p.prevPos);
            }
            p.prevPos.copy(target);
        }
    }

    // Returnerer plattformens forflytning denne framen, eller null hvis bodyHandle
    // ikke tilhører en plattform.
    getCarryDelta(bodyHandle: number): THREE.Vector3 | null {
        const p = this.platforms.find((pl) => pl.handle.bodyHandle === bodyHandle);
        return p ? p.frameDelta : null;
    }

    private posAt(p: PlatformDesc, time: number, out: THREE.Vector3): THREE.Vector3 {
        let cycle = (time / p.period + p.phase) % 1;
        if (cycle < 0) cycle += 1;
        const tri = 1 - Math.abs(2 * cycle - 1); // 0 → 1 → 0
        const e = p.easing === 'sine' ? 0.5 - 0.5 * Math.cos(Math.PI * tri) : tri;
        return out.lerpVectors(p.from, p.to, e);
    }

    dispose(): void {
        this.platforms.length = 0;
    }
}
