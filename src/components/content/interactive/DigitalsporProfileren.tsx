import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Moon,
    MapPin,
    Clock,
    Shield,
    Tv,
    Briefcase,
    Eye,
    RotateCcw,
    Lightbulb,
    type LucideIcon,
} from 'lucide-react';

// Signaturkomponent for km-10-digitale-spor.
// Lyspære: passive spor er ufarlige enkeltvis - kombinasjonen avslører alt.
// Eleven klikker seks digitale handlinger og ser profilen algoritmen bygger opp.

interface Spor {
    id: string;
    label: string;
    Icon: LucideIcon;
    bg: string;
    border: string;
    text: string;
    insight: string;
}

const SPOR: Spor[] = [
    {
        id: 'angst',
        label: 'Søkte «vondt i magen» kl. 02:00',
        Icon: Moon,
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        insight: 'Helseutfordringer om natten - mulig angst',
    },
    {
        id: 'klinikk',
        label: 'GPS aktivert ved legekontor',
        Icon: MapPin,
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
        insight: 'Besøker helsevesenet - pågående oppfølging',
    },
    {
        id: 'insomnia',
        label: 'Søvn-app åpnet 3 netter på rad',
        Icon: Clock,
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        insight: 'Søvnvansker bekreftet av atferdsmønster',
    },
    {
        id: 'forsikring',
        label: 'Forsikrings-nettsted besøkt',
        Icon: Shield,
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
        insight: 'Vurderer fremtiden - mulig jobbendring',
    },
    {
        id: 'streaming',
        label: 'Strømmet 5 timer etter jobbtid',
        Icon: Tv,
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        insight: 'Høy inaktivitet - unngår sosiale aktiviteter',
    },
    {
        id: 'jobb',
        label: 'Søkte «jobbe hjemmefra»',
        Icon: Briefcase,
        bg: 'bg-slate-100',
        border: 'border-slate-300',
        text: 'text-slate-700',
        insight: 'Ønsker å endre arbeidssituasjonen',
    },
];

export function DigitalsporProfileren() {
    const [active, setActive] = useState<Set<string>>(new Set());
    const [done, setDone] = useState(false);

    const toggle = (id: string) => {
        if (done) return;
        const next = new Set(active);
        if (next.has(id)) {
            next.delete(id);
        } else {
            next.add(id);
            if (next.size >= SPOR.length) setDone(true);
        }
        setActive(next);
    };

    const reset = () => {
        setActive(new Set());
        setDone(false);
    };

    const confidence = Math.round((active.size / SPOR.length) * 100);

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex items-center gap-3">
                <Eye className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div>
                    <h3 className="font-semibold text-slate-800">Digitalsporprofilen</h3>
                    <p className="text-sm text-slate-500">
                        Klikk sporene du kjenner igjen. Se hva algoritmen konkluderer.
                    </p>
                </div>
            </div>

            {/* To-kolonner-layout */}
            <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Venstre: spor-kort */}
                <div className="p-5 md:border-r border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Dine handlinger
                    </p>
                    <div className="flex flex-col gap-2">
                        {SPOR.map((spor) => {
                            const isActive = active.has(spor.id);
                            const { Icon } = spor;
                            return (
                                <motion.button
                                    key={spor.id}
                                    onClick={() => toggle(spor.id)}
                                    whileTap={{ scale: 0.97 }}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors flex items-center gap-3 cursor-pointer ${
                                        isActive
                                            ? `${spor.bg} ${spor.border} ${spor.text}`
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon
                                        className={`w-4 h-4 flex-shrink-0 ${isActive ? spor.text : 'text-slate-400'}`}
                                    />
                                    <span className="text-sm">{spor.label}</span>
                                    {isActive && (
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="ml-auto w-2 h-2 rounded-full bg-current flex-shrink-0"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Høyre: algoritme-profil */}
                <div className="p-5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                        Profilen selskapene ser
                    </p>

                    {/* Konfidans-bar */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                            <span>Profilkonfidans</span>
                            <span className="font-medium text-indigo-600">{confidence} %</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-indigo-500 rounded-full"
                                animate={{ width: `${confidence}%` }}
                                transition={{ type: 'spring', stiffness: 140, damping: 22 }}
                            />
                        </div>
                    </div>

                    {active.size === 0 ? (
                        <p className="text-sm text-slate-400 italic">
                            Ingen spor samlet. Klikk handlingene til venstre.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <AnimatePresence>
                                {SPOR.filter((s) => active.has(s.id)).map((spor) => (
                                    <motion.div
                                        key={spor.id}
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                        className={`text-sm px-3 py-2 rounded-lg border ${spor.bg} ${spor.border} ${spor.text}`}
                                    >
                                        <span className="font-medium">Algoritmen: </span>
                                        {spor.insight}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Avslørings-panel etter alle spor er samlet */}
                    <AnimatePresence>
                        {done && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, type: 'spring', stiffness: 180, damping: 22 }}
                                className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl"
                            >
                                <div className="flex items-start gap-2">
                                    <Lightbulb className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-semibold text-indigo-800 mb-1">
                                            Algoritmen kjenner deg
                                        </p>
                                        <p className="text-sm text-indigo-700">
                                            Ingen av disse sporene er sensitive alene. Men kombinasjonen
                                            av seks uskyldige handlinger gir selskapet et presist bilde
                                            av helse, økonomi og arbeidssituasjon - uten at du noen gang
                                            fortalte dem noe. Det er dette personvern handler om.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-5 py-3 flex justify-between items-center bg-slate-50">
                <span className="text-sm text-slate-500">
                    {active.size} av {SPOR.length} spor aktivert
                </span>
                <button
                    onClick={reset}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
