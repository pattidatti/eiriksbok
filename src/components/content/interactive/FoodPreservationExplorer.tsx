import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Apple,
    Wind,
    Soup,
    Package,
    Snowflake,
    Refrigerator,
    RotateCcw,
} from 'lucide-react';

interface Method {
    label: string;
    icon: 'apple' | 'wind' | 'soup' | 'package' | 'snowflake';
    /** Hvor lenge maten holder seg, i dager (brukes til å fylle båndet). */
    days: number;
    durationLabel: string; // menneskelig tekst, f.eks. "2-3 dager"
    taste: string; // kort kommentar om smak/næring
}

interface FoodPreservationExplorerProps {
    title?: string;
    methods?: Method[];
}

const ICONS = {
    apple: Apple,
    wind: Wind,
    soup: Soup,
    package: Package,
    snowflake: Snowflake,
};

const DEFAULT_METHODS: Method[] = [
    {
        label: 'Ingen (fersk)',
        icon: 'apple',
        days: 3,
        durationLabel: '2-3 dager',
        taste: 'Smaker akkurat som naturen lagde den, men blir fort dårlig.',
    },
    {
        label: 'Tørking',
        icon: 'wind',
        days: 180,
        durationLabel: 'mange måneder',
        taste: 'Maten blir hard og seig, og må ofte legges i vann før du spiser den.',
    },
    {
        label: 'Salting',
        icon: 'soup',
        days: 150,
        durationLabel: 'en hel vinter',
        taste: 'Salt trekker ut vannet, men maten smaker sterkt av salt.',
    },
    {
        label: 'Hermetikk',
        icon: 'package',
        days: 730,
        durationLabel: 'flere år',
        taste: 'Kokes i en lukket boks og kan fraktes verden rundt, men smaken endrer seg litt.',
    },
    {
        label: 'Kjøleskap',
        icon: 'snowflake',
        days: 21,
        durationLabel: 'opptil et par uker',
        taste: 'Holder maten fersk uten å endre smaken, og lar deg spise variert hele året.',
    },
];

// Maks for båndet (i dager). Vi viser logaritmisk-aktig skala via terskler i stedet.
function fillFraction(days: number): number {
    // Myk skala: kort til lang. Klamp mellom 8% og 100%.
    const f = Math.log10(days + 1) / Math.log10(731);
    return Math.max(0.08, Math.min(1, f));
}

export function FoodPreservationExplorer({
    title = 'Hvor lenge holder maten seg?',
    methods = DEFAULT_METHODS,
}: FoodPreservationExplorerProps) {
    const [index, setIndex] = useState(0);
    const method = methods[index];
    const isFridge = method.label === 'Kjøleskap';
    const fraction = fillFraction(method.days);

    const handleReset = () => setIndex(0);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Refrigerator className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Velg en metode og se hvor lenge maten holder seg.
                    </p>
                </div>
            </div>

            {/* Metodevelger */}
            <div className="px-4 sm:px-6 pt-5">
                <div className="flex flex-wrap gap-2">
                    {methods.map((m, i) => {
                        const Icon = ICONS[m.icon];
                        const active = i === index;
                        return (
                            <button
                                key={m.label}
                                onClick={() => setIndex(i)}
                                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                {m.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Primær interaksjonsflate: ferskhets-bånd */}
            <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-2 text-xs font-medium text-slate-500">
                    <span>Fersk</span>
                    <span>Dager</span>
                    <span>Uker</span>
                    <span>Måneder</span>
                    <span>År</span>
                </div>
                <div className="relative h-8 w-full rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                        className={`absolute inset-y-0 left-0 rounded-full ${
                            isFridge
                                ? 'bg-gradient-to-r from-indigo-400 to-emerald-400'
                                : 'bg-gradient-to-r from-amber-300 to-amber-500'
                        }`}
                        animate={{ width: `${fraction * 100}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    />
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={method.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-700 drop-shadow-sm"
                        >
                            {method.durationLabel}
                        </motion.span>
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
                        <div className="flex items-baseline justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-800">
                                {method.label}
                            </span>
                            <span className="text-xs text-slate-400">
                                holder seg {method.durationLabel}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{method.taste}</p>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Innsiktsbanner ved kjøleskap */}
            <AnimatePresence>
                {isFridge && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="mx-6 mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700"
                    >
                        <Snowflake className="h-4 w-4 shrink-0" />
                        Kjøleskapet holdt maten fersk i uker uten å endre smaken - og ga oss variert
                        kost hele året.
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                    Alle metodene bremser bakteriene på hver sin måte
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
