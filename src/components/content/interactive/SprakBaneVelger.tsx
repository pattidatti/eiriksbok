import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GitBranch, RotateCcw, Sparkles, ArrowRight, Check, X } from 'lucide-react';

interface OrdRunde {
    norront: string;
    uttale: string;
    bokmal: string;
    nynorsk: string;
    bokmalBane: string;
    nynorskBane: string;
    forklaring: string;
}

interface SprakBaneVelgerProps {
    title?: string;
    runder?: OrdRunde[];
}

type Fase = 'idle' | 'reveal' | 'complete';

const DEFAULT_RUNDER: OrdRunde[] = [
    {
        norront: 'auga',
        uttale: 'AU-ga',
        bokmal: 'øye',
        nynorsk: 'auge',
        bokmalBane: 'norrønt auga → gammeldansk øghæ → dansk øje → bokmål øye',
        nynorskBane: 'norrønt auga → vestnorske dialekter (auga / auge) → Aasens nynorsk auge',
        forklaring:
            'Bokmål fikk formen fra dansk skriftspråk, der ordet hadde slipt seg ned over hundrevis av år. Nynorsk hentet formen rett fra dialektene Aasen samlet, som hadde holdt seg nær det norrøne.',
    },
    {
        norront: 'ek',
        uttale: 'ekk',
        bokmal: 'jeg',
        nynorsk: 'eg',
        bokmalBane: 'norrønt ek → gammeldansk jak → dansk jeg → bokmål jeg',
        nynorskBane: 'norrønt ek → norske dialekter (eg, e, æ) → Aasens nynorsk eg',
        forklaring:
            'Dansk forandret "ek" til "jeg" gjennom flere hundre år, og bokmål arvet dette. I norske bygder ble den korte formen "eg" værende — derfor er det fortsatt slik mange snakker i dag.',
    },
    {
        norront: 'sjálfr',
        uttale: 'SHAUL-vr',
        bokmal: 'selv',
        nynorsk: 'sjølv',
        bokmalBane: 'norrønt sjálfr → gammeldansk sælver → dansk selv → bokmål selv',
        nynorskBane: 'norrønt sjálfr → vestnorske dialekter (sjølv, sjøl) → Aasens nynorsk sjølv',
        forklaring:
            'Den danske formen mistet "sj"-lyden tidlig. På norske bygder ble lyden bevart — derfor sier nynorsk "sjølv" med samme begynnelse som det norrøne ordet.',
    },
];

export function SprakBaneVelger({
    title = 'Hvor kommer ordet fra?',
    runder = DEFAULT_RUNDER,
}: SprakBaneVelgerProps) {
    const [rundeIndex, setRundeIndex] = useState(0);
    const [fase, setFase] = useState<Fase>('idle');
    const [valgt, setValgt] = useState<'bokmal' | 'nynorsk' | null>(null);
    const [riktige, setRiktige] = useState(0);

    const totalt = runder.length;
    const erSiste = rundeIndex === totalt - 1;
    const runde = runder[rundeIndex];

    const handleVelg = (svar: 'bokmal' | 'nynorsk') => {
        if (fase !== 'idle') return;
        setValgt(svar);
        const korrekt = svar === 'nynorsk';
        if (korrekt) setRiktige((r) => r + 1);
        setFase('reveal');
    };

    const handleNeste = () => {
        if (erSiste) {
            setFase('complete');
            return;
        }
        setRundeIndex((i) => i + 1);
        setValgt(null);
        setFase('idle');
    };

    const handleReset = () => {
        setRundeIndex(0);
        setValgt(null);
        setRiktige(0);
        setFase('idle');
    };

    if (fase === 'complete') {
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    <div>
                        <h3 className="font-semibold text-slate-800">Lyspæreøyeblikket</h3>
                        <p className="text-sm text-slate-500">
                            Du fikk {riktige} av {totalt} riktige
                        </p>
                    </div>
                </div>
                <div className="p-6">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-slate-800"
                    >
                        <p className="leading-relaxed">
                            Bokmål-ord tok ofte den{' '}
                            <span className="font-semibold text-indigo-700">danske ruten</span>:
                            norrønt → gammeldansk → moderne dansk → bokmål. Det er derfor bokmål
                            ligner så mye på dansk skriftspråk i dag.
                        </p>
                        <p className="leading-relaxed mt-3">
                            Nynorsk-ord tok den{' '}
                            <span className="font-semibold text-emerald-700">norske ruten</span>:
                            norrønt → bygdedialekter → Aasens systematisering → nynorsk. Mange
                            nynorske ord ligner derfor mer på det norrøne enn på dansk.
                        </p>
                    </motion.div>
                </div>
                <div className="px-6 pb-5 flex items-center justify-between">
                    <button
                        onClick={handleReset}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" /> Prøv på nytt
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <GitBranch className="w-5 h-5 text-indigo-500" />
                    <div>
                        <h3 className="font-semibold text-slate-800">{title}</h3>
                        <p className="text-sm text-slate-500">
                            Klikk på den formen du tror er nynorsk
                        </p>
                    </div>
                </div>
                <div className="text-xs text-slate-400 font-medium">
                    Ord {rundeIndex + 1} / {totalt}
                </div>
            </div>

            <div className="p-6">
                <div className="text-center mb-6">
                    <div className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                        Norrønt ord
                    </div>
                    <div className="text-4xl font-bold text-slate-800 mb-1">{runde.norront}</div>
                    <div className="text-sm text-slate-500 italic">[{runde.uttale}]</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {(['bokmal', 'nynorsk'] as const).map((variant) => {
                        const tekst = variant === 'bokmal' ? runde.bokmal : runde.nynorsk;
                        const erValgt = valgt === variant;
                        const erRiktig = variant === 'nynorsk';
                        const visResultat = fase === 'reveal';

                        const bgClass = !visResultat
                            ? 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                            : erRiktig
                              ? 'bg-emerald-50 border-emerald-300'
                              : erValgt
                                ? 'bg-rose-50 border-rose-300'
                                : 'bg-slate-50 border-slate-200 opacity-60';

                        return (
                            <motion.button
                                key={variant}
                                whileHover={fase === 'idle' ? { scale: 1.02 } : undefined}
                                whileTap={fase === 'idle' ? { scale: 0.98 } : undefined}
                                onClick={() => handleVelg(variant)}
                                disabled={fase !== 'idle'}
                                className={`border-2 rounded-xl p-5 text-left transition-colors ${bgClass} ${fase === 'idle' ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-semibold text-slate-800">
                                        {tekst}
                                    </span>
                                    {visResultat && erRiktig && (
                                        <Check className="w-5 h-5 text-emerald-600" />
                                    )}
                                    {visResultat && erValgt && !erRiktig && (
                                        <X className="w-5 h-5 text-rose-600" />
                                    )}
                                </div>
                                {visResultat && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="text-xs text-slate-600 mt-2 leading-relaxed"
                                    >
                                        {variant === 'bokmal' ? runde.bokmalBane : runde.nynorskBane}
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {fase === 'reveal' && (
                    <motion.div
                        key={`forklaring-${rundeIndex}`}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mx-6 mb-4 px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm leading-relaxed"
                    >
                        {runde.forklaring}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="px-6 pb-5 flex items-center justify-between">
                <button
                    onClick={handleNeste}
                    disabled={fase !== 'reveal'}
                    className={`rounded-full px-6 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                        fase === 'reveal'
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                >
                    {erSiste ? 'Se oppsummering' : 'Neste ord'} <ArrowRight className="w-4 h-4" />
                </button>
                <button
                    onClick={handleReset}
                    className="text-slate-400 hover:text-slate-600 text-sm transition-colors flex items-center gap-1"
                >
                    <RotateCcw className="w-3.5 h-3.5" /> Tilbakestill
                </button>
            </div>
        </div>
    );
}
