import type { AccuracyResult, RhythmPattern, TapResult } from './rhythmTypes';
import { HIT_WINDOWS } from './rhythmTypes';
import { eventsToTapTimes } from './rhythmGenerator';

function rateDeviation(absMs: number): TapResult['rating'] {
    if (absMs <= HIT_WINDOWS.perfect) return 'perfect';
    if (absMs <= HIT_WINDOWS.good) return 'good';
    return 'miss';
}

export function calculateAccuracy(
    pattern: RhythmPattern,
    tapTimesSec: number[],
    latencyOffsetMs: number,
    startTimeSec: number
): AccuracyResult {
    const expectedRel = eventsToTapTimes(pattern);
    const expectedAbs = expectedRel.map((t) => startTimeSec + t);

    const corrected = tapTimesSec.map((t) => t - latencyOffsetMs / 1000);
    const usedTaps = new Set<number>();

    const perBeat: TapResult[] = expectedAbs.map((expected, i) => {
        let bestIdx = -1;
        let bestDiff = Infinity;
        corrected.forEach((tap, idx) => {
            if (usedTaps.has(idx)) return;
            const diff = Math.abs(tap - expected);
            if (diff < bestDiff) {
                bestDiff = diff;
                bestIdx = idx;
            }
        });

        const diffMs = bestDiff * 1000;
        if (bestIdx === -1 || diffMs > HIT_WINDOWS.miss) {
            return {
                expectedBeat: expectedRel[i],
                expectedTime: expected,
                actualTime: null,
                deviationMs: null,
                rating: 'miss',
            };
        }
        usedTaps.add(bestIdx);
        const signedDeviationMs = (corrected[bestIdx] - expected) * 1000;
        return {
            expectedBeat: expectedRel[i],
            expectedTime: expected,
            actualTime: corrected[bestIdx],
            deviationMs: signedDeviationMs,
            rating: rateDeviation(diffMs),
        };
    });

    const hits = perBeat.filter((b) => b.rating !== 'miss');
    const hitRate = perBeat.length === 0 ? 0 : hits.length / perBeat.length;
    const averageDeviationMs =
        hits.length === 0
            ? 0
            : hits.reduce((sum, b) => sum + Math.abs(b.deviationMs ?? 0), 0) / hits.length;

    const score = Math.round(
        perBeat.reduce((sum, b) => {
            if (b.rating === 'perfect') return sum + 100;
            if (b.rating === 'good') return sum + 60;
            return sum;
        }, 0) / Math.max(1, perBeat.length)
    );

    return { perBeat, hitRate, averageDeviationMs, score };
}

export function calibrationOffsetFromTaps(
    tapTimesSec: number[],
    expectedTimesSec: number[]
): number {
    const deviations: number[] = [];
    expectedTimesSec.forEach((expected) => {
        let bestDiff = Infinity;
        let signed = 0;
        tapTimesSec.forEach((tap) => {
            const diff = Math.abs(tap - expected);
            if (diff < bestDiff) {
                bestDiff = diff;
                signed = (tap - expected) * 1000;
            }
        });
        if (Math.abs(signed) <= 300) {
            deviations.push(signed);
        }
    });

    if (deviations.length === 0) return 0;
    deviations.sort((a, b) => a - b);
    const mid = Math.floor(deviations.length / 2);
    return deviations.length % 2 === 0
        ? (deviations[mid - 1] + deviations[mid]) / 2
        : deviations[mid];
}
