import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Star, Trophy, RotateCcw, Sparkles } from 'lucide-react';

interface Flaw {
    id: string;
    label: string;
    fixText: string;
    // posisjon i prosent oppå bilen
    x: number;
    y: number;
}

interface KaizenVerkstedProps {
    title?: string;
}

// Lyspære-øyeblikket:
// "Japan ble rikt fordi de gjorde varene sine litt bedre, om og om igjen.
//  Mange små forbedringer (kaizen) gjorde 'Made in Japan' til verdens beste kvalitet."
//
// Eleven klikker bort én feil av gangen på en japansk bil. For hver feil som
// fikses stiger kvalitetsmåleren og en stjerne tennes. Når alle er fikset,
// går bilen fra billig kopi til verdensvare.

const FLAWS: Flaw[] = [
    { id: 'dor', label: 'Skjev dør', fixText: 'Døren passer perfekt nå. Ingen vind som plystrer inn.', x: 44, y: 46 },
    { id: 'motor', label: 'Treg motor', fixText: 'Motoren bruker mindre bensin og starter hver gang.', x: 74, y: 40 },
    { id: 'rust', label: 'Rust på panseret', fixText: 'Ny lakk og bedre stål. Bilen holder i mange år.', x: 70, y: 56 },
    { id: 'lyd', label: 'Skranglete lyd', fixText: 'Alt sitter stramt. Bilen er stille og myk å kjøre.', x: 30, y: 56 },
];

type Phase = 'fixing' | 'complete';

export function KaizenVerksted({ title = 'Kaizen-verkstedet' }: KaizenVerkstedProps) {
    const [fixed, setFixed] = useState<string[]>([]);
    const [lastFix, setLastFix] = useState<string | null>(null);

    const phase: Phase = fixed.length === FLAWS.length ? 'complete' : 'fixing';
    const quality = Math.round((fixed.length / FLAWS.length) * 100);

    const fix = (flaw: Flaw) => {
        if (fixed.includes(flaw.id)) return;
        setFixed((f) => [...f, flaw.id]);
        setLastFix(flaw.fixText);
    };

    const handleReset = () => {
        setFixed([]);
        setLastFix(null);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Wrench className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk på de røde feilene og fiks bilen, én forbedring av gangen.
                    </p>
                </div>
            </div>

            {/* Interaksjonsflate: bilen med feil-markører */}
            <div className="p-6">
                <div className="relative mx-auto max-w-md aspect-[16/9] rounded-xl bg-gradient-to-b from-sky-50 to-slate-100 border border-slate-200 overflow-hidden">
                    {/* Enkel bil bygd av former */}
                    <div className="absolute inset-0 flex items-end justify-center pb-7">
                        <motion.div
                            className="relative"
                            animate={
                                phase === 'complete'
                                    ? { y: [0, -6, 0] }
                                    : { y: 0 }
                            }
                            transition={{ duration: 0.6, repeat: phase === 'complete' ? Infinity : 0, repeatDelay: 0.6 }}
                        >
                            {/* karosseri */}
                            <div
                                className={`w-56 h-16 rounded-t-2xl rounded-b-lg transition-colors duration-500 ${
                                    phase === 'complete' ? 'bg-rose-500' : 'bg-slate-400'
                                }`}
                            />
                            {/* tak */}
                            <div
                                className={`absolute -top-7 left-12 w-28 h-10 rounded-t-xl transition-colors duration-500 ${
                                    phase === 'complete' ? 'bg-rose-400' : 'bg-slate-300'
                                }`}
                            />
                            {/* vindu */}
                            <div className="absolute -top-4 left-16 w-20 h-6 rounded bg-sky-200/80" />
                            {/* hjul */}
                            <div className="absolute -bottom-3 left-6 w-9 h-9 rounded-full bg-slate-800 border-4 border-slate-500" />
                            <div className="absolute -bottom-3 right-6 w-9 h-9 rounded-full bg-slate-800 border-4 border-slate-500" />
                        </motion.div>
                    </div>

                    {/* Feil-markører */}
                    {FLAWS.map((flaw) => {
                        const done = fixed.includes(flaw.id);
                        return (
                            <button
                                key={flaw.id}
                                onClick={() => fix(flaw)}
                                disabled={done}
                                style={{ left: `${flaw.x}%`, top: `${flaw.y}%` }}
                                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                                aria-label={done ? `${flaw.label} (fikset)` : `Fiks: ${flaw.label}`}
                            >
                                {done ? (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                                        className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white shadow"
                                    >
                                        <Sparkles className="w-4 h-4" />
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        animate={{ scale: [1, 1.25, 1] }}
                                        transition={{ duration: 1.1, repeat: Infinity }}
                                        className="block w-6 h-6 rounded-full bg-rose-500 ring-4 ring-rose-200 shadow cursor-pointer group-hover:bg-rose-600"
                                    />
                                )}
                            </button>
                        );
                    })}

                    {/* Stjerner: eksport-kvalitet */}
                    <div className="absolute top-2 right-2 flex gap-1">
                        {FLAWS.map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 transition-colors ${
                                    i < fixed.length ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Kvalitetsmåler */}
                <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 mb-1">
                        <span>Kvalitet</span>
                        <span>{quality} %</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                            className={`h-full rounded-full ${
                                phase === 'complete' ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            animate={{ width: `${quality}%` }}
                            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        />
                    </div>
                </div>
            </div>

            {/* Feedback-sone (alltid i DOM) */}
            <div className="mx-6 mb-4">
                <AnimatePresence mode="wait">
                    {phase === 'complete' ? (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 240, damping: 20 }}
                            className="flex items-start gap-2 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm"
                        >
                            <Trophy className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <span>
                                Ferdig! Bilen er feilfri. Dette er kaizen: mange små forbedringer som
                                bygger seg opp. Slik gikk "Made in Japan" fra billig kopi til verdens
                                beste kvalitet, og slik ble Japan rikt.
                            </span>
                        </motion.div>
                    ) : lastFix ? (
                        <motion.div
                            key={lastFix}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm"
                        >
                            {lastFix}
                        </motion.div>
                    ) : (
                        <div className="px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-sm">
                            Hver feil du fikser gjør bilen litt bedre. Finn alle fire.
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600">
                    {fixed.length} av {FLAWS.length} forbedringer
                </span>
                <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
