import type { ActivityDef } from '../types';

export interface ActivityProgress {
    id: string;
    label: string;
    prompt: string;
    variant: ActivityDef['variant'];
    progress: number;   // 0..1 total aktivitet
    beatActive: boolean; // rhythm: beat-indikatoren lyser
    holdFill: number;   // hold: 0..1 hvor full hold-baren er
}

// Varighet av beat-vindus (ms) — spilleren må treffe SPACE innen dette etter hvert slag.
const BEAT_WINDOW_MS = 220;

export class TimedActivitySystem {
    private def: ActivityDef | null = null;
    private elapsed = 0;       // ms siden aktiviteten started
    private beatElapsed = 0;   // ms siden siste beat
    private totalBeats = 0;
    private hitsCorrect = 0;
    private holdFill = 0;
    private beatActive = false;
    private beatWindowOpen = false;
    private beatConsumed = false;

    open(def: ActivityDef): void {
        this.def = def;
        this.elapsed = 0;
        this.beatElapsed = 0;
        this.totalBeats = 0;
        this.hitsCorrect = 0;
        this.holdFill = 0;
        this.beatActive = false;
        this.beatWindowOpen = false;
        this.beatConsumed = false;
    }

    close(): void {
        this.def = null;
    }

    isActive(): boolean {
        return this.def !== null;
    }

    /**
     * Tick-metode. Returnerer 'ongoing', 'success' eller 'fail' nar aktiviteten er fullfort.
     * @param dt delta-tid i sekunder
     * @param spaceJustPressed SPACE ble akkurat trykket (ikke hold-repeat)
     * @param spaceHeld SPACE holdes nede dette bildet
     */
    update(dt: number, spaceJustPressed: boolean, spaceHeld: boolean): 'ongoing' | 'success' | 'fail' {
        if (!this.def) return 'ongoing';

        const def = this.def;
        const dtMs = dt * 1000;
        this.elapsed += dtMs;

        if (def.variant === 'rhythm') {
            const intervalMs = def.windowMs ?? 800;
            this.beatElapsed += dtMs;

            // Nytt slag nar intervallet er over
            if (this.beatElapsed >= intervalMs) {
                this.beatElapsed -= intervalMs;
                this.totalBeats++;
                this.beatActive = true;
                this.beatWindowOpen = true;
                this.beatConsumed = false;
            }

            // Lukk beat-vindus etter BEAT_WINDOW_MS
            if (this.beatWindowOpen && this.beatElapsed > BEAT_WINDOW_MS) {
                this.beatWindowOpen = false;
                this.beatActive = false;
            }

            // Registrer treff
            if (spaceJustPressed && this.beatWindowOpen && !this.beatConsumed) {
                this.hitsCorrect++;
                this.beatConsumed = true;
                this.beatActive = false; // slukk indikatoren ved treff
            }
        } else if (def.variant === 'hold') {
            // Hold-baren stiger ved aktivt holdt SPACE, synker ellers
            if (spaceHeld) {
                this.holdFill = Math.min(1, this.holdFill + dt * 0.9);
            } else {
                this.holdFill = Math.max(0, this.holdFill - dt * 1.4);
            }
        }
        // 'sustained': ingen interaksjon, fyller seg automatisk over tid

        if (this.elapsed >= def.durationMs) {
            return this._evaluate();
        }

        return 'ongoing';
    }

    private _evaluate(): 'success' | 'fail' {
        const def = this.def!;
        const threshold = def.successThreshold ?? 0.7;
        if (def.variant === 'rhythm') {
            const rate = this.totalBeats > 0 ? this.hitsCorrect / this.totalBeats : 0;
            return rate >= threshold ? 'success' : 'fail';
        } else if (def.variant === 'hold') {
            return this.holdFill >= threshold ? 'success' : 'fail';
        }
        // sustained: alltid suksess
        return 'success';
    }

    getProgress(): ActivityProgress | null {
        if (!this.def) return null;
        return {
            id: this.def.id,
            label: this.def.label,
            prompt: this.def.prompt,
            variant: this.def.variant,
            progress: Math.min(1, this.elapsed / this.def.durationMs),
            beatActive: this.beatActive,
            holdFill: this.holdFill,
        };
    }
}
