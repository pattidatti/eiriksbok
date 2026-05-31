import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Wheat, RefreshCw, FlaskConical, Tractor, Leaf, User, RotateCcw } from 'lucide-react';

interface Era {
    label: string;
    year: string;
    icon: 'sprout' | 'wheat' | 'rotate' | 'flask' | 'tractor' | 'leaf';
    farmers: number; // antall av 10 som måtte være bønder
    farmersLabel?: string; // overstyrer tekst (f.eks. "under 2 av 100")
    blurb: string;
}

interface FarmerYieldExplorerProps {
    title?: string;
    eras?: Era[];
}

const ICONS = {
    sprout: Sprout,
    wheat: Wheat,
    rotate: RefreshCw,
    flask: FlaskConical,
    tractor: Tractor,
    leaf: Leaf,
};

const DEFAULT_ERAS: Era[] = [
    {
        label: 'Tidlig jordbruk',
        year: 'før år 900',
        icon: 'sprout',
        farmers: 9,
        blurb: 'Med enkle redskaper måtte nesten alle dyrke jorda for å overleve.',
    },
    {
        label: 'Den tunge plogen',
        year: 'ca. år 900',
        icon: 'wheat',
        farmers: 8,
        blurb: 'Ny, rik jord kunne dyrkes, og hver bonde fødde litt flere munner.',
    },
    {
        label: 'Vekselbruk',
        year: '1700-tallet',
        icon: 'rotate',
        farmers: 6,
        blurb: 'Ingen åker lå tom lenger. Det samme arealet ga mye mer mat.',
    },
    {
        label: 'Kunstgjødsel',
        year: 'fra 1909',
        icon: 'flask',
        farmers: 3,
        blurb: 'Næring hentet fra lufta fikk avlingene til å skyte i været.',
    },
    {
        label: 'Traktor og maskiner',
        year: '1900-tallet',
        icon: 'tractor',
        farmers: 1,
        blurb: 'Én person med maskin gjorde arbeidet som før krevde en hel landsby.',
    },
    {
        label: 'I dag',
        year: 'den grønne revolusjonen',
        icon: 'leaf',
        farmers: 0,
        farmersLabel: 'under 2 av 100',
        blurb: 'Nesten ingen dyrker maten. Resten av oss er frie til alt annet.',
    },
];

export function FarmerYieldExplorer({
    title = 'Hvor mange kan én bonde fø?',
    eras = DEFAULT_ERAS,
}: FarmerYieldExplorerProps) {
    const [index, setIndex] = useState(0);
    const era = eras[index];
    const isLast = index === eras.length - 1;
    const freed = 10 - era.farmers;

    const handleReset = () => setIndex(0);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Wheat className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk deg gjennom tidene og se hvor mange som måtte være bønder.
                    </p>
                </div>
            </div>

            {/* Tidsvelger */}
            <div className="px-4 sm:px-6 pt-5">
                <div className="flex flex-wrap gap-2">
                    {eras.map((e, i) => {
                        const Icon = ICONS[e.icon];
                        const active = i === index;
                        return (
                            <button
                                key={e.label}
                                onClick={() => setIndex(i)}
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {e.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Primær interaksjonsflate: 10 personer */}
            <div className="px-6 py-6">
                <div className="grid grid-cols-5 gap-3 sm:gap-4 max-w-md mx-auto">
                    {Array.from({ length: 10 }).map((_, i) => {
                        const isFarmer = i < era.farmers;
                        return (
                            <motion.div
                                key={i}
                                className="flex justify-center"
                                animate={{ scale: [0.8, 1] }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 18,
                                    delay: i * 0.03,
                                }}
                            >
                                <motion.div
                                    layout
                                    className={`flex h-11 w-11 items-center justify-center rounded-full ${
                                        isFarmer
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-indigo-100 text-indigo-600'
                                    }`}
                                    animate={{
                                        backgroundColor: isFarmer ? '#fef3c7' : '#e0e7ff',
                                        color: isFarmer ? '#b45309' : '#4f46e5',
                                    }}
                                >
                                    {isFarmer ? (
                                        <Wheat className="h-5 w-5" />
                                    ) : (
                                        <User className="h-5 w-5" />
                                    )}
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Forklaring av fargene */}
                <div className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded-full bg-amber-200" />
                        Måtte dyrke mat
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="inline-block h-3 w-3 rounded-full bg-indigo-200" />
                        Frie til alt annet
                    </span>
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
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-800">
                                {era.label}
                            </span>
                            <span className="text-xs text-slate-400">{era.year}</span>
                        </div>
                        <p className="mt-1 text-2xl font-bold text-amber-600">
                            {era.farmersLabel ?? `${era.farmers} av 10`}{' '}
                            <span className="text-sm font-medium text-slate-500">
                                måtte være bønder
                            </span>
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{era.blurb}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Suksess-banner ved siste steg */}
            <AnimatePresence>
                {isLast && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="mx-6 mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700"
                    >
                        <Leaf className="h-4 w-4 shrink-0" />
                        Fra ni av ti til nesten ingen. Det er derfor du kan gå på skole i stedet for
                        å pløye.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                    {freed} av 10 var frie til andre yrker
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
