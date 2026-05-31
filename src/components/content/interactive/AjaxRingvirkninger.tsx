import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Eye, Flame, Lock, Swords, ChevronRight, RotateCcw } from 'lucide-react';

interface AjaxRingvirkningerProps {
    title?: string;
}

interface Domino {
    icon: typeof Crown;
    year: string;
    short: string; // tekst på selve brikken
    headline: string;
    text: string;
    win: boolean; // true = gevinst for vesten, false = bakslag
}

const DOMINOES: Domino[] = [
    {
        icon: Crown,
        year: '1953',
        short: 'Kuppet',
        headline: 'Kuppet lykkes',
        text: 'CIA og britisk etterretning velter statsminister Mossadeq. Sjahen får tilbake all makt, og oljen flyter igjen til vestlige selskaper.',
        win: true,
    },
    {
        icon: Eye,
        year: '1953-79',
        short: 'Sjahens jerngrep',
        headline: 'Et hatet diktatur vokser frem',
        text: 'Sjahen styrer hardt. Det hemmelige politiet SAVAK fengsler og torturerer motstandere. Folket begynner å hate både sjahen og USA, som holder ham ved makten.',
        win: true,
    },
    {
        icon: Flame,
        year: '1979',
        short: 'Revolusjonen',
        headline: 'Alt snur',
        text: 'Folket gjør opprør. Sjahen flykter, og presteskapet under ayatolla Khomeini tar makten. Iran går fra vestvennlig til USAs erklærte fiende - over natten.',
        win: false,
    },
    {
        icon: Lock,
        year: '1979-81',
        short: 'Gisselkrisen',
        headline: '444 dager med gisler',
        text: 'Sinte studenter stormer USAs ambassade i Teheran og holder 52 amerikanere som gisler i nesten 15 måneder. Hele verden ser på.',
        win: false,
    },
    {
        icon: Swords,
        year: 'I dag',
        short: 'Fiendskap',
        headline: 'Arven etter Ajax',
        text: 'Iran og USA er fortsatt bitre fiender. Kuppet i 1953 er en viktig grunn til at iranere flest ikke stoler på Vesten. Seieren ble en bumerang.',
        win: false,
    },
];

export function AjaxRingvirkninger({
    title = 'Velt den første brikken: ringvirkningene av kuppet',
}: AjaxRingvirkningerProps) {
    // antall brikker som er veltet (0 = ingen). Siste synlige detalj = toppled - 1.
    const [toppled, setToppled] = useState(0);
    const atEnd = toppled >= DOMINOES.length;
    const current = toppled > 0 ? DOMINOES[toppled - 1] : null;

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-1 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mb-5 text-sm text-slate-500">
                USA vant i 1953. Men hver seier dyttet til neste brikke. Velt dem og se hvor det endte.
            </p>

            {/* Domino-rekken */}
            <div className="mb-5 flex items-end justify-between gap-1.5">
                {DOMINOES.map((d, i) => {
                    const isToppled = i < toppled;
                    const Icon = d.icon;
                    return (
                        <div key={i} className="flex flex-1 flex-col items-center">
                            <motion.div
                                initial={false}
                                animate={{
                                    rotate: isToppled ? 10 : 0,
                                    y: isToppled ? 4 : 0,
                                }}
                                transition={{ type: 'spring', stiffness: 180, damping: 12 }}
                                className={`flex h-16 w-full flex-col items-center justify-center rounded-lg border-2 px-1 text-center ${
                                    isToppled
                                        ? d.win
                                            ? 'border-emerald-300 bg-emerald-50'
                                            : 'border-rose-300 bg-rose-50'
                                        : 'border-slate-200 bg-slate-50'
                                }`}
                            >
                                <Icon
                                    className={`h-4 w-4 ${
                                        isToppled
                                            ? d.win
                                                ? 'text-emerald-600'
                                                : 'text-rose-600'
                                            : 'text-slate-300'
                                    }`}
                                />
                                <span
                                    className={`mt-1 text-[10px] font-bold leading-tight ${
                                        isToppled ? 'text-slate-700' : 'text-slate-400'
                                    }`}
                                >
                                    {d.year}
                                </span>
                            </motion.div>
                            <span className="mt-1.5 text-[10px] leading-tight text-slate-400">
                                {d.short}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Detaljkort */}
            <div className="min-h-[132px]">
                <AnimatePresence mode="wait">
                    {current ? (
                        <motion.div
                            key={toppled}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.25 }}
                            className={`rounded-lg p-4 ${current.win ? 'bg-emerald-50' : 'bg-rose-50'}`}
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <span
                                    className={`flex items-center gap-2 text-base font-bold ${
                                        current.win ? 'text-emerald-700' : 'text-rose-700'
                                    }`}
                                >
                                    <current.icon className="h-5 w-5" /> {current.headline}
                                </span>
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                                        current.win
                                            ? 'bg-emerald-200 text-emerald-800'
                                            : 'bg-rose-200 text-rose-800'
                                    }`}
                                >
                                    {current.win ? 'Gevinst for vesten' : 'Bakslag'}
                                </span>
                            </div>
                            <p className="text-sm leading-relaxed text-slate-700">{current.text}</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex h-[132px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-400"
                        >
                            Trykk på knappen for å velte den første brikken: kuppet i 1953.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Knapperad */}
            <div className="mt-5 flex items-center justify-between">
                <button
                    onClick={() => setToppled(0)}
                    className="flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-600"
                >
                    <RotateCcw className="h-4 w-4" /> Start på nytt
                </button>
                {!atEnd ? (
                    <button
                        onClick={() => setToppled((t) => t + 1)}
                        className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-rose-700"
                    >
                        {toppled === 0 ? 'Velt den første brikken' : 'Velt neste brikke'}
                        <ChevronRight className="h-4 w-4" />
                    </button>
                ) : (
                    <motion.span
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    >
                        Seieren i 1953 ble til fiendskap for alltid.
                    </motion.span>
                )}
            </div>
        </div>
    );
}
