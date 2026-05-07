import type { AccuracyResult } from '../../lib/rhythmTypes';

interface Props {
    result: AccuracyResult;
}

const COLORS = {
    perfect: 'bg-green-500',
    good: 'bg-amber-400',
    miss: 'bg-rose-500',
};

const ICONS = {
    perfect: '✓',
    good: '~',
    miss: '✗',
};

export function AccuracyTimeline({ result }: Props) {
    const { perBeat, hitRate, averageDeviationMs, score } = result;

    return (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-baseline justify-between mb-4">
                <h3 className="font-display font-semibold text-lg">Resultat</h3>
                <div className="text-right">
                    <div className="text-3xl font-bold text-indigo-600">{score}%</div>
                    <div className="text-xs text-slate-500">presisjon</div>
                </div>
            </div>

            <div
                className="grid gap-1.5 mb-4"
                style={{ gridTemplateColumns: `repeat(${Math.max(perBeat.length, 1)}, minmax(0, 1fr))` }}
                aria-label="Per-slag-resultat"
            >
                {perBeat.map((beat, i) => (
                    <div
                        key={i}
                        className={`aspect-square rounded flex items-center justify-center text-white text-sm font-bold ${COLORS[beat.rating]}`}
                        title={
                            beat.deviationMs === null
                                ? 'Ingen tap registrert'
                                : `${Math.round(beat.deviationMs)}ms`
                        }
                    >
                        {ICONS[beat.rating]}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                    <div className="text-slate-500 text-xs">Treff</div>
                    <div className="font-semibold">{Math.round(hitRate * 100)}%</div>
                </div>
                <div>
                    <div className="text-slate-500 text-xs">Snitt-avvik</div>
                    <div className="font-semibold">{Math.round(averageDeviationMs)} ms</div>
                </div>
                <div>
                    <div className="text-slate-500 text-xs">Slag</div>
                    <div className="font-semibold">{perBeat.length}</div>
                </div>
            </div>
        </div>
    );
}
