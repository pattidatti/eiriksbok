import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hand, Waves, Wind, Cog, Users, RotateCcw, Sparkles } from 'lucide-react';

interface Source {
    label: string;
    icon: 'hand' | 'waves' | 'wind';
    sacks: number; // sekker korn malt per dag
    workers: number; // hvor mange personers arbeid den erstatter
    rotationSeconds: number; // hvor mange sekunder hjulet bruker på én runde (lavere = raskere)
    blurb: string;
    muscle: boolean; // bruker den muskelkraft?
}

interface MillPowerExplorerProps {
    title?: string;
    sources?: Source[];
}

const ICONS = {
    hand: Hand,
    waves: Waves,
    wind: Wind,
};

const DEFAULT_SOURCES: Source[] = [
    {
        label: 'Håndkvern',
        icon: 'hand',
        sacks: 1,
        workers: 1,
        rotationSeconds: 6,
        blurb: 'En person sveiver runde etter runde. Tunge armer, lite mel.',
        muscle: true,
    },
    {
        label: 'Vannmølle',
        icon: 'waves',
        sacks: 40,
        workers: 40,
        rotationSeconds: 1.5,
        blurb: 'Elva driver hjulet hele døgnet, uten å bli sliten.',
        muscle: false,
    },
    {
        label: 'Vindmølle',
        icon: 'wind',
        sacks: 25,
        workers: 25,
        rotationSeconds: 2,
        blurb: 'Vinden tar over arbeidet der det ikke renner en elv.',
        muscle: false,
    },
];

export function MillPowerExplorer({
    title = 'Hvem maler kornet?',
    sources = DEFAULT_SOURCES,
}: MillPowerExplorerProps) {
    const [index, setIndex] = useState(0);
    const source = sources[index];
    const isMill = !source.muscle;

    const handleReset = () => setIndex(0);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Cog className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg en kraftkilde og se hvor mye korn den kan male på én dag.
                    </p>
                </div>
            </div>

            {/* Kildevelger */}
            <div className="px-4 sm:px-6 pt-5">
                <div className="flex flex-wrap gap-2">
                    {sources.map((s, i) => {
                        const Icon = ICONS[s.icon];
                        const active = i === index;
                        return (
                            <button
                                key={s.label}
                                onClick={() => setIndex(i)}
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {s.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Primær interaksjonsflate: det roterende hjulet */}
            <div className="px-6 py-6 flex flex-col items-center">
                <div className="relative flex h-40 w-40 items-center justify-center">
                    <motion.div
                        className={`flex h-36 w-36 items-center justify-center rounded-full border-8 ${
                            isMill
                                ? 'border-indigo-200 text-indigo-500'
                                : 'border-amber-200 text-amber-600'
                        }`}
                        animate={{ rotate: 360 }}
                        transition={{
                            repeat: Infinity,
                            ease: 'linear',
                            duration: source.rotationSeconds,
                        }}
                    >
                        <Cog className="h-20 w-20" strokeWidth={1.25} />
                    </motion.div>
                </div>

                {/* Tall: sekker og erstattet arbeid */}
                <div className="mt-2 grid w-full max-w-md grid-cols-2 gap-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`sacks-${index}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                            className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-center"
                        >
                            <p className="text-3xl font-bold text-indigo-600">{source.sacks}</p>
                            <p className="mt-0.5 text-xs text-slate-500">sekker korn per dag</p>
                        </motion.div>
                    </AnimatePresence>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`workers-${index}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                            className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3 text-center"
                        >
                            <p className="flex items-center justify-center gap-1.5 text-3xl font-bold text-amber-600">
                                <Users className="h-6 w-6" />
                                {source.workers}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                                {source.workers === 1
                                    ? 'person i arbeid'
                                    : 'personers arbeid erstattet'}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Feedback-sone (alltid til stede) */}
            <div className="mx-6 mb-2">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3"
                    >
                        <p className="text-sm font-semibold text-slate-800">{source.label}</p>
                        <p className="mt-1 text-sm text-slate-600">{source.blurb}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Innsikts-banner ved vann- eller vindmølle */}
            <AnimatePresence>
                {isMill && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="mx-6 mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700"
                    >
                        <Sparkles className="h-4 w-4 shrink-0" />
                        Dette var den første kraften som ikke kom fra muskler.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                    {source.muscle
                        ? 'Kraften kommer fra et menneske'
                        : 'Kraften kommer fra naturen, ikke fra muskler'}
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
