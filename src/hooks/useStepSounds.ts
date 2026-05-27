import { useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';

export type StepSoundEvent =
    | 'select'
    | 'correct'
    | 'incorrect'
    | 'advance'
    | 'complete'
    | 'pick'
    | 'drop'
    | 'sceneChange';

interface StepSoundsAPI {
    play: (event: StepSoundEvent) => void;
    setMuted: (muted: boolean) => void;
    isMuted: () => boolean;
}

const MUTE_KEY = 'learning_path_sound_muted';

// Lavmælte, romersk-nøytrale UI-toner for læringsstier.
// Programmatisk via Tone.js, ingen asset-filer. Skala: lydene skal aldri stjele
// fokus fra innholdet — de er en bekreftelse, ikke en feiring.
export function useStepSounds(): StepSoundsAPI {
    const muted = useRef(false);
    const initPromiseRef = useRef<Promise<void> | null>(null);

    const synthsRef = useRef<{
        pluck?: Tone.PluckSynth;
        noise?: Tone.NoiseSynth;
        pad?: Tone.PolySynth;
        bass?: Tone.MembraneSynth;
        master?: Tone.Gain;
    }>({});

    useEffect(() => {
        const saved = localStorage.getItem(MUTE_KEY);
        if (saved === 'true') muted.current = true;
    }, []);

    useEffect(() => {
        return () => {
            const s = synthsRef.current;
            s.pluck?.dispose();
            s.noise?.dispose();
            s.pad?.dispose();
            s.bass?.dispose();
            s.master?.dispose();
            synthsRef.current = {};
            initPromiseRef.current = null;
        };
    }, []);

    const ensureInit = useCallback((): Promise<void> => {
        if (initPromiseRef.current) return initPromiseRef.current;
        const p = (async () => {
            try {
                await Tone.start();
            } catch {
                initPromiseRef.current = null;
                return;
            }
            const master = new Tone.Gain(0.22).toDestination();
            const pluck = new Tone.PluckSynth({
                attackNoise: 0.4,
                dampening: 4200,
                resonance: 0.72,
            }).connect(master);
            const noise = new Tone.NoiseSynth({
                noise: { type: 'pink' },
                envelope: { attack: 0.001, decay: 0.06, sustain: 0 },
            }).connect(master);
            const pad = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.008, decay: 0.18, sustain: 0.05, release: 0.35 },
            }).connect(master);
            const bass = new Tone.MembraneSynth({
                pitchDecay: 0.06,
                octaves: 3,
                envelope: { attack: 0.001, decay: 0.22, sustain: 0, release: 0.2 },
            }).connect(master);
            bass.volume.value = -6;
            synthsRef.current = { pluck, noise, pad, bass, master };
        })();
        initPromiseRef.current = p;
        return p;
    }, []);

    const play = useCallback(
        (event: StepSoundEvent) => {
            if (muted.current) return;
            void ensureInit().then(() => {
                const s = synthsRef.current;
                const now = Tone.now();
                try {
                    switch (event) {
                        case 'select':
                            s.pluck?.triggerAttack('E5', now);
                            break;
                        case 'correct':
                            s.pad?.triggerAttackRelease('E5', '16n', now);
                            s.pad?.triggerAttackRelease('B5', '16n', now + 0.07);
                            break;
                        case 'incorrect':
                            s.bass?.triggerAttackRelease('A2', '16n', now);
                            s.bass?.triggerAttackRelease('F2', '8n', now + 0.1);
                            break;
                        case 'advance':
                            s.pluck?.triggerAttack('G5', now);
                            s.pluck?.triggerAttack('C6', now + 0.06);
                            break;
                        case 'complete':
                            s.pad?.triggerAttackRelease(['C5', 'E5', 'G5'], '8n', now);
                            s.pad?.triggerAttackRelease(['E5', 'G5', 'C6'], '4n', now + 0.18);
                            break;
                        case 'pick':
                            s.pluck?.triggerAttack('A4', now);
                            break;
                        case 'drop':
                            s.noise?.triggerAttackRelease('32n', now);
                            break;
                        case 'sceneChange':
                            s.pad?.triggerAttackRelease('C5', '8n', now);
                            s.pad?.triggerAttackRelease('G4', '4n', now + 0.12);
                            break;
                    }
                } catch {
                    // ignorer hvis Tone enda ikke er klar
                }
            });
        },
        [ensureInit]
    );

    const setMuted = useCallback((m: boolean) => {
        muted.current = m;
        localStorage.setItem(MUTE_KEY, m ? 'true' : 'false');
    }, []);

    const isMuted = useCallback(() => muted.current, []);

    return { play, setMuted, isMuted };
}
