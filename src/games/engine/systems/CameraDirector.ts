import * as THREE from 'three';
import type { CinematicShot, DialogCameraFraming } from '../types';

interface OTSResult {
    cameraPos: THREE.Vector3;
    lookAt: THREE.Vector3;
    weight: number; // clampet 0..1 for blending
    fov: number;
}

type FadeCallback = (visible: boolean, durationMs: number) => Promise<void>;

const UP = new THREE.Vector3(0, 1, 0);

// Underdamped spring-konstanter (kritisk demping ≈ 2*sqrt(160) ≈ 25.3)
// DAMPING < 25 → overshoot → "punch"-effekt
const SPRING_STIFFNESS = 160;
const SPRING_DAMPING = 13;

const DIALOG_FOV = 45;
const OTS_DIST = 2.0;    // avstand bak anchor-karakteren
const OTS_SIDE = 1.6;    // skulder-offset (nok til å peeke forbi kroppen)
const OTS_HEIGHT = 1.9;  // over hodet til spilleren (~1.7m) for fri sikt til NPC

export class CameraDirector {
    private springPos = 0;
    private springVel = 0;
    private isDialogActive = false;

    private npcWorldPos = new THREE.Vector3();
    private playerWorldPos = new THREE.Vector3();
    private dialogSide: 'npc' | 'player' = 'npc';

    private currentFov = 60;
    private baseFov = 60;

    private fadeCallback: FadeCallback | null = null;

    setFadeCallback(cb: FadeCallback): void {
        this.fadeCallback = cb;
    }

    pushDialogFraming(
        npcPos: THREE.Vector3,
        playerPos: THREE.Vector3,
        side: 'npc' | 'player' = 'npc',
        baseFov = 60,
    ): void {
        this.npcWorldPos.copy(npcPos);
        this.playerWorldPos.copy(playerPos);
        this.dialogSide = side;

        if (!this.isDialogActive) {
            // Første gang dialog apnes: fang pre-dialog-FOV og start spring fra 0
            this.baseFov = baseFov;
            this.springPos = 0;
            this.springVel = 0;
            this.currentFov = baseFov;
            this.isDialogActive = true;
        }
        // Hvis allerede aktiv (ny node i same dialog): bare oppdater side + posisjon,
        // behold spring-momentumet sa overgangen er glatt
    }

    switchSide(side: 'npc' | 'player'): void {
        this.dialogSide = side;
    }

    // Gammel API-kompatibilitet for setCameraFraming i game-configs
    setFraming(framing: DialogCameraFraming, target?: THREE.Vector3): void {
        if (framing === 'wide' || !target) {
            this.pop();
            return;
        }
        // 'speaker'-framing uten playerPos: bruk sist kjente player-posisjon
        this.pushDialogFraming(target, this.playerWorldPos, 'npc', this.baseFov);
    }

    pop(): void {
        // Instant cut: reset alt til neutral med en gang
        this.isDialogActive = false;
        this.springPos = 0;
        this.springVel = 0;
        this.currentFov = this.baseFov;
    }

    getBaseFov(): number {
        return this.baseFov;
    }

    update(dt: number): void {
        if (!this.isDialogActive && this.springPos < 0.001 && this.springVel < 0.001) return;

        const targetPos = this.isDialogActive ? 1.0 : 0.0;
        const force = (targetPos - this.springPos) * SPRING_STIFFNESS - this.springVel * SPRING_DAMPING;
        this.springVel += force * dt;
        this.springPos += this.springVel * dt;

        // FOV: smooth lerp inn
        const targetFov = this.isDialogActive ? DIALOG_FOV : this.baseFov;
        this.currentFov += (targetFov - this.currentFov) * Math.min(1, dt * 8);
    }

    apply(): OTSResult | null {
        const weight = Math.max(0, Math.min(1, this.springPos));
        if (weight < 0.001 && !this.isDialogActive) return null;

        const { cameraPos, lookAt } = this._computeOTSTransform();

        return {
            cameraPos,
            lookAt,
            weight,
            fov: this.currentFov,
        };
    }

    private _computeOTSTransform(): { cameraPos: THREE.Vector3; lookAt: THREE.Vector3 } {
        const npc = this.npcWorldPos;
        const player = this.playerWorldPos;

        // Horisontal retning fra spiller til NPC
        const toNPC = new THREE.Vector3(npc.x - player.x, 0, npc.z - player.z);
        const dist = toNPC.length();
        if (dist < 0.01) {
            // NPC og spiller pa same posisjon — fallback rett bak spiller
            toNPC.set(0, 0, -1);
        } else {
            toNPC.divideScalar(dist);
        }

        const right = new THREE.Vector3().crossVectors(toNPC, UP).normalize();

        let cameraPos: THREE.Vector3;
        let lookAt: THREE.Vector3;

        const NPC_HEAD = 1.55;   // hoyde fra gruppe-root til hode (NPC)
        const PLAYER_HEAD = 1.6; // hoyde fra gruppe-root til hode (spiller)

        if (this.dialogSide === 'npc') {
            // Bak spilleren, ser mot NPC
            cameraPos = player
                .clone()
                .addScaledVector(toNPC, -OTS_DIST)
                .addScaledVector(right, OTS_SIDE)
                .add(new THREE.Vector3(0, OTS_HEIGHT, 0));
            lookAt = npc.clone().add(new THREE.Vector3(0, NPC_HEAD, 0));
        } else {
            // Bak NPC, ser mot spilleren
            cameraPos = npc
                .clone()
                .addScaledVector(toNPC, OTS_DIST)
                .addScaledVector(right, -OTS_SIDE)
                .add(new THREE.Vector3(0, OTS_HEIGHT, 0));
            lookAt = player.clone().add(new THREE.Vector3(0, PLAYER_HEAD, 0));
        }

        return { cameraPos, lookAt };
    }

    async fadeToBlack(durationMs = 400): Promise<void> {
        if (!this.fadeCallback) return;
        await this.fadeCallback(true, durationMs);
    }

    async fadeFromBlack(durationMs = 400): Promise<void> {
        if (!this.fadeCallback) return;
        await this.fadeCallback(false, durationMs);
    }

    async playCinematic(shots: CinematicShot[]): Promise<void> {
        if (shots.length === 0) return;
        console.warn(
            `[CameraDirector] playCinematic stub: ${shots.length} shot(s) requested, ` +
                `but full cinematic pipeline not implemented in this phase.`,
        );
    }

    isFraming(): boolean {
        return this.isDialogActive || this.springPos > 0.01;
    }

    dispose(): void {
        this.fadeCallback = null;
    }
}

export type CameraFramingOverride = OTSResult;
