import React, { useState } from 'react';
import { Trophy, RotateCcw } from 'lucide-react';
import {
    INTERVAL_LEVELS,
    CHORD_LEVELS,
    RHYTHM_LEVELS,
    INTERVAL_NAMES,
    CHORD_LABELS,
    type ModeId,
} from './logic/levels';
import { loadState, resetState, statKey } from './logic/storage';

interface StatRow {
    label: string;
    correct: number;
    total: number;
    pct: number;
}

function colorForPct(pct: number): string {
    if (pct >= 0.9) return 'bg-emerald-500';
    if (pct >= 0.7) return 'bg-lime-500';
    if (pct >= 0.5) return 'bg-amber-500';
    return 'bg-rose-500';
}

export const StatsTab: React.FC = () => {
    const [state, setState] = useState(() => loadState());
    const [confirmReset, setConfirmReset] = useState(false);

    const buildRows = (mode: ModeId, labels: string[]): StatRow[] => {
        return labels
            .map((label) => {
                const entry = state.stats[statKey(mode, label)];
                const total = entry?.total ?? 0;
                const correct = entry?.correct ?? 0;
                return { label, correct, total, pct: total > 0 ? correct / total : 0 };
            })
            .filter((r) => r.total >= 5)
            .sort((a, b) => a.pct - b.pct);
    };

    const intervalLabels = Array.from(new Set(Object.values(INTERVAL_NAMES)));
    const chordLabels = Object.values(CHORD_LABELS);
    const rhythmLabels = ['2/4', '3/4', '4/4'];

    const intervalRows = buildRows('interval', intervalLabels);
    const chordRows = buildRows('chord', chordLabels);
    const rhythmRows = buildRows('rhythm', rhythmLabels);

    const handleReset = () => {
        resetState();
        setState(loadState());
        setConfirmReset(false);
    };

    const renderBests = () => {
        const items: { mode: string; level: number; levelName: string; streak: number }[] = [];
        INTERVAL_LEVELS.forEach((l) => {
            const s = state.bestStreaks.interval[l.id] ?? 0;
            if (s > 0) items.push({ mode: 'Intervall', level: l.id, levelName: l.name, streak: s });
        });
        CHORD_LEVELS.forEach((l) => {
            const s = state.bestStreaks.chord[l.id] ?? 0;
            if (s > 0) items.push({ mode: 'Akkord', level: l.id, levelName: l.name, streak: s });
        });
        RHYTHM_LEVELS.forEach((l) => {
            const s = state.bestStreaks.rhythm[l.id] ?? 0;
            if (s > 0) items.push({ mode: 'Rytme', level: l.id, levelName: l.name, streak: s });
        });
        if (items.length === 0) {
            return <p className="text-sm text-slate-500">Ingen rekorder enda. Begynn å trene!</p>;
        }
        return (
            <ul className="space-y-2">
                {items.map((it, i) => (
                    <li
                        key={i}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-2"
                    >
                        <span className="text-sm text-slate-700">
                            <span className="font-semibold">{it.mode}</span> — Nivå {it.level} ({it.levelName})
                        </span>
                        <span className="flex items-center gap-1.5 text-sm font-bold text-amber-600">
                            <Trophy className="h-4 w-4" />
                            {it.streak}
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    const renderRows = (rows: StatRow[]) => {
        if (rows.length === 0) {
            return <p className="text-sm italic text-slate-400">Trenger minst 5 forsøk per kategori for å vise statistikk.</p>;
        }
        return (
            <ul className="space-y-1.5">
                {rows.map((r) => (
                    <li key={r.label} className="flex items-center gap-3">
                        <span className="w-32 flex-shrink-0 text-sm text-slate-700">{r.label}</span>
                        <div className="relative h-5 flex-1 overflow-hidden rounded bg-slate-200">
                            <div
                                className={`absolute inset-y-0 left-0 ${colorForPct(r.pct)}`}
                                style={{ width: `${r.pct * 100}%` }}
                            />
                        </div>
                        <span className="w-20 flex-shrink-0 text-right text-xs tabular-nums text-slate-600">
                            {r.correct}/{r.total} ({Math.round(r.pct * 100)}%)
                        </span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="space-y-8 py-4">
            <section>
                <h3 className="mb-3 text-lg font-bold text-slate-800">Personlige rekorder</h3>
                {renderBests()}
            </section>

            <section>
                <h3 className="mb-3 text-lg font-bold text-slate-800">Treffsikkerhet — Intervaller</h3>
                {renderRows(intervalRows)}
            </section>

            <section>
                <h3 className="mb-3 text-lg font-bold text-slate-800">Treffsikkerhet — Akkorder</h3>
                {renderRows(chordRows)}
            </section>

            <section>
                <h3 className="mb-3 text-lg font-bold text-slate-800">Treffsikkerhet — Taktarter</h3>
                {renderRows(rhythmRows)}
            </section>

            <section className="border-t border-slate-200 pt-4">
                {!confirmReset ? (
                    <button
                        type="button"
                        onClick={() => setConfirmReset(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-50"
                    >
                        <RotateCcw className="h-4 w-4" />
                        Tilbakestill statistikk
                    </button>
                ) : (
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-700">Er du sikker? Dette sletter alt.</span>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"
                        >
                            Ja, slett
                        </button>
                        <button
                            type="button"
                            onClick={() => setConfirmReset(false)}
                            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                            Avbryt
                        </button>
                    </div>
                )}
            </section>
        </div>
    );
};
