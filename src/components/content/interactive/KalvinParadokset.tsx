import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, HelpCircle, Sparkles, Building2, Lightbulb, RotateCcw } from 'lucide-react';

interface KalvinParadoksetProps {
    title?: string;
}

type Step = {
    id: number;
    icon: typeof Crown;
    label: string;
    headline: string;
    body: string;
    accent: string;
    iconBg: string;
};

const STEPS: Step[] = [
    {
        id: 1,
        icon: Crown,
        label: 'Premissen',
        headline: 'Gud har allerede valgt',
        body: 'Calvin lærte at Gud — før verden ble skapt — bestemte hvem som skulle bli frelst. Du kan ikke fortjene det. Du kan ikke kjøpe det. Det er allerede avgjort.',
        accent: 'border-indigo-300 bg-indigo-50 text-indigo-900',
        iconBg: 'bg-indigo-100 text-indigo-600',
    },
    {
        id: 2,
        icon: HelpCircle,
        label: 'Spørsmålet',
        headline: 'Men hvem er utvalgt?',
        body: 'Du vet det ikke. Verken presten, paven eller du selv kan vite det sikkert. Du må leve hele livet med uvissheten gnagende inni deg.',
        accent: 'border-amber-300 bg-amber-50 text-amber-900',
        iconBg: 'bg-amber-100 text-amber-600',
    },
    {
        id: 3,
        icon: Sparkles,
        label: 'Tegnene',
        headline: 'Suksess kan være et tegn',
        body: 'Calvin sa: indre vissheten og ytre tegn kan tyde på at du er utvalgt. Hardt arbeid, edruelighet, sparing og fremgang ble lest som spor av Guds gunst.',
        accent: 'border-emerald-300 bg-emerald-50 text-emerald-900',
        iconBg: 'bg-emerald-100 text-emerald-600',
    },
    {
        id: 4,
        icon: Building2,
        label: 'Konsekvensen',
        headline: 'Hard jobbing ble hellig plikt',
        body: 'Hvis suksess er et tegn fra Gud, blir det en plikt å jobbe, spare og investere. Slik vokste Geneve, Amsterdam, Edinburgh og Boston seg rike. En tanke om himmelen formet hverdagen på jorden.',
        accent: 'border-rose-300 bg-rose-50 text-rose-900',
        iconBg: 'bg-rose-100 text-rose-600',
    },
];

export function KalvinParadokset({
    title = 'Kalvin-paradokset: Fra forutbestemmelse til arbeidsmoral',
}: KalvinParadoksetProps) {
    const [revealed, setRevealed] = useState(1);
    const isComplete = revealed >= STEPS.length;

    function next() {
        if (revealed < STEPS.length) setRevealed(revealed + 1);
    }

    function reset() {
        setRevealed(1);
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Klikk gjennom tankerekka som formet Nord-Europa.
                    </p>
                </div>
            </div>

            <div className="p-6 space-y-3">
                {STEPS.map((step) => {
                    const isVisible = step.id <= revealed;
                    const Icon = step.icon;
                    return (
                        <AnimatePresence key={step.id} mode="wait">
                            {isVisible && (
                                <motion.div
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                    className={`relative flex gap-4 rounded-xl border ${step.accent} p-4 shadow-sm`}
                                >
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full ${step.iconBg} flex items-center justify-center flex-shrink-0`}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        {step.id < STEPS.length && step.id < revealed && (
                                            <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
                                            Steg {step.id} · {step.label}
                                        </div>
                                        <div className="font-semibold text-base mb-1.5">
                                            {step.headline}
                                        </div>
                                        <p className="text-sm leading-relaxed opacity-90">
                                            {step.body}
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    );
                })}
            </div>

            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
                        className="mx-6 mb-4 px-5 py-4 rounded-lg bg-gradient-to-r from-emerald-50 to-indigo-50 border border-emerald-200"
                    >
                        <div className="flex items-start gap-3">
                            <motion.div
                                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-yellow-500 flex-shrink-0"
                            >
                                <Lightbulb className="w-6 h-6" />
                            </motion.div>
                            <div>
                                <div className="font-semibold text-emerald-900 mb-1">
                                    Lyspæren tenner
                                </div>
                                <p className="text-sm text-emerald-800 leading-relaxed">
                                    Predestinasjon — en idé om himmelen — fikk folk til å jobbe
                                    hardere, ikke mindre. Det er Calvins paradoks. Max Weber kalte
                                    dette &laquo;den protestantiske arbeidsetikken&raquo; og mente
                                    den ble grunnmuren under moderne kapitalisme.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                <button
                    onClick={next}
                    disabled={isComplete}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                >
                    {isComplete ? 'Tankerekka er ferdig' : 'Neste tanke'}
                </button>
                <button
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
