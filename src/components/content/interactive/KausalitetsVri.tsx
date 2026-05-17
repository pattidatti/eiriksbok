import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, RotateCcw, Sparkles, Wheat, Home, Landmark } from 'lucide-react';

type Theory = 'classical' | 'gobekli';

interface Step {
    icon: 'temple' | 'home' | 'wheat';
    label: string;
    detail: string;
}

const CHAINS: Record<Theory, Step[]> = {
    classical: [
        {
            icon: 'wheat',
            label: 'Jordbruk',
            detail: 'Folk lærer å så og høste korn.',
        },
        {
            icon: 'home',
            label: 'Bofasthet',
            detail: 'De må bli for å passe åkrene.',
        },
        {
            icon: 'temple',
            label: 'Religion og monumenter',
            detail: 'Når maten er sikret, har vi tid til å bygge templer.',
        },
    ],
    gobekli: [
        {
            icon: 'temple',
            label: 'Religion og samling',
            detail: 'Hundrevis møtes for å bygge et tempel.',
        },
        {
            icon: 'home',
            label: 'Bofasthet',
            detail: 'Byggingen krever måneder. Folk må bli.',
        },
        {
            icon: 'wheat',
            label: 'Jordbruk',
            detail: 'Det er ikke nok vilt til å fø de mange. Vi må dyrke.',
        },
    ],
};

const META: Record<Theory, { title: string; subtitle: string; evidence: string }> = {
    classical: {
        title: 'Klassisk teori',
        subtitle: 'Først mat — så samfunn — så tempel.',
        evidence: 'Et samfunn må først produsere nok mat før det har overskudd til å bygge store byggverk. Det har vi sett i Egypt, Mesopotamia og Kina.',
    },
    gobekli: {
        title: 'Göbekli-teori',
        subtitle: 'Først tempel — så samfunn — så jordbruk.',
        evidence: 'Göbekli Tepe ble bygd av jegere og samlere rundt 9500 fvt — tusen år før jordbruket var i gang i området. Tempelet kom først.',
    },
};

function StepIcon({ icon }: { icon: Step['icon'] }) {
    const className = 'w-6 h-6';
    if (icon === 'wheat') return <Wheat className={className} />;
    if (icon === 'home') return <Home className={className} />;
    return <Landmark className={className} />;
}

interface KausalitetsVriProps {
    title?: string;
}

export function KausalitetsVri({ title = 'Hva kom egentlig først?' }: KausalitetsVriProps) {
    const [theory, setTheory] = useState<Theory>('classical');
    const [revealed, setRevealed] = useState(false);

    const handleSwitch = (t: Theory) => {
        setTheory(t);
        setRevealed(true);
    };

    const handleReset = () => {
        setTheory('classical');
        setRevealed(false);
    };

    const chain = CHAINS[theory];
    const meta = META[theory];

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <div>
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Trykk på en teori og se hvordan kjeden snur.
                    </p>
                </div>
            </div>

            <div className="px-6 pt-5">
                <div className="flex gap-2 mb-5">
                    <button
                        onClick={() => handleSwitch('classical')}
                        className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            theory === 'classical'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                        Klassisk teori
                    </button>
                    <button
                        onClick={() => handleSwitch('gobekli')}
                        className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                            theory === 'gobekli'
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                    >
                        Göbekli-teori
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3 sm:gap-2 items-stretch">
                    <AnimatePresence mode="popLayout">
                        {chain.map((step, idx) => (
                            <motion.div
                                key={`${theory}-${idx}-${step.label}`}
                                layout
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.35, delay: idx * 0.08 }}
                                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-col gap-2"
                                style={{ gridColumn: `${idx * 2 + 1} / span 1` }}
                            >
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <StepIcon icon={step.icon} />
                                    <span className="font-semibold text-slate-800 text-sm">
                                        {step.label}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 leading-snug">
                                    {step.detail}
                                </p>
                            </motion.div>
                        ))}
                        {[0, 1].map((arrowIdx) => (
                            <motion.div
                                key={`arrow-${theory}-${arrowIdx}`}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{ duration: 0.25, delay: 0.18 + arrowIdx * 0.08 }}
                                className="hidden sm:flex items-center justify-center text-indigo-400"
                                style={{ gridColumn: `${arrowIdx * 2 + 2} / span 1` }}
                            >
                                <ArrowRight className="w-5 h-5" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={theory}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`mx-6 mt-5 mb-2 px-4 py-3 rounded-lg border text-sm ${
                        theory === 'gobekli'
                            ? 'bg-amber-50 border-amber-200 text-amber-800'
                            : 'bg-blue-50 border-blue-200 text-blue-800'
                    }`}
                >
                    <p className="font-semibold mb-1">{meta.title}</p>
                    <p className="text-xs italic mb-2 opacity-80">{meta.subtitle}</p>
                    <p className="leading-snug">{meta.evidence}</p>
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                {revealed && theory === 'gobekli' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2"
                    >
                        <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>
                            Aha! Hvis Göbekli-teorien stemmer, kan en idé om noe hellig ha
                            tvunget mennesker til å bli bofaste — og deretter til å oppfinne
                            jordbruket. Tankene drev historien, ikke maten.
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-end">
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors flex items-center gap-1"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
