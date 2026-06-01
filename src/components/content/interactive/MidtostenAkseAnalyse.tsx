import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, RefreshCw, ChevronDown } from 'lucide-react';

interface MidtostenAkseAnalyseProps {
    title?: string;
}

interface Conflict {
    id: string;
    label: string;
    sunniShia: { side1: string; side2: string; dominant: 'side1' | 'side2' | 'both' | 'none' };
    arabisk: { side1: string; side2: string; dominant: 'side1' | 'side2' | 'both' | 'none' };
    olje: { side1: string; side2: string; dominant: 'side1' | 'side2' | 'both' | 'none' };
    summary: string;
}

const CONFLICTS: Conflict[] = [
    {
        id: 'saudi-iran',
        label: 'Saudi-Arabia vs. Iran',
        sunniShia: { side1: 'Saudi: Sunni', side2: 'Iran: Shia', dominant: 'side1' },
        arabisk: { side1: 'Saudi: Arabisk', side2: 'Iran: Persisk', dominant: 'side1' },
        olje: { side1: 'Saudi: Oljerik', side2: 'Iran: Oljerik', dominant: 'both' },
        summary: 'Tre ulike akser - alle peker i samme retning. Det er ikke tilfeldig at disse to er regionens store motpoler.',
    },
    {
        id: 'jemen',
        label: 'Jemen-krigen',
        sunniShia: { side1: 'Saudi (koalisjon): Sunni', side2: 'Houthi: Shia', dominant: 'side1' },
        arabisk: { side1: 'Saudi: Arabisk', side2: 'Houthi: Arabisk', dominant: 'none' },
        olje: { side1: 'Saudi: Oljerik', side2: 'Jemen: Oljefattig', dominant: 'side1' },
        summary: 'Sunni-shia og olje-ubalanse driver konflikten - men begge parter er arabiske. Ikke alle akser forklarer alt.',
    },
    {
        id: 'israel-araberne',
        label: 'Israel og arabiske naboland',
        sunniShia: { side1: 'Israel: Ikke-muslimsk', side2: 'Arabiske land: Sunni', dominant: 'none' },
        arabisk: { side1: 'Israel: Ikke-arabisk', side2: 'Arabiske naboland: Arabisk', dominant: 'side2' },
        olje: { side1: 'Israel: Lite olje', side2: 'Nabostater: Varierer', dominant: 'none' },
        summary: 'Her er det religiøs og etnisk akse som dominerer - ikke olje. Ikke alle konflikter handler om ressurser.',
    },
    {
        id: 'irak-intern',
        label: 'Irak: indre splittelse',
        sunniShia: { side1: 'Shia (flertall)', side2: 'Sunni (mindretall)', dominant: 'both' },
        arabisk: { side1: 'Arabere (sør/midtre)', side2: 'Kurdere (nord)', dominant: 'both' },
        olje: { side1: 'Oljerike sørlige shia', side2: 'Kurdisk oljeregion', dominant: 'both' },
        summary: 'Alle tre aksene er aktive - og det er grunnen til at Irak er så vanskelig a styre som én stat.',
    },
    {
        id: 'tyrkia',
        label: 'Tyrkia i regionen',
        sunniShia: { side1: 'Tyrkia: Sunni', side2: 'Konkurrenter varierer', dominant: 'none' },
        arabisk: { side1: 'Tyrkia: Ikke-arabisk', side2: 'Arabiske land', dominant: 'side2' },
        olje: { side1: 'Tyrkia: Lite olje', side2: 'Gulf-stater: Oljerike', dominant: 'side2' },
        summary: 'Tyrkia er sunni men ikke-arabisk - det gjor at arabiske land mistenker tyrkisk maktstrev til tross for felles religion.',
    },
];

const AXE_CONFIG = [
    {
        key: 'sunniShia' as const,
        label: 'Religiøs akse',
        sub: 'Sunni vs. Shia',
        color: { active: 'bg-amber-50 border-amber-300', dot: 'bg-amber-500' },
        neutralLabel: 'Ikke avgjorende her',
    },
    {
        key: 'arabisk' as const,
        label: 'Etnisk akse',
        sub: 'Arabisk vs. Ikke-arabisk',
        color: { active: 'bg-blue-50 border-blue-300', dot: 'bg-blue-500' },
        neutralLabel: 'Ikke avgjorende her',
    },
    {
        key: 'olje' as const,
        label: 'Okonomisk akse',
        sub: 'Oljerik vs. Oljefattig',
        color: { active: 'bg-emerald-50 border-emerald-300', dot: 'bg-emerald-500' },
        neutralLabel: 'Ikke avgjorende her',
    },
];

const dominantStyles: Record<string, string> = {
    side1: 'bg-rose-50 border-rose-200 text-rose-800',
    side2: 'bg-rose-50 border-rose-200 text-rose-800',
    both: 'bg-orange-50 border-orange-200 text-orange-800',
    none: 'bg-slate-50 border-slate-200 text-slate-500',
};

export function MidtostenAkseAnalyse({ title = 'Tre-akse-analysen' }: MidtostenAkseAnalyseProps) {
    const [selected, setSelected] = useState<string | null>(null);
    const [seen, setSeen] = useState<Set<string>>(new Set());

    const conflict = CONFLICTS.find((c) => c.id === selected) ?? null;
    const isComplete = seen.size >= 3;

    const handleSelect = (id: string) => {
        setSelected(id === selected ? null : id);
        setSeen((prev) => new Set([...prev, id]));
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden not-prose my-6">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
                <Target className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Velg en konflikt og se den pa tre akser</p>
                </div>
            </div>

            {/* Conflict selector */}
            <div className="p-4 flex flex-wrap gap-2">
                {CONFLICTS.map((c) => (
                    <button
                        key={c.id}
                        onClick={() => handleSelect(c.id)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                            selected === c.id
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {/* Axes display */}
            <AnimatePresence mode="wait">
                {conflict && (
                    <motion.div
                        key={conflict.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.22 }}
                        className="px-4 pb-4 space-y-2"
                    >
                        {AXE_CONFIG.map((axe, i) => {
                            const data = conflict[axe.key];
                            const isNeutral = data.dominant === 'none';
                            return (
                                <motion.div
                                    key={axe.key}
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    className={`rounded-lg border px-3 py-2.5 ${isNeutral ? 'bg-slate-50 border-slate-200' : axe.color.active}`}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isNeutral ? 'bg-slate-300' : axe.color.dot}`} />
                                        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
                                            {axe.label}
                                        </span>
                                        <span className="text-[10px] text-slate-400 ml-1">— {axe.sub}</span>
                                    </div>
                                    {isNeutral ? (
                                        <p className="text-xs text-slate-400 italic">{axe.neutralLabel}</p>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded border ${dominantStyles[data.dominant === 'both' ? 'both' : 'side1']}`}>
                                                {data.side1}
                                            </span>
                                            <span className="text-slate-300 text-xs">vs.</span>
                                            <span className={`text-xs px-2 py-1 rounded border ${dominantStyles[data.dominant === 'both' ? 'both' : 'side2']}`}>
                                                {data.side2}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}

                        {/* Summary */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2.5"
                        >
                            <p className="text-xs text-indigo-800 leading-relaxed">{conflict.summary}</p>
                        </motion.div>
                    </motion.div>
                )}

                {!conflict && (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="px-4 pb-4 text-center"
                    >
                        <div className="text-slate-400 text-xs py-3">
                            <ChevronDown className="w-4 h-4 mx-auto mb-1 opacity-40" />
                            Velg en konflikt fra listen over
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Completion */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-4 mb-3 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200"
                    >
                        <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                            Neste gang du leser en overskrift om Midtosten: spor deg gjennom de tre aksene. Du vil oppdage at svaret ofte er der allerede.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="px-4 pb-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">{seen.size} av {CONFLICTS.length} konflikter analysert</span>
                <button
                    onClick={() => { setSelected(null); setSeen(new Set()); }}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-xs transition-colors"
                >
                    <RefreshCw className="w-3 h-3" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
