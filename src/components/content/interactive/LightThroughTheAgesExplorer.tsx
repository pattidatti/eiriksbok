import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Lightbulb, Sun, Clock, AlertTriangle, RotateCcw } from 'lucide-react';

interface LightSource {
    label: string;
    icon: 'flame' | 'lamp' | 'gas' | 'bulb';
    brightness: number; // 0-1, hvor mye av rommet som lyses opp
    glow: string; // farge på lys-gløden
    hoursOfGoodLight: string;
    fireRisk: 'Hoy' | 'Lav';
    blurb: string;
    isElectric?: boolean;
}

const ICONS = {
    flame: Flame,
    lamp: Flame,
    gas: Flame,
    bulb: Lightbulb,
};

const DEFAULT_SOURCES: LightSource[] = [
    {
        label: 'Stearinlys',
        icon: 'flame',
        brightness: 0.18,
        glow: 'rgba(251, 191, 36, 0.55)',
        hoursOfGoodLight: 'under 1 time',
        fireRisk: 'Hoy',
        blurb: 'Et lite, flakkende lys. Du ser så vidt ansiktet til den som sitter naermest.',
    },
    {
        label: 'Parafinlampe',
        icon: 'lamp',
        brightness: 0.34,
        glow: 'rgba(251, 191, 36, 0.6)',
        hoursOfGoodLight: 'ca. 2 timer',
        fireRisk: 'Hoy',
        blurb: 'Litt sterkere, men oser og må fylles og pusses hele tiden.',
    },
    {
        label: 'Gasslys',
        icon: 'gas',
        brightness: 0.52,
        glow: 'rgba(253, 224, 71, 0.65)',
        hoursOfGoodLight: 'ca. 4 timer',
        fireRisk: 'Hoy',
        blurb: 'Gass i rør gir mer lys, men det er fortsatt en åpen flamme i veggen.',
    },
    {
        label: 'Lyspaere',
        icon: 'bulb',
        brightness: 1,
        glow: 'rgba(254, 240, 138, 0.95)',
        hoursOfGoodLight: 'hele kvelden',
        fireRisk: 'Lav',
        blurb: 'Jevnt, sterkt lys uten flamme. Hele rommet blir lyst med et trykk på bryteren.',
        isElectric: true,
    },
];

interface LightThroughTheAgesExplorerProps {
    title?: string;
    sources?: LightSource[];
}

export function LightThroughTheAgesExplorer({
    title = 'Hvor lyst ble det i stua?',
    sources = DEFAULT_SOURCES,
}: LightThroughTheAgesExplorerProps) {
    const [index, setIndex] = useState(0);
    const source = sources[index];

    const handleReset = () => setIndex(0);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg en lyskilde og se hvor mye av rommet den lyser opp.
                    </p>
                </div>
            </div>

            {/* Velger */}
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

            {/* Primaer interaksjonsflate: rommet som lyses opp */}
            <div className="px-6 py-6">
                <div className="relative mx-auto max-w-md aspect-[16/9] rounded-xl overflow-hidden bg-slate-900 border border-slate-700">
                    {/* Lys-glod som fyller rommet */}
                    <motion.div
                        className="absolute left-1/2 top-[22%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{ background: source.glow, filter: 'blur(36px)' }}
                        animate={{
                            width: `${140 + source.brightness * 520}px`,
                            height: `${140 + source.brightness * 520}px`,
                            opacity: 0.55 + source.brightness * 0.45,
                        }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    />

                    {/* Lyskilde-ikon */}
                    <div className="absolute left-1/2 top-[22%] -translate-x-1/2 -translate-y-1/2 z-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={source.label}
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.6, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                            >
                                {source.isElectric ? (
                                    <Lightbulb className="w-8 h-8 text-amber-200 drop-shadow-lg" />
                                ) : (
                                    <Flame className="w-7 h-7 text-amber-300 drop-shadow-lg" />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Mobler som silhuetter, blir tydeligere med mer lys */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-6 pb-4"
                        animate={{ opacity: 0.25 + source.brightness * 0.7 }}
                        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                    >
                        <div className="h-10 w-8 rounded-t-sm bg-slate-600" />
                        <div className="h-6 w-16 rounded-sm bg-slate-600" />
                        <div className="h-12 w-7 rounded-t-md bg-slate-600" />
                    </motion.div>
                </div>

                {/* Tallene */}
                <div className="mt-5 grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            Godt lys per kveld
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={source.label + '-h'}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mt-1 text-lg font-bold text-indigo-600"
                            >
                                {source.hoursOfGoodLight}
                            </motion.p>
                        </AnimatePresence>
                    </div>
                    <div className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Brannfare
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.p
                                key={source.label + '-r'}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mt-1 text-lg font-bold ${
                                    source.fireRisk === 'Lav'
                                        ? 'text-emerald-600'
                                        : 'text-amber-600'
                                }`}
                            >
                                {source.fireRisk}
                            </motion.p>
                        </AnimatePresence>
                    </div>
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
                        <span className="text-sm font-semibold text-slate-800">
                            {source.label}
                        </span>
                        <p className="mt-1 text-sm text-slate-600">{source.blurb}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Innsiktsbanner ved lyspaera */}
            <AnimatePresence>
                {source.isElectric && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="mx-6 mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700"
                    >
                        <Sun className="h-4 w-4 shrink-0" />
                        Plutselig var kvelden ikke lenger mørk - dagen ble lengre, og hjemmet trygt
                        fra åpen flamme.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                    Romlys: {Math.round(source.brightness * 100)} prosent
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
