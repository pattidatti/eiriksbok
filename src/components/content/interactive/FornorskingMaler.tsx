import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';

interface Era {
    year: string;
    title: string;
    text: string;
    value: number; // 0-100: hvor levende samisk språk og kultur er
}

interface FornorskingMalerProps {
    title?: string;
    eras?: Era[];
}

const DEFAULT_ERAS: Era[] = [
    {
        year: 'Før 1850',
        title: 'Samisk lever fritt',
        text: 'Samisk språk, joik og levesett er en naturlig del av livet i hele Sápmi.',
        value: 100,
    },
    {
        year: '1851',
        title: 'Finnefondet',
        text: 'Staten setter av egne penger for å lære samiske barn norsk. Fornorskinga har begynt.',
        value: 88,
    },
    {
        year: '1898',
        title: 'Wexelsen-plakaten',
        text: 'Nå blir det forbudt å bruke samisk i skolen. Lærerne skal bare snakke norsk med barna.',
        value: 60,
    },
    {
        year: '1900–1950',
        title: 'Internatskolene',
        text: 'Samiske barn bor på internat, langt fra familien. De får ikke lov til å snakke morsmålet sitt.',
        value: 28,
    },
    {
        year: '1959',
        title: 'Forbudet mykes opp',
        text: 'Skolen får igjen lov til å bruke samisk. Men mange har allerede mistet språket.',
        value: 32,
    },
    {
        year: '1989',
        title: 'Sametinget åpner',
        text: 'Samene får sitt eget folkevalgte ting og rett til å ta vare på egen kultur.',
        value: 58,
    },
    {
        year: '2023',
        title: 'Sannhet og forsoning',
        text: 'Norge sier offentlig unnskyld for fornorskinga. Samisk språk vokser sakte tilbake.',
        value: 72,
    },
];

function colorFor(value: number): string {
    if (value >= 70) return '#10b981'; // emerald
    if (value >= 45) return '#f59e0b'; // amber
    return '#f43f5e'; // rose
}

export function FornorskingMaler({
    title = 'Måleren for samisk språk og kultur',
    eras = DEFAULT_ERAS,
}: FornorskingMalerProps) {
    const [step, setStep] = useState(0);
    const era = eras[step];
    const atEnd = step >= eras.length - 1;
    const barColor = colorFor(era.value);

    const next = () => {
        if (!atEnd) setStep((s) => s + 1);
    };
    const reset = () => setStep(0);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <TrendingDown className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk «Neste» og følg hva som skjedde med samisk språk gjennom tida.
                    </p>
                </div>
            </div>

            {/* Måleren */}
            <div className="px-6 pt-6">
                <div className="flex items-end justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">
                        Levende samisk språk og kultur
                    </span>
                    <motion.span
                        key={era.value}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl font-bold tabular-nums"
                        style={{ color: barColor }}
                    >
                        {era.value}%
                    </motion.span>
                </div>
                <div className="h-6 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        animate={{
                            width: `${era.value}%`,
                            backgroundColor: barColor,
                        }}
                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    />
                </div>
            </div>

            {/* Tidslinje-prikker */}
            <div className="px-6 pt-5">
                <div className="flex items-center justify-between">
                    {eras.map((e, i) => (
                        <div key={e.year} className="flex flex-col items-center flex-1">
                            <motion.div
                                className="w-3 h-3 rounded-full"
                                animate={{
                                    backgroundColor: i <= step ? colorFor(e.value) : '#cbd5e1',
                                    scale: i === step ? 1.5 : 1,
                                }}
                            />
                            <span
                                className={`mt-1 text-[10px] leading-tight text-center ${
                                    i === step ? 'text-slate-700 font-semibold' : 'text-slate-400'
                                }`}
                            >
                                {e.year}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Forklaringskort */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.25 }}
                    className="mx-6 my-5 px-4 py-3 rounded-lg border"
                    style={{
                        backgroundColor: `${barColor}14`,
                        borderColor: `${barColor}44`,
                    }}
                >
                    <p className="text-sm font-bold text-slate-800">
                        {era.year}: {era.title}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">{era.text}</p>
                </motion.div>
            </AnimatePresence>

            {/* Sluttmelding */}
            <AnimatePresence>
                {atEnd && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2"
                    >
                        <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                            Se på kurven: en bevisst politikk dyttet et helt språk nesten ned til
                            null på hundre år. Men de siste tiåra har samene fått rettighetene og
                            språket sitt tilbake, bit for bit.
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <button
                    onClick={next}
                    disabled={atEnd}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full px-6 py-2 text-sm font-medium transition-colors flex items-center gap-1.5"
                >
                    {atEnd ? 'Ferdig' : 'Neste'}
                    {!atEnd && <ChevronRight className="w-4 h-4" />}
                </button>
                <button
                    onClick={reset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors flex items-center gap-1"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
