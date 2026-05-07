import * as Tone from 'tone';

let metronomeAccent: Tone.MembraneSynth | null = null;
let metronomeClick: Tone.MembraneSynth | null = null;
let tapClick: Tone.Synth | null = null;

function ensureMetronome(): { accent: Tone.MembraneSynth; click: Tone.MembraneSynth } {
    if (!metronomeAccent) {
        metronomeAccent = new Tone.MembraneSynth({
            pitchDecay: 0.008,
            octaves: 2,
            envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 },
        }).toDestination();
        metronomeAccent.volume.value = -6;
    }
    if (!metronomeClick) {
        metronomeClick = new Tone.MembraneSynth({
            pitchDecay: 0.005,
            octaves: 1.5,
            envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.04 },
        }).toDestination();
        metronomeClick.volume.value = -10;
    }
    return { accent: metronomeAccent, click: metronomeClick };
}

function ensureTap(): Tone.Synth {
    if (!tapClick) {
        tapClick = new Tone.Synth({
            oscillator: { type: 'triangle' },
            envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.06 },
        }).toDestination();
        tapClick.volume.value = -8;
    }
    return tapClick;
}

export function playMetronomeAccent(time?: number): void {
    const { accent } = ensureMetronome();
    accent.triggerAttackRelease('C5', '32n', time);
}

export function playMetronomeClick(time?: number): void {
    const { click } = ensureMetronome();
    click.triggerAttackRelease('C4', '32n', time);
}

export function playTapClick(time?: number): void {
    const tap = ensureTap();
    tap.triggerAttackRelease('A3', '32n', time);
}

export function disposeSynths(): void {
    metronomeAccent?.dispose();
    metronomeClick?.dispose();
    tapClick?.dispose();
    metronomeAccent = null;
    metronomeClick = null;
    tapClick = null;
}
