import * as THREE from 'three';

// Fase 3.3: fotomodus. Fryser spill-tid (dt=0 i update), flytter kamera-kontroll
// fra spilleren til en fri-kamera som flyr i scenen. Screenshot eksporteres
// som PNG. LUT og exposure kan justeres fra UI-sliders.

export interface PhotoModeState {
    active: boolean;
    exposure: number;
    lutName: string | null;
}

export class PhotoModeSystem {
    active = false;
    // Fri-kamera-posisjon og rotasjon tas over av motoren's ordinære kamera-
    // kontroll, men vi lagrer spillerens tilstand for å kunne restaurere.
    private savedCamPos = new THREE.Vector3();
    private savedCamTarget = new THREE.Vector3();
    // Ekstra fri-kamera-hastighet når i fotomodus (WASD + mus).
    readonly flySpeed = 8;
    readonly flyLookSpeed = 0.003;
    // Slider-styrt LUT og exposure — UI pusher disse og PostProcessingSystem leser.
    exposure = 1.8;
    lutName: string | null = null;

    enter(camPos: THREE.Vector3, camTarget: THREE.Vector3): void {
        if (this.active) return;
        this.active = true;
        this.savedCamPos.copy(camPos);
        this.savedCamTarget.copy(camTarget);
    }

    exit(camPos: THREE.Vector3, camTarget: THREE.Vector3): void {
        if (!this.active) return;
        this.active = false;
        camPos.copy(this.savedCamPos);
        camTarget.copy(this.savedCamTarget);
    }

    snapshot(): PhotoModeState {
        return { active: this.active, exposure: this.exposure, lutName: this.lutName };
    }

    /** Eksporter canvasets innhold som PNG-data-URL. Må kalles umiddelbart etter render. */
    capture(canvas: HTMLCanvasElement): string {
        return canvas.toDataURL('image/png');
    }

    /** Trigger download av screenshot med tidsstempel i filnavn. */
    download(canvas: HTMLCanvasElement, prefix = 'screenshot'): void {
        const data = this.capture(canvas);
        const a = document.createElement('a');
        a.href = data;
        const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        a.download = `${prefix}-${ts}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    dispose(): void {
        // PhotoModeSystem holder ingen eksterne ressurser - state nullstilles så
        // gjentatte init/dispose-sykluser (memory-lekkasjetest) er deterministisk.
        this.active = false;
        this.lutName = null;
    }
}
