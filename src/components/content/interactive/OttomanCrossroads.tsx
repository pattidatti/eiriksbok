import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, Leaf, Sparkle, BookOpen, ArrowRight, Building2 } from 'lucide-react';

interface OttomanCrossroadsProps {
    title?: string;
}

interface Good {
    id: string;
    name: string;
    icon: typeof Coffee;
    from: string;
    to: string;
    color: string;
    detail: string;
}

const GOODS: Good[] = [
    {
        id: 'silke',
        name: 'Silke',
        icon: Sparkle,
        from: 'Kina og Persia',
        to: 'Europas hoff',
        color: '#7c3aed',
        detail: 'Den glansfulle silken kom langs Silkeveien. Europeiske konger betalte formuer for stoffet, og hver karavane måtte gjennom osmansk land.',
    },
    {
        id: 'krydder',
        name: 'Krydder',
        icon: Leaf,
        from: 'India og Indonesia',
        to: 'Europas kjøkken',
        color: '#15803d',
        detail: 'Pepper og kanel var verdt nesten like mye som gull. Osmanerne tok toll på alt som passerte, så prisen i Europa ble svimlende. Derfor begynte europeerne å lete etter en sjøvei rundt riket.',
    },
    {
        id: 'kaffe',
        name: 'Kaffe',
        icon: Coffee,
        from: 'Jemen',
        to: 'Hele verden',
        color: '#b45309',
        detail: 'Verdens første kaffehus åpnet i Istanbul på 1500-tallet. Her møttes folk for å snakke, spille og diskutere. Vanen spredte seg derfra til hele Europa.',
    },
    {
        id: 'ideer',
        name: 'Ideer',
        icon: BookOpen,
        from: 'Øst og antikken',
        to: 'Renessansens Europa',
        color: '#1d4ed8',
        detail: 'Gjennom riket strømmet ikke bare varer, men også kunnskap: tall, papir, kart og gamle greske tekster som hjalp Europa videre.',
    },
];

export function OttomanCrossroads({
    title = 'Istanbul: verdens travleste veikryss',
}: OttomanCrossroadsProps) {
    const [id, setId] = useState(GOODS[0].id);
    const g = GOODS.find((x) => x.id === id)!;
    const Icon = g.icon;

    return (
        <div className="my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h3 className="mb-1 text-lg font-bold text-slate-900">{title}</h3>
            <p className="mb-5 text-sm text-slate-600">
                Alt som reiste mellom øst og vest, måtte gjennom det osmanske riket. Velg en vare og
                følg den gjennom Istanbul.
            </p>

            {/* Vare-velgere */}
            <div className="mb-5 flex flex-wrap gap-2">
                {GOODS.map((good) => {
                    const GIcon = good.icon;
                    const selected = good.id === id;
                    return (
                        <button
                            key={good.id}
                            onClick={() => setId(good.id)}
                            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${
                                selected ? 'text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                            style={selected ? { backgroundColor: good.color } : undefined}
                        >
                            <GIcon className="h-4 w-4" /> {good.name}
                        </button>
                    );
                })}
            </div>

            {/* Flyt øst -> Istanbul -> vest */}
            <div className="mb-4 flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 text-center">
                <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Fra øst</p>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={g.from}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm font-semibold text-slate-700"
                        >
                            {g.from}
                        </motion.p>
                    </AnimatePresence>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-slate-300" />
                <div className="flex flex-col items-center">
                    <Building2 className="h-6 w-6" style={{ color: g.color }} />
                    <span className="text-xs font-bold text-slate-900">Istanbul</span>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-slate-300" />
                <div className="flex-1">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Til vest</p>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={g.to}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-sm font-semibold text-slate-700"
                        >
                            {g.to}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={g.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.22 }}
                    className="flex items-start gap-3 rounded-xl p-4"
                    style={{ backgroundColor: `${g.color}12` }}
                >
                    <Icon className="mt-0.5 h-6 w-6 shrink-0" style={{ color: g.color }} />
                    <p className="text-sm leading-relaxed text-slate-700">{g.detail}</p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
