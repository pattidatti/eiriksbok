import React, { useEffect, useState } from 'react';
import { Music, Layers, Drum, BarChart3 } from 'lucide-react';
import { IntervalMode } from './IntervalMode';
import { ChordMode } from './ChordMode';
import { RhythmMode } from './RhythmMode';
import { StatsTab } from './StatsTab';
import { loadState, saveLastSession } from './logic/storage';
import type { ModeId } from './logic/levels';

type Tab = ModeId | 'stats';

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'interval', label: 'Intervall', icon: Music },
    { id: 'chord', label: 'Akkord', icon: Layers },
    { id: 'rhythm', label: 'Rytme', icon: Drum },
    { id: 'stats', label: 'Statistikk', icon: BarChart3 },
];

export const EarTrainer: React.FC = () => {
    const initial = React.useMemo(() => loadState().lastSession, []);
    const [tab, setTab] = useState<Tab>(initial.mode);
    const [intervalLevel, setIntervalLevel] = useState(initial.mode === 'interval' ? initial.level : 1);
    const [chordLevel, setChordLevel] = useState(initial.mode === 'chord' ? initial.level : 1);
    const [rhythmLevel, setRhythmLevel] = useState(initial.mode === 'rhythm' ? initial.level : 1);

    useEffect(() => {
        if (tab !== 'stats') {
            const level = tab === 'interval' ? intervalLevel : tab === 'chord' ? chordLevel : rhythmLevel;
            saveLastSession(tab, level);
        }
    }, [tab, intervalLevel, chordLevel, rhythmLevel]);

    const handleIntervalLevel = (l: number) => setIntervalLevel(l);
    const handleChordLevel = (l: number) => setChordLevel(l);
    const handleRhythmLevel = (l: number) => setRhythmLevel(l);

    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
            <header className="mb-6">
                <h1 className="text-3xl font-bold text-slate-900">Gehørtrening</h1>
                <p className="mt-1 text-slate-600">
                    Tren øret til å gjenkjenne intervaller, akkorder og taktarter. Hør, gjett, lær.
                </p>
            </header>

            <nav className="mb-6 flex flex-wrap gap-1 border-b border-slate-200">
                {TABS.map((t) => {
                    const Icon = t.icon;
                    const active = tab === t.id;
                    return (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                                active
                                    ? 'border-b-2 border-indigo-600 text-indigo-700'
                                    : 'border-b-2 border-transparent text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            {t.label}
                        </button>
                    );
                })}
            </nav>

            <main>
                {tab === 'interval' && (
                    <IntervalMode initialLevel={intervalLevel} onLevelChange={handleIntervalLevel} />
                )}
                {tab === 'chord' && (
                    <ChordMode initialLevel={chordLevel} onLevelChange={handleChordLevel} />
                )}
                {tab === 'rhythm' && (
                    <RhythmMode initialLevel={rhythmLevel} onLevelChange={handleRhythmLevel} />
                )}
                {tab === 'stats' && <StatsTab />}
            </main>
        </div>
    );
};
