import * as Tone from 'tone';
import { midiToNoteName } from './levels';

let samplerPromise: Promise<Tone.Sampler> | null = null;

function createSampler(): Promise<Tone.Sampler> {
    return new Promise((resolve) => {
        const sampler = new Tone.Sampler({
            urls: {
                A1: 'A1.mp3',
                A2: 'A2.mp3',
                A3: 'A3.mp3',
                A4: 'A4.mp3',
                A5: 'A5.mp3',
                A6: 'A6.mp3',
            },
            baseUrl: 'https://tonejs.github.io/audio/salamander/',
            release: 1.4,
            onload: () => resolve(sampler),
        }).toDestination();
    });
}

export async function getSampler(): Promise<Tone.Sampler> {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
    if (!samplerPromise) {
        samplerPromise = createSampler();
    }
    return samplerPromise;
}

export async function playInterval(
    rootMidi: number,
    semitones: number,
    mode: 'melodic' | 'harmonic'
): Promise<void> {
    const sampler = await getSampler();
    const root = midiToNoteName(rootMidi);
    const top = midiToNoteName(rootMidi + semitones);
    const now = Tone.now();
    if (mode === 'harmonic') {
        sampler.triggerAttackRelease([root, top], '2n', now);
    } else {
        sampler.triggerAttackRelease(root, '2n', now);
        sampler.triggerAttackRelease(top, '2n', now + 0.7);
    }
}

export async function playTwoIntervals(
    rootMidi: number,
    firstSemitones: number,
    secondSemitones: number,
    mode: 'melodic' | 'harmonic',
    gapSeconds: number = 0.9
): Promise<void> {
    const sampler = await getSampler();
    const root = midiToNoteName(rootMidi);
    const now = Tone.now();
    const firstTop = midiToNoteName(rootMidi + firstSemitones);
    const secondTop = midiToNoteName(rootMidi + secondSemitones);
    if (mode === 'harmonic') {
        sampler.triggerAttackRelease([root, firstTop], '2n', now);
        const cont = now + 1.2 + gapSeconds;
        sampler.triggerAttackRelease([root, secondTop], '2n', cont);
    } else {
        sampler.triggerAttackRelease(root, '2n', now);
        sampler.triggerAttackRelease(firstTop, '2n', now + 0.7);
        const cont = now + 1.4 + gapSeconds;
        sampler.triggerAttackRelease(root, '2n', cont);
        sampler.triggerAttackRelease(secondTop, '2n', cont + 0.7);
    }
}

export async function playChord(rootMidi: number, intervals: number[]): Promise<void> {
    const sampler = await getSampler();
    const notes = intervals.map((iv) => midiToNoteName(rootMidi + iv));
    sampler.triggerAttackRelease(notes, '1n', Tone.now());
}

export async function playTwoChords(
    rootMidi: number,
    firstIntervals: number[],
    secondIntervals: number[],
    gapSeconds: number = 1.0
): Promise<void> {
    const sampler = await getSampler();
    const now = Tone.now();
    const firstNotes = firstIntervals.map((iv) => midiToNoteName(rootMidi + iv));
    const secondNotes = secondIntervals.map((iv) => midiToNoteName(rootMidi + iv));
    sampler.triggerAttackRelease(firstNotes, '1n', now);
    sampler.triggerAttackRelease(secondNotes, '1n', now + 1.5 + gapSeconds);
}

export interface RhythmHit {
    beat: number;
    duration: number;
}

export async function playRhythm(
    pattern: RhythmHit[],
    bpm: number,
    rootMidi: number = 60
): Promise<void> {
    const sampler = await getSampler();
    const note = midiToNoteName(rootMidi);
    const beatSec = 60 / bpm;
    const now = Tone.now();
    pattern.forEach((hit) => {
        sampler.triggerAttackRelease(note, hit.duration * beatSec * 0.95, now + hit.beat * beatSec);
    });
}

export function rhythmDurationSeconds(pattern: RhythmHit[], bpm: number): number {
    if (pattern.length === 0) return 0;
    const beatSec = 60 / bpm;
    const last = pattern[pattern.length - 1];
    return (last.beat + last.duration) * beatSec;
}
