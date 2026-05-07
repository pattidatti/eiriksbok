import * as Tone from 'tone';
import { playMetronomeAccent, playMetronomeClick } from './clickSynths';

let started = false;
const scheduledIds: number[] = [];

export const PLAYBACK_START_OFFSET_SEC = 0.15;
export const COUNT_IN_START_OFFSET_SEC = 0.1;

export async function ensureAudioReady(): Promise<void> {
    if (Tone.context.state !== 'running') {
        await Tone.start();
    }
    started = true;
}

export function setBpm(bpm: number): void {
    Tone.Transport.bpm.value = bpm;
}

export function getCurrentTime(): number {
    return Tone.now();
}

function clearScheduled(): void {
    scheduledIds.forEach((id) => Tone.Transport.clear(id));
    scheduledIds.length = 0;
}

interface CountInOptions {
    bpm: number;
    beats: number;
    onTick?: (beatIndex: number, time: number) => void;
    onComplete?: (startTime: number) => void;
}

export function scheduleCountIn(opts: CountInOptions): void {
    const { bpm, beats, onTick, onComplete } = opts;
    setBpm(bpm);
    const secondsPerBeat = 60 / bpm;
    const startOffset = COUNT_IN_START_OFFSET_SEC;

    for (let i = 0; i < beats; i++) {
        const time = startOffset + i * secondsPerBeat;
        const id = Tone.Transport.schedule((t) => {
            if (i === 0) playMetronomeAccent(t);
            else playMetronomeClick(t);
            if (onTick) {
                Tone.Draw.schedule(() => onTick(i, t), t);
            }
        }, time);
        scheduledIds.push(id);
    }

    const completeTime = startOffset + beats * secondsPerBeat;
    const completeId = Tone.Transport.schedule((t) => {
        if (onComplete) {
            Tone.Draw.schedule(() => onComplete(t), t);
        }
    }, completeTime);
    scheduledIds.push(completeId);
}

interface PlayOptions {
    bpm: number;
    bars: number;
    timeSignature: [number, number];
    countInBeats?: number;
    rhythmHitsRel?: number[];
    onMetronome?: (beatIndex: number, time: number) => void;
    onRhythmHit?: (relSec: number, time: number) => void;
    onCountInComplete?: (startTime: number) => void;
    onPatternComplete?: (endTime: number) => void;
}

export function schedulePlayback(opts: PlayOptions): void {
    const {
        bpm,
        bars,
        timeSignature,
        countInBeats = timeSignature[0],
        rhythmHitsRel,
        onMetronome,
        onRhythmHit,
        onCountInComplete,
        onPatternComplete,
    } = opts;

    setBpm(bpm);
    clearScheduled();

    const secondsPerBeat = 60 / bpm;
    const beatsPerBar = timeSignature[0];
    const totalMetronomeBeats = countInBeats + bars * beatsPerBar;
    const startOffset = PLAYBACK_START_OFFSET_SEC;

    for (let i = 0; i < totalMetronomeBeats; i++) {
        const time = startOffset + i * secondsPerBeat;
        const isAccent = (i - countInBeats) % beatsPerBar === 0 || i < countInBeats;
        const id = Tone.Transport.schedule((t) => {
            if (i < countInBeats) {
                playMetronomeAccent(t);
            } else if (isAccent) {
                playMetronomeAccent(t);
            } else {
                playMetronomeClick(t);
            }
            if (onMetronome) {
                Tone.Draw.schedule(() => onMetronome(i, t), t);
            }
        }, time);
        scheduledIds.push(id);
    }

    const playableStartTime = startOffset + countInBeats * secondsPerBeat;
    if (onCountInComplete) {
        const id = Tone.Transport.schedule((t) => {
            Tone.Draw.schedule(() => onCountInComplete(t), t);
        }, playableStartTime);
        scheduledIds.push(id);
    }

    if (rhythmHitsRel) {
        rhythmHitsRel.forEach((rel) => {
            const time = playableStartTime + rel;
            const id = Tone.Transport.schedule((t) => {
                if (onRhythmHit) {
                    Tone.Draw.schedule(() => onRhythmHit(rel, t), t);
                }
            }, time);
            scheduledIds.push(id);
        });
    }

    const endTime = startOffset + totalMetronomeBeats * secondsPerBeat;
    if (onPatternComplete) {
        const id = Tone.Transport.schedule((t) => {
            Tone.Draw.schedule(() => onPatternComplete(t), t);
        }, endTime);
        scheduledIds.push(id);
    }
}

export function startTransport(): void {
    Tone.Transport.position = 0;
    Tone.Transport.start();
}

export function stopTransport(): void {
    Tone.Transport.stop();
    Tone.Transport.position = 0;
    clearScheduled();
}

export function isStarted(): boolean {
    return started;
}
