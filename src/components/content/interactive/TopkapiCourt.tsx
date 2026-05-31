import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Briefcase, Heart, Shield, Eye, Sparkles } from 'lucide-react';

interface TopkapiCourtProps {
    title?: string;
}

interface Figure {
    id: string;
    name: string;
    role: string;
    icon: typeof Crown;
    power: number; // 0-100 reell makt bak murene
    text: string;
    color: string;
}

const FIGURES: Figure[] = [
    {
        id: 'sultan',
        name: 'Sultanen',
        role: 'Rikets hersker',
        icon: Crown,
        power: 70,
        text: 'På papiret eier sultanen alt og bestemmer alt. Men mange sultaner levde tilbaketrukket bak palassmurene og overlot dagens styre til andre.',
        color: '#b45309',
    },
    {
        id: 'vesir',
        name: 'Storvesiren',
        role: 'Rikets statsminister',
        icon: Briefcase,
        power: 80,
        text: 'Storvesiren ledet regjeringen og hæren til daglig og bar sultanens segl. Men ble sultanen misfornøyd, kunne vesiren miste hodet på timen.',
        color: '#1d4ed8',
    },
    {
        id: 'valide',
        name: 'Valide Sultan',
        role: 'Sultanmoren i haremet',
        icon: Heart,
        power: 75,
        text: 'Gjennom sønnene sine og hvem de fikk gifte seg med, styrte kvinnene i haremet ofte hvem som fikk makt. Tiden kalles "kvinnenes sultanat".',
        color: '#be185d',
    },
    {
        id: 'janitsjar',
        name: 'Janitsjarene',
        role: 'Sultanens elitehær',
        icon: Shield,
        power: 65,
        text: 'Elitesoldatene voktet sultanen - men hvis de ble misfornøyde med lønn eller politikk, kunne de gjøre opprør og avsette ham.',
        color: '#15803d',
    },
];

export function TopkapiCourt({
    title = 'Topkapı: hvem styrer egentlig?',
}: TopkapiCourtProps) {
    const [id, setId] = useState<string | null>(null);
    const [seen, setSeen] = useState<Set<string>>(new Set());
    const f = FIGURES.find((x) => x.id === id);
    const allSeen = seen.size === FIGURES.length;

    const pick = (fid: string) => {
        setId(fid);
        setSeen((prev) => new Set(prev).add(fid));
    };

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-2 flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                    <Eye className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            </div>
            <p className="mb-5 text-sm text-slate-600">
                Bak palassmurene fikk ingen utenforstående se inn. Trykk på hver person og finn ut
                hvor makten egentlig lå.
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {FIGURES.map((fig) => {
                    const FIcon = fig.icon;
                    const active = fig.id === id;
                    return (
                        <button
                            key={fig.id}
                            onClick={() => pick(fig.id)}
                            className={`flex flex-col items-center gap-1 rounded-xl p-3 text-center transition-all ${
                                active ? 'text-white shadow-md' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                            }`}
                            style={active ? { backgroundColor: fig.color } : undefined}
                        >
                            <FIcon className="h-6 w-6" />
                            <span className="text-xs font-semibold leading-tight">{fig.name}</span>
                        </button>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                {f && (
                    <motion.div
                        key={f.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.22 }}
                        className="mt-4 rounded-xl bg-slate-50 p-4"
                    >
                        <div className="mb-1 flex items-baseline justify-between">
                            <span className="text-base font-bold" style={{ color: f.color }}>
                                {f.name}
                            </span>
                            <span className="text-xs text-slate-500">{f.role}</span>
                        </div>
                        <div className="mb-3 mt-1">
                            <div className="mb-1 flex justify-between text-xs text-slate-500">
                                <span>Reell makt bak murene</span>
                                <span className="font-semibold text-slate-700">{f.power} / 100</span>
                            </div>
                            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: f.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${f.power}%` }}
                                    transition={{ type: 'spring', stiffness: 110, damping: 18 }}
                                />
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-700">{f.text}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {allSeen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                        className="mt-4 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-white"
                    >
                        <Sparkles className="h-5 w-5 shrink-0" />
                        <p className="text-sm font-medium">
                            Ingen styrte alene. Makten var et spill mellom sultan, vesir, harem og hær -
                            der seremoni og intriger avgjorde mer enn titler.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
