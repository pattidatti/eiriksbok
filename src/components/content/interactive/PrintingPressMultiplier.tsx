import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Feather, Printer, Clock, Coins, RotateCcw, Sparkles } from 'lucide-react';

interface PrintingPressMultiplierProps {
    title?: string;
}

// Grove, men pedagogisk ærlige anslag.
// Munk: ca. 1 bok per 8 måneder (240 dager/bok). Presse: ca. 1 dag oppsett + rask trykking.
const MONK_DAYS_PER_BOOK = 240;
// Munk: en bok koster som materialer + et halvt års arbeid. Vi bruker en forenklet "daler"-enhet.
const MONK_COST_PER_BOOK = 600;

// Presse: ett oppsett (sette typene) deler vi på antall bøker, pluss litt trykketid per bok.
const PRESS_SETUP_DAYS = 1;
const PRESS_DAYS_PER_BOOK = 0.04; // ca. 25 bøker om dagen når typene er satt
const PRESS_SETUP_COST = 500; // dyrt oppsett, men deles på alle bøkene
const PRESS_COST_PER_BOOK = 4; // billig papir og blekk per bok

const BOOK_STEPS = [1, 10, 50, 100, 250, 500, 1000];

function formatDuration(days: number): string {
    if (days < 1) return 'under én dag';
    if (days < 14) {
        const d = Math.round(days);
        return d === 1 ? '1 dag' : `${d} dager`;
    }
    if (days < 60) {
        const weeks = Math.round(days / 7);
        return `${weeks} uker`;
    }
    if (days < 365) {
        const months = Math.round(days / 30);
        return `${months} måneder`;
    }
    const years = days / 365;
    const rounded = Math.round(years * 10) / 10;
    return rounded === 1 ? '1 år' : `${rounded} år`;
}

function formatCost(cost: number): string {
    if (cost >= 1000) {
        const k = Math.round((cost / 1000) * 10) / 10;
        return `${k} 000 daler`;
    }
    return `${Math.round(cost)} daler`;
}

// Antall bok-ikoner i en stabel, begrenset slik at det ser pent ut på 1366x768.
function stackCount(books: number): number {
    if (books <= 10) return books;
    if (books <= 50) return 10;
    if (books <= 250) return 14;
    return 18;
}

export function PrintingPressMultiplier({
    title = 'Munk eller presse: hvor lang tid og hvor dyrt?',
}: PrintingPressMultiplierProps) {
    const [stepIndex, setStepIndex] = useState(2); // start på 50 bøker
    const books = BOOK_STEPS[stepIndex];

    const monkDays = books * MONK_DAYS_PER_BOOK;
    const monkCostPerBook = MONK_COST_PER_BOOK;

    const pressDays = PRESS_SETUP_DAYS + books * PRESS_DAYS_PER_BOOK;
    const pressCostPerBook = PRESS_SETUP_COST / books + PRESS_COST_PER_BOOK;

    const cheaper = Math.round(monkCostPerBook / pressCostPerBook);
    const showInsight = books >= 100;

    const handleReset = () => setStepIndex(2);

    const monkStack = stackCount(Math.min(books, 1)); // munken rekker i praksis nesten ingen
    const pressStack = stackCount(books);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Printer className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Dra i glideren og se hvor mye tid og penger pressa sparer.
                    </p>
                </div>
            </div>

            {/* Glider */}
            <div className="px-6 pt-6">
                <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-slate-600">Antall bøker</span>
                    <span className="text-2xl font-bold text-indigo-600">
                        {books === 1 ? '1 bok' : `${books} bøker`}
                    </span>
                </div>
                <input
                    type="range"
                    min={0}
                    max={BOOK_STEPS.length - 1}
                    step={1}
                    value={stepIndex}
                    onChange={(e) => setStepIndex(Number(e.target.value))}
                    className="mt-3 w-full accent-indigo-600 cursor-pointer"
                    aria-label="Antall bøker"
                />
                <div className="mt-1 flex justify-between text-xs text-slate-400">
                    <span>1</span>
                    <span>1000</span>
                </div>
            </div>

            {/* To kolonner */}
            <div className="px-6 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Munk */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 flex flex-col">
                    <div className="flex items-center gap-2 text-amber-700">
                        <Feather className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-semibold">Munk skriver for hånd</span>
                    </div>

                    {/* Bokstabel */}
                    <div className="mt-4 flex min-h-[64px] flex-wrap content-end gap-1">
                        {Array.from({ length: monkStack }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 420,
                                    damping: 16,
                                    delay: i * 0.04,
                                }}
                            >
                                <BookOpen className="w-5 h-5 text-amber-500" />
                            </motion.div>
                        ))}
                        {books > 1 && (
                            <span className="self-end text-xs text-amber-600/80 ml-1">
                                rekker knapt {books === 1 ? 'denne' : 'én'}
                            </span>
                        )}
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Tid:</span>
                            <span className="font-semibold text-slate-800">
                                {formatDuration(monkDays)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Pris per bok:</span>
                            <span className="font-semibold text-slate-800">
                                {formatCost(monkCostPerBook)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Presse */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 flex flex-col">
                    <div className="flex items-center gap-2 text-emerald-700">
                        <Printer className="w-4 h-4 shrink-0" />
                        <span className="text-sm font-semibold">Trykkpresse</span>
                    </div>

                    {/* Bokstabel */}
                    <div className="mt-4 flex min-h-[64px] flex-wrap content-end gap-1">
                        {Array.from({ length: pressStack }).map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 420,
                                    damping: 16,
                                    delay: i * 0.03,
                                }}
                            >
                                <BookOpen className="w-5 h-5 text-emerald-500" />
                            </motion.div>
                        ))}
                        {books > pressStack && (
                            <span className="self-end text-xs text-emerald-600/80 ml-1">
                                + mange flere
                            </span>
                        )}
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Tid:</span>
                            <span className="font-semibold text-slate-800">
                                {formatDuration(pressDays)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Coins className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span>Pris per bok:</span>
                            <span className="font-semibold text-slate-800">
                                {formatCost(pressCostPerBook)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Innsiktsbanner */}
            <AnimatePresence>
                {showInsight && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="mx-6 mb-4 flex items-start gap-2 rounded-lg bg-indigo-50 border border-indigo-200 px-4 py-3 text-sm text-indigo-800"
                    >
                        <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-indigo-500" />
                        <span>
                            Det en munk brukte år på, klarte pressa på noen dager - og hver bok ble
                            rundt {cheaper} ganger billigere. Slik ble en bok noe vanlige folk hadde
                            råd til.
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                    Tallene er forenklede anslag for å vise forskjellen.
                </div>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
