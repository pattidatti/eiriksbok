import type { NoteValue, RestValue, RhythmEvent, RhythmPattern } from './rhythmTypes';
import { QUARTER_NOTE_BEATS } from './rhythmTypes';

interface LevelRule {
    notes: NoteValue[];
    rests: RestValue[];
    allowSyncopation: boolean;
}

const LEVEL_RULES: Record<number, LevelRule> = {
    1: { notes: ['2n'], rests: [], allowSyncopation: false },
    2: { notes: ['4n'], rests: [], allowSyncopation: false },
    3: { notes: ['2n', '4n'], rests: ['4r'], allowSyncopation: false },
    4: { notes: ['4n', '8n'], rests: ['4r'], allowSyncopation: false },
    5: { notes: ['4n', '8n', '4n.'], rests: ['8r', '4r'], allowSyncopation: true },
};

const TOTAL_BEATS = 8;

function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateEvents(level: number): RhythmEvent[] {
    const rule = LEVEL_RULES[level] ?? LEVEL_RULES[2];
    const events: RhythmEvent[] = [];
    let currentBeat = 0;
    let safetyCounter = 0;

    while (currentBeat < TOTAL_BEATS && safetyCounter < 200) {
        safetyCounter++;
        const remaining = TOTAL_BEATS - currentBeat;

        const useRest = rule.rests.length > 0 && Math.random() < 0.2;
        const pool: (NoteValue | RestValue)[] = useRest ? rule.rests : rule.notes;
        const candidate = pickRandom(pool.filter((v) => QUARTER_NOTE_BEATS[v] <= remaining));

        if (!candidate) {
            const fallback = rule.notes.find((n) => QUARTER_NOTE_BEATS[n] <= remaining);
            if (!fallback) break;
            events.push({ kind: 'note', value: fallback, beat: currentBeat });
            currentBeat += QUARTER_NOTE_BEATS[fallback];
            continue;
        }

        const isRest = rule.rests.includes(candidate as RestValue);
        if (isRest) {
            events.push({ kind: 'rest', value: candidate as RestValue, beat: currentBeat });
        } else {
            events.push({ kind: 'note', value: candidate as NoteValue, beat: currentBeat });
        }
        currentBeat += QUARTER_NOTE_BEATS[candidate];
    }

    return events;
}

function ensureHasNote(events: RhythmEvent[], level: number): RhythmEvent[] {
    if (events.some((e) => e.kind === 'note')) return events;
    const rule = LEVEL_RULES[level] ?? LEVEL_RULES[2];
    return events.map((e, i) =>
        i === 0 ? { kind: 'note', value: rule.notes[0], beat: 0 } : e
    );
}

export function generatePattern(level: number, bpm: number): RhythmPattern {
    let events = generateEvents(level);
    events = ensureHasNote(events, level);

    return {
        id: `gen-${level}-${Date.now()}`,
        level,
        timeSignature: [4, 4],
        bars: 2,
        bpm,
        events,
    };
}

export function eventsToTapTimes(pattern: RhythmPattern): number[] {
    const secondsPerBeat = 60 / pattern.bpm;
    return pattern.events
        .filter((e) => e.kind === 'note')
        .map((e) => e.beat * secondsPerBeat);
}
