import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wheat, Sprout, Globe2, ArrowRight, RotateCcw, CheckCircle2 } from 'lucide-react';

interface ParallelleSivilisasjonerProps {
    title?: string;
}

// Lyspære-øyeblikk: Etter denne interaksjonen forstår eleven at sivilisasjon
// vokste fram HELT FOR SEG SELV i Amerika. De samme fem stegene — fra å temme
// en kornplante til å bygge storriker — skjedde to ganger, i to verdener som
// aldri møtte hverandre. Veien fra åker til by er et felles menneskelig mønster.

interface Stage {
    step: string;
    old: string;
    ame: string;
}

const STAGES: Stage[] = [
    {
        step: 'Folk temmer en kornplante',
        old: 'Hvete og bygg i Midtøsten',
        ame: 'Mais i Mexico, poteter i Andes',
    },
    {
        step: 'Overskudd av mat samler folk',
        old: 'Landsbyer som Jeriko vokser fram',
        ame: 'Maislandsbyer sprer seg',
    },
    {
        step: 'Byer og store tempelpyramider',
        old: 'Ur i Mesopotamia, pyramidene i Giza',
        ame: 'Teotihuacán og de store mayabyene',
    },
    {
        step: 'Skrift, tall og kalender',
        old: 'Kileskrift og egyptiske hieroglyfer',
        ame: 'Maya-glyfer og et eget tegn for null',
    },
    {
        step: 'Mektige storriker',
        old: 'Egypt og Romerriket',
        ame: 'Aztekerriket og Inkariket',
    },
];

export function ParallelleSivilisasjoner({
    title = 'Samme vei — to verdener',
}: ParallelleSivilisasjonerProps) {
    const [revealed, setRevealed] = useState(0);
    const done = revealed >= STAGES.length;

    const next = () => setRevealed((r) => Math.min(r + 1, STAGES.length));
    const reset = () => setRevealed(0);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Globe2 className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk «Neste steg» og se hvordan de samme stegene skjedde i begge
                        verdener.
                    </p>
                </div>
            </div>

            {/* Kolonneoverskrifter */}
            <div className="px-4 sm:px-6 pt-5 grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 items-center">
                <div className="flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-lg py-2 text-amber-800">
                    <Wheat className="w-4 h-4" />
                    <span className="text-sm font-semibold">Den gamle verden</span>
                </div>
                <div className="w-10" />
                <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg py-2 text-emerald-800">
                    <Sprout className="w-4 h-4" />
                    <span className="text-sm font-semibold">Amerika</span>
                </div>
            </div>

            {/* Stegene */}
            <div className="px-4 sm:px-6 py-4 space-y-2">
                {STAGES.map((s, i) => {
                    const shown = i < revealed;
                    return (
                        <div
                            key={i}
                            className="grid grid-cols-[1fr_auto_1fr] gap-2 sm:gap-3 items-stretch"
                        >
                            {/* Gamle verden */}
                            <AnimatePresence>
                                {shown ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: -24 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                                        className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-amber-900 flex items-center"
                                    >
                                        {s.old}
                                    </motion.div>
                                ) : (
                                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg" />
                                )}
                            </AnimatePresence>

                            {/* Steg-merke i midten */}
                            <div
                                className={`w-10 h-10 self-center rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                    shown
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-100 text-slate-400'
                                }`}
                            >
                                {i + 1}
                            </div>

                            {/* Amerika */}
                            <AnimatePresence>
                                {shown ? (
                                    <motion.div
                                        initial={{ opacity: 0, x: 24 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                                        className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs sm:text-sm text-emerald-900 flex items-center"
                                    >
                                        {s.ame}
                                    </motion.div>
                                ) : (
                                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-lg" />
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Steg-tekst / feedback-sone (alltid til stede) */}
            <div className="px-4 sm:px-6">
                <div className="min-h-[3rem] flex items-center">
                    <AnimatePresence mode="wait">
                        {done ? (
                            <motion.div
                                key="done"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 240, damping: 18 }}
                                className="w-full px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                <span>
                                    To verdener som aldri møttes — likevel gikk de samme fem stegene.
                                    Sivilisasjon er ikke noe som spredte seg fra ett sted. Den vokste
                                    fram på egen hånd i Amerika, bygget på mais og poteter i stedet
                                    for hvete.
                                </span>
                            </motion.div>
                        ) : revealed === 0 ? (
                            <motion.p
                                key="start"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm text-slate-400"
                            >
                                Trykk «Neste steg» for å begynne reisen fra åker til storrike.
                            </motion.p>
                        ) : (
                            <motion.p
                                key={revealed}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="text-sm text-slate-600"
                            >
                                <span className="font-semibold text-indigo-700">
                                    Steg {revealed}:
                                </span>{' '}
                                {STAGES[revealed - 1].step}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Kontrollrad */}
            <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                <button
                    onClick={next}
                    disabled={done}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                >
                    Neste steg
                    <ArrowRight className="w-4 h-4" />
                </button>
                <button
                    onClick={reset}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Start på nytt
                </button>
            </div>
        </div>
    );
}
