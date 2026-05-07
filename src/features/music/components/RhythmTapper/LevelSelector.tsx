import { Lock } from 'lucide-react';
import type { LevelProgress } from '../../lib/rhythmTypes';

const LEVEL_LABELS: Record<number, string> = {
    1: 'Halvnoter',
    2: 'Fjerdedeler',
    3: 'Pauser',
    4: 'Åttendedeler',
    5: 'Synkoper',
};

interface Props {
    progress: Record<number, LevelProgress>;
    activeLevel: number;
    onSelect: (level: number) => void;
}

export function LevelSelector({ progress, activeLevel, onSelect }: Props) {
    const levels = [1, 2, 3, 4, 5];
    return (
        <div className="grid grid-cols-5 gap-2">
            {levels.map((lv) => {
                const p = progress[lv];
                const unlocked = p?.unlocked ?? lv === 1;
                const isActive = lv === activeLevel;
                const score = p?.bestScore ?? 0;
                return (
                    <button
                        key={lv}
                        type="button"
                        onClick={() => unlocked && onSelect(lv)}
                        disabled={!unlocked}
                        className={`relative p-2.5 rounded-lg border-2 text-left transition ${
                            isActive
                                ? 'border-indigo-600 bg-indigo-50'
                                : unlocked
                                  ? 'border-slate-200 bg-white hover:border-indigo-300'
                                  : 'border-slate-200 bg-slate-50 cursor-not-allowed'
                        }`}
                    >
                        <div className="text-xs text-slate-500">Nivå {lv}</div>
                        <div className="font-semibold text-sm text-slate-800">
                            {LEVEL_LABELS[lv]}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                            {unlocked ? (
                                score > 0 ? (
                                    <span className="font-mono text-indigo-600">{score}%</span>
                                ) : (
                                    'Ny'
                                )
                            ) : (
                                <span className="flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Låst
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
