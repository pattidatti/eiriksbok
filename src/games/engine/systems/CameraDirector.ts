import * as THREE from 'three';
import type { CinematicShot, DialogCameraFraming } from '../types';

interface FraminghOverride {
    target: THREE.Vector3;
    weight: number; // 0..1, hvor mye den overrider default-kamera
    distanceFactor: number; // <1 betyr nærmere taler
    targetWeight: number;
}

type FadeCallback = (visible: boolean, durationMs: number) => Promise<void>;

// CameraDirector eier ikke kameraet - den eksponerer en framing-override som GameEngine
// blander inn i sin update-camera-funksjon. Pluss en fade-overlay-callback (DOM).
export class CameraDirector {
    private framingActive = false;
    private framingTarget = new THREE.Vector3();
    private framingWeight = 0; // 0..1 lerp-fremover
    private framingTargetWeight = 0;
    private fadeCallback: FadeCallback | null = null;

    setFadeCallback(cb: FadeCallback): void {
        this.fadeCallback = cb;
    }

    pushDialogFraming(speakerWorldPos: THREE.Vector3, framing: DialogCameraFraming = 'speaker'): void {
        if (framing === 'wide') {
            this.pop();
            return;
        }
        this.framingActive = true;
        this.framingTarget.copy(speakerWorldPos);
        this.framingTargetWeight = 1;
    }

    pop(): void {
        this.framingActive = false;
        this.framingTargetWeight = 0;
    }

    setFraming(framing: DialogCameraFraming, target?: THREE.Vector3): void {
        if (framing === 'wide' || !target) {
            this.pop();
            return;
        }
        this.pushDialogFraming(target, framing);
    }

    update(dt: number): void {
        // Lerp framing weight mot target
        const speed = Math.min(1, dt * 4);
        this.framingWeight += (this.framingTargetWeight - this.framingWeight) * speed;
    }

    // Returnerer framing-info hvis aktiv, ellers null. GameEngine bruker info til å blende kamera.
    apply(): FraminghOverride | null {
        if (!this.framingActive && this.framingWeight < 0.001) return null;
        return {
            target: this.framingTarget.clone(),
            weight: this.framingWeight,
            distanceFactor: 1 - 0.35 * this.framingWeight,
            targetWeight: this.framingWeight,
        };
    }

    async fadeToBlack(durationMs = 400): Promise<void> {
        if (!this.fadeCallback) return;
        await this.fadeCallback(true, durationMs);
    }

    async fadeFromBlack(durationMs = 400): Promise<void> {
        if (!this.fadeCallback) return;
        await this.fadeCallback(false, durationMs);
    }

    // Stub for fremtidig cinematic-pipeline. Logger varsel og resolver umiddelbart.
    async playCinematic(shots: CinematicShot[]): Promise<void> {
        if (shots.length === 0) return;
        console.warn(
            `[CameraDirector] playCinematic stub: ${shots.length} shot(s) requested, ` +
            `but full cinematic pipeline not implemented in this phase.`,
        );
    }

    isFraming(): boolean {
        return this.framingActive || this.framingWeight > 0.01;
    }

    dispose(): void {
        this.fadeCallback = null;
    }
}

export type CameraFramingOverride = FraminghOverride;
