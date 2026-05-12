import { useCallback, useEffect, useRef } from 'react';
import * as Tone from 'tone';

type SoundEvent = 'pickup' | 'place' | 'correct' | 'wrong' | 'streak' | 'gameOver';

interface ChronoSoundAPI {
    play: (event: SoundEvent, streakCount?: number) => void;
    setMuted: (muted: boolean) => void;
    isMuted: () => boolean;
}

const MUTE_KEY = 'chrono_sound_muted';

export function useChronoSound(): ChronoSoundAPI {
    const muted = useRef(false);
    const initPromiseRef = useRef<Promise<void> | null>(null);

    const synthsRef = useRef<{
        pluck?: Tone.PluckSynth;
        noise?: Tone.NoiseSynth;
        pad?: Tone.PolySynth;
        bass?: Tone.MembraneSynth;
        fx?: Tone.MetalSynth;
        masterGain?: Tone.Gain;
    }>({});

    useEffect(() => {
        const saved = localStorage.getItem(MUTE_KEY);
        if (saved === 'true') muted.current = true;
    }, []);

    // Dispose Tone resources on unmount
    useEffect(() => {
        return () => {
            const synths = synthsRef.current;
            synths.pluck?.dispose();
            synths.noise?.dispose();
            synths.pad?.dispose();
            synths.bass?.dispose();
            synths.fx?.dispose();
            synths.masterGain?.dispose();
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
            const masterGain = new Tone.Gain(0.35).toDestination();
            const pluck = new Tone.PluckSynth({ attackNoise: 0.5, dampening: 5000, resonance: 0.7 }).connect(masterGain);
            const noise = new Tone.NoiseSynth({
                noise: { type: 'pink' },
                envelope: { attack: 0.001, decay: 0.08, sustain: 0 },
            }).connect(masterGain);
            const pad = new Tone.PolySynth(Tone.Synth, {
                oscillator: { type: 'triangle' },
                envelope: { attack: 0.005, decay: 0.1, sustain: 0.1, release: 0.3 },
            }).connect(masterGain);
            const bass = new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 4,
                envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
            }).connect(masterGain);
            const fx = new Tone.MetalSynth({
                envelope: { attack: 0.001, decay: 0.15, release: 0.2 },
                harmonicity: 5.1,
                modulationIndex: 32,
                resonance: 4000,
                octaves: 1.5,
            }).connect(masterGain);
            fx.volume.value = -18;
            synthsRef.current = { pluck, noise, pad, bass, fx, masterGain };
        })();
        initPromiseRef.current = p;
        return p;
    }, []);

    const play = useCallback(
        (event: SoundEvent, streakCount = 0) => {
            if (muted.current) return;
            void ensureInit().then(() => {
                const synths = synthsRef.current;
                const now = Tone.now();
                try {
                    switch (event) {
                        case 'pickup':
                            synths.pluck?.triggerAttack('C5', now);
                            break;
                        case 'place':
                            synths.noise?.triggerAttackRelease('16n', now);
                            break;
                        case 'correct': {
                            const baseNotes = ['C5', 'E5', 'G5'];
                            const idx = Math.min(streakCount, 7);
                            const transpose = idx;
                            const notes = baseNotes.map((n) => Tone.Frequency(n).transpose(transpose).toNote());
                            synths.pad?.triggerAttackRelease(notes[0], '16n', now);
                            synths.pad?.triggerAttackRelease(notes[1], '16n', now + 0.06);
                            break;
                        }
                        case 'wrong':
                            synths.bass?.triggerAttackRelease('A2', '8n', now);
                            synths.bass?.triggerAttackRelease('F2', '8n', now + 0.12);
                            break;
                        case 'streak': {
                            const notes = ['C5', 'E5', 'G5', 'C6'];
                            notes.forEach((note, i) => {
                                synths.pad?.triggerAttackRelease(note, '16n', now + i * 0.07);
                            });
                            synths.fx?.triggerAttackRelease('C6', '16n', now + 0.3);
                            break;
                        }
                        case 'gameOver':
                            synths.pad?.triggerAttackRelease(['C4', 'Eb4', 'G4'], '4n', now);
                            synths.bass?.triggerAttackRelease('C2', '4n', now + 0.05);
                            break;
                    }
                } catch {
                    // Tone may not be ready yet; ignore
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
