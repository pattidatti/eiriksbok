import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Sun, Wheat, Pickaxe } from 'lucide-react';

interface NilenFlomSyklusProps {
    title?: string;
}

type SeasonId = 'akhet' | 'peret' | 'shemu';

interface Season {
    id: SeasonId;
    name: string;
    egyptisk: string;
    months: string;
    waterLevel: number;
    fieldColor: string;
    skyFrom: string;
    skyTo: string;
    icon: typeof Waves;
    activity: string;
    description: string;
    color: string;
}

const SEASONS: Season[] = [
    {
        id: 'akhet',
        name: 'Flomtid',
        egyptisk: 'Akhet',
        months: 'juli – oktober',
        waterLevel: 80,
        fieldColor: '#60a5fa',
        skyFrom: '#bae6fd',
        skyTo: '#dbeafe',
        icon: Waves,
        activity: 'Bygger pyramider for faraoen',
        description:
            'Nilen flommer over og dekker markene med næringsrikt, mørkt slam fra Etiopia. Bønder kan ikke dyrke jorda nå, så faraoen setter dem til å bygge templer, kanaler og pyramider. Slammet som blir igjen, gjør jorda klar for neste sesong.',
        color: 'bg-blue-50 border-blue-200 text-blue-800',
    },
    {
        id: 'peret',
        name: 'Såtid',
        egyptisk: 'Peret',
        months: 'november – februar',
        waterLevel: 25,
        fieldColor: '#86efac',
        skyFrom: '#fef9c3',
        skyTo: '#fef3c7',
        icon: Wheat,
        activity: 'Pløyer og sår korn',
        description:
            'Vannet trekker seg tilbake. Bøndene pløyer den våte, fete jorda og sår hvete og bygg. Plantene spirer raskt i den næringsrike jorda. Nå går familien tilbake til markene fra solrenning til solnedgang.',
        color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    },
    {
        id: 'shemu',
        name: 'Innhøstingstid',
        egyptisk: 'Shemu',
        months: 'mars – juni',
        waterLevel: 10,
        fieldColor: '#facc15',
        skyFrom: '#fef08a',
        skyTo: '#fde047',
        icon: Sun,
        activity: 'Skjærer korn og fyller kornlagrene',
        description:
            'Solen brenner. Markene står gylne. Bøndene høster kornet og bærer det til faraoens store kornlagre. Skattefogden måler hvor mye hver familie skal gi. Når det er gjort, venter alle på at Nilen skal stige igjen.',
        color: 'bg-amber-50 border-amber-200 text-amber-800',
    },
];

const SEASON_BY_MONTH: SeasonId[] = [
    'peret', 'peret',
    'shemu', 'shemu', 'shemu', 'shemu',
    'akhet', 'akhet', 'akhet', 'akhet',
    'peret', 'peret',
];

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];

export function NilenFlomSyklus({ title = 'Nilens årshjul' }: NilenFlomSyklusProps) {
    const [month, setMonth] = useState(6);

    const season = useMemo(() => {
        const id = SEASON_BY_MONTH[month];
        return SEASONS.find((s) => s.id === id)!;
    }, [month]);

    const Icon = season.icon;

    const handleReset = () => setMonth(6);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Waves className="w-5 h-5 text-blue-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">Dra slideren gjennom året og se hvordan Nilen styrer livet</p>
                </div>
            </div>

            <div className="p-6">
                <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-200">
                    <motion.div
                        className="absolute inset-x-0 top-0 h-2/5"
                        animate={{
                            background: `linear-gradient(to bottom, ${season.skyFrom}, ${season.skyTo})`,
                        }}
                        transition={{ duration: 0.5 }}
                    />
                    <motion.div
                        className="absolute left-0 right-0 bottom-0 bg-amber-100"
                        animate={{ height: '60%' }}
                    />
                    <motion.div
                        className="absolute left-0 right-0 bottom-0"
                        animate={{
                            height: `${season.waterLevel * 0.55}%`,
                            backgroundColor: season.fieldColor,
                        }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />

                    <motion.div
                        className="absolute top-4 right-6"
                        animate={{ opacity: season.id === 'shemu' ? 1 : 0.7 }}
                    >
                        <Sun
                            className={`w-10 h-10 ${
                                season.id === 'shemu' ? 'text-amber-400' : 'text-amber-300'
                            }`}
                        />
                    </motion.div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={season.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="absolute bottom-4 left-6 flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-3 py-1.5 shadow-sm"
                        >
                            {season.id === 'akhet' ? (
                                <Pickaxe className="w-4 h-4 text-blue-600" />
                            ) : (
                                <Icon className="w-4 h-4 text-emerald-600" />
                            )}
                            <span className="text-xs font-medium text-slate-700">{season.activity}</span>
                        </motion.div>
                    </AnimatePresence>

                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 border border-slate-200 shadow-sm">
                        <span className="text-xs font-semibold text-slate-700">{MONTH_LABELS[month]}</span>
                    </div>
                </div>

                <div className="mt-6">
                    <input
                        type="range"
                        min={0}
                        max={11}
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        className="w-full accent-blue-600 cursor-pointer"
                        aria-label="Måned i året"
                    />
                    <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium">
                        {MONTH_LABELS.map((m, i) => (
                            <span key={m} className={i === month ? 'text-slate-700 font-semibold' : ''}>
                                {m}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                    {SEASONS.map((s) => {
                        const SIcon = s.icon;
                        const active = s.id === season.id;
                        return (
                            <button
                                key={s.id}
                                onClick={() => {
                                    const firstMonth = SEASON_BY_MONTH.findIndex((m) => m === s.id);
                                    setMonth(firstMonth);
                                }}
                                className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 transition-all ${
                                    active
                                        ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400 hover:shadow-sm'
                                }`}
                            >
                                <SIcon className="w-4 h-4" />
                                <span className="text-xs font-semibold">{s.egyptisk}</span>
                                <span className="text-[10px] opacity-70">{s.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={season.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`mx-6 mb-5 px-4 py-3 rounded-lg border ${season.color}`}
                >
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold uppercase tracking-wide">
                            {season.egyptisk} — {season.name}
                        </span>
                        <span className="text-xs opacity-70">{season.months}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{season.description}</p>
                </motion.div>
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
