import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Crown, Sparkles, RotateCcw, ArrowRight, Check } from 'lucide-react';

// Signaturkomponent for "Den vitenskapelige revolusjonen".
// Lyspære-øyeblikket: Etter denne interaksjonen forstår eleven at kunnskap
// sluttet å være "det de mektige sier" og ble "det vi kan teste og se selv".
// Eleven møter tre påstander som alle trodde på i hundrevis av år fordi en
// autoritet sa det. For hver påstand gjør eleven eksperimentet og ser hva som
// faktisk skjer - og oppdager at testen slår autoriteten hver gang.

interface Claim {
    authority: string; // hvem sa det
    belief: string; // det alle trodde
    experiment: string; // hva eleven gjør
    result: string; // hva eksperimentet viste
}

interface TestPaastandenProps {
    title?: string;
    claims?: Claim[];
}

const DEFAULT_CLAIMS: Claim[] = [
    {
        authority: 'Aristoteles, i nesten 2000 år',
        belief: 'Tunge ting faller raskere mot bakken enn lette ting.',
        experiment: 'Slipp en tung og en lett kule i samme øyeblikk, og se hva som skjer.',
        result: 'De treffer bakken samtidig. Vekten betyr ingenting for fallet. Galileo hadde rett, ikke Aristoteles.',
    },
    {
        authority: 'Kirken og de lærde',
        belief: 'Jorda står stille i sentrum, og hele himmelen går rundt oss.',
        experiment: 'Rett en kikkert mot himmelen og følg planetene natt etter natt.',
        result: 'Jorda og planetene går rundt sola. Vi er ikke sentrum i universet i det hele tatt.',
    },
    {
        authority: 'Den gamle læren',
        belief: 'Himmelen er fullkommen, glatt og uforanderlig.',
        experiment: 'Pek kikkerten mot månen og sola, og se nøye etter.',
        result: 'Månen har fjell og kratre, og sola har flekker. Himmelen er ikke perfekt - den er full av detaljer.',
    },
];

type Phase = 'testing' | 'complete';

export function TestPaastanden({
    title = 'Test påstanden',
    claims = DEFAULT_CLAIMS,
}: TestPaastandenProps) {
    const [index, setIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [phase, setPhase] = useState<Phase>('testing');

    const claim = claims[index];
    const total = claims.length;
    const isLast = index === total - 1;

    const handleReset = () => {
        setIndex(0);
        setRevealed(false);
        setPhase('testing');
    };

    const handleTest = () => setRevealed(true);

    const handleNext = () => {
        if (isLast) {
            setPhase('complete');
            return;
        }
        setIndex((i) => i + 1);
        setRevealed(false);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                <FlaskConical className="w-5 h-5 text-indigo-500" />
                <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-500">
                        Stol på autoriteten, eller test det selv?
                    </p>
                </div>
                {phase === 'testing' && (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                        Påstand {index + 1} av {total}
                    </span>
                )}
            </div>

            {/* Framdriftsprikker */}
            <div className="px-6 pt-4 flex gap-2">
                {claims.map((_, i) => (
                    <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                            phase === 'complete' || i < index || (i === index && revealed)
                                ? 'bg-emerald-400'
                                : i === index
                                  ? 'bg-indigo-400'
                                  : 'bg-slate-200'
                        }`}
                    />
                ))}
            </div>

            {/* Interaksjonsflate */}
            <div className="p-6">
                <AnimatePresence mode="wait">
                    {phase === 'testing' ? (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.25 }}
                        >
                            {/* Autoritetens påstand */}
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-4">
                                <div className="flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-wide mb-1">
                                    <Crown className="w-4 h-4" />
                                    Det alle trodde
                                </div>
                                <p className="text-slate-800 font-medium">{claim.belief}</p>
                                <p className="text-xs text-amber-700 mt-2">
                                    Sagt av: {claim.authority}
                                </p>
                            </div>

                            {!revealed ? (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                    <p className="text-sm text-slate-600 mb-3">{claim.experiment}</p>
                                    <button
                                        onClick={handleTest}
                                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                                    >
                                        <FlaskConical className="w-4 h-4" />
                                        Gjør eksperimentet
                                    </button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                                    className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                                >
                                    <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-1">
                                        <Sparkles className="w-4 h-4" />
                                        Det eksperimentet viste
                                    </div>
                                    <p className="text-slate-800">{claim.result}</p>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                            className="text-center py-4"
                        >
                            <motion.div
                                initial={{ rotate: -20, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.1 }}
                                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4"
                            >
                                <Check className="w-8 h-8 text-emerald-600" />
                            </motion.div>
                            <h4 className="text-lg font-bold text-slate-800 mb-2">
                                Du tenker som en vitenskapsmann!
                            </h4>
                            <p className="text-sm text-slate-600 max-w-md mx-auto">
                                Du stolte ikke på autoriteten bare fordi den var mektig. Du testet
                                det selv. Det er nettopp dette som var den vitenskapelige
                                revolusjonen: kunnskap måtte tåle å bli prøvd mot virkeligheten.
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Kontrollrad */}
            <div className="px-6 pb-5 flex items-center justify-between min-h-[44px]">
                {phase === 'testing' && revealed && (
                    <button
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 py-2 text-sm font-medium transition-colors"
                    >
                        {isLast ? 'Se hva du oppdaget' : 'Neste påstand'}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                )}
                <button
                    onClick={handleReset}
                    className="ml-auto inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Tilbakestill
                </button>
            </div>
        </div>
    );
}
