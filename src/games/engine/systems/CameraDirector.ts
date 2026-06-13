import * as THREE from 'three';
import type { CinematicShot, DialogCameraFraming } from '../types';

interface CinematicOverride {
    cameraPos: THREE.Vector3;
    lookAt: THREE.Vector3;
    fov: number;
}

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
    private cinematicOverride: CinematicOverride | null = null;
    // Fase 8: aktiv glide-interpolasjon (easeInOut) av cinematicOverride mellom to
    // transformer. Drives av update(dt). resolve kalles når glide-en er ferdig
    // (eller avbrutt av dispose) så playCinematic kan fortsette.
    private glide: {
        from: CinematicOverride;
        to: CinematicOverride;
        elapsed: number;
        duration: number; // sekunder
        resolve: () => void;
    } | null = null;

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
        // Fase 8: glide-interpolasjon kjøres FØR dialog-early-return (uavhengig av dialog).
        if (this.glide) {
            const g = this.glide;
            g.elapsed += dt;
            const raw = g.duration > 0 ? Math.min(1, g.elapsed / g.duration) : 1;
            // easeInOut (smoothstep-aktig kubisk)
            const t = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
            if (!this.cinematicOverride) {
                this.cinematicOverride = {
                    cameraPos: new THREE.Vector3(),
                    lookAt: new THREE.Vector3(),
                    fov: g.from.fov,
                };
            }
            this.cinematicOverride.cameraPos.lerpVectors(g.from.cameraPos, g.to.cameraPos, t);
            this.cinematicOverride.lookAt.lerpVectors(g.from.lookAt, g.to.lookAt, t);
            this.cinematicOverride.fov = g.from.fov + (g.to.fov - g.from.fov) * t;
            if (raw >= 1) {
                const done = g.resolve;
                this.glide = null;
                done();
            }
        }

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

    // endGlide (Fase 8): etter siste shot glir kameraet mykt inn i `target` (typisk
    // spillerens orbit-ideal) over durationMs, i stedet for å kutte. Overriden nulles
    // først når glide-en er ferdig.
    async playCinematic(
        shots: CinematicShot[],
        endGlide?: { target: { cameraPos: THREE.Vector3; lookAt: THREE.Vector3; fov: number }; durationMs: number },
    ): Promise<void> {
        if (shots.length === 0) return;

        let prev: CinematicOverride | null = this.cinematicOverride;
        for (const shot of shots) {
            const target: CinematicOverride = {
                cameraPos: new THREE.Vector3(...shot.cameraPos),
                lookAt: new THREE.Vector3(...shot.lookAt),
                fov: shot.fov ?? 60,
            };

            if (shot.transition === 'glide' && prev) {
                // Lerp fra forrige shot inn i dette over hele shot-varigheten.
                await this.runGlide(prev, target, shot.duration * 1000);
            } else {
                if (shot.transition === 'fade') await this.fadeToBlack(300);
                this.cinematicOverride = target;
                if (shot.transition === 'fade') await this.fadeFromBlack(400);
                await new Promise<void>((resolve) => setTimeout(resolve, shot.duration * 1000));
            }
            prev = target;
        }

        if (endGlide && prev) {
            await this.runGlide(prev, {
                cameraPos: endGlide.target.cameraPos.clone(),
                lookAt: endGlide.target.lookAt.clone(),
                fov: endGlide.target.fov,
            }, endGlide.durationMs);
        }

        this.cinematicOverride = null;
        this.glide = null;
    }

    private runGlide(from: CinematicOverride, to: CinematicOverride, durationMs: number): Promise<void> {
        // Avbryt en eventuell pågående glide rent.
        this.glide?.resolve();
        return new Promise<void>((resolve) => {
            this.glide = {
                from: {
                    cameraPos: from.cameraPos.clone(),
                    lookAt: from.lookAt.clone(),
                    fov: from.fov,
                },
                to,
                elapsed: 0,
                duration: durationMs / 1000,
                resolve,
            };
        });
    }

    getCinematicOverride(): CinematicOverride | null {
        return this.cinematicOverride;
    }

    isCinematicActive(): boolean {
        return this.cinematicOverride !== null;
    }

    isFraming(): boolean {
        return this.isDialogActive || this.springPos > 0.01;
    }

    dispose(): void {
        this.fadeCallback = null;
        this.cinematicOverride = null;
        // Resolve en eventuell ventende glide så playCinematic ikke henger ved dispose.
        this.glide?.resolve();
        this.glide = null;
    }
}

export type CameraFramingOverride = OTSResult;
