import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, RefreshCw } from 'lucide-react';

interface MilitaerVsStrategiskProps {
    title?: string;
}

type Quadrant = 'vv' | 'vt' | 'tv' | 'tt';

const WARS = [
    {
        id: 'afghanistan',
        label: 'Afghanistan 2001',
        correct: 'vt' as Quadrant,
        militaryNote: 'Taliban falt pa uker. Bin Laden jagd pa flukt. Kabul tatt.',
        strategicNote: 'Trakk oss ut i 2021 - Taliban tilbake, akkurat som i 1996. 20 ar, ingenting endret.',
    },
    {
        id: 'irak',
        label: 'Irak 2003',
        correct: 'vt' as Quadrant,
        militaryNote: 'Saddam styrtet pa 3 uker. Bagdad falt raskt.',
        strategicNote: 'Maktvakuumet skapte IS. Irak ustabilt i arene. USA matte dra tilbake i 2014.',
    },
];

const QUADRANTS: Record<Quadrant, { x: string; y: string; label: string; color: string }> = {
    vv: { x: 'right', y: 'top', label: 'Militær seier + Strategisk seier', color: 'bg-emerald-100 border-emerald-300' },
    vt: { x: 'right', y: 'bottom', label: 'Militær seier + Strategisk fiasko', color: 'bg-amber-100 border-amber-300' },
    tv: { x: 'left', y: 'top', label: 'Militær fiasko + Strategisk seier', color: 'bg-blue-50 border-blue-200' },
    tt: { x: 'left', y: 'bottom', label: 'Militær fiasko + Strategisk fiasko', color: 'bg-rose-100 border-rose-200' },
};

export function MilitaerVsStrategisk({ title = 'Å vinne krigen - tape freden' }: MilitaerVsStrategiskProps) {
    const [placements, setPlacements] = useState<Record<string, Quadrant | null>>({
        afghanistan: null,
        irak: null,
    });
    const [revealed, setRevealed] = useState(false);

    const allPlaced = WARS.every((w) => placements[w.id] !== null);

    const handlePlace = (warId: string, quad: Quadrant) => {
        if (revealed) return;
        setPlacements((prev) => ({ ...prev, [warId]: prev[warId] === quad ? null : quad }));
    };

    const handleReveal = () => setRevealed(true);

    const handleReset = () => {
        setPlacements({ afghanistan: null, irak: null });
        setRevealed(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden not-prose my-6">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <Crosshair className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Plasser begge krigene i riktig rute - militær vs. strategisk resultat</p>
                </div>
            </div>

            <div className="p-4">
                {/* Axes matrix */}
                <div className="relative">
                    {/* Y axis label */}
                    <div className="flex items-start gap-2 mb-1">
                        <div className="w-16 flex-shrink-0" />
                        <div className="flex-1 grid grid-cols-2 gap-1">
                            <div className="text-center text-[10px] font-bold text-emerald-700 uppercase tracking-wide">Militær seier</div>
                            <div className="text-center text-[10px] font-bold text-rose-600 uppercase tracking-wide">Militær fiasko</div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {/* X axis labels */}
                        <div className="w-16 flex-shrink-0 flex flex-col gap-1">
                            <div className="flex-1 flex items-center justify-end pr-1">
                                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wide writing-vertical text-right leading-tight">
                                    Strategisk seier
                                </span>
                            </div>
                            <div className="flex-1 flex items-center justify-end pr-1">
                                <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wide text-right leading-tight">
                                    Strategisk fiasko
                                </span>
                            </div>
                        </div>

                        {/* 2x2 Grid */}
                        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-1" style={{ height: '220px' }}>
                            {(['vv', 'tv', 'vt', 'tt'] as Quadrant[]).map((quad) => {
                                const q = QUADRANTS[quad];
                                return (
                                    <div
                                        key={quad}
                                        className={`rounded-lg border-2 p-2 cursor-pointer transition-all ${q.color} hover:opacity-80`}
                                    >
                                        <div className="text-[9px] text-slate-500 font-medium mb-1 leading-tight">{q.label}</div>
                                        {/* War placement buttons */}
                                        <div className="flex flex-col gap-1">
                                            {WARS.map((w) => {
                                                const isPlaced = placements[w.id] === quad;
                                                const isCorrect = revealed && w.correct === quad;
                                                const isWrong = revealed && isPlaced && w.correct !== quad;
                                                return (
                                                    <button
                                                        key={w.id}
                                                        onClick={() => handlePlace(w.id, quad)}
                                                        disabled={revealed || (placements[w.id] !== null && placements[w.id] !== quad)}
                                                        className={`text-[10px] font-semibold px-2 py-1 rounded border transition-all ${
                                                            isCorrect
                                                                ? 'bg-emerald-200 border-emerald-400 text-emerald-800'
                                                                : isWrong
                                                                  ? 'bg-rose-200 border-rose-400 text-rose-800'
                                                                  : isPlaced
                                                                    ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                                                                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'
                                                        } disabled:opacity-40 disabled:cursor-not-allowed`}
                                                    >
                                                        {w.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Reveal button */}
                <AnimatePresence>
                    {allPlaced && !revealed && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 text-center"
                        >
                            <button
                                onClick={handleReveal}
                                className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-5 py-2 transition-colors"
                            >
                                Vis fasit
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence>
                    {revealed && (
                        <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-3 space-y-2"
                        >
                            {WARS.map((w) => (
                                <div key={w.id} className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                                    <div className="text-xs font-bold text-amber-800 mb-1">{w.label}</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-[9px] font-semibold uppercase tracking-wide text-emerald-700 mb-0.5">Militært</div>
                                            <p className="text-[10px] text-slate-700 leading-relaxed">{w.militaryNote}</p>
                                        </div>
                                        <div>
                                            <div className="text-[9px] font-semibold uppercase tracking-wide text-rose-700 mb-0.5">Strategisk</div>
                                            <p className="text-[10px] text-slate-700 leading-relaxed">{w.strategicNote}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
                                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                                    Begge i samme rute. Militær seier + strategisk fiasko. Samme taktikk - og begge ganger samme resultat. Militærmakt kan styrte et regime. Det kan ikke bygge et demokrati.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-5 pb-4 flex justify-end">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors"
                >
                    <RefreshCw className="w-3 h-3" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
