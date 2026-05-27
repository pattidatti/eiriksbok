import * as Tone from 'tone';
import { NOTES_SHARP, CHORD_QUALITIES } from '../utils/musicTheory';
import type { PresetChord } from '../theory/progressionPresets';
import type { Genre } from './genrePresets';

interface Voices {
    kick: Tone.MembraneSynth;
    snare: Tone.NoiseSynth;
    hat: Tone.MetalSynth;
    bass: Tone.MonoSynth;
    comp: Tone.PolySynth;
    drumBus: Tone.Gain;
    bassBus: Tone.Gain;
    compBus: Tone.Gain;
}

let voices: Voices | null = null;
const scheduledIds: number[] = [];
let beatLoopId: number | null = null;
let chordLoopId: number | null = null;

function ensureVoices(): Voices {
    if (voices) return voices;
    const drumBus = new Tone.Gain(1).toDestination();
    const bassBus = new Tone.Gain(1).toDestination();
    const compBus = new Tone.Gain(1).toDestination();

    const kick = new Tone.MembraneSynth({
        pitchDecay: 0.04,
        octaves: 4,
        envelope: { attack: 0.001, decay: 0.35, sustain: 0, release: 0.4 },
    }).connect(drumBus);
    kick.volume.value = -4;

    const snare = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.18, sustain: 0, release: 0.15 },
    }).connect(drumBus);
    snare.volume.value = -10;

    const hat = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.05, release: 0.02 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5,
    }).connect(drumBus);
    hat.volume.value = -22;

    const bass = new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.5, release: 0.3 },
        filterEnvelope: { attack: 0.005, decay: 0.1, sustain: 0.2, release: 0.4, baseFrequency: 200, octaves: 2.5 },
    }).connect(bassBus);
    bass.volume.value = -10;

    const comp = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.25, sustain: 0.05, release: 0.4 },
    }).connect(compBus);
    comp.volume.value = -16;

    voices = { kick, snare, hat, bass, comp, drumBus, bassBus, compBus };
    return voices;
}

export function setStemMute(stem: 'drums' | 'bass' | 'comp', muted: boolean): void {
    if (!voices) return;
    const bus = stem === 'drums' ? voices.drumBus : stem === 'bass' ? voices.bassBus : voices.compBus;
    bus.gain.rampTo(muted ? 0 : 1, 0.05);
}

function clearScheduled() {
    scheduledIds.forEach((id) => Tone.Transport.clear(id));
    scheduledIds.length = 0;
    if (beatLoopId !== null) {
        Tone.Transport.clear(beatLoopId);
        beatLoopId = null;
    }
    if (chordLoopId !== null) {
        Tone.Transport.clear(chordLoopId);
        chordLoopId = null;
    }
}

export async function ensureBackingAudio(): Promise<void> {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
    ensureVoices();
}

function chordPitches(chord: PresetChord, baseOctave = 4): string[] {
    const rootIndex = NOTES_SHARP.indexOf(chord.root);
    if (rootIndex === -1) return [];
    const quality = chord.quality as keyof typeof CHORD_QUALITIES;
    const intervals = CHORD_QUALITIES[quality]?.intervals ?? CHORD_QUALITIES.Major.intervals;
    return intervals.map((interval) => {
        const absSemi = rootIndex + interval;
        const octaveOffset = Math.floor(absSemi / 12);
        const pitchClass = absSemi % 12;
        return `${NOTES_SHARP[pitchClass]}${baseOctave + octaveOffset}`;
    });
}

function bassNote(chord: PresetChord, octave = 2): string {
    return `${chord.root}${octave}`;
}

function fifthNote(chord: PresetChord, octave = 2): string {
    const rootIndex = NOTES_SHARP.indexOf(chord.root);
    if (rootIndex === -1) return bassNote(chord, octave);
    const fifth = (rootIndex + 7) % 12;
    const octBump = rootIndex + 7 >= 12 ? 1 : 0;
    return `${NOTES_SHARP[fifth]}${octave + octBump}`;
}

interface PlaybackOptions {
    bpm: number;
    genre: Genre;
    chords: PresetChord[];
    barsPerChord?: number;
    onBeat?: (absBeat: number) => void;
    onChordChange?: (chordIndex: number) => void;
}

export function setBackingBpm(bpm: number): void {
    Tone.Transport.bpm.value = bpm;
}

export function startBacking(opts: PlaybackOptions): void {
    const { bpm, genre, chords, barsPerChord = 1, onBeat, onChordChange } = opts;
    if (chords.length === 0) return;
    ensureVoices();
    clearScheduled();

    Tone.Transport.bpm.value = bpm;
    Tone.Transport.position = 0;
    Tone.Transport.timeSignature = 4;

    const totalBars = chords.length * barsPerChord;
    const beatsPerBar = 4;
    const totalBeats = totalBars * beatsPerBar;
    const loopBars = totalBars;
    Tone.Transport.loop = true;
    Tone.Transport.loopStart = 0;
    Tone.Transport.loopEnd = `${loopBars}m`;

    let lastChordIndex = -1;

    beatLoopId = Tone.Transport.scheduleRepeat((time) => {
        const ticks = Tone.Transport.ticks;
        const ppq = Tone.Transport.PPQ;
        const beatFloat = ticks / ppq;
        const beat = Math.round(beatFloat);
        const beatInLoop = beat % totalBeats;
        const beatInBar = beatInLoop % beatsPerBar;
        const barInLoop = Math.floor(beatInLoop / beatsPerBar);
        const chordIndex = Math.floor(barInLoop / barsPerChord);
        const chord = chords[chordIndex];

        if (chordIndex !== lastChordIndex) {
            lastChordIndex = chordIndex;
            if (onChordChange) {
                Tone.Draw.schedule(() => onChordChange(chordIndex), time);
            }
        }

        if (onBeat) {
            Tone.Draw.schedule(() => onBeat(beatInLoop), time);
        }

        playGenreBeat(genre, voices!, time, beatInBar, chord);
    }, '4n', 0);

    chordLoopId = Tone.Transport.scheduleRepeat((time) => {
        const ticks = Tone.Transport.ticks;
        const ppq = Tone.Transport.PPQ;
        const beatFloat = ticks / ppq;
        const beat = Math.round(beatFloat);
        const beatInLoop = beat % totalBeats;
        const barInLoop = Math.floor(beatInLoop / beatsPerBar);
        const beatInBar = beatInLoop % beatsPerBar;
        const chordIndex = Math.floor(barInLoop / barsPerChord);
        const chord = chords[chordIndex];

        if (beatInBar === 0 || beatInBar === 2) {
            const notes = chordPitches(chord, 4);
            voices!.comp.triggerAttackRelease(notes, '8n', time, 0.55);
        }
    }, '4n', 0);

    Tone.Transport.start('+0.1');
}

function playGenreBeat(
    genre: Genre,
    v: Voices,
    time: number,
    beatInBar: number,
    chord: PresetChord
) {
    if (genre === 'rock') {
        if (beatInBar === 0 || beatInBar === 2) {
            v.kick.triggerAttackRelease('C1', '8n', time);
        }
        if (beatInBar === 1 || beatInBar === 3) {
            v.snare.triggerAttackRelease('16n', time, 0.7);
        }
        v.hat.triggerAttackRelease('C5', '32n', time, 0.4);
        v.hat.triggerAttackRelease('C5', '32n', time + Tone.Time('8n').toSeconds(), 0.3);

        if (beatInBar === 0) {
            v.bass.triggerAttackRelease(bassNote(chord, 2), '4n', time, 0.8);
        } else if (beatInBar === 2) {
            v.bass.triggerAttackRelease(fifthNote(chord, 2), '4n', time, 0.7);
        } else {
            v.bass.triggerAttackRelease(bassNote(chord, 2), '8n', time, 0.5);
        }
    } else if (genre === 'blues') {
        if (beatInBar === 0 || beatInBar === 2) {
            v.kick.triggerAttackRelease('C1', '8n', time);
        }
        if (beatInBar === 1 || beatInBar === 3) {
            v.snare.triggerAttackRelease('16n', time, 0.65);
        }
        const triplet = Tone.Time('4n').toSeconds() / 3;
        v.hat.triggerAttackRelease('C5', '32n', time, 0.35);
        v.hat.triggerAttackRelease('C5', '32n', time + triplet * 2, 0.25);

        const walkNote = walkingBassNote(chord, beatInBar);
        v.bass.triggerAttackRelease(walkNote, '4n', time, 0.75);
    }
}

function walkingBassNote(chord: PresetChord, beatInBar: number): string {
    const rootIndex = NOTES_SHARP.indexOf(chord.root);
    if (rootIndex === -1) return `${chord.root}2`;
    const steps = [0, 4, 7, 10];
    const semi = steps[beatInBar % 4];
    const abs = rootIndex + semi;
    const oct = 2 + Math.floor(abs / 12);
    const pitchClass = abs % 12;
    return `${NOTES_SHARP[pitchClass]}${oct}`;
}

export function stopBacking(): void {
    Tone.Transport.stop();
    Tone.Transport.loop = false;
    Tone.Transport.position = 0;
    clearScheduled();
}

export async function previewNote(midi: number): Promise<void> {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
    ensureVoices();
    const pitchClass = midi % 12;
    const octave = Math.floor(midi / 12) - 1;
    const noteName = `${NOTES_SHARP[pitchClass]}${octave}`;
    voices!.comp.triggerAttackRelease(noteName, '8n', undefined, 0.6);
}
