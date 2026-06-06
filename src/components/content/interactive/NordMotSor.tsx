import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, Factory, Landmark, Users, RotateCcw, CheckCircle2, ArrowLeftRight } from 'lucide-react';

interface Stridssporsmal {
    id: string;
    label: string;
    icon: 'slaveri' | 'okonomi' | 'union' | 'folk';
    nord: string;
    sor: string;
}

interface NordMotSorProps {
    title?: string;
    sporsmal?: Stridssporsmal[];
    konklusjon?: string;
}

const ICONS = {
    slaveri: Scale,
    okonomi: Factory,
    union: Landmark,
    folk: Users,
} as const;

const DEFAULT_SPORSMAL: Stridssporsmal[] = [
    {
        id: 'slaveri',
        label: 'Slaveri',
        icon: 'slaveri',
        nord: 'Slaveriet var avskaffet, og mange ville stanse at det spredte seg til nye stater i vest.',
        sor: 'Hele samfunnet bygde på slaveri. Rundt fire millioner mennesker var slavebundne.',
    },
    {
        id: 'okonomi',
        label: 'Økonomi',
        icon: 'okonomi',
        nord: 'Fabrikker, jernbane og lønnsarbeidere. Nord trengte ikke slaver for å tjene penger.',
        sor: 'Store plantasjer dyrket bomull og tobakk. Rikdommen kom fra slavenes gratis arbeid.',
    },
    {
        id: 'union',
        label: 'Synet på unionen',
        icon: 'union',
        nord: 'Landet skulle holdes samlet. Ingen stat hadde lov til å melde seg ut.',
        sor: 'Hver stat skulle bestemme selv. Når de var uenige med Nord, ville de bryte ut.',
    },
    {
        id: 'folk',
        label: 'Folk og makt',
        icon: 'folk',
        nord: 'Flere mennesker, flere byer og mer industri ga Nord et stort overtak i krigen.',
        sor: 'Færre folk og fabrikker, men mange dyktige offiserer og kamp på egen jord.',
    },
];

export function NordMotSor({
    title = 'Nord mot Sør: Hvorfor delte landet seg?',
    sporsmal = DEFAULT_SPORSMAL,
    konklusjon = 'Et land kan ikke være halvt fritt og halvt slave. Striden om slaveriet sprengte USA i to, og bare en krig kunne avgjøre hvilket land som skulle vinne.',
}: NordMotSorProps) {
    const [aktiv, setAktiv] = useState<string | null>(null);
    const [avdekket, setAvdekket] = useState<Set<string>>(new Set());

    const ferdig = avdekket.size === sporsmal.length;
    const valgt = sporsmal.find((s) => s.id === aktiv) ?? null;

    const velg = (id: string) => {
        setAktiv(id);
        setAvdekket((prev) => {
            const neste = new Set(prev);
            neste.add(id);
            return neste;
        });
    };

    const reset = () => {
        setAktiv(null);
        setAvdekket(new Set());
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <ArrowLeftRight className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Trykk på hvert stridsspørsmål og se hvordan Nord og Sør var uenige.
                    </p>
                </div>
            </div>

            {/* Stridsspørsmål-velger */}
            <div className="px-6 pt-5">
                <div className="flex flex-wrap gap-2">
                    {sporsmal.map((s) => {
                        const Icon = ICONS[s.icon];
                        const erValgt = aktiv === s.id;
                        const erAvdekket = avdekket.has(s.id);
                        return (
                            <button
                                key={s.id}
                                onClick={() => velg(s.id)}
                                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                    erValgt
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : erAvdekket
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {s.label}
                                {erAvdekket && !erValgt && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sammenligningsflate: Nord vs Sør */}
            <div className="px-6 py-5">
                <div className="grid grid-cols-2 gap-3">
                    {/* Nord */}
                    <div className="rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
                        <div className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold flex items-center gap-2">
                            <Factory className="w-4 h-4" />
                            Nord (Unionen)
                        </div>
                        <div className="p-4 min-h-[96px] flex items-center">
                            <AnimatePresence mode="wait">
                                {valgt ? (
                                    <motion.p
                                        key={valgt.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="text-sm text-blue-900 leading-relaxed"
                                    >
                                        {valgt.nord}
                                    </motion.p>
                                ) : (
                                    <p className="text-sm text-blue-400 italic">
                                        Velg et stridsspørsmål over.
                                    </p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Sør */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
                        <div className="px-4 py-2 bg-amber-600 text-white text-sm font-semibold flex items-center gap-2">
                            <Landmark className="w-4 h-4" />
                            Sør (Konføderasjonen)
                        </div>
                        <div className="p-4 min-h-[96px] flex items-center">
                            <AnimatePresence mode="wait">
                                {valgt ? (
                                    <motion.p
                                        key={valgt.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="text-sm text-amber-900 leading-relaxed"
                                    >
                                        {valgt.sor}
                                    </motion.p>
                                ) : (
                                    <p className="text-sm text-amber-400 italic">
                                        Velg et stridsspørsmål over.
                                    </p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* Framdrift + konklusjon */}
            <div className="px-6 pb-3">
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                            className="h-full bg-indigo-500"
                            animate={{ width: `${(avdekket.size / sporsmal.length) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 200, damping: 26 }}
                        />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                        {avdekket.size} / {sporsmal.length} avdekket
                    </span>
                </div>
            </div>

            <AnimatePresence>
                {ferdig && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800"
                    >
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm leading-relaxed font-medium">{konklusjon}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={reset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors inline-flex items-center gap-1.5"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
