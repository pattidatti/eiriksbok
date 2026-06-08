import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Home, Ship, RotateCcw, Check, X } from 'lucide-react';

// Lyspære-øyeblikk: Etter denne interaksjonen skal eleven forstå at utvandringen
// til Amerika var en fornuftig avveiing - press hjemmefra (push) og lokking fra
// Amerika (pull) veide til slutt tyngre enn alt som holdt folk igjen. Derfor dro
// over 800 000 nordmenn.
//
// Mekanikk: eleven sorterer faktorkort til riktig vektskål ("Bli hjemme" eller
// "Reis til Amerika"). Vekta tipper synlig for hvert riktig kort, og når alt er
// plassert, vipper den tungt mot Amerika.

type Side = 'bli' | 'reis';

interface Factor {
    id: string;
    label: string;
    kind: string; // forklaring som vises etter plassering
    side: Side; // riktig skål
}

const FACTORS: Factor[] = [
    { id: 'jord', label: 'Ikke nok jord hjemme', kind: 'Press hjemmefra: gårdene kunne ikke deles på alle barna.', side: 'reis' },
    { id: 'fattig', label: 'Fattigdom og uår', kind: 'Press hjemmefra: dårlige avlinger gjorde livet hardt.', side: 'reis' },
    { id: 'gratisjord', label: 'Gratis jord i Amerika', kind: 'Lokking fra Amerika: Homestead-loven fra 1862 ga jord til den som ville rydde den.', side: 'reis' },
    { id: 'arbeid', label: 'Arbeid og bedre lønn', kind: 'Lokking fra Amerika: byer og prærie trengte arbeidsfolk.', side: 'reis' },
    { id: 'brev', label: 'Brev fra slekt i Amerika', kind: 'Lokking fra Amerika: amerikabrevene fortalte om et bedre liv og sendte ofte billett.', side: 'reis' },
    { id: 'familie', label: 'Familien du forlater', kind: 'Det som holdt igjen: mange reiste fra foreldre de aldri ville se igjen.', side: 'bli' },
    { id: 'hjemstavn', label: 'Morsmål og hjembygd', kind: 'Det som holdt igjen: alt det kjente var i Norge.', side: 'bli' },
    { id: 'sjoreise', label: 'Frykt for den lange sjøreisa', kind: 'Det som holdt igjen: turen over Atlanteren var farlig og uviss.', side: 'bli' },
];

interface UtvandrerVektaProps {
    title?: string;
}

export function UtvandrerVekta({ title = 'Utvandrervekta' }: UtvandrerVektaProps) {
    const [placed, setPlaced] = useState<Record<string, Side>>({});
    const [wrongId, setWrongId] = useState<string | null>(null);
    const [lastKind, setLastKind] = useState<string | null>(null);

    const reisWeight = useMemo(
        () => Object.values(placed).filter((s) => s === 'reis').length,
        [placed]
    );
    const bliWeight = useMemo(
        () => Object.values(placed).filter((s) => s === 'bli').length,
        [placed]
    );

    const remaining = FACTORS.filter((f) => !placed[f.id]);
    const allPlaced = remaining.length === 0;

    // Positiv vinkel = Reis-skåla synker (tippet mot Amerika).
    const tilt = Math.max(-14, Math.min(14, (reisWeight - bliWeight) * 3.2));

    const place = (factor: Factor, side: Side) => {
        if (placed[factor.id]) return;
        if (side !== factor.side) {
            setWrongId(factor.id);
            setTimeout(() => setWrongId((w) => (w === factor.id ? null : w)), 600);
            return;
        }
        setPlaced((p) => ({ ...p, [factor.id]: side }));
        setLastKind(factor.kind);
    };

    const reset = () => {
        setPlaced({});
        setWrongId(null);
        setLastKind(null);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Legg hvert kort i riktig skål, og se hva som veide tyngst.
                    </p>
                </div>
            </div>

            {/* Vekta */}
            <div className="px-6 pt-5">
                <div className="relative mx-auto" style={{ maxWidth: 460, height: 150 }}>
                    {/* Søyle */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-2 h-32 bg-slate-300 rounded-full" />
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-16 h-2 bg-slate-300 rounded-full" />
                    {/* Bjelken som vipper */}
                    <motion.div
                        className="absolute left-1/2 top-3 origin-center"
                        style={{ translateX: '-50%' }}
                        animate={{ rotate: tilt }}
                        transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                    >
                        <div className="w-[380px] h-1.5 bg-slate-400 rounded-full" />
                        {/* Venstre skål: Bli hjemme */}
                        <Pan
                            align="left"
                            label="Bli hjemme"
                            icon={<Home className="w-4 h-4" />}
                            weight={bliWeight}
                            tone="amber"
                        />
                        {/* Høyre skål: Reis til Amerika */}
                        <Pan
                            align="right"
                            label="Reis til Amerika"
                            icon={<Ship className="w-4 h-4" />}
                            weight={reisWeight}
                            tone="indigo"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Kort som skal sorteres */}
            <div className="px-6 pt-2 pb-1">
                <AnimatePresence mode="popLayout">
                    {remaining.map((f) => (
                        <motion.div
                            key={f.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={
                                wrongId === f.id
                                    ? { opacity: 1, x: [0, -7, 7, -5, 5, 0] }
                                    : { opacity: 1, y: 0, x: 0 }
                            }
                            exit={{ opacity: 0, scale: 0.85 }}
                            className={`flex items-center gap-2 mb-2 rounded-xl border px-3 py-2 ${
                                wrongId === f.id
                                    ? 'bg-rose-50 border-rose-200'
                                    : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            <span className="flex-1 text-sm font-medium text-slate-700">
                                {f.label}
                            </span>
                            <button
                                onClick={() => place(f, 'bli')}
                                className="inline-flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                            >
                                <Home className="w-3.5 h-3.5" /> Bli
                            </button>
                            <button
                                onClick={() => place(f, 'reis')}
                                className="inline-flex items-center gap-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-full px-3 py-1 text-xs font-semibold transition-colors"
                            >
                                <Ship className="w-3.5 h-3.5" /> Reis
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Feedback-sone (alltid i DOM) */}
            <div className="mx-6 mb-3 min-h-[44px]">
                <AnimatePresence mode="wait">
                    {allPlaced ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
                        >
                            <Check className="w-4 h-4 flex-shrink-0" />
                            <span>
                                Reis-siden veier tyngst. Press hjemmefra og lokking fra Amerika ble
                                til slutt sterkere enn alt som holdt folk igjen. Slik dro over
                                800 000 nordmenn.
                            </span>
                        </motion.div>
                    ) : wrongId ? (
                        <motion.div
                            key="wrong"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2 px-4 py-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm"
                        >
                            <X className="w-4 h-4 flex-shrink-0" />
                            <span>Ikke helt. Tenk over: trekker dette folk hjemmefra, eller holder det dem igjen?</span>
                        </motion.div>
                    ) : lastKind ? (
                        <motion.div
                            key={lastKind}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm"
                        >
                            {lastKind}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 text-sm"
                        >
                            Velg en skål for hvert kort. Vekta forteller deg hvordan det gikk.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                    Plassert {Object.keys(placed).length} av {FACTORS.length}
                </span>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}

function Pan({
    align,
    label,
    icon,
    weight,
    tone,
}: {
    align: 'left' | 'right';
    label: string;
    icon: React.ReactNode;
    weight: number;
    tone: 'amber' | 'indigo';
}) {
    const toneClasses =
        tone === 'amber'
            ? 'bg-amber-50 border-amber-300 text-amber-800'
            : 'bg-indigo-50 border-indigo-300 text-indigo-800';
    return (
        <div
            className="absolute top-1.5 flex flex-col items-center"
            style={align === 'left' ? { left: 8 } : { right: 8 }}
        >
            {/* Snor */}
            <div className="w-px h-6 bg-slate-300" />
            <div
                className={`flex flex-col items-center gap-0.5 rounded-xl border px-3 py-2 shadow-sm ${toneClasses}`}
            >
                <span className="flex items-center gap-1 text-[11px] font-bold">
                    {icon}
                    {label}
                </span>
                <span className="text-lg font-extrabold tabular-nums leading-none">{weight}</span>
            </div>
        </div>
    );
}
