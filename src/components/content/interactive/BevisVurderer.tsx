import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Search, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface Clue {
    id: string;
    label: string; // kort tittel på sporet
    finding: string; // hva forskerne faktisk fant
}

interface BevisVurdererProps {
    title?: string;
    myth?: string; // den falske påstanden eleven skal prøve
    clues?: Clue[]; // bevisene eleven undersøker
    conclusion?: string; // sannheten som avsløres til slutt
}

const DEFAULT_CLUES: Clue[] = [
    {
        id: 'leire',
        label: 'Leirkar og redskaper',
        finding: 'Krukkene og redskapene i bakken er laget i samme stil som shona-folket i området brukte. Ingenting kom fra Middelhavet.',
    },
    {
        id: 'byggemate',
        label: 'Selve byggemåten',
        finding: 'De buede murene uten skarpe hjørner og uten mørtel er typisk afrikansk byggekunst, ikke gresk eller arabisk.',
    },
    {
        id: 'gull',
        label: 'Gull og handelsvarer',
        finding: 'Gullet kom fra lokale gruver, og glassperler viser handel med kysten. Byen var rik på egen handel.',
    },
    {
        id: 'datering',
        label: 'Alderen på stedet',
        finding: 'Forskere daterte byen til middelalderen, bygd av folk som bodde her, ikke av et forsvunnet folkeslag utenfra.',
    },
    {
        id: 'muntlig',
        label: 'Fortellingene til folket',
        finding: 'Shona-folkets egne fortellinger husket byen som sin. De visste hele tiden hvem som hadde bygget den.',
    },
];

type Phase = 'idle' | 'examining' | 'complete';

export function BevisVurderer({
    title = 'Hvem bygde Stor-Zimbabwe?',
    myth = 'Da europeere kom hit på 1800-tallet, påstod mange at afrikanere umulig kunne ha bygget en så mektig steinby. Det måtte ha vært fremmede utenfra, sa de. Undersøk sporene og se hva bevisene egentlig forteller.',
    clues = DEFAULT_CLUES,
    conclusion = 'Hvert eneste spor peker samme vei: Stor-Zimbabwe ble bygget av afrikanere selv, shona-folket. Myten om fremmede byggherrer bygde aldri på bevis. Den bygde på fordommer. Slik må vi alltid spørre: hva sier kildene, og hvem sier det?',
}: BevisVurdererProps) {
    const [examined, setExamined] = useState<string[]>([]);
    const [phase, setPhase] = useState<Phase>('idle');

    const total = clues.length;
    const count = examined.length;
    const mythStrength = Math.round(((total - count) / total) * 100);

    const examine = (id: string) => {
        if (examined.includes(id)) return;
        const next = [...examined, id];
        setExamined(next);
        setPhase(next.length >= total ? 'complete' : 'examining');
    };

    const reset = () => {
        setExamined([]);
        setPhase('idle');
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Scale className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk hvert spor for å undersøke det. Se hva bevisene egentlig forteller.
                    </p>
                </div>
            </div>

            <div className="p-6">
                {/* Myten + styrkemåler */}
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 mb-5">
                    <p className="text-sm text-amber-800 leading-snug">{myth}</p>
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-xs font-medium text-amber-700 mb-1">
                            <span>Hvor sterk står myten?</span>
                            <span>{mythStrength}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-amber-100 overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-amber-400"
                                initial={false}
                                animate={{ width: `${mythStrength}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Bevis-kort */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {clues.map((clue) => {
                        const open = examined.includes(clue.id);
                        return (
                            <motion.button
                                key={clue.id}
                                type="button"
                                onClick={() => examine(clue.id)}
                                whileHover={!open ? { scale: 1.02 } : undefined}
                                whileTap={!open ? { scale: 0.98 } : undefined}
                                animate={open ? { scale: [1, 1.04, 1] } : { scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`text-left rounded-lg border px-4 py-3 transition-colors ${
                                    open
                                        ? 'bg-emerald-50 border-emerald-200 cursor-default'
                                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    {open ? (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    ) : (
                                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                                    )}
                                    <span
                                        className={`text-sm font-semibold ${
                                            open ? 'text-emerald-800' : 'text-slate-700'
                                        }`}
                                    >
                                        {clue.label}
                                    </span>
                                </div>
                                <AnimatePresence mode="wait">
                                    {open ? (
                                        <motion.p
                                            key="finding"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="text-sm text-emerald-700 leading-snug"
                                        >
                                            {clue.finding}
                                        </motion.p>
                                    ) : (
                                        <motion.span
                                            key="hint"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-slate-400"
                                        >
                                            Undersøk sporet
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Feedback-sone */}
            <div className="px-6 pb-2">
                <AnimatePresence mode="wait">
                    {phase === 'complete' ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, y: 10, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 140, damping: 16 }}
                            className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 flex gap-3"
                        >
                            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-emerald-800 leading-snug">{conclusion}</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="progress"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700"
                        >
                            {count === 0
                                ? 'Ingen spor undersøkt ennå. Myten står uimotsagt.'
                                : `Du har undersøkt ${count} av ${total} spor. Myten svekkes for hvert bevis.`}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 pt-2 flex items-center justify-end">
                <button
                    type="button"
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
