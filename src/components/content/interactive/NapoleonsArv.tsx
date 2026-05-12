import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Sparkles, RotateCcw, Crown, Scroll } from 'lucide-react';

type Side = 'reform' | 'enevelde';
type Phase = 'idle' | 'sorting' | 'complete';

interface Card {
    id: string;
    text: string;
    correct: Side;
    explanation: string;
}

const CARDS: Card[] = [
    {
        id: 'code-civil',
        text: 'Code Civil (1804)',
        correct: 'reform',
        explanation: 'Lovboken ga alle borgere lik rett for loven. Den lever videre i mange land i dag.',
    },
    {
        id: 'religionsfrihet',
        text: 'Religionsfrihet for jøder og protestanter',
        correct: 'reform',
        explanation: 'Napoleon lot jøder og protestanter få samme rettigheter som katolikker.',
    },
    {
        id: 'foydalisme',
        text: 'Slutt på føydalisme i erobrede land',
        correct: 'reform',
        explanation: 'Napoleon brøt opp gamle adelsprivilegier i tysk og italiensk område.',
    },
    {
        id: 'meritokrati',
        text: 'Offiserer ble valgt på dyktighet',
        correct: 'reform',
        explanation: 'I hæren kunne en bondegutt bli general hvis han var dyktig nok. Det var nytt.',
    },
    {
        id: 'sensur',
        text: 'Streng sensur av aviser',
        correct: 'enevelde',
        explanation: 'Antall aviser i Paris ble kuttet fra 73 til 4. Bare det Napoleon godkjente fikk trykkes.',
    },
    {
        id: 'fouche',
        text: 'Hemmelig politi under Fouché',
        correct: 'enevelde',
        explanation: 'Fouchés agenter overvåket borgere, åpnet brev og rapporterte til keiseren.',
    },
    {
        id: 'kroning',
        text: 'Kroning til keiser (1804)',
        correct: 'enevelde',
        explanation: 'Han som hadde vunnet makt i revolusjonens navn, kronet seg selv til arvelig keiser.',
    },
    {
        id: 'krig',
        text: 'Krig nesten hvert år 1803–1815',
        correct: 'enevelde',
        explanation: 'Napoleon førte Europa inn i over et tiår med krig. Millioner døde.',
    },
];

export function NapoleonsArv() {
    const [phase, setPhase] = useState<Phase>('idle');
    const [pool, setPool] = useState<Card[]>(CARDS);
    const [reformSide, setReformSide] = useState<Card[]>([]);
    const [eneveldeSide, setEneveldeSide] = useState<Card[]>([]);
    const [lastFeedback, setLastFeedback] = useState<{ card: Card; correct: boolean } | null>(
        null
    );

    const tilt = useMemo(() => {
        const diff = reformSide.length - eneveldeSide.length;
        return Math.max(-12, Math.min(12, diff * 3));
    }, [reformSide.length, eneveldeSide.length]);

    const correctCount = useMemo(() => {
        const r = reformSide.filter((c) => c.correct === 'reform').length;
        const e = eneveldeSide.filter((c) => c.correct === 'enevelde').length;
        return r + e;
    }, [reformSide, eneveldeSide]);

    const place = (card: Card, side: Side) => {
        const correct = card.correct === side;
        setLastFeedback({ card, correct });
        setPool((prev) => prev.filter((c) => c.id !== card.id));
        if (side === 'reform') {
            setReformSide((prev) => [...prev, card]);
        } else {
            setEneveldeSide((prev) => [...prev, card]);
        }
        if (phase === 'idle') setPhase('sorting');
        if (pool.length === 1) {
            setTimeout(() => setPhase('complete'), 600);
        }
    };

    const reset = () => {
        setPhase('idle');
        setPool(CARDS);
        setReformSide([]);
        setEneveldeSide([]);
        setLastFeedback(null);
    };

    const score = correctCount;
    const total = CARDS.length;

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">Napoleons arv</h3>
                    <p className="text-sm text-slate-500">
                        Var Napoleon en reformator eller en enehersker? Sorter trekkene og se selv.
                    </p>
                </div>
            </div>

            <div className="p-6">
                <div className="relative h-48 mb-6 flex items-end justify-center">
                    <motion.div
                        animate={{ rotate: tilt }}
                        transition={{ type: 'spring', stiffness: 80, damping: 12 }}
                        className="absolute top-6 w-[88%] origin-center"
                        style={{ transformOrigin: 'center bottom' }}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1 flex flex-col items-center">
                                <div className="h-1.5 w-32 bg-emerald-400 rounded-full" />
                                <div className="mt-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                                    <Scroll className="w-3.5 h-3.5" /> Reform
                                </div>
                                <div className="mt-1 text-2xl font-bold text-emerald-700">
                                    {reformSide.length}
                                </div>
                            </div>
                            <div className="w-1.5 h-12 bg-slate-300 rounded-full" />
                            <div className="flex-1 flex flex-col items-center">
                                <div className="h-1.5 w-32 bg-rose-400 rounded-full" />
                                <div className="mt-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-full text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                                    <Crown className="w-3.5 h-3.5" /> Enevelde
                                </div>
                                <div className="mt-1 text-2xl font-bold text-rose-700">
                                    {eneveldeSide.length}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                    <div className="absolute bottom-0 w-3 h-24 bg-slate-400 rounded-full" />
                    <div className="absolute bottom-0 w-24 h-2 bg-slate-500 rounded" />
                </div>

                <div className="min-h-[60px] mb-5">
                    <AnimatePresence mode="wait">
                        {lastFeedback && (
                            <motion.div
                                key={lastFeedback.card.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`px-4 py-3 rounded-lg border text-sm ${
                                    lastFeedback.correct
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-amber-50 border-amber-200 text-amber-800'
                                }`}
                            >
                                <div className="font-semibold mb-0.5">
                                    {lastFeedback.correct ? 'Riktig.' : 'Ikke helt.'}{' '}
                                    {lastFeedback.card.text}
                                </div>
                                <div className="text-xs leading-relaxed opacity-90">
                                    {lastFeedback.card.explanation}
                                </div>
                            </motion.div>
                        )}
                        {!lastFeedback && phase === 'idle' && (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-500 italic"
                            >
                                Trykk på et trekk under, og velg side: Reform eller Enevelde.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {phase !== 'complete' && (
                    <div className="space-y-2">
                        {pool.map((card) => (
                            <motion.div
                                key={card.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                            >
                                <div className="flex-1 text-sm text-slate-800 font-medium">
                                    {card.text}
                                </div>
                                <button
                                    onClick={() => place(card, 'reform')}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors"
                                >
                                    Reform
                                </button>
                                <button
                                    onClick={() => place(card, 'enevelde')}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-full bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors"
                                >
                                    Enevelde
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                <AnimatePresence>
                    {phase === 'complete' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                            className="bg-gradient-to-br from-indigo-50 to-emerald-50 border border-indigo-200 rounded-xl p-5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-indigo-600" />
                                <span className="text-sm font-bold text-indigo-800">
                                    Du sorterte {score} av {total} trekk riktig.
                                </span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">
                                Vekten kan ikke balansere — fordi svaret er <em>begge deler</em>.
                                Napoleon var samtidig en av historiens største reformatorer{' '}
                                <em>og</em> en hardhendt enehersker. Han spredte revolusjonens idéer
                                gjennom diktatur. Det er nettopp dette paradokset som er hans arv.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
